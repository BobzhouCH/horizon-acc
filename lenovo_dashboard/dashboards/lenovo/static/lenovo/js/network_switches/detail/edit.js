(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')
    .controller('lenovoNetworkSwitchesEditDetailController', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'switchData', 'nodeData',
      function (scope, modalInstance, neutronAPI, switchData, nodeData) {

          var result = {};
          scope.node = {};
          angular.extend(scope.node, nodeData);
          //scope.node.nodename = nodeData.nodename;
          //scope.node.port = nodeData.port;
          scope.action = {
              submit: function () {
                  result.switch_id = switchData.uuid;
                  result.pmswitch_id = switchData.pmswitch_id;
                  result.nodename = scope.node.nodename;
                  result.port = scope.node.port;
                  modalInstance.close(result);
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              },

          };

          scope.label = {
              title: gettext('Update Node Information'),
              nodename: gettext('Node Name'),
              port: gettext('Port'),
              update: gettext('Update')
          }
      }
    ]);
})();
