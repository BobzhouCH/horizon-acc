/**
 * Copyright 2015 EasyStack Inc.
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

  angular.module('hz.dashboard.admin.images')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create image modal dialog.
   * On submit, create a new image and display a success message.
   * On cancel, do nothing.
   */
  .factory('image2volumeAction', ['horizon.openstack-service-api.cinder',
                                 '$modal', 'backDrop',
                                 'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backdrop, toastService) {

    var context = {
      mode: 'image2volume',
      title: gettext('Create Volume'),
      submit:  gettext('Create'),
      success: gettext('Volume %s was successfully created.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'image2volumeform',
        controller: 'imageFormCtrl',
        windowClass: 'imagesListContent',
        backdrop: backdrop,
        resolve: {
          image: function(){ return {}},
          context: function(){ return context; }
        }
      };

      self.open = function(images){
        var clone = angular.copy(images[0]);
        option.resolve.image = function(){ return clone; };
        modal.open(option).result.then(self.submit);
      };

      self.clean = function(image) {
        return {
          image_id: image.id,
          name: image.name,
          description: image.description,
          volume_type: image.volume_type,
          multiattach: image.volume_type === 'sharable' ?  true : false,
          metadata: {attached_mode: image.volume_type === 'sharable' ?  'ro' : 'rw'},
          size: image.size,
        };
      };

      self.submit = function(clone) {
        var cleanedVolume = self.clean(clone);
        cinderAPI.createVolume(cleanedVolume)
          .success(function(response) {
            var message = interpolate(context.success, [cleanedVolume.name]);
            toastService.add('success', message);
            // table.module.js parameter change
            scope.selectedData.aData = [];
            scope.selected = {};
            scope.numSelected = 0;
          });
      };
    }

    return action;
  }]);

})();
