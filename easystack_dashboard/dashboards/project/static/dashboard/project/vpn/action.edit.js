/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit IKEpolicy modal dialog.
   * On submit, edit IKEpolicy and display a success message.
   * On cancel, do nothing.
   */
  .factory('IKEpolicyEditAction',
       ['horizon.openstack-service-api.vpn',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(vpnAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit IKE Policy'),
      submit: gettext('Save'),
      success: gettext('IKE Policy %s was successfully updated.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'ikepolicies-form',
        controller: 'ikepoliciesFormCtrl',
        windowClass: 'ikepoliciesListContent lg-window',
        backdrop: backDrop,
        resolve: {
          ikepolicy: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      // open up the edit form
      self.open = function(ikepolicy) {
        var clone = angular.copy(ikepolicy[0]);
        option.resolve.ikepolicy = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(ikepolicy[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(ikepolicy) {
        return {
            'ikepolicy':
            {
             'name': ikepolicy.name,
             'description': ikepolicy.description,
             'auth_algorithm': ikepolicy.auth_algorithm,
             'encryption_algorithm': ikepolicy.encryption_algorithm,
             'ike_version': ikepolicy.ike_version,
             'lifetime': {
                 'units': ikepolicy.lifetime.units,
                 'value': ikepolicy.lifetime.value
             },
             'pfs': ikepolicy.pfs,
             'phase1_negotiation_mode':ikepolicy.phase1_negotiation_mode
          }
        };
      };

      // submit this action to api
      // and update IKEpolicy object on success
      self.submit = function(ikepolicy, clone) {
        var ikepolicy_id =  ikepolicy.id;
        var cleanedIkepolicy = self.clean(clone);
        vpnAPI.editIKEpolicy(ikepolicy_id, cleanedIkepolicy)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(ikepolicy, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }])
  .factory('IPSecpolicyEditAction',
       ['horizon.openstack-service-api.vpn',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(vpnAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit IPSec Policy'),
      submit: gettext('Save'),
      success: gettext('IPSec Policy %s was successfully updated.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'ipsecpolicies-form',
        controller: 'ipsecpoliciesFormCtrl',
        windowClass: 'ipsecpoliciesListContent lg-window',
        backdrop: backDrop,
        resolve: {
          ipsecpolicy: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      // open up the edit form
      self.open = function(ipsecpolicy) {
        var clone = angular.copy(ipsecpolicy[0]);
        option.resolve.ipsecpolicy = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(ipsecpolicy[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(ipsecpolicy) {
        return {
            'ipsecpolicy':
            {
             'name': ipsecpolicy.name,
             'description': ipsecpolicy.description,
             'auth_algorithm': ipsecpolicy.auth_algorithm,
             'encapsulation_mode': ipsecpolicy.encapsulation_mode,
             'encryption_algorithm': ipsecpolicy.encryption_algorithm,
             'lifetime': {
                 'units': ipsecpolicy.lifetime.units,
                 'value': ipsecpolicy.lifetime.value
             },
             'pfs': ipsecpolicy.pfs,
             'transform_protocol':ipsecpolicy.transform_protocol
          }
        };
      };

      // submit this action to api
      // and update ipsecpolicy object on success
      self.submit = function(ipsecpolicy, clone) {
        var ipsecpolicy_id =  ipsecpolicy.id;
        var cleanedIPSecpolicy = self.clean(clone);
        vpnAPI.editIPSecPolicy(ipsecpolicy_id, cleanedIPSecpolicy)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(ipsecpolicy, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }])
  .factory('vpnServiceEditAction',
       ['horizon.openstack-service-api.vpn',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(vpnAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit VPN Service'),
      submit: gettext('Save'),
      success: gettext('VPN Service %s was successfully updated.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'vpnservices-form',
        controller: 'vpnservicesFormCtrl',
        windowClass: 'vpnservicesListContent',
        backdrop: backDrop,
        resolve: {
          vpnservice: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      // open up the edit form
      self.open = function(vpnservice) {
        var clone = angular.copy(vpnservice[0]);
        option.resolve.vpnservice = function(){ return clone; };
        clone.admin_state_up = clone.admin_state_up.toString();
        modal.open(option).result.then(function(clone){
          self.submit(vpnservice[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(vpnservice) {
        return {
            'vpnservice':
            {
             'name': vpnservice.name,
             'description': vpnservice.description,
             'admin_state_up': vpnservice.admin_state_up
          }
        };
      };

      // submit this action to api
      // and update vpnservice object on success
      self.submit = function(vpnservice, clone) {
        var vpnservice_id =  vpnservice.id;
        var cleanedvpnService = self.clean(clone);
        vpnAPI.editVPNService(vpnservice_id, cleanedvpnService)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(vpnservice, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }])
  .factory('ipsecSiteconnEditAction',
       ['horizon.openstack-service-api.vpn',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(vpnAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit IPSec Site Connection'),
      submit: gettext('Save'),
      success: gettext('IPSec Site Connection %s was successfully updated.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'ipsecsiteconns-form',
        controller: 'ipsecsiteconnsFormCtrl',
        windowClass: 'lg-window ipsecsiteconnsListContent',
        backdrop: backDrop,
        resolve: {
          ipsecsiteconn: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      // open up the edit form
      self.open = function(ipsecsiteconn) {
        var clone = angular.copy(ipsecsiteconn[0]);
        option.resolve.ipsecsiteconn = function(){ return clone; };
        clone.admin_state_up = clone.admin_state_up.toString();
        modal.open(option).result.then(function(clone){
          self.submit(ipsecsiteconn[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(ipsecsiteconn) {
        return {
            'ipsec_site_connection':
            {
             'name': ipsecsiteconn.name,
             'description': ipsecsiteconn.description,
             'dpd': {
                'action': ipsecsiteconn.dpd.action,
                "interval": ipsecsiteconn.dpd.interval,
                "timeout": ipsecsiteconn.dpd.timeout
             },
            "initiator": ipsecsiteconn.initiator,
            "mtu": ipsecsiteconn.mtu,
            "peer_address": ipsecsiteconn.peer_address,
            "peer_cidrs": ipsecsiteconn.peer_cidrs,
            "peer_id": ipsecsiteconn.peer_id,
            "psk": ipsecsiteconn.psk,
            "admin_state_up": (ipsecsiteconn.admin_state_up == 'true' ? true: false)
          }
        };
      };

      // submit this action to api
      // and update ipsecsiteconn object on success
      self.submit = function(ipsecsiteconn, clone) {
        var ipsecsiteconn_id =  ipsecsiteconn.id;
        var cleanedipsecSiteconn = self.clean(clone);
        vpnAPI.editIPSecSiteConnection(ipsecsiteconn_id, cleanedipsecSiteconn)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(ipsecsiteconn, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
