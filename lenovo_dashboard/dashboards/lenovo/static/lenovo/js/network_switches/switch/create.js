(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')
    .controller('lenovoNetworkSwitchesCreateSwitchController', [
      '$scope', '$modalInstance',
      function (scope, modalInstance) {

          scope.switch = {};
          scope.action = {
              submit: function () {
                  scope.switch.os_type = scope.switch.os_type.toLowerCase();
                  modalInstance.close(scope.switch);
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              },

          };

          scope.label = {
              title: gettext('Add Switch'),
              switch_ip: gettext('Switch IP'),
              username: gettext('User Name'),
              ssh_port: gettext('SSH Port'),
              os_type: gettext('Firmware Type'),
              password: gettext('Password'),
              protocol: gettext('Protocol'),
              rest_tcp_port: gettext('REST Port'),
              add: gettext('Add')
          }

          scope.os_types = ['CNOS'];
          scope.protocols = ['REST'];
          scope.switch.os_type = scope.os_types[0];
          scope.switch.protocol = scope.protocols[0];
          scope.switch.ssh_port = '830';
          scope.switch.rest_tcp_port = '443';
      }
    ]);
})();
