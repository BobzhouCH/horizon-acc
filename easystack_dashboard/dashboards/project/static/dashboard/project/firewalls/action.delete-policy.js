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

  angular.module('hz.dashboard.project.firewalls')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete router confirmation modal dialog.
   * On submit, delete selected routers.
   * On cancel, do nothing.
   */
  .factory('deletePolicyAction', ['horizon.openstack-service-api.fwaas', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(fwaasAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Policies'),
      message: gettext('The amount of firewall policies these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete'),
      success: gettext('Deleted Policies: %s.'),
      error: gettext('Delete Policies %s failed.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function() {
        var policies = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              policies.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(policies, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(policies, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: policies,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(policies);
        });
      };

      // on success, remove the routers from the model
      // need to also remove deleted routers from selected list
      self.submit = function(policies) {
        for(var n=0; n<policies.length; n++){
          self.deleteFirewallPolicy(policies[n]);
        }
        scope.$table.resetSelected();
      };

      self.deleteFirewallPolicy = function(policy) {
        fwaasAPI.deleteFirewallPolicy(policy.id)
          .success(function() {
            var message = interpolate(context.success, [policy.name]);
            toastService.add('success', message);

            scope.policies.remove(policy);
            delete scope.selected[policy.id];
          })
          .error(function(){
            var message = interpolate(context.error, [policy.name]);
            toastService.add('error', message);
          });
      };
    }

    return action;

  }]);

})();
