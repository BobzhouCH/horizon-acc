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

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit router modal dialog.
   * On submit, edit router and display a success message.
   * On cancel, do nothing.
   */
  .factory('addRuleForPolicyAction', [
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
        templateUrl: 'form/',
        controller: 'routerFormCtrl',
        backdrop:		backDrop,
        resolve: {
          router: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the edit form
      self.open = function($table) {
          self.table = $table;
        modal.open(option).result.then(function(clone){
          self.submit(clone);
        });
      };

      // submit this action to api
      // and update router object on success
      self.submit = function(router) {
        var firewall_policy = scope.firewallToShow.policy;
        fwaasAPI.addFirewallRule(firewall_policy.id, router.add_rule)
          .success(function(response) {
            fwaasAPI.getFirewallRule(router.add_rule).success(function(data){
              var message = interpolate(context.success, [data.name]);
              toastService.add('success', message);
            });
            scope.updateFirewallDetail(scope.current_router);
            table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
