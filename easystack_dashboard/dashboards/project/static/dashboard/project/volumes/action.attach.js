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
   * @ngDoc attachAction
   * @ngService
   *
   * @Description
   * Brings up the attach volume modal dialog.
   * On submit, attach volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('attachVolumeAction', ['horizon.openstack-service-api.cinder',
                                  'horizon.openstack-service-api.nova',
                                  '$modal', 'backDrop',
                                  'horizon.framework.widgets.toast.service',
                                  '$rootScope',
  function(cinderAPI, novaAPI, modal, backDrop, toastService, rootScope) {

    var context = {
      mode: 'attach',
      title: gettext('Attach Volume to Instance'),
      submit: gettext('Attach'),
      success: gettext('Volume %s has been attached successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'form',
        controller: 'volumeFormCtrl',
        backdrop: backDrop,
        resolve: {
          volume: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        },
        windowClass: 'RowContent'
      };

      // open up the attach form
      self.open = function(volumes) {
        var volume = volumes[0]
        var clone = angular.copy(volume);
        option.resolve.volume = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(volume, clone);
        });
      };

      // attach form modifies size
      // send only what is required
      self.clean = function(volume) {
        //device=null means auto
        if (!volume.device)
          volume.device = null;

        var instanceName = "";
        $.each(volume.dropdownInstanceList, function (i, instance) {
            if (volume.instance === instance.id) {
               instanceName =  instance.name;
            }
        });

        return {
          volume_id: volume.id,
          device: volume.device,
          instance_id: volume.instance,
          instance_name: instanceName,
//          multiattach: volume.volume_type === 'sharable'? true:false,
//          metadata: {attach_mode: volume.metadata.attached_mode}
        };
      };

      // submit this action to api
      // and update volume object on success
      self.submit = function(volume, clone) {
        self.updatedCount = 0;
        if (clone.volume_type === 'sharable') {
          self.toUpdateCount = Object.keys(clone.selectedInstances).length;
          $.each(clone.selectedInstances, function (instance, v) {
              clone.instance = instance;
              var cleanedVolume = self.clean(clone);
              self.submitRequest(volume, cleanedVolume);
          });
        }else{
          self.toUpdateCount = 1;
          var cleanedVolume = self.clean(clone);
          self.submitRequest(volume, cleanedVolume);
        }
      };

      self.submitRequest = function(volume, cleanedVolume) {
        novaAPI.attachVolume2Server(cleanedVolume.instance_id, cleanedVolume)
          .success(function() {
            self.updatedCount += 1;
            if (self.updatedCount === self.toUpdateCount) {
                var message = interpolate(context.success, [volume.name]);
                toastService.add('success', message);
            }
            self.updateVolume(volume);

            scope.$table.resetSelected();
          });
      };

      self.updateVolume = function(volume) {
         cinderAPI.getVolume(volume.id)
           .success(function(response) {
               response.created_at = response.created_at.replace(/T/g,' ');
               response.created_at = rootScope.rootblock.utc_to_local(response.created_at);
               angular.extend(volume, response);
           });
      };

    }//end of action

    return action;
  }]);

})();
