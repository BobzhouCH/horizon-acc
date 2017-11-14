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
   * @ngdoc volumeformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit volume form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('loadbalancerFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.lbaasv2',
    'horizon.openstack-service-api.neutron',
    'horizon.openstack-service-api.floatingip',
    'horizon.openstack-service-api.security-group',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.settings',
    'loadbalancer', 'context', 'horizon.framework.esutils.Utils', 'qosRules','allocateFloatingIPAction',

    function(scope, rootScope, modalInstance,
      usersettingAPI, keystoneAPI, loadbalancerAPI, neutronAPI, floatingipAPI,
      securityGroupAPI, billingAPI, settingsAPI, loadbalancer, context, utils, lenovoQoS, allocateFloatingIPAction) {

      var dropdown = {},
          action = {
            submit: function() {
              modalInstance.close(loadbalancer);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };

      scope.openAllocateDialog = function(){
        new allocateFloatingIPAction(scope).open();
        action.cancel();
      }

      if (context.mode === 'create'){
        neutronAPI.getSubnets().success(function(response){
          var subnets = response.items;
          angular.forEach(subnets, function(subnet){
            if(subnet.network_router_extenal == true){
              subnets.remove(subnet);
            }
          })
          dropdown.vip_subnets = response.items;
        });

        // get security groups for selection
        securityGroupAPI.query().success(function(response) {
          dropdown.canSelectSecurityGroups = response.items;
        });
      }

      if (context.mode === 'associateFloatingIp'){
        scope.is_router_connected = true;
        loadbalancerAPI.getLoadBalancer(loadbalancer.loadbalancer.id, true)
        .success(function(response) {
            scope.is_router_connected = response.is_router_connected;
            floatingipAPI.getFreeTenantFloatingIP().success(function(response){
              dropdown.floatingips = response.items;
              if(response.items.length > 0){
                scope.floatingipNotAvailable = false;
              }else{
                scope.floatingipNotAvailable = true;
              }
            });
         })
      }

      if (context.mode === 'disassociateFloatingIp'){
        var floatingips = []
        if(loadbalancer.loadbalancer.floating_ip != undefined){
          floatingips.push(loadbalancer.loadbalancer.floating_ip);
        }
        dropdown.floatingips = floatingips;
      }

      if (context.mode === 'editSecurityGroup'){
          securityGroupAPI.query().success(function(response) {
          dropdown.canSelectSecurityGroups = response.items;
        });
      }

        scope.dropdown = dropdown;
        scope.context = context;
        scope.loadbalancer = loadbalancer;
        scope.action = action;
      }])

})();
