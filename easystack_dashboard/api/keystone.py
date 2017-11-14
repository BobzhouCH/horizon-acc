# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright 2012 OpenStack Foundation
# Copyright 2012 Nebula, Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

import collections
import copy
import logging

from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from django.http.response import HttpResponse
import six.moves.urllib.parse as urlparse

from keystoneclient import exceptions as keystone_exceptions
from keystoneclient.openstack.common.apiclient.exceptions import NotFound

from openstack_auth import backend
from openstack_auth import utils as auth_utils

from horizon import exceptions
from horizon import messages
from horizon.utils import functions as utils

from easystack_dashboard.api import base
from easystack_dashboard import policy
import re

LOG = logging.getLogger(__name__)

DEFAULT_ROLE = None
DEFAULT_DOMAIN = getattr(settings, 'OPENSTACK_KEYSTONE_DEFAULT_DOMAIN', None)
ADMIN_ROLE_NAME = None

MANA_ENABLE = getattr(settings, 'MANA_ENABLE', False)
DEDICATED_PREFIX = getattr(settings, 'DEDICATED_PREFIX', 'dedicated:')

NOTPUBLICREGION_MAGIC_WORD = getattr(settings,
                                     'NOTPUBLICREGION_MAGIC_WORD',
                                     'isNotPublicRegion')

# Set up our data structure for managing Identity API versions, and
# add a couple utility methods to it.


class IdentityAPIVersionManager(base.APIVersionManager):

    def upgrade_v2_user(self, user):
        if getattr(user, "project_id", None) is None:
            user.project_id = getattr(user, "default_project_id",
                                      getattr(user, "tenantId", None))
        return user

    def get_project_manager(self, *args, **kwargs):
        if VERSIONS.active < 3:
            manager = keystoneclient(*args, **kwargs).tenants
        else:
            manager = keystoneclient(*args, **kwargs).projects
        return manager


VERSIONS = IdentityAPIVersionManager(
    "identity", preferred_version=auth_utils.get_keystone_version())


# Import from oldest to newest so that "preferred" takes correct precedence.
try:
    from keystoneclient.v2_0 import client as keystone_client_v2
    VERSIONS.load_supported_version(2.0, {"client": keystone_client_v2})
except ImportError:
    pass

try:
    from keystoneclient.v3 import client as keystone_client_v3
    VERSIONS.load_supported_version(3, {"client": keystone_client_v3})
except ImportError:
    pass


class Service(base.APIDictWrapper):

    """Wrapper for a dict based on the service data from keystone."""
    _attrs = ['id', 'type', 'name']

    def __init__(self, service, region, *args, **kwargs):
        super(Service, self).__init__(service, *args, **kwargs)
        self.public_url = base.get_url_for_service(service, region,
                                                   'publicURL')
        self.url = base.get_url_for_service(service, region, 'internalURL')
        if self.url:
            self.host = urlparse.urlparse(self.url).hostname
        else:
            self.host = None
        self.disabled = None
        self.region = region

    def __unicode__(self):
        if(self.type == "identity"):
            return _("%(type)s (%(backend)s backend)") \
                % {"type": self.type, "backend": keystone_backend_name()}
        else:
            return self.type

    def __repr__(self):
        return "<Service: %s>" % unicode(self)


def _get_endpoint_url(request, endpoint_type, catalog=None):
    if getattr(request.user, "service_catalog", None):
        url = base.url_for(request,
                           service_type='identity',
                           endpoint_type=endpoint_type)
    else:
        auth_url = getattr(settings, 'OPENSTACK_KEYSTONE_URL')
        url = request.session.get('region_endpoint', auth_url)

    # TODO(gabriel): When the Service Catalog no longer contains API versions
    # in the endpoints this can be removed.
    url = url.rstrip('/')
    url = urlparse.urljoin(url, 'v%s' % VERSIONS.active)

    return url


