(function() {
  'use strict';

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc connectAction
   * @ngService
   *
   */
  .factory('DeleteRuleAction', ['horizon.openstack-service-api.neutron', '$modal', 'horizon.framework.widgets.modal.service',
                                'backDrop', 'horizon.framework.widgets.toast.service',
  function(neutronAPI, modal, smodal, backDrop, toastService) {
    var context = {
      title: gettext('Confirm Delete Port Forwarding Rules'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection. Delee rule action cannot be undone.'),
      submit: gettext('Delete'),
      success: gettext('Delete: %s.'),
      error: gettext('Delete: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function(table) {
        self.table = table;
        var selected = table.allSelected();
        var ids = [], outside_ports = [];
        angular.forEach(selected, function(item) {
        	ids.push(item.id);
          outside_ports.push(item.outside_port);
        });
        self.confirmDelete(ids, outside_ports);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, outside_ports) {
        var namelist = outside_ports.join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [namelist]),
          submit: context.submit
        };
        smodal.modal(options).result.then(function(){
            self.submit(ids);
        });
      };

      self.submit = function(ids) {
        var remain_rules = [];

        for (var i = scope.routerForwarding.length - 1; i >= 0; i--) {
            var rule = {};
            var is_delete = false;
            var item = scope.routerForwarding[i];
            for (var j = 0; j < ids.length; j++) {
                if (item.id === ids[j]) {
                  is_delete = true;
                  break;
                }
            }
            if (!is_delete){
              rule.inside_addr = item.inside_addr;
              rule.inside_port = item.inside_port;
              rule.outside_port = item.outside_port;
              rule.protocol = item.protocol;
              remain_rules.push(rule);
            }
        }

        var params = {"portforwardings": remain_rules};
        neutronAPI.editRouter(scope.router_id, params)
          .success(function() {
            for (var i = scope.routerForwarding.length - 1; i >= 0; i--) {
              var rule = scope.routerForwarding[i];
              for (var j = 0; j < ids.length; j++) {
              if (rule.id === ids[j]) {
                scope.routerForwarding.splice(i, 1);
                break;
              }
            }
            self.table.resetSelected();
          }
          var msg = interpolate(gettext("Portforwarding rule %s successfully deleted."),[ids.join()]);
          toastService.add('success', msg);
        })
        .error(function(data) {
          toastService.add('error', gettext("Portforwarding rule failed to deleted."));
        });
      };
    }
    return action;
  }]);

})();