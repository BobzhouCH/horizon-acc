(function() {
  'use strict';

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc connectAction
   * @ngService
   *
   */
  .factory('ConnectAction', ['horizon.openstack-service-api.neutron', '$modal', 'backDrop', 'horizon.framework.widgets.toast.service',
  function(neutronAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'connect',
      title: gettext('Connect Subnets'),
      submit:  gettext('Connect'),
      success: gettext('Subnets %s was successfully connected.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'connect',
        controller: 'formConnect',
        backdrop:    backDrop,
        windowClass: 'ruleContent',
        resolve: {
          context: function(){ return context; },
          routerId: function(){return scope.router_id; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(data) {
        var subnet =(new Function("","return "+data.subnet))();

        var used_ips = [];
        if (data.ip){
           neutronAPI.getPorts().success(function(ports){
             for (var i = ports.items.length; i--;){
               for (var j = ports.items[i].fixed_ips.length; j--;){
                 used_ips.push(ports.items[i].fixed_ips[j].ip_address);
               }
             }
             if ($.inArray(data.ip, used_ips) < 0){
               var port_params = {'network_id': subnet.network_id,
                                  'fixed_ips': [{'subnet_id': subnet.subnet_id,
                                                 'ip_address': data.ip}]};
               neutronAPI.createPort(port_params).success(function(data){
                 var params = {'port_id': data.id};
                 neutronAPI.addinterfaceRouter(scope.router_id, params).success(function(data){
                   neutronAPI.getDevicePorts(data.id).success(function(data){
                     scope.routersOverview = [];
                     for (var n = 0; n < data.items.length; n++) {
                       // to filter out HA ports
                       if (data.items[n].subnet.indexOf('HA subnet tenant') !=0 ){
                         scope.routersOverview.push(data.items[n]);
                       }
                     }
                     toastService.add('success', gettext("Subnet has been connected to router."));
                   });
                 })
                 .error(function(data){
                       toastService.add('error', gettext(data));
                       neutronAPI.deletePort(data.id);
                     });
               })
               .error(function(data){
                    toastService.add('error', gettext(data));
               });
             }
             else{
               toastService.add('error',gettext(data.ip + "has been occupied"));
             }
          });
        }else{
          var params = {'subnet_id': subnet.subnet_id};
          neutronAPI.addinterfaceRouter(scope.router_id, params).success(function(data){
            neutronAPI.getDevicePorts(data.id, {private: true}).success(function(data){
              scope.routersOverview = [];
              for (var n = 0; n < data.items.length; n++) {
                // to filter out HA ports
                if (data.items[n].subnet.indexOf('HA subnet tenant') !=0 ){
                  scope.routersOverview.push(data.items[n]);
                }
              }
              toastService.add('success', gettext("Subnet has been connected to router."));
            });
          });
        }
      };
    }
    return action;
  }]);

})();
