/**
 * Copyright 2015, Cisco Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .factory('horizon.openstack-service-api.magnum', MagnumAPI);

  MagnumAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service',
    'horizon.framework.util.i18n.gettext'
  ];

  function MagnumAPI(apiService, toastService, gettext) {
    var service = {
      getBaymodels: getBaymodels,
      deleteBaymodels: deleteBaymodels,

      getImages: getImages,
      deleteImages: deleteImages,
      uploadImage: uploadImage,
      getHprojectManager: getHprojectManager,

      createBay: createBay,
      updateBay: updateBay,
      getBay: getBay,
      getBays: getBays,
      deleteBay: deleteBay,
      deleteBays: deleteBays,
      createBayModel: createBayModel,
      getBayModel: getBayModel,
      getBayModels: getBayModels,
      deleteBayModel: deleteBayModel,
      deleteBayModels: deleteBayModels,
      createContainer: createContainer,
      getContainer: getContainer,
      getContainers: getContainers,
      deleteContainer: deleteContainer,
      deleteContainers: deleteContainers,
      memoryUnits: memoryUnits,
      convertMemorySize: convertMemorySize,
      createService: createService,
      getService: getService,
      updateService: updateService,
      getServices: getServices,
      deleteService: deleteService,
      getNode: getNode,
      getNodes: getNodes,
      createPod: createPod,
      getPod: getPod,
      updatePod: updatePod,
      getPods: getPods,
      deletePod: deletePod,
      getPodLogs: getPodLogs,
      createRC: createRC,
      getRC: getRC,
      updateRC: updateRC,
      getRCs: getRCs,
      deleteRC: deleteRC,
      scaleRC: scaleRC
    };

    return service;

    // Images
    function getImages(id){
      var id = id ? id : '';
      return apiService.get('/api/container_images/images/'+ id)
          .error(function() {
            toastService.add('error', gettext('Unable to get images.'));
          });
    }

    function deleteImages(id){
      return apiService.delete('/api/container_images/images/', id)
          .error(function() {
            toastService.add('error', gettext('Unable to get images.'));
          });
    }

    function uploadImage(id){
      return apiService.post('/api/container_images/images/')
          .error(function() {
            toastService.add('error', gettext('Unable to upload images.'));
          });
    }

    // HprojectManager
    function getHprojectManager(){
      return apiService.get('/api/hprojectManager/project/')
          .error(function() {
            toastService.add('error', gettext('Unable to upload images.'));
          });
    }

    //////////
    // baymodels //
    //////////

    function getBaymodels() {
      return apiService.get('/api/bay_models/baymodels/')
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the bay models.'));
        });
    }

    function deleteBaymodels(id) {
      return apiService.delete('/api/bay_models/baymodel/'+id)
        .error(function() {
           var msg = gettext('Unable to delete the Bay with id: %(id)s');
           toastService.add('error', interpolate(msg, { id: id }, true));
        });
    }

    //////////
    // Bays //
    //////////

    function createBay(params) {
        return apiService.post('/api/containers/bays/', params)
          .error(function() {
            toastService.add('error', gettext('Unable to create Bay.'));
          });
    }

    function getBay(id, quiet) {
      var promise =  apiService.get('/api/containers/bays/' + id);
      return quiet ? promise : promise.error(function() {
          toastService.add('error', gettext('Unable to retrieve the Bay.'));
        });
    }

    function updateBay(id, params) {
      return apiService.put('/api/containers/bays/' + id, params)
        .error(function() {
          toastService.add('error', gettext('Unable to update the Bay.'));
        });
    }

    function getBays() {
      return apiService.get('/api/containers/bays/')
        .error(function() {
          // toastService.add('error', gettext('Unable to retrieve the Bays.'));
        });
    }

    function deleteBay(id, suppressError) {
      var promise = apiService.delete('/api/containers/bays/', [id]);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the Bay with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    // FIXME(shu-mutou): Unused for batch-delete in Horizon framework in Feb, 2016.
    function deleteBays(ids) {
      return apiService.delete('/api/containers/bays/', ids)
        .error(function() {
          toastService.add('error', gettext('Unable to delete the Bays.'));
        });
    }

    ///////////////
    // BayModels //
    ///////////////

    function createBayModel(params) {
      return apiService.post('/api/bay_models/baymodels/', params)
        .error(function() {
          toastService.add('error', gettext('Unable to create BayModel'));
        });
    }

    function getBayModel(id) {
      return apiService.get('/api/bay_models/baymodels/' + id)
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the BayModel.'));
        });
    }

    function getBayModels(get_flavor) {
      var getFlavor = get_flavor ? true : false;
      var config = {get_flavor: getFlavor};
      return apiService.get('/api/bay_models/baymodels/', {'params': config})
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the BayModels.'));
        });
    }

    function deleteBayModel(id, suppressError) {
      var promise = apiService.delete('/api/bay_models/baymodels/', [id]);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the BayModel with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    // FIXME(shu-mutou): Unused for batch-delete in Horizon framework in Feb, 2016.
    function deleteBayModels(ids) {
      return apiService.delete('/api/bay_models/baymodels/', ids)
        .error(function() {
          toastService.add('error', gettext('Unable to delete the BayModels.'));
        });
    }

    ////////////////
    // Containers //
    ////////////////

    function createContainer(params) {
      return apiService.post('/api/containers/containers/', params)
        .error(function() {
          toastService.add('error', gettext('Unable to create Container.'));
        });
    }

    function getContainer(id) {
      return apiService.get('/api/containers/containers/' + id)
        .success(function(data, status, headers, config) {
          convertMemorySize(data);
          return data;
        })
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Container.'));
        });
    }

    function getContainers() {
      return apiService.get('/api/containers/containers/')
        .success(function(data, status, headers, config) {
          angular.forEach(data.items, function(container, idx){
            convertMemorySize(container);
          });
          return data;
        })
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Containers.'));
        });
    }

    function deleteContainer(id, suppressError) {
      var promise = apiService.delete('/api/containers/containers/', [id]);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the Container with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    // FIXME(shu-mutou): Unused for batch-delete in Horizon framework in Feb, 2016.
    function deleteContainers(ids) {
      return apiService.delete('/api/containers/containers/', ids)
        .error(function() {
          toastService.add('error', gettext('Unable to delete the Containers.'));
        });
    }

    //////////
    // Services //
    //////////

    function createService(params) {
        return apiService.post('/api/containers/services/', params)
          .error(function() {
            toastService.add('error', gettext('Unable to create Service.'));
          });
    }

    function getService(id, bay_ident, quiet) {
      var promise =  apiService.get('/api/containers/services/' + id + '/bay_ident/' + bay_ident);
      return quiet ? promise : promise.error(function() {
          toastService.add('error', gettext('Unable to retrieve the Service.'));
        });
    }

    function updateService(id, bay_ident, params) {
      return apiService.patch('/api/containers/services/' + id + '/bay_ident/' + bay_ident, params)
        .error(function() {
          toastService.add('error', gettext('Unable to update the Service.'));
        });
    }

    function getServices(bay_ident) {
      return apiService.get('/api/containers/services/' + bay_ident)
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Services.'));
        });
    }

    function deleteService(id, bay_ident, suppressError) {
      var promise = apiService.delete('/api/containers/services/' + id + '/bay_ident/' + bay_ident);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the Service with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    //////////
    // Nodes //
    //////////

    function getNode(id, bay_ident, quiet) {
      var promise =  apiService.get('/api/containers/nodes/' + id + '/bay_ident/' + bay_ident);
      return quiet ? promise : promise.error(function() {
          toastService.add('error', gettext('Unable to retrieve the Node.'));
        });
    }

    function getNodes(bay_ident) {
      return apiService.get('/api/containers/nodes/' + bay_ident)
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Nodes.'));
        });
    }


    //////////
    // Pods //
    //////////

    function createPod(params) {
        return apiService.post('/api/containers/pods/', params)
          .error(function() {
            toastService.add('error', gettext('Unable to create Pod.'));
          });
    }

    function getPod(id, bay_ident, quiet) {
      var promise =  apiService.get('/api/containers/pods/' + id + '/bay_ident/' + bay_ident);
      return quiet ? promise : promise.error(function() {
          toastService.add('error', gettext('Unable to retrieve the Pod.'));
        });
    }

    function updatePod(id, bay_ident, params) {
      return apiService.patch('/api/containers/pods/' + id + '/bay_ident/' + bay_ident, params)
        .error(function() {
          toastService.add('error', gettext('Unable to update the Pod.'));
        });
    }

    function getPods(bay_ident) {
      return apiService.get('/api/containers/pods/' + bay_ident)
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Pods.'));
        });
    }

    function deletePod(id, bay_ident, suppressError) {
      var promise = apiService.delete('/api/containers/pods/' + id + '/bay_ident/' + bay_ident);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the Pod with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    function getPodLogs(id, bay_ident, params) {
      var config = null;
      if (params) {
        config.params = params;
      }
      return apiService.get('/api/containers/pods/logs/' + id + '/bay_ident/' + bay_ident, config)
        .error(function() {
          toastService.add('error', gettext('Unable to get the Pod logs.'));
        });
    }

    //////////
    // RC //
    //////////

    function createRC(params) {
        return apiService.post('/api/containers/rcs/', params)
          .error(function() {
            toastService.add('error', gettext('Unable to create Replication Controller.'));
          });
    }

    function getRC(id, bay_ident, quiet) {
      var promise =  apiService.get('/api/containers/rcs/' + id + '/bay_ident/' + bay_ident);
      return quiet ? promise : promise.error(function() {
          toastService.add('error', gettext('Unable to retrieve the Replication Controller.'));
        });
    }

    function updateRC(id, bay_ident, params) {
      return apiService.patch('/api/containers/rcs/' + id + '/bay_ident/' + bay_ident, params)
        .error(function() {
          toastService.add('error', gettext('Unable to update the Replication Controller.'));
        });
    }

    function getRCs(bay_ident) {
      return apiService.get('/api/containers/rcs/' + bay_ident)
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Replication Controller.'));
        });
    }

    function deleteRC(id, bay_ident, suppressError) {
      var promise = apiService.delete('/api/containers/rcs/' + id + '/bay_ident/' + bay_ident);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the Replication Controller with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    function scaleRC(id, bay_ident, params) {
      return apiService.patch('/api/containers/rcs/scale/' + id + '/bay_ident/' + bay_ident, params)
        .error(function() {
          toastService.add('error', gettext('Unable to scale the Replication Controller.'));
        });
    }
  }

  var memoryUnits = { "b": gettext("bytes"),
      "k": gettext("KB"),
      "m": gettext("MB"),
      "g": gettext("GB")};

  function convertMemorySize(container){
    container.memorysize = "";
    container.memoryunit = "";
    if(container.memory !== null){
      // separate number and unit.
      var regex = /(\d+)([bkmg]?)/;
      var match = regex.exec(container.memory);
      container.memorysize = match[1];
      if(match[2]){
        container.memoryunit = memoryUnits[match[2]];
      }
    }
  };
}());
