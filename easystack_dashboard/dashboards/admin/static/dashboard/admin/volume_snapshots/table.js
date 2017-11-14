/**
 * Copyright 2015 IBM Corp.
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

  angular.module('hz.dashboard.admin.volume_snapshots')

  /**
   * @ngdoc snapshotsVolumeCtrl
   * @ngController
   *
   * @description
   * Controller for the volume snapshot table.
   * Serve as the focal point for table actions.
   */
  .controller('adminSnapshotsVolumeCtrl', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.cinder', 'horizon.openstack-service-api.glance',
    'deleteVolumeSnapshotAction', 'editVolumeSnapshotAction', 'updateVolumeSnapshotStatusAction',
    function(
      scope, rootScope, cinderAPI, glanceAPI, DeleteAction,
      EditVolumeSnapshotAction, UpdateVolumeStatusAction) {
        var self = this;
        scope.context = {
          header: {
            name: gettext('Name'),
            describes: gettext('Description'),
            domain: gettext('Domain'),
            project: gettext('Project'),
            state: gettext('State '),
            size: gettext('Size'),
            volume_snapshot_name: gettext('Volume Name'),
            created: gettext('Created Time')
          },
          action: {
            edit: gettext('Edit'),
          },
          error: {
            api: gettext('Unable to retrieve snapshots'),
            priviledge: gettext('Insufficient privilege level to view snapshots information.')
          }
        };
      scope.volumeSnapshotStatus = {
        'available': gettext("Available"),
        'in-use': gettext("In use"),
        'error': gettext("Error"),
        'creating': gettext("Creating"),
        'error_extending': gettext("Error Extending"),
        'extending': gettext("Extending"),
        'attaching': gettext("Attaching"),
        'detaching': gettext("Detaching"),
        'deleting': gettext("Deleting"),
        'error_deleting': gettext("Error Deleting"),
        'backing-up': gettext("Backing Up"),
        'restoring-backup': gettext("Restoring Backup"),
        'error_restoring': gettext("Error Restoring")
      };
      this.reset = function() {
        scope.volumes = [];
        scope.instance_snapshot = [];
        scope.ivolumes = [];
        scope.checked = {};
        scope.selected = {};
        scope.numSelected = 0;
        scope.volumeSnapshotState = false;
        scope.disableDelete = false;
        if(scope.selectedData)
          scope.selectedData.aData = [];
      };
      this.init = function() {
        scope.actions = {
          refresh: self.refresh,
          edit: new EditVolumeSnapshotAction(scope),
          deleted: new DeleteAction(scope),
          updateVolumeStatus: new UpdateVolumeStatusAction(scope),
        };
        self.refresh();

        scope.$watch('numSelected', function(current, old) {
          if (current != old)
            self.allowMenus(scope.selectedData.aData);
        });
      };
    this.refresh = function(){
      self.reset();
      cinderAPI.getVolumeSnapshots({all_tenants: 'true'})
        .success(function(response) {
            // convert utc to local time
            if (response.items){
              angular.forEach(response.items, function(item){
                item.created_at = item.created_at.replace(/T/g, ' ');
                item.created_at = rootScope.rootblock.utc_to_local(item.created_at);
              });
            }
          scope.volumes = response.items;
          scope.volumeSnapshotState = true;
        });

      glanceAPI.getImages({image_type: 'snapshot', all_projects: true})
      .success(function(response) {
        var data = response.items;
        for(var i=0; i<data.length; i++){
          if (data[i].properties.block_device_mapping){
            var volumeinfo = eval(data[i].properties.block_device_mapping)[0];
            scope.instance_snapshot.push(volumeinfo.snapshot_id);
          }
        }
      });
    };

    this.allowMenus = function(items) {
      self.allowDelete(items);
    };

    this.allowDelete = function(items){
      scope.disableDelete = false;

      for(var i=0; i<items.length; i++){
        if((items[i].status != 'available' && items[i].status != 'error')
            || ($.inArray(items[i].id, scope.instance_snapshot) > -1
              || items[i].numberOfCreateVolume!=0)){
          scope.disableDelete = true;
          break;
        }
      }
    };

    self.pullVolumeSnapshot = function(i,action){
      var actionMethod = {
        deleting: function(){
          scope.volumes.removeId(scope.volumes[i].id);
        },
        creating: function(response){
          angular.extend(scope.volumes, response);
        }
      };
      cinderAPI.gainVolumeSnapshot(scope.volumes[i].id)
        .success(function(response) {
          actionMethod.creating(response);
        })
        .error(function(message, status_code){
          if(status_code === 404){
            actionMethod.deleting();
          }
        });
    };

    setInterval(function(){
     for(var i = 0; i < scope.volumes.length; i++){
       if(scope.volumes[i].status == 'creating' || scope.volumes[i].status == 'deleting'){
         self.pullVolumeSnapshot(i);
       }
     }
   }, 10000);
   this.init();

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Description'),
      name: 'description',
      singleton: true
    }, {
      label: gettext('Domain'),
      name: 'domain',
      singleton: true
    }, {
      label: gettext('Project'),
      name: 'tenant_name',
      singleton: true
    }, {
      label: gettext('State'),
      name: 'status',
      singleton: true,
      options: [
        { label: gettext('Available'), key: 'available' },
        { label: gettext('In use'), key: 'in-use' },
        { label: gettext('Error'), key: 'error' },
        { label: gettext('Creating'), key: 'creating' },
        { label: gettext('Error Extending'), key: 'error_extending' },
        { label: gettext('Extending'), key: 'extending' },
        { label: gettext('Attaching'), key: 'attaching' },
        { label: gettext('Detaching'), key: 'detaching' },
        { label: gettext('Deleting'), key: 'deleting' },
        { label: gettext('Error Deleting'), key: 'error_deleting' },
        { label: gettext('Backing Up'), key: 'backing-up' },
        { label: gettext('Restoring Backup'), key: 'restoring-backup' },
        { label: gettext('Error Restoring'), key: 'error_restoring' }
      ]
    }, {
      label: gettext('Size'),
      name: 'size',
      singleton: true
    }, {
      label: gettext('Volume Name'),
      name: 'volume_name',
      singleton: true
    }, {
      label: gettext('Created Time'),
      name: 'created_at',
      singleton: true
    }];

   }]);

})();
