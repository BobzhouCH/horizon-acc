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
  .factory('editPolicyAction', [
      'horizon.openstack-service-api.fwaas', '$modal', 'backDrop',
      'horizon.framework.widgets.toast.service',
  function(fwaasAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Firewall Policy'),
      submit:  gettext('Save'),
      success: gettext('Firewall policy %s has been updated successfully.')
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
      self.open = function(policies) {
        var clone = angular.copy(policies[0]);
        option.resolve.policy = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(policies[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(policy) {
        return {
          name: policy.name,
          description: policy.description,
          shared: policy.shared,
          audited: policy.audited
        };
      };

      // submit this action to api
      // and update router object on success
      self.submit = function(policies, clone) {
        var cleaned = self.clean(clone);
        fwaasAPI.editFirewallPolicy(clone.id, cleaned)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(policies, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
