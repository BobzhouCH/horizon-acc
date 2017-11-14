(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')
    .controller('lenovoNetworkSwitchesDeleteDetailController', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'switchData', 'nodeNames', 'nodeIds',
      function (scope, modalInstance, neutronAPI, switchData, nodeNames, nodeIds) {

          var result = {};
          scope.nodeNames = nodeNames;
          scope.action = {
              submit: function () {
                  result.switchData = switchData;
                  result.nodes = nodeIds;
                  modalInstance.close(result);
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              },

          };

          scope.label = {
              title: gettext('Confirm Delete Port Mapping'),
              message_selected: gettext('You have selected '),
              message_confirm: gettext('Please confirm your selection. This action cannot be undone. '),
              confirm: gettext('Confirm'),
              delete: gettext('Delete Nodes')
          }
      }
    ]);
})();
