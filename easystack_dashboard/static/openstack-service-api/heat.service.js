/*
 * (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
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
    .factory('horizon.openstack-service-api.heat', heatAPI);

  heatAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc service
   * @name heatAPI
   * @param {Object} apiService
   * @param {Object} toastService
   * @description Provides direct pass through to Heat with NO abstraction.
   * @returns {Object} The service
   */
  function heatAPI(apiService, toastService) {
    var service = {
      validate: validate,
      validateStack: validateStack,
      formData: formData,
      createStackByUploadFile: createStackByUploadFile,
      getFileUrl:getFileUrl,
      createStack: createStack,
      getStack: getStack,
      deleteStack: deleteStack,
      actionStack: actionStack,
      getStackTopology: getStackTopology,
      getStackResources: getStackResources,
      getStackEvents: getStackEvents,
      getStackTemplate: getStackTemplate,
      getStacks: getStacks,
      getServices: getServices,
      getTemplateVersions: getTemplateVersions,
      getFunctions: getFunctions,
      getResources: getResources,
      getResourceType: getResourceType
    };

    return service;

    // this exists solely so that we can mock FormData
    function formData() {
      return new FormData();
    }

    function getFileUrl(model){
      var type='fir';

      if(model.env_file){
        type='sec';
      }
      if(!model.rollback){
        model.rollback = 'false';
      }
      return '/api/heat/stacksfile/'+model.stackname+'/'+model.timeout+'/'+model.password + '/'+type+'/'+ model.rollback+'/';

    }

    function createStackByUploadFile(model, file) {
      var fd = service.formData();
      //fd.append('model',model);
      var i=0;
      var mark='file';
      for(i;i<file.length;i++){
        fd.append(mark+i, file[i]);
      }
      if(model.env_text){
        fd.append('model-e',model.env_text);
      }
      if(model.template_text){
        fd.append('model-t',model.template_text);
      }

      //fd.append("file", file);
      return apiService.post(
        getFileUrl(model),
        fd,
        {
          headers: {
            'Content-Type': undefined
          }
        }
      )
        .error(function () {
          toastService.add('error', gettext('Unable to create the stack.'));
        });
//        var fd = new FormData();
//        fd.append('file', file);
//        var url = service.getObjectURL(container, objectName);
//        $http.post(url, fd, {
//            transformRequest: angular.identity,
//            headers: {'Content-Type': undefined}
//        })
//
//        .error(function(){
//        });
    }
    /**
     * @name validate
     * @description
     * Validate a template.
     *
     * @param {string} params
     * - template_url
     * Specifies the template to validate.
     *
     * @param {boolean} suppressError
     * If passed in, this will not show the default error handling
     * (horizon alert).
     * @returns {Object} The result of the API call
     */
    function validate(params, suppressError) {
      var promise = apiService.post('/api/heat/validate/', params);
      return suppressError ? promise : promise.error(function() {
        toastService.add('error', gettext('Unable to validate the template.'));
      });
    }



    function validateStack(params, suppressError) {
      var promise = apiService.post('/api/heat/validatestack/', params);
      return suppressError ? promise : promise.error(function() {
        toastService.add('error', gettext('Unable to validate the template.'));
      });
    }

    function createStack(data){
      return apiService.post('/api/heat/stacks/', data)
        .error(function (){
            toastService.add('error', gettext('Unable to create the heat stack.'))
          });;


    }
    /**
     * @name getServices
     * @description Get the list of heat services.
     *
     * @returns {Object} The listing result is an object with property "services." Each item is
     * a service.
     */
    function getServices() {
      return apiService.get('/api/heat/services/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the heat services.'));
        });
    }

    /**
     * @name getStacks
     * @description Get the list of stacks.
     *
     */
    function getStacks() {
      return apiService.get('/api/heat/stacks/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the stacks.'));
        });
    }

    /**
     * @name getStack
     * @description Get detail info of stack.
     *
     */
    function getStack(id) {
      return apiService.get('/api/heat/stack/' + id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the stack.'));
        });
    }

    /**
     * @name deleteStack
     * @description Delete stack.
     *
     */
    function deleteStack(id) {
      return apiService.delete('/api/heat/stack/' + id)
        .error(function () {
          toastService.add('error', gettext('Unable to delete the stack.'));
        });
    }


    function actionStack(data) {
      return apiService.put('/api/heat/stack_action/', data)
        .error(function () {
          toastService.add('error', gettext('Unable to update the stack.'));
        });
    }

    /**
     * @name getStackTopology
     * @description Get topology of stack.
     *
     */
    function getStackTopology(id) {
      return apiService.get('/api/heat/stack_topology/' + id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the stack topology.'));
        });
    }

    /**
     * @name getStackResources
     * @description Get resources of stack.
     *
     */
    function getStackResources(stack_name) {
      return apiService.get('/api/heat/stack_resources/' + stack_name)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve stack resources.'));
        });
    }

    /**
     * @name getStackEvents
     * @description Get events of stack.
     *
     */
    function getStackEvents(stack_name) {
      return apiService.get('/api/heat/stack_events/' + stack_name)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve stack events.'));
        });
    }

    /**
     * @name getStackTemplate
     * @description Get template of stack.
     *
     */
    function getStackTemplate(stack_id) {
      return apiService.get('/api/heat/stack_template/' + stack_id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve stack template.'));
        });
    }

    /**
     * @name getTemplateVersions
     * @description Get the list of heat template versions.
     *
     */
    function getTemplateVersions() {
      return apiService.get('/api/heat/template_versions/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the heat template versions.'));
        });
    }

    /**
     * @name getFunctions
     * @description Get the function list of template version.
     *
     */
    function getFunctions(version) {
      return apiService.get('/api/heat/template_versions/functions/'+ version)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve the function list.'));
        });
    }

    /**
     * @name getResources
     * @description Get the list of template resources.
     *
     */
    function getResources() {
      return apiService.get('/api/heat/resources/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve heat template resources.'));
        });
    }

    /**
     * @name getResourceType
     * @description Get resource type info.
     *
     */
    function getResourceType(type) {
      return apiService.get('/api/heat/resource/' + type)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve resource type info.'));
        });
    }
  }

}());
