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

  angular.module('hz.dashboard.project.volume_snapshots')

  /**
   * @ngdoc snapshotsVolumeFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit volume form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('snapshotsVolumeFormCtrl', ['$scope', '$modalInstance',
    'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.settings',
    'horizon.openstack-service-api.keystone',
    'volume', 'context', 'horizon.openstack-service-api.billing', '$rootScope',
    function(scope, modalInstance, cinderAPI, novaAPI, usersettingAPI, settingsAPI, keystoneAPI, volume, context, billingAPI, rootScope) {

      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(volume);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      // get volume types
      if (context.mode === 'create'){
        cinderAPI.getVolumeTypes().success(function(response) {
          if (response.items.length) {
            dropdown.typesHide = true;
          }
          dropdown.types = response.items;
          //Hejing: remove following code, since the volume created should use the parent volume type.
          // if (dropdown.types.length > 0 && !volume.volume_type){
          //   volume.volume_type = dropdown.types[0].name;
          // }
        });
        var gigabytes_available, gigabytes_quota;
        keystoneAPI.getCurrentUserSession()
        .success(function(response) {
          usersettingAPI.getComponentQuota(response.project_id, {only_quota: false, component_name: 'cinder'})
          .success(function(data){
            for (var i = 0; i < data.items.length; i++){
              if (data.items[i].name == 'gigabytes'){
                gigabytes_available = data.items[i].usage.available;
                gigabytes_quota = data.items[i].usage.quota;
                break;
              }
            }
            scope.$watch('volume.size', function(newv, oldv) {
              if (oldv != newv) {
                scope.quota_exceeded = false;
                if (volume.size > gigabytes_available && volume.size <= gigabytes_quota){
                  scope.quota_exceeded = true;
                }
              }
            });
          });
        });
      }

      scope.dropdown = dropdown;
      scope.context = context;
      scope.volume = volume;
      scope.action = action;

      // Drag and drop min
      scope.volume.min = volume.size;

      var unitPrice;

      if (rootScope.rootblock.billing_need) {
        scope.showBilling = true;
        if (rootScope.rootblock.active_fixing) {
          billingAPI.getPriceItems('volume').success(function(data) {
            scope.unitPrice = data.items[0];
            scope.price = Number(scope.unitPrice['fee_hour']);
          });
          billingAPI.getBalance().success(function(data) {
            if (data <= 0) {
              scope.showBalance = true;
            }
          });

          settingsAPI.getSetting('PREBILLING',false).then(

              function success(data){
                scope.preBilling = data;
              }

            );

            scope.payment_type = [
              {unit:'H',unitLabel:gettext('By Hour')},
              {unit:'M',unitLabel:gettext('By Month')},
              {unit:'Y',unitLabel:gettext('By Year')}
            ];

            scope.unitSelect = scope.payment_type[0];
            scope.changePayment = function (payment){
              scope.unitSelect = payment;
              if(scope.unitSelect && scope.unitSelect.unit === 'M'){
                  scope.price = scope.unitPrice['fee_month'];
       	          scope.volume.unit = 'M';

       	      }else if(scope.unitSelect && scope.unitSelect.unit === 'Y'){
                  scope.price = scope.unitPrice['fee_year'];
       	          scope.volume.unit = 'Y';
       	      }else{
                  scope.price = scope.unitPrice['fee_hour'];
       	          scope.volume.unit = 'H';
       	      }
            };
        } else {
          scope.noFixing = true;
        }
      }

    }]);
})();