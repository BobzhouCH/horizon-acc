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
  .factory('instanceSecurityGroupAction', ['horizon.openstack-service-api.nova', '$modal', 'backDrop',
    'horizon.openstack-service-api.security-group',
  function(novaAPI, modal, backDrop, securityGroupAPI) {

    var context = {
      mode: 'editSecurityGroups',
      title: gettext('Edit Security Groups'),
      submit:  gettext('Save'),
      success: gettext('Instance %s security groups has been updated successfully.'),
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
        templateUrl: 'security-group-form',
        controller: 'instanceFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return null; },
          context: function(){ return context; },
        },
        windowClass: 'editSecurityGroupsContent'
      };

      // open up the edit form
      self.open = function(instances) {
        var clone = angular.copy(instances[0]);
        option.resolve.instance = function(){ return clone; };
        modal.open(option).result.then(self.submit);
      };

      self.clean = function(instance) {
        var selected = instance.selectedSecurityGroups;
        var new_security_group_ids = [];
        for (var i = 0; i < selected.length; i++) {
          new_security_group_ids[i] = selected[i].id;
        }
        return {
          server_id: instance.id,
          new_security_group_ids: new_security_group_ids,
        }

      }

      // submit this action to api
      self.submit = function(instance) {
        var param = self.clean(instance);
        securityGroupAPI.updateServerSecurityGroup(param)
          .success(function() {
            var message = interpolate(context.success, ['"'+instance.name+'"']);
            securityGroupAPI.toast('success', message);

            scope.clearSelected();
          });
      };
    }

    return action;
  }]);

})();
