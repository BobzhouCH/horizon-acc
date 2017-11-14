/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit router modal dialog.
   * On submit, edit router and display a success message.
   * On cancel, do nothing.
   */
  .factory('addRulePolicyAction', [
      'horizon.openstack-service-api.fwaas', '$modal', 'backDrop',
      'horizon.framework.widgets.toast.service',
  function(fwaasAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'add-rule',
      title: gettext('Add Rule'),
      submit:  gettext('Add'),
      success: gettext('Firewall rule %s has been added successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'policy-form',
        controller: 'firewallPolicyFormCtrl',
        backdrop:		backDrop,
        resolve: {
          policy: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the edit form
      self.open = function(policy) {
        var clone = angular.copy(policy);
        option.templateUrl = (window.WEBROOT || '') + 'project/firewalls/policy-form/';
        option.resolve.policy = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(policy, clone);
        });
      };

      // submit this action to api
      // and update router object on success
      self.submit = function(policy, clone) {
        fwaasAPI.addFirewallRule(clone.id, clone.add_rule)
          .success(function(response) {
            fwaasAPI.getFirewallRule(clone.add_rule).success(function(data){
              var message = interpolate(context.success, [data.name]);
              toastService.add('success', message);
              policy.rules.add(data);
            });
            policy.firewall_rules = response.firewall_rules;
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
