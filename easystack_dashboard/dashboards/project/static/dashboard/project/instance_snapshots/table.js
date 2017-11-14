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

angular.module('hz.dashboard.project.instance_snapshots')

/**
* @ngdoc snapshotsInstanceCtrl
* @ngController
*
* @description
* Controller for the instance snapshot table.
* Serve as the focal point for table actions.
*/
.controller('snapshotsInstanceCtrl', [
'$scope', '$rootScope', 'horizon.openstack-service-api.glance',
'editInstanceSnapshotAction', 'deleteInstanceSnapshotAction', 'createInstanceSnapshotVolumeAction',
function(
  scope, rootScope, glanceAPI,
  EditAction, DeleteAction, CreateVolume) {
    var self = this;
    scope.context = {
      header: {
        name: gettext('Name'),
        describes: gettext('Description'),
        instance_name: gettext('Instance Name'),
        type : gettext('Type'),
        state: gettext('State'),
        public: gettext('Public'),
        format: gettext('Format'),
        created: gettext('Created Time')
      },
      action: {
        edit: gettext('Edit'),
        created: gettext('Create'),
        deleted: gettext('Delete'),
        createVolume: gettext('Create Volume')
      },
      error: {
        api: gettext('Unable to retrieve snapshots'),
        priviledge: gettext('Insufficient privilege level to view snapshots information.')
      }
    };
    scope.imageStatus = {
      'active': gettext("Available"),
      'saving': gettext("Saving"),
      'queued': gettext("Queued"),
      'creating': gettext("Creating"),
      'pending_delete': gettext("Pending Delete"),
      'killed': gettext("Killed"),
      'deleted': gettext("Deleted"),
    };
    this.reset = function() {
      scope.instances 	= [];
      scope.iInstances 	= [];
      scope.checked 		= {};
      scope.selected = {};
      scope.iInstancesState = false;
      if(scope.selectedData)
        scope.selectedData.aData = [];
    };
    this.init = function() {
      scope.actions = {
        refresh: self.refresh,
        edit: new EditAction(scope),
        deleted: new DeleteAction(scope),
        createVolume: new CreateVolume(scope),
      };
      self.refresh();
      scope.$watch('numSelected',function(current,old){
        if(current != old){
          scope.deleteTag =  !self.allowDelete(scope.selectedData.aData);
        }
      });
    };
    this.allowDelete = function (items) {
      for (var i in items){
        if(items[i].status=='queued'){
          return false;
        } else if (items[i].in_use) {
          return false;
        } else if (items[i].volume_id) {
          return false;
        }
      }
      return true;
    }
// on load, if user has permission
// fetch table data and populate it
    this.refresh = function(){
        self.reset();
        glanceAPI.getImages({image_type: 'snapshot'})
        .success(function(response) {
            // convert utc to local time
            if (response.items){
                angular.forEach(response.items, function(item){
                item.created_at = item.created_at.replace(/T/g, ' ');
                item.created_at = item.created_at.replace(/Z/g, ' ');
                item.created_at = rootScope.rootblock.utc_to_local(item.created_at);
                });
            }
            scope.instances = response.items;
            scope.iInstancesState = true;
        });
    };
    setInterval(function(){
        for(var i = 0; i < scope.instances.length; i++){
            if(scope.instances[i].status == 'uploading'){
                glanceAPI.getImage(scope.instances[i].id)
                .success(function(response) {
                    angular.extend(scope.instances, response);
                });
            }
        }
    }, 10000);
    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Description'),
      name: 'properties.description',
      singleton: true
    }, {
      label: gettext('Instance Name'),
      name: 'instance_name',
      singleton: true
    }, {
      label: gettext('Status'),
      name: 'status',
      singleton: true,
      options: [
        { label: scope.imageStatus.active, key: 'active' },
        { label: scope.imageStatus.saving, key: 'saving' },
        { label: scope.imageStatus.queued, key: 'queued' },
        { label: scope.imageStatus.creating, key: 'creating' },
        { label: scope.imageStatus.pending_delete, key: 'pending_delete' },
        { label: scope.imageStatus.killed, key: 'killed' },
        { label: scope.imageStatus.deleted, key: 'deleted' },
      ]
    }, {
      label: gettext('Format'),
      name: 'disk_format',
      singleton: true,
      options: [
        { label: gettext('AKI'), key: 'aki' },
        { label: gettext('AMI'), key: 'ami' },
        { label: gettext('ARI'), key: 'ari' },
        { label: gettext('Docker'), key: 'docker' },
        { label: gettext('ISO'), key: 'iso' },
        { label: gettext('OVA'), key: 'ova' },
        { label: gettext('QCOW2'), key: 'qcow2' },
        { label: gettext('RAW'), key: 'raw' },
        { label: gettext('VDI'), key: 'vdi' },
        { label: gettext('VHD'), key: 'vhd' },
        { label: gettext('VMDK'), key: 'vmdk' }
      ]
    }, {
      label: gettext('Create Time'),
      name: 'created_at',
      singleton: true,
    }];

    this.init();

}]);

})();