def keystoneclient(request, admin=False, use_project_token=False):
    """Returns a client connected to the Keystone backend.

    Several forms of authentication are supported:

        * Username + password -> Unscoped authentication
        * Username + password + tenant id -> Scoped authentication
        * Unscoped token -> Unscoped authentication
        * Unscoped token + tenant id -> Scoped authentication
        * Scoped token -> Scoped authentication

    Available services and data from the backend will vary depending on
    whether the authentication was scoped or unscoped.

    Lazy authentication if an ``endpoint`` parameter is provided.

    Calls requiring the admin endpoint should have ``admin=True`` passed in
    as a keyword argument.

    The client is cached so that subsequent API calls during the same
    request/response cycle don't have to be re-authenticated.
    """
    api_version = VERSIONS.get_active_version()
    user = request.user
    token_id = user.token.id

    if api_version >= 3 and not use_project_token:
        domain_token = request.session.get('domain_token')
        if domain_token:
            token_id = getattr(domain_token, 'auth_token', None)

    if admin:
        if not policy.check((("identity", "admin_required"),), request):
            raise exceptions.NotAuthorized
        endpoint_type = 'adminURL'
    else:
        endpoint_type = getattr(settings,
                                'OPENSTACK_ENDPOINT_TYPE',
                                'internalURL')

    # Take care of client connection caching/fetching a new client.
    # Admin vs. non-admin clients are cached separately for token matching.
    cache_attr = "_keystoneclient_admin" if admin \
        else backend.KEYSTONE_CLIENT_ATTR
    if (hasattr(request, cache_attr) and
        (not token_id or
         getattr(request, cache_attr).auth_token == token_id)):
        conn = getattr(request, cache_attr)
    else:
        endpoint = _get_endpoint_url(request, endpoint_type)
        insecure = getattr(settings, 'OPENSTACK_SSL_NO_VERIFY', False)
        cacert = getattr(settings, 'OPENSTACK_SSL_CACERT', None)
        LOG.debug("Creating a new keystoneclient connection to %s." % endpoint)
        remote_addr = request.environ.get('REMOTE_ADDR', '')
        conn = api_version['client'].Client(token=token_id,
                                            endpoint=endpoint,
                                            original_ip=remote_addr,
                                            insecure=insecure,
                                            cacert=cacert,
                                            auth_url=endpoint,
                                            debug=settings.DEBUG)
    return conn


@base.create_log_decorator(
    optype='Create', subject='Domain', detail=None)
def domain_create(request, name, id=None, description=None, enabled=None):
    manager = keystoneclient(request, admin=True).domains
    return manager.create(name,
                          id=id,
                          description=description,
                          enabled=enabled)


def domain_get(request, domain_id):
    manager = keystoneclient(request, admin=True).domains
    return manager.get(domain_id)

def domain_quota_get(request, domain_id, admin=False):
    domain_quotas = keystoneclient(request, admin=admin).domain_quotas.get_domain_quotas(domain_id)
    region = request.user.services_region
    return getattr(domain_quotas, region)

def domain_quota_update(request, domain_id, **kwargs):
    return keystoneclient(request, admin=True).domain_quotas.update_domain_quotas(domain_id, **kwargs)


def domain_delete(request, domain_id):
    manager = keystoneclient(request, admin=True).domains
    return manager.delete(domain_id)


def domain_list(request):
    manager = keystoneclient(request, admin=True).domains
    return manager.list()


def domain_lookup(request):
    if policy.check((("identity", "identity:list_domains"),), request):
        try:
            domains = domain_list(request)
            return dict((d.id, d.name) for d in domains)
        except Exception:
            LOG.warn("Pure project admin doesn't have a domain token")
            return None
    else:
        domain = get_default_domain(request)
        return {domain.id: domain.name}


def domain_update(request, domain_id, name=None, description=None,
                  enabled=None):
    manager = keystoneclient(request, admin=True).domains
    try:
        response = manager.update(domain_id, name=name,
                                  description=description, enabled=enabled)
    except Exception as e:
        LOG.exception("Unable to update Domain: %s" % domain_id)
        raise e
    return response


def get_default_domain(request):
    """Gets the default domain object to use when creating Identity object.

    Returns the domain context if is set, otherwise return the domain
    of the logon user.
    """
    domain_id = request.session.get("domain_context", None)
    domain_name = request.session.get("domain_context_name", None)
    # if running in Keystone V3 or later
    if VERSIONS.active >= 3 and domain_id is None:
        # if no domain context set, default to users' domain
        domain_id = request.user.user_domain_id
        domain_name = request.user.user_domain_name
        if domain_name is None:
            try:
                domain = domain_get(request, domain_id)
                domain_name = domain.name
            except Exception:
                LOG.warning("Unable to retrieve Domain: %s" % domain_id)
    domain = base.APIDictWrapper({"id": domain_id,
                                  "name": domain_name})
    return domain


def get_effective_domain_id(request):
    """Gets the id of the default domain to use when creating Identity objects.
    If the requests default domain is the same as DEFAULT_DOMAIN, return None.

    Many keystone calls need this type of behavior to deal with hierarchical
    domain structures.
    """

    # TODO(woodm1979): This assumes there's one-level of sub-domains with a
    # single super-domain to rule them all.  A different solution will be
    # needed once the whole hierarchical domains + hierarchical projects
    # picture shakes out.

    domain_id = get_default_domain(request).get('id')
    return None if domain_id == DEFAULT_DOMAIN else domain_id


def is_cloud_admin(request):
    return policy.check((("identity", "cloud_admin"),), request)


def has_admin_role(request, roles):
    admin_role = get_admin_role()
    if admin_role is None:
        return False
    return admin_role in [role['name'] for role in roles]


