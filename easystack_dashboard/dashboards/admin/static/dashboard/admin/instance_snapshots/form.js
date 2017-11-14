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

  angular.module('hz.dashboard.admin.instance_snapshots')

  /**
   * @ngdoc instanceSnapshotFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit instance snapshot form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('instanceSnapshotFormAdminCtrl', ['$scope', '$modalInstance',
    'instance_snapshot', 'context', '$rootScope',
    function(scope, modalInstance, instance_snapshot, context, rootScope) {

      var action = {
        submit: function() {
          modalInstance.close(instance_snapshot);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      scope.instance_snapshot = instance_snapshot;
      scope.action = action;
      scope.context = context;

    }])
  .controller('instanceSnapshotsVolumeFormCtrl', ['$scope', '$modalInstance',
    'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.nova',
    'volume', 'context', 'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    '$rootScope', '$filter', 'horizon.framework.esutils.Utils',
    function(scope, modalInstance, cinderAPI, novaAPI, volume, context, billingAPI, usersettingAPI, keystoneAPI, rootScope, filter, utils) {

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
          if (dropdown.types.length > 0)
            volume.volume_type = dropdown.types[0].id;
        });
        volume.size = utils.bytesToGBNoPoint(volume.size);
      }


      //control the tips of gigabytes quota exceeded
      if (context.mode === 'create'){
        var gigabytes_available, gigabytes_quota;
        keystoneAPI.getCurrentUserSession()
        .success(function(response) {
          usersettingAPI.getProjectQuota(response.project_id, {only_quota: false})
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

      // Drag and drop the maximum value of Max,
      // min is the initial value, Ctrl is the control of the default control.
      scope.volumeDef = {
        max: 1000,
        min: volume.size,
        ctrl: true,
        unit: 'GB',
        defVal: 1
      };

      var unitPrice;

      if (rootScope.rootblock.billing_need) {
        scope.showBilling = true;
        if (rootScope.rootblock.active_fixing) {
          billingAPI.getPriceItems('volume').success(function(data) {
            unitPrice = data.items[0].fee;
            scope.price = Number(unitPrice);
          });
          billingAPI.getBalance().success(function(data) {
            if (data <= 0) {
              scope.showBalance = true;
            }
          });
        } else {
          scope.noFixing = true;
        }
      }

    }]);
})();

