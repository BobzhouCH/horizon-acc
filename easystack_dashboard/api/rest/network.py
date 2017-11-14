
# Copyright 2015, Hewlett-Packard Development Company, L.P.
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
"""API for the network abstraction APIs.
"""
import time

from django.conf import settings
from django.utils import http as utils_http
from django.views import generic

from easystack_dashboard import api
from easystack_dashboard.api import base
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils

from easystack_dashboard.utils import filters

QOSRULES = getattr(settings, 'FLOATING_IP_QOS_RULES', {
    'INTERNET': {
        'name': 'internet',
        'bandwidthMin': 1,
        'bandwidthMax': 30
    },
    'INTRANET': {
        'name': 'intranet',
        'bandwidthMin': 800,
        'bandwidthMax': 800
    }
})

QOSENABLED = getattr(settings, 'FLOATING_IP_QOS_RULES_ENABLED', False)

@urls.register
class QosRules(generic.View):
    """API to fetch floating ip bandwidth settings
    from local_setting
    """
    url_regex = r'network/qosrules/$'

    @rest_utils.ajax()
    def get(self, request):
        if not QOSENABLED:
            raise rest_utils.AjaxError(400, 'QoS rules not enabled')
        return QOSRULES


@urls.register
class SecurityGroups(generic.View):
    """API for Network Abstraction

    Handles differences between Nova and Neutron.
    """
    url_regex = r'network/securitygroups/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of security groups.

        The listing result is an object with property "items". Each item is
        an image.

        Example GET:
        http://localhost/api/network/securitygroups
        """

        security_groups = api.network.security_group_list(request)

        return {'items': [sg.to_dict() for sg in security_groups]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a security group.

        Create a security group using the parameters supplied in the POST
        application/json object. The parameters are:

        :param name: the name to give the security group
        :param description: (optional) a security group description

        This returns the new security group object on success.
        """
        new = api.network.security_group_create(request, request.DATA['name'], request.DATA['desc'])
        return rest_utils.CreatedResponse(
            '/api/network/securitygroups/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


@urls.register
class SecurityGroup(generic.View):

    url_regex = r'network/securitygroups/(?P<sg_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, sg_id):
        """Get a specific security group

        http://localhost/api/network/securitygroups/1
        """
        sg = api.network.security_group_get(request, sg_id).to_dict()
        rest_utils.ensure_remote_group_name(request, sg)
        return sg

    @rest_utils.ajax()
    def delete(self, request, sg_id):
        """Delete a single security group by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.network.security_group_delete(request, sg_id)
        return sg_id

    @rest_utils.ajax(data_required=True)
    def patch(self, request, sg_id):
        new = api.network.security_group_update(
            request,
            sg_id,
            name=request.DATA.get('name'),
            desc=request.DATA.get('desc'))
        return rest_utils.CreatedResponse(
            '/api/network/securitygroups/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def post(self, request, sg_id):
        """Create a security group rule.

        Create a security group rule using the parameters supplied in the POST
        application/json object. The parameters are:

        :param direction: 'ingress' or 'egress'
        :param ethertype: 'IPv4' or 'IPv6'
        :param ip_protocol: 'tcp','udp','icmp'....
        :param from_port: '123'
        :param to_port: '123'
        :param cidr: 'x.x.x.x/x'
        :param security_group:


        This returns the new security group object on success.
        """
        new = api.network.security_group_rule_create(
            request,
            filters.get_int_or_uuid(sg_id),
            request.DATA['direction'],
            'IPv4',
            request.DATA['ip_protocol'],
            request.DATA['from_port'],
            request.DATA['to_port'],
            request.DATA['cidr'],
            request.DATA['security_group'])
        return rest_utils.CreatedResponse(
            '/api/network/securitygroups/%s' % utils_http.urlquote(new.id),
            new.to_dict()
        )


@urls.register
class SecurityGroupRule(generic.View):

    url_regex = r'network/securitygrouprule/(?P<sgr_id>.+|default)$'

    @rest_utils.ajax()
    def delete(self, request, sgr_id):
        """Delete a single security group rule by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.network.security_group_rule_delete(request, sgr_id)


@urls.register
class ServerSecuritygroups(generic.View):
    """API for server security groups.
    """
    url_regex = r'network/serversecuritygroups/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.network.server_security_groups(
            request,
            instance_id=request.GET.get('server_id'))
        return {'items': [e.to_dict() for e in result]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        wanted_groups = map(filters.get_int_or_uuid,
                            request.DATA.get('new_security_group_ids'))
        api.network.server_update_security_groups(
            request,
            instance_id=request.DATA.get('server_id'),
            new_security_group_ids=wanted_groups)


@urls.register
class FloatingIPSupport(generic.View):
    """API for get floatingIP support
    """
    url_regex = r'network/floatingipSupport/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get if floatingIP is supported

        Example GET:
        http://localhost/api/network/floatingIPSupport/
        This returns the boolean type result.
        """
        floatingip_supported = api.network.floating_ip_supported(request)
        return floatingip_supported


@urls.register
class TenantFloatingIPs(generic.View):
    """"API over all floatingIPs.
    """
    url_regex = r'network/tenantfloatingips/$'

    def fips_reachable_by_instance(self, request):
        """Search floating ips that reachable by subnets of a instance

        This returns a dict:
          the key of each element is a port id
          the value of each element is all the reachable fips by the port
          such as:
            {port-1: [floating_ip,floating_ip...],
             port-2: [floating_ip,floating_ip...]}
        """
        instance_id = request.GET.get('reachable_by_instance')
        port_ids = request.GET.get('port_ids')
        # NOTE: can this filter by parameters
        floating_ip_list = api.network.tenant_floating_ip_list(request)

        # get targets and port ids
        def _get_avail_targets(instance_id):
            avail_targets = []
            targets = FloatingIPTargetsCache.list_targets_by_instance(
                                                    request, instance_id)

            for target in targets:
                # does any floating_ip bind the port, if not, that's available
                port_id = target['port_id']
                if not api.network.floating_ip_has_bound_port(
                                request, port_id, floating_ip_list):
                    avail_targets.append(target)
            return avail_targets

        # search all the floating ips that reachable by the port_id
        def _fips_reachable_by_port(port_id):
            port_id, ip_address = port_id.split('_', 1)
            port = api.neutron.port_get(request, port_id)
            fips = []
            for floating_ip in floating_ip_list:
                # ignore fip which has been associated
                if floating_ip.instance_id or floating_ip.router_id:
                    continue
                # reachable if their are subnet in the same gw_router
                if api.network.floating_ip_can_bind_port(
                                request, floating_ip, port):
                    fips.append(floating_ip.to_dict())
            return fips

        avail_targets = []
        if port_ids is None:
            avail_targets = _get_avail_targets(instance_id)
            port_ids = [target['id'] for target in avail_targets]

        fips_dict = {}
        for port_id in port_ids:
            fips_dict[port_id] = _fips_reachable_by_port(port_id)

        return {'avail_targets': avail_targets,
                'avail_floatingips': fips_dict}

    def fips_associated_by_instance(self, request):
        """Search floating ips that associated by a instance
        """
        instance_id = request.GET.get('associated_by_instance')
        # NOTE: can this filter by parameters
        floating_ip_list = api.network.tenant_floating_ip_list(request)

        associated_fips = []
        for floating_ip in floating_ip_list:
            if floating_ip.instance_id == instance_id:
                associated_fips.append(floating_ip)
        return dict(items=[fip.to_dict() for fip in associated_fips])

    def get_free_floating_ip(self, request):
        """Seach free floating ips
        """
        floating_ip_list = api.network.tenant_floating_ip_list(request)
        return dict(items=[fip.to_dict() for fip in floating_ip_list if fip.port_id == None])

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_instances_details)
    @rest_utils.patch_items_by_func(rest_utils.ensure_pools_name)
    def get(self, request):
        """List floatingips of a tenant."""
        if request.GET.get('reachable_by_instance'):
            return self.fips_reachable_by_instance(request)
        elif request.GET.get('associated_by_instance'):
            return self.fips_associated_by_instance(request)
        elif request.GET.get("isFreeFloatingIp"):
            return self.get_free_floating_ip(request)
        else:
            result = api.network.tenant_floating_ip_list(request)
            return dict(items=[d.to_dict() for d in result])

    @rest_utils.ajax(data_required=True)
    @rest_utils.patch_items_by_func(rest_utils.ensure_instance_details)
    @rest_utils.patch_item_by_func(rest_utils.ensure_pool_name)
    def post(self, request):
        """Allocate a floatingip for a tenant"""
        return api.network.tenant_floating_ip_allocate(
            request,
            pool=request.DATA.get('pool'),
            bandwidth=request.DATA.get('bandwidth')).to_dict()


@urls.register
class TenantFloatingIP(generic.View):
    """"API over one tenant floatingIP.
    """
    url_regex = r'network/tenantfloatingips/(?P<floating_ip_id>.+|default)$'

    @rest_utils.ajax()
    @rest_utils.patch_item_by_func(rest_utils.ensure_instance_details)
    @rest_utils.patch_item_by_func(rest_utils.ensure_pool_name)
    def get(self, request, floating_ip_id):
        """Get a specific floatingip

        http://localhost/api/network/tenantfloatingIPs/1
        """
        return api.network.tenant_floating_ip_get(request, floating_ip_id).to_dict()

    @rest_utils.ajax()
    def delete(self, request, floating_ip_id):
        """Release a tenant floatingip by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.network.tenant_floating_ip_release(request, floating_ip_id)


@urls.register
class FloatingIPActions(generic.View):
    """"API over one floatingIP.
    """
    url_regex = r'network/floatingips/(?P<floating_ip_id>.+|default)$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, floating_ip_id):
        """Associate a tenant floatingip to a server port by port_id.

        This method returns HTTP 204 (no content) on success.
        """
        api.network.floating_ip_associate(
            request,
            floating_ip_id,
            port_id=request.DATA.get('port_id'))
        # This operation is asynchronous for neutron and nova
        # so wait 3 secondsto make nova.servert_get return with floating IP
        #
        time.sleep(3)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, floating_ip_id):
        api.network.floating_ip_update_bandwith(
            request,
            floating_ip_id,
            bandwidth=request.DATA.get('bandwidth'))

    @rest_utils.ajax(data_required=True)
    def delete(self, request, floating_ip_id):
        """Disassociate a floatingip binded to a port.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.network.floating_ip_disassociate(
            request,
            floating_ip_id,
            port_id=request.DATA.get('port_id'))
        # This operation is asynchronous for neutron and nova
        # so wait 3 secondsto make nova.servert_get return with floating IP
        #
        time.sleep(3)


class FloatingIPTargetsCache(object):
    target_list = None
    target_map = {}

    @staticmethod
    def floating_ip_targets_cache(cache, request, refresh=False):
        # TODO(lzm): cache the target_list (bug: #EAS-527)
        refresh = True
        if cache.target_list is None or refresh:
            cache.target_list = api.network.floating_ip_target_list(request)

            cache.target_map = {}
            for target in cache.target_list:
                cache.target_map[target['id']] = target

        return cache.target_list

    @classmethod
    def list_targets(cls, request, refresh=False):
        return cls.floating_ip_targets_cache(cls, request, refresh)

    @classmethod
    def refresh_targets(cls, request, port_id=None):
        """Refresh the cached targets
        when any instance's port is updated, this needs to be refresh
        """
        return cls.floating_ip_targets_cache(cls, request, True)

    @classmethod
    def get_target(cls, target_id):
        """Get cached target by id"""
        return cls.target_map.get(target_id)

    @classmethod
    def list_targets_by_instance(cls, request, instance_id):
        target_list = cls.list_targets(request)
        target_ids = api.network.floating_ip_target_list_by_instance(
                                        request, instance_id, target_list)
        targets = [cls.get_target(target_id).to_dict()
                   for target_id in target_ids]
        return targets


@urls.register
class FloatingIPTargets(generic.View):
    """"API for list floatingIP associate targets.
    """
    url_regex = r'network/floatingiptargets/$'
    @rest_utils.ajax()
    def get(self, request):
        """Get server list for floatingIP association
        """
        target_list = FloatingIPTargetsCache.refresh_targets(request)
        return {'items': [target.to_dict() for target in target_list]}


@urls.register
class FloatingIPTargetsByInstance(generic.View):
    """"API for list floatingIP associate targets by instances.
    """
    url_regex = r'network/floatingiptargets/(?P<instance_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, instance_id):
        """Get floating list for floatingIP association
        """
        targets = FloatingIPTargetsCache.list_targets_by_instance(request,
                                                                  instance_id)
        return {'items': targets}


@urls.register
class FloatingIPPools(generic.View):
    """"API for list floatingIP pools
    """
    url_regex = r'network/floatingippools/$'

    def filter_dedicated_networks(request, networks):
        def network_is_dedicated(request, network):
            print network
            phy_network = network.get('provider:physical_network')
            if phy_network:
                return phy_network.startswith('dedicated')
            return False

        if api.keystone.is_dedicated_context(request):
            for net in networks:
                tmp = net['name'].split('_')
                if len(tmp) > 5:
                    net['name'] = ("%s_%s_%s_%s") % \
                                  (tmp[0], tmp[1], tmp[4], tmp[5])
                else:
                    net['name'] = ("%s_%s_%s") % \
                                  (tmp[0], tmp[1], tmp[4])
            return networks
        return [net for net in networks
                if not network_is_dedicated(request, net)]

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(filter_dedicated_networks)
    def get(self, request):
        """Get floating ip pool list
        """
        filter = {}
        if api.keystone.is_dedicated_context(request):
            filter['tenant_id'] = request.user.project_id
        result = api.network.floating_ip_pools_list(request, **filter)
        return {'items': [item.to_dict() for item in result]}