def is_default_domain_admin(request):
    v3 = VERSIONS.active >= 3
    domain_token = request.session.get('domain_token')
    if v3 and not domain_token:
        return (v3, False)
    if v3 and domain_token:
        domain_id = domain_token['domain']['id']
        roles = domain_token['roles']
        is_default_domain = domain_id == DEFAULT_DOMAIN
        is_domain_admin = has_admin_role(request, roles)
        return (True, is_default_domain and is_domain_admin)
    return (v3, None)


def is_default_domain_member(request):
    v3 = VERSIONS.active >= 3
    domain_token = request.session.get('domain_token')
    if v3 and not domain_token:
        return (v3, False)
    if v3 and domain_token:
        domain_id = domain_token['domain']['id']
        roles = domain_token['roles']
        is_default_domain = domain_id == DEFAULT_DOMAIN
        is_domain_admin = has_admin_role(request, roles)
        return (True, is_default_domain and not is_domain_admin)
    return (v3, None)


def is_domain_admin(request):
    v3 = VERSIONS.active >= 3
    domain_token = request.session.get('domain_token')
    if v3 and not domain_token:
        return (v3, False)
    if v3 and domain_token:
        roles = domain_token['roles']
        is_domain_admin = has_admin_role(request, roles)
        return (True, is_domain_admin)
    return (v3, None)


def is_project_admin(request):
    v3 = VERSIONS.active >= 3
    token = request.session.get('token')
    if v3 and not token:
        return (v3, False)
    if v3 and token:
        roles = token.roles
        is_project_admin = has_admin_role(request, roles)
        return (True, is_project_admin)
    return (v3, None)


def user_is_domain_admin(request, user, domain):
    is_domain_admin = False
    roles = roles_for_user(request, user, domain=domain)
    for role in roles:
        if role.name == get_admin_role():
            is_domain_admin = True
            break
    return is_domain_admin


def user_is_project_admin(request, user, project):
    is_domain_admin = False
    roles = roles_for_user(request, user, project=project, is_admin=False)
    for role in roles:
        if role.name == get_admin_role():
            is_domain_admin = True
            break
    return is_domain_admin


@base.create_log_decorator(
    optype='Create', subject='Project', detail=None)
def tenant_create(request, name, description=None, enabled=None,
                  domain=None, **kwargs):
    manager = VERSIONS.get_project_manager(request, admin=True)
    if VERSIONS.active < 3:
        return manager.create(name, description, enabled, **kwargs)
    else:
        return manager.create(name, domain,
                              description=description,
                              enabled=enabled, **kwargs)


# TODO(gabriel): Is there ever a valid case for admin to be false here?
# A quick search through the codebase reveals that it's always called with
# admin=true so I suspect we could eliminate it entirely as with the other
# tenant commands.
def tenant_get(request, project, admin=True):
    manager = VERSIONS.get_project_manager(request, admin=admin)
    return manager.get(project)


def tenant_delete(request, project):
    manager = VERSIONS.get_project_manager(request, admin=True)
    return manager.delete(project)


# NOTE(esp): domain is really domain_id
def tenant_list(request, paginate=False, marker=None, domain=None, user=None,
                admin=True, filters=None):
    manager = VERSIONS.get_project_manager(request, admin=admin)
    page_size = utils.get_page_size(request)

    limit = None
    if paginate:
        limit = page_size + 1

    has_more_data = False

    # if requesting the projects for the current user,
    # return the list from the cache
    if user == request.user.id:
        tenants = request.user.authorized_tenants

    elif VERSIONS.active < 3:
        tenants = manager.list(limit, marker)
        if paginate and len(tenants) > page_size:
            tenants.pop(-1)
            has_more_data = True
    else:
        domain_id = domain if domain else get_effective_domain_id(request)
        kwargs = {
            "domain": domain_id,
            "user": user
        }
        if filters is not None:
            kwargs.update(filters)
        tenants = manager.list(**kwargs)
    return tenants, has_more_data


def tenant_update(request, project, name=None, description=None,
                  enabled=None, domain=None, **kwargs):
    manager = VERSIONS.get_project_manager(request, admin=True)
    if VERSIONS.active < 3:
        return manager.update(project, name, description, enabled, **kwargs)
    else:
        return manager.update(project, name=name, domain=domain, description=description,
                              enabled=enabled, **kwargs)


def user_list(request, project=None, domain=None, group=None, filters=None):
    if VERSIONS.active < 3:
        kwargs = {"tenant_id": project}
    else:
        kwargs = {
            "project": project,
            "domain": domain,
            "group": group
        }
        if filters is not None:
            kwargs.update(filters)
    users = keystoneclient(request, admin=True).users.list(**kwargs)
    return [VERSIONS.upgrade_v2_user(user) for user in users]


