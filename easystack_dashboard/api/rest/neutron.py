#
#    (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
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
"""API over the neutron service.
"""

import django
from django.utils import http as utils_http
from django.utils.datastructures import SortedDict  # noqa
from django.views import generic

from easystack_dashboard import api
from easystack_dashboard.api.rest import utils as rest_utils

from easystack_dashboard.api.rest import urls

from neutronclient.common import exceptions as neutron_exc
import logging
LOG = logging.getLogger(__name__)


@urls.register
class Agents(generic.View):

    """API for neutron agents.
    """
    url_regex = r'neutron/agents/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.neutron.agent_list(request)
        return {'items': [e.to_dict() for e in result]}


@urls.register
class Networks(generic.View):

    """API for Neutron Networks
    http://developer.openstack.org/api-ref-networking-v2.html
    """
    url_regex = r'neutron/networks/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of networks for a project

        The listing result is an object with property "items".  Each item is
        a network.
        """
        items = []
        filter_shared = request.GET.get('filter_shared', False)
        if request.GET.get('all_projects') == 'true':
            result = api.neutron.network_list(request, **request.GET)
            rest_utils.ensure_tenant_name(request, result)
            for item in result:
                item_dict = item.to_dict()
                if hasattr(item, 'tenant_name'):
                    item_dict.update({'tenant_name': item.tenant_name})
                    item_dict.update({'domain_id': item.domain_id})
                items.append(item_dict)
            rest_utils.ensure_domain_name(request, items)
        else:
            tenant_id = request.user.tenant_id
            result = api.neutron.network_list_for_tenant(request, tenant_id,
                                                         **request.GET)
            items = [n.to_dict() for n in result]
        # Filter out shared network for non-cloud admin.
        if filter_shared:
            v3, is_admin = api.keystone.is_default_domain_admin(request)
            if v3 and not is_admin:
                items = [item for item in items if not item['shared']]
        items = rest_utils.get_subnet_ip_usage(request, items)

        return {'items': items}
    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a network
        :param  admin_state_up (optional): The administrative state of the
                network, which is up (true) or down (false).
        :param name (optional): The network name. A request body is optional:
                If you include it, it can specify this optional attribute.
        :param net_profile_id (optional): network profile id
        :param shared (optional): Indicates whether this network is shared
                across all tenants. By default, only administrative users can
                change this value.
        :param tenant_id (optional): Admin-only. The UUID of the tenant that
                will own the network. This tenant can be different from the
                tenant that makes the create network request. However, only
                administrative users can specify a tenant ID other than their
                own. You cannot change this value through authorization
                policies.

         :return: JSON representation of a Network
         """
        if not api.neutron.is_port_profiles_supported():
            request.DATA.pop("net_profile_id", None)
        new_network = api.neutron.network_create(request, **request.DATA)

        rest_utils.ensure_tenant_name(request, [new_network])
        new_network_dict = new_network.to_dict()
        if hasattr(new_network, 'tenant_name'):
            new_network_dict.update({'tenant_name': new_network.tenant_name})
            new_network_dict.update({'domain_id': new_network.domain_id})

        rest_utils.ensure_domain_name(request, [new_network_dict])
        return rest_utils.CreatedResponse(
            '/api/neutron/networks/%s' % new_network.id,
            new_network_dict
        )


@urls.register
class Network(generic.View):

    url_regex = r'neutron/networks/(?P<network_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, network_id):
        """Get a specific network

        http://localhost/api/neutron/networks/1
        """
        return api.neutron.network_get(request, network_id, expand_subnet=True).to_dict()

    @rest_utils.ajax()
    def delete(self, request, network_id):
        """Delete a single network by id.

        This method returns HTTP 204 (no content) on success.
        """
        relate_port = []
        port_can_delete = []
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        relate_port = api.neutron.port_list(request, network_id = network_id)
        for p in relate_port:
            if not p.device_id:
                port_can_delete.append(p)
            else:
                device_owner = p.device_owner or ''
                if not device_owner.startswith('network:dhcp'):
                    return rest_utils.JSONResponse('There are one or more ports still in use on the network', 409)
        for pcd in port_can_delete:
            api.neutron.port_delete(request, pcd.id)
        api.neutron.network_delete(request, network_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, network_id):
        new = api.neutron.network_update(request, network_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/neutron/network/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class Subnets(generic.View):

    """API for Neutron SubNets
    http://developer.openstack.org/api-ref-networking-v2.html#subnets
    """
    url_regex = r'neutron/subnets/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of subnets for a project

        The listing result is an object with property "items".  Each item is
        a subnet.

        """
        result = api.neutron.subnet_list(request, **request.GET)

        if request.GET.get('ensure_with_router', False):
            result = rest_utils.ensure_subnet_with_router(request, result)
        result = rest_utils.ensure_network_detial_for_subnet(request, [n.to_dict() for n in result])
        return {'items': result}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a Subnet for a given Network

        :param name (optional):  The subnet name.
        :param network_id: The ID of the attached network.
        :param tenant_id (optional): The ID of the tenant who owns the network.
                Only administrative users can specify a tenant ID other than
                their own.
        :param allocation_pools (optional): The start and end addresses for the
                allocation pools.
        :param gateway_ip (optional): The gateway IP address.
        :param ip_version: The IP version, which is 4 or 6.
        :param cidr: The CIDR.
        :param id (optional): The ID of the subnet.
        :param enable_dhcp (optional): Set to true if DHCP is enabled and false
                if DHCP is disabled.

        :return: JSON representation of a Subnet

        """
        new_subnet = api.neutron.subnet_create(request, **request.DATA)
        new_network_dict = new_subnet.to_dict()
        rest_utils.ensure_neutron_parent_network_name(request, [new_network_dict])
        return rest_utils.CreatedResponse(
            '/api/neutron/subnets/%s' % new_subnet.id,
            new_network_dict
        )

@urls.register
class Subnet(generic.View):

    url_regex = r'neutron/subnets/(?P<subnet_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, subnet_id):
        """Get a specific subnet

        http://localhost/api/neutron/subnets/1
        """
        return api.neutron.subnet_get(request, subnet_id, **request.GET).to_dict()

    @rest_utils.ajax()
    def delete(self, request, subnet_id):
        """Delete a single subnet by id.

        This method returns HTTP 204 (no content) on success.
        """
        port_can_delete = []
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        relate_port = api.neutron.port_list(request, fixed_ips = 'subnet_id=' + subnet_id)
        for p in relate_port:
            if not p.device_id:
                port_can_delete.append(p)
            else:
                device_owner = p.device_owner  or ''
                if not device_owner.startswith('network:dhcp'):
                    return rest_utils.JSONResponse('One or more ports have an IP allocation from this subnet.',409)
        for pcd in port_can_delete:
            api.neutron.port_delete(request, pcd.id)
        api.neutron.subnet_delete(request, subnet_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, subnet_id):
        new = api.neutron.subnet_update(request, subnet_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/neutron/subnets/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class DevicePorts(generic.View):

    url_regex = r'neutron/device/ports/(?P<device_id>.+|)$'

    @rest_utils.ajax()
    def get(self, request, device_id):
        """Get a list of ports attached to a device

        The listing result is an object with property "items".  Each item is
        a port.
        """
        private = request.GET.get('private')
        result = api.neutron.port_list(request, device_id=device_id)
        items = [n.to_dict() for n in result]
        newitems = []
        for item in items:
            dic = {}
            dic.update({'id': item.get('id')})
            try:
                network = \
                    api.neutron.network_get(request, item.get('network_id'),
                                            expand_subnet=True).to_dict()
            except neutron_exc.NotFound as e:
                continue
            if network.get('router:external') == True:
                if (private == 'true'):
                    continue
            dic.update({'network': network.get('name')})
            sg = {}
            if item.get('security_groups'):
                sg = api.neutron.security_group_get(request, item.get('security_groups')[0])
            subnet = \
                api.neutron.subnet_get(request, item.get('fixed_ips')[0].get('subnet_id'),
                                       **request.GET).to_dict()
            dic.update({'status': item.get('status')})
            dic.update(
                {'fixed_ip': item.get('fixed_ips')[0].get('ip_address')})
            dic.update({'subnet': subnet.get('name')})
            dic.update({'subnet_id': subnet.get('id')})
            dic.update({'security_group': sg.get('name')})
            dic.update({'cidr': subnet.get('cidr')})
            dic.update({'gateway': subnet.get('gateway_ip')})
            dic.update({'mac_address': item.get('mac_address')})
            newitems.append(dic)
        return{'items': newitems}


@urls.register
class ComputePorts(generic.View):

    """API for Neutron Ports
    http://developer.openstack.org/api-ref-networking-v2.html#ports
    """
    url_regex = r'neutron/compute/ports/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of ports attached to a device

        The listing result is an object with property "items".  Each item is
        a port.
        """
        need_params = ['device_id', 'device_owner', 'tenant_id']
        filters, kwargs = rest_utils.parse_filters_kwargs(request,
                                                          need_params)
        subnet_id = filters.get('subnet_id')
        if subnet_id:
            kwargs['fixed_ips'] = 'subnet_id=%s' % subnet_id
        result = api.neutron.port_list(request, **kwargs)
        return{'items': [n.to_dict() for n in result
                         if n.device_owner.startswith('compute')]}

@urls.register
class ComputeAndFreePorts(generic.View):

    """API for Neutron Ports
    http://developer.openstack.org/api-ref-networking-v2.html#ports
    """
    url_regex = r'neutron/computeAndFreePort/ports/$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_fixed_ip_for_ports)
    @rest_utils.patch_items_by_func(rest_utils.ensure_floatingip_instance_for_port)
    def get(self, request):
        """Get a list of ports which is owened by compute or is not bind with device

        The listing result is an object with property "items".  Each item is
        a port.
        """
        need_params = ['device_id', 'device_owner', 'tenant_id']
        filters, kwargs = rest_utils.parse_filters_kwargs(request,
                                                          need_params)
        result = api.neutron.port_list(request, **kwargs)
        computeAndFreePorts_dict = []
        for port in result:
            if (port.device_owner.startswith('compute') or not port.device_owner):
                computeAndFreePorts_dict.append(port.to_dict())
        return{'items': computeAndFreePorts_dict}

@urls.register
class Ports(generic.View):

    """API for Neutron Ports
    http://developer.openstack.org/api-ref-networking-v2.html#ports
    """
    url_regex = r'neutron/ports/$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_fixed_ip_for_ports)
    @rest_utils.patch_items_by_func(rest_utils.ensure_floatingip_instance_for_port)
    @rest_utils.patch_items_by_func(rest_utils.ensure_router_for_port)
    @rest_utils.patch_items_by_func(rest_utils.ensure_loadbalance_for_port)
    def get(self, request):
        """Get a list of unused free ports

        The listing result is an object with property "items".  Each item is
        a port.
        """
        need_params = ['device_id', 'device_owner', 'tenant_id', 'network_id']
        filters, kwargs = rest_utils.parse_filters_kwargs(request,
                                                          need_params)

        if not kwargs.get('tenant_id'):
            kwargs.update({'tenant_id': request.user.tenant_id})

        network_list = api.neutron.network_list_for_tenant(request, kwargs.get('tenant_id'))
        kwargs = {}
        result = api.neutron.port_list(request, **kwargs)
        network_dict_list = SortedDict([(n.id, n) for n in network_list])
        FreePorts_dict = []
        for port in result:
            if not port.device_owner:
                FreePorts_dict.append(port.to_dict())
        return{'items': FreePorts_dict}

    @rest_utils.ajax(data_required=True)
    @rest_utils.patch_items_by_func(rest_utils.ensure_qos_policy_in_port)
    def post(self, request):
        """
        Create a port on a specified network.

        :param network_id: network id a subnet is created on
        :param device_id: (optional) device id attached to the port
        :param tenant_id: (optional) tenant id of the port created
        :param name: (optional) name of the port created

        :return: JSON representation of a Port

        """
        kwargs = request.DATA
        network_id = kwargs.pop('network_id')
        new_port = api.neutron.port_create(request, network_id, **kwargs)
        new_port_dict = new_port.to_dict()
        rest_utils.ensure_floatingip_instance_for_port(request, [new_port_dict])
        rest_utils.ensure_fixed_ip_for_ports(request, [new_port_dict])
        return rest_utils.CreatedResponse(
            '/api/neutron/ports/%s' % new_port.id,
            new_port.to_dict()
        )


@urls.register
class Port(generic.View):

    url_regex = r'neutron/port/(?P<port_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, port_id):
        """Get a specific port

        http://localhost/api/neutron/ports/1
        """
        port_dict = api.neutron.port_get(request, port_id, **request.GET).to_dict()
        rest_utils.ensure_floatingip_instance_for_port(request, [port_dict])
        rest_utils.ensure_fixed_ip_for_ports(request, [port_dict])
        rest_utils.ensure_qos_policy_in_port(request, [port_dict])
        return port_dict

    @rest_utils.ajax()
    def delete(self, request, port_id):
        """Delete a single port by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        port_dict = api.neutron.port_get(request, port_id, **request.GET).to_dict()
        api.neutron.port_delete(request, port_id)
        if port_dict.get('qos_policy_id'):
            api.neutron.qos_policy_delete(request, port_dict.get('qos_policy_id'))

    @rest_utils.ajax(data_required=True)
    def patch(self, request, port_id):
        kwargs = request.DATA
        new = api.neutron.port_update(request, port_id, **kwargs)
        port_dict = new.to_dict()
        rest_utils.ensure_floatingip_instance_for_port(request, [port_dict])
        rest_utils.ensure_fixed_ip_for_ports(request, [port_dict])
        return rest_utils.CreatedResponse(
            '/api/neutron/ports/%s' % utils_http.urlquote(new.name),
            port_dict
        )


@urls.register
class Routers(generic.View):

    """API for Neutron Routers
    http://developer.openstack.org/api-ref-networking-v2.html#routers
    """
    url_regex = r'neutron/routers/(?P<retrieve_all>.+|)$'

    @rest_utils.ajax()
    def get(self, request, retrieve_all):
        """Get a list of routers

        The listing result is an object with property "items".  Each item is
        a router.
        """
        params = {}
        items = []
        ext_nets_dict = self._list_external_networks()
        if retrieve_all == 'all':
            params.update({'retrieve_all': True})
            result = api.neutron.router_list(request, **params)
            rest_utils.ensure_tenant_name(request, result)
            for item in result:
                self._set_external_network(item, ext_nets_dict)
                item_dict = item.to_dict()
                if hasattr(item, 'tenant_name'):
                    item_dict.update({'tenant_name': item.tenant_name})
                    item_dict.update({'domain_id': item.domain_id})
                items.append(item_dict)
                rest_utils.ensure_domain_name(request, items)
        else:
            params.update({'tenant_id': request.user.tenant_id})
            result = api.neutron.router_list(request, **params)
            for item in result:
                self._set_external_network(item, ext_nets_dict)
                items.append(item.to_dict())
            rest_utils.ensure_firewall_id_in_routers(request, items)
        return{'items': items}

    @rest_utils.ajax(data_required=True)
    def post(self, request, retrieve_all=None):
        """
        Create a router.

        :param name: (optional) name of the router created

        :return: JSON representation of a Router

        """
        filter, kargs = rest_utils.parse_filters_kwargs(request)
        if api.keystone.is_dedicated_context(request):
            filter['domain_id'] = request.user.user_domain_id
            filter['dedicated'] = True
        if('unit' in filter):
            del filter['unit']
        new_router = api.neutron.router_create(request, **filter)
        return rest_utils.CreatedResponse(
            '/api/neutron/router/%s' % new_router.id,
            new_router.to_dict()
        )

    def _list_external_networks(self):
        try:
            search_opts = {'router:external': True}
            ext_nets = api.neutron.network_list(self.request,
                                                **search_opts)
            for ext_net in ext_nets:
                ext_net.set_id_as_name_if_empty()
            ext_net_dict = SortedDict((n['id'], n.name) for n in ext_nets)
        except Exception:
            ext_net_dict = {}
        return ext_net_dict

    def _set_external_network(self, router, ext_net_dict):
        gateway_info = router.external_gateway_info
        if gateway_info:
            ext_net_id = gateway_info['network_id']
            if ext_net_id in ext_net_dict:
                gateway_info['network'] = ext_net_dict[ext_net_id]
            else:
                return


@urls.register
class Router(generic.View):

    url_regex = r'neutron/router/(?P<router_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, router_id):
        """Get a specific router
        http://localhost/api/neutron/router/1
        """
        ext_nets_dict = self._list_external_networks()
        router = api.neutron.router_get(request, router_id, **request.GET)
        self._set_external_network(router, ext_nets_dict)
        router_dict = rest_utils.ensure_firewall_id_in_routers(request, [router.to_dict()])
        return{'items': router_dict[0]}

    @rest_utils.ajax()
    def delete(self, request, router_id):
        """Delete a single router by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.neutron.router_delete(request, router_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, router_id):
        new = api.neutron.router_update(request, router_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/neutron/router/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )

    def _list_external_networks(self):
        try:
            search_opts = {'router:external': True}
            ext_nets = api.neutron.network_list(self.request,
                                                **search_opts)
            for ext_net in ext_nets:
                ext_net.set_id_as_name_if_empty()
            ext_net_dict = SortedDict((n['id'], n.name) for n in ext_nets)
        except Exception:
            ext_net_dict = {}
        return ext_net_dict

    def _set_external_network(self, router, ext_net_dict):
        gateway_info = router.external_gateway_info
        if gateway_info:
            ext_net_id = gateway_info['network_id']
            if ext_net_id in ext_net_dict:
                gateway_info['network'] = ext_net_dict[ext_net_id]
            else:
                return


@urls.register
class RouterAddInterface(generic.View):

    """API for add router interface
    """
    url_regex = r'neutron/router/(?P<router_id>.+)/addinterface$'

    @rest_utils.ajax()
    def post(self, request, router_id):
        new_router_port = api.neutron.router_add_interface(
            request,
            router_id,
            subnet_id=request.DATA.get('subnet_id'),
            port_id=request.DATA.get('port_id'))
        return rest_utils.CreatedResponse(
            '/api/neutron/router/%s' % utils_http.urlquote(
                new_router_port.get('id')),
            new_router_port)


@urls.register
class RouterRemoveInterface(generic.View):

    """API for remove router interface
    """
    url_regex = r'neutron/router/(?P<router_id>.+)/removeinterface$'

    @rest_utils.ajax()
    def post(self, request, router_id):
        api.neutron.router_remove_interface(
            request,
            router_id,
            subnet_id=request.DATA['subnet_id'],
            port_id=request.DATA['port_id'])


@urls.register
class RouterAddGateway(generic.View):

    """API for add router gateway
    """
    url_regex = r'neutron/router/(?P<router_id>.+)/addgateway$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, router_id):
        api.neutron.router_add_gateway(
            request,
            router_id,
            network_id=request.DATA['network_id'],
            ip_addresses=[{'ip_address': request.DATA['ip_addresses']}])


@urls.register
class RouterRemoveGateway(generic.View):

    """API for remove router gateway
    """
    url_regex = r'neutron/router/(?P<router_id>.+)/removegateway$'

    @rest_utils.ajax()
    def post(self, request, router_id):
        api.neutron.router_remove_gateway(
            request,
            router_id)


@urls.register
class QosPolicies(generic.View):

    """API for Qos Policies
    """
    url_regex = r'neutron/qospolicies/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.neutron.qos_policy_list(request)
        return {'items': [n.to_dict() for n in result]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        kwargs = request.DATA
        policy = api.neutron.create_qos_policy(request, **kwargs)
        return rest_utils.CreatedResponse(
            '/api/neutron/qospolicys/%s' % policy.id,
            policy.to_dict()
        )


@urls.register
class QosPolicy(generic.View):

    """ API for Qos Policy
    """
    url_regex = r'neutron/qospolicy/(?P<policy_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, policy_id):
        kwargs = {}
        policy = api.neutron.get_qos_policy(request, policy_id, **kwargs)
        rest_utils.ensure_qos_policy_rule(request, [policy.to_dict()])
        return policy.to_dict()

    @rest_utils.ajax()
    def delete(self, request, policy_id):

        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.neutron.qos_policy_delete(request, policy_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, policy_id):
        kwargs = request.DATA
        new_policy = api.neutron.qos_policy_update(request, policy_id, **kwargs)
        return rest_utils.CreatedResponse(
            '/api/neutron/router/%s' % utils_http.urlquote(new_policy.name),
            new_policy.to_dict()
        )


@urls.register
class BandWidthLimitRules(generic.View):

    """API for band width limit ruler
    """
    url_regex = r'neutron/bandwidthlimitrules/$'

    @rest_utils.ajax()
    def get(self, request):
        kwargs = request.DATA
        policy_id = kwargs.pop('policy_id')
        result = api.neutron.bandwidth_limit_rules_list(request, policy_id, **kwargs)
        return {'items': [n.to_dict() for n in result]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        kwargs = request.DATA
        policy_id = kwargs.pop('policy_id')
        rule = api.neutron.bandwidth_limit_rule_create(request, policy_id, **kwargs)
        return rest_utils.CreatedResponse(
            '/api/neutron/bandwidthlimitrules/%s' % rule.id,
            rule.to_dict()
        )


@urls.register
class QosPolicyAndRules(generic.View):

    url_regex = r'neutron/qospolicyandrules/$'

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        kwargs = request.DATA
        policy_param = {'name': kwargs.get('name')}
        new_qos_policy = api.neutron.create_qos_policy(request, **policy_param)
        rule_param = {'max_kbps': kwargs.get('max_kbps')}
        api.neutron.bandwidth_limit_rule_create(request, new_qos_policy.id, **rule_param)
        return rest_utils.CreatedResponse(
            '/api/neutron/qospolicyandrules/%s' % new_qos_policy.id,
            new_qos_policy.to_dict()
        )

@urls.register
class BandWidthLimitRule(generic.View):
    """ API for bind width limit rule
    """
    url_regex = r'neutron/bandwidthlimitrules/(?P<rule_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, reqeust, rule_id):
        """get a bind width limit rule by rule_id and policy_id
        """
        kwargs = reqeust.DATA
        policy_id = kwargs.pop('policy_id')
        rule = api.neutron.bandwidth_limit_rule_show(reqeust, rule_id, policy_id, **kwargs)
        return {'items': rule.to_dict()}

    @rest_utils.ajax()
    def delete(self, request, rule_id):
        """Delete a bind width limit rule

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        policy_id = request.DATA.pop('policy_id')
        api.neutron.bandwidth_limit_rule_delete(request, rule_id, policy_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, rule_id):
        kwargs = request.DATA
        policy_id = kwargs.pop('policy_id')
        rule = api.neutron.bandwidth_limit_rule_update(request, rule_id, policy_id, **kwargs)
        return rest_utils.CreatedResponse(
            '/api/neutron/bandwidthlimitrules/%s' % rule.bandwidth_limit_rule.get('id'),
            rule.to_dict()
        )

@urls.register
class PssrGetPFVFNumUsed(generic.View):
    """API for managing pssr
    """
    # '/api/nova/pssrgetpfvfnum/' + physnet
    url_regex = r'neutron/pssrgetpfvfnum/(?P<physnet>.+)$'

    @rest_utils.ajax()
    def get(self, request, physnet):
        """pssr"""
        pfnum_used = 0
        vfnum_used = 0

        ports = api.neutron.port_list(request)
        for port in ports:
            if "direct" == port["binding:vnic_type"]:
                vfnum_used = vfnum_used + 1
            elif "direct-physical" == port["binding:vnic_type"]:
                pfnum_used = pfnum_used + 1
            else:
                continue

        LOG.info("PssrGetPFVFNum:pfnum_used = %s,vfnum_used = %s" , pfnum_used, vfnum_used)
        results = {"PFNumUsed":pfnum_used ,"VFNumUsed":vfnum_used}
        return results

