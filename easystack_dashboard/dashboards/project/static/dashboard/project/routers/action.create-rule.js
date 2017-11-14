(function() {
  'use strict';

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc connectAction
   * @ngService
   *
   */
  .factory('CreateRuleAction', ['horizon.openstack-service-api.neutron', '$modal', 'backDrop', 'horizon.framework.widgets.toast.service',
  function(neutronAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create Rule'),
      submit:  gettext('Create'),
      success: gettext('Rule was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'create-rule',
        controller: 'formCreateRule',
        windowClass: 'ruleContent',
        //backdrop:    backDrop,
        resolve: {
          context: function(){ return context; },
          routerId: function(){return scope.router_id; }
        }
      };

      self.open = function(table){
        self.table = table;
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(data) {
        for (var i=0; i < scope.routerForwarding.length; i++){
          var rule = scope.routerForwarding[i];
          if (data.router_gateway == ""){
            toastService.add('error',gettext("Router " + data.router_name + " has not set gateway"));
            return;
          }
          if (data.outside_port == rule.outside_port){
            toastService.add('error',gettext("Outside Port") + data.outside_port + gettext(" has been occupied."));
            return;
          }
        }
        neutronAPI.getRouter(data.router_id).success(function(router){
         var used_rules = router.items.portforwardings;

         if ($.inArray(data.outside_port, used_rules) < 0){
           var new_rule = {
             "inside_addr": data.inside_addr,
             "protocol": data.protocol,
             "outside_port": data.outside_port,
             "inside_port": data.inside_port};
           used_rules.push(new_rule);
           var params = {
             "portforwardings": used_rules};

           neutronAPI.editRouter(scope.router_id, params).success(function(){
             new_rule.id = scope.routerForwarding.length + 1;
             scope.routerForwarding.push(new_rule);
             self.table.resetSelected();
             toastService.add('success', gettext("Portforwarding rule was successfully created."));
           })
           .error(function(data) {
             toastService.add('error', gettext(data));
           });
         }
        })
        .error(function(data){
          toastService.add('error', gettext(data));
        });

      };
    }
    return action;
  }]);

})();