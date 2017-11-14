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

  angular.module('hz.dashboard.project.volume_backups')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('deleteVolumeBackupAction',
      ['horizon.openstack-service-api.cinder',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.cinder',
  function(cinderAPI, smodal, toastService, cinder) {

    var context = {
      title: gettext('Delete Volume Backups'),
      message: gettext('The amount of volume backups these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Volume Backup'),
      success: gettext('Deleted Volume Backup: %s.'),
      error: gettext('Error deleted Volume Backup: %s.')
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
        var backups = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              backups.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(backups, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(backups, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: backups,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(backups);
        });
      };

      // on success, remove the snapshots from the model
      // need to also remove deleted snapshots from selected list
      self.submit = function(backups) {
        for (var n = 0; n < backups.length; n++) {
          self.deletevolumeBackup(backups[n]);
        };
         scope.$table.resetSelected();
      };
      self.deletevolumeBackup = function (backup) {
        cinderAPI.deleteVolumeBackup(backup.id)
           .success(function () {
              var message = interpolate(context.success, [backup.name]);
              toastService.add('success', message);
              scope.updateVolumeBackup(backup);
              scope.clearSelected();
            })
            .error(function (message, status_code) {
              //toastService.add('error', gettext(message.substr(0,message.indexOf('.')+1)));
              console.log(message);
              toastService.add('error', gettext('Cannot delete Volumn Backup') + ' ' + backup.id);
            });
      };
    }

    return action;

  }]);

})();