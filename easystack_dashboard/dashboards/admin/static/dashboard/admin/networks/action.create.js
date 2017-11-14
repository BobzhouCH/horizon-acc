(function() {
  'use strict';

  angular.module('hz.dashboard.admin.networks')

    .factory('hz.dashboard.admin.instances.networksCreateAction', ['horizon.openstack-service-api.neutron', '$modal',
        'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.keystone', 'backDrop',
        function(neutronAPI, modal, toastService, keystoneAPI, backDrop) {

          var context = {
            mode: 'create',
            title: gettext('Create Networks'),
            submit:  gettext('Create'),
            success: gettext('Networks %s was successfully created.')
          };

          function action(scope) {

            var self = this;
            var option = {
              templateUrl: 'networks-form',
              controller: 'hz.dashboard.admin.instances.networksFormCtrl',
              backdrop:   backDrop,
              windowClass: 'networksListContent',
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
              if(!newNetwork.shared){
                newNetwork.shared = false;
              }
              if(!newNetwork.enable_gateway)
                newNetwork['gateway_ip'] = null;
              delete newNetwork.enable_gateway;

              createNetWorkJson.name = newNetwork.name;
              createNetWorkJson.admin_state_up = newNetwork.admin_state_up;
              createNetWorkJson.shared = newNetwork.shared;
              if (newNetwork.tenant_id) {
                createNetWorkJson.tenant_id = newNetwork.tenant_id;
              }

              if (newNetwork.type == 'flat' && newNetwork.physical_network) {
                createNetWorkJson['provider:network_type'] = newNetwork.type;
                createNetWorkJson['provider:physical_network'] = newNetwork.physical_network;
              }else if (newNetwork.type == 'vxlan' && newNetwork.typeID){
                createNetWorkJson['provider:network_type'] = newNetwork.type;
                createNetWorkJson['provider:segmentation_id'] = newNetwork.typeID;
              }else if(newNetwork.type && newNetwork.typeID && newNetwork.physical_network){
                createNetWorkJson['provider:network_type'] = newNetwork.type;
                createNetWorkJson['provider:segmentation_id'] = newNetwork.typeID;
                createNetWorkJson['provider:physical_network'] = newNetwork.physical_network;
              }

              neutronAPI.createNetwork(createNetWorkJson)
                .success(function(response) {
                  var networkResult = response;
                  scope.networks.unshift(networkResult);

                  createSubnetJson.network_id = response.id;
                  createSubnetJson.ip_version = 4;
                  createSubnetJson.cidr = newNetwork.cidr;
                  createSubnetJson.enable_dhcp = newNetwork.enable_dhcp;
                  createSubnetJson.name = newNetwork.defaultSubnetName;
                  createSubnetJson.gateway_ip = newNetwork.gateway_ip;
                  if (newNetwork.tenant_id) {
                    createSubnetJson.tenant_id = newNetwork.tenant_id;
                  }
                  if (newNetwork.dns_nameservers.length > 0){
                    createSubnetJson.dns_nameservers = newNetwork.dns_nameservers;
                  }
                  if (newNetwork.host_routes.length > 0){
                    createSubnetJson.host_routes = newNetwork.host_routes;
                  }
                  if (newNetwork.allocation_pools.length > 0){
                    createSubnetJson.allocation_pools = newNetwork.allocation_pools;
                  }

                  neutronAPI.createSubnet(createSubnetJson).success(function(response){
                    networkResult.subnets.push(response);
                    scope.$root.$broadcast('subnetRefresh');
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
