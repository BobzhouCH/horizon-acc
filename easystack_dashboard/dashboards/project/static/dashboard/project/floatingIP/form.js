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

  angular.module('hz.dashboard.project.floatingIP')

  /**
   * @ngdoc floatingIPformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the allocate and release floating ip form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('floatingIPFormCtrl', [
        '$scope',
        '$modalInstance',
        'horizon.openstack-service-api.floatingip',
        'floatingip',
        'context',
        'qosRules',
        'horizon.openstack-service-api.billing',
        '$rootScope',
        'horizon.openstack-service-api.neutron',
        'horizon.openstack-service-api.nova',
        'horizon.openstack-service-api.keystone',
        'horizon.openstack-service-api.settings',
    function(scope, modalInstance, floatingipAPI, floatingip, context, lenovoQoS,
        billingAPI, rootScope, neutronAPI, novaAPI, keystoneAPI, settingsAPI) {

      var dropdown = {};

      var action = {
        submit: function() {
          modalInstance.close(scope.floatingip);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };
      function getUnitPrice(){
        var unitPrice;
        if (rootScope.rootblock.billing_need) {
          scope.showBilling = true;
          if (rootScope.rootblock.active_fixing) {
            //query floatingip items
            billingAPI.getPriceItems('floatingip').success(function(data) {
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
                if(data && context.mode == 'bandwidth'){
                  billingAPI.getProductById(floatingip.id).success(function(data){
                    var fl = data.items ;
                     angular.forEach(scope.payment_type ,function(arr){

                       if(fl[0].unit === arr.unit){
                         scope.unitSelect = arr;
                         billingAPI.getPriceItems('floatingip').success(function(data) {
                           scope.unitPrice = data.items[0];
                           if(arr.unit === 'H'){
                             scope.price = scope.unitPrice['fee_hour'];
                           }else if(arr.unit === 'M'){
                             scope.price = scope.unitPrice['fee_month'];
                           }else{
                             scope.price = scope.unitPrice['fee_year'];
                           }
                         });
                         if(scope.floatingIP){
                           scope.floatingIP.unit = fl[0].unit;
                         }
                       }

                     });

                  });

                }
              }

            );

            scope.payment_type = [
              {unit:'H',unitLabel:gettext('By Hour')},
              {unit:'M',unitLabel:gettext('By Month')},
              {unit:'Y',unitLabel:gettext('By Year')}
            ];

            scope.unitSelect = scope.payment_type[0];
            scope.changePayment = function (payment){
              scope.floatingip.unitSelect = payment;
              if(scope.unitSelect && scope.floatingip.unitSelect.unit === 'M'){
       	        scope.price = scope.unitPrice['fee_month'];
       	        scope.floatingip.unit = 'M';
       	      }else if(scope.unitSelect && scope.floatingip.unitSelect.unit === 'Y'){
       	        scope.price = scope.unitPrice['fee_year'];
       	        scope.floatingip.unit = 'Y';
       	      }else{
       	        scope.price = scope.unitPrice['fee_hour'];
       	        scope.floatingip.unit = 'H';
       	      }
            };
            /*scope.$watch('floatingip.unitSelect.unit', function(newVal, oldVal){
			           if(newVal){
			             scope.floatingip.unit = newVal;
			             scope.price =
			           }
				  },true);*/

          } else {
            scope.noFixing = true;
          }
        }
      }
      scope.bandwidthDisa = false;
      if (context.mode == 'bandwidth') {

        var oBrandwidth = floatingip.bandwidth;
        scope.bandwidthDisa = true;
        scope.$watch('floatingip.bandwidth', function(newv, oldv) {
          if (oBrandwidth != newv) {
            scope.bandwidthDisa = false;
          } else {
            scope.bandwidthDisa = true;
          }
        });
        getUnitPrice();

        scope.bandwidthUpdateDef = {
           min:1,
           max:100
        };

        if (!floatingip.bandwidth) {
          floatingip.bandwidth = scope.bandwidthUpdateDef.min;
        }

        if (floatingip.pool && floatingip.pool.name) {
          var poolName = floatingip.pool.name;

          if (poolName && lenovoQoS &&
              !(poolName.search(lenovoQoS.INTRANET.name) >= 0 &&
                poolName.search(lenovoQoS.INTERNET.name) >= 0)) {
            if (poolName.search(lenovoQoS.INTRANET.name) >= 0) {
              scope.bandwidthUpdateDef.max = lenovoQoS.INTRANET.bandwidthMax;
              scope.bandwidthUpdateDef.min = lenovoQoS.INTRANET.bandwidthMin;
            } else if (poolName.search(lenovoQoS.INTERNET.name) >= 0) {
              scope.bandwidthUpdateDef.max = lenovoQoS.INTERNET.bandwidthMax;
              scope.bandwidthUpdateDef.min = lenovoQoS.INTERNET.bandwidthMin;
            }
          }
          //floatingip.bandwidth = scope.bandwidthUpdateDef.min;
        }
      }
      else if (context.mode == 'allocate') {
        // get floating ip pools
        floatingipAPI.getFloatingIPPools().success(function(response) {
          keystoneAPI.getCloudAdmin().success(function(isCloudAdmin) {
            if (!isCloudAdmin && lenovoQoS) {
              dropdown.pools = response.items.filter(function(item) {
                return item.name.search(lenovoQoS.INTERNET.name) < 0;
              });
            } else {
              dropdown.pools = response.items;
            }
            scope.floatingip.pool = dropdown.pools.length === 1 ? dropdown.pools[0] : '';

          });
        });
        getUnitPrice();

        scope.bandwidthDef = {
          max: 100,
          min: 1
        };

        if (!floatingip.bandwidth) {
          floatingip.bandwidth = scope.bandwidthDef.min;
        }

        scope.$watch('floatingip.pool', function(newv, oldv) {
          if (!newv || newv === oldv) {
            return;
          }

          var poolName = floatingip.pool.name;

          if (poolName && lenovoQoS &&
              !(poolName.search(lenovoQoS.INTRANET.name) >= 0 &&
                poolName.search(lenovoQoS.INTERNET.name) >= 0)) {
            if (poolName.search(lenovoQoS.INTRANET.name) >= 0) {
              scope.bandwidthDef.max = lenovoQoS.INTRANET.bandwidthMax;
              scope.bandwidthDef.min = lenovoQoS.INTRANET.bandwidthMin;
            } else if (poolName.search(lenovoQoS.INTERNET.name) >= 0) {
              scope.bandwidthDef.min = lenovoQoS.INTERNET.bandwidthMin;
              scope.bandwidthDef.max = lenovoQoS.INTERNET.bandwidthMax;
            }

            floatingip.bandwidth = scope.bandwidthDef.min;
          }
        });
      }
      else if (context.mode == 'associate-instance') {
        var map_servers = {};

        var serverHasFloatingip = function (server) {
          for (var network in server.ip_groups){
            var ips = server.ip_groups[network];
            if(ips.floating.length > 0){
              return true;
            }
          }
          return false;
        };

        var filterInstancePorts = function(ports){
          var instance_ports = [];
          ports.forEach(function(item) {
            if (item.device_owner.indexOf("compute") != -1){
              var server = map_servers[item.device_id];
              if (server){
                if (!serverHasFloatingip(server)){
                  item.device_name = server.name;
                  instance_ports.add(item);
                }
              }
            }
          });
          return instance_ports;
        };
        novaAPI.getServers().success(function(data){
          var servers = data.items;
          if(servers.length == 0){
            return;
          }
          servers.forEach(function(item){
            map_servers[item.id] = item;
          });
          var filter = {
            "tenant_id": floatingip.tenant_id
          };
          neutronAPI.getComputePorts(filter).success(function(data){
            dropdown.ports = filterInstancePorts(data.items);
          });
        });
      }
      else if (context.mode == 'associate-router') {
        var filterNonGatewayRouters = function (routers) {
          var nonGatewayRouters = [];
          routers.forEach(function(item){
            if (! item.external_gateway_info){
              nonGatewayRouters.add(item);
            }
          });
          return nonGatewayRouters;
        };

        var filter = {
          'tenant_id': floatingip.tenant_id
        };
        neutronAPI.getRouters(filter).success(function(data) {
          dropdown.routers = filterNonGatewayRouters(data.items);
        });
      }

      scope.dropdown = dropdown;
      scope.context = context;
      scope.action = action;
      scope.floatingip = floatingip;
    }
  ]);
})();
