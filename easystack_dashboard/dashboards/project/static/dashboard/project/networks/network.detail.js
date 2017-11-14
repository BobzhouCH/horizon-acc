(function() {
  "use strict";

  angular.module('hz.dashboard.project.networks')
    .controller('NetworkDetailCtrl', NetworkDetailCtrl);

  NetworkDetailCtrl.$inject = ['$location','$scope',
    'horizon.openstack-service-api.neutron', 'subnetCreateAction', 'subnetDeleteAction', 'subnetEditAction'];

  function NetworkDetailCtrl(location, scope, networkAPI, SubnetCreateAction,
                             SubnetDeleteAction, SubnetEditAction) {

    var ctrl = this;

    scope.context = {
      header: {
        name: gettext('Name'),
        cidr: gettext('Network Address'),
        ipver_str: gettext('IP Version'),
        gateway_ip: gettext('Gateway IP')
      },
      action: {
      },
      error: {
        api: gettext('Unable to retrieve subnet'),
        priviledge: gettext('Insufficient privilege level to view subnet information.')
      }
    };
    scope.subnets = [];
    scope.safeSubnets = [];
    scope.checked = {};
    scope.selectedData = {}; // err
    scope.detailDataState = true;
    scope.actions = {
      create: new SubnetCreateAction(scope),
      deleted: new SubnetDeleteAction(scope),
      edit: new SubnetEditAction(scope)
    };

    ctrl.title = {
      "Overview": gettext("Overview"),
      "Connection": gettext("Connection"),
      "Info": gettext("Info")
    };
    ctrl.label = {
      "ID": gettext("ID"),
      "Name": gettext("Name"),
      "Project_ID": gettext("Project ID"),
      "Status": gettext("Status"),
      "Shared": gettext("Shared"),
      "External_Network": gettext("External Network"),
      "Provider_Network": gettext("Provider Network"),
      "more": gettext("More")
    };

     var pattern = /(.*\/networks\/)(#\/)([0-9a-f-]*)?/;
     var networkId = location.absUrl().match(pattern)[3];

    networkAPI.getNetwork(networkId).success(function(network) {
      scope.safeSubnets = network.subnets;
      scope.sunnetId = network.id;
      scope.detailDataState = false;
    });

  }

})();
