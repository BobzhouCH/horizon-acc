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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create flavors modal dialog.
   * On submit, create a new flavor and display a success message.
   * On cancel, do nothing.
   */
  .factory('adminCreateFlavorAction',
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
      mode: 'create',
      title: gettext('Create Flavor'),
      submit: gettext('Create'),
      success: gettext('Flavor %s was successfully created.'),
      header: {
        action: gettext('Action'),
        projectsForSelection: gettext('All Projects'),
        selectedProjects: gettext('Selected Projects'),
        roles: gettext('Roles'),
      },
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'flavorFormCtrl',
        backdrop: backDrop,
        windowClass: 'flavorContent lg-window',
        resolve: {
          flavor: function(){ return {}; },
          context: function(){ return context; },
          _scope: function(){ return scope; },
        }
      };

     // Default QOS_RULE = False
      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      var FlavorFormat = function(newFlavor){
        var flavor = {
          name: newFlavor.name,
          vcpus: newFlavor.vcpus,
          ram: newFlavor.ram,
          disk: newFlavor.disk,
        };
        if(newFlavor.id_auto === 'manual'){
          flavor.id = newFlavor.id;
        } else {
          flavor.id = "auto";
        }
        if(newFlavor['OS-FLV-EXT-DATA:ephemeral']){
          flavor['OS-FLV-EXT-DATA:ephemeral'] = newFlavor['OS-FLV-EXT-DATA:ephemeral'];
        } else {
          flavor['OS-FLV-EXT-DATA:ephemeral'] = 0;
        }
        if(newFlavor.swap){
          flavor.swap = newFlavor.swap;
        } else {
          flavor.swap = 0;
        }
        if(newFlavor.rxtx_factor) {
          flavor.rxtx_factor = newFlavor.rxtx_factor;
        } else {
          flavor.rxtx_factor = 1;
        }
        if(newFlavor.selectedProjects){
          flavor.is_public = false;
          flavor.flavor_access = newFlavor.selectedProjects;
        }
        return flavor;
      };

      var FlavorPriceFormat = function(newFlavor){
        var flavorPrice = {
          rule: "{'flavor':'" + newFlavor.id + "'}",
          ptype: "instance",
          type: "fix",
          fee_hour: newFlavor.fee_hour,
          price_fixing_id: ''
        };
        if (!newFlavor.fee_year){
          flavorPrice.fee_year = newFlavor.fee_hour*24*30*12;
        } else {
          flavorPrice.fee_year = newFlavor.fee_year;
        }
        if (!newFlavor.fee_month){
          flavorPrice.fee_month = newFlavor.fee_hour*24*30;
        } else {
          flavorPrice.fee_month = newFlavor.fee_month;
        }
        return flavorPrice;
      };

      self.submit = function(newFlavor) {
        var filterFlavorPrice = FlavorPriceFormat(newFlavor);
        newFlavor = FlavorFormat(newFlavor);
        novaAPI.createFlavor(newFlavor)
          .success(function(response) {
            if(response.swap ==='')
              response.swap = 0;
            if(newFlavor.flavor_access.length){
              response.is_public = false;
              response.flavor_access = newFlavor.flavor_access;
            }
            else{
              response.is_public = true;
            }

            // if billing is enabled, add the flavor price item;
            // if not ,do not add.
            if (rootScope.rootblock.billing_enable) {
            // get current pricefix
              billingAPI.getFixHistory().success(function(responseFix){
                var currentPriceFix = '';
                for(var i = 0; i < responseFix.items.length; i++){
                  if(responseFix.items[i].state === "USING"){
                    currentPriceFix = responseFix.items[i];
                  }
                }
                if (currentPriceFix.id) {
                  filterFlavorPrice.price_fixing_id = currentPriceFix.id;
                } else {
                  filterFlavorPrice.price_fixing_id = "1";
                }
                filterFlavorPrice.rule = "{'flavor':'" + response.id + "'}";
                // create flavor price
                billingAPI.createPriceItems(filterFlavorPrice)
                  .success(function(res){
                    response.price = res.items;
                  });
              });
            }

            scope.flavors.push(response);
            var message = interpolate(context.success, [response.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
