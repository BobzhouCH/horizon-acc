/**
 * Copyright 2015 IBM Corp.
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

/**
 ** Author : liufeng24@lenovo.com
 ** Module : extra_specs
 ** Data   : 2016-12-26
 **/


(function() {
  'use strict';

  angular.module('hz.dashboard.admin.flavors')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create listener modal dialog.
   * On submit, create a new listener and display a success message.
   * On cancel, do nothing.
   */
  .factory('createExtraAction',
      ['horizon.openstack-service-api.nova',
       '$modal',
       '$rootScope',
       'backDrop',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.settings',

  function(novaAPI, modal, rootScope, backDrop, toastService, settingsService) {

    var context = {
      mode: 'create',
      title: gettext('Create Extra Spec'),
      submit: gettext('Create'),
      success: gettext('Extra Spec %s was successfully created.')
    };

    function action(scope) {

      var flavor = scope.flavor;

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'extra-form/',
        controller: 'extraFormCtrl',
        backdrop: backDrop,
        windowClass: 'extraspecsListContent',
        resolve: {
          extra: function(){ return {"extra":{}}; },
          context: function(){ return context; },
          flavor: function() { return flavor;},
          novaAPI: function() { return novaAPI;},
          value1: function() { return value1;}
        }
      };
      var value1 = '';
      self.open = function(){
        novaAPI.getFlavor(flavor.id, true, true)
          .success(function (response) {
              for(var key in response.extras){
                  if(key === 'hw:numa_nodes'){
                      value1 = response.extras[key];
                  }
              }
              modal.open(option).result.then(self.submit);
          })
      };


      self.clean = function(flavor){
        var cleaned_flavor = {
          id: flavor.id,
          name: flavor.name,
          vcpus: flavor.vcpus,
          ram: flavor.ram,
          disk: flavor.disk,
        };
        if(flavor['OS-FLV-EXT-DATA:ephemeral'])
          cleaned_flavor['OS-FLV-EXT-DATA:ephemeral'] = flavor['OS-FLV-EXT-DATA:ephemeral'];
        else
          cleaned_flavor['OS-FLV-EXT-DATA:ephemeral'] = 0;
        if(flavor.swap)
          cleaned_flavor.swap = flavor.swap;
        else
          cleaned_flavor.swap = 0;
        if(flavor.rxtx_factor)
          cleaned_flavor.rxtx_factor = flavor.rxtx_factor;
        else
          cleaned_flavor.rxtx_factor = 1;
        if(flavor.selectedProjects){
          cleaned_flavor.is_public = false;
          cleaned_flavor.flavor_access = flavor.selectedProjects;
        }
        return cleaned_flavor;
      };



      self.submit = function(newExtra) {
        if(newExtra.keytype !== 'CustomExtraSpec')
            newExtra.key = newExtra.keytype;

        var flavor = scope.flavor;
        var cleanedFlavor = self.clean(flavor);
        var removed = [];
        var updated = {};

        if(newExtra.key === 'hw:numa_cpus'){
          newExtra.key = newExtra.key + "." + newExtra.key1;
        }
        if(newExtra.key === 'hw:numa_nodes'){
          newExtra.value = newExtra.value1;
        }
        if(newExtra.key === 'hw:numa_node'){
          newExtra.key = newExtra.key + "." + newExtra.key1;
          // newExtra.value = newExtra.value;
        }
        if (newExtra.key == 'pci_passthrough:alias') {
            newExtra.value = newExtra.value + ':' + newExtra.value_amount;
        }
        scope.flavor.extras[newExtra.key] = newExtra.value;
            cleanedFlavor.extras = scope.flavor.extras;
        updated[newExtra.key] = newExtra.value;

            novaAPI.editFlavorExtraSpecs(flavor.id, updated, removed)
              .success(function(response) {

          var message = interpolate(context.success, [newExtra.key]);
                  toastService.add('success', message);
                  scope.$table.resetSelected();
              });

          scope.actions.refresh();
          // scope.extra = null;

      };
    }

    return action;
  }]);

})();
