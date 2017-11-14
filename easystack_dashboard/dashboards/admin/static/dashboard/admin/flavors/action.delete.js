/**
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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
     * @ngDoc deleteAction
     * @ngService
     *
     * @Description
     * Brings up the delete flavor confirmation modal dialog.
     * On submit, delete selected flavors.
     * On cancel, do nothing.
     */
    .factory('adminDeleteFlavorAction',
        ['horizon.openstack-service-api.nova',
         'horizon.openstack-service-api.billing',
        'horizon.framework.widgets.modal.service',
        'horizon.framework.widgets.toast.service',
        '$rootScope',
        function(novaAPI, billingAPI, smodal, toastService, rootScope) {

          var context = {
            title: gettext('Delete Flavor'),
            message: gettext('The amount of flavors these will be deleted is : %s'),
            tips: gettext('Please confirm your selection. This action cannot be undone.'),
            submit: gettext('Delete Flavor'),
            success: gettext('Deleted flavors: %s.'),
            error: gettext('Unable to delete flavors %s: %s.'),
            in_use_error: gettext('Flavor %s is used, can not be deleted.')
          };

          function action(scope) {

            /*jshint validthis: true */
            var self = this;

            // delete a single flavor object
            self.singleDelete = function(flavor) {
              self.confirmDelete([flavor.id], [flavor.name]);
            };

            // delete selected flavor objects
            // action requires the flavor to select rows
            self.batchDelete = function() {
              var flavors = [], names = [], usedFlavors = [];
              novaAPI.getServers({all_tenants: 'True'})
                .success(function(response) {
                  scope.instances = response.items;
                  angular.forEach(scope.selected, function(row) {
                    if (row.checked){
                      var hasUsed = false;
                      angular.forEach(scope.instances, function(instance) {
                        if(instance.flavor.id === row.item.id){
                          hasUsed = true;
                        }
                      });
                      names.push('"'+ row.item.name +'"');
                      if (!hasUsed){
                        flavors.push(row.item);
                      } else {
                        usedFlavors.push(row.item);
                      }
                    }
                  });
                  self.confirmDelete(flavors, names, usedFlavors);
                });
            };

            // brings up the confirmation dialog
            self.confirmDelete = function(flavors, names, usedFlavors) {
              var all_flavers = flavors.concat(usedFlavors);
              var options = {
                title: context.title,
                tips: context.tips,
                body: interpolate(context.message, [names.length]),
                submit: context.submit,
                name: all_flavers,
                imgOwner: 'instance'
              };
              smodal.modal(options).result.then(function(){
                self.submit(flavors, usedFlavors);
              });
            };

            // on success, remove the flavors from the model
            // need to also remove deleted flavors from selected list
            self.submit = function(flavors, usedFlavors) {
              if (rootScope.rootblock.billing_enable) {
                scope.priceItems = [];
                billingAPI.getPriceItems('instance').success(function(response) {
                  scope.priceItems = response.items;
                  for(var i = 0; i < flavors.length; i++){
                    self.deleteFlavor(flavors[i]);
                  }

                  angular.forEach(usedFlavors, function(flavor){
                    var message = interpolate(context.in_use_error, [flavor.name]);
                    toastService.add('error', message);
                  });
                })
                /* Hejing7: Fix Bug 88985 Begin, even when getprice failed, still need to delete the flavor */
                .error(function(response) {
                  for(var i = 0; i < flavors.length; i++){
                    self.deleteFlavor(flavors[i]);
                  }

                  angular.forEach(usedFlavors, function(flavor){
                    var message = interpolate(context.in_use_error, [flavor.name]);
                    toastService.add('error', message);
                  });
                });
                /* Hejing7: Fix Bug 88985 End, even when getprice failed, still need to delete the flavor */
              }else{
                for(var i = 0; i < flavors.length; i++){
                  self.deleteFlavor(flavors[i]);
                }
                angular.forEach(usedFlavors, function(flavor){
                  var message = interpolate(context.in_use_error, [flavor.name]);
                  toastService.add('error', message);
                });
              }
            };

            self.deleteFlavor = function(flavor) {
              novaAPI.deleteFlavor(flavor.id, true)
                .success(function(response) {
                  // if billing is enabled, delete the flavor price item;
                  // if not ,do not delete.
                  if (rootScope.rootblock.billing_enable) {
                    // delete flavor's priceItem
                    for(var j = 0; j < scope.priceItems.length; j++){
                      if(flavor.id === scope.priceItems[j].flavor.id){
                        billingAPI.deletePriceItem(scope.priceItems[j].id).success(function(){});
                        break;
                      }
                    }
                  }
                  var message = interpolate(context.success, [flavor.name]);
                  toastService.add('success', message);
                  scope.remove_Flavor_after_delete(flavor);
                  scope.clearSelected();
                })
                .error(function(response) {
                  var message = interpolate(context.error, [flavor.name, response]);
                  toastService.add('error', message);
                });
            };
          }

          return action;

        }]);

})();
