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

  angular.module('hz.dashboard.project.images')

  /**
   * @ngdoc projectImagesCtrl
   * @ngController
   *
   * @description
   * Controller for the project images table.
   * Serve as the focal point for table actions.
   */
  .controller('projectImagesCtrl', [
    '$scope', '$rootScope', 'bytesFilter', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.glance',
    'editImageAction', 'createImageProjectAction', 'deleteImageAction','createDetailAction',
    'imageCreatevolumeAction',
    function(
      scope, rootScope, bytesFilter, policyService, glanceAPI,
      EditAction, CreateAction, DeleteAction, CreateDetailAction, ImageCreateVolumeAction) {
    var self = this;

    scope.context = {
      header: {
        name: gettext('Name'),
        image_type: gettext('Type'),
        status: gettext('Status'),
        is_public: gettext('Public'),
        disk_format: gettext('Format'),
        size: gettext('Image Size')
      },
      action: {
        create: gettext('Create'),
        edit: gettext('Edit'),
        deleted: gettext('Delete')
      },
      error: {
        api: gettext('Unable to retrieve imagess'),
        priviledge: gettext('Insufficient privilege level to view user information.')
      }
    };
    scope.imageStatus = {
      'active': gettext('Available'),
      'saving': gettext('Saving'),
      'queued': gettext('Queued'),
      'creating': gettext('Creating'),
      'pending_delete': gettext('Pending Delete'),
      'killed': gettext('Killed'),
      'deleted': gettext('Deleted')
    };
    this.reset = function(){
      scope.images = [];
      scope.iimages = [];
      scope.imageState = false;
      scope.checked = {};
      scope.selected = {};
      if(scope.selectedData) {
        scope.selectedData.aData = [];
      }
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.init = function(){
        self.refresh();
    };

    this.formatImage = function(image){
      image.display_size = bytesFilter(image.size);
    };

    this.refresh = function(){
      self.reset();
      policyService.check({ rules: [['project', 'image:get_all']] })
        .success(function(response) {
          if (response.allowed){
            glanceAPI.getImages({image_type: 'image'})
              .success(function(response) {
                angular.forEach(response.items, function(item){
                   self.formatImage(item);
                });
                scope.images = self.updateImageType(response.items);
                scope.imageState = true;
              });
          }
          else if (horizon) {
            horizon.alert('info', scope.context.error.priviledge);
          }
        });
    };
    setInterval(function(){
      for(var i = 0; i < scope.images.length; i++){
        if(scope.images[i].status == 'queued'){
          glanceAPI.getImage(scope.images[i].id)
            .success(function(response) {
              self.formatImage(response);
              angular.extend(scope.images, response);
            });
        }
      }
    }, 10000);
    this.updateImageType = function(images){
      var image_type = gettext('Image');
      for(var i=0;i<images.length; i++) {
        if(images[i].hasOwnProperty('properties') && images[i].properties.hasOwnProperty('image_type')) {
          image_type = images[i].properties.image_type;
        }
        images[i].image_type = image_type;
      }
      return images;
    };

    this.searchForId = function(id) {
      glanceAPI.getImage(id).success(function(image) {
        image.created_at = image.created_at.replace(/T/g, ' ');
        image.created_at = image.created_at.replace(/Z/g, '');
        image.created_at = rootScope.rootblock.utc_to_local(image.created_at);
        self.formatImage(image);
        scope.images = [image];
      });
    };

    scope.actions = {
      refresh: this.refresh,
      create: new CreateAction(scope),
      imageCreateVolumeAction: new ImageCreateVolumeAction(scope),
      edit: new EditAction(scope),
      deleted: new DeleteAction(scope),
      createDetail: new CreateDetailAction(scope),
      searchForId: this.searchForId
    };

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Type'),
      name: 'image_type',
      singleton: true
    }, {
      label: gettext('Status'),
      name: 'status',
      singleton: true,
      options: [
        { label: scope.imageStatus.active, key: 'active' },
        { label: scope.imageStatus.saving, key: 'saving' },
        { label: scope.imageStatus.queued, key: 'queued' },
        { label: scope.imageStatus.creating, key: 'creating' },
        { label: scope.imageStatus.pending_delete, key: 'pending_delete' },
        { label: scope.imageStatus.killed, key: 'killed' },
        { label: scope.imageStatus.deleted, key: 'deleted' }
      ]
    }, {
      label: gettext('Public'),
      name: 'is_public',
      singleton: true,
      options: [
        { label: gettext('true'), key: 'true' },
        { label: gettext('false'), key: 'false' }
      ]
    }, {
      label: gettext('Format'),
      name: 'disk_format',
      singleton: true,
      options: [
        { label: gettext('AKI'), key: 'aki' },
        { label: gettext('AMI'), key: 'ami' },
        { label: gettext('ARI'), key: 'ari' },
        { label: gettext('Docker'), key: 'docker' },
        { label: gettext('ISO'), key: 'iso' },
        { label: gettext('OVA'), key: 'ova' },
        { label: gettext('QCOW2'), key: 'qcow2' },
        { label: gettext('RAW'), key: 'raw' },
        { label: gettext('VDI'), key: 'vdi' },
        { label: gettext('VHD'), key: 'vhd' },
        { label: gettext('VMDK'), key: 'vmdk' }
      ]
    }, {
      label: gettext('Image Size'),
      name: 'display_size',
      singleton: true
    }];

    this.init();

  }]);

})();
