/**
 * Copyright 2015 EasyStack Inc.
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
(function () {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.fwaas', FirewallAPI);

  FirewallAPI.$inject = ['horizon.framework.util.http.service',
                        'horizon.framework.widgets.toast.service'];
  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.firewall
   * @description Provides access to Firewall APIs.
   */
  function FirewallAPI(apiService, toastService) {

    // Firewalls

    /**
     * @name horizon.openstack-service-api.firewallAPI.getFirewalls
     * @description
     * Get a list of firewalls for a tenant.
     *
     * The listing result is an object with property "items". Each item is
     * a firewall.
     */
    this.getFirewalls = function (params) {
      var filter = (params) ? {'params': params} : {};
      return apiService.get('/api/network/firewalls/', filter)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve firewalls.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.createFirewall
     * @description
     * Create a new firewall.
     * @returns The new firewall object on success.
     *
     * @param {Object} newFirewall
     * The firewall to create.  Required.
     *
     * Example new firewall object
     * {
          *    "firewall_policy_id" : "abafebb7-a15a-4fae-9ad9-ad82acccf534",
          *    "name": "myNewFirewall",
          *    "admin_state_up": true,
          *    "status": "ACTIVE",
          *    "tenant_id": "4fd44f30292945e481c7b8a0c8908869
          * }
     *
     * Description of properties on the firewall object
     *
     * @property {string} newNetwork.firewall_policy_id
     * The firewall policy id.
     *
     * @property {string} newFirewall.name
     * The name of the new firewall. Optional.
     *
     * @property {boolean} newFirewall.admin_state_up
     * The administrative state of the firewall, which is up (true) or
     * down (false). Optional.
     *
     * @property {string} newFirewall.status
     * The status of the firewall, which is ACTIVE or INACTIVE
     * By default, only administrative users can change this value. Optional.
     *
     * @property {string} newFirewall.tenant_id
     * The UUID of the tenant that will own the firewall.  This tenant can
     * be different from the tenant that makes the create firewall request.
     * However, only administrative users can specify a tenant ID other than
     * their own.  You cannot change this value through authorization
     * policies.  Optional.
     *
     */
    this.createFirewall = function (newFirewall) {
      return apiService.post('/api/network/firewalls/', newFirewall)
        .error(function (response, status) {
            toastService.add('error', gettext('Unable to create the firewall.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.getFirewall
     * @description
     * Get a single firewall by ID
     * @param {string} firewall_id
     * Specifies the id of the firewall to request.
     */
    this.getFirewall = function (firewall_id) {
      return apiService.get('/api/network/firewall/' + firewall_id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve firewall.'));
        });
    };

    this.refreshFirewall = function (firewall_id) {
        return apiService.get('/api/network/firewall/' + firewall_id);
      };
    /**
     * @name horizon.openstack-service-api.firewallAPI.deleteFirewall
     * @description
     * Delete a single firewall by ID
     * @param {string} firewall_id
     * Specifies the id of the firewall to request.
     */
    this.deleteFirewall = function (firewall_id) {
      return apiService.delete('/api/network/firewall/' + firewall_id)
        .error(function (message, status_code) {
          if (status_code == 409) {
            if (message.indexOf('There are one or more ports still in use on the network') >= 0) {
              toastService.add('error', gettext('There are one or more subnet still have instances or routers on the network, can not delete this network, please detach resources firstly.'));
            }
            else {
              toastService.add('error', gettext(message));
            }
          }
          else {
            toastService.add('error', gettext('Unable to delete firewall.'));
          }
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.editFirewall
     * @description edit firewall
     * @returns The new firewall object on success.
     */
    this.editFirewall = function (id, param) {
      return apiService.patch('/api/network/firewall/' + id, param)
        .error(function () {
          toastService.add('error', gettext('Unable to edit firewall.'));
        });
    };

    // Firewall Policies

    /**
     * @name horizon.openstack-service-api.firewallAPI.getFirewallPolicies
     * @description
     * Get a list of firewall rules for a tenant.
     *
     * The listing result is an object with property "items". Each item is
     * a firewall rule.
     */
    this.getFirewallPolicies = function (params) {
      var filter = (params) ? {'params': params} : {};
      return apiService.get('/api/network/firewallpolicies/', filter)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve firewall policies.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.createFirewallPolicy
     * @description
     * Create a new firewall policy.
     * @returns The new firewall object on success.
     *
     * @param {Object} newPolicy
     * The firewall to create.  Required.
     *
     * Example new firewall object
     * {
          *    "firewall_policy_id" : "abafebb7-a15a-4fae-9ad9-ad82acccf534",
          *    "name": "myNewFirewall",
          *    "admin_state_up": true,
          *    "status": "ACTIVE",
          *    "tenant_id": "4fd44f30292945e481c7b8a0c8908869
          * }
     *
     * Description of properties on the firewall object
     *
     * @property {string} newNetwork.firewall_policy_id
     * The firewall policy id.
     *
     * @property {string} newFirewall.name
     * The name of the new firewall. Optional.
     *
     * @property {boolean} newFirewall.admin_state_up
     * The administrative state of the firewall, which is up (true) or
     * down (false). Optional.
     *
     * @property {string} newFirewall.status
     * The status of the firewall, which is ACTIVE or INACTIVE
     * By default, only administrative users can change this value. Optional.
     *
     * @property {string} newFirewall.tenant_id
     * The UUID of the tenant that will own the firewall.  This tenant can
     * be different from the tenant that makes the create firewall request.
     * However, only administrative users can specify a tenant ID other than
     * their own.  You cannot change this value through authorization
     * policies.  Optional.
     *
     */
    this.createFirewallPolicy = function (newPolicy) {
      return apiService.post('/api/network/firewallpolicies/', newPolicy)
        .error(function () {
          toastService.add('error', gettext('Unable to create the firewall policy.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.getFirewallPolicy
     * @description
     * Get a single policy by ID
     * @param {string} policy_id
     * Specifies the id of the firewall to request.
     */
    this.getFirewallPolicy = function (policy_id) {
      return apiService.get('/api/network/firewallpolicy/' + policy_id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve firewall policy.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.deleteFirewallPolicy
     * @description
     * Delete a single policy by ID
     * @param {string} policy_id
     * Specifies the id of the firewall to request.
     */
    this.deleteFirewallPolicy = function (policy_id) {
      return apiService.delete('/api/network/firewallpolicy/' + policy_id)
        .error(function (message, status_code) {
          if (status_code == 409) {
            if (message.indexOf('There are one or more ports still in use on the network') >= 0) {
              toastService.add('error', gettext('There are one or more subnet still have instances or routers on the network, can not delete this network, please detach resources firstly.'));
            }
          }
          else {
            //toastService.add('error', gettext('Unable to delete firewall policy.'));
          }
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.editFirewallPolicy
     * @description edit firewall policy
     * @returns The new firewall object on success.
     */
    this.editFirewallPolicy = function (id, param) {
      return apiService.patch('/api/network/firewallpolicy/' + id, param)
        .error(function (response, status) {
          if (status == 409){
            toastService.add('info', gettext('Operation is too fast'));
          } else {
            toastService.add('error', gettext('Unable to edit firewall policy.'));
          }
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.editFirewallPolicy
     * @description add rule to firewall policy
     * @param {string} policyId
     * @param {string} ruleId
     * @returns The new firewall policy object on success.
     */
    this.addFirewallRule = function (policyId, ruleId) {
      var param = {rule: ruleId};
      return apiService.patch('/api/network/firewallpolicyrule/' + policyId, param)
        .error(function (response, status) {
          if (status == 409){
            toastService.add('info', gettext('Operation is too fast'));
          } else {
            toastService.add('error', gettext('Unable to add firewall rule.'));
          }
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.editFirewallPolicy
     * @description remove rule to firewall policy
     * @param {string} policyId
     * @param {string} ruleId
     * @returns The new firewall policy object on success.
     */
    this.removeFirewallRule = function (policyId, ruleId) {
      var param = {rule: ruleId};
      return apiService.delete('/api/network/firewallpolicyrule/' + policyId, param)
        .error(function (response, status) {
          if (status == 409){
            toastService.add('info', gettext('Operation is too fast'));
          } else {
            toastService.add('error', gettext('Unable to remove firewall rule.'));
          }
        });
    };

    // Firewall Rules

    /**
     * @name horizon.openstack-service-api.firewallAPI.getFirewallRules
     * @description
     * Get a list of firewall rules for a tenant.
     *
     * The listing result is an object with property "items". Each item is
     * a firewall rule.
     */
    this.getFirewallRules = function (params) {
      var filter = (params) ? {'params': params} : {};
      return apiService.get('/api/network/firewallrules/', filter)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve firewall rules.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.createFirewallRule
     * @description
     * Create a new firewall.
     * @returns The new firewall object on success.
     *
     * @param {Object} newRule
     * The firewall to create.  Required.
     *
     * Example new firewall object
     * {
          *    "firewall_policy_id" : "abafebb7-a15a-4fae-9ad9-ad82acccf534",
          *    "name": "myNewFirewall",
          *    "admin_state_up": true,
          *    "status": "ACTIVE",
          *    "tenant_id": "4fd44f30292945e481c7b8a0c8908869
          * }
     *
     * Description of properties on the firewall object
     *
     * @property {string} newNetwork.firewall_policy_id
     * The firewall policy id.
     *
     * @property {string} newFirewall.name
     * The name of the new firewall. Optional.
     *
     * @property {boolean} newFirewall.admin_state_up
     * The administrative state of the firewall, which is up (true) or
     * down (false). Optional.
     *
     * @property {string} newFirewall.status
     * The status of the firewall, which is ACTIVE or INACTIVE
     * By default, only administrative users can change this value. Optional.
     *
     * @property {string} newFirewall.tenant_id
     * The UUID of the tenant that will own the firewall.  This tenant can
     * be different from the tenant that makes the create firewall request.
     * However, only administrative users can specify a tenant ID other than
     * their own.  You cannot change this value through authorization
     * policies.  Optional.
     *
     */
    this.createFirewallRule = function (newRule) {
      return apiService.post('/api/network/firewallrules/', newRule)
        .error(function () {
          toastService.add('error', gettext('Unable to create the firewall rule.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.getFirewallRule
     * @description
     * Get a single rule by ID
     * @param {string} rule_id
     * Specifies the id of the firewall to request.
     */
    this.getFirewallRule = function (rule_id) {
      return apiService.get('/api/network/firewallrule/' + rule_id)
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve firewall rule.'));
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.deleteFirewallRule
     * @description
     * Delete a single rule by ID
     * @param {string} rule_id
     * Specifies the id of the firewall to request.
     */
    this.deleteFirewallRule = function (rule_id) {
      return apiService.delete('/api/network/firewallrule/' + rule_id)
        .error(function (message, status_code) {
          if (status_code == 409) {
            if (message.indexOf('There are one or more ports still in use on the network') >= 0) {
              toastService.add('error', gettext('There are one or more subnet still have instances or routers on the network, can not delete this network, please detach resources firstly.'));
            }
          }
          else {
            //toastService.add('error', gettext('Unable to delete firewall rule.'));
          }
        });
    };

    /**
     * @name horizon.openstack-service-api.firewallAPI.editFirewallRule
     * @description edit firewall rule
     * @returns The new firewall object on success.
     */
    this.editFirewallRule = function (id, param) {
      return apiService.patch('/api/network/firewallrule/' + id, param)
        .error(function () {
          toastService.add('error', gettext('Unable to edit firewall rule.'));
        });
    };


  }
}());
