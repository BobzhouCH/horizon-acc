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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit router modal dialog.
   * On submit, edit router and display a success message.
   * On cancel, do nothing.
   */
  .factory('associateFirewallAction', ['horizon.openstack-service-api.neutron', '$modal', 'backDrop',
          'horizon.dashboard.router.Path', 'horizon.framework.widgets.toast.service','horizon.openstack-service-api.fwaas',
  function(neutronAPI, modal, backDrop, path, toastService, fwaasAPI) {

    var context = {
      mode: 'associate_firewall',
      title: gettext('Associate Firewall'),
      submit:  gettext('Associate'),
      success: gettext('Router %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: path + 'form',
        controller: 'routerFormCtrl',
        backdrop: backDrop,
        resolve: {
          router: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the edit form
      self.open = function(router) {
        var clone = angular.copy(router[0]);
        option.resolve.router = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(router[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(clone, firewall) {
        firewall.router_ids.push(clone.id);
        return{
         router_ids: firewall.router_ids
        }
      };

      // submit this action to api
      // and update router object on success
      self.submit = function(router, clone) {
        //get firewall by id in order to get routers associate with firewall
        fwaasAPI.getFirewall(clone.firewall_id).success(function(response){
          var firewall = response;
          var cleaned = self.clean(clone, firewall);
          fwaasAPI.editFirewall(firewall.id, cleaned)
              .success(function (response) {
                var message = interpolate(context.success, [clone.name]);
                toastService.add('success', message);
                if(scope.updateFirewallDetail){
                  scope.updateFirewallDetail(router)
                }else {
                  scope.updateRouter(router);
                  scope.$table.resetSelected();
                }
              });
        })
      };
    }

    return action;
  }]);

})();