@base.create_log_decorator(optype='Create', subject='User', detail=None)
def user_create(request, name=None, email=None, password=None, project=None,
                enabled=None, domain=None):
    manager = keystoneclient(request, admin=True).users
    try:
        if VERSIONS.active < 3:
            user = manager.create(name, password, email, project, enabled)
            return VERSIONS.upgrade_v2_user(user)
        else:
            return manager.create(name, password=password, email=email,
                                  default_project=project, enabled=enabled,
                                  domain=domain)
    except keystone_exceptions.Conflict:
        raise exceptions.Conflict()


@base.create_log_decorator(optype='Create', subject='User', detail=None)
def user_delete(request, user_id):
    return keystoneclient(request, admin=True).users.delete(user_id)


def user_get(request, user_id, admin=True):
    user = keystoneclient(request, admin=admin).users.get(user_id)
    return VERSIONS.upgrade_v2_user(user)


def user_update(request, user, admin=True, **data):
    manager = keystoneclient(request, admin=admin).users
    error = None

    if not keystone_can_edit_user():
        raise keystone_exceptions.ClientException(
            405, _("Identity service does not allow editing user data."))

    # The v2 API updates user model and default project separately
    if VERSIONS.active < 3:
        project = data.pop('project')

        # Update user details
        try:
            user = manager.update(user, **data)
        except keystone_exceptions.Conflict:
            raise exceptions.Conflict()
        except Exception:
            error = exceptions.handle(request, ignore=True)

        # Update default tenant
        try:
            user_update_tenant(request, user, project)
            user.tenantId = project
        except Exception:
            error = exceptions.handle(request, ignore=True)

        # Check for existing roles
        # Show a warning if no role exists for the project
        user_roles = roles_for_user(request, user, project)
        if not user_roles:
            messages.warning(request,
                             _('User %s has no role defined for that project.')
                             % data.get('name', None))

        if error is not None:
            raise error

    # v3 API is so much simpler...
    else:
        try:
            user = manager.update(user, **data)
        except keystone_exceptions.Conflict:
            raise exceptions.Conflict()


def user_update_enabled(request, user, enabled):
    manager = keystoneclient(request, admin=True).users
    if VERSIONS.active < 3:
        return manager.update_enabled(user, enabled)
    else:
        return manager.update(user, enabled=enabled)


def user_update_password(request, user, password, admin=True):

    if not keystone_can_edit_user():
        raise keystone_exceptions.ClientException(
            405, _("Identity service does not allow editing user password."))

    manager = keystoneclient(request, admin=admin).users
    if VERSIONS.active < 3:
        return manager.update_password(user, password)
    else:
        return manager.update(user, password=password)


def user_verify_admin_password(request, admin_password):
    # attempt to create a new client instance with admin password to
    # verify if it's correct.
    client = keystone_client_v2 if VERSIONS.active < 3 else keystone_client_v3
    try:
        endpoint = _get_endpoint_url(request, 'internalURL')
        insecure = getattr(settings, 'OPENSTACK_SSL_NO_VERIFY', False)
        cacert = getattr(settings, 'OPENSTACK_SSL_CACERT', None)
        client.Client(
            username=request.user.username,
            password=admin_password,
            insecure=insecure,
            cacert=cacert,
            auth_url=endpoint
        )
        return True
    except Exception:
        exceptions.handle(request, ignore=True)
        return False


def user_update_own_password(request, origpassword, password):
    client = keystoneclient(request, admin=False)
    client.user_id = request.user.id
    if VERSIONS.active < 3:
        return client.users.update_own_password(origpassword, password)
    else:
        return client.users.update_password(origpassword, password)


def user_update_tenant(request, user, project, admin=True):
    manager = keystoneclient(request, admin=admin).users
    if VERSIONS.active < 3:
        return manager.update_tenant(user, project)
    else:
        return manager.update(user, project=project)


def group_create(request, domain_id, name, description=None):
    manager = keystoneclient(request, admin=True).groups
    return manager.create(domain=domain_id,
                          name=name,
                          description=description)


def group_get(request, group_id, admin=True):
    manager = keystoneclient(request, admin=admin).groups
    return manager.get(group_id)


def group_delete(request, group_id):
    manager = keystoneclient(request, admin=True).groups
    return manager.delete(group_id)


def group_list(request, domain=None, project=None, user=None):
    manager = keystoneclient(request, admin=True).groups
    groups = manager.list(user=user, domain=domain)

    if project:
        project_groups = []
        for group in groups:
            roles = roles_for_group(request, group=group.id, project=project)
            if roles and len(roles) > 0:
                project_groups.append(group)
        groups = project_groups

    return groups


def group_update(request, group_id, name=None, description=None):
    manager = keystoneclient(request, admin=True).groups
    return manager.update(group=group_id,
                          name=name,
                          description=description)


def add_group_user(request, group_id, user_id):
    manager = keystoneclient(request, admin=True).users
    return manager.add_to_group(group=group_id, user=user_id)


