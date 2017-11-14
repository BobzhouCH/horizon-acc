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

  angular.module('hz.dashboard.project.volumes')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit volume modal dialog.
   * On submit, edit volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('createVolumeSnapshotAction', ['horizon.openstack-service-api.cinder', '$modal', 'backDrop',
                                         'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create_snapshot',
      title: gettext('Create Volume Snapshot'),
      submit:  gettext('Create'),
      success: gettext('Volume Snapshot %s has been created successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'snapshotform',
        controller: 'volumeFormCtrl',
        backdrop: backDrop,
        resolve: {
          volume: function(){return {};},
          context: function(){ return context; },
          qosRules: function() { return {}; },
        },
        windowClass: 'volumesListContent'
      };

      // open up the edit form
      self.open = function(tabledata) {
        modal.open(option).result.then(function(volume){
          self.submit(tabledata[0], volume);
        });
      };

      self.clean = function(volume) {
        if(volume.unit){
          return {
            name: volume.snapshot_name,
            description: volume.description,
            force: false,
            unit:volume.unit
          };
        }else{

          return {
            name: volume.snapshot_name,
            description: volume.description,
            force: false,
          }
        }

      };

      // submit this action to api
      // and update volume object on success
      self.submit = function(volume, clone) {
        var cleanedSnapshot = self.clean(clone);
        cinderAPI.createVolumeSnapshot(volume.id, cleanedSnapshot)
          .success(function(data) {
            var message = interpolate(context.success, [cleanedSnapshot.name]);
            toastService.add('success', gettext(message));
            if(scope.selectedData.aData[0].snapshots){
                scope.selectedData.aData[0].snapshots.push(data);
            }else{
                scope.selectedData.aData[0].snapshots=[];
                scope.selectedData.aData[0].snapshots.push(data);
            }
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
