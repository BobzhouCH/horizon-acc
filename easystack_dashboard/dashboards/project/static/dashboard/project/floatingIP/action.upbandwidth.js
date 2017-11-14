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

  angular.module('hz.dashboard.project.floatingIP')

  /**
   * @ngDoc update bandwidth Action
   * @ngService
   *
   * @Description
   * Brings up the update floatingIP bandwidth modal dialog.
   * On submit, update floatingIP bandwidth and display a success message.
   * On cancel, do nothing.
   */
  .factory('updateBandwidthAction',[
        'horizon.openstack-service-api.floatingip',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
        'horizon.openstack-service-api.settings',
  function(floatingipAPI, modal, backDrop, toastService, settingsService) {

    var context = {
      mode: 'bandwidth',
      title: gettext('Update Bandwidth'),
      submit:  gettext('Confirm'),
      upbandwidth: gettext('Update Bandwidth'),
      success: gettext('Floating ip bandwidth was successfully update to %s Mbps.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'floatingIPFormCtrl',
        backdrop:   backDrop,
        windowClass: 'floatingIPListContent',
        resolve: {
          floatingip: function(){ return {}; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      self.open = function(floatingips){

        var clone = angular.copy(floatingips[0]);
        option.resolve.floatingip = function(){ return clone; };

         // Default QOS_RULE = False
         settingsService.getSetting('FLOATING_IP_QOS_RULES_ENABLED',true)
          .then(function(rule) {
            if(rule){
              settingsService.getSetting('FLOATING_IP_QOS_RULES',true)
                .then(function(lenovoQoS) {
                    option.resolve.qosRules = function() { return lenovoQoS; };
                    modal.open(option).result.then(function(clone){
                      self.submit(floatingips[0], clone);
                    });
                });
            }
            else{
              option.resolve.qosRules = function() { return false; };
              modal.open(option).result.then(function(clone){
                self.submit(floatingips[0], clone);
              });
            }
         });
      };

       self.clean = function(floatingip) {
        return {
          bandwidth: floatingip.bandwidth,
          id: floatingip.id,
          name: floatingip.name,
          description: floatingip.description
        };
      };

      self.submit = function(floatingip, clone) {

        var cleanedFloatingip = self.clean(clone);
        floatingipAPI.updateFloatingIP(floatingip.id, cleanedFloatingip)
          .success(function() {
            var message = interpolate(context.success, [cleanedFloatingip.bandwidth]);
            toastService.add('success', message);
            angular.extend(floatingip, clone);
            scope.$table.resetSelected();

          });
      };
    }

    return action;
  }]);

})();
