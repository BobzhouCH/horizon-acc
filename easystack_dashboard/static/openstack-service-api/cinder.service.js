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
  .service('horizon.openstack-service-api.cinder', CinderAPI);

  CinderAPI.$inject = ['horizon.framework.util.http.service',
                       'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.cinderAPI
   * @description Provides direct access to Cinder APIs.
   */
  function CinderAPI(apiService, toastService) {

    //Services

    /**
     * @name horizon.openstack-service-api.cinderAPI.getServices
     * @description
     * Get all services from cinder
     */
    this.getServices = function() {
      return apiService.get('/api/cinder/services/')
        .error(function () {
          toastService.add('error', gettext('Unable to get cinder services.'));
      });
    };

    // Volumes

    /**
     * @name horizon.openstack-service-api.cinderAPI.getVolumes
     * @description
     * Get a list of volumes.
     *
     * The listing result is an object with property "items." Each item is
     * a volume.
     *
     * @param {Object} params
     * Query parameters. Optional.
     *
     * @param {string} param.search_opts
     * Filters to pass through the API.
     * For example, "status": "available" will show all available volumes.
     */
    this.getVolumes = function(params) {
      var config = (params) ? {'params': params} : {};
      return apiService.get('/api/cinder/volumes/', config)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve volumes.'));
        });
    };


    /**
     * @name horizon.openstack-service-api.cinderAPI.getVolume
     * @description
     * Get a volume detail list by id.
     *
     * The listing result is an object with property "items." Each item is
     * a volume.
     *
     * @param {Object} params
     * Query parameters. Optional.
     *
     * @param {string} param.search_opts
     * Filters to pass through the API.
     * For example, "status": "available" will show all available volumes.
     */
    this.getVolume = function(id) {
      return apiService.get('/api/cinder/volume/'+ id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve volume details.'));
        });
    };

    this.refreshVolume = function(id) {
      return apiService.get('/api/cinder/volume/'+ id);
    };

    this.editVolume = function(updatedVolume) {
      var url = '/api/cinder/volume/' + updatedVolume.id;
      return apiService.patch(url, updatedVolume)
        .error(function () {
          toastService.add('error', gettext('Unable to edit the volume.'));
        });
    };

    this.extendVolume = function(updatedVolume) {
      var url = '/api/cinder/volume/' + updatedVolume.id;
      return apiService.post(url, updatedVolume)
        .error(function () {
          toastService.add('error', gettext('Unable to extend the volume.'));
        });
    };

    /**
    * @name horizon.openstack-service-api.cinderAPI.createVolume
    * @description
    * Create a volume using the parameters supplied in the
    * newVolume. The required parameters:
    *
    * {
    *    "size": 1,
    *    "name": "test",
    *    "description": "test_description"
    *    "volume_type": ""
    *    "snapshot_id": ""
    *    "metadata": ""
    *    "image_id": ""
    *    "availability_zone": ""
    *    source_volid: ""
    * }
    *
    * @param {string} newVolume.size
    *   Size of volume. Required
    * @param {string} newVolume.name
    *   Name of volume. Required
    * @param {string} newVolume.description
    *   The volume description. Optional
    * @param {string} newVolume.volume_type
    *   The volume type. Required
    */
    this.createVolume = function(newVolume) {
      return apiService.post('/api/cinder/volumes/', newVolume)
        .error(function () {
          toastService.add('error', gettext('Unable to create the volume.'));
        });
    };

    this.deleteVolume = function(volumeId) {
      return apiService.delete('/api/cinder/volume/' + volumeId)
        .error(function () {
            //Will raise error message in front-end
      });
    };

    // Volume Types
    this.getVolumeTypes = function() {
      return apiService.get('/api/cinder/volumetypes/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve volume types'));
      });
    };

    //admin panel Volume Types
    this.getAdminVolumeTypes = function() {
      return apiService.get('/api/cinder/adminvolumetypes/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve volume types'));
      });
    };

    // volume type Qos Specs
    this.getQosSpecs = function(){
      return apiService.get('/api/cinder/qosspecs/')
        .error(function (){
          toastService.add('error', gettext('Unable to retrieve qos specs'));
      });
    };

    // volume type associated with Qos Specs
    this.associatedWithQosSpecs = function(model){
      return apiService.post('/api/cinder/associateqosspecs/', model)
        .error(function (){
          toastService.add('error', gettext('Unable to associated with the pointed qos specs'));
      });
    };

    // add extra specs to vol types
    this.addExtraSpecToVolType = function(model){
      return apiService.post('/api/cinder/addextraspectovoltype/', model)
        .error(function (){
           toastService.add('error',gettext('Unable to add extra spec to the volume type.'));
        });
    };

        // add extra specs to vol types
    this.addExtraSpecToQosSpec = function(model){
      return apiService.post('/api/cinder/addextraspectoqosspec/', model)
        .error(function (){
           toastService.add('error',gettext('Unable to add extra spec to the qos spec.'));
        });
    };

    this.editExtraSpecOfVolType =function(model){
      return apiService.post('/api/cinder/editextraspecofvoltype/', model)
         .error(function(){
           toastService.add('error',gettext('Unable to edit the extra spec of the volume type'));
         });
    };

    this.editExtraSpecOfQosSpec =function(model){
      return apiService.post('/api/cinder/editextraspecofqosspec/', model)
         .error(function(){
           toastService.add('error',gettext('Unable to edit the extra spec of the qos spec'));
         });
    };

    this.deleteExtraSpecOfVolType =function(model){
      return apiService.post('/api/cinder/deleteextraspecofvoltype/' , model)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to delete extra spec.'));
        });
    };

    this.deleteExtraSpecOfQosSpec =function(model){
      return apiService.post('/api/cinder/deleteextraspecofqosspec/' , model)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to delete extr spec.'));
        });
    };

    this.updateVolumeType = function(volumeType){
      return apiService.patch('/api/cinder/adminvolumetypes/'+ volumeType.vol_type_id,volumeType)
        .error(function(){
            toastService.add('error',gettext('Unable to edit the volume type.'));
          }
        );
    }

    // Volume Snapshots

    /**
     * @name horizon.openstack-service-api.cinderAPI.getVolumeSnapshots
     * @description
     * Get a list of volume snapshots.
     *
     * The listing result is an object with property "items." Each item is
     * a volume snapshot.
     *
     * @param {Object} params
     * Query parameters. Optional.
     *
     * @param {string} param.search_opts
     * Filters to pass through the API.
     * For example, "status": "available" will show all available volume
     * snapshots.
     */
    this.getVolumeSnapshots = function(params) {
      var config = (params) ? {'params': params} : {};
      return apiService.get('/api/cinder/volumesnapshots/', config)
        .error(function () {
          toastService.add('error',
                           gettext('Unable to retrieve volume snapshots.'));
        });
    };

    this.getVolumeSnapshot = function(volumeId) {
        return apiService.get('/api/cinder/volumesnapshot/' + volumeId)
          .error(function () {
            toastService.add('error',
                             gettext('Unable to retrieve volume snapshot.'));
          });
    };

    this.gainVolumeSnapshot = function(volumeId) {
        return apiService.get('/api/cinder/volumesnapshot/' + volumeId);
    };

    this.editVolumeSnapshot = function(updatedVolumeSnapshot) {
      var url = '/api/cinder/volumesnapshot/' + updatedVolumeSnapshot.id;
      return apiService.patch(url, updatedVolumeSnapshot)
        .error(function () {
          toastService.add('error', gettext('Unable to edit the volume snapshot.'));
        });
    };

    this.createVolumeType = function(volumeType) {
      return apiService.post('/api/cinder/adminvolumetypes/', volumeType)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to create volume type.'));
        });
    };

    this.deleteVolumeType = function(volumeTypeId) {
      return apiService.delete('/api/cinder/adminvolumetypes/' + volumeTypeId)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to delete volume type.'));
        });
    };

    this.deleteQosSpec = function(qosSpecId) {
      return apiService.delete('/api/cinder/qosspecs/' + qosSpecId)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to delete qos spec.'));
        });
    };

    this.createQosSpec = function(qosSpec) {
      return apiService.post('/api/cinder/qosspecs/', qosSpec)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to create qos spec.'));
        });
    };

    this.createVolumeSnapshot = function(volumeId, volumeSnapshot) {
      return apiService.post('/api/cinder/volumesnapshot/' + volumeId, volumeSnapshot)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to create volume snapshot.'));
        });
    };

    this.resetSnapshotState = function(volumeId, state) {
      return apiService.post('/api/cinder/volumesnapshots/' + volumeId + '/resetstate/', {state : state})
        .error(function () {
          toastService.add('error', gettext('Unable to reset snapshot state'));
        });
    };

    this.resetState = function(volumeId, state) {
      return apiService.post('/api/cinder/volumes/' + volumeId + '/resetstate/', {state : state})
        .error(function () {
          toastService.add('error', gettext('Unable to reset volume state.'));
        });
    };

    // Create Image from volume API
    this.createVolumeImage = function(newImage) {
      return apiService.post('/api/cinder/volumetoimage/' + newImage.volume_id, newImage)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to create image from volume.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.cinderAPI.deleteSnapshot
     * @description
     * delete volume snapshot by a list of snapshot id
     */
    this.deleteVolumeSnapshot = function(volumeId) {
      return apiService.delete('/api/cinder/volumesnapshot/' + volumeId);
    };

    // Volume Backups

    this.getVolumeBackups = function(params) {
      var config = (params) ? {'params': params} : {};
      return apiService.get('/api/cinder/volumebackups/', config)
        .error(function () {
          toastService.add('error',
                           gettext('Unable to retrieve volume backups.'));
        });
    };

    this.getVolumeBackup = function(backupId, quiet) {
      var promise = apiService.get('/api/cinder/volumebackup/' + backupId);
      return quiet ? promise : promise.error(function () {
        toastService.add('error', gettext('Unable to retrieve volume backup.'));
      });
    };

    this.getSingleVolumeBackup = function(backupId, quiet) {
      var promise = apiService.get('/api/cinder/singlevolumebackup/' + backupId);
      return quiet ? promise : promise.error(function () {
        toastService.add('error', gettext('Unable to retrieve volume backup.'));
      });
    };

    this.createVolumeBackup = function(backupId, volumeBackup) {
      return apiService.post('/api/cinder/volumebackup/' + backupId, volumeBackup)
        .error(function () {
          toastService.add('error',
                        gettext('Unable to create volume backup.'));
        });
    };

    this.editVolumeBackup = function(updatedVolumeBackup) {
      var url = '/api/cinder/volumebackup/' + updatedVolumeBackup.backup_id;
      return apiService.post(url, updatedVolumeBackup)
        .error(function (a) {
          console.log(a,'a-----');
          toastService.add('error', gettext('Unable to restore the volume backup.'));
        });
    };

    this.deleteVolumeBackup = function(backupId) {
      return apiService.delete('/api/cinder/volumebackup/' + backupId);
    };

  }
}());
