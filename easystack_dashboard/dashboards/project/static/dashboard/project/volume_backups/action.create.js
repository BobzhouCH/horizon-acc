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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create volume backup modal dialog.
   * On submit, create a new volume backup and display a success message.
   * On cancel, do nothing.
   */
  .factory('createVolumeBackupAction', ['horizon.openstack-service-api.cinder', '$modal', 'backDrop',
                                          'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create Volume Backup'),
      submit: gettext('Create'),
      success: gettext('Volume Backup %s was successfully created.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'VolumeBackupFormCtrl',
        backdrop: backDrop,
        windowClass: 'volumesListContent',
        resolve: {
          backup: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(function(backup){
          self.submit(backup);
        });
      };

      self.submit = function(backup) {
        cinderAPI.createVolumeBackup('create',backup)
          .success(function(response) {
            var message = interpolate(context.success, [backup.name]);
            toastService.add('success', message);
            scope.refresh();
          });
      };
    }

    return action;
  }]);

})();
