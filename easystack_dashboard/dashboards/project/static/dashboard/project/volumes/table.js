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
   * @ngdoc projectVolumesCtrl
   * @ngController
   *
   * @description
   * Controller for the project volumes table.
   * Serve as the focal point for table actions.
   */
  .controller('projectVolumesCtrl', [
    '$scope', '$rootScope',
    'horizon.framework.widgets.toast.service',
    'horizon.openstack-service-api.policy',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.cinder',
    'editVolumeAction', 'createVolumeAction', 'deleteVolumeAction', 'createVolumeSnapshotAction', 'createBackupAction',
    'extendVolumeAction', 'attachVolumeAction', 'detachVolumeAction', 'createImageFromVolumeAction',
    'volumeDetailAction',
    function(
      scope, rootScope, toastService, PolicyService, usersettingAPI, keystoneAPI, cinderAPI,
      EditAction, CreateAction, DeleteAction, CreateSnapshotAction, CreateBackupAction,
      ExtendAction, AttachAction, DetachAction, CreateImageAction, CreateDetailAction) {
    var self = this;

    scope.context = {
      header: {
        name: gettext('Name'),
        description: gettext('Description'),
        size: gettext('Size'),
        is_bootable: gettext('Bootable'),
        volume_type: gettext('Type'),
        attachments: gettext('Attachments'),
        attached_mode: gettext('Attached Mode'),
        status: gettext('Status'),
        created_at: gettext('Create Time'),
        backup_time:gettext('Backup Time'),
        id: gettext('ID'),
        type:gettext('Type'),
        attached_to: gettext('Attached To'),
        describes: gettext('Description'),
        state: gettext('State '),
        volume_name: gettext('Volume Name'),
        created: gettext('Created')
      },
      action: {
        create: gettext('Create'),
        edit: gettext('Edit'),
        deleted: gettext('Delete'),
        createsnapshot: gettext('Create Snapshot'),
        extended: gettext('Extend'),
        attach: gettext('Attach'),
        detach: gettext('Detach'),
        createimage: gettext('Create Image')
      },
      error: {
        noAttached: gettext('No Attached'),
        api: gettext('Unable to retrieve volumes.'),
        priviledge: gettext('Insufficient privilege level to view volumes information.')
      }
    };

    scope.volumeStatus = {
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
      'error_restoring': gettext("Error Restoring"),
      'maintenance': gettext("Maintenance")
    };
    scope.volumeType = {
      null: gettext('Default Type'),
      'default': gettext('Default Type'),
      'ssd': gettext('Performance'),
      'hdd': gettext('Capacity'),
      'sharable': gettext('sharable'),
    };

    scope.attached_mode = {
      null: null,
      'ro': gettext('Read Only'),
      'rw': gettext('Read Write'),
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
      label: gettext('Size'),
      name: 'size',
      singleton: true
    }, {
      label: gettext('Status'),
      name: 'status',
      singleton: true,
      options: [
        { label: scope.volumeStatus['available'], key: 'available' },
        { label: scope.volumeStatus['in-use'], key: 'in-use' },
        { label: scope.volumeStatus['error'], key: 'error' },
        { label: scope.volumeStatus['creating'], key: 'creating' },
        { label: scope.volumeStatus['error_extending'], key: 'error_extending' },
        { label: scope.volumeStatus['attaching'], key: 'attachting' },
        { label: scope.volumeStatus['extending'], key: 'extending' },
        { label: scope.volumeStatus['detaching'], key: 'detaching' },
        { label: scope.volumeStatus['deleting'], key: 'deleting' },
        { label: scope.volumeStatus['error_deleting'], key: 'error_deleting' },
        { label: scope.volumeStatus['backing-up'], key: 'backing-up' },
        { label: scope.volumeStatus['restoring-backup'], key: 'restoring-backup' },
        { label: scope.volumeStatus['error_restoring'], key: 'error_restoring' },
        { label: scope.volumeStatus['maintenance'], key: 'maintenance' },
      ]
    }, {
      label: gettext('Type'),
      name: 'display_volume_type',
      singleton: true,
      options: [
        { label: scope.volumeType['default'], key: 'default' },
        { label: scope.volumeType['ssd'], key: 'ssd' },
        { label: scope.volumeType['hdd'], key: 'hdd' },
        { label: scope.volumeType['sharable'], key: 'sharable' },
      ]
    }, {
      label: gettext('Attachments'),
      name: 'attachments.length',
      singleton: true
    }, {
      label: gettext('Attached Mode'),
      name: 'metadata.attached_mode',
      singleton: true,
      options: [
        { label: scope.attached_mode['ro'], key: 'ro' },
        { label: scope.attached_mode['rw'], key: 'rw' }
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

    this.hasSelected = function(volume) {
      var selected = scope.selected[volume.id];
      if (selected)
        return selected.checked;
      return false;
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

    this.reset = function(){
      scope.volumes = [];
      scope.ivolumes = [];
      scope.ivolumesState = false;

      scope.disableDelete = true;
      scope.disableSnapshot = true;
      scope.disableAttach = true;
      scope.disableDetach = true;
      scope.disableConv2Image = true;
      scope.disableExtend = true;

      self.clearSelected();
      toastService.clearAll();
    };

    this.initScope = function() {
      scope.clearSelected = self.clearSelected;
      scope.allowMenus = self.allowMenus;
      scope.updateVolume = self.updateVolume;

      scope.actions = {
        refresh: self.refresh,
        create: new CreateAction(scope),
        edit: new EditAction(scope),
        deleted: new DeleteAction(scope),
        createsnapshot: new CreateSnapshotAction(scope),
        createbackup: new CreateBackupAction(scope),
        createimage: new CreateImageAction(scope),
        extended: new ExtendAction(scope),
        attach: new AttachAction(scope),
        detach: new DetachAction(scope),
        createDetail: new CreateDetailAction(scope)
      };
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.init = function(){
      self.initScope();
      self.refresh();
      self.startUpdateStatus(10000);

      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          self.allowMenus(scope.selectedData.aData);
      });
    };

    this.refresh = function(){
      scope.disableCreate = false;
      self.reset();
      PolicyService.check({ rules: [['project', 'volume:get_all']]})
        .success(function(response) {
          if (response.allowed){
            cinderAPI.getVolumes()
              .success(function(response) {
                // convert utc time to local time
                // @TODO(lzm): this needs to be encapsulated as a generic function or a filter
                if (response.items){
                  var volumeTypeList = [];
                  angular.forEach(response.items, function(item){
                    item.created_at = item.created_at.replace(/T/g,' ');
                    item.created_at = rootScope.rootblock.utc_to_local(item.created_at);
                    if (item.volume_type === undefined || item.volume_type === null|| item.volume_type === '') {
                      item.display_volume_type = 'default';
                    } else {
                      item.display_volume_type = item.volume_type;
                    }
                    if (item.display_volume_type !== 'default' &&
                        item.display_volume_type !== 'ssd' &&
                        item.display_volume_type !== 'hdd' &&
                        item.display_volume_type !== 'sharable' &&
                        !volumeTypeList.contains(item.display_volume_type)) {
                        volumeTypeList.push(item.display_volume_type);
                    }
                  });

                  if(scope.filterFacets && scope.filterFacets[4]) {
                      scope.filterFacets[4].options =[
                      { label: scope.volumeType['default'], key: 'default' },
                      { label: scope.volumeType['ssd'], key: 'ssd' },
                      { label: scope.volumeType['hdd'], key: 'hdd' },
                      { label: scope.volumeType['sharable'], key: 'sharable' },
                    ]
                    angular.forEach(volumeTypeList, function(volumeType){
                      scope.filterFacets[4].options.push( { label:volumeType , key: volumeType });
                    });
                  }
                }
                scope.volumes = response.items;
                scope.ivolumesState = true;
                keystoneAPI.getCurrentUserSession()
                .success(function(response) {
                  usersettingAPI.getComponentQuota(response.project_id, {only_quota: false, component_name: 'cinder'})
                           .success(function(data){
                              for (var i = 0; i < data.items.length; i++){
                                if (data.items[i].name === 'volumes'){
                                  scope.volumesAvailable = data.items[i].usage.available;
                                }else if (data.items[i].name === 'gigabytes'){
                                  scope.gigabytesAvailable = data.items[i].usage.available;
                                }
                              }
                          });
                  });
              });
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
          }
        });
    };

    this.startUpdateStatus = function(interval){
      var statusList = ['creating', 'attaching', 'detaching', 'deleting', 'extending', 'uploading'];
      if(ISPUBLICREGION === 'True'){
        statusList.push('available','in-use');
      }
      function check(){
        for(var i = 0; i < scope.volumes.length; i++){
          var volume = scope.volumes[i];
          if(statusList.contains(volume.status) || (volume.status == 'in-use' && volume.attachments.length == 0)){
            self.updateVolume(volume);
          }
        }
      }
      setInterval(check, interval);
    };

    this.updateVolume = function(volume) {
      cinderAPI.refreshVolume(volume.id)
        .success(function(response) {
          // update the volume
          // convert utc time to local time
          response.created_at = response.created_at.replace(/T/g,' ');
          response.created_at = rootScope.rootblock.utc_to_local(response.created_at);
          angular.extend(volume, response);
          // update the menus
          if (self.hasSelected(volume)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404 || status == 500) {
            scope.volumes.removeId(volume.id);
            self.removeSelected(volume.id);
          }
        });
    };


    var ANY = "any";

    this.checkVolumesStatus = function(volumes, expectedStatusList, unexpectedStatusList){
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

      for(var i = 0; i < volumes.length; i++) {
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

    this.allowDelete = function(volumes){
      scope.disableDelete = !self.checkVolumesStatus(volumes, ANY, ["in-use", "uploading", "extending","creating","error_extending","attaching","maintenance",
                                                                    "detaching","error_deleting","backing-up","restoring-backup","error_restoring"]);
      // check other status such as has_snapshots
      if(!scope.disableDelete) {
        for(var i = 0; i < volumes.length; i++) {
          var volume = volumes[i];
          if(volume.snapshots && volume.snapshots.length) {
            scope.disableDelete = true;
            //@TODO(lzm): How to prompt the user the volume can't be deleted?
            //var snapshotNames = volume.snapshots.attrsOfAll('name');
            //toastService.add('info', 'the volume has snapshots: ' + snapshotNames.join(','));
          }
          if(volume.volume_type === 'sharable' && volume.attachments.length > 0){
            scope.disableDelete = true;
          }
        }
      }
    };

    this.allowSnapshot = function(volumes){
      scope.disableSnapshot = !self.checkVolumesStatus(volumes, ["available"]);
    };

    this.allowAttach = function(volumes){
      var sharableVolumesStatus = true;
      var otherVolumes = [];
      $.each(volumes, function(i, volume){
        if (volume.volume_type === 'sharable' && (volume.status === 'available' || volume.status === 'in-use')){
          sharableVolumesStatus = false;
        } else {
          otherVolumes.push(volume)
        }
      });
      var status = !self.checkVolumesStatus(otherVolumes, ["available"]);
      if (!sharableVolumesStatus) {
        scope.disableAttach = (otherVolumes.length > 0 && status);
        if(volumes.length === 1) {
          scope.disabled = false;
        }
      }else {
        scope.disableAttach = status ;
      }
    };

    this.allowDetach = function(volumes){
      var sharableVolumesStatus = true;
      var otherVolumes = [];
      $.each(volumes, function(i, volume){
        if (volume.volume_type === 'sharable' && volume.attachments.length > 0){
          sharableVolumesStatus = false;
        } else {
          otherVolumes.push(volume)
        }
      });
      var status = !self.checkVolumesStatus(otherVolumes, ["in-use"]);
      var vda = false;
      if( (volumes.length)&&(volumes[0].attachments.length)){
        vda = volumes[0].attachments[0].device.indexOf("da") >= 0;
      }
      if (!sharableVolumesStatus) {
        scope.disableDetach = (otherVolumes.length > 0 && status) || vda;
        if(volumes.length === 1) {
          scope.disabled = false;
        }
      }else {
        scope.disableDetach = status || vda;
      }
    };

    this.allowConv2Image = function(volumes){
      scope.disableConv2Image = !self.checkVolumesStatus(volumes, ["available"]);
    };

    this.allowExtend = function(volumes){
      scope.disableExtend = !self.checkVolumesStatus(volumes, ["available"]);
    };

    this.allowMenus = function(volumes) {
      self.allowDelete(volumes);
      self.allowExtend(volumes);

      self.allowSnapshot(volumes);
      self.allowConv2Image(volumes);

      self.allowAttach(volumes);
      self.allowDetach(volumes);
    };

    this.init();

  }]);

})();
