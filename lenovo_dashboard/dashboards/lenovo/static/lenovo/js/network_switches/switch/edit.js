(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')
    .controller('lenovoNetworkSwitchesEditSwitchController', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'switchData',
      function (scope, modalInstance, neutronAPI, switchData) {

          var result = {};
          scope.switch = {};
          scope.action = {
              submit: function () {
                  result.switch_id = switchData.uuid;
                  result.pmswitch_id = switchData.pmswitch_id;
                  result.username = scope.switch.username;
                  result.password = scope.switch.password;
                  modalInstance.close(result);
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              },

          };

          scope.label = {
              title: gettext('Update Information'),
              sshPort: gettext('SSH Port'),
              username: gettext('User Name'),
              password: gettext('Password'),
              update: gettext('Update'),
          }

          scope.switch.username = switchData.username;
      }
    ]);
})();