def remove_group_user(request, group_id, user_id):
    manager = keystoneclient(request, admin=True).users
    return manager.remove_from_group(group=group_id, user=user_id)


def get_project_groups_roles(request, project):
    """Gets the groups roles in a given project.

    :param request: the request entity containing the login user information
    :param project: the project to filter the groups roles. It accepts both
                    project object resource or project ID

    :returns group_roles: a dictionary mapping the groups and their roles in
                          given project

    """
    groups_roles = collections.defaultdict(list)
    if VERSIONS.active < 3:
        project_role_assignments = role_assignments_list(
            request, project=project)
    else:
        project_role_assignments = role_assignments_list(request)

    for role_assignment in project_role_assignments:
        if not hasattr(role_assignment, 'group'):
            continue
        group_id = role_assignment.group['id']
        role_id = role_assignment.role['id']
        # TODO(esp): may need to filter this list by project or domain
        groups_roles[group_id].append(role_id)
    return groups_roles


def role_assignments_list(request, project=None, user=None, role=None,
                          group=None, domain=None, effective=False,
                          include_subtree=True):
    if VERSIONS.active < 3:
        raise exceptions.NotAvailable
    '''
    default_domain = get_default_domain(request)
    domain_id = default_domain.get('id')

    use_ptoken = False
    if domain_id != DEFAULT_DOMAIN and domain is None:
        use_ptoken = True

    multidomain_support = getattr(settings,
                                  'OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT',
                                  False)

    if multidomain_support is False:
        use_ptoken = False
    '''
    # use project token to authorize.
    use_ptoken = True
    if domain:
        use_ptoken = False

    manager = keystoneclient(
        request, admin=True, use_project_token=use_ptoken).role_assignments

    try:
        return manager.list(project=project, user=user, role=role, group=group,
                            domain=domain, effective=effective)

    except keystone_exceptions.Forbidden as e:
        # If we got a forbidden exception when using the project scoped token,
        # this may be a case of a Domain or Cloud admin attempting to modify a
        # project they don't have a role on.  Allow them to modify the project
        # by retrying with the domain scoped token.
        if use_ptoken:
            manager = keystoneclient(request, admin=True).role_assignments
            roles = manager.list(project=project, user=user, role=role,
                                 group=group, effective=effective)
        else:
            raise e

        return roles


def role_create(request, name):
    manager = keystoneclient(request, admin=True).roles
    return manager.create(name)


def role_get(request, role_id):
    manager = keystoneclient(request, admin=True).roles
    return manager.get(role_id)


def role_update(request, role_id, name=None):
    manager = keystoneclient(request, admin=True).roles
    return manager.update(role_id, name)


def role_delete(request, role_id):
    manager = keystoneclient(request, admin=True).roles
    return manager.delete(role_id)


def role_list(request):
    """Returns a global list of available roles."""
    return keystoneclient(request, admin=True).roles.list()


def roles_for_user(request, user, project=None, domain=None, is_admin=True):
    """Returns a list of user roles scoped to a project or domain."""
    manager = keystoneclient(request, admin=is_admin).roles
    if VERSIONS.active < 3:
        return manager.roles_for_user(user, project)
    else:
        return manager.list(user=user, domain=domain, project=project)


def get_domain_users_roles(request, domain):
    users_roles = collections.defaultdict(list)
    domain_role_assignments = role_assignments_list(request,
                                                    domain=domain)
    for role_assignment in domain_role_assignments:
        if not hasattr(role_assignment, 'user'):
            continue
        user_id = role_assignment.user['id']
        role_id = role_assignment.role['id']
        # filter by domain_id
        if 'domain' in role_assignment.scope:
            if role_assignment.scope['domain']['id'] == domain:
                users_roles[user_id].append(role_id)
    return users_roles


def add_domain_user_role(request, user, role, domain, inherit=False):
    """Adds a role for a user on a domain."""
    # TODO(lzm): parameter `inherit` is not perfectly supported by keystone
    manager = keystoneclient(request, admin=True).roles
    return manager.grant(role, user=user, domain=domain,
                         os_inherit_extension_inherited=inherit)


def remove_domain_user_role(request, user, role, domain=None):
    """Removes a given single role for a user from a domain."""
    manager = keystoneclient(request, admin=True).roles
    return manager.revoke(role, user=user, domain=domain)


def get_tenant_users_roles(request, project):
    users_roles = collections.defaultdict(list)
    if VERSIONS.active < 3:
        project_users = user_list(request, project=project)

        for user in project_users:
            roles = roles_for_user(request, user.id, project)
            roles_ids = [role.id for role in roles]
            users_roles[user.id].extend(roles_ids)
    else:
        domain = get_default_domain(request)
        project_role_assignments = role_assignments_list(
            request, project, domain=domain)
        for role_assignment in project_role_assignments:
            if not hasattr(role_assignment, 'user'):
                continue
            user_id = role_assignment.user['id']
            role_id = role_assignment.role['id']

            # filter by project_id
            if 'project' in role_assignment.scope:
                if role_assignment.scope['project']['id'] == project:
                    users_roles[user_id].append(role_id)

    return users_roles


