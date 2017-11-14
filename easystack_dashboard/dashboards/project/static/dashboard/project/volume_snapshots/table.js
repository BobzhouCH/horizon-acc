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

  angular.module('hz.dashboard.project.volume_snapshots')

  /**
   * @ngdoc snapshotsVolumeCtrl
   * @ngController
   *
   * @description
   * Controller for the volume snapshot table.
   * Serve as the focal point for table actions.
   */
  .controller('snapshotsVolumeCtrl', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.cinder', 'horizon.openstack-service-api.glance',
    'createSnapshotVolumeAction', 'deleteVolumeSnapshotAction','editVolumeSnapshotAction',
    function(
      scope, rootScope, cinder, glanceAPI, CreateAction,
      DeleteAction, EditVolumeSnapshotAction) {
        var self = this;
        scope.context = {
          header: {
          name: gettext('Name'),
          describes: gettext('Description'),
          state: gettext('State '),
          size: gettext('Size'),
          volume_name: gettext('Volume Name'),
          created: gettext('Created Time')
          },
        action: {
          edit: gettext('Edit'),
          created: gettext('Created'),
          deleted: gettext('Delete')
          },
        error: {
          api: 	gettext('Unable to retrieve snapshots'),
          priviledge: gettext('Insufficient privilege level to view snapshots information.')
          }
        };
      scope.volumesnapshotStatus = {
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
      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Description'),
        name: 'description',
        singleton: true
      }, {
        label: gettext('Status'),
        name: 'status',
        singleton: true,
        options: [
          { label: scope.volumesnapshotStatus.available, key: 'Available' },
          { label: scope.volumesnapshotStatus['in-use'], key: 'In use' },
          { label: scope.volumesnapshotStatus.error, key: 'Error' },
          { label: scope.volumesnapshotStatus.creating, key: 'Creating' },
          { label: scope.volumesnapshotStatus.error_extending, key: 'Error Extending' },
          { label: scope.volumesnapshotStatus.extending, key: 'Extending' },
          { label: scope.volumesnapshotStatus.attaching, key: 'Attaching' },
          { label: scope.volumesnapshotStatus.detaching, key: 'Detaching' },
          { label: scope.volumesnapshotStatus.deleting, key: 'Deleting' },
          { label: scope.volumesnapshotStatus.error_deleting, key: 'Error Deleting' },
          { label: scope.volumesnapshotStatus['backing-up'], key: 'Backing Up' },
          { label: scope.volumesnapshotStatus['restoring-backup'], key: 'Restoring Backup' },
          { label: scope.volumesnapshotStatus.error_restoring, key: 'Error Restoring' }
        ]
      }, {
        label: gettext('Size'),
        name: 'size',
        singleton: true
      },{
        label: gettext('Volume Name'),
        name: 'volume_name',
        singleton: true
      }, {
        label: gettext('Create Time'),
        name: 'created_at',
        singleton: true
      }];

      this.reset = function() {
        scope.volumes = [];
        scope.instance_snapshot = [];
        scope.ivolumes = [];
        scope.checked = {};
        scope.selected = {};
        scope.volumeState = false;
        scope.disableDelete = false;
        scope.disableCreate = true;
        if(scope.selectedData)
          scope.selectedData.aData = [];
      };
      this.init = function() {
        scope.actions = {
          refresh: self.refresh,
          edit: new EditVolumeSnapshotAction(scope),
          create: new CreateAction(scope),
          deleted: new DeleteAction(scope)
        };
        self.refresh();

        scope.$watch('numSelected', function(current, old) {
          if (current != old)
            self.allowMenus(scope.selectedData.aData);
        });
      };
    this.refresh = function(){
      self.reset();
      cinder.getVolumeSnapshots()
        .success(function(response) {
            // convert utc to local time
            if (response.items){
              angular.forEach(response.items, function(item){
                item.created_at = item.created_at.replace(/T/g, ' ');
                item.created_at = rootScope.rootblock.utc_to_local(item.created_at);
              });
            }
          scope.volumes = response.items;
          scope.volumeState = true;
        });

      glanceAPI.getImages({image_type: 'snapshot'})
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
      self.allowCreate(items);
      self.allowDelete(items);
    };

    this.allowCreate = function(items){
      if(items.length && items[0].status === 'available'){
        scope.disableCreate = false;
      }else{
        scope.disableCreate = true;
      }
    }

    this.allowDelete = function(items){
      scope.disableDelete = false;

      for(var i=0; i<items.length; i++){
        if((items[i].status != 'available' && items[i].status != 'error') || ($.inArray(items[i].id, scope.instance_snapshot) > -1 || items[i].numberOfCreateVolume!=0)){
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
      cinder.gainVolumeSnapshot(scope.volumes[i].id)
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

  }]);

})();
