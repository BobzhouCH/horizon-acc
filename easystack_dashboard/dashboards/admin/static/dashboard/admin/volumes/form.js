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

  angular.module('hz.dashboard.project.volumes')

    /**
     * @ngdoc volumeformCtrl
     * @ng-controller
     *
     * @description
     * This controller is use for the create and edit volume form.
     * Refer to angular-bootstrap $modalInstance for further reading.
     */
    .controller('adminVolumeFormCtrl', ['$scope', '$modalInstance',
        'horizon.openstack-service-api.cinder',
        'horizon.openstack-service-api.nova',
        'horizon.openstack-service-api.glance',
        'volume', 'context', 'horizon.openstack-service-api.billing', '$rootScope',
        function(scope, modalInstance, cinderAPI, novaAPI, glanceAPI, volume, context, billingAPI, rootScope) {

          var dropdown = {};
          var action = {
            submit: function() {
              modalInstance.close(volume);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };

          scope.volumeSizeChange = false;
          if (context.mode == 'extend') {
            var volumewidth = volume.size;
            scope.volumeSizeChange = true;
            scope.$watch('volume.size', function(newv, oldv) {
              if (volumewidth != newv) {
                scope.volumeSizeChange = false;
              } else {
                scope.volumeSizeChange = true;
              }
            });
            scope.volumeExpansion = { max: 1000, min: volume.oldSize, ctrl: true, unit: 'GB', defVal: 1 };
          }

          // get volume types
          if (context.mode === 'create'){
            cinderAPI.getVolumeTypes().success(function(response) {
              dropdown.types = response.items;
              if (dropdown.types.length > 0)
                volume.volume_type = dropdown.types[0].id;
            });

            glanceAPI.getImages().success(function(response) {
              dropdown.images = response.items;
            });

            // Drag and drop the maximum value of Max,
            // min is the initial value, Ctrl is the control of the default control.
            scope.volumeDef = { max: 1000, min: 1, ctrl: true, unit: 'GB', defVal: 1 };

            scope.$watch('volume.image_id', function(newv, oldv) {
              if (oldv != newv) {
                scope.volume.size = scope.volumeDef.min = 1;
                for (var i = 0; i <= dropdown.images.length-1; i++) {
                  var image = dropdown.images[i];
                  if (image.id === newv) {
                    if (image.min_disk >= 1) {
                      scope.volume.size = scope.volumeDef.min = image.min_disk;
                    } else {
                      scope.volume.size = scope.volumeDef.min = 1;
                    }
                    break;
                  }
                }
              }
            });
          }
          else if (context.mode === 'attach'){
            novaAPI.getServers({status: ["ACTIVE", "PAUSED", "SHUTOFF", "RESIZED"]}).success(function(response) {
              dropdown.instances = response.items;
            });
          } else if (context.mode === 'detach') {
            var attachedInstances = [];
            for (var i = 0; i < volume.attachments.length; i++) {
              var attachment = volume.attachments[i];
              attachedInstances.push({
                id: attachment.server_id,
                name: attachment.instance_name
              });
            }
            dropdown.instances = attachedInstances;
          }

          scope.dropdown = dropdown;
          scope.context = context;
          scope.volume = volume;
          scope.action = action;

          // Drag and drop the maximum value of Max,
          // min is the initial value, Ctrl is the control of the default control.
          scope.volumeDef = {
            max: 1000,
            min: 1,
            ctrl: true,
            unit: 'GB',
            defVal: 1
          };

          var unitPrice;

          if (rootScope.rootblock.billing_need) {
            scope.showBilling = true;
            if (rootScope.rootblock.active_fixing) {
              // get get router price
              //query floatingip items
              billingAPI.getPriceItems('volume').success(function(data) {
                //scope.volume.size = 1;
                unitPrice = data.items[0].fee;
                scope.price = Number(unitPrice);
              });
              if (context.mode === 'create_snapshot') {
                billingAPI.getPriceItems('snapshot').success(function(data) {
                  scope.price2 = Number(data.items[0].fee);
                });
              }
              billingAPI.getBalance().success(function(data) {
                if (data <= 0) {
                  scope.showBalance = true;
                }
              });
            } else {
              scope.noFixing = true;
            }
          }

        }
  ]).controller('adminVolumeStatusFormCtrl', ['$scope', '$modalInstance',
    'volume', 'context', '$rootScope', 'horizon.dashboard.volume.enum.STATUS',
    function(scope, modalInstance, volume, context, rootScope, status) {

      scope.volumeStatus = {
        'available': gettext("Available"),
        'in-use': gettext("In use"),
        'error': gettext("Error"),
        'creating': gettext("Creating"),
        'error_extending': gettext("Error Extending"),
        'extending': gettext("Extending"),
        'attaching': gettext("Attaching"),
        'detaching': gettext("Detaching"),
        'deleting': gettext("Deleting"),
        'error_deleting': gettext("Error Deleting"),
        'backing-up': gettext("Backing Up"),
        'restoring-backup': gettext("Restoring Backup"),
        'error_restoring': gettext("Error Restoring"),
        'maintenance': gettext("Maintenance"),
      };

      var action = {
        submit: function() {
          modalInstance.close(volume);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      scope.context = context;
      scope.volume = volume;
      scope.action = action;
      scope.statuses = status;
      scope.initStatus = volume.status;

    }]);

})();