def add_tenant_user_role(request, project=None, user=None, role=None,
                         group=None, domain=None):
    """Adds a role for a user on a tenant."""
    manager = keystoneclient(request, admin=True).roles
    if VERSIONS.active < 3:
        return manager.add_user_role(user, role, project)
    else:
        return manager.grant(role, user=user, project=project,
                             group=group, domain=domain)


def remove_tenant_user_role(request, project=None, user=None, role=None,
                            group=None, domain=None):
    """Removes a given single role for a user from a tenant."""
    manager = keystoneclient(request, admin=True).roles
    if VERSIONS.active < 3:
        return manager.remove_user_role(user, role, project)
    else:
        return manager.revoke(role, user=user, project=project,
                              group=group, domain=domain)


def remove_tenant_user_roles(request, project=None, user=None, domain=None):
    """Removes all roles from a user on a tenant, removing them from it."""
    client = keystoneclient(request, admin=True)
    roles = client.roles.roles_for_user(user, project)
    for role in roles:
        remove_tenant_user_role(request, user=user, role=role.id,
                                project=project, domain=domain)


def roles_for_group(request, group, domain=None, project=None):
    manager = keystoneclient(request, admin=True).roles
    return manager.list(group=group, domain=domain, project=project)


def add_group_role(request, role, group, domain=None, project=None):
    """Adds a role for a group on a domain or project."""
    manager = keystoneclient(request, admin=True).roles
    return manager.grant(role=role, group=group, domain=domain,
                         project=project)


def remove_group_role(request, role, group, domain=None, project=None):
    """Removes a given single role for a group from a domain or project."""
    manager = keystoneclient(request, admin=True).roles
    return manager.revoke(role=role, group=group, project=project,
                          domain=domain)


def remove_group_roles(request, group, domain=None, project=None):
    """Removes all roles from a group on a domain or project."""
    client = keystoneclient(request, admin=True)
    roles = client.roles.list(group=group, domain=domain, project=project)
    for role in roles:
        remove_group_role(request, role=role.id, group=group,
                          domain=domain, project=project)


class RolesManager(object):

    '''manager roles for domian/group/project'''

    def __init__(self, target_id):
        self.target = target_id

    def get_target_users_with_roles(self, request):
        users_roles = self.get_users_roles(request)
        users = []
        for (user_id, user_roles) in users_roles.iteritems():
            try:
                user = user_get(request, user_id).to_dict()
                user['roles'] = []
                for role_id in user_roles:
                    user_role = role_get(request, role_id)
                    user['roles'].append(user_role.to_dict())
                users.append(user)
            except NotFound as e:
                if e.response.status_code == 404:
                    pass
                else:
                    raise
        return users

    def update_users_roles(self, request, orig_users, users):
        """Edit user(s) of the target.
        """
        orig_users = set(self.UserWithRoles.users_from_dict(orig_users))
        users = set(self.UserWithRoles.users_from_dict(users))

        to_add_users = users - orig_users
        to_remove_users = orig_users - users
        to_edit_users = orig_users & users

        # NOTE(lzm): can't edit current user!
        # TODO(lzm): check if admin role must be in current user
        # when current user is in `to_edit_users`
        current_user = {'id': request.user.id, 'name': request.user.username}
        if self.UserWithRoles(current_user) in to_remove_users:
            msg = _("Can't edit current user %s") % current_user['name']
            raise exceptions.Conflict(msg)

        for user in to_add_users:
            self.add_user_roles(request, user)

        for user in to_remove_users:
            self.remove_user_roles(request, user)

        for user in to_edit_users:
            orig_roles = set(self._filter_user(orig_users, user.id).roles)
            roles = set(self._filter_user(users, user.id).roles)
            to_add_roles = roles - orig_roles
            to_remove_roles = orig_roles - roles

            edit_user = user.clone()
            edit_user.roles = to_add_roles
            self.add_user_roles(request, edit_user)

            edit_user.roles = to_remove_roles
            self.remove_user_roles(request, edit_user)

    def add_user_roles(self, request, user):
        user_id = user.id
        for role in user.roles:
            self.add_role_for_user(request, user_id, role.id)

    def remove_user_roles(self, request, user):
        user_id = user.id
        for role in user.roles:
            self.remove_role_from_user(request, user_id, role.id)

    def get_users_roles(self, request):
        pass

    def add_role_for_user(self, request, user_id, role_id):
        pass

    def remove_role_from_user(self, request, user_id, role_id):
        pass

    @staticmethod
    def _filter_user(users, user_id):
        return filter(lambda user: user.id == user_id, users)[0]

    class Role(object):

        def __init__(self, item):
            self._role = item
            self.id = item['id']

        def __repr__(self):
            return "Role(%s)" % (self.id,)

        def __eq__(self, other):
            if isinstance(other, self.__class__):
                return self.id == other.id
            return False

        def __hash__(self):
            return hash(self.id)

        @classmethod
        def roles_from_dict(cls, items):
            roles = []
            for item in items:
                roles.append(cls(item))
            return roles

    class UserWithRoles(object):

        def __init__(self, item):
            self._user = item
            self.id = item['id']
            roles = item.get('roles', [])
            self.roles = RolesManager.Role.roles_from_dict(roles)

        def __repr__(self):
            return "UserWithRoles(%s, %s)" % (self.id, self.roles)

        def __eq__(self, other):
            if isinstance(other, self.__class__):
                return self.id == other.id
            return False

        def __hash__(self):
            return hash(self.id)

        def clone(self):
            return copy.copy(self)

        @classmethod
        def users_from_dict(cls, items):
            users = []
            for item in items:
                users.append(cls(item))
            return users


