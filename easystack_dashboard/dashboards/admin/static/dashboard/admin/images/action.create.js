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
  .factory('createImageAction', ['horizon.openstack-service-api.glance',
                                 '$modal', 'backDrop',
  function(glanceAPI, modal, backdrop) {

    var context = {
      mode: 'create',
      title: gettext('Create Image'),
      submit:  gettext('Create'),
      success: gettext('Image %s was successfully created.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: (window.WEBROOT || '/') + 'admin/images/form',
        controller: 'imageFormCtrl',
        windowClass: 'imagesListContent',
        backdrop: backdrop,
        resolve: {
          image: function(){
            var emptyImage = {
              'visibility': true,
              'protected': false,
              'disk_format': null,
              'min_disk': 0,
              'min_ram': 0,
              'name': null,
              'description': '',
              'image_file': null,
              'copy_from': null,
              'properties': {},
              'source_type': null,
              'status': null
            };
            return emptyImage;
          },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newImage) {
        if(newImage.status)
          self.uploadedImage(newImage);
        else
          self.createImage(newImage);
      };

      self.uploadedImage = function(newImage) {
        scope.images.push(self.updateImageType(newImage));
        var message = interpolate(context.success, [newImage.name]);
        glanceAPI.toast('success', message);
      };

      self.createImage = function(newImage) {
        glanceAPI.createImage(newImage)
          .success(function(response) {
            scope.images.push(self.updateImageType(response));
            var message = interpolate(context.success, [newImage.name]);
            glanceAPI.toast('success', message);
          });
      };

      self.updateImageType = function(image){
        var image_type = gettext('Image');
        if(image.properties && image.properties.image_type)
          image_type = image.properties.image_type;
        image.image_type = image_type;
        return image;
      };
    }

    return action;
  }]);

})();
