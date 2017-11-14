(function() {
  'use strict';

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc connectAction
   * @ngService
   *
   */
  .factory('DisConnectAction', ['horizon.openstack-service-api.neutron', '$modal', 'horizon.framework.widgets.modal.service',
                                'backDrop', 'horizon.framework.widgets.toast.service',
  function(neutronAPI, modal, smodal, backDrop, toastService) {
    var context = {
      title: gettext('Confirm Disconnect Selected Subnet'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection. Disconnect subnet action cannot be undone.'),
      submit: gettext('Disconnect'),
      success: gettext('Disconnected subnet: %s.'),
      error: gettext('Unable to disconnect %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDisconnect = function(table) {
        var ports = [], names = [];
        self.table = table;
        var selected = table.allSelected();
        angular.forEach(selected, function(item) {
          ports.push(item);
          names.push(item.subnet);
        });
        self.confirmDelete(ports, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ports, names) {
        var namelist = names.join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [namelist]),
          submit: context.submit
        };
        smodal.modal(options).result.then(function(){
            self.submit(ports);
        });
      };

      self.submit = function(ports) {
        for(var n=0; n<ports.length; n++){
          self.disconnect(ports[n]);
        }
      };

      self.disconnect = function(port) {
        var message;
        neutronAPI.removeinterfaceRouter(scope.router_id, {"subnet_id": port.subnet_id, "port_id": port.id})
          .success(function() {
            scope.routersOverview.removeId(port.id);
            message = interpolate(context.success, [port.subnet]);
            toastService.add('success', message);
          })
          .error(function(data) {
              if(data.indexOf('as it is required by one or more floating IPs')>=0){
                data = gettext('Router connected subnet has instances binding floating IP, can not be disconnect.')
              }
            message = interpolate(context.error, [port.subnet, data]);
            toastService.add('error', message);
          });
        self.table.resetSelected();
      }
    }
    return action;
  }]);

})();