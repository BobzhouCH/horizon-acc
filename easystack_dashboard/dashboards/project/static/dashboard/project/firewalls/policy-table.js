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
   * @ngdoc projectFirewallCtrl
   * @ngController
   *
   * @description
   * Controller for the identity routers table.
   * Serve as the focal point for table actions.
   */
  .controller('projectFirewallPolicyCtrl', [
      '$scope', 'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.fwaas',
      'createPolicyAction','deletePolicyAction',
      'editPolicyAction', 'addRulePolicyAction',
      'horizon.framework.widgets.toast.service',
    function(
      scope, PolicyService, fwaasAPI,
      CreateAction, DeleteAction, EditAction, AddRuleAction, toastService) {
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          desc: gettext('Description'),
          share: gettext('Share'),
          audited: gettext('Audited')
        },
        ruleHeader: {
          priority: gettext('Priority'),
          name: gettext('Name'),
          desc: gettext('Description'),
          action: gettext('Action'),
          protocol: gettext('Protocol'),
          src_ip: gettext('Source IP'),
          src_port: gettext('Source Port'),
          dst_ip: gettext('Destination IP'),
          dst_port: gettext('Destination Port'),
          operate: gettext('Operation')
        },
        action: {
          create: gettext('Create'),
          edit: gettext('Edit'),
          deleted: gettext('Delete')
        },
        error: {
          api: gettext('Unable to retrieve firewall policies'),
          priviledge: gettext('Insufficient privilege level to view firewall policy information.')
        },
        success: gettext('Firewall rules priority has updated successfully.')
      };

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Description'),
        name: 'description',
        singleton: true
      }, {
        label: gettext('Share'),
        name: 'shared',
        singleton: true
      }, {
        label: gettext('Audited'),
        name: 'audited',
        singleton: true
      }];

      this.reset = function () {
        scope.policies = [];
        scope.ipolicies = [];
        scope.ipoliciesState = false;
        if (scope.$table) {
          scope.$table.resetSelected();
        }
      };

      this.init = function () {
        scope.actions = {
          refresh: self.refresh,
          create: new CreateAction(scope),
          edit: new EditAction(scope),
          deleted: new DeleteAction(scope),
          addRule: new AddRuleAction(scope)
        };
        self.refresh();
        scope.$on('firewallPolicyRefresh', function(){
          self.refresh();
        });
      };

      this.refresh = function () {
        self.reset();
        PolicyService.check({rules: [['neutron', 'neutron:list_firewallpolicies']]})
          .success(function (response) {
            if (response.allowed) {
              fwaasAPI.getFirewallPolicies()
                .success(function (response) {
                  scope.policies = response.items;
                  scope.ipoliciesState = true;
                });
            }
            else {
              toastService.add('info', scope.context.error.priviledge);
            }
          });
      };

      scope.deleteRule = function(policy, rule){
        if (scope.updating)
            return;
        scope.updating = true;
        fwaasAPI.removeFirewallRule(policy.id, rule.id)
          .success(function() {
            policy.rules.remove(rule);
            updateRulePosition(policy.rules);
            scope.updating = false;
          })
          .error(function(){
            scope.updating = false;
          });
        function updateRulePosition(rules){
          for (var i = 0; i < rules.length; i++){
            rules[i].position = i + 1;
          }
        }
      };

      scope.updatePriority = function(e, item, collection){
        var rules = [];
        var policyId = collection[0].firewall_policy_id;
        collection.forEach(function(item){
          rules.add(item.id);
        });
        var param = {
          firewall_rules: rules
        };
        fwaasAPI.editFirewallPolicy(policyId, param).success(function(){
          toastService.add('success', scope.context.success);
        });
      };

      this.init();
    }
  ]);

})();
