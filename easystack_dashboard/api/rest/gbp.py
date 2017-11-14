# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import logging

from django.views import generic
from django.utils.datastructures import SortedDict  # noqa

from easystack_dashboard import api
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils

import time
LOG = logging.getLogger(__name__)

PROTOCOLS = ('TCP', 'UDP', 'ICMP', 'HTTP',
             'HTTPS', 'SMTP', 'DNS', 'FTP', 'ANY')
DIRECTIONS = ['in',
              'out',
              'bi', ]
POLICY_ACTION_TYPES = ['allow',
                       'redirect',
                       'copy',
                       'log',
                       'qos', ]
PROTOCOL_MAP = {'http': 'tcp',
                'https': 'tcp',
                'smtp': 'tcp',
                'ftp': 'tcp',
                'dns': 'udp'
                }


@urls.register
class Groups(generic.View):

    url_regex = r'gbp/groups/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.is_project_admin(request)[1]
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyRuleSets(generic.View):

    url_regex = r'gbp/policy_rule_set/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.policy_rule_set_list(request,
                                              request.user.tenant_id,)
        for ruleset in result:
            apidict = ruleset._apidict
            policy_rule_ids = apidict.get('policy_rules')
            apidict['policy_rule_ids'] = policy_rule_ids
            apidict['policy_rules']=[]
            for id in policy_rule_ids:
                policy_rule = api.gbp.policyrule_get(request, id)
                apidict['policy_rules'].append(policy_rule.get('name'))
            ruleset._apidict = apidict
        return {'items': [ruleSet.to_dict() for ruleSet in result]}

    @rest_utils.ajax()
    def post(self, request):
        body = {}
        body['name'] = request.DATA.get('name')
        body['description'] = request.DATA.get('description')
        if (body['description'] == None):
            body['description'] = ''
        body['policy_rules'] = request.DATA.get('policyRules')
        body['shared'] = request.DATA.get('shared')
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.policy_rule_set_create(request, **body)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyRuleSet(generic.View):

    url_regex = r'gbp/policy_rule_set/(?P<policy_rule_set_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, policy_rule_set_id):
        result = api.gbp.policy_rule_set_get(request, policy_rule_set_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, policy_rule_set_id):
        body = {}
        body['name'] = request.DATA.get('name')
        body['description'] = request.DATA.get('description')
        if (body['description'] == None):
            body['description'] = ''
        body['policy_rules'] = request.DATA.get('policyRules')
        body['shared'] = request.DATA.get('shared')
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.policy_rule_set_update(request,
                                                policy_rule_set_id,
                                                **body)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, policy_rule_set_id):
        result = api.gbp.policy_rule_set_delete(request, policy_rule_set_id)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyRules(generic.View):
    url_regex = r'gbp/policy_rule/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.policyrule_list(request,
                                         request.user.tenant_id,)
        for rule in result:
            apidict = rule._apidict
            classifier_id = apidict.get('policy_classifier_id')
            classifier = api.gbp.policyclassifier_get(request, classifier_id)
            apidict['policy_classifier'] = classifier.get('name')
            policy_action_ids = apidict.get('policy_actions')
            apidict['policy_actions'] = {}
            apidict['policy_actions_id'] = []
            i=0
            for action in policy_action_ids:
                actions = api.gbp.policyaction_get(request, action)
                apidict['policy_actions_id'].append(action)
                apidict['policy_actions'][i] = actions.get('name')
                i = i+1
            rule._apidict = apidict

        return {'items': [rule.to_dict() for rule in result]}

    @rest_utils.ajax()
    def post(self, request):
        body = {}
        body['name'] = request.DATA.get('name')
        body['description'] = request.DATA.get('description')
        body['policy_actions'] = request.DATA.get('policyActions')
        body['policy_classifier_id'] = request.DATA.get('policyClassifier')
        body['shared'] = request.DATA.get('shared')
        if(body['description'] == None):
            body['description'] = ''
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.policyrule_create(request, **body)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyRule(generic.View):

    url_regex = r'gbp/policy_rule/(?P<policy_rule_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, policy_rule_id):
        result = api.gbp.policyrule_get(request, policy_rule_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, policy_rule_id):
        body = {}
        body['name'] = request.DATA.get('name')
        body['description'] = request.DATA.get('description')
        if (body['description'] == None):
            body['description'] = ''
        body['policy_actions'] = request.DATA.get('policyActions')
        body['policy_classifier_id'] = request.DATA.get('policyClassifier')
        body['shared'] = request.DATA.get('shared')
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.policyrule_update(request,
                                           policy_rule_id,
                                           **body)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, policy_rule_id):
        result = api.gbp.policyrule_delete(request, policy_rule_id)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyClassifiers(generic.View):

    url_regex = r'gbp/policy_classifier/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.policyclassifier_list(request,
                                               request.user.tenant_id,)
        return {'items': [classifier.to_dict() for classifier in result]}

    @rest_utils.ajax()
    def post(self, request):
        body = request.DATA
        result = api.gbp.policyclassifier_create(request, **body)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyClassifier(generic.View):

    url_regex = r'gbp/policy_classifier/(?P<policy_classifier_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, policy_classifier_id):
        result = api.gbp.policyclassifier_get(request, policy_classifier_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, policy_classifier_id):
        body = {}
        body['name'] = request.DATA.get('name')
        body['description'] = request.DATA.get('description')
        if (body['description'] == None):
            body['description'] = ''
        body['protocol'] = request.DATA.get('protocol')
        body['port_range'] = request.DATA.get('port_range')
        body['direction'] = request.DATA.get('direction')
        body['shared'] = request.DATA.get('shared')
        result = api.gbp.policyclassifier_update(request,
                                                 policy_classifier_id,
                                                 **body)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, policy_classifier_id):
        result = api.gbp.policyclassifier_delete(request, policy_classifier_id)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyClassifierProtocol(generic.View):

    url_regex = r'gbp/policy_classifier_protocol/$'

    @rest_utils.ajax()
    def get(self, request):
        return {'items': [protocol for protocol in PROTOCOLS]}


