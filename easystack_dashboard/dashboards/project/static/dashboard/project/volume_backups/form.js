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

  angular.module('hz.dashboard.project.volume_backups')

  /**
   * @ngdoc snapshotsVolumeFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit volume form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('VolumeBackupFormCtrl', [
    '$scope',
    '$rootScope',
    '$modalInstance',
    'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.settings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.billing',
    'backup', 'context',
    function(scope, rootScope, modalInstance, cinderAPI, novaAPI, usersettingAPI, settingsAPI, keystoneAPI, billingAPI, backup, context) {

      var action = {
        submit: function() {
          modalInstance.close(scope.backup);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };
      scope.changeVolume = function (volume){
        scope.backup.volume = volume;
        cinderAPI.getVolumeBackup(volume.id).success(function(data){
          if(data.items.length>0){
            scope.increDisableTag = false;
          }else{
            scope.increDisableTag = true;
          }
        });
      };
      scope.context = context;
      scope.backup = backup;
      scope.backup.backup_type = 'full';
      if(backup.id){
        if(scope.backup){
          scope.backup.volume = {};
          scope.backup.volume.id = backup.id;
          scope.backup.volume.size = backup.size;
          scope.backup.volume_name = backup.name;
          cinderAPI.getVolumeBackup(backup.id).success(function(data){
            if(data.items.length>0){
              scope.increDisableTag = false;
            }else{
              scope.increDisableTag = true;
            }
          });
        }
      }else{
        cinderAPI.getVolumes().success(function(response) {
          scope.volumes = [];

          angular.forEach(response.items, function(row, index){
            if(row.status === 'available'){
              scope.volumes.push(row);
            }
          });

        });
      }
      scope.action = action;

      var unitPrice;

        if (rootScope.rootblock.billing_need) {
          scope.showBilling = true;
          if (rootScope.rootblock.active_fixing) {
            // get get router price
            //query floatingip items
            billingAPI.getPriceItems('backup-full').success(function(data) {
              //scope.volume.size = 1;
              scope.unitPrice = data.items[0];
              scope.price = Number(scope.unitPrice['fee_hour']);
            });
            billingAPI.getPriceItems('backup-increment').success(function(data) {
              scope.unitPrice2 = data.items[0];
              scope.price2 = Number(scope.unitPrice2['fee_hour']);
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
                if(backup.backup_type === 'full'){
                  scope.price = scope.unitPrice['fee_month'];
                }else if(backup.backup_type === 'increment'){
                  scope.price = scope.unitPrice2['fee_month'];
                }else{
                }
       	        scope.backup.unit = 'M';
       	      }else if(scope.unitSelect && scope.unitSelect.unit === 'Y'){
       	        if(backup.backup_type === 'full'){
                  scope.price = scope.unitPrice['fee_year'];
                }else if(backup.backup_type === 'increment'){
                  scope.price = scope.unitPrice2['fee_year'];
                }else{
                }
       	        scope.backup.unit = 'Y';
       	      }else{
                if(backup.backup_type === 'full'){
                  scope.price = scope.unitPrice['fee_hour'];
                }else if(backup.backup_type === 'increment'){
                  scope.price = scope.unitPrice2['fee_hour'];
                }else{
                }
       	        scope.backup.unit = 'H';
       	      }
            };

            scope.$watchCollection('backup.backup_type',
              function (newValue, oldValue, scope) {
                if (newValue && newValue.length > 0) {
                  if(newValue === 'full'){
                    if(scope.backup.unit === 'H'){
                      scope.price = scope.unitPrice['fee_hour'];
                    }else if(scope.backup.unit === 'M'){
                      scope.price = scope.unitPrice['fee_month'];
                    }else if(scope.backup.unit ==='Y' ){
                      scope.price = scope.unitPrice['fee_year'];
                    }else{
                      if(scope.unitPrice){
                        scope.price = scope.unitPrice['fee_hour'];
                      }
                    }
                  }else if(newValue === 'increment'){
                    if(scope.backup.unit === 'H'){
                      scope.price = scope.unitPrice2['fee_hour'];
                    }else if(scope.backup.unit === 'M'){
                      scope.price = scope.unitPrice2['fee_month'];
                    }else if(scope.backup.unit ==='Y' ){
                      scope.price = scope.unitPrice2['fee_year'];
                    }else{
                      if(scope.unitPrice){
                        scope.price = scope.unitPrice2['fee_hour'];
                      }
                    }
                  }
                }
              }
            );
          } else {
            scope.noFixing = true;
          }
        }

    }])
    .controller('VolumeBackupRestoreFormCtrl', ['$scope', '$modalInstance',
    'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.settings',
    'horizon.openstack-service-api.keystone',
    'backup', 'context',
    function(scope, modalInstance, cinderAPI, novaAPI, usersettingAPI, settingsAPI, keystoneAPI, backup, context) {

      var action = {
        submit: function() {
          modalInstance.close(scope.backup);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };
      cinderAPI.getVolumes().success(function(response) {
        var data = response.items;
        scope.volumes = [];

        for(var i=0; i<data.length; i++){
          if(data[i].status === 'available'){
            scope.volumes.push(data[i]);
          }
        }

        scope.backup.volume = scope.volumes[0];

      });
      scope.changeVolume = function (volume){
        scope.backup.volume = volume;
        if(volume.id === 'Choose No'){
          scope.volNameChangeAction();
        }else{
          scope.volNameTag = false;
        }
      };

      scope.volNameChangeAction = function (){
        scope.backup.volNameTag = false;
      };
      scope.context = context;
      scope.backup = backup;
      scope.action = action;

    }]);
})();
