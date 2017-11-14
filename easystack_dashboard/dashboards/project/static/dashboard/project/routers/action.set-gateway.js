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

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc enableAction
   * @ngService
   *
   * @Description
   * Allow admin to enable or disable a router.
   */
  .factory('setGatewayAction', ['horizon.openstack-service-api.keystone','horizon.openstack-service-api.neutron','$modal',
          'horizon.framework.widgets.toast.service',
  function(keystoneAPI, neutronAPI, modal, toastService) {

    var context = {
      title: gettext('Set Router Gateway'),
      submit:  gettext('Set'),
      success: gettext('Gateway %s has been set successfully.'),
      mode: 'setGateway'
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'routerFormCtrl',
        resolve: {
          router: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the set-gateway form
      self.open = function(router) {
        var clone = angular.copy(router[0]);
        option.resolve.router = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(router[0], clone);
        });
      };

      // edit form modifies name, email, and project
      // send only what is required
      self.clean = function(router) {
        return {
          network_id: JSON.parse(router.items).pool.id,
          ip_addresses: JSON.parse(router.items).floating_ip_address
        };
      };
      // submit this action to api
      // and update router object on success
      self.submit = function(router, clone) {
        var cleanedRouter = self.clean(clone);
        neutronAPI.addgatewayRouter(clone.id, cleanedRouter)
          .success(function(response) {
            var message = interpolate(context.success, [cleanedRouter.ip_addresses]);
            toastService.add('success', message);
            neutronAPI.getRouter(clone.id)
              .success(function(response){
                var newRouter = response.items;
                newRouter.external_gateway = newRouter.external_gateway_info.network + " (" + newRouter.external_gateway_info.external_fixed_ips[0].ip_address + ")";
                angular.extend(router, newRouter);
              });

            scope.$table.resetSelected();
          });
      };
    }

    return action;

  }]);

})();
