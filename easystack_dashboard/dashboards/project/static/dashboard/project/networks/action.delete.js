(function() {
  'use strict';

  angular.module('hz.dashboard.project.networks')

  .factory('subnetDeleteAction', ['horizon.openstack-service-api.neutron', 'horizon.framework.widgets.modal.service',
        'horizon.framework.widgets.toast.service', 'horizon.dashboard.network.Path', '$modal','backDrop',
  function(neutronAPI, smodal, toastService, path, modal, backdrop) {

    var context = {
      title: gettext('Delete Subnet'),
      message: gettext('The amount of subnetworks these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Subnet'),
      cancel: gettext('Cancel'),
      success: gettext('Deleted Subnet: %s.'),
      error: gettext('Deleted Subnet: %s.')
    };

    function action(scope) {

      var self = this;

      self.batchDelete = function() {
        var subnets = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              subnets.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        if (subnets.length == 1) {
            self.confirmSingleDelete(subnets);
        } else {
            self.confirmBatchDelete(subnets, names);
        }
      };

      self.confirmBatchDelete = function(subnets, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: subnets,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(subnets);
        });
      };

      self.confirmSingleDelete = function(subnets) {
        showModal(subnets);
      };

      function showModal(subnets) {
        var params = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [subnets.length]),
          submit: context.submit,
          cancel: context.cancel,
          names: subnets,
        };
        var option = {
          templateUrl: path+'network-delete-form',
          controller: 'subnetDeleteFormCtrl',
          windowClass: 'subnet-delete-content',
          backdrop: backdrop,
          resolve: {
            context: function(){ return params; }
          }
        };
        modal.open(option).result.then(function(){
          self.submit(subnets);
        });
      }

      self.submit = function(subnets) {
        for(var n = 0; n < subnets.length; n++){
          self.deleteSubnet(subnets[n]);
        }
        scope.$table.resetSelected();
      };

      self.deleteSubnet = function(subnet) {
        neutronAPI.deleteSubnet(subnet.id)
          .success(function() {
            var message = interpolate(context.success, [subnet.name]);
            toastService.add('success', message);
            scope.safeSubnets.removeId(subnet.id);
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

  .factory('networksDeleteAction', ['horizon.openstack-service-api.neutron', 'horizon.framework.widgets.modal.service',
        'horizon.framework.widgets.toast.service', 'horizon.dashboard.network.Path', '$modal','backDrop',
  function(neutronAPI, smodal, toastService, path, modal, backdrop) {

    var context = {
      title: gettext('Delete Networks'),
      message: gettext('The amount of networks these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Networks'),
      cancel: gettext('Cancel'),
      success: gettext('Deleted Networks: %s.'),
      error: gettext('Deleted Networks: %s.')
    };

    function action(scope, mode) {

      var self = this;

      self.batchDelete = function() {
        var networks = [], names = [];
        angular.forEach(scope.selected, function(row) {
          if (row.checked){
            networks.push(row.item);
            names.push('"'+ row.item.name +'"');
          }
        });
        if (networks.length == 1) {
            self.confirmSingleDelete(networks);
        } else {
            self.confirmBatchDelete(networks, names);
        }
      };

      self.confirmSingleDelete = function(networks) {
        showModal(networks);
      };

      self.confirmBatchDelete = function(networks, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: networks,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(networks);
        });
      };

      function showModal(networks) {
        var params = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [networks.length]),
          submit: context.submit,
          cancel: context.cancel,
          names: networks,
          mode: mode
        };
        var option = {
          templateUrl: path+'network-delete-form',
          controller: 'networkDeleteFormCtrl',
          windowClass: 'network-delete-content',
          backdrop: backdrop,
          resolve: {
            context: function(){ return params; }
          }
        };
        modal.open(option).result.then(function(){
          self.submit(networks);
        });
      }

      self.submit = function(networks) {
        for(var n=0; n<networks.length; n++){
          self.deleteNetwork(networks[n]);
        }
        // reset selected items
        scope.$table.resetSelected();
      };
      self.deleteNetwork = function(network) {
        neutronAPI.deleteNetwork(network.id)
          .success(function() {
            var message = interpolate(context.success, [network.name]);
            toastService.add('success', message);
            scope.$root.$broadcast('subnetRefresh');
            scope.$table.resetSelected();
            scope.networks.removeId(network.id);
          });
      };
    }

    return action;

  }]);

})();
