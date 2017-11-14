/**
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.project.policygroups')
    .controller('interlGroupDetailFormCtrl', [
        '$scope', '$rootScope', '$modalInstance',
        'horizon.openstack-service-api.gbp',
        'horizon.openstack-service-api.keystone',
        'horizon.openstack-service-api.usersettings',
        'detail', '$timeout',
        function(scope, rootScope, modalInstance, GBPAPI, keystoneAPI, usersettingAPI, detail, $timeout) {
          var w = 888;
          var h = $(window).height();

          $timeout(function(){
            $('.detailContent').css({
                  height: h,
                  width: w,
                  right: -w
            });
            $('.tab-content').css({
              height: h-62
            });
            $('.detailContent').stop();
            $('.detailContent').animate({
                right: 0
            },400)
            .css('overflow', 'visible');
          });
          $(window).resize(function() {
            var w2 = 888;
            var h2 = $(window).height();
              $('.detailContent').css({
                width: w2,
                height: h2
              });
              $('.tab-content').css({
                height: h2-62
              });
          });

          var self = this;

          var action = {
            cancel: function() {
              $('.detailContent').stop();
              $('.detailContent').animate({
                right: -(w + 40)
              }, 400, function() {
                modalInstance.dismiss('cancel');
              });
            },
            refresh: function($table) {
              if($table){
                $table.resetSelected();
              }
              init();
            }
          };

          scope.instanceStatus = {
            'ACTIVE': gettext("Active"),
            'DELETED': gettext("Deleted"),
            'BUILD': gettext('Build'),
            'SHUTOFF': gettext("Shutoff"),
            'SUSPENDED': gettext("Suspended"),
            'PAUSED': gettext("Paused"),
            'ERROR': gettext("Error"),
            'RESIZE': gettext("Resize"),
            'VERIFY_RESIZE': gettext("Confirm or Revert Resize"),
            'REVERT_RESIZE': gettext("Revert Resize"),
            'REBOOT': gettext("Reboot"),
            'HARD_REBOOT': gettext("Hard Reboot"),
            'PASSWORD': gettext("Password"),
            'REBUILD': gettext("Rebuild"),
            'MIGRATING': gettext("Migrating"),
            'RESCUE': gettext("Rescue"),
            'SOFT_DELETED': gettext("Soft Delete"),
            'STOPPING': gettext("Stopping"),
            'PENDING': gettext("Pending"),
          };

          scope.action = action;
          scope.detail = detail;

          function init() {
            scope.providedPolicyRuleSetState = false;
            scope.consumedPolicyRuleSetState = false;
            GBPAPI.getPolicyTargetGroup(detail.id).success(function(response) {
              scope.providedPolicyRuleSets = response.provided_policy_rule_set_list;
              scope.consumedPolicyRuleSets = response.consumed_policy_rule_set_list;
              scope.policyTargetGroupL2PolicyName = response.l2_policy_name;
              scope.policyTargetGroupL3PolicyName = response.l3_policy_name;
              scope.providedPolicyRuleSetState = true;
              scope.consumedPolicyRuleSetState = true;
            });

            scope.instanceState = false;
            GBPAPI.getPolicyTargetGroupMembers(detail.id).success(function(response) {
              scope.instances = response;
              scope.instanceState = true;
            });

            keystoneAPI.getCurrentUserSession().success(function(response) {
              usersettingAPI.getProjectQuota(response.project_id, {only_quota: true}).success(function(data){
                for (var i = 0; i < data.items.length; i++){
                  if (data.items[i].name === 'instances'){
                    scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                    break;
                  }
                }
              });
            });
          }

          init();
        }])
    .controller('externalGroupDetailFormCtrl', [
        '$scope', '$rootScope', '$modalInstance', 'horizon.openstack-service-api.gbp', 'detail', '$timeout',
        function(scope, rootScope, modalInstance, GBPAPI, detail, $timeout) {
          var w = 888;
          var h = $(window).height();

          $timeout(function(){
            $('.detailContent').css({
                  height: h,
                  width: w,
                  right: -w
            });
            $('.tab-content').css({
              height: h-62
            });
            $('.detailContent').stop();
            $('.detailContent').animate({
                right: 0
            },400)
            .css('overflow', 'visible');
          });
          $(window).resize(function() {
            var w2 = 888;
            var h2 = $(window).height();
              $('.detailContent').css({
                width: w2,
                height: h2
              });
              $('.tab-content').css({
                height: h2-62
              });
          });

          var self = this;

          var action = {
            cancel: function() {
              $('.detailContent').stop();
              $('.detailContent').animate({
                right: -(w + 40)
              }, 400, function() {
                modalInstance.dismiss('cancel');
              });
            }
          };

          scope.action = action;

          function init() {
            scope.providedPolicyRuleSetState = false;
            scope.consumedPolicyRuleSetState = false;
            GBPAPI.getExtPolicyTarget(detail.id).success(function(response) {
              scope.providedPolicyRuleSets = response.provided_policy_rule_set_list;
              scope.consumedPolicyRuleSets = response.consumed_policy_rule_set_list;
              scope.policyTargetGroupL2PolicyName = response.l2_policy_name;
              scope.policyTargetGroupL3PolicyName = response.l3_policy_name;
              scope.providedPolicyRuleSetState = true;
              scope.consumedPolicyRuleSetState = true;
            });
          }

          init();
        }])
    .controller('interlGroupFormCtrl', [
    '$scope', '$rootScope', '$modalInstance', 'horizon.openstack-service-api.gbp', 'policyTargetGroup', 'context', 'createRuleSetAction',
      function(scope, rootScope, modalInstance, gbpAPI, policyTargetGroup, context, createRuleSet) {
        var self = this;
        scope.policyTargetGroup = policyTargetGroup ;

        var action = {
          submit: function() { modalInstance.close(policyTargetGroup); },
          cancel: function() { modalInstance.dismiss('cancel'); },
          createRuleSet: new createRuleSet(scope)
        };

        scope.context = context;
        scope.action = action;

        gbpAPI.listPolicyRuleSet().then(
          function success(response){
            scope.rulesets = response.data.items;
            if(policyTargetGroup.provided_policy_rule_sets){
              scope.policyTargetGroup.providePolicyRuleSet = policyTargetGroup.provided_policy_rule_sets;
              scope.prulesetIndex = policyTargetGroup.provided_policy_rule_sets ;
            }
            if(policyTargetGroup.consumed_policy_rule_sets){
              scope.policyTargetGroup.consumePolicyRuleSet = policyTargetGroup.consumed_policy_rule_sets;
              scope.crulesetIndex = policyTargetGroup.consumed_policy_rule_sets ;
            }
          }
        );
        gbpAPI.listL2Policy().then(
          function success(response){
            scope.networkpolicies = response.data;
            if(policyTargetGroup.l2_policy_id){
              scope.policyTargetGroup.networkPolicy = policyTargetGroup.l2_policy_id ;
              scope.networkpolicyIndex = policyTargetGroup.l2_policy_id ;
            }
          }
        );
        gbpAPI.listNetworkServicePolicy().then(
          function success(response){
            scope.networkservicepolicies = response.data;
            if(policyTargetGroup.network_service_policy_id){
              scope.policyTargetGroup.networkServicePolicy = policyTargetGroup.network_service_policy_id ;
              scope.networkservicepolicyIndex = policyTargetGroup.network_service_policy_id ;
            }
          }
        );
      }
    ])
    .controller('externalGroupFormCtrl', [
    '$scope', '$rootScope', '$modalInstance', 'horizon.openstack-service-api.gbp', 'extPolicyTargetGroup', 'context', 'createRuleSetAction', 'createExternalConnectivityAction',
      function(scope, rootScope, modalInstance, gbpAPI, extPolicyTargetGroup, context, createRuleSet, createExternalConnectivityAction) {
        var self = this;
        scope.extPolicyTargetGroup = extPolicyTargetGroup ;

        var action = {
          submit: function() { modalInstance.close(extPolicyTargetGroup); },
          cancel: function() { modalInstance.dismiss('cancel'); },
          createRuleSet: new createRuleSet(scope),
          createExtConn: new createExternalConnectivityAction(scope)
        };

        scope.context = context;
        scope.action = action;

        gbpAPI.listPolicyRuleSet().then(
          function success(response){
            scope.rulesets = response.data.items;
            if(extPolicyTargetGroup.provided_policy_rule_sets){
              scope.extPolicyTargetGroup.providePolicyRuleSet = extPolicyTargetGroup.provided_policy_rule_sets;
              scope.prulesetIndex = extPolicyTargetGroup.provided_policy_rule_sets ;
            }
            if(extPolicyTargetGroup.consumed_policy_rule_sets){
              scope.extPolicyTargetGroup.consumePolicyRuleSet = extPolicyTargetGroup.consumed_policy_rule_sets;
              scope.crulesetIndex = extPolicyTargetGroup.consumed_policy_rule_sets ;
            }
          }
        );
        gbpAPI.listExternalConnectivity().then(
          function success(response){
            scope.extConns = response.data;
            if(extPolicyTargetGroup.external_segments){
              scope.extPolicyTargetGroup.externalConnectivity = extPolicyTargetGroup.external_segments ;
              scope.extconnIndex = extPolicyTargetGroup.external_segments ;
            }
          }
        );
      }
    ]);
})();

