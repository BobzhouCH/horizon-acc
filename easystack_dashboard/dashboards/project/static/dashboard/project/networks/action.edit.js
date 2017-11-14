(function() {
  'use strict';

  angular.module('hz.dashboard.project.networks')

  .factory('subnetEditAction', ['backDrop', 'horizon.openstack-service-api.neutron', '$modal', 'horizon.dashboard.network.Path',
          'horizon.framework.widgets.toast.service',
  function(backdrop, neutronAPI, modal, path, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Subnet'),
      submit:  gettext('Save'),
      success: gettext('Subnet %s has been updated successfully.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: path+'form',
        controller: 'neutronFormCtrl',
        backdrop: backdrop,
        resolve: {
          subnet: function(){ return null; },
          context: function(){ return context; },
          subnetId: function(){return {};}
        },
        windowClass: 'neutronListContent'
      };

      self.open = function(subnet) {
        var clone = angular.copy(subnet[0]);
        option.resolve.subnet = function () { return clone; };
        context.createdSubnets = scope.safeSubnets;
        modal.open(option).result.then(function(clone){
          self.submit(subnet[0], clone);
        });
      };

      self.clean = function(subnet) {
        return {
          name: subnet.name,
          enable_dhcp: subnet.enable_dhcp,
          gateway_ip: subnet.gateway_ip,
          dns_nameservers: subnet.dns_nameservers,
          host_routes: subnet.host_routes,
          allocation_pools: subnet.allocation_pools
        };
      };

      self.submit = function(subnet, clone) {
        if (!clone.enable_gateway){
          clone.gateway_ip = null;
        }
        var cleanedSubnet = self.clean(clone);
        neutronAPI.editSubnet(clone.id, cleanedSubnet)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(subnet, clone);
            scope.$table.resetSelected();
            if(!scope.context.header.network){
              scope.$root.$broadcast('subnetRefresh');
            }
            scope.$root.$broadcast('networkRefresh');
          });
      };
    }

    return action;
  }])

  .factory('NetworkEditAction', ['backDrop', 'horizon.openstack-service-api.neutron', '$modal', 'horizon.dashboard.network.Path',
          'horizon.framework.widgets.toast.service',
    function(backdrop, neutronAPI, modal, path, toastService) {

      var context = {
        mode: 'edit',
        title: gettext('Edit Network'),
        submit:  gettext('Save'),
        success: gettext('Network %s has been updated successfully.')
      };

      function action(scope) {

        var self = this;
        var option = {
          templateUrl: path+'networks-form',
          controller: 'networksFormCtrl',
          backdrop: backdrop,
          resolve: {
            network: function(){ return null; },
            context: function(){ return context; }
          },
          windowClass: 'EditNetworkListContent'
        };

        self.open = function(network) {
          var clone = angular.copy(network[0]);
          option.resolve.network = function(){
            clone.type = clone['provider:network_type'];
            clone.typeID = clone['provider:segmentation_id'];
            clone.physical_network = clone['provider:physical_network'];
            return clone;
          };
          modal.open(option).result.then(function(clone){
            self.submit(network[0], clone);
          });
        };

        self.clean = function(network) {
          return {
            id: network.id,
            name: network.name
          };
        };

        self.submit = function(network, clone) {
          var cleanedUser = self.clean(clone);
          var id = cleanedUser.id;
          delete cleanedUser.id;
          neutronAPI.editNetwork(id, cleanedUser)
              .success(function() {
                var message = interpolate(context.success, [clone.name]);
                toastService.add('success', message);
                angular.extend(network, clone);
                scope.$table.resetSelected();
                scope.$root.$broadcast('subnetRefresh');
              });
        };
      }

      return action;
    }]);

})();