@urls.register
class PolicyClassifierDirection(generic.View):

    url_regex = r'gbp/policy_classifier_direction/$'

    @rest_utils.ajax()
    def get(self, request):
        return {'items': [direction for direction in DIRECTIONS]}


@urls.register
class PolicyActions(generic.View):

    url_regex = r'gbp/policy_action/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.policyaction_list(request,
                                           request.user.tenant_id,)
        return {'items': [action.to_dict() for action in result]}

    @rest_utils.ajax()
    def post(self, request):
        body = request.DATA
        result = api.gbp.policyaction_create(request, **body)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyAction(generic.View):

    url_regex = r'gbp/policy_action/(?P<policyaction_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, policyaction_id):
        result = api.gbp.policyaction_get(request, policyaction_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, policyaction_id):
        body = {}
        body['name'] = request.DATA.get('name')
        body['description'] =request.DATA.get('description')
        if (body['description'] == None):
            body['description'] = ''
        body['shared'] = request.DATA.get('shared')
        result = api.gbp.policyaction_update(request,
                                             policyaction_id,
                                             **body)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, policyaction_id):
        result = api.gbp.policyaction_delete(request, policyaction_id)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyActionType(generic.View):

    url_regex = r'gbp/policy_action_type/$'

    @rest_utils.ajax()
    def get(self, request):
        return {'items': [type for type in POLICY_ACTION_TYPES ]}


@urls.register
class PolicyTargets(generic.View):
    # policy target
    url_regex = r'gbp/policy_target/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.pt_list(request, request.user.tenant_id, **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.pt_create(request, request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyTarget(generic.View):
    # policy target
    url_regex = r'gbp/policy_target/(?P<policytarget_id>.+)$'

    @rest_utils.ajax()
    def delete(self, request, policytarget_id):
        api.gbp.pt_delete(request, policytarget_id)


