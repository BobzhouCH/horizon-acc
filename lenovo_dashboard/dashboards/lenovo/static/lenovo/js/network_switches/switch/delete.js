(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')
    .controller('lenovoNetworkSwitchesDeleteSwitchController', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'switchNames', 'switchIds',
      function (scope, modalInstance, neutronAPI, switchNames, switchIds) {

          var seft = this;
          var action = {
              submit: function () {
                  modalInstance.close(switchIds);
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              },

          };

          scope.label = {
              title: gettext('Confirm Delete Switches'),
              message_selected: gettext('You have selected '),
              message_confirm: gettext('Please confirm your selection. This action cannot be undone. '),
              confirm: gettext('Confirm'),
              delete: gettext('Delete Switches')
          }

          scope.switchNames = switchNames;
          scope.action = action;
      }
    ]);
})();
