/**
 * Copyright 2015 IBM Corp.
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

  angular.module('hz.dashboard.project.images')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete image confirmation modal dialog.
   * On submit, delete selected images.
   * On cancel, do nothing.
   */
  .factory('deleteImageAction', ['horizon.openstack-service-api.glance',
                                 'horizon.framework.widgets.modal.service',
  function(glanceAPI, smodal) {

    var context = {
      title: gettext('Confirm Delete Image'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Image'),
      success: gettext('Deleted Images: %s.'),
      error: gettext('Deleted Images: %s.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;

      // delete a single image object
      self.singleDelete = function(image) {
        self.confirmDelete([image.id], [image.name]);
      };

      // delete selected image objects
      // action requires the image to select rows
      self.batchDelete = function() {
        var ids = [];
        var names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ids.push(row.item.id);
              names.push('"'+ row.item.name +'"');
            }
        });

        self.confirmDelete(ids, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, names) {
        var namelist = names.join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [namelist]),
          submit: context.submit
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, names);
        });
      };

      // on success, remove the images from the model
      // need to also remove deleted images from selected list
      self.submit = function(ids, names) {
        for (var i = 0; i < ids.length; i++) {
          self.deleteImage(ids[i], names[i]);
        }
      };

      self.deleteImage = function(id, name) {
        glanceAPI.deleteImage(id)
          .success(function(result) {
            var message = interpolate(context.success, [name]);
            horizon.alert('success', message);
            horizon.autoDismissAlerts();
            // iterating backwards so we can splice while looping
            for (var i = scope.images.length - 1; i >= 0; i--) {
              var image = scope.images[i];
              if (image.id === id) {
                scope.images.splice(i, 1);
                delete scope.selected[image.id];
                break;
              }
            }
          })
          .error(function() {
            var message = interpolate(context.error, [name]);
            horizon.alert('error', message);
          });
      };
    }

    return action;

  }]);

})();
