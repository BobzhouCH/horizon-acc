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
   * @ngdoc projectFirewallRuleCtrl
   * @ngController
   *
   * @description
   * Controller for the identity routers table.
   * Serve as the focal point for table actions.
   */
  .controller('projectFirewallRuleCtrl', [
      '$scope', 'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.fwaas',
      'editFirewallRuleAction', 'createRuleAction', 'deleteFirewallRuleAction',
      'horizon.framework.widgets.toast.service',
    function(
      scope, PolicyService, fwaasAPI,
      EditAction, CreateAction, DeleteAction, toastService) {
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          desc: gettext('Description'),
          policy: gettext('Policy'),
          action: gettext('Action'),
          protocol: gettext('Protocol'),
          src_ip: gettext('Source IP'),
          src_port: gettext('Source Port'),
          dst_ip: gettext('Destination IP'),
          dst_port: gettext('Destination Port'),
          share: gettext('Share')
        },
        action: {
          create: gettext('Create'),
          edit: gettext('Edit'),
          deleted: gettext('Delete')
        },
        error: {
          api: gettext('Unable to retrieve firewall rules'),
          priviledge: gettext('Insufficient privilege level to view firewall rule information.')
        }
      };

      scope.actionString = {
        'allow': gettext('Allow'),
        'deny': gettext('Deny')
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
        label: gettext('Policy'),
        name: 'policy.name',
        singleton: true
      }, {
        label: gettext('Action'),
        name: 'action',
        singleton: true,
        options: [
          { label: scope.actionString.allow, key: 'Allow' },
          { label: scope.actionString.deny, key: 'Deny' }
        ]
      }, {
        label: gettext('Protocol'),
        name: 'protocol',
        singleton: true
      }, {
        label: gettext('Source IP'),
        name: 'source_ip_address',
        singleton: true
      }, {
        label: gettext('Source Port'),
        name: 'source_port',
        singleton: true
      }, {
        label: gettext('Destination IP'),
        name: 'destination_ip_address',
        singleton: true
      }, {
        label: gettext('Destination Port'),
        name: 'destination_port',
        singleton: true
      }, {
        label: gettext('Share'),
        name: 'shared',
        singleton: true
      }];

      this.reset = function () {
        scope.rules = [];
        scope.irules = [];
        scope.irulesState = false;
        if (scope.$table) {
          scope.$table.resetSelected();
        }
      };

      this.init = function () {
        scope.actions = {
          refresh: self.refresh,
          create: new CreateAction(scope),
          edit: new EditAction(scope),
          deleted: new DeleteAction(scope)
        };
        self.refresh();
        scope.$on('firewallRuleRefresh', function(){
          self.refresh();
        })
      };

      this.refresh = function () {
        self.reset();
        PolicyService.check({rules: [['neutron', 'neutron:list_firewallrules']]})
          .success(function (response) {
            if (response.allowed) {
              fwaasAPI.getFirewallRules()
                .success(function (response) {
                  scope.rules = response.items;
                  scope.irulesState = true;
                });
            }
            else {
              toastService.add('info', scope.context.error.priviledge);
            }
          });
      };

      this.init();
    }
  ]);

})();
