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
   * @ngDoc associateFloatingRouterAction
   * @ngService
   *
   * @Description
   * Brings up the associate router modal dialog.
   * On submit, associate a new router and display a success message.
   * On cancel, do nothing.
   */
  .factory('associateFloatingIPRouterAction',
      ['horizon.openstack-service-api.neutron',
        'horizon.openstack-service-api.floatingip',
       '$modal',
       'horizon.framework.widgets.toast.service',
  function(neutronAPI, floatingipAPI, modal, toastService) {

    var context = {
      mode: 'associate-router',
      title: gettext('Associate With Router'),
      submit:  gettext('Associate'),
      success: gettext('Floating ip %s was associated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'associate',
        controller: 'floatingIPFormCtrl',
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
        modal.open(option).result.then(function(clone){
          self.submit(floatingips[0], clone);
        });
      };

      self.submit = function(floatingip, newfloatingip) {
        var params = {
          'network_id': newfloatingip.floating_network_id,
          'ip_addresses':newfloatingip.floating_ip_address
        };
        neutronAPI.addgatewayRouter(newfloatingip.router, params)
          .success(function() {
            var message = interpolate(context.success, [newfloatingip.floating_ip_address]);
            toastService.add('success', message);
            scope.$table.resetSelected();
            floatingipAPI.getFloatingIP(newfloatingip.id).success(function(data){
              angular.extend(floatingip, data);
            });
          });
      };
    }

    return action;
  }]);

})();