class TenantRolesManager(RolesManager):

    def get_users_roles(self, request):
        return get_tenant_users_roles(request, self.target)

    def add_role_for_user(self, request, user, role):
        return add_tenant_user_role(request, self.target, user, role,
                                    group=None, domain=None)

    def remove_role_from_user(self, request, user, role):
        return remove_tenant_user_role(request, self.target, user, role,
                                       group=None, domain=None)


class DomainRolesManager(RolesManager):

    def get_users_roles(self, request):
        return get_domain_users_roles(request, self.target)

    def add_role_for_user(self, request, user, role):
        return add_domain_user_role(request, user, role, self.target)

    def remove_role_from_user(self, request, user, role):
        return remove_domain_user_role(request, user, role, self.target)


class DomainRolesAndProjectRoleManager(RolesManager):

    def get_users_roles(self, request):
        return get_domain_users_roles(request, self.target)

    def add_role_for_user(self, request, user, role):
        role = role_get(request, role)
        if role is not None and role.name == get_admin_role():
            projects = tenant_list(request, domain=self.target)
            for project in projects[0]:
                if self.target == 'default' and project.name == 'services':
                    continue
                add_tenant_user_role(request, project.id, user, role)

        return add_domain_user_role(request, user, role, self.target)

    def remove_role_from_user(self, request, user, role):
        role = role_get(request, role)
        remove_domain_user_role(request, user, role, self.target)
        ## Remove the user form project, if the domain roles are empty.
        if not roles_for_user(request, user, self.target):
            projects = tenant_list(request, self.target)
            for project in projects[0]:
                try:
                    for role in roles_for_user(request,user,project.id):
                        remove_tenant_user_role(request, project.id, user, role)
                except Exception as e:
                    pass
        return True


def get_default_role(request):
    """Gets the default role object from Keystone and saves it as a global.

    Since this is configured in settings and should not change from request
    to request. Supports lookup by name or id.
    """
    global DEFAULT_ROLE
    default = getattr(settings, "OPENSTACK_KEYSTONE_DEFAULT_ROLE", None)
    if default and DEFAULT_ROLE is None:
        try:
            roles = keystoneclient(request, admin=True).roles.list()
        except Exception:
            roles = []
            exceptions.handle(request)
        for role in roles:
            if role.id == default or role.name == default:
                DEFAULT_ROLE = role
                break
    return DEFAULT_ROLE


def get_admin_role():
    """Gets the default role object from Keystone and saves it as a global.

    Since this is configured in settings and should not change from request
    to request. Supports lookup by name or id.
    """
    global ADMIN_ROLE_NAME
    if ADMIN_ROLE_NAME is None:
        ADMIN_ROLE_NAME = getattr(
            settings, "OPENSTACK_KEYSTONE_ADMIN_ROLE", "admin")

    return ADMIN_ROLE_NAME


def ec2_manager(request):
    client = keystoneclient(request)
    if hasattr(client, 'ec2'):
        return client.ec2

    # Keystoneclient 4.0 was released without the ec2 creds manager.
    from keystoneclient.v2_0 import ec2
    return ec2.CredentialsManager(client)


def list_ec2_credentials(request, user_id):
    return ec2_manager(request).list(user_id)


def create_ec2_credentials(request, user_id, tenant_id):
    return ec2_manager(request).create(user_id, tenant_id)


def get_user_ec2_credentials(request, user_id, access_token):
    return ec2_manager(request).get(user_id, access_token)


