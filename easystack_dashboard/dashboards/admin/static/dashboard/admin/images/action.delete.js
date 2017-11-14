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

  angular.module('hz.dashboard.admin.images')

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
                                 'horizon.framework.widgets.toast.service',
  function(glanceAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Image'),
      message: gettext('The amount of images these will be deleted is : %s'),
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
        var ids = [],
            names = [];

        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ids.push(row.item.id);
              names.push(row.item);
            }
        });

        self.confirmDelete(ids, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, names) {
        var options = {
              title: context.title,
              tips: context.tips,
              body: interpolate(context.message, [names.length]),
              submit: context.submit,
              name: names,
              imgOwner: 'noicon'
            };

        smodal.modal(options).result.then(function(){
          self.submit(ids, names);
        });
      };

      // on success, remove the images from the model
      // need to also remove deleted images from selected list
      self.submit = function(ids, namelist) {
        for (var i = 0; i < ids.length; i++) {
          self.deleteImage(ids[i], namelist[i]['name']);
        }
      };

      self.deleteImage = function(id, name) {
        glanceAPI.deleteImage(id)
          .success(function(result) {
            var message = interpolate(context.success, [name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
            scope.images.removeId(id);
          });
      };
    }

    return action;

  }]);

})();
