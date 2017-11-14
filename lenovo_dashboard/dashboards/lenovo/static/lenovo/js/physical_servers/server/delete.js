(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.physical_servers')
    .controller('lenovoPhysicalServersDeleteServerController', [
      '$scope', '$modalInstance', 'serverNames', 'serverIds',
      function (scope, modalInstance, serverNames, serverIds) {

          var self = this;
          var action = {
              submit: function () {
                  modalInstance.close(serverIds);
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              }

          };

          scope.label = {
              title: gettext('Confirm Delete Servers'),
              message_selected: gettext('You have selected '),
              message_confirm: gettext('Please confirm your selection. This action cannot be undone. '),
              confirm: gettext('Confirm'),
              delete: gettext('Delete Servers')
          };

          scope.serverNames = serverNames;
          scope.action = action;
      }
    ]);
})();