def keystone_can_edit_domain():
    backend_settings = getattr(settings, "OPENSTACK_KEYSTONE_BACKEND", {})
    can_edit_domain = backend_settings.get('can_edit_domain', True)
    multi_domain_support = getattr(settings,
                                   'OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT',
                                   False)
    return can_edit_domain and multi_domain_support


def keystone_can_edit_user():
    backend_settings = getattr(settings, "OPENSTACK_KEYSTONE_BACKEND", {})
    return backend_settings.get('can_edit_user', True)


def keystone_can_edit_project():
    backend_settings = getattr(settings, "OPENSTACK_KEYSTONE_BACKEND", {})
    return backend_settings.get('can_edit_project', True)


def keystone_can_edit_group():
    backend_settings = getattr(settings, "OPENSTACK_KEYSTONE_BACKEND", {})
    return backend_settings.get('can_edit_group', True)


def keystone_can_edit_role():
    backend_settings = getattr(settings, "OPENSTACK_KEYSTONE_BACKEND", {})
    return backend_settings.get('can_edit_role', True)


def keystone_backend_name():
    if hasattr(settings, "OPENSTACK_KEYSTONE_BACKEND"):
        return settings.OPENSTACK_KEYSTONE_BACKEND['name']
    else:
        return 'unknown'


def verify_email(request, email):
    manager = keystoneclient(request).users
    return manager.get_registration_by_query(email=email)


def verify_name(request, name):
    manager = keystoneclient(request).users
    return manager.get_registration_by_query(name=name)


def create_user(request, data):
    manager = keystoneclient(request).users
    try:
        user = manager.create(**data)
        if getattr(settings, 'ENABLE_BILLING', True):
            content, status = create_billingaccount(user.domain_id)
            if status == 200:
                return user
    except keystone_exceptions as e:
        raise e


def active_user(request, user_id):
    manager = keystoneclient(request).users
    return manager.active_registration(user_id)


def create_billingaccount(domain_id):
    from easystack_dashboard.api import billing
    _billing = billing.BillingBase()
    url = '/account'
    body = {"balance": 1.00,
            "ref_resource": domain_id,
            "name": ""}
    content, resultStatus = _billing.post(url, body)
    return content, resultStatus


def verify_invitation_code(request):
    """Check if the phone verify code is right"""
    from easystack_dashboard.api import billing
    if len(request.body) > 0:
        dic = eval(request.body)
        code = dic.get('invitation_code')
        _billing = billing.BillingBase()
        url = '/invcode/' + str(code)
        content, status = _billing.get(url)
        result = int(content)
        if result == 0:
            result = "True"
        elif result == 1:
            result = _("The code is in use")
        elif result == 2:
            result = _("The code is overtime")
        else:
            result = _("Wrong Code")
        return HttpResponse(result, content_type="application/json")


def dedicated_tenant_init(request, domain_id=None):
    if not MANA_ENABLE:
        return
    domain_id = domain_id or get_default_domain(request).domain_id
    name = 'dedicated:default'
    description = 'default project for dedicated resource'
    return tenant_create(request, name, description, domain=domain_id)


def dedicated_tenant_list(request, dedicated=True,
                          paginate=False, marker=None, domain=None,
                          user=None, admin=True, filters=None):
    projects, has_more = tenant_list(request, paginate, marker, domain,
                                     user, admin, filters)
    if is_cloud_admin(request):
        return projects, has_more
    elif not is_domain_admin(request)[1] and is_project_admin(request)[1]:
        project_id = request.user.token.project.get('id')
        projects = [project for project in projects
                    if project.id == project_id]
    if dedicated:
        projects = [project for project in projects
                    if is_dedicated_name(project.name)]
        filter_projects = copy.deepcopy(projects)
        for project in filter_projects:
            name = get_dedicated_name(project.name)
            project.name = name
            project._info['name'] = name
    else:
        filter_projects = [project for project in projects
                           if not is_dedicated_name(project.name)]
    return filter_projects, has_more


def is_dedicated_context(request):
    project = request.user.tenant_name
    if MANA_ENABLE and is_dedicated_name(project):
        return True
    return False


def get_dedicated_name(name):
    return name[len(DEDICATED_PREFIX):]


def is_dedicated_name(name):
    return name.startswith(DEDICATED_PREFIX)


def get_region_name(request):
    region = request.user.services_region
    match = re.search(r'public_(\w+):(\w+)', region)
    if match:
        return match.group(1)
    return NOTPUBLICREGION_MAGIC_WORD

def is_public_region_name(region):
    match = re.search(r'public_(\w+):(\w+)', region)
    if match:
        return True
    return False

def is_public_region(request, nameid=None):
    region_settings = getattr(settings, "PULIC_CLOUD_RULES", {})
    region_name = get_region_name(request)
    region_result = region_settings.get(region_name)
    if nameid is None:
        return region_name != NOTPUBLICREGION_MAGIC_WORD
    if region_result:
        return region_result.get(nameid, False)
    return False
