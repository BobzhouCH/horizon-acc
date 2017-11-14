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
  .factory('clearGatewayAction', ['horizon.openstack-service-api.keystone','horizon.openstack-service-api.neutron',
                                  'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(keystoneAPI, neutronAPI, smodal, toastService) {

    var context = {
      title: gettext('Clear Router Gateway'),
      message: gettext('You have selected %s to clear.'),
      tips: gettext('Please confirm your selection. Clear Gateway action will let network connected to router can not access external network.'),
      submit:  gettext('Clear'),
      success: gettext('Gateway %s has been clear successfully.'),
      mode: 'clearGateway'
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;

      // request unset-gateway
      this.doUnset = function(routers, names) {
        var router = routers[0];
        // we modify a cloned object and give that to the api
        // if api confirms it, then we update the real model
        neutronAPI.removegatewayRouter(router.id).success(function() {
           neutronAPI.getRouter(router.id)
             .success(function(response){
                 var message = interpolate(context.success, [response.items.name]);
                 toastService.add('success', message);
               var newRouter = response.items;
               newRouter.external_gateway = "-";
               angular.extend(router, newRouter);
             });

             scope.$table.resetSelected();
        });
      };

      // Unset a single Gateway
      self.singleUnset = function(router) {
        self.confirmUnset([router], [router.name]);
      };

      // Unset some Gateway
      self.batchUnset = function() {
        var routers = [];
        var names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              var router = row.item;
              routers.push(router);
              names.push(router.name);
            }
        });
        self.confirmUnset(routers, names);
      };

      // brings up the confirmation dialog
      self.confirmUnset = function(routers, names) {
        var namelist = names.join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [namelist]),
          submit: context.submit,
        };
        smodal.modal(options).result.then(function(){
          self.doUnset(routers, names);
        });
      };
    }

    return action;

  }]);

})();
