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

from django.utils import http as utils_http
from django.utils.datastructures import SortedDict  # noqa
from django.views import generic

from easystack_dashboard import api
from easystack_dashboard.api.rest import utils as rest_utils

from easystack_dashboard.api.rest import urls

@urls.register
class IKEpolicies(generic.View):

    """API for Neutron Networks
    http://developer.openstack.org/api-ref-networking-v2.html
    """
    url_regex = r'vpn/ikepolicies/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of ikepolicies for a project

        The listing result is an object with property "items".  Each item is
        a network.
        """
        tenant_id = request.user.tenant_id
        ikepolicies = api.vpn.ikepolicy_list(request, tenant_id=tenant_id)
        return {'items': [u.to_dict() for u in ikepolicies]}


    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create IKEPolicy
        :param request: request context
        :param name: name for IKEPolicy
        :param description: description for IKEPolicy
        :param auth_algorithm: authorization algorithm for IKEPolicy
        :param encryption_algorithm: encryption algorithm for IKEPolicy
        :param ike_version: IKE version for IKEPolicy
        :param lifetime: Lifetime Units and Value for IKEPolicy
        :param pfs: Perfect Forward Secrecy for IKEPolicy
        :param phase1_negotiation_mode: IKE Phase1 negotiation mode for IKEPolicy
        """
        new_ikepolicy = api.vpn.ikepolicy_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/vpn/ikepolicy/%s' % new_ikepolicy.id,
            new_ikepolicy.to_dict()
        )

