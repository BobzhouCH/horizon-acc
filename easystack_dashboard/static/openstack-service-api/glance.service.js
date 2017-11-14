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
(function () {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.glance', GlanceAPI);

  GlanceAPI.$inject = ['horizon.framework.util.http.service',
                       'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.glanceAPI
   * @description Provides direct pass through to Glance with NO abstraction.
   */
  function GlanceAPI(apiService, toastService) {

    // toast
    this.toast = function(type, message) {
       toastService.add(type, message);
    };

    // Images

     /**
     * @name horizon.openstack-service-api.glanceAPI.getImage
     * @description
     * Get a single image by ID
     * @param {string} id
     * Specifies the id of the image to request.
     */
    this.getImage = function(id) {
      return apiService.get('/api/glance/image/' + id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve image.'));
      });
    };

    /**
     * @name horizon.openstack-service-api.glanceAPI.editImage
     * @description
     * Edit a image.
     *
     * @param {Object} editImage
     * The updatedImage to update.  Required.
     *
     * Example updatedImage object
     * {
     *    "id": "xxxxxx"
     *    "disk_format": "raw",
     *    "is_public": true,
     *    "protected" : "old_protected",
     *    "name": "test",
     *    "description": "test_description"
     *    ... as old as image object
     * }
     */
    this.editImage = function(updatedImage) {
        var url = '/api/glance/image/' + updatedImage.id;
        return apiService.patch(url, updatedImage)
          .error(function () {
            toastService.add('error', gettext('Unable to edit the image.'));
          });
      };

    /**
     * @name horizon.app.core.openstack-service-api.glance.getImageProps
     * @description
     * Get an image custom properties by image ID
     * @param {string} id Specifies the id of the image to request.
     */
    this.getImageProps = function(id) {
      return apiService.get('/api/glance/images/' + id + '/properties/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the image custom properties.'));
        });
    };

    /**
     * @name horizon.app.core.openstack-service-api.glance.editImageProps
     * @description
     * Update an image custom properties by image ID
     * @param {string} id Specifies the id of the image to request.
     * @param {object} updated New metadata definitions.
     * @param {[]} removed Names of removed metadata definitions.
     */
    this.editImageProps = function(id, updated, removed) {
      return apiService.patch(
        '/api/glance/images/' + id + '/properties/',
        {
          updated: updated,
          removed: removed
        }
      )
      .error(function () {
        toastService.add('error', gettext('Unable to edit the image custom properties.'));
      });
    };

    /**
     * @name horizon.openstack-service-api.glanceAPI.getImages
     * @description
     * Get a list of images.
     *
     * The listing result is an object with property "items". Each item is
     * an image.
     *
     * @param {Object} params
     * Query parameters. Optional.
     *
     * @param {boolean} params.paginate
     * True to paginate automatically.
     *
     * @param {string} params.marker
     * Specifies the image of the last-seen image.
     *
     * The typical pattern of limit and marker is to make an
     * initial limited request and then to use the last
     * image from the response as the marker parameter
     * in a subsequent limited request. With paginate, limit
     * is automatically set.
     *
     * @param {string} params.sort_dir
     * The sort direction ('asc' or 'desc').
     *
     * @param {string} params.sort_key
     *   The field to sort on (for example, 'created_at').
     *   Default is created_at.
     *
     * @param {string} params.other
     * Any additional request parameters will be passed through the API as
     * filters. For example "name" : "fedora" would filter on the fedora name.
     */
    this.getImages = function(params) {
      var config = (params) ? { 'params' : params} : {};
      return apiService.get('/api/glance/images/', config)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve images.'));
      });
    };

    /**
     * @name horizon.openstack-service-api.novaAPI.createImage
     * @description
     * Create a image using the parameters supplied in the
     * newImage. The required parameters:
     *
     * {
     *    "disk_format": "raw",
     *    "is_public": true,
     *    "protected" : true,
     *    "name": "test",
     *    "description": "test_description"
     *    "min_disk": 9
     *    "min_ram": 0
     *    "description": "test description"
     *    "image_file": "xxx"
     *    "copy_from": "xxx"
     * }
     *
     * @param {string} newImage.disk_format
     *   Disk format of image. Required
     * @param {boolean} newImage.is_public
     *   If the image is public. Required
     * @param {boolean} newImage.protected
     *   If the image is protected. Required
     * @param {string} newImage.description
     *   The image description. Optional
     * @param {string} newImage.disk_format
     *   The field to sort on (for example, 'created_at').
     * @param {string} newImage.disk_format
     *   The field to sort on (for example, 'created_at').
     * @param {string} newImage.disk_format
     *   The field to sort on (for example, 'created_at').
     * This returns the new image object on success.
     */
    this.createImage = function(newImage) {
      return apiService.post('/api/glance/images/', newImage)
        .error(function () {
          toastService.add('error', gettext('Unable to create the image.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.novaAPI.deleteImage
     * @description
     * delete images by a list of image id
     */
    this.deleteImage = function(imageId) {
      return apiService.delete('/api/glance/image/' + imageId)
        .error(function () {
          toastService.add('error', gettext('Unable to delete the image.'));
        }
      );
    };
    /**
     * @name horizon.openstack-service-api.novaAPI.deleteSnapshot
     * @description
     * delete instance snapshot by a list of image id
     */
    this.deleteSnapshot = function(snapshotId) {
        return apiService.delete('/api/glance/image/' + snapshotId)
          .error(function () {
            toastService.add('error', gettext('Unable to delete the instance snapshot.'));
          }
        );
      };
    /**
     * @name horizon.openstack-service-api.glanceAPI.listImageFormats
     * @description
     * Get a list of image formats
     */
    this.listImageFormats = function() {
      return apiService.get('/api/glance/imageformats/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve image formats.'));
      });
    };

    // Metadata Definitions - Namespaces

    /**
     * @name horizon.openstack-service-api.glanceAPI.getNamespaces
     * @description
     * Get a list of metadata definition namespaces.
     *
     * http://docs.openstack.org/developer/glance/metadefs-concepts.html
     *
     * The listing result is an object with property "items". Each item is
     * an namespace.
     *
     * @description
     * Get a list of namespaces.
     *
     * The listing result is an object with property "items". Each item is
     * a namespace.
     *
     * @param {Object} params
     * Query parameters. Optional.
     *
     * @param {boolean} params.paginate
     * True to paginate automatically.
     *
     * @param {string} params.marker
     * Specifies the namespace of the last-seen namespace.
     *
     * The typical pattern of limit and marker is to make an
     * initial limited request and then to use the last
     * namespace from the response as the marker parameter
     * in a subsequent limited request. With paginate, limit
     * is automatically set.
     *
     * @param {string} params.sort_dir
     * The sort direction ('asc' or 'desc').
     *
     * @param {string} params.sort_key
     *   The field to sort on (for example, 'created_at').
     *   Default is namespace.
     *
     * @param {string} params.other
     * Any additional request parameters will be passed through the API as
     * filters.
     */
    this.getNamespaces = function(params, suppressError) {
        var config = (params) ? {'params' : params} : {};
        config.cache = true;

        var promise = apiService.get('/api/glance/metadefs/namespaces/', config);

        return suppressError ? promise : promise.error(function() {
            toastService.add('error', gettext('Unable to retrieve the namespaces.'));
          });
      };

     /**
     * @name horizon.openstack-service-api.glanceAPI.getImages
     * @description
     * Get a specific namespace.
     *
     * http://docs.openstack.org/developer/glance/metadefs-concepts.html
     */
    this.getNamespace = function(namespace) {
      return apiService.get('/api/glance/metadefs/namespaces/' + namespace)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve namespace.'));
      });
    };

  }
}());
