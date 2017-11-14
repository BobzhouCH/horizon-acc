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
  .factory('editFirewallRuleAction', [
      'horizon.openstack-service-api.fwaas', '$modal', 'backDrop',
      'horizon.framework.widgets.toast.service',
      'firewallsRule',
  function(fwaasAPI, modal, backDrop, toastService, firewallRule) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Firewall Rule'),
      submit:  gettext('Save'),
      success: gettext('Firewall rule %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'rule-form',
        controller: 'firewallRuleFormCtrl',
        backdrop: backDrop,
        resolve: {
          rule: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the edit form
      self.open = function(rules) {
        option.templateUrl = (window.WEBROOT || '') + 'project/firewalls/rule-form/';
        var clone = angular.copy(rules[0]);
        option.resolve.rule = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(rules[0], clone);
        });
      };

      // submit this action to api
      // and update router object on success
      self.submit = function(rules, clone) {
        var cleaned = firewallRule.clean(clone);

        fwaasAPI.editFirewallRule(clone.id, cleaned)
          .success(function() {
            var message = interpolate(context.success, [cleaned.name]);
            toastService.add('success', message);
            angular.extend(rules, cleaned);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
