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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create image modal dialog.
   * On submit, create a new image and display a success message.
   * On cancel, do nothing.
   */
  .factory('createImageFromVolumeAction', ['horizon.openstack-service-api.cinder',
          '$modal', 'backDrop',
          'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backdrop, toastService) {

    var context = {
      mode: 'createimage',
      title: gettext('Create Image From Volume'),
      submit:  gettext('Create'),
      success: gettext('Image %s was successfully created.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'volume2imageform',
        controller: 'volumeFormCtrl',
        windowClass: 'volumesListContent',
        backdrop: backdrop,
        resolve: {
          volume: function(){
            return {};
          },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        }
      };

      self.open = function(volumes){
        var volume = volumes[0];
        var clone = angular.copy(volume);
        clone.origVolume = volume;
        option.resolve.volume = function(){ return clone; };
        modal.open(option).result.then(self.submit);
      };
      self.clean = function(volume) {
        return {
          volume_id: volume.id,
          name: volume.image_name,
        };
      };

      self.submit = function(clone) {
        var cleanedImage = self.clean(clone);
        cinderAPI.createVolumeImage(cleanedImage)
          .success(function(response) {
            var message = interpolate(context.success, [cleanedImage.name]);
            toastService.add('success', message);
            // update the volume's status to 'uploading'
            angular.extend(clone.origVolume, {status: response.status});
            scope.$table.resetSelected();
          });
      };

    }

    return action;
  }]);

})();
