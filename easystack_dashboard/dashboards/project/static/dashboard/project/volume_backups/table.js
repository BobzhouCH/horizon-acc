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

  angular.module('hz.dashboard.project.volume_backups')

  /**
   * @ngdoc snapshotsVolumeCtrl
   * @ngController
   *
   * @description
   * Controller for the volume snapshot table.
   * Serve as the focal point for table actions.
   */
  .controller('VolumeBackupCtrl', [
    '$scope',
    '$rootScope',
    'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'createVolumeBackupAction',
    'deleteVolumeBackupAction',
    'editVolumeBackupAction',
    function(
      scope, rootScope, cinder, glanceAPI, usersettingAPI, keystoneAPI, CreateAction,
      DeleteAction, EditAction) {
        var self = this;
        scope.context = {
          header: {
          name: gettext('Name'),
          describes: gettext('Description'),
          state: gettext('State '),
          size: gettext('Size'),
          volume_name: gettext('Volume Name'),
          backup_type: gettext('Backup Type'),
          created: gettext('Created Time'),
          has_dependent_backups: gettext('Dependent Backups'),
          fail_reason: gettext('Fail Reason'),
          availability_zone: gettext('Availability Zone')
          },
        action: {
          edit: gettext('Edit'),
          created: gettext('Created'),
          deleted: gettext('Delete')
          },
        error: {
          api: 	gettext('Unable to retrieve backups'),
          priviledge: gettext('Insufficient privilege level to view backups information.')
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
        'restoring': gettext("Restoring"),
        'restoring-backup': gettext("Restoring Backup"),
        'error_restoring': gettext("Error Restoring")
      };
      scope.backup_type_map = {
        'true': gettext('increment backup'),
        'false': gettext('full backup')
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
        label: gettext('Backup Type'),
        name: 'is_incremental',
        singleton: true,
        options: [
          { label: scope.backup_type_map['true'], key: 'true' },
          { label: scope.backup_type_map['false'], key: 'false' }
        ]
      }, {
          label: gettext('Create Time'),
          name: 'created_at',
          singleton: true
      }];

      this.clearSelected = function(){
        scope.checked = {};
        scope.selected = {};
        scope.numSelected = 0;
        if(scope.selectedData)
          scope.selectedData.aData = [];
      };

      this.removeSelected = function(id) {
        var selected = scope.selected[id];
        if (selected) {
          selected.checked = false;
          delete scope.selected[id];
          scope.checked[id] = false;
          scope.selectedData.aData.removeId(id);
          //scope.numSelected--;
        }
      };

      this.hasSelected = function(volumeBackup) {
        var selected = scope.selected[volumeBackup.id];
        if (selected)
          return selected.checked;
        return false;
      };

      this.reset = function() {
        scope.volumebackups = [];
        //scope.instance_snapshot = [];
        scope.ivolumebackups = [];
        scope.checked = {};
        scope.selected = {};
        scope.volumebackupState = false;
        scope.disableDelete = true;
        scope.disableCreate = true;
        if(scope.selectedData)
          scope.selectedData.aData = [];
        if(scope.$table){
          scope.$table.resetSelected();
        }
        //scope.deleteHint = '';
      };

      this.init = function() {
        scope.clearSelected = self.clearSelected;
        scope.updateVolumeBackup = self.updateVolumeBackup;
        scope.actions = {
          refresh: self.refresh,
          edit: new EditAction(scope),
          create: new CreateAction(scope),
          deleted: new DeleteAction(scope)
        };
        self.refresh();
        self.startUpdateStatus(10000);

        scope.$watch('numSelected', function(current, old) {
          if (current != old)
            self.allowMenus(scope.selectedData.aData);
        });
      };
    this.refresh = function(){
      self.reset();
      cinder.getVolumeBackups()
        .success(function(response) {
            // convert utc to local time
            if (response.items){
              angular.forEach(response.items, function(item){
                item.created_at = item.created_at.replace(/T/g, ' ');
                item.created_at = rootScope.rootblock.utc_to_local(item.created_at);
              });
            }
          scope.volumebackups = response.items;
          scope.volumebackupState = true;
          keystoneAPI.getCurrentUserSession()
                .success(function(response) {
                  usersettingAPI.getComponentQuota(response.project_id, {only_quota: false, component_name: 'cinder'})
                           .success(function(data){
                              for (var i = 0; i < data.items.length; i++){
                                if (data.items[i].name === 'backups'){
                                  scope.backupsAvailable = data.items[i].usage.available;
                                }else if (data.items[i].name === 'backup_gigabytes'){
                                  scope.backupGigabytesAvailable = data.items[i].usage.available;
                                }
                              }
                          });
                  });
        });
    };

    this.startUpdateStatus = function(interval){
      var statusList = ['creating', 'attaching', 'detaching', 'deleting', 'extending', 'uploading'];
      if(ISPUBLICREGION === 'True'){
        statusList.push('available','in-use');
      }
      function check(){
        for(var i = 0; i < scope.volumebackups.length; i++){
          var volumebackup = scope.volumebackups[i];
          if(statusList.contains(volumebackup.status) || (volumebackup.status == 'in-use')){
             self.updateVolumeBackup(volumebackup);
             //self.refresh();
          }
        }
      }
      setInterval(check, interval);
    };

    var ANY = "any";

    this.checkVolumesStatus = function (volumes, expectedStatusList, unexpectedStatusList) {
        if (volumes.length == 0) {
            scope.disabled = true;
            return false;
        }
        // expectedStatusList=null means the status could be any
        if (!expectedStatusList)
            expectedStatusList = ANY;

        // unexpectedStatusList=null means the status state must not be 'deleting'
        if (!unexpectedStatusList)
            unexpectedStatusList = [];
        unexpectedStatusList.push('deleting');

        for (var i = 0; i < volumes.length; i++) {
            var status = volumes[i].status;
            // must be not in unexpected status
            if (unexpectedStatusList.contains(status))
                return false;
                // must be in expected status
            else if (expectedStatusList !== ANY && !expectedStatusList.contains(status))
                return false;
        }
        return true;
    };

    this.allowDelete = function (volumes) {
        scope.disableDelete = !self.checkVolumesStatus(volumes, ANY, ["in-use", "uploading", "extending", "creating", "error_extending", "attaching", "maintenance",
                                                                      "detaching", "error_deleting", "backing-up", "restoring-backup", "error_restoring"]);
        // check other status such as has_snapshots
        if (!scope.disableDelete) {
            //scope.deleteHint = '';
            for (var i = 0; i < volumes.length; i++) {
                var volume = volumes[i];
                if (volume.snapshots && volume.snapshots.length) {
                    scope.disableDelete = true;
                    //@TODO(lzm): How to prompt the user the volume can't be deleted?
                    //var snapshotNames = volume.snapshots.attrsOfAll('name');
                    //toastService.add('info', 'the volume has snapshots: ' + snapshotNames.join(','));
                }

                if (volume.has_dependent_backups) {
                    scope.disableDelete = true;
                    //scope.deleteHint = gettext("The selected volume has dependent backups");
                }
            }
        }
    };

    this.updateVolumeBackup = function(volumeBackup) {
      cinder.getSingleVolumeBackup(volumeBackup.id, true)
        .success(function(response) {
          response.items.created_at = response.items.created_at.replace(/T/g,' ');
          response.items.created_at = rootScope.rootblock.utc_to_local(response.items.created_at);
          angular.extend(volumeBackup, response.items);
          // update the menus
          if (self.hasSelected(volumeBackup)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404 || status == 500) {
            scope.volumebackups.removeId(volumeBackup.id);
            self.removeSelected(volumeBackup.id);
          }
        });
    };

    scope.refresh = self.refresh ;
    this.allowMenus = function(items) {
      //self.allowCreate(items);
      self.allowDelete(items);
    };

   this.init();

  }]);

})();
