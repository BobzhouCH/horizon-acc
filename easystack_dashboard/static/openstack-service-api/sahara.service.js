/*
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .factory('horizon.openstack-service-api.sahara', saharaAPI);

  saharaAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.sahara
   * @description Provides direct pass through to sahara with NO abstraction.
   * @param apiService The horizon core API service.
   * @param toastService The horizon toast service.
   * @returns The sahara service API.
   */

  function saharaAPI(apiService, toastService) {
    var service = {
      getSaharaImages: getSaharaImages,
      getSaharaImage: getSaharaImage,
      updateSaharaImage: updateSaharaImage,
      getSaharaCluster: getSaharaCluster,
      updateSaharaCluster: updateSaharaCluster,
      getSaharaClusters: getSaharaClusters,
      createSaharaCluster: createSaharaCluster,
      getSaharaClusterTemplates: getSaharaClusterTemplates,
      getSaharaPlugins: getSaharaPlugins,
      getSaharaClusterTemplate: getSaharaClusterTemplate,
      deleteCluster: deleteCluster
    };

    return service;
    /**
     * @name horizon.app.core.openstack-service-api.sahara.saharaImages
     * @description
     * get sahara image list
     * @param {object} search_opt.
     */
    function getSaharaImages(search_opt){
      var search_opt = {'search_opt': search_opt};
      return apiService.get('/api/sahara/saharaimages/', search_opt)
        .error(function (){
          toastService.add('error', gettext('Unable to retrieve images.'));
        })
    }

     /**
     * @name horizon.app.core.openstack-service-api.sahara.getSaharaImages
     * @description
     * get sahara image
     * @param {object} search_opt.
     */
    function getSaharaImage(id){
      return apiService.get('/api/sahara/saharaimage/'+ id + '/')
       .error(function(){
          toastService.add('error', gettext('Unable to retrieve image.'));
        })
    }

    /**
     * @name horizon.app.core.openstack-service-api.sahara.updataSaharaImage
     * @description
     * update Sahara image
     * @param {object} .
     */
    function updateSaharaImage(id, params){
      return apiService.post('/api/sahara/saharaimage/' + id + '/', params)
        .error(function(){
          toastService.add('Unable to update image.');
       })
    }

    function getSaharaCluster(id){
      return apiService.get('/api/sahara/saharacluster/'+ id + '/')
       .error(function(){
          toastService.add('error', gettext('Unable to retrieve Cluster.'));
        })
    }

    function updateSaharaCluster(id, params){
      return apiService.patch('/api/sahara/saharacluster/'+ id + '/', params)
       .error(function(){
          toastService.add('error', gettext('Unable to update Cluster.'));
        })
    }

    function getSaharaClusters(search_opt){
      var search_opt = {'search_opt': search_opt};
      return apiService.get('/api/sahara/saharaclusters/', search_opt)
        .error(function (){
          toastService.add('error', gettext('Unable to retrieve Clusters.'));
        })
    }

    function createSaharaCluster(param){
      return apiService.post('/api/sahara/saharaclusters/', param)
        .error(function (){
          toastService.add('error', gettext('Unable to create clusters.'));
        })
    }

    function getSaharaClusterTemplates(){
      return apiService.get('/api/sahara/saharaClusterTemplates/')
        .error(function (){
          toastService.add('error', gettext('Unable to create cluster templates.'));
      })
    }

    function getSaharaPlugins(){
      return apiService.get('/api/sahara/saharaPlugins/')
        .error(function (){
          toastService.add('error', gettext('Unable to retrieve plugins.'));
      })
    }

    function getSaharaClusterTemplate(ct_id){
      return apiService.get('/api/sahara/saharaClusterTemplate/'+ ct_id)
        .error(function (){
          toastService.add('error', gettext('Unable to retrieve cluster template.'));
      })
    }

    function deleteCluster(id, quiet){
      var promise = apiService.delete('/api/sahara/saharacluster/'+ id + '/');
      return quiet ? promise : promise.error(function (response, status) {
          toastService.add('error',
              interpolate(gettext('Unable to delete Clusters: %s.'), id))
      });
    }
  }
}());
