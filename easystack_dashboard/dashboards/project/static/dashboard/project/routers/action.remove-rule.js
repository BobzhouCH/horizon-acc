/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the remove rule confirmation modal dialog.
   * On submit, delete selected rules.
   * On cancel, do nothing.
   */
  .factory('removeFirewallRuleAction', ['horizon.openstack-service-api.neutron', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service','horizon.openstack-service-api.fwaas',
  function(neutronAPI, smodal, toastService, fwaasAPI) {

    var context = {
      title: gettext('Remove Rule'),
      message: gettext('The amount of firewall rules these will be Removed is : %s'),
      tips: gettext('Please confirm your selection.'),
      submit: gettext('Remove Rule'),
      success: gettext('Removed Rules: %s.'),
      error: gettext('Removed Rules: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function($table) {
        self.table = $table;
        var data = self.table.$scope.selectedData.aData;
        var rules = [], names = [];
        angular.forEach(data, function(rule) {
              rules.push(rule);
              names.push('"'+ rule.name +'"');
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
          imgOwner: 'router'
        };
        smodal.modal(options).result.then(function(){
          self.submit(rules);
        });
      };

      // need to also remove deleted routers from selected list
      self.submit = function(rules) {
        for(var n=0; n<rules.length; n++){
          self.deleteRule(scope.firewallToShow.policy, rules[n]);
        }
        scope.$table.resetSelected();
      };

      self.deleteRule = function(policy, rule){
        fwaasAPI.removeFirewallRule(policy.id, rule.id)
          .success(function() {
             var message = interpolate(context.success, [rule.name]);
            toastService.add('success', message);
            scope.updateFirewallDetail(scope.current_router);
            self.table.resetSelected();
        });
      };
    }

    return action;

  }]);

})();