@urls.register
class PolicyTargetGroups(generic.View):
    # this is actually policy target group
    url_regex = r'gbp/policy_target_group/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.policy_target_list(request,
                                            request.user.tenant_id,
                                            **request.GET)
        result = rest_utils.ensure_l2_policy_name(request, result)
        result = rest_utils.ensure_policy_rule_set_name(
            request, result, 'provided')
        result = rest_utils.ensure_policy_rule_set_name(
            request, result, 'consumed')
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        body = {}
        body['name'] = request.DATA.get('name')
        if(request.DATA.has_key('description')):
            body['description'] = request.DATA.get('description')
        body['l2_policy_id'] = request.DATA.get('networkPolicy')
        body['network_service_policy_id'] = request.DATA.get('networkServicePolicy')
        consumePRS = request.DATA.get('consumePolicyRuleSet')
        body['consumed_policy_rule_sets'] = {}
        for prs in consumePRS:
            body['consumed_policy_rule_sets'][prs] = None
        providedPRS = request.DATA.get('providePolicyRuleSet')
        body['provided_policy_rule_sets'] = {}
        for prs in providedPRS:
            body['provided_policy_rule_sets'][prs] = None
        body['shared'] = request.DATA.get('shared')
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.policy_target_create(request, **body)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class PolicyTargetGroup(generic.View):
    # this is actually policy target group, the function name is wrong
    url_regex = r'gbp/policy_target_group/(?P<policytargetgroup_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, policytargetgroup_id):
        result = api.gbp.policy_target_get(request, policytargetgroup_id)
        result = rest_utils.ensure_policy_rule_set(
            request, [result], 'provided')[0]
        result = rest_utils.ensure_policy_rule_set(
            request, [result], 'consumed')[0]
        l2_policy = api.gbp.l2policy_get(request, result.l2_policy_id)
        result.get_dict()['l2_policy_name'] = \
            l2_policy['name'] + ':' + l2_policy['id']
        l3_policy = api.gbp.l3policy_get(request, l2_policy.l3_policy_id)
        result.get_dict()['l3_policy_name'] = \
            l3_policy['name'] + ':' + l3_policy['id']

        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, policytargetgroup_id):
        body = {}
        body['name'] = request.DATA.get('name')
        if(request.DATA.has_key('description')):
            body['description'] = request.DATA.get('description')
        body['l2_policy_id'] = request.DATA.get('networkPolicy')
        body['network_service_policy_id'] = request.DATA.get('networkServicePolicy')
        consumePRS = request.DATA.get('consumePolicyRuleSet')
        body['consumed_policy_rule_sets'] = {}
        for prs in consumePRS:
            body['consumed_policy_rule_sets'][prs] = None
        providedPRS = request.DATA.get('providePolicyRuleSet')
        body['provided_policy_rule_sets'] = {}
        for prs in providedPRS:
            body['provided_policy_rule_sets'][prs] = None
        body['shared'] = request.DATA.get('shared')
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.policy_target_update(request,
                                              policytargetgroup_id,
                                              **body)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, policytargetgroup_id):
        api.gbp.policy_target_delete(request, policytargetgroup_id)


@urls.register
class PolicyTargetGroupMembers(generic.View):
    url_regex = r'gbp/policy_target_group_members/(?P<policytargetgroup_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, policytargetgroup_id):

        def is_deleting(instance):
            task_state = getattr(instance, "OS-EXT-STS:task_state", None)
            if not task_state:
                return False
            return task_state.lower() == "deleting"

        filtered_instances = []
        try:
            policytargets = api.gbp.pt_list(
                request,
                tenant_id=request.user.tenant_id,
                policy_target_group_id=policytargetgroup_id)
            policy_target_ports = [x.port_id for x in policytargets]
            instances, page = api.nova.server_list(request)
            instances = [item for item in instances
                         if not is_deleting(item)]
            if policy_target_ports:
                time.sleep(0.5)
            for item in instances:
                for port in api.neutron.port_list(request,
                                                  device_id=item.id):
                    if port.id in policy_target_ports:
                        filtered_instances.append(item)
                        break

        except Exception:
            filtered_instances = []

        result = []
        for inst in filtered_instances:
            inst_dict = inst.to_dict()
            inst_dict['image_name'] = inst.image_name
            result.append(inst_dict)

        return result


