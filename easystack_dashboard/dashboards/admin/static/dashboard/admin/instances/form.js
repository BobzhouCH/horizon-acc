/**
 * Copyright 2015 Easystack Corp.
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

  angular.module('hz.dashboard.admin.instances')

  /**
   * @ngdoc routerformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit router form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('hz.dashboard.admin.instances.FormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.nova',
    'context', 'instance',
    function(scope, modalInstance, novaAPI, context, instance) {
      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(instance);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      scope.dropdown = dropdown;
      scope.context = context;
      scope.instance = instance;
      scope.action = action;

      if(context.loadDataFunc) {
        context.loadDataFunc(scope);
      }
    }
  ])

  .controller('hz.dashboard.admin.instances.instanceFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.nova', 'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.neutron', 'horizon.openstack-service-api.floatingip',
    'horizon.openstack-service-api.billing', 'horizon.openstack-service-api.security-group',
    'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.settings',
    'instance', 'context',
    function(scope, rootScope, modalInstance,
      novaAPI, cinderAPI, neutronAPI, floatingipAPI, billingAPI, securityGroupAPI, glanceAPI, settingsAPI,
      instance, context
    ) {
      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(instance);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
      };

      scope.dropdown = dropdown;
      scope.context = context;
      scope.instance = instance;
      scope.action = action;

      if(context.loadDataFunc != null) {
        context.loadDataFunc(scope);
      }

      if (rootScope.rootblock.billing_need) {
        scope.showBilling = true;
        if (rootScope.rootblock.active_fixing) {
          if(context.mode === "createsnapshot"){
            billingAPI.getPriceItems('image').success(function(data) {
              scope.unitPrice = data.items[0];
              scope.price = Number(scope.unitPrice['fee_hour']);
              scope.monthPrice = (scope.price * 12 * 30).toFixed(2);
            });
          }
          /*billingAPI.getPriceItems('instance').success(function(data) {
            scope.unitPrice = data.items[0];
            scope.price = Number(scope.unitPrice['fee_hour']);
            scope.monthPrice = (scope.price * 12 * 30).toFixed(2);
          });*/
          scope.showBalance = true;
          billingAPI.getBalance().success(function(data) {
            if (data <= 0) {
              scope.showBalance = true;
            } else {
              scope.showBalance = false;
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
              scope.price = Number(scope.unitPrice['fee_month']);
              scope.instance.unit = 'M';
            }else if(scope.unitSelect && scope.unitSelect.unit === 'Y'){
              scope.price = Number(scope.unitPrice['fee_year']);
              scope.instance.unit = 'Y';
            }else{
              scope.price = Number(scope.unitPrice['fee_hour']);
              scope.instance.unit = 'H';
            }
          };
        } else {
          scope.noFixing = true;
        }
      }

    }
  ]);

})();
