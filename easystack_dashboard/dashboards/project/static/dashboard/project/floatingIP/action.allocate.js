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
   * @ngDoc allocateAction
   * @ngService
   *
   * @Description
   * Brings up the allocate floatingIP modal dialog.
   * On submit, allocate a new floatingIP and display a success message.
   * On cancel, do nothing.
   */
  .factory('allocateFloatingIPAction',
      ['horizon.openstack-service-api.floatingip',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       '$modal',
       'horizon.openstack-service-api.billing',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.settings',
  function(floatingipAPI, usersettingAPI, keystoneAPI, modal, billingAPI, toastService, settingsService) {

    var context = {
      mode: 'allocate',
      title: gettext('Apply For IP To Project'),
      submit:  gettext('Allocate IP'),
      pool: gettext('Pool'),
      bandwidth: gettext('Bandwidth (Mbps)'),
      success: gettext('Floating ip %s was successfully allocate.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'floatingIPFormCtrl',
        windowClass: 'floatingIPListContent',
        resolve: {
          floatingip: function(){ return {}; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      // Default QOS_RULE = False
      self.open = function(){
        option.templateUrl = (window.WEBROOT || '') + 'project/floatingIP/form/';
        settingsService.getSetting('FLOATING_IP_QOS_RULES_ENABLED',true)
          .then(function(rule) {
            if(rule){
              settingsService.getSetting('FLOATING_IP_QOS_RULES',true)
                .then(function(lenovoQoS) {
                   option.resolve.qosRules = function(){ return lenovoQoS };
                   modal.open(option).result.then(self.submit);
                });
            }
            else{
              option.resolve.qosRules = function(){ return false };
              modal.open(option).result.then(self.submit);
            }
        });
      };

      self.submit = function(newfloatingip) {
        var params = {};
        if(newfloatingip.unit){
          params = {'pool': newfloatingip.pool.id, 'bandwidth':newfloatingip.bandwidth, 'unit': newfloatingip.unit};
        }else{
          params = {'pool': newfloatingip.pool.id, 'bandwidth':newfloatingip.bandwidth}
        }

        floatingipAPI.allocateTenantFloatingIP(params)
          .success(function(response) {
            var message = interpolate(context.success, [response.ip]);
            toastService.add('success', message);
            scope.floatingIP.push(response);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
