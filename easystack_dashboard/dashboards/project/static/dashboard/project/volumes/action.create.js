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
  .factory('createVolumeAction',
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
     self.cleanObj = function(obj){
         var shareVolume = false;
         $.each(obj.volume_type_list, function(i, volume_type){
             if (volume_type.id === obj.volume_type && volume_type.name === 'sharable') {
                 shareVolume = true;
             }
         })

        if(shareVolume){
            obj.multiattach = true;
            obj.metadata = {attached_mode: "ro"};
        } else {
            obj.multiattach = false;
            obj.metadata = {attached_mode: "rw"};
        }
        if(obj['volume_type_list']){
          delete obj['volume_type_list'];
        }
        return obj;
      };

      self.submit = function(newVolume) {
        newVolume = self.cleanObj(newVolume)
        cinderAPI.createVolume(newVolume)
          .success(function(response) {
            response.created_at = response.created_at.replace(/T/g,' ');
            response.created_at = rootScope.rootblock.utc_to_local(response.created_at);
            scope.volumes.push(response);
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
