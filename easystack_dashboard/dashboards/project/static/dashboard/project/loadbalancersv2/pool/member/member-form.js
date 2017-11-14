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
   * @ngdoc memberFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the add and modify loadbalancer member form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('memberFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.lbaasv2',
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.neutron',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'member', 'members', 'context', 'horizon.framework.esutils.Utils','pool',
    function(scope, rootScope, modalInstance,
      lbaasv2API, novaAPI, glanceAPI, billingAPI, neutronAPI, usersettingAPI, keystoneAPI,
      member, members, context, utils, pool) {

      var memberServerList = [];
      if (members) {
        for (var i=0; i<=members.length-1; i++) {
          memberServerList.push(members[i]['instance_id']);
        }
      }

      var dropdown = {},
          action = {
            submit: function () {
              modalInstance.close(member);
            },
            cancel: function () {
              modalInstance.dismiss('cancel');
            }
          };

      scope.memberWeightChange = false;
      scope.subnetDataReady = false;
      if (context.mode === 'modifyWeight') {
        var memberwidth = member.weight;
        scope.memberWeightChange = true;
        scope.$watch('member.weight', function (newm, oldm) {
          if (memberwidth != newm) {
            scope.memberWeightChange = false;
          } else {
            scope.memberWeightChange = true;
          }
        });
      }

      // get available instances
      if (context.mode === 'add' || context.mode === 'modifyWeight') {
        novaAPI.getServers({status: ["ACTIVE"]}).success(function (response) {
          var instances = [];
          for (var i=0; i<=response.items.length-1; i++) {
            var server = response.items[i];
            if (memberServerList.indexOf(server.id) < 0) {
              instances.push(server);
            }
          }
          neutronAPI.getSubnets().success(function(response){
            var vip_subnets = response.items;
            for(var i = 0; i< vip_subnets.length; i++){
              var instancesNetIncluded = [];
              for(var j = 0; j < instances.length; j++){
                if(isInstanceNetInSubnet(vip_subnets[i], instances[j])) {
                  var cleanInstance = cleaneInstance(instances[j], vip_subnets[i].network_name);
                  instancesNetIncluded.push(cleanInstance);
                }
              }
              vip_subnets[i].instancesNetIncluded = instancesNetIncluded;
            }
            var subnetsHasInstance = [];
            for(var i = 0; i < vip_subnets.length; i++){
              if(vip_subnets[i].instancesNetIncluded.length != 0){
                subnetsHasInstance.push(vip_subnets[i]);
              }
            }
            scope.vip_subnets = subnetsHasInstance;
            scope.subnetDataReady = true;
          });
        });
      }

      function cleaneInstance(instance, network_name){
        var cleanedInstance = {
          address: instance.addresses[network_name][0].addr,
          name: instance.name
        };
        return cleanedInstance;
      }

      scope.changeSubnetToSelect = function(subnetId){
        scope.instancesNetIncluded=[];
        for(var i = 0; i < scope.vip_subnets.length; i++){
          if(subnetId == scope.vip_subnets[i].id){
            scope.instancesNetIncluded = scope.vip_subnets[i].instancesNetIncluded;
          }
        }
      };

      function isInstanceNetInSubnet(subnet, instance){
         var instanceNetwork = instance.addresses[subnet.network_name];
         if(instanceNetwork != undefined){
           for(var i = 0; i < subnet.allocation_pools.length; i++){
             if(subnet.allocation_pools[i].start == instanceNetwork[0].addr ||
                subnet.allocation_pools[i].end == instanceNetwork[0].addr){
                return true;
             }
             if(compareAddress(instanceNetwork[0].addr, subnet.allocation_pools[i].start) &&
                compareAddress(subnet.allocation_pools[i].end, instanceNetwork[0].addr)){
                 return true;
             }
           }
         }
         return false;
      }
      // compare two address if address1 is biger than address2 return true
      function compareAddress(address1, address2){
        var addrArray1 = address1.split('.');
        var addrArray2 = address2.split('.');
        for(var i = 0; i < 4; i++){
          if(parseInt(addrArray1[i]) > parseInt(addrArray2[i])){
            return true;
          }
        }
        return false
      }

      scope.dropdown = dropdown;
      scope.instancesNetIncluded = [];
      scope.pool = pool;
      scope.context = context;
      scope.member = member;
      scope.action = action;

    }
  ])
    .controller('membersFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.lbaasv2',
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.neutron',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'member', 'members', 'context', 'horizon.framework.esutils.Utils','pool',
    function(scope, rootScope, modalInstance,
      lbaasv2API, novaAPI, glanceAPI, billingAPI, neutronAPI, usersettingAPI, keystoneAPI,
      member, members, context, utils, pool) {

      var memberServerList = [];
      if (members) {
        for (var i=0; i<=members.length-1; i++) {
          memberServerList.push(members[i].instance_id);
        }
      }

      var dropdown = {},
          action = {
            submit: function () {
              modalInstance.close(angular.extend(scope.allocatedInstancesNetIncluded,member));
            },
            cancel: function () {
              modalInstance.dismiss('cancel');
            }
          };

      scope.memberWeightChange = false;
      scope.subnetDataReady = false;

      // multi select part vars definition start
      scope.allocatedInstancesNetIncluded = [];
      scope.displayedAllocatedInstancesNetIncluded = [];
      scope.instancesNetIncluded = [];
      scope.displayedInstancesNetIncluded = [];

      scope.tableLimits = {
        maxAllocation: -1
      };
      scope.transferTableModel = {
        allocated:          scope.allocatedInstancesNetIncluded,
        displayedAllocated: scope.displayedAllocatedInstancesNetIncluded,
        available:          scope.instancesNetIncluded,
        displayedAvailable: scope.displayedInstancesNetIncluded
      };
          // filter by select attr
      scope.filterFacets = [
        {
          label: gettext('Name'),
          name: 'name',
          singleton: true
        },
        {
          label: gettext('IP'),
          name: 'address',
          singleton: true
        }
      ];
      scope.$watchCollection(function() {
        return scope.instancesNetIncluded;
      }, function(newAvailable) {
        scope.transferTableModel.available = newAvailable;
      });
      scope.$watchCollection(function() {
        return scope.allocatedInstancesNetIncluded;
      }, function(newAllocated) {
        scope.transferTableModel.allocated = newAllocated;
      });
      // multi select part vars definition end
      // get available instances
      novaAPI.getServers({status: ['ACTIVE']}).success(function (response) {
        var instances = [];
        for (var i=0; i<=response.items.length-1; i++) {
          var server = response.items[i];
          if (memberServerList.indexOf(server.id) < 0) {
            instances.push(server);
          }
        }
        neutronAPI.getSubnets().success(function(response){
          var vip_subnets = response.items;
          for(var k = 0; k< vip_subnets.length; k++){
            var instancesNetIncluded = [];
            for(var j = 0; j < instances.length; j++){
              if(isInstanceNetInSubnet(vip_subnets[k], instances[j])) {
                var cleanInstance = cleaneInstance(instances[j], vip_subnets[k].network_name);
                instancesNetIncluded.push(cleanInstance);
              }
            }
            vip_subnets[k].instancesNetIncluded = instancesNetIncluded;
          }
          var subnetsHasInstance = [];
          for(var m = 0; m < vip_subnets.length; m++){
            if(vip_subnets[m].instancesNetIncluded.length !== 0){
              subnetsHasInstance.push(vip_subnets[m]);
            }
          }
          scope.vip_subnets = subnetsHasInstance;
          scope.subnetDataReady = true;
        });
      });

      function cleaneInstance(instance, network_name){
        var cleanedInstance = {
          address: instance.addresses[network_name][0].addr,
          name: instance.name,
          id: instance.id
        };
        return cleanedInstance;
      }

      scope.changeSubnetToSelect = function(subnetId){

        for(var i = 0; i < scope.vip_subnets.length; i++){
          if(subnetId == scope.vip_subnets[i].id){
            scope.instancesNetIncluded = scope.vip_subnets[i].instancesNetIncluded;
          }
        }
        if(scope.allocatedInstancesNetIncluded && scope.allocatedInstancesNetIncluded.length!==0){
          scope.allocatedInstancesNetIncluded = [];
        }
      };

      function isInstanceNetInSubnet(subnet, instance){
         var instanceNetwork = instance.addresses[subnet.network_name];
         if(instanceNetwork != undefined){
           for(var i = 0; i < subnet.allocation_pools.length; i++){
             if(subnet.allocation_pools[i].start == instanceNetwork[0].addr ||
                subnet.allocation_pools[i].end == instanceNetwork[0].addr){
                return true;
             }
             if(compareAddress(instanceNetwork[0].addr, subnet.allocation_pools[i].start) &&
                compareAddress(subnet.allocation_pools[i].end, instanceNetwork[0].addr)){
                 return true;
             }
           }
         }
         return false;
      }
      // compare two address if address1 is biger than address2 return true
      function compareAddress(address1, address2){
        var addrArray1 = address1.split('.');
        var addrArray2 = address2.split('.');
        for(var i = 0; i < 4; i++){
          if(parseInt(addrArray1[i]) > parseInt(addrArray2[i])){
            return true;
          }
        }
        return false;
      }

      scope.dropdown = dropdown;
      scope.instancesNetIncluded = [];
      scope.pool = pool;
      scope.context = context;
      scope.member = member;
      scope.action = action;

    }
  ]);

})();
