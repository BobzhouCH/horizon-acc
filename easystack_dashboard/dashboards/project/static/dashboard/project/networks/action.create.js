(function() {
  'use strict';

  angular.module('hz.dashboard.project.networks')
    .factory('valFactoryEmit', function(){
        return {};
    })

    .factory('subnetCreateAction', ['$rootScope', 'horizon.openstack-service-api.neutron', 'horizon.openstack-service-api.usersettings', 'horizon.openstack-service-api.keystone', '$modal','backDrop', 'horizon.dashboard.network.Path',
          'horizon.framework.widgets.toast.service',
      function(rootScope, neutronAPI, usersettingAPI, keystoneAPI, modal, backdrop, path, toastService) {

        var context = {
          mode: 'create',
          title: gettext('Create Subnet'),
          submit:  gettext('Create'),
          success: gettext('Subnet %s was successfully created.')
        };

        function action(scope) {

          var self = this;
          var option = {
            templateUrl: path+'form',
            controller: 'neutronFormCtrl',
            windowClass: 'neutronListContent',
            backdrop: backdrop,
            resolve: {
              subnet: function(){ return {}; },
              context: function(){ return context; },
              subnetId: function(){return {};}
            }
          };

          self.open = function(subnetId){
            option.resolve.subnetId = function(){ return subnetId; };
            modal.open(option).result.then(self.submit);
          };

          self.createSubnetJson = function(newSubnet){
            var subnetJson = {};

            subnetJson.network_id = newSubnet.network_id;
            subnetJson.ip_version = 4;
            subnetJson.cidr = newSubnet.cidr;
            subnetJson.name = newSubnet.name;

            subnetJson.enable_dhcp = newSubnet.enable_dhcp;
            if(!newSubnet.enable_gateway) {
               subnetJson.gateway_ip = null;
            } else {
               subnetJson.gateway_ip = newSubnet.gateway_ip;
            }

            if (newSubnet.dns_nameservers.length > 0){
               subnetJson.dns_nameservers = newSubnet.dns_nameservers;
            }
            if (newSubnet.host_routes.length > 0){
              subnetJson.host_routes = newSubnet.host_routes;
            }
            if (newSubnet.allocation_pools.length > 0){
              subnetJson.allocation_pools = newSubnet.allocation_pools;
            }
            return subnetJson;
          };

          self.submit = function(newSubnet) {
            var subnetJson = self.createSubnetJson(newSubnet);
            neutronAPI.createSubnet(subnetJson)
              .success(function(response) {
                scope.safeSubnets.unshift(response);
                var message = interpolate(context.success, [newSubnet.name]);
                toastService.add('success', message);
                if(!scope.context.header.network){
                  rootScope.$broadcast('subnetRefresh');
                }
                rootScope.$broadcast('networkRefresh');
              });
              scope.$table.resetSelected();
          };

        }

        return action;
    }])

    .factory('networksCreateAction', ['$rootScope', 'backDrop', 'horizon.openstack-service-api.neutron', 'horizon.openstack-service-api.usersettings', '$modal',
           'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.keystone', 'horizon.dashboard.network.Path',
        function(rootScope, backdrop, neutronAPI, usersettingAPI, modal, toastService, keystoneAPI, path) {

          var context = {
            mode: 'create',
            title: gettext('Create Networks'),
            submit:  gettext('Create'),
            success: gettext('Networks %s was successfully created.')
          };

          function action(scope) {

            var self = this;
            var option = {
              templateUrl: path+'networks-form',
              controller: 'networksFormCtrl',
              windowClass: 'networksListContent',
              backdrop: backdrop,
              resolve: {
                network: function(){ return {}; },
                context: function(){ return context; }
              }
            };

            self.open = function(){
              modal.open(option).result.then(self.submit);
            };

            self.submit = function(newNetwork) {
                var createNetWorkJson = {};
                var createSubnetJson  = {};
                newNetwork.admin_state_up = true;
                newNetwork.shared = false;
                if(!newNetwork.enable_gateway)
                  newNetwork['gateway_ip'] = null;
                delete newNetwork.enable_gateway;

                createNetWorkJson.name = newNetwork.name;
                createNetWorkJson.admin_state_up = newNetwork.admin_state_up;
                createNetWorkJson.shared = newNetwork.shared;
                if (newNetwork.tenant_id) {
                  createNetWorkJson.tenant_id = newNetwork.tenant_id;
                }
                if (newNetwork.type && newNetwork.typeID && newNetwork.physical_network){
                  createNetWorkJson['provider:network_type'] = newNetwork.type;
                  createNetWorkJson['provider:segmentation_id'] = newNetwork.typeID;
                  createNetWorkJson['provider:physical_network'] = newNetwork.physical_network;
                }
                neutronAPI.createNetwork(createNetWorkJson)
                  .success(function(response) {

                    var networkResult = response;
                    if (newNetwork.tenant_id) {
                      keystoneAPI.getCurrentUserSession().success(function(data) {
                        if (response.tenant_id == data.project_id) {
                          scope.networks.unshift(networkResult);
                        }
                      });
                    } else {
                      scope.networks.unshift(networkResult);
                    }
                    if(newNetwork.with_subnet){}
                    createSubnetJson.network_id = response.id;
                    createSubnetJson.ip_version = 4;
                    createSubnetJson.name = newNetwork.defaultSubnetName;
                    if (newNetwork.tenant_id) {
                      createSubnetJson.tenant_id = newNetwork.tenant_id;
                    }

                    createSubnetJson.cidr = newNetwork.cidr;
                    createSubnetJson.enable_dhcp = newNetwork.enable_dhcp;
                    createSubnetJson.gateway_ip = newNetwork.gateway_ip;

                    if (newNetwork.dns_nameservers.length > 0){
                      createSubnetJson.dns_nameservers = newNetwork.dns_nameservers;
                    }
                    if (newNetwork.allocation_pools.length > 0){
                      createSubnetJson.allocation_pools = newNetwork.allocation_pools;
                    }
                    if (newNetwork.host_routes.length > 0){
                      createSubnetJson.host_routes = newNetwork.host_routes;
                    }

                    neutronAPI.createSubnet(createSubnetJson).success(function(response){
                        var subnetSum = response.name + ":[" + response.cidr + "] ";
                        networkResult.subnetSummary = subnetSum;
                        networkResult.subnets.push(response);
                        rootScope.$broadcast('subnetRefresh');
                    });


                    var message = interpolate(context.success, [createNetWorkJson.name]);
                    toastService.add('success', message);
                });
                scope.$table.resetSelected();
            };
          }

          return action;
        }]);

  })();
