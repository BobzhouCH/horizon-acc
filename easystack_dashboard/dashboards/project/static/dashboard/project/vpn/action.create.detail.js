/**
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

   angular.module('hz.dashboard.project.vpn')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('createikepolicyDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
  function(keystoneAPI, modal, backdrop) {

    var context = {
      "mode": 'create',
      "title": 				gettext('Detail'),
      "detail_overview": 	gettext("Detail Overview"),
      "id": 				gettext("ID"),
      "properties": 		gettext("Basic Properties"),
      "description"  : gettext("Description"),
      "ike_version": gettext("IKE version"),
      "lifetime_units": gettext("Lifetime units for IKE keys"),
      "lifetime_value": gettext("Lifetime value for IKE keys"),
      'phase1_negotiation_mode': gettext("Perfect Forward Secrecy")
    };

    var ctrl = {
          'active': gettext("Active"),
          'saving': gettext("Saving"),
          'queued': gettext("Queued"),
          'pending_delete': gettext("Pending Delete"),
          'killed': gettext("Killed"),
          'deleted': gettext("Deleted")
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'ikepolicy-detail',
        controller: 'ikepolicyDetailForm',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(ikepolicy_id){
        option.resolve.detail = function(){ return { "ikepolicy_id": ikepolicy_id }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/vpn/ikepolicy-detail/';
        modal.open(option);
      };

    }

    return action;
  }])
  .factory('createipsecpolicyDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
  function(keystoneAPI, modal, backdrop) {

    var context = {
      "mode": 'create',
      "title": 				gettext('Detail'),
      "detail_overview": 	gettext("Detail Overview"),
      "id": 				gettext("ID"),
      "properties": 		gettext("Basic Properties"),
      "description"  : gettext("Description"),
      "encapsulation_mode": gettext("Encapsulation mode"),
      "lifetime_units": gettext("Lifetime units"),
      "lifetime_value": gettext("Lifetime value for IKE keys"),
      'phase1_negotiation_mode': gettext("Perfect Forward Secrecy"),
      'transform_protocol':gettext('Transform Protocol')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'ipsecpolicy-detail',
        controller: 'ipsecpolicyDetailForm',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; }
        }
      };

      self.open = function(ipsecpolicy_id){
        option.resolve.detail = function(){ return { "ipsecpolicy_id": ipsecpolicy_id }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/vpn/ipsecpolicy-detail/';
        modal.open(option);
      };

    }

    return action;
  }])
  .factory('createvpnServiceDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
  function(keystoneAPI, modal, backdrop) {

    var context = {
      "mode": 'create',
      "title": 				gettext('Detail'),
      "detail_overview": 	gettext("Detail Overview"),
      "id": 				gettext("ID"),
      "properties": 		gettext("Basic Properties"),
      "description"  : gettext("Description"),
      "local_ips": gettext("Local Side Public IPs"),
      "subnet_name": gettext("Subnet"),
      "router_name": gettext("Router"),
      'status': gettext("Status"),
      'admin_state_up': gettext("Admin State"),
      'external_v4_ip': gettext('IPv4:'),
      'external_v6_ip': gettext('IPv6:')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'vpnservice-detail',
        controller: 'vpnserviceDetailForm',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
        }
      };

      self.open = function(vpnservice_id){
        option.resolve.detail = function(){ return { "vpnservice_id": vpnservice_id }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/vpn/vpnservice-detail/';
        modal.open(option);
      };
    }

    return action;
  }])
  .factory('createipsecSiteconnDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
  function(keystoneAPI, modal, backdrop) {

    var context = {
      "mode": 'create',
      "title": 				gettext('Detail'),
      "detail_overview": 	gettext("Detail Overview"),
      "id": 				gettext("ID"),
      "properties": 		gettext("Basic Properties"),
      "description"  : gettext("Description"),
      "vpnsname_or_id": gettext("VPN Service"),
      "ikep_name_or_id": gettext("IKE Policy"),
      "ipsecp_name_or_id": gettext("IPSec Policy"),
      'peer_address': gettext("Peer gateway public IPv4 Address or FQDN"),
      'peer_id': gettext("Peer router identity for authentication (Peer ID)"),
      'peer_cidrs': gettext('Remote peer subnet'),
      'psk': gettext('Pre-Shared Key (PSK) string'),
      'mtu': gettext('Maximum Transmission Unit size for the connection'),
      'initiator': gettext('Initiator state'),
      'dpd_action': gettext('Dead peer detection action'),
      'dpd_interval': gettext('Dead peer detection interval'),
      'dpd_timeout': gettext('Dead peer detection timeout'),
      'auth_mode': gettext('Authorization mode'),
      'route_mode': gettext('Route mode'),
      'admin_state_up': gettext('Admin State'),
      'status': gettext('Status')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'ipsecsiteconn-detail',
        controller: 'ipsecsiteconnDetailForm',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; }
        }
      };

      self.open = function(ipsecsiteconn_id){
        option.resolve.detail = function(){ return { "ipsecsiteconn_id": ipsecsiteconn_id }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/vpn/ipsecsiteconn-detail/';
        modal.open(option);
      };
    }

    return action;
  }]);

})();