@urls.register
class ExtPolicyTargets(generic.View):

    url_regex = r'gbp/ext_policy_target/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.ext_policy_target_list(request,
                                                request.user.tenant_id,
                                                **request.GET)
        result = rest_utils.ensure_external_connectivity(request, result)
        result = rest_utils.ensure_policy_rule_set_name(
            request, result, 'provided')
        result = rest_utils.ensure_policy_rule_set_name(
            request, result, 'consumed')
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        body = {}
        body['name'] = request.DATA.get('name')
        if(request.DATA.has_key('description')):
            body['description'] = request.DATA.get('description')
        extConnect = request.DATA.get('externalConnectivity')

        body['external_segments'] = []
        for conn in extConnect:
            body['external_segments'].append(conn)
        consumePRS = request.DATA.get('consumePolicyRuleSet')
        body['consumed_policy_rule_sets'] = {}
        for prs in consumePRS:
            body['consumed_policy_rule_sets'][prs] = None
        providedPRS = request.DATA.get('providePolicyRuleSet')
        body['provided_policy_rule_sets'] = {}
        for prs in providedPRS:
            body['provided_policy_rule_sets'][prs] = None
        body['shared'] = request.DATA.get('shared')
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.ext_policy_target_create(request, **body)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class ExtPolicyTarget(generic.View):

    url_regex = r'gbp/ext_policy_target/(?P<extpolicytarget_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, extpolicytarget_id):
        result = api.gbp.ext_policy_target_get(request, extpolicytarget_id)
        result = rest_utils.ensure_policy_rule_set(
            request, [result], 'provided')[0]
        result = rest_utils.ensure_policy_rule_set(
            request, [result], 'consumed')[0]
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, extpolicytarget_id):
        body = {}
        body['name'] = request.DATA.get('name')
        if (request.DATA.has_key('description')):
            body['description'] = request.DATA.get('description')
        extConnect = request.DATA.get('externalConnectivity')

        body['external_segments'] = []
        for conn in extConnect:
            body['external_segments'].append(conn)
        consumePRS = request.DATA.get('consumePolicyRuleSet')
        body['consumed_policy_rule_sets'] = {}
        for prs in consumePRS:
            body['consumed_policy_rule_sets'][prs] = None
        providedPRS = request.DATA.get('providePolicyRuleSet')
        body['provided_policy_rule_sets'] = {}
        for prs in providedPRS:
            body['provided_policy_rule_sets'][prs] = None
        body['shared'] = request.DATA.get('shared')
        if (body['shared'] == None):
            body['shared'] = False
        result = api.gbp.ext_policy_target_update(request,
                                                  extpolicytarget_id,
                                                  **body)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, extpolicytarget_id):
        api.gbp.ext_policy_target_delete(request, extpolicytarget_id)


@urls.register
class L3policys(generic.View):

    url_regex = r'gbp/l3_policys/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.l3policy_list(request,
                                       request.user.tenant_id)

        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.l3policy_create(request, **request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class L3policy(generic.View):

    url_regex = r'gbp/l3_policy/(?P<l3policy_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, l3policy_id):
        result = api.gbp.l3policy_get(request, l3policy_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, l3policy_id):
        result = api.gbp.l3policy_update(request, l3policy_id, **request.DATA)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, l3policy_id):
        api.gbp.l3policy_delete(request, l3policy_id)


@urls.register
class L2policys(generic.View):

    url_regex = r'gbp/l2_policys/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.l2policy_list(request,
                                       request.user.tenant_id,
                                       **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.l2policy_create(request, **request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class L2policy(generic.View):
    url_regex = r'gbp/l2_policy/(?P<l2policy_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, l2policy_id):
        result = api.gbp.l2policy_get(request, l2policy_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, l2policy_id):
        result = api.gbp.l2policy_update(request, l2policy_id, **request.DATA)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, l2policy_id):
        api.gbp.l2policy_delete(request, l2policy_id)


@urls.register
class NetworkServicePolicys(generic.View):

    url_regex = r'gbp/network_service_policys/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.networkservicepolicy_list(request,
                                                   request.user.tenant_id,
                                                   **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.create_networkservice_policy(request, **request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class NetworkServicePolicy(generic.View):

    url_regex = r'gbp/network_service_policy/(?P<networkservicepolicy_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, networkservicepolicy_id):
        result = api.gbp.get_networkservice_policy(request,
                                                   networkservicepolicy_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, networkservicepolicy_id):
        result = api.gbp.update_networkservice_policy(request,
                                                      networkservicepolicy_id,
                                                      **request.DATA)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, networkservicepolicy_id):
        api.gbp.delete_networkservice_policy(request,
                                             networkservicepolicy_id)


