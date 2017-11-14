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
(function() {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.gbp', GBPAPI);

  GBPAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service',
  ];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.gbp
   * @description Provides access to Ticket APIs.
   */
  function GBPAPI(apiService, toastService) {

    this.listPolicyRuleSet = function() {
      return apiService.get('/api/gbp/policy_rule_set/').error(function() {
        toastService.add('error', gettext('Unable to retrieve policy rule sets.'));
      });
    };

    this.createPolicyRuleSet = function(policy_rule_set) {
      return apiService.post('/api/gbp/policy_rule_set/', policy_rule_set).error(function() {
        toastService.add('error', gettext('Unable to create policy rule set.'));
      });
    };

    this.getPolicyRuleSet = function(policy_rule_set_id) {
      return apiService.get('/api/gbp/policy_rule_set/' + policy_rule_set_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve policy rule set: ' + policy_rule_set_id));
      });
    };

    this.updatePolicyRuleSet = function(policy_rule_set_id, policy_rule_set) {
      return apiService.patch(
        '/api/gbp/policy_rule_set/' + policy_rule_set_id, policy_rule_set
      ).error(function() {
        toastService.add('error', gettext('Unable to update policy rule set: ' + policy_rule_set_id));
      });
    };

    this.deletePolicyRuleSet = function(policy_rule_set_id) {
      return apiService.delete('/api/gbp/policy_rule_set/' + policy_rule_set_id).error(function() {
        toastService.add('error', gettext('Unable to delete policy rule set: ' + policy_rule_set_id));
      });
    };

    this.listPolicyRule = function() {
      return apiService.get('/api/gbp/policy_rule/').error(function() {
        toastService.add('error', gettext('Unable to retrieve policy rules.'));
      });
    };

    this.createPolicyRule = function(policy_rule) {
      return apiService.post('/api/gbp/policy_rule/', policy_rule).error(function() {
        toastService.add('error', gettext('Unable to create policy rule.'));
      });
    };

    this.getPolicyRule = function(policy_rule_id) {
      return apiService.get('/api/gbp/policy_rule/' + policy_rule_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve policy rule: ' + policy_rule_id));
      });
    };

    this.updatePolicyRule = function(policy_rule_id, policy_rule) {
      return apiService.patch('/api/gbp/policy_rule/' + policy_rule_id, policy_rule).error(function() {
        toastService.add('error', gettext('Unable to update policy rule: ' + policy_rule_id));
      });
    };

    this.deletePolicyRule = function(policy_rule_id) {
      return apiService.delete('/api/gbp/policy_rule/' + policy_rule_id).error(function() {
        toastService.add('error', gettext('Unable to delete policy rule: ' + policy_rule_id));
      });
    };

    this.listPolicyClassifier = function() {
      return apiService.get('/api/gbp/policy_classifier/').error(function() {
        toastService.add('error', gettext('Unable to retrieve policy classifiers.'));
      });
    };

    this.createPolicyClassifier = function(policy_classifier) {
      return apiService.post('/api/gbp/policy_classifier/', policy_classifier).error(function() {
        toastService.add('error', gettext('Unable to create policy classifier.'));
      });
    };

    this.getPolicyClassifier = function(policy_classifier_id) {
      return apiService.get('/api/gbp/policy_classifier/' + policy_classifier_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve policy classifier: ' + policy_classifier_id));
      });
    };

    this.updatePolicyClassifier = function(policy_classifier_id, policy_classifier) {
      return apiService.patch('/api/gbp/policy_classifier/' + policy_classifier_id, policy_classifier).error(function() {
        toastService.add('error', gettext('Unable to update policy classifier: ' + policy_classifier_id));
      });
    };

    this.deletePolicyClassifier = function(policy_classifier_id) {
      return apiService.delete('/api/gbp/policy_classifier/' + policy_classifier_id).error(function() {
        toastService.add('error', gettext('Unable to delete policy classifier: ' + policy_classifier_id));
      });
    };

    this.getPolicyClassifierProtocol = function() {
      return apiService.get('/api/gbp/policy_classifier_protocol/').error(function() {
        toastService.add('error', gettext('Unable to get policy classifier protocol list' ));
      });
    };

    this.getPolicyClassifierDirection = function() {
      return apiService.get('/api/gbp/policy_classifier_direction/').error(function() {
        toastService.add('error', gettext('Unable to get policy classifier direction list' ));
      });
    };

    this.listPolicyAction = function() {
      return apiService.get('/api/gbp/policy_action/').error(function() {
        toastService.add('error', gettext('Unable to retrieve policy actions.'));
      });
    };

    this.createPolicyAction = function(policy_action) {
      return apiService.post('/api/gbp/policy_action/', policy_action).error(function() {
        toastService.add('error', gettext('Unable to create policy action.'));
      });
    };

    this.getPolicyAction = function(policy_action_id) {
      return apiService.get('/api/gbp/policy_action/' + policy_action_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve policy action: ' + policy_action_id));
      });
    };

    this.updatePolicyAction = function(policy_action_id, policy_action) {
      return apiService.patch(
        '/api/gbp/policy_action/' + policy_action_id,
        policy_action
      ).error(function() {
        toastService.add('error', gettext('Unable to update policy action: ' + policy_action_id));
      });
    };

    this.deletePolicyAction = function(policy_action_id) {
      return apiService.delete('/api/gbp/policy_action/' + policy_action_id).error(function() {
        toastService.add('error', gettext('Unable to delete policy action: ' + policy_action_id));
      });
    };

    this.getPolicyActionType = function() {
      return apiService.get('/api/gbp/policy_action_type/').error(function() {
        toastService.add('error', gettext('Unable to get policy action type list' ));
      });
    };

    this.listPolicyTarget = function() {
      return apiService.get('/api/gbp/policy_target/').error(function() {
        toastService.add('error', gettext('Unable to retrieve policy targets.'));
      });
    };

    this.createPolicyTarget = function(policy_target) {
      return apiService.post('/api/gbp/policy_target/', policy_target).error(function() {
        toastService.add('error', gettext('Unable to create policy target.'));
      });
    };

    this.deletePolicyTarget = function(policy_target_id) {
      return apiService.delete('/api/gbp/policy_target/' + policy_target_id).error(function() {
        toastService.add('error', gettext('Unable to delete policy target: ' + policy_target_id));
      });
    };

    this.listPolicyTargetGroup = function() {
      return apiService.get('/api/gbp/policy_target_group/').error(function() {
        toastService.add('error', gettext('Unable to retrieve policy target groups.'));
      });
    };

    this.createPolicyTargetGroup = function(policy_target_group) {
      return apiService.post('/api/gbp/policy_target_group/', policy_target_group).error(function() {
        toastService.add('error', gettext('Unable to create policy target group.'));
      });
    };

    this.getPolicyTargetGroup = function(policy_target_group_id) {
      return apiService.get('/api/gbp/policy_target_group/' + policy_target_group_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve policy target group: ' + policy_target_group_id));
      });
    };

    this.getPolicyTargetGroupMembers = function(policy_target_group_id) {
      return apiService.get('/api/gbp/policy_target_group_members/' + policy_target_group_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve policy target group members for: ' + policy_target_group_id));
      });
    };

    this.updatePolicyTargetGroup = function(policy_target_group_id, policy_target_group) {
      return apiService.patch(
        '/api/gbp/policy_target_group/' + policy_target_group_id,
        policy_target_group
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update policy target group: ' + policy_target_group_id));
      });
    };

    this.deletePolicyTargetGroup = function(policy_target_group_id) {
      return apiService.delete('/api/gbp/policy_target_group/' + policy_target_group_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete policy target group: ' + policy_target_group_id));
      });
    };




    this.listExtPolicyTarget = function() {
      return apiService.get('/api/gbp/ext_policy_target/').error(function() {
        toastService.add('error', gettext('Unable to retrieve ext policy targets.'));
      });
    };

    this.createExtPolicyTarget = function(ext_policy_target) {
      return apiService.post('/api/gbp/ext_policy_target/', ext_policy_target).error(function() {
        toastService.add('error', gettext('Unable to create ext policy target.'));
      });
    };

    this.getExtPolicyTarget = function(ext_policy_target_id) {
      return apiService.get('/api/gbp/ext_policy_target/' + ext_policy_target_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve ext policy target: ' + ext_policy_target_id));
      });
    };

    this.updateExtPolicyTarget = function(ext_policy_target_id, ext_policy_target) {
      return apiService.patch(
        '/api/gbp/ext_policy_target/' + ext_policy_target_id,
        ext_policy_target
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update ext policy target: ' + ext_policy_target_id));
      });
    };

    this.deleteExtPolicyTarget = function(ext_policy_target_id) {
      return apiService.delete('/api/gbp/ext_policy_target/' + ext_policy_target_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete ext policy target: ' + ext_policy_target_id));
      });
    };




    this.listL3Policy = function() {
      return apiService.get('/api/gbp/l3_policys').error(function() {
        toastService.add('error', gettext('Unable to retrieve L3 policys.'));
      });
    };

    this.createL3Policy = function(l3_policy) {
      return apiService.post('/api/gbp/l3_policys/', l3_policy).error(function() {
        toastService.add('error', gettext('Unable to create L3 policy.'));
      });
    };

    this.getL3Policy = function(l3_policy_id) {
      return apiService.get('/api/gbp/l3_policy/' + l3_policy_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve L3 policy: ' + l3_policy_id));
      });
    };

    this.updateL3Policy = function(l3_policy_id, l3_policy) {
      return apiService.patch(
        '/api/gbp/l3_policy/' + l3_policy_id,
        l3_policy
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update L3 policy: ' + l3_policy_id));
      });
    };

    this.deleteL3Policy = function(l3_policy_id) {
      return apiService.delete('/api/gbp/l3_policy/' + l3_policy_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete L3 policy: ' + l3_policy_id));
      });
    };



    this.listL2Policy = function() {
      return apiService.get('/api/gbp/l2_policys/').error(function() {
        toastService.add('error', gettext('Unable to retrieve L2 policys.'));
      });
    };

    this.createL2Policy = function(l2_policy) {
      return apiService.post('/api/gbp/l2_policy/', l2_policy).error(function() {
        toastService.add('error', gettext('Unable to create L2 policy.'));
      });
    };

    this.getL2Policy = function(l2_policy_id) {
      return apiService.get('/api/gbp/l2_policy/' + l2_policy_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve L2 policy: ' + l2_policy_id));
      });
    };

    this.updateL2Policy = function(l2_policy_id, l2_policy) {
      return apiService.patch(
        '/api/gbp/l2_policy/' + l2_policy_id,
        l2_policy
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update L2 policy: ' + l2_policy_id));
      });
    };

    this.deleteL2Policy = function(l2_policy_id) {
      return apiService.delete('/api/gbp/l2_policy/' + l2_policy_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete L2 policy: ' + l2_policy_id));
      });
    };



    this.listNetworkServicePolicy = function() {
      return apiService.get('/api/gbp/network_service_policys/').error(function() {
        toastService.add('error', gettext('Unable to retrieve network service policys.'));
      });
    };

    this.createNetworkServicePolicy = function(network_service_policy) {
      return apiService.post('/api/gbp/network_service_policys/', network_service_policy).error(function() {
        toastService.add('error', gettext('Unable to create network service policy.'));
      });
    };

    this.getNetworkServicePolicy = function(network_service_policy_id) {
      return apiService.get('/api/gbp/network_service_policy/' + network_service_policy_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve network service policy: ' + network_service_policy_id));
      });
    };

    this.updateNetworkServicePolicy = function(network_service_policy_id, network_service_policy) {
      return apiService.patch(
        '/api/gbp/network_service_policy/' + network_service_policy_id,
        network_service_policy
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update network service policy: ' + network_service_policy_id));
      });
    };

    this.deleteNetworkServicePolicy = function(network_service_policy_id) {
      return apiService.delete('/api/gbp/network_service_policy/' + network_service_policy_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete network service policy: ' + network_service_policy_id));
      });
    };




    this.listExternalConnectivity = function() {
      return apiService.get('/api/gbp/external_connectivity/').error(function() {
        toastService.add('error', gettext('Unable to retrieve external connectivitys.'));
      });
    };

    this.createExternalConnectivity = function(external_connectivity) {
      return apiService.post('/api/gbp/external_connectivity/', external_connectivity).error(function() {
        toastService.add('error', gettext('Unable to create external connectivity.'));
      });
    };

    this.getExternalConnectivity = function(external_connectivity_id) {
      return apiService.get('/api/gbp/external_connectivity/' + external_connectivity_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve external connectivity: ' + external_connectivity_id));
      });
    };

    this.updateExternalConnectivity = function(external_connectivity_id, external_connectivity) {
      return apiService.patch(
        '/api/gbp/external_connectivity/' + external_connectivity_id,
        external_connectivity
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update external connectivity: ' + external_connectivity_id));
      });
    };

    this.deleteExternalConnectivity = function(external_connectivity_id) {
      return apiService.delete('/api/gbp/external_connectivity/' + external_connectivity_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete external connectivity: ' + external_connectivity_id));
      });
    };



    this.listNatPool = function() {
      return apiService.get('/api/gbp/natpool/').error(function() {
        toastService.add('error', gettext('Unable to retrieve nat pools.'));
      });
    };

    this.createNatPool = function(natpool) {
      return apiService.post('/api/gbp/natpool/', natpool).error(function() {
        toastService.add('error', gettext('Unable to create nat pool.'));
      });
    };

    this.getNatPool = function(natpool_id) {
      return apiService.get('/api/gbp/natpool/' + natpool_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve nat pool: ' + natpool_id));
      });
    };

    this.updateNatPool = function(natpool_id, natpool) {
      return apiService.patch(
        '/api/gbp/natpool/' + natpool_id,
        natpool
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update nat pool: ' + natpool_id));
      });
    };

    this.deleteNatPool = function(natpool_id) {
      return apiService.delete('/api/gbp/natpool/' + natpool_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete nat pool: ' + natpool_id));
      });
    };



    this.listServiceChainNode = function() {
      return apiService.get('/api/gbp/servicechain_node/').error(function() {
        toastService.add('error', gettext('Unable to retrieve service chain nodes.'));
      });
    };

    this.createServiceChainNode = function(servicechain_node) {
      return apiService.post('/api/gbp/servicechain_node/', servicechain_node).error(function() {
        toastService.add('error', gettext('Unable to create service chain node.'));
      });
    };

    this.getServiceChainNode = function(servicechain_node_id) {
      return apiService.get('/api/gbp/servicechain_node/' + servicechain_node_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve service chain node: ' + servicechain_node_id));
      });
    };

    this.updateServiceChainNode = function(servicechain_node_id, servicechain_node) {
      return apiService.patch(
        '/api/gbp/servicechain_node/' + servicechain_node_id,
        servicechain_node
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update service chain node: ' + servicechain_node_id));
      });
    };

    this.deleteServiceChainNode = function(servicechain_node_id) {
      return apiService.delete('/api/gbp/servicechain_node/' + servicechain_node_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete service chain node: ' + servicechain_node_id));
      });
    };




    this.listServiceChainSpec = function() {
      return apiService.get('/api/gbp/servicechain_spec/').error(function() {
        toastService.add('error', gettext('Unable to retrieve service chain specs.'));
      });
    };

    this.createServiceChainSpec = function(servicechain_spec) {
      return apiService.post('/api/gbp/servicechain_spec/', servicechain_spec).error(function() {
        toastService.add('error', gettext('Unable to create service chain spec.'));
      });
    };

    this.getServiceChainSpec = function(servicechain_spec_id) {
      return apiService.get('/api/gbp/servicechain_spec/' + servicechain_spec_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve service chain spec: ' + servicechain_spec_id));
      });
    };

    this.updateServiceChainSpec = function(servicechain_spec_id, servicechain_spec) {
      return apiService.patch(
        '/api/gbp/servicechain_spec/' + servicechain_spec_id,
        servicechain_spec
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update service chain spec: ' + servicechain_spec_id));
      });
    };

    this.deleteServiceChainSpec = function(servicechain_spec_id) {
      return apiService.delete('/api/gbp/servicechain_spec/' + servicechain_spec_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete service chain spec: ' + servicechain_spec_id));
      });
    };



    this.listServiceChainInstance = function() {
      return apiService.get('/api/gbp/servicechain_instance/').error(function() {
        toastService.add('error', gettext('Unable to retrieve service chain instances.'));
      });
    };

    this.createServiceChainInstance = function(servicechain_instance) {
      return apiService.post('/api/gbp/servicechain_instance/', servicechain_instance).error(function() {
        toastService.add('error', gettext('Unable to create service chain instance.'));
      });
    };

    this.getServiceChainInstance = function(servicechain_instance_id) {
      return apiService.get('/api/gbp/servicechain_instance/' + servicechain_instance_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve service chain instance: ' + servicechain_instance_id));
      });
    };

    this.updateServiceChainInstance = function(servicechain_instance_id, servicechain_instance) {
      return apiService.patch(
        '/api/gbp/servicechain_instance/' + servicechain_instance_id,
        servicechain_instance
      ).error(function() {
        toastService.add('error',
            gettext('Unable to update service chain instance: ' + servicechain_instance_id));
      });
    };

    this.deleteServiceChainInstance = function(servicechain_instance_id) {
      return apiService.delete('/api/gbp/servicechain_instance/' + servicechain_instance_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete service chain instance: ' + servicechain_instance_id));
      });
    };



    this.listServiceProfile = function() {
      return apiService.get('/api/gbp/service_profile/').error(function() {
        toastService.add('error', gettext('Unable to retrieve service chain instances.'));
      });
    };

    this.createServiceProfile = function(service_profile) {
      return apiService.post('/api/gbp/service_profile/', service_profile).error(function() {
        toastService.add('error', gettext('Unable to create service chain instance.'));
      });
    };

    this.getServiceProfile = function(service_profile_id) {
      return apiService.get('/api/gbp/service_profile/' + service_profile_id).error(function() {
        toastService.add('error',
            gettext('Unable to retrieve service chain instance: ' + service_profile_id));
      });
    };
    
    this.deleteServiceProfile = function(service_profile_id) {
      return apiService.delete('/api/gbp/service_profile/' + service_profile_id).error(function() {
        toastService.add('error',
            gettext('Unable to delete service chain instance: ' + service_profile_id));
      });
    };



    this.listNetService = function() {
      return apiService.get('/api/gbp/net_service/').error(function() {
        toastService.add('error', gettext('Unable to retrieve net service.'));
      });
    };
  }
}());
