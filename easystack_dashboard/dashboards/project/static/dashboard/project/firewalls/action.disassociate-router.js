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

  angular.module('hz.dashboard.project.firewalls')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit modal dialog.
   * On submit, edit and display a success message.
   * On cancel, do nothing.
   */
  .factory('disassociateRouterAction', ['horizon.openstack-service-api.fwaas', '$modal', 'backDrop',
          'horizon.framework.widgets.toast.service',
  function(fwaasAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'disassociate_router',
      title: gettext('Disassociate Routers'),
      submit:  gettext('Disassociate'),
      success: gettext('Firewall %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'firewallFormCtrl',
        backdrop:		backDrop,
        resolve: {
          firewall: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the edit form
      self.open = function(firewalls) {
        var clone = angular.copy(firewalls[0]);
        option.resolve.firewall = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(firewalls[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(firewall) {
        for(var i = 0; i< firewall.router_ids.length; i++){
          if(firewall.router_ids[i] == firewall.router_id){
            firewall.router_ids.splice(i,1);
          }
        }
        return {
          router_ids: firewall.router_ids
        };
      };

      // submit this action to api
      // and update object on success
      self.submit = function(firewalls, clone) {
        var cleaned = self.clean(clone);
        fwaasAPI.editFirewall(clone.id, cleaned)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(firewalls, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
