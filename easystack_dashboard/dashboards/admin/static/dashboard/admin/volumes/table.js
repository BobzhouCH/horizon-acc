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

  angular.module('hz.dashboard.admin.volumes')

  /**
   * @ngdoc adminVolumesCtrl
   * @ngController
   *
   * @description
   * Controller for the admin volumes table.
   * Serve as the focal point for table actions.
   */
  .controller('adminVolumesCtrl', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.cinder',
          'horizon.framework.widgets.toast.service', 'adminEditVolumeAction', 'adminDeleteVolumeAction', 'adminUpdateVolumeStatusAction',
    function(
      scope, rootScope, PolicyService, cinderAPI, toastService, editVolumeAction, deleteAction, updateVolumeStatusAction) {

    scope.context = {
      header: {
        name: gettext('Name'),
        description: gettext('Description'),
        domain: gettext('Domain'),
        tenant_name: gettext('Project'),
        size: gettext('Size'),
        is_bootable: gettext('Bootable'),
        volume_type: gettext('Type'),
        attachments: gettext('Attachments'),
        status: gettext('Status'),
        created_at: gettext('Create Time')
      },
      action: {
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
      'maintenance': gettext("Maintenance"),
    };
    scope.volumeType = {
      null: gettext('Default Type'),
      'default': gettext('Default Type'),
      'ssd': gettext('Performance'),
      'hdd': gettext('Capacity'),
      'sharable': gettext('sharable'),
      };
    scope.ivolumesState = false;
    var self = this;

    this.reset = function(){
        scope.volumes = [];
        scope.ivolumes = [];
        scope.checked = {};
        scope.selected = {};
        scope.ivolumesState= false;
      if(scope.selectedData)
          scope.selectedData.aData = [];
      };

    // on load, if user has permission
    // fetch table data and populate it
    this.init = function(){
      scope.updateVolume = self.updateVolume;
      scope.clearSelected = self.clearSelected;

      scope.actions = {
        refresh: self.refresh,
        edit: new editVolumeAction(scope),
        deleted: new deleteAction(scope),
        updateVolumeStatus: new updateVolumeStatusAction(scope)
      };
      self.refresh();
      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          self.allowDelete(scope.selectedData.aData);
      });
    };

    this.clearSelected = function(){
      scope.checked = {};
      scope.selected = {};
      scope.numSelected = 0;
      if(scope.selectedData)
        scope.selectedData.aData = [];
    };

    this.updateVolume = function(volume){
      cinderAPI.refreshVolume(volume.id)
        .success(function(response) {
          // update the volume
          // convert utc time to local time
          response.created_at = response.created_at.replace(/T/g,' ');
          response.created_at = rootScope.rootblock.utc_to_local(response.created_at);
          angular.extend(volume, response);
        })
      .error(function(response, status) {
        if(status == 404) {
          scope.volumes.removeId(volume.id);
          self.removeSelected(volume.id);
        }
      });
    };

    scope.checkDeleteBtn = function($table){
      if ($table.$scope.numSelected == 0) {
        return true;
      }
      var selected = $table.$scope.selected;
      if (scope.volumes) {
        for (var i = 0; i < scope.volumes.length; i++) {
          var volume = scope.volumes[i];
          if (selected[volume.id] && selected[volume.id].checked) {
            if ( ((volume.status != 'available') && (volume.status != 'error')) || (volume.attachments.length!=0)) {
              return true;
            }
          }
        }
      }
    }

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

    this.hasSelected = function(volume) {
      var selected = scope.selected[volume.id];
      if (selected)
        return selected.checked;
      return false;
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(){
        self.reset();
        PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
        .success(function(response) {
          if (response.allowed){
              cinderAPI.getVolumes({all_tenants: 'true'})
              .success(function(response) {
                // convert utc to local time
                if (response.items){
                  var volumeTypeList = [];
                  angular.forEach(response.items, function(item){
                    item.created_at = item.created_at.replace(/T/g, ' ');
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

                    if (item.attachments.length !== 0) {
                      item.attachment_string = '';
                      for (var i=0; i<=item.attachments.length-1; i++) {
                        var attachment = item.attachments[i];
                        if (i !== 0) {
                          item.attachment_string += ', ';
                        }
                        item.attachment_string += attachment.instance_name + ':' + attachment.device;
                      }
                    } else {
                      item.attachment_string = gettext('No Attached');
                    }
                  });

                  if(scope.filterFacets && scope.filterFacets[6]) {
                      scope.filterFacets[6].options =[
                      { label: scope.volumeType['default'], key: 'default' },
                      { label: scope.volumeType['ssd'], key: 'ssd' },
                      { label: scope.volumeType['hdd'], key: 'hdd' },
                      { label: scope.volumeType['sharable'], key: 'sharable' },
                    ]
                    angular.forEach(volumeTypeList, function(volumeType){
                      scope.filterFacets[6].options.push( { label:volumeType , key: volumeType });
                    });
                  }
                }
                scope.volumes = response.items;
                scope.ivolumesState= true;
              });
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });
    };
    setInterval(function(){
        for(var i = 0; i < scope.volumes.length; i++){
            if(scope.volumes[i].status == 'creating' || scope.volumes[i].status == 'deleting'|| scope.volumes[i].status == 'extending' ||scope.volumes[i].status == 'uploading'){
                var volumeId = scope.volumes[i].id;
                cinderAPI.refreshVolume(scope.volumes[i].id)
                .success(function(response) {
                    angular.extend(scope.volumes, response);
                }).error(function(response, status) {
                  if(status == 404) {
                    scope.volumes.removeId(volumeId);
                    self.removeSelected(volumeId);
                  }
                });
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
      name: 'attachment_string',
      singleton: true
    }, {
      label: gettext('Create Time'),
      name: 'created_at',
      singleton: true
    }];
  }]);

})();
