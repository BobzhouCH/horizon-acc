(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')
    .controller('lenovoNetworkSwitchesCreateDetailController', [
      '$scope', '$modalInstance', 'switchData', 'horizon.openstack-service-api.switch',
      function (scope, modalInstance, switchData, switchAPI) {
          var self = this;
          var result = {};
          scope.node = {};
          scope.nodenames = [];
          scope.portTypes = ['Port', 'Port Channel'];
          scope.portNumbers = [];
          scope.node.portType = scope.portTypes[0];
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
              title: gettext('Add Port Mapping'),
              nodename: gettext('Host Name'),
              portType: gettext('Port Type'),
              //portType1: gettext('Port Type 1 (e.g. 1/20)'),
              //portType1: gettext('Port Type 1'),
              //portType2: gettext('Port Type 2 (e.g. portchannel:48)'),
              //portType2: gettext('Port Type 2'),
              port: gettext('Port'),
              add: gettext('Add'),

              portPlaceholder: gettext('Please inuut an unassigned port or portchannel '),
              portChannelPlaceholder: gettext('Please input a portchannel')
          }

          //scope.portPlaceholder = scope.label.portPlaceholder;
          scope.showPort = true;
          scope.showPortChannel = false;

          scope.changePortType = function () {
              if (scope.node.portType == scope.portTypes[0]) {
                  //scope.portPlaceholder = scope.label.portPlaceholder;
                  scope.showPort = true;
                  scope.showPortChannel = false;
              } else if (scope.node.portType == scope.portTypes[1]) {
                  //scope.portPlaceholder = scope.label.portChannelPlaceholder;
                  scope.showPort = false;
                  scope.showPortChannel = true;
              }

              scope.node.port = '';
          }

          scope.changePortList = function () {
              scope.node.port = scope.node.portNumber;
          }

          scope.changeHostNameList = function () {
              scope.node.nodename = scope.node.nodenameOption;
          }

          switchAPI.getNodeHostsList()
              .then(function (response) {
                  scope.nodenames = response;
                  //if (scope.nodenames && scope.nodenames.length > 0) {
                  //    scope.node.nodename = scope.nodenames[0];
                  //}
              });

          this.init = function () {
              for (var i = 1; i <= 48; i++) {
                  scope.portNumbers.push('1/' + i + '');
              }
          }

          this.init();
      }
    ]);
})();
