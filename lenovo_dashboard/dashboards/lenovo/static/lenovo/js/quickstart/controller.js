/**
 * Copyright 2016 Lenovo Corp.
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

(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.quickstart')

    /**
     * @ngdoc projectImagesCtrl
     * @ngController
     *
     * @description
     * Controller for the project images table.
     * Serve as the focal point for table actions.
     */
    .controller('lenovoQuickStartCtrl', [
      '$scope', 'createVolumeAction_qs', 'createImageAction', 'lenovoNetworkSwitchesAction',
      function (scope, volumeAction, imageAction, switchAction) {
          scope.actions = {
              volumes: new volumeAction(scope),
              images: new imageAction(scope),
              switches: new switchAction(scope)
          };
      }]);
})();

(function() {
  'use strict';

  angular.module('hz.dashboard.project.volumes')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create volume modal dialog.
   * On submit, create a new volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('createVolumeAction_qs',
      ['horizon.openstack-service-api.cinder',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       '$modal',
       '$rootScope',
       'backDrop',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.settings',
  function(cinderAPI, usersettingAPI, keystoneAPI, modal, rootScope, backDrop, toastService, settingsService) {

    var context = {
      mode: 'create',
      title: gettext('Create Volume'),
      submit: gettext('Create'),
      success: gettext('Volume %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: (window.WEBROOT || '/') + 'project/volumes/form/',
        controller: 'volumeFormCtrl',
        backdrop: backDrop,
        windowClass: 'volumesListContent',
        resolve: {
          volume: function(){ return {}; },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        }
      };

     // Default QOS_RULE = False
     self.open = function(){
       option.resolve.volume.size = 1;
       settingsService.getSetting('FLOATING_IP_QOS_RULES_ENABLED',true)
         .then(function(rule) {
           if(rule){
             settingsService.getSetting('FLOATING_IP_QOS_RULES',true)
               .then(function(lenovoQoS) {
                 option.resolve.qosRules = function(){ return lenovoQoS };
                 modal.open(option).result.then(self.submit);
               });
           }
           else{
             option.resolve.qosRules = function(){ return false };
             modal.open(option).result.then(self.submit);
           }
         });
      };

      self.submit = function(newVolume) {
        cinderAPI.createVolume(newVolume)
          .success(function(response) {
            response.created_at = response.created_at.replace(/T/g,' ');
            response.created_at = rootScope.rootblock.utc_to_local(response.created_at);
            //scope.volumes.push(response);
            var message = interpolate(context.success, [response.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }])
  .factory('createBackupAction', ['horizon.openstack-service-api.cinder', '$modal', 'backDrop',
                                          'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create-v',
      title: gettext('Create Volume Backup'),
      submit: gettext('Create'),
      success: gettext('Volume Backup %s was successfully created.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'backupform/',
        controller: 'VolumeBackupFormCtrl',
        backdrop: backDrop,
        windowClass: 'volumesListContent',
        resolve: {
          backup: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(backup){
        var backupCopy = angular.copy(backup);
        option.resolve.backup = function(){ return backupCopy[0] };
        modal.open(option).result.then(function(backup){
          self.submit(backup);
        });
      };

      self.cleanObj = function(obj){
        if(obj['metadata']){
          delete obj['metadata'];
        }
        return obj;
      };
      self.submit = function(backup) {
        backup = self.cleanObj(backup);
        cinderAPI.createVolumeBackup('create',backup)
          .success(function(response) {
            var message = interpolate(context.success, [backup.name]);
            toastService.add('success', message);
            if(scope.refresh){
              scope.refresh();
            }
          });
        scope.$table.resetSelected();
      };
    }

    return action;
  }]);

})();