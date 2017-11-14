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

(function() {
  'use strict';

  angular.module('hz.dashboard.admin.flavors')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit flavor modal dialog.
   * On submit, edit flavor and display a success message.
   * On cancel, do nothing.
   */
  .factory('adminEditFlavorAction',
      ['horizon.openstack-service-api.nova',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       'horizon.openstack-service-api.billing',
       '$modal',
       '$rootScope',
       'backDrop',
       'horizon.framework.widgets.toast.service',
  function(novaAPI, usersettingAPI, keystoneAPI, billingAPI, modal, rootScope, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Flavor'),
      submit: gettext('Save'),
      success: gettext('Flavor %s has been updated successfully.'),
      header: {
        action: gettext('Action'),
        projectsForSelection: gettext('All Projects'),
        selectedProjects: gettext('Selected Projects'),
      },
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'flavorFormCtrl',
        backdrop: backDrop,
        windowClass: 'flavorContent',
        resolve: {
          flavor: function(){ return {}; },
          context: function(){ return context; },
          _scope: function(){ return scope; },
        }
      };

      self.open = function(flavor){
        novaAPI.getFlavor(flavor[0].id, false, true)
          .success(function(response){
            if(response.flavor_access){
              flavor[0].flavor_access = response.flavor_access;
            }
            var clone = angular.copy(flavor[0]);
            option.resolve.flavor = function(){ return clone; };
            modal.open(option).result.then(function(clone){
              self.submit(flavor[0], clone);
            });
          });
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

      self.submit = function(flavor, clone) {
        var cleanedFlavor = self.clean(clone);
        novaAPI.updateFlavor(cleanedFlavor)
          .success(function(response) {
            if(response.swap ==='')
              clone.swap = 0;
            // response.ephemeral = response['OS-FLV-EXT-DATA:ephemeral'];
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            if(clone.is_public){
              clone.is_public = false;
              clone.flavor_access = clone.selectedProjects;
            }
            else{
              clone.is_public = true;
            }
            angular.extend(flavor, clone);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
