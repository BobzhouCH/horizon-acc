/**
 * Copyright 2015 IBM Corp.
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
   
   * @ngdoc routerFormCtrl
   
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit router form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('firewallFormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.keystone',
    'firewall', 'context', 'horizon.openstack-service-api.fwaas', 'createPolicyAction',
    'horizon.openstack-service-api.neutron',
    function(scope, modalInstance, keystoneAPI, firewall, context, fwaasAPI, createPolicyAction, neutronAPI) {
      var action = {
        submit: function() {
          modalInstance.close(firewall);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        createPolicy: new createPolicyAction(scope)
      };

      if (context.mode === 'create') {
        scope.policies = [];
        firewall.admin_state_up = true;
        firewall.firewall_policy_id = '';
        fwaasAPI.getFirewallPolicies().success(function(response) {
          scope.policies = response.items;
        });
        neutronAPI.getRouters('').success(function(response) {
             var routers = [];
             var items = response.items;
             if (items) {
                for (var i=0; i < items.length; i++) {
                    if (!items[i].firewall_id) {
                        routers.push(items[i]);
                    }
                }
             }
             scope.routers = routers;
         })
      }

      if(context.mode === 'associate_router'){
         if(firewall.router_id){
           firewall.router_id = '';
         }
         neutronAPI.getRouters('')
              .success(function(response) {
             scope.routers = response.items;
         })
      }

      if(context.mode === 'disassociate_router'){
         if(firewall.router_id){
           firewall.router_id = '';
         }
         var routers = [];
         var router_dict = [];
         var routers_to_select = [];
         neutronAPI.getRouters('')
              .success(function(response) {
           routers = response.items;
           for(var i = 0; i < routers.length; i++){
             router_dict[routers[i].id] = routers[i];
           }

           if(firewall){
             for(var j = 0; j < firewall.router_ids.length; j++){
               routers_to_select.push(router_dict[firewall.router_ids[j]]);
             }
           }
           scope.routers = routers_to_select;
         });

      }

      scope.context = context;
      scope.action = action;
      scope.firewall = firewall;
    }
  ])

  .controller('firewallPolicyFormCtrl', [
    '$scope', '$modalInstance', 'policy', 'context',
    'horizon.openstack-service-api.fwaas', '$rootScope', 'createRuleAction',
    function(scope, modalInstance, policy, context, fwaasAPI, rootScope, createRuleAction) {
      var rules = {};
      var action = {
        submit: function() {
          modalInstance.close(policy);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        createRule: new createRuleAction(scope)
      };

      if (context.mode === 'add-rule') {
        policy.add_rule = '';
        policy.rules = [];
        fwaasAPI.getFirewallRules({policy: 'null'}).success(function(response) {
          var all_rules = response.items;
          var tmp_rules = []
          if(policy.shared){
            for(var i = 0; i < all_rules.length; i++){
              if(all_rules[i].shared){
                tmp_rules.push(all_rules[i]);
              }
            }
          }else{
            for(var i = 0; i < all_rules.length; i++){
            //if(all_rules[i].shared)
              tmp_rules.push(all_rules[i]);
            }
          }
          scope.rules = tmp_rules;
        });
      }

      scope.context = context;
      scope.action = action;
      scope.policy = policy;
      scope.rules = rules;
    }
  ])

  .controller('firewallRuleFormCtrl', [
    '$scope', '$modalInstance', 'rule', 'context',
    function(scope, modalInstance, rule, context) {
      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(rule);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      if (context.mode === 'create') {
        rule.protocol = 'tcp';
        rule.action = 'allow';
      }
      else if (context.mode === 'edit') {
        var aSourceip = rule.source_ip_address.split('/'),
            aDestinationip = rule.destination_ip_address.split('/');

        if (aSourceip[1]) {
          rule.sourceip_4 = aSourceip[1];
        }
        if (aDestinationip[1]) {
          rule.destinationip_4 = aDestinationip[1];
        }
        aSourceip = aSourceip[0].split('.');
        aDestinationip = aDestinationip[0].split('.');
        rule.sourceip_0 = aSourceip[0];
        rule.sourceip_1 = aSourceip[1];
        rule.sourceip_2 = aSourceip[2];
        rule.sourceip_3 = aSourceip[3];
        rule.destinationip_0 = aDestinationip[0];
        rule.destinationip_1 = aDestinationip[1];
        rule.destinationip_2 = aDestinationip[2];
        rule.destinationip_3 = aDestinationip[3];

        rule.source_port = parseInt(rule.source_port);
        rule.destination_port = parseInt(rule.destination_port);
      }

      scope.dropdown = dropdown;
      scope.context = context;
      scope.action = action;
      scope.rule = rule;
    }
  ]);
})();
