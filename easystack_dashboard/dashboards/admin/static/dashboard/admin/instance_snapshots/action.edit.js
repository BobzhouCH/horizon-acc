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

  angular.module('hz.dashboard.admin.instance_snapshots')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit instance snapshot modal dialog.
   * On submit, edit instance snapshot and display a success message.
   * On cancel, do nothing.
   */
  .factory('editInstanceSnapshotAdminAction',
       ['horizon.openstack-service-api.glance',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(glanceAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Instance Snapshot'),
      submit: gettext('Save'),
      success: gettext('Instance snapshot %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'instanceSnapshotFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance_snapshot: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'volumesListContent'
      };

      // open up the edit form
      self.open = function(instance_snapshot) {
        var clone = angular.copy(instance_snapshot[0]);
        option.resolve.instance_snapshot = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(instance_snapshot[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(instance_snapshot) {
        return {
          id: instance_snapshot.id,
          name: instance_snapshot.name,
          description: instance_snapshot.properties.description,
        };
      };

      // submit this action to api
      // and update instance snapshot object on success
      self.submit = function(instance_snapshot, clone) {
        var cleanedInstancesnapshot = self.clean(clone);
        glanceAPI.editImage(cleanedInstancesnapshot)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(instance_snapshot, clone);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
