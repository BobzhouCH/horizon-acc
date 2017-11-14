# Copyright 2014, Rackspace, US, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""API over the keystone service.
"""

import copy
import django.http
from django.utils.translation import ugettext_lazy as _
from django.views import generic
from django.conf import settings
from horizon import exceptions
from easystack_dashboard import api
from easystack_dashboard.api import base
from easystack_dashboard.api import signup
from easystack_dashboard.api.rest import usage
from easystack_dashboard.api.rest import utils as rest_utils
from easystack_dashboard.api.rest import urls

import six.moves.urllib.parse as urlparse

OPENSTACK_USER = ("nova",
                  "glance",
                  "ceilometer",
                  "cinder",
                  "chakra",
                  "neutron",
                  "heat",
                  "swift",
                  "heat-cfn",
                  "tmp_neutron_admin",
                  "billing",
                  "heat_domain_admin",
                  "manila",
                  "manilav2",
                  "sahara",
                  "ticket")

OPENSTACK_ROLE = ('ResellerAdmin', 'heat_stack_user')

ROLE_MEMBER = ('Member', 'member')
ROLE_ADMIN = ('Admin', 'admin')


@urls.register
class Users(generic.View):

    """API for keystone users.
    """
    url_regex = r'keystone/users/$'
    client_keywords = ('project_id', 'domain_id', 'group_id')

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_domain_name)
    #@rest_utils.patch_items_by_func(rest_utils.ensure_is_domain_admin)
    def get(self, request):
        """Get a list of users.

        By default, a listing of all users for the current domain are
        returned. You may specify GET parameters for project_id, domain_id and
        group_id to change that listing's context.

        The listing result is an object with property "items".
        """
        filter_users = []
        domain_id = None
        v3, dda = api.keystone.is_default_domain_admin(request)
        if v3 and not dda:
            domain_id = api.keystone.get_effective_domain_id(request)

        filters = rest_utils.parse_filters_kwargs(request,
                                                  self.client_keywords)[0]
        if len(filters) == 0:
            filters = None

        result = api.keystone.user_list(
            request,
            project=request.GET.get('project_id', None),
            domain=request.GET.get('domain_id', domain_id),
            group=request.GET.get('group_id', None),
            filters=filters
        )
        for user in result:
            if user.name not in OPENSTACK_USER:
                filter_users.append(user)
        return {'items': [u.to_dict() for u in filter_users]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a user.

        Create a user using the parameters supplied in the POST
        application/json object. The base parameters are name (string), email
        (string, optional), password (string, optional), project_id (string,
        optional), enabled (boolean, defaults to true). The user will be
        created in the default domain.

        This action returns the new user object on success.
        """
        # not sure why email is forced to None, but other code does it
        domain_id = api.keystone.get_default_domain(request)
        domain_id = request.DATA.get('domain_id', domain_id)
        project_id = request.DATA.get('project_id')
        role_id = request.DATA.get('role_id')

        if not (domain_id and project_id and role_id):
            msg = 'project_id and role_id must be not null'
            return django.http.HttpResponseBadRequest(msg)

        new_user = api.keystone.user_create(
            request,
            name=request.DATA['name'],
            email=request.DATA.get('email'),
            password=request.DATA['password'],
            enabled=True,
            project=project_id,
            domain=domain_id
        )

        if(api.keystone.is_cloud_admin(request)):
            domain_role = role_id
        else:
            domain_roles = api.keystone.role_list(request)
            for role in domain_roles:
                role_dic = role.to_dict()
                if role_dic['name'] == 'Member':
                    domain_role = role_dic['id']
                    break

        # assign domain role to user
        api.keystone.add_tenant_user_role(
            request,
            domain=domain_id,
            user=new_user.id,
            role=domain_role
        )

        # assign project role to user
        api.keystone.add_tenant_user_role(
            request,
            project=project_id,
            user=new_user.id,
            role=role_id
        )

        if api.keystone.role_get(request, domain_role).name ==\
                api.keystone.get_admin_role():
            projects = api.keystone.tenant_list(request, domain=domain_id)
            for project in projects[0]:
                if project.id != project_id and\
                        not (domain_id == 'default' and
                             project.name == 'services'):
                    api.keystone.add_tenant_user_role(
                        request,
                        project=project.id,
                        user=new_user.id,
                        role=role_id
                    )

        # add domain name to new_user
        new_user_dict = new_user.to_dict()
        domain = api.keystone.domain_get(request, domain_id)
        if domain and hasattr(domain, 'name'):
            new_user_dict['domain'] = getattr(domain, 'name')
        return rest_utils.CreatedResponse(
            '/api/keystone/users/%s' % new_user.id,
            new_user_dict
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete multiple users by id.

        The DELETE data should be an application/json array of user ids to
        delete.

        This method returns HTTP 204 (no content) on success.
        """
        for user_id in request.DATA:
            if user_id != request.user.id:
                api.keystone.user_delete(request, user_id)


@urls.register
class User(generic.View):

    """API for a single keystone user.
    """
    url_regex = r'keystone/users/(?P<id>[0-9a-f]+|current)$'

    @rest_utils.ajax()
    def get(self, request, id):
        """Get a specific user by id.

        If the id supplied is 'current' then the current logged-in user
        will be returned, otherwise the user specified by the id.
        """
        if id == 'current':
            id = request.user.id
        return api.keystone.user_get(request, id, False).to_dict()

    @rest_utils.ajax()
    def delete(self, request, id):
        """Delete a single user by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'current':
            raise django.http.HttpResponseNotFound('current')
        api.keystone.user_delete(request, id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, id):
        """Update a single user.

        The PATCH data should be an application/json object with attributes to
        set to new values: password (string), project (string),
        enabled (boolean).

        A PATCH may contain any one of those attributes, but
        if it contains more than one it must contain the project, even
        if it is not being altered.

        This method returns HTTP 204 (no content) on success.
        """
        keys = tuple(request.DATA)
        user = api.keystone.user_get(request, id)

        if 'password' in keys:
            password = request.DATA['password']
            api.keystone.user_update_password(request, user, password)

        elif 'enabled' in keys:
            enabled = request.DATA['enabled']
            if user.user_role == 'domain_admin' and enabled == True:
                try:
                    api.signup.admin_active_user(request, user.id)
                except Exception as e:
                    raise e
            else:
                api.keystone.user_update_enabled(request, user, enabled)

        else:
            # note that project is actually project_id
            # but we can not rename due to legacy compatibility
            # refer to keystone.api user_update method
            api.keystone.user_update(request, user, **request.DATA)


@urls.register
class UserEmail(generic.View):

    """API for verifying new user email
    """
    url_regex = r'keystone/useremail/(?P<email>.+)$'

    @rest_utils.ajax()
    def get(self, request, email):
        user = signup.verify_email(request, email)
        if user == None or len(user) == 0:
            return {"result": True}
        return {"result": False}


@urls.register
class NotifyList(generic.View):

    """API for create and update notify list
    which belongs to current user.
    The notify list is used for alarms."""
    url_regex = r'keystone/notifylist/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get notify list of current user"""
        user_id = request.user.id
        admin = request.user.is_superuser
        user = api.keystone.user_get(request, user_id, admin)
        data = user.to_dict()
        items = []
        email = data.get('email')
        mobile = data.get('mobile')
        include_myself = False
        if data.get('notify_list'):
            for item in data.get('notify_list'):
                name = item.get('name')
                items.append(item)
                if name == data.get('name'):
                    include_myself = True
        if not include_myself:
            items.append({'name': data.get('name'),
                          'description': 'Send notification to registered email and mobile',
                          'email': [{'value': email, 'tag': ''}],
                          'sms': [{'value': mobile, 'tag': ''}]
                          })
            if getattr(settings, "LDAP_EDITABLE", True):
                new_data = {'notify_list': items}
                api.keystone.user_update(request, user, admin, **new_data)
        return {'items': items}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create notify list, update current user"""
        user_id = request.user.id
        admin = request.user.is_superuser
        user = api.keystone.user_get(request, user_id, admin)
        dic = user.to_dict()
        notify_list = dic.get('notify_list')
        if notify_list == None:
            notify_list = []
        notify_list.append(request.DATA)
        data = {'notify_list': notify_list}
        data.update({'project': request.user.tenant_id})
        api.keystone.user_update(request, user, admin, **data)

        return rest_utils.CreatedResponse(
            '/api/keystone/notifylist/', request.DATA)

    @rest_utils.ajax(data_required=True)
    def put(self, request):
        """Update notify list of current user"""
        user_id = request.user.id
        admin = request.user.is_superuser
        user = api.keystone.user_get(request, user_id, admin)
        dic = user.to_dict()
        name = request.DATA.get('name')
        notify_list = dic.get('notify_list')
        if notify_list:
            for item in notify_list:
                if item.get('name') == name:
                    notify_list.remove(item)
                    notify_list.append(request.DATA)
                    break
        data = {'notify_list': notify_list}
        api.keystone.user_update(request, user, admin, **data)

        return rest_utils.JSONResponse(request.DATA, 202)


@urls.register
class Roles(generic.View):

    """API over all roles.
    """
    url_regex = r'keystone/roles/$'

    def is_role_admin(request, roles):
        for r in roles:
            r['admin'] = True if r['name'] in ROLE_ADMIN else False

        return roles

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(is_role_admin)
    def get(self, request):
        """Get a list of roles.

        By default a listing of all roles are returned.

        If the GET parameters project_id and user_id are specified then that
        user's roles for that project are returned. If user_id is 'current'
        then the current user's roles for that project are returned.

        The listing result is an object with property "items".
        """
        project_id = request.GET.get('project_id')
        user_id = request.GET.get('user_id')
        if project_id and user_id:
            if user_id == 'current':
                user_id = request.user.id
            roles = api.keystone.roles_for_user(request, user_id,
                                                project_id) or []
        else:
            roles = api.keystone.role_list(request)
        items = [r.to_dict() for r in roles if r.name not in OPENSTACK_ROLE]
        return {'items': items}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a role.

        Create a role using the "name" (string) parameter supplied in the POST
        application/json object.

        This method returns the new role object on success.
        """
        new_role = api.keystone.role_create(request, request.DATA['name'])
        return rest_utils.CreatedResponse(
            '/api/keystone/roles/%s' % new_role.id,
            new_role.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete multiple roles by id.

        The DELETE data should be an application/json array of role ids to
                delete.

        This method returns HTTP 204 (no content) on success.
        """
        for role_id in request.DATA:
            api.keystone.role_delete(request, role_id)


@urls.register
class Role(generic.View):

    """API for a single role.
    """
    url_regex = r'keystone/roles/(?P<id>[0-9a-f]+|default)$'

    @rest_utils.ajax()
    def get(self, request, id):
        """Get a specific role by id.

        If the id supplied is 'default' then the default role will be
        returned, otherwise the role specified by the id.
        """
        if id == 'default':
            return api.keystone.get_default_role(request).to_dict()
        return api.keystone.role_get(request, id).to_dict()

    @rest_utils.ajax()
    def delete(self, request, id):
        """Delete a single role by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.keystone.role_delete(request, id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, id):
        """Update a single role.

        The PATCH data should be an application/json object with the "name"
        attribute to update.

        This method returns HTTP 204 (no content) on success.
        """
        api.keystone.role_update(request, id, request.DATA['name'])


@urls.register
class Password(generic.View):

    """API over all domains.
    """
    url_regex = r'keystone/password/$'

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        try:
            api.keystone.user_update_own_password(
                request,
                origpassword=request.DATA['oldPassword'],
                password=request.DATA['password'],
            )
            return True
        except Exception as e:
            if e.http_status == 401:
                return dict(status="403", msg="Old Password is Wrong");
            raise e


@urls.register
class Domains(generic.View):

    """API over all domains.
    """
    url_regex = r'keystone/domains/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of domains.

        A listing of all domains are returned.

        The listing result is an object with property "items".
        """
        items = [d.to_dict() for d in api.keystone.domain_list(request)]
        return {'items': items}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Perform some action on the collection of domains.

        This action creates a domain using parameters supplied in the POST
        application/json object. The "name" (string) parameter is required,
        others are optional: "description" (string) and "enabled" (boolean,
        defaults to true).

        This method returns the new domain object on success.
        """
        new_domain = api.keystone.domain_create(
            request,
            request.DATA['name'],
            id=request.DATA.get('id', None),
            description=request.DATA.get('description', None),
            enabled=request.DATA.get('enabled', False),
        )
        api.keystone.dedicated_tenant_init(request, new_domain.id)
        return rest_utils.CreatedResponse(
            '/api/keystone/domains/%s' % new_domain.id,
            new_domain.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete multiple domains by id.

        The DELETE data should be an application/json array of domain ids to
                delete.

        This method returns HTTP 204 (no content) on success.
        """
        for domain_id in request.DATA:
            api.keystone.domain_delete(request, domain_id)


@urls.register
class Domain(generic.View):

    """API over a single domains.
    """
    url_regex = r'keystone/domains/(?P<id>[0-9a-f]+|default)$'

    @rest_utils.ajax()
    def get(self, request, id):
        """Get a specific domain by id.

        If the id supplied is 'default' then the default domain will be
        returned, otherwise the domain specified by the id.
        """
        if id == 'default':
            return api.keystone.get_default_domain(request).to_dict()
        return api.keystone.domain_get(request, id).to_dict()

    @rest_utils.ajax()
    def delete(self, request, id):
        """Delete a single domain by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.keystone.domain_delete(request, id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, id):
        """Update a single domain.

        The PATCH data should be an application/json object with the attributes
        to set to new values: "name" (string), "description" (string) and
        "enabled" (boolean).

        This method returns HTTP 204 (no content) on success.
        """
        api.keystone.domain_update(
            request,
            id,
            description=request.DATA.get('description'),
            enabled=request.DATA.get('enabled'),
            name=request.DATA.get('name')
        )


def _tenant_kwargs_from_DATA(data, enabled=True):
    # tenant_create takes arbitrary keyword arguments with only a small
    # restriction (the default args)
    kwargs = {'name': None, 'description': None, 'enabled': enabled,
              'domain': data.pop('domain_id', None)}
    kwargs.update(data)
    return kwargs


def str_to_bool(str):
    return str and str.lower() == 'true'


def ensure_domain_name(request, result_dict):
    for item in result_dict:
        try:
            item['domain'] = \
                api.keystone.domain_get(request, item['domain_id']).to_dict()
            item['domain_name'] = item['domain']['name']
        except Exception:
            pass


@urls.register
class Projects(generic.View):

    """API over all projects.

    Note that in the following "project" is used exclusively where in the
    underlying keystone API the terms "project" and "tenant" are used
    interchangeably.
    """
    url_regex = r'keystone/projects/$'
    client_keywords = ('paginate', 'marker', 'domain_id',
                       'user_id', 'admin')

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of projects.

        By default a listing of all projects for the current domain are
        returned.

        You may specify GET parameters for domain_id (string), user_id
        (string) and admin (boolean) to change that listing's context.
        Additionally, paginate (boolean) and marker may be used to get
        paginated listings.

        The listing result is an object with properties:

        items
            The list of project objects.
        has_more
            Boolean indicating there are more results when pagination is used.
        """

        filters = rest_utils.parse_filters_kwargs(request,
                                                  self.client_keywords)[0]
        if len(filters) == 0:
            filters = None
        dedicated = api.keystone.is_dedicated_context(request)
        result, has_more = api.keystone.dedicated_tenant_list(
            request,
            dedicated=dedicated,
            paginate=request.GET.get('paginate', False),
            marker=request.GET.get('marker', None),
            domain=request.GET.get('domain_id', None),
            user=request.GET.get('user_id', None),
            admin=str_to_bool(request.GET.get('admin', 'true')),
            filters=filters
        )
        for i, t in enumerate(result):
            if t.name == 'services':
                result.pop(i)

        result_dict = [d.to_dict() for d in result]
        # add domain name to result dict.
        ensure_domain_name(request, result_dict)

        # return (list of results, has_more_data)
        return dict(has_more=has_more, items=result_dict)

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a project (tenant).

        Create a project using parameters supplied in the POST
        application/json object. The "name" (string) parameter is required,
        others are optional: "description" (string), "domain_id" (string) and
        "enabled" (boolean, defaults to true). Additional, undefined
        parameters may also be provided, but you'll have to look deep into
        keystone to figure out what they might be.

        This method returns the new project object on success.
        """
        kwargs = _tenant_kwargs_from_DATA(request.DATA)
        if not kwargs['name']:
            raise rest_utils.AjaxError(400, '"name" is required')
        new_project = api.keystone.tenant_create(
            request,
            kwargs.pop('name'),
            **kwargs
        )
        return rest_utils.CreatedResponse(
            '/api/keystone/projects/%s' % new_project.id,
            new_project.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete multiple projects by id.

        The DELETE data should be an application/json array of project ids to
        delete.

        This method returns HTTP 204 (no content) on success.
        """
        for id in request.DATA:
            api.keystone.tenant_delete(request, id)


@urls.register
class Project(generic.View):

    """API over a single project.

    Note that in the following "project" is used exclusively where in the
    underlying keystone API the terms "project" and "tenant" are used
    interchangeably.
    """
    url_regex = r'keystone/projects/(?P<id>[0-9a-f]+)$'

    def set_project_quotas_to_zero(self, request, tenant_id):

        nova_quotas = [(field_name, 0) for field_name in rest_utils.NOVA_PROJECT_QUOTA_FIELDS]
        api.nova.tenant_quota_update(request, tenant_id, **dict(nova_quotas))

        cinder_quotas = [(field_name, 0) for field_name in rest_utils.CINDER_PROJECT_QUOTA_FIELDS]
        api.cinder.tenant_quota_update(request, tenant_id, **dict(cinder_quotas))

        neutron_fields = rest_utils.NEUTRON_PROJECT_QUOTA_FIELDS
        if getattr(settings, "OPENSTACK_NEUTRON_NETWORK", {}).get('enable_lb', False):
            neutron_fields += rest_utils.LOADBALANCER_PROJECT_QUOTA_FIELDS
        neutron_quotas = [(field_name, 0) for field_name in neutron_fields]
        api.neutron.tenant_quota_update(request, tenant_id, **dict(neutron_quotas))

        if getattr(settings, 'MANILA_ENABLED', False):
            manila_quotas = [(field_name, 0) for field_name in rest_utils.MANILA_PROJECT_QUOTA_FIELDS]
            api.manila.tenant_quota_update(request, tenant_id, **dict(manila_quotas))

    @rest_utils.ajax()
    def get(self, request, id):
        """Get a specific project by id.
        """
        return api.keystone.tenant_get(request, id).to_dict()

    @rest_utils.ajax()
    def delete(self, request, id):
        """Delete a single project by id.

        This method returns HTTP 204 (no content) on success.
        """
        # if usage.tenant_exist_ress(request, id):
        if api.billing.exist_product(request, id):
            msg = _("Can't delete a project with products in using")
            raise exceptions.Conflict(msg)
        self.set_project_quotas_to_zero(request, id)
        api.keystone.tenant_delete(request, id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, id):
        """Update a single project.

        The PATCH data should be an application/json object with  the
        attributes to set to new values: "name" (string),  "description"
        (string), "domain_id" (string) and "enabled" (boolean). Additional,
        undefined parameters may also be provided, but you'll have to look
        deep into keystone to figure out what they might be.

        This method returns HTTP 204 (no content) on success.
        """
        kwargs = _tenant_kwargs_from_DATA(request.DATA, enabled=None)
        api.keystone.tenant_update(request, id, **kwargs)


@urls.register
class ProjectUsers(generic.View):
    url_regex = r'keystone/projectusers/(?P<project_id>[0-9a-f]+)$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_is_domain_admin)
    def get(self, request, project_id):
        """List all users of the project.
        """
        target = api.keystone.TenantRolesManager(project_id)
        users = target.get_target_users_with_roles(request)
        return {'items': users}

    @rest_utils.ajax()
    def delete(self, request, project_id):
        """Delete all users of the project.
        """
        domain = None
        users = api.keystone.get_tenant_users_roles(request, project_id)
        for user in users:
            api.keystone.remove_tenant_user_roles(request, project_id,
                                                  user.id, domain)

    @rest_utils.ajax(data_required=True)
    def post(self, request, project_id):
        """Edit user(s) of the project.
        """
        target = api.keystone.TenantRolesManager(project_id)
        orig_users = request.DATA['orig_users']
        users = request.DATA['users']
        return target.update_users_roles(request, orig_users, users)


@urls.register
class DomainUsers(generic.View):
    url_regex = r'keystone/domainusers/(?P<domain_id>.+)$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_is_domain_admin)
    def get(self, request, domain_id):
        """List all users of the domain.
        """
        target = api.keystone.DomainRolesManager(domain_id)
        users = target.get_target_users_with_roles(request)
        return {'items': users}

    @rest_utils.ajax()
    def delete(self, request, domain_id):
        """Delete all users of the domain.
        """
        raise NotImplementedError()

    @rest_utils.ajax(data_required=True)
    def post(self, request, domain_id):
        """Edit user(s) of the domain.
        """
        target = api.keystone.DomainRolesManager(domain_id)
        orig_users = request.DATA['orig_users']
        users = request.DATA['users']
        return target.update_users_roles(request, orig_users, users)


@urls.register
class DomainUsersAndProjectAdminRole(generic.View):
    url_regex = r'keystone/domainusersandprojectadminrole/(?P<domain_id>.+)$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, domain_id):
        """Edit user(s) of the domain.
        """
        target = api.keystone.DomainRolesAndProjectRoleManager(domain_id)
        orig_users = request.DATA['orig_users']
        users = request.DATA['users']
        return target.update_users_roles(request, orig_users, users)


@urls.register
class ProjectRole(generic.View):
    url_regex = r'keystone/projects/(?P<project_id>[0-9a-f]+)/' \
                '(?P<role_id>[0-9a-f]+)/(?P<user_id>.+)$'

    @rest_utils.ajax()
    def put(self, request, project_id, role_id, user_id):
        """Grant the specified role to the user in the project (tenant).

        This method takes no data.

        This method returns HTTP 204 (no content) on success.
        """
        api.keystone.add_tenant_user_role(
            request,
            project_id,
            user_id,
            role_id
        )


@urls.register
class Services(generic.View):
    url_regex = r'keystone/services/$'

    @rest_utils.ajax()
    def get(self, request):
        """Return the Keystone services associated with the current
        user.
        """
        services = []
        for id, service in enumerate(request.user.service_catalog):
            url = base.get_url_for_service(
                service, request.user.services_region, 'internalURL')
            if url:
                host = urlparse.urlparse(url).hostname
                service.update({'host': host})
            service.update({'url': url})
            service.update({'status': 'Enabled'})
            services.append(service)
        return services


@urls.register
class ServiceCatalog(generic.View):
    url_regex = r'keystone/svc-catalog/$'

    @rest_utils.ajax()
    def get(self, request):
        """Return the Keystone service catalog associated with the current
        user.
        """
        return request.user.service_catalog


@urls.register
class UserSession(generic.View):

    """API for a single keystone user.
    """
    url_regex = r'keystone/user-session/$'
    allowed_fields = [
        'available_services_regions',
        'domain_id',
        'domain_name',
        'enabled',
        'id',
        'is_superuser',
        'project_id',
        'project_name',
        'roles',
        'services_region',
        'user_domain_id',
        'user_domain_name',
        'username'
    ]

    @rest_utils.ajax()
    def get(self, request):
        """Get the current user session.
        """
        user = copy.deepcopy(request.user)
        dedicated = api.keystone.is_dedicated_context(request)
        if dedicated and hasattr(user, 'project_name'):
            user.project_name = api.keystone.get_dedicated_name(
                str(user.project_name))
        #begin:<wujx9>:<new feature(license)>:<action (m)>:<date(2016-11-16)>
        #return dict((k, getattr(user, k, None)) for k in self.allowed_fields)
        d =dict((k, getattr(user, k, None)) for k in self.allowed_fields)
        license_info = request.session.get('license_info')
        d["license_info"] = license_info
        return d
        #end:<wujx9>:<new feature(license)>:<action (m)>:<date(2016-11-16)>


@urls.register
class CloudAdmin(generic.View):
    url_regex = r'keystone/cloudadmin/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.keystone.is_cloud_admin(request)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class DomainAdmin(generic.View):
    url_regex = r'keystone/domainadmin/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.keystone.is_domain_admin(request)[1]
        return rest_utils.JSONResponse(result, 200)


@urls.register
class ProjectAdmin(generic.View):
    url_regex = r'keystone/projectadmin/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.keystone.is_project_admin(request)[1]
        return rest_utils.JSONResponse(result, 200)


@urls.register
class LDAP(generic.View):
    url_regex = r'keystone/ldap/$'

    @rest_utils.ajax()
    def get(self, request):
        ldap_enable = getattr(settings, 'LDAP_ENABLE', False)
        ldap_editable = getattr(settings, 'LDAP_EDITABLE', True)
        return rest_utils.JSONResponse({"enable": ldap_enable, "editable": ldap_editable}, 200)


@urls.register
class CheckProjectAdmin(generic.View):
    url_regex = r'keystone/isprojectadmin/$'

    @rest_utils.ajax()
    def post(self, request):
        user_id = request.DATA.get('user_id')
        if user_id == 'current':
            user_id = request.user.id
        project_id = request.DATA.get('project_id')

        result = api.keystone.user_is_project_admin(request,
                                                    user_id, project_id)\
            or api.keystone.is_cloud_admin(request)\
            or api.keystone.is_domain_admin(request)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class UserIsDomainAdmin(generic.View):
    url_regex = r'keystone/userisdomainadmin/(?P<user_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, user_id):
        """Is user admin role of the domain.
        """

        domain_id = request.GET['domain_id']

        return api.keystone.user_is_domain_admin(request, user_id, domain_id)

@urls.register
class CheckIsPublicRegion(generic.View):
    url_regex = r'keystone/ispublicregion/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.keystone.is_public_region(request)
        return rest_utils.JSONResponse(result, 200)

