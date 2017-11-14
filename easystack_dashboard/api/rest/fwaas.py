# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright (c) 2015 X.commerce, a business unit of Easystack Inc.
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
"""API for the firewall as a service APIs.
"""

from django.utils import http as utils_http
from django.views import generic
from django import http

from easystack_dashboard import api
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils


@urls.register
class Firewalls(generic.View):
    """ API for Firewall  """
    url_regex = r'network/firewalls/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of firewalls.

        The listing result is an object with property "items". Each item is
        an image.

        Example GET:
        http://localhost/api/network/firewalls
        """
        firewalls = api.fwaas.firewall_list_for_tenant(request,
                                                       request.user.tenant_id)
        for fw in firewalls:
            fw.to_dict()

        return {'items': [fw.to_dict() for fw in firewalls]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a firewall.

        Create a firewall using the parameters supplied in the POST
        application/json object. The parameters are:

        :param name: name for firewall
        :param description: description for firewall
        :param firewall_policy_id: policy id used by firewall
        :param shared: boolean (default false)
        :param admin_state_up: boolean (default true)

        This returns the new firewall object on success.
        """
        new = api.fwaas.firewall_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/network/firewalls/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class Firewall(generic.View):

    url_regex = r'network/firewall/(?P<firewall_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, firewall_id):
        """Get a specific firewall

        http://localhost/api/network/firewall/1
        """
        return api.fwaas.firewall_get(request, firewall_id).to_dict()

    @rest_utils.ajax()
    def delete(self, request, firewall_id):
        """Delete a single firewall by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            return http.HttpResponseNotFound('default')
        api.fwaas.firewall_delete(request, firewall_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, firewall_id):
        new = api.fwaas.firewall_update(request, firewall_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/network/firewall/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class FirewallPolicies(generic.View):
    """ API for Firewall Policies  """
    url_regex = r'network/firewallpolicies/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of firewall policies.

        The listing result is an object with property "items". Each item is
        an image.

        Example GET:
        http://localhost/api/network/firewallpolicies
        """

        policies = api.fwaas.policy_list_for_tenant(request,
                                                    request.user.tenant_id,
                                                    **request.GET)

        return {'items': [p.to_dict() for p in policies]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a firewall.

        Create a firewall policy using the parameters supplied in the POST
        application/json object. The parameters are:

        :param request: request context
        :param name: name for policy
        :param description: description for policy
        :param firewall_rules: ordered list of rules in policy
        :param shared: boolean (default false)
        :param audited: boolean (default false)

        This returns the new firewall policy object on success.
        """
        new = api.fwaas.policy_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/network/firewallpolicies/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class FirewallPolicy(generic.View):

    url_regex = r'network/firewallpolicy/(?P<policy_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, policy_id):
        """Get a specific firewall policy

        http://localhost/api/network/firewallpolicy/1
        """
        return api.fwaas.policy_get(request, policy_id).to_dict()

    @rest_utils.ajax()
    def delete(self, request, policy_id):
        """Delete a single firewall policy by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            return http.HttpResponseNotFound('default')
        api.fwaas.policy_delete(request, policy_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, policy_id):
        new = api.fwaas.policy_update(request, policy_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/network/firewallpolicy/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class FirewallPolicyRule(generic.View):

    url_regex = r'network/firewallpolicyrule/(?P<policy_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, policy_id):
        """Get a specific firewall policy

        http://localhost/api/network/firewallpolicy/1
        """
        return api.fwaas.policy_get(request, policy_id).to_dict()

    @rest_utils.ajax(data_required=True)
    def patch(self, request, policy_id):
        """Add a single firewall rule to policy by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            return http.HttpResponseNotFound('default')

        policy = api.fwaas.policy_get(request, policy_id)
        rules = policy.firewall_rules
        rule_id = request.DATA.get('rule')
        rules.append(rule_id)
        body = {'firewall_rules': rules}
        new = api.fwaas.policy_update(request, policy_id, **body)

        return rest_utils.CreatedResponse(
            '/api/network/firewallpolicyrule/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request, policy_id):
        """Add a single firewall rule to policy by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            return http.HttpResponseNotFound(id)

        policy = api.fwaas.policy_get(request, policy_id)
        rules = policy.firewall_rules
        rule_id = request.DATA.get('rule')
        try:
            rules.remove(rule_id)
        except ValueError:
            return http.HttpResponseNotFound(rule_id)

        body = {'firewall_rules': rules}
        new = api.fwaas.policy_update(request, policy_id, **body)

        return rest_utils.CreatedResponse(
            '/api/network/firewallpolicyrule/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class FirewallRules(generic.View):
    """ API for Firewall Rules  """
    url_regex = r'network/firewallrules/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of firewall rules.

        The listing result is an object with property "items". Each item is
        an image.

        Example GET:
        http://localhost/api/network/firewallrules
        """
        keyword = ['firewall_policy_id', 'name', 'action', 'shared']

        filters, kwargs = rest_utils.parse_filters_kwargs(request, keyword)
        policy = filters.get('policy')
        rules = api.fwaas.rule_list_for_tenant(request,
                                               request.user.tenant_id,
                                               **kwargs)
        if policy == 'null':
            items = [r.to_dict() for r in rules if not r.firewall_policy_id]
        else:
            items = [r.to_dict() for r in rules]
        return {'items': items}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a firewall rule.

        Create a firewall rule using the parameters supplied in the POST
        application/json object. The parameters are:

        :param name: name for rule
        :param description: description for rule
        :param protocol: protocol for rule
        :param action: action for rule
        :param source_ip_address: source IP address or subnet
        :param source_port: integer in [1, 65535] or range in a:b
        :param destination_ip_address: destination IP address or subnet
        :param destination_port: integer in [1, 65535] or range in a:b
        :param shared: boolean (default false)
        :param enabled: boolean (default true)

        This returns the new firewall rule object on success.
        """
        new = api.fwaas.rule_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/network/firewallrules/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class FirewallRule(generic.View):

    url_regex = r'network/firewallrule/(?P<rule_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, rule_id):
        """Get a specific firewall rule

        http://localhost/api/network/firewallrule/1
        """
        return api.fwaas.rule_get(request, rule_id).to_dict()

    @rest_utils.ajax()
    def delete(self, request, rule_id):
        """Delete a single firewall rule by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            return http.HttpResponseNotFound('default')
        api.fwaas.rule_delete(request, rule_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, rule_id):
        new = api.fwaas.rule_update(request, rule_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/network/firewallrule/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )
