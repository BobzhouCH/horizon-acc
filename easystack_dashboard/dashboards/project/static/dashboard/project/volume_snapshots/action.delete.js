/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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

  angular.module('hz.dashboard.project.volume_snapshots')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('deleteVolumeSnapshotAction',
      ['horizon.openstack-service-api.cinder',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.cinder',
  function(cinderAPI, smodal, toastService, cinder) {

    var context = {
      title: gettext('Delete Volume Snapshot'),
      message: gettext('The amount of volume snapshots these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Volume Snapshot'),
      success: gettext('Deleted Volume Snapshot: %s.'),
      error: gettext('Deleted Volume Snapshot: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single snapshot object
      self.singleDelete = function(snapshot) {
        self.confirmDelete([snapshot.id], [snapshot.name]);
      };

      // delete selected snapshot objects
      // action requires the snapshot to select rows
      self.batchDelete = function() {
        var snapshots = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              snapshots.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(snapshots, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(snapshots, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: snapshots,
          imgOwner: 'volume_snapshot'
        };
        smodal.modal(options).result.then(function(){
          self.submit(snapshots);
        });
      };

      // on success, remove the snapshots from the model
      // need to also remove deleted snapshots from selected list
      self.submit = function(snapshots) {
        for (var n = 0; n < snapshots.length; n++) {
          self.deletevolumeSnapshot(snapshots[n]);
        };
         scope.$table.resetSelected();
      };
      self.deletevolumeSnapshot = function (snapshot) {
        cinderAPI.deleteVolumeSnapshot(snapshot.id)
           .success(function () {
              var message = interpolate(context.success, [snapshot.name]);
              toastService.add('success', message);
              delete scope.selected[snapshot.id];
              cinder.gainVolumeSnapshot(snapshot.id)
                .success(function(response) {
                  angular.extend(snapshot, response);
                })
                .error(function(message, status_code){
                  if(status_code === 404){
                    scope.volumes.removeId(snapshot.id);
                  }
                });
            })
            .error(function (message, status_code) {
              if (status_code == 409){
                toastService.add('error', gettext('Unable to delete in use volume snapshot.'));
              }
              else {
                toastService.add('error', gettext('Unable to delete volume snapshot.'));
              }

            });
      };
    }

    return action;

  }]);

})();