@urls.register
class ExternalConnectivities(generic.View):

    url_regex = r'gbp/external_connectivity/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.externalconnectivity_list(request,
                                                   request.user.tenant_id,
                                                   **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.create_externalconnectivity(request, **request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class ExternalConnectivity(generic.View):

    url_regex = r'gbp/external_connectivity/(?P<externalconnectivity_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, externalconnectivity_id):
        result = api.gbp.get_externalconnectivity(request,
                                                  externalconnectivity_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, externalconnectivity_id):
        result = api.gbp.update_externalconnectivity(request,
                                                     externalconnectivity_id,
                                                     **request.DATA)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, externalconnectivity_id):
        api.gbp.delete_externalconnectivity(request,
                                            externalconnectivity_id)


@urls.register
class Natpools(generic.View):

    url_regex = r'gbp/natpool/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.natpool_list(request,
                                      request.user.tenant_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.create_natpool(request, **request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class Natpool(generic.View):

    url_regex = r'gbp/natpool/(?P<natpool_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, natpool_id):
        result = api.gbp.get_natpool(request, natpool_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, natpool_id):
        result = api.gbp.update_natpool(request, natpool_id, **request.DATA)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, natpool_id):
        api.gbp.delete_natpool(request, natpool_id)


@urls.register
class ServiceChainNodes(generic.View):

    url_regex = r'gbp/service_chain_node/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.servicechainnode_list(request,
                                               request.user.tenant_id,
                                               **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.create_servicechain_node(request, request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class ServiceChainNode(generic.View):

    url_regex = r'gbp/service_chain_node/(?P<servicechain_node_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, servicechain_node_id):
        result = api.gbp.get_servicechain_node(request, servicechain_node_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, servicechain_node_id):
        result = api.gbp.update_servicechain_node(request,
                                                  servicechain_node_id,
                                                  **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, servicechain_node_id):
        api.gbp.delete_servicechain_node(request, servicechain_node_id)


@urls.register
class ServicechainSpecs(generic.View):

    url_regex = r'gbp/servicechain_spec/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.servicechainspec_list(request,
                                               request.user.tenant_id,
                                               **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.create_servicechain_spec(request, request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class ServiceChainSpec(generic.View):
    url_regex = r'gbp/servicechain_spec/(?P<servicechain_spec_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, servicechain_spec_id):
        result = api.gbp.get_servicechain_spec(request, servicechain_spec_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, servicechain_spec_id):
        result = api.gbp.update_servicechain_spec(request,
                                                  servicechain_spec_id,
                                                  request.DATA)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, servicechain_spec_id):
        api.gbp.delete_servicechain_spec(request, servicechain_spec_id)


@urls.register
class ServiceChainInstances(generic.View):

    url_regex = r'gbp/servicechain_instance/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.servicechaininstance_list(request,
                                                   request.user.tenant_id,
                                                   **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.create_servicechain_instance(request, request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class ServicechainInstance(generic.View):

    url_regex = r'gbp/servicechain_instance/(?P<servicechaininstance_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, servicechaininstance_id):
        result = api.gbp.get_servicechain_instance(request,
                                                   servicechaininstance_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def patch(self, request, servicechaininstance_id):
        result = api.gbp.update_servicechain_instance(request,
                                                      servicechaininstance_id,
                                                      request.DATA)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, servicechaininstance_id):
        api.gbp.delete_servicechain_instance(request,
                                             servicechaininstance_id)


@urls.register
class ServiceProfiles(generic.View):

    url_regex = r'gbp/serviceprofile/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.serviceprofile_list(request,
                                             request.user.tenant_id,
                                             **request.GET)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def post(self, request):
        result = api.gbp.create_service_profile(request, request.DATA)
        return rest_utils.JSONResponse(result, 200)


@urls.register
class ServiceProfile(generic.View):

    url_regex = r'gbp/serviceprofile/(?P<serviceprofile_id>.+)$'

    @rest_utils.ajax()
    def get(self, request, serviceprofile_id):
        result = api.gbp.get_service_profile(request, serviceprofile_id)
        return rest_utils.JSONResponse(result, 200)

    @rest_utils.ajax()
    def delete(self, request, serviceprofile_id):
        api.gbp.delete_service_profile(request, serviceprofile_id)


@urls.register
class NetService(generic.View):

    url_regex = r'gbp/net_service/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.gbp.is_project_admin(request)[1]
        return rest_utils.JSONResponse(result, 200)
