(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.physical_servers')
    .controller('lenovoPhysicalServersAuthServerController', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'serverData',
      function (scope, modalInstance, neutronAPI, serverData) {

          var result = {};
          var mm_type;
          scope.server = {};
          scope.action = {
              submit: function () {
                  result.server_id = serverData.id;
                  result.server_name = serverData.hostname;
                  result.userid = scope.server.userid;
                  result.password = scope.server.password;
                  modalInstance.close(result);
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              }

          };

          if(serverData.type == 2){
              mm_type = "IMM";
          }else if(serverData.type == 31){
              mm_type = "TSM";
          }else{
              mm_type = "BMC";
          }

          scope.label = {
              title: gettext('Auth Information: '),
              userid: gettext('User ID'),
              password: gettext('Password'),
              Authenticate: gettext('Authenticate'),
              hostname:  gettext('Host Name'),
              managemoduletype:  gettext('MM Type')
          };

          scope.serverNames = serverData.hostname;
          scope.manage_module = mm_type;

          //scope.server.username = serverData.username;
      }
    ]);
})();