@urls.register
class IKEpolicy(generic.View):

    url_regex = r'vpn/ikepolicy/(?P<ikepolicy_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, ikepolicy_id):
        """Get a single

        :param request:
        :param ikepolicy_id:
        :return:
        """
        i = api.vpn.ikepolicy_get(request, ikepolicy_id).to_dict()
        if i.has_key('ipsecsiteconns'):
            i['ipsecsiteconns'] = [u.to_dict() for u in i['ipsecsiteconns']]
        return i


    @rest_utils.ajax()
    def delete(self, request, ikepolicy_id):
        """Delete a single ike policy by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            return http.HttpResponseNotFound('default')
        api.vpn.ikepolicy_delete(request, ikepolicy_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, ikepolicy_id):
        new_ikepolicy = api.vpn.ikepolicy_update(request, ikepolicy_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/vpn/ikepolicy/%s' % utils_http.urlquote(new_ikepolicy.id),
            new_ikepolicy.to_dict()
        )


@urls.register
class IPSecPolicies(generic.View):

    """API for Neutron Networks
    http://developer.openstack.org/api-ref-networking-v2.html
    """
    url_regex = r'vpn/ipsecpolicies/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of ikepolicies for a project

        The listing result is an object with property "items".  Each item is
        a network.
        """
        tenant_id = self.request.user.tenant_id
        ipsecpolicies = api.vpn.ipsecpolicy_list(request, tenant_id=tenant_id)
        return {'items': [u.to_dict() for u in ipsecpolicies]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create IPSecPolicy
        :param request: request context
        :param name: name for IPSecPolicy
        :param description: description for IPSecPolicy
        :param auth_algorithm: authorization algorithm for IPSecPolicy
        :param encapsulation_mode: encapsulation mode for IPSecPolicy
        :param encryption_algorithm: encryption algorithm for IPSecPolicy
        :param lifetime: Lifetime Units and Value for IPSecPolicy
        :param pfs: Perfect Forward Secrecy for IPSecPolicy
        :param transform_protocol: Transform Protocol for IPSecPolicy
        """
        new_ipsecpolicy = api.vpn.ipsecpolicy_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/vpn/ipsecpolicies/%s' % new_ipsecpolicy.id,
            new_ipsecpolicy.to_dict()
        )

@urls.register
class IPSecPolicy(generic.View):

    url_regex = r'vpn/ipsecpolicy/(?P<ipsecpolicy_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, ipsecpolicy_id):
        i = api.vpn.ipsecpolicy_get(request, ipsecpolicy_id).to_dict()
        if i.has_key('ipsecsiteconns'):
            i['ipsecsiteconns'] = [u.to_dict() for u in i['ipsecsiteconns']]
        return i

    @rest_utils.ajax()
    def delete(self, request, ipsecpolicy_id):
        """Delete a single ike policy by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            return http.HttpResponseNotFound('default')
        api.vpn.ipsecpolicy_delete(request, ipsecpolicy_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, ipsecpolicy_id):
        new_ipsecpolicy = api.vpn.ipsecpolicy_update(request, ipsecpolicy_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/vpn/ipsecpolicy/%s' % utils_http.urlquote(new_ipsecpolicy.id),
            new_ipsecpolicy.to_dict()
        )


@urls.register
class VPNServices(generic.View):

    """API for Neutron Networks
    http://developer.openstack.org/api-ref-networking-v2.html
    """
    url_regex = r'vpn/vpnservices/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of ikepolicies for a project

        The listing result is an object with property "items".  Each item is
        a network.
        """
        tenant_id = request.user.tenant_id
        vpnservices = api.vpn.vpnservice_list(request, tenant_id=tenant_id)
        return {'items': [u.to_dict() for u in vpnservices]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create VPNService

        :param request: request context
        :param admin_state_up: admin state (default on)
        :param name: name for VPNService
        :param description: description for VPNService
        :param router_id: router id for router of VPNService
        :param subnet_id: subnet id for subnet of VPNService
        """
        new_vpnservice = api.vpn.vpnservice_create(request, **request.DATA)
        if new_vpnservice:
            new_vpnservice = api.vpn.vpnservice_get(request, new_vpnservice['id']).to_dict()
            if new_vpnservice.has_key('ipsecsiteconns'):
                new_vpnservice['ipsecsiteconns'] = [u.to_dict() for u in new_vpnservice['ipsecsiteconns']]
            if new_vpnservice.has_key('router'):
                new_vpnservice['router_name'] =  new_vpnservice['router'].name
            if new_vpnservice.has_key('subnet'):
                new_vpnservice['subnet_name'] = new_vpnservice['subnet'].cidr
        return new_vpnservice

@urls.register
class VPNService(generic.View):

    url_regex = r'vpn/vpnservice/(?P<vpnservice_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, vpnservice_id):
        i = api.vpn.vpnservice_get(request, vpnservice_id).to_dict()
        if i.has_key('ipsecsiteconns'):
            i['ipsecsiteconns'] = [u.to_dict() for u in i['ipsecsiteconns']]
        if i.has_key('router'):
            i['router'] =  i['router'].to_dict()
        if i.has_key('subnet'):
            i['subnet'] = i['subnet'].to_dict()
        return i

    @rest_utils.ajax()
    def delete(self, request, vpnservice_id):
        if id == 'default':
            return http.HttpResponseNotFound('default')
        api.vpn.vpnservice_delete(request, vpnservice_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, vpnservice_id):
        new_vpnservice = api.vpn.vpnservice_update(request, vpnservice_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/vpn/vpnservice/%s' % utils_http.urlquote(new_vpnservice.id),
            new_vpnservice.to_dict()
        )


@urls.register
class IPSecSiteConnections(generic.View):

    """API for Neutron Networks
    http://developer.openstack.org/api-ref-networking-v2.html
    """
    url_regex = r'vpn/ipsecsiteconnections/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of ikepolicies for a project

        The listing result is an object with property "items".  Each item is
        a network.
        """
        tenant_id = self.request.user.tenant_id
        ipsecsiteconnections = api.vpn.ipsecsiteconnection_list(request, tenant_id=tenant_id)
        return {'items': [u.to_dict() for u in ipsecsiteconnections]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create IPSecSiteConnection
        :param request: request context
        :param name: name for IPSecSiteConnection
        :param description: description for IPSecSiteConnection
        :param dpd: dead peer detection action, interval and timeout
        :param ikepolicy_id: IKEPolicy associated with this connection
        :param initiator: initiator state
        :param ipsecpolicy_id: IPsecPolicy associated with this connection
        :param mtu: MTU size for the connection
        :param peer_address: Peer gateway public address
        :param peer_cidrs: remote subnet(s) in CIDR format
        :param peer_id:  Peer router identity for authentication"
        :param psk: Pre-Shared Key string
        :param vpnservice_id: VPNService associated with this connection
        :param admin_state_up: admin state (default on)
        """
        new_ipsecsiteconnection = api.vpn.ipsecsiteconnection_create(request, **request.DATA)
        i = api.vpn.ipsecsiteconnection_get(request, new_ipsecsiteconnection.id).to_dict()
        i['ikepolicy_name'] = i['ikepolicy'].name
        i['ipsecpolicy_name'] = i['ipsecpolicy'].name
        i['vpnservice_name'] = i['vpnservice'].name
        return i

@urls.register
class IPSectSiteConnection(generic.View):

    url_regex = r'vpn/ipsecsiteconnection/(?P<ipsecsiteconnection_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, ipsecsiteconnection_id):
        i = api.vpn.ipsecsiteconnection_get(request, ipsecsiteconnection_id).to_dict()
        i['ikepolicy'] = i['ikepolicy'].to_dict()
        i['ipsecpolicy'] = i['ipsecpolicy'].to_dict()
        i['vpnservice'] = i['vpnservice'].to_dict()
        return i

    @rest_utils.ajax()
    def delete(self, request, ipsecsiteconnection_id):
        if id == 'default':
            return http.HttpResponseNotFound('default')
        api.vpn.ipsecsiteconnection_delete(request, ipsecsiteconnection_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, ipsecsiteconnection_id):
        new_ipsecsiteconnection = api.vpn.ipsecsiteconnection_update(request, ipsecsiteconnection_id, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/vpn/ipsecsiteconnection/%s' % utils_http.urlquote(new_ipsecsiteconnection.id),
            new_ipsecsiteconnection.to_dict()
        )
