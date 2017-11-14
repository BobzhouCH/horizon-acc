/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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

  angular.module('hz.dashboard.project.floatingIP')

  /**
   * @ngDoc disassociateAction
   * @ngService
   *
   * @Description
   * Brings up the disassociate confirmation modal dialog.
   * On submit, disassociate selected floatingIP.
   * On cancel, do nothing.
   */
  .factory('disassociateAction',
      ['horizon.openstack-service-api.floatingip',
        'horizon.openstack-service-api.neutron',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(floatingipAPI, neutronAPI, smodal, toastService) {
    var context = {
      title: gettext('Confirm disassociate floating ip'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection. Disassociate action will disconnect the resource network.'),
      submit: gettext('Disassociate'),
      success: gettext('Disassociated Floating ips: %s.')
    };

    function action(scope) {

      var self = this;

      self.open = function(floatingips) {
        self.confirmDisassociate(floatingips[0]);
      };

      // brings up the confirmation dialog
      self.confirmDisassociate = function(floatingip) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [floatingip.floating_ip_address]),
          submit: context.submit
        };
        smodal.modal(options).result.then(function(){
          self.submit(floatingip);
        });
      };

      self.submit = function(floatingip) {
        if (floatingip.fixed_ip_address){
          self.disassociateInst(floatingip);
        }else{
          self.disassociateRouter(floatingip);
        }
      };

      function clearFloatingIpPort(floatingip){
        floatingip.port_id = null;
        floatingip.instance_type = null;
        floatingip.instance_name = null;
        floatingip.instance_id = null;
      }

      self.disassociateInst = function(floatingip) {
        var params = {
          floatingip_id: floatingip.id,
          port_id: null
        };

        floatingipAPI.disassociateFloatingIP(floatingip.id, params)
          .success(function() {
            var message = interpolate(context.success, [floatingip.floating_ip_address]);
            toastService.add('success', message);
            scope.$table.resetSelected();
            clearFloatingIpPort(floatingip);
          });
      };

      self.disassociateRouter = function(floatingip) {
        neutronAPI.removegatewayRouter(floatingip.router_id)
          .success(function() {
            var message = interpolate(context.success, [floatingip.floating_ip_address]);
            toastService.add('success', message);
            scope.$table.resetSelected();
            clearFloatingIpPort(floatingip);
          });
      };
    }

    return action;

  }]);

})();
