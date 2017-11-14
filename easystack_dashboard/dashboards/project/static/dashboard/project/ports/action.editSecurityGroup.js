/**
 * Copyright 2015 EasyStack Inc.
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

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit project modal dialog.
   * On submit, edit project and display a success message.
   * On cancel, do nothing.
   */
  .factory('PortSecurityGroupAction', ['horizon.openstack-service-api.neutron', '$modal', 'backDrop','horizon.framework.widgets.toast.service',
    'horizon.openstack-service-api.security-group',
  function(neutronAPI, modal, backDrop,toastService, securityGroupAPI) {

    var context = {
      mode: 'editSecurityGroup',
      title: gettext('Edit Security Groups'),
      submit:  gettext('Save'),
      success: gettext('Inteface %s security groups has been updated successfully.'),
      header: {
        action: gettext('Action'),
        securityGroupsForSelection: gettext('Security Groups'),
        selectedSecurityGroups: gettext('Security Groups'),
        roles: gettext('Roles'),
      },
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'port-security-group',
        controller: 'portFormCtrl',
        backdrop: backDrop,
        resolve: {
          port: function(){ return null; },
          context: function(){ return context; },
        },
        windowClass: 'editSecurityGroupsContent'
      };

      // open up the edit form
      self.open = function(port) {
        var clone = angular.copy(port[0]);
        option.resolve.port = function(){ return clone; };
        modal.open(option).result.then(function(newPort){
          self.submit(port[0], newPort);
        });
      };

      self.clean = function(port) {
        var selected = port.selectedSecurityGroups;
        var new_security_group_ids = [];
        for (var i = 0; i < selected.length; i++) {
          new_security_group_ids[i] = selected[i].id;
        }
        return {
          security_groups: new_security_group_ids,
        }

      };

      // submit this action to api
      self.submit = function(port, newPort) {
        var param = self.clean(newPort);
        neutronAPI.editPort(port.id, param)
          .success(function (response) {
            var message = interpolate(context.success, [port.name]);
            toastService.add('success', message);
              self.updatePort(port);
              scope.$table.resetSelected();
          });
      };

      self.updatePort = function(port) {
         neutronAPI.getPort(port.id)
           .success(function(response) {
               angular.extend(port, response);
           });
      };
    }

    return action;
  }]);

})();
