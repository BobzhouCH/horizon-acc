(function() {
  'use strict';

  angular.module('hz.dashboard.project.firewalls')

  /**
   * @ngDoc connectAction
   * @ngService
   *
   */
  .factory('deleteFirewallRuleAction', ['horizon.openstack-service-api.fwaas', '$modal', 'horizon.framework.widgets.modal.service',
                                'backDrop', 'horizon.framework.widgets.toast.service',
  function(fwaasAPI, modal, smodal, backDrop, toastService) {
    var context = {
      title: gettext('Delete Rules'),
      message: gettext('The amount of firewall rules these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete'),
      success: gettext('Delete rules: %s.'),
      error: gettext('Delete rules %s failed.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function() {
        var rules = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              rules.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(rules, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(rules, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: rules,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(rules);
        });
      };

      // on success, remove the routers from the model
      // need to also remove deleted routers from selected list
      self.submit = function(rules) {
        for(var n=0; n<rules.length; n++){
          self.deleteFirewallRule(rules[n]);
        }
        scope.$table.resetSelected();
      };

      self.deleteFirewallRule = function(rule) {
        fwaasAPI.deleteFirewallRule(rule.id)
          .success(function() {
            var message = interpolate(context.success, [rule.name]);
            toastService.add('success', message);

            scope.rules.remove(rule);
            delete scope.selected[rule.id];
          })
          .error(function(){
            var message = interpolate(context.error, [rule.name]);
            toastService.add('error', message);
          });
      };
    }

    return action;

  }]);

})();