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

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngdoc listenerFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit volume form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('listenerFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.lbaasv2',
    'horizon.openstack-service-api.neutron',
    'horizon.openstack-service-api.floatingip',
    'horizon.openstack-service-api.security-group',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.settings',
    'listener', 'context', 'horizon.framework.esutils.Utils', 'qosRules',
    function(scope, rootScope, modalInstance,
      usersettingAPI, keystoneAPI, loadbalancerAPI, neutronAPI, floatingipAPI,
      securityGroupAPI, billingAPI, settingsAPI, listener, context, utils, lenovoqoS) {

      var dropdown = {},
          action = {
            submit: function() {
              modalInstance.close(listener);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };

      dropdown.protocols = [
        {key: 'TCP',   value: gettext('TCP')},
        {key: 'HTTP',  value: gettext('HTTP')},
        {key: 'HTTPS', value: gettext('HTTPS')}
      ];

      dropdown.connection_limit = [
        {key: '5000',  value: 5000},
        {key: '10000', value: 10000},
        {key: '20000', value: 20000},
        {key: '40000', value: 40000}
      ];

      // get listener types
      if (context.mode === 'create'){
        neutronAPI.getSubnets().success(function(response){
          dropdown.vip_subnets = response.items;
        });

        // get security groups for selection
        securityGroupAPI.query().success(function(response) {
          dropdown.canSelectSecurityGroups = response.items;
        });
      }

      if (context.mode === 'edit'){
        floatingipAPI.getFreeTenantFloatingIP().success(function(response){
          dropdown.floatingips = response.items;
        });
      }


      if (rootScope.rootblock.billing_need) {
          scope.showBilling = true;
          if (rootScope.rootblock.active_fixing) {

            billingAPI.getPriceItems('lbaas').success(function(data) {
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
                scope.listener.unit = 'M';

                }else if(scope.unitSelect && scope.unitSelect.unit === 'Y'){
                scope.price = scope.unitPrice['fee_year'];
                scope.listener.unit = 'Y';
              }else{
                scope.price = scope.unitPrice['fee_hour'];
                scope.listener.unit = 'H';
              }
             };
          } else {
            scope.noFixing = true;
          }
        }

        scope.dropdown = dropdown;
        scope.context = context;
        scope.listener = listener;
        scope.action = action;
      }])

})();
