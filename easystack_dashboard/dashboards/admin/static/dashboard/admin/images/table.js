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
   * @ngdoc adminImagesCtrl
   * @ngController
   *
   * @description
   * Controller for the admin images table.
   * Serve as the focal point for table actions.
   */
  .controller('adminImagesCtrl', [
    '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.glance',
    'editImageAction', 'createImageAction', 'deleteImageAction', 'image2volumeAction',
    'horizon.framework.widgets.toast.service',
    function(
      scope, PolicyService, glanceAPI,
      EditAction, CreateAction, DeleteAction, Image2VolumeAction, toastService) {
    var self = this;

    scope.context = {
      header: {
        name: gettext('Name'),
        domain: gettext('Domain'),
        project: gettext('Project'),
        image_type: gettext('Type'),
        status: gettext('Status'),
        is_public: gettext('Public'),
        disk_format: gettext('Format'),
        size: gettext('Image Size'),
        protected: gettext('Protected')
      },
      action: {
        create: gettext('Create'),
        edit: gettext('Edit'),
        deleted: gettext('Delete'),
        image2volume: gettext('Create Volume from Image')
      },
      error: {
        api: gettext('Unable to retrieve imagess'),
        priviledge: gettext('Insufficient privilege level to view image information.')
      }
    };
    scope.imageStatus = {
      'active': gettext("Available"),
      'saving': gettext("Saving"),
      'queued': gettext("Queued"),
      'creating': gettext("Creating"),
      'pending_delete': gettext("Pending Delete"),
      'killed': gettext("Killed"),
      'deleted': gettext("Deleted"),
    };

    this.reset = function(){
      scope.images = [];
      scope.iimages = [];
      scope.iimagesState= false;
      scope.checked = {};
      scope.selected = {};
      scope.disableDelete = true;
      scope.imageIsUsed = false;
      if(scope.selectedData)
          scope.selectedData.aData = [];
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.init = function(){
      self.refresh();

      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          scope.imageIsUsed = false;
          self.allowMenus(scope.selectedData.aData);
      });

      scope.$on('afterUpdate',function(){
        scope.$table && scope.$table.resetSelected();
      });

      setInterval(checkStatus, 10000);
      function checkStatus() {
        for(var i = 0; i < scope.images.length; i++){
          var image = scope.images[i];
          if(image.status == 'queued' || image.status == 'saving'){
            self.updateImage(image);
          }
        }
      }
    };

    this.refresh = function(){
      self.reset();
      PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']]})
        .success(function(response) {
          if (response.allowed){
            glanceAPI.getImages({image_type: 'image', all_projects: true})
              .success(function(response) {
                scope.images = self.updateImageType(response.items);
                scope.iimagesState= true;
              });
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });
    };

    this.updateImage = function(image) {
      glanceAPI.getImage(image.id)
        .success(function(response) {
          angular.extend(image, response);
        });
    };

    this.updateImageType = function(images){
      for(var i in images) {
        var image = images[i];
        var image_type = gettext('Image');
        if(image.properties && image.properties.image_type)
          image_type = image.properties.image_type;
        image.image_type = image_type;
      }
      return images;
    };

    this.allowDelete = function(images){
      for(var i=0,len=images.length; i<len; i++){
        if(images[i].in_use){
          scope.imageIsUsed = true;
        }
        if(images[i].protected || images[i].volume_id || images[i].in_use){
          scope.disableDelete = true;
          break;
        }
        else{
          scope.disableDelete = false;
        }
      }
    };

    this.allowMenus = function(images){
      self.allowDelete(images);
    };

    scope.actions = {
      refresh: this.refresh,
      create: new CreateAction(scope),
      edit: new EditAction(scope),
      deleted: new DeleteAction(scope),
      image2volume: new Image2VolumeAction(scope)
    };

    this.init();

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Domain'),
      name: 'domain',
      singleton: true
    }, {
      label: gettext('Project'),
      name: 'tenant_name',
      singleton: true
    }, {
      label: gettext('Type'),
      name: 'image_type',
      singleton: true,
      options: [
        { label: gettext('Image'), key: [gettext('Image')] }
      ]
    }, {
      label: gettext('Status'),
      name: 'status',
      singleton: true,
      options: [
        { label: gettext('Available'), key: 'active' },
        { label: gettext('Saving'), key: 'saving' },
        { label: gettext('Queued'), key: 'queued' },
        { label: gettext('Creating'), key: 'creating' },
        { label: gettext('Pending Delete'), key: 'pending_delete' },
        { label: gettext('Killed'), key: 'killed' },
        { label: gettext('Deleted'), key: 'deleted' }
      ]
    }, {
      label: gettext('Public'),
      name: 'is_public',
      singleton: true,
      options: [
        { label: gettext('true'), key: 'True' },
        { label: gettext('false'), key: 'False' }
      ]
    }, {
      label: gettext('Protected'),
      name: 'protected',
      singleton: true,
      options: [
        { label: gettext('true'), key: 'True' },
        { label: gettext('false'), key: 'False' }
      ]
    }, {
      label: gettext('Format'),
      name: 'disk_format',
      singleton: true
    }, {
      label: gettext('Image Size'),
      name: 'size',
      singleton: true
    }];

  }]);

})();
