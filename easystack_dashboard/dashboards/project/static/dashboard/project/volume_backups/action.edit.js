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

  angular.module('hz.dashboard.project.volume_backups')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit volume snapshot modal dialog.
   * On submit, edit volume snapshot and display a success message.
   * On cancel, do nothing.
   */
  .factory('editVolumeBackupAction',
       ['horizon.openstack-service-api.cinder',
        '$modal',
        'backDrop',
        'horizon.dashboard.volume_backups.PATH',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, path, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Restore Volume Backup'),
      submit: gettext('Resume'),
      success: gettext('Volume Backup %s has been restored to %s successfully.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'backupform/',
        controller: 'VolumeBackupRestoreFormCtrl',
        backdrop: backDrop,
        resolve: {
          backup: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'volumesBackupContent'
      };

      // open up the edit form
      self.open = function(backup) {
        var clone = angular.copy(backup[0]);
        option.resolve.backup = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(backup[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(backup) {
        var cleanBackup = {
          backup_id: backup.id,
          backup_size: backup.size
        };
        if(backup.create_new_volume == '1'){
          cleanBackup.new_voume_name = backup.new_volume_name;
          cleanBackup.volume_id = 'Choose No';
        }
        if(backup.create_new_volume == '0'){
          cleanBackup.volume_id = backup.volume.id;
        }
        return cleanBackup;
      };

      // submit this action to api
      // and update volume object on success
      self.submit = function(backup, clone) {
        var cleanedVolumebackup = self.clean(clone);
        cinderAPI.editVolumeBackup(cleanedVolumebackup)
          .success(function(data) {
            var message = interpolate(context.success, [clone.name, data.items.volume_name]);
            toastService.add('success', message);
            scope.refresh();
          });
      };
    };

    return action;
  }]);

})();
