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
  angular.module('hz.dashboard.project.network_policy')

  /**
   *
   * @ngdoc network_policyFormCtrl
   *
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit router form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */

   // Add network service parameter
  .controller('addExternalSegmentParameterFormCtrl', [
    '$scope',
    '$modalInstance',
    'context',
    'segment_parameter',
    'horizon.openstack-service-api.gbp',
    function(scope, modalInstance, context, segment_parameter, gbpAPI) {
      var action = {
        submit: function() {
          modalInstance.close(segment_parameter);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      // Get external connectivity
      gbpAPI.listExternalConnectivity()
        .success(function(response) {
          scope.listExternals = response;
          scope.listExternalSwitch = true;
          scope.listExternalSeleted = scope.listExternals[0];
        });

      scope.context = context;
      scope.action = action;
      scope.segment_parameter = segment_parameter;

    }
  ])

  .controller('l3PolicyFormCtrl', [
    '$scope',
    '$modalInstance',
    'context',
    'l3_policy',
    'addExternalSegmentParameterAction',
    function(scope, modalInstance, context, l3_policy, AddAction) {
      var action = {
        submit: function() {
          modalInstance.close(l3_policy);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        add_external_segment_parameter: new AddAction(scope)
      },
      ips;

      scope.ip_versions = ips = [{ name: 'IPv4', value: 4 },{ name: 'IPv6', value: 6 }];

      if (context.mode === 'create') {
        scope.ip_version_seleted = scope.ip_versions[0];
      }

      if(context.mode === 'edit'){
        for(var i=0,len=ips.length; i<len; i++){
          if(ips[i].value === l3_policy.ip_version){
            scope.ip_version_seleted = ips[i];
          }
        }
      }

      scope.context = context;
      scope.action = action;
      scope.l3_policy = l3_policy;
    }
  ])

  .controller('l3PolicyDetailFormCtrl', [
    '$scope',
    '$modalInstance',
    '$timeout',
    'horizon.openstack-service-api.gbp',
    'createl2PolicyAction',
    'l2PolicyDeleteAction',
    'editL2PolicyAction',
    'context',
    'l3_detail',
    'ctrl',
    function(scope, modalInstance, timeout, gbpAPI, CreateL2, DeleteAction, EditAction, context, l3_detail, ctrl) {
      var w = 888,
          self = this,
          action = {
            submit: function() {
              modalInstance.close(l3_policy);
            },
            cancel: function() {
              $('.detailContent').stop();
              $('.detailContent').animate({
                right: -(w + 40)
              }, 400, function() {
                modalInstance.dismiss('cancel');
              });
            }
          },
          h = $(window).height();

      timeout(function(){
        $('.detailContent').css({
          height: h,
          width: w,
          right: -w
        });
        $('.detailContent .tab-content').css({
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
        $('.detailContent .tab-content').css({
          height: h2-62
        });
      });

      this.reset = function ($table) {
        scope.L2Policys = [];
        scope.iL2Policys = [];
        scope.iL2PolicyState = false;
        scope.detailDataState = false;

        if ($table) {
          $table.resetSelected();
        }
      };

      this.init = function () {
        self.refresh();
        scope.actions = {
          refresh: self.refresh,
          deleted: new DeleteAction(scope),
          edit: new EditAction(scope),
          createL2: new CreateL2(scope)
        };
        scope.$on('l2policyRefresh', function(){
          self.refresh();
        });
      };

      // on load, if router has permission
      // fetch table data and populate it
      this.refresh = function ($table) {
        self.reset($table);
        gbpAPI.listL2Policy()
          .success(function (response) {
            scope.L2Policys = response;
            scope.detailDataState = true;
          });
      };

      this.init();

      scope.context = context;
      scope.title = context.title;
      scope.action = action;
      scope.l3_detail = l3_detail;
      scope.ctrl = ctrl;

    }
  ])

  // Create l2 policy
  .controller('l2PolicyFormCtrl', [
    '$scope',
    '$modalInstance',
    'horizon.openstack-service-api.gbp',
    'context',
    'policy',
    function(scope, modalInstance, gbpAPI, context, policy) {
      var action = {
        submit: function() {
          modalInstance.close(policy);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      },
      actionMothed;

      actionMothed = {
        create: function(){
          scope.l3_policy_seleted = scope.l3Policys[0];
        },
        edit: function(){
          for(var i=0,len=scope.l3Policys.length; i<len; i++){
            if(scope.l3Policys[i].id === policy.l3_policy_id){
              scope.l3_policy_seleted = scope.l3Policys[i];
            }
          }
        }
      };

      // Get List L3 Policy
      gbpAPI.listL3Policy()
      .success(function(response) {
          scope.l3Policys = response;

          // context.mode = create or edit
          actionMothed[context.mode]();
          scope.l3PolicySwitch = true;
        });

      scope.context = context;
      scope.action = action;
      scope.policy = policy;
    }
  ])

  /**
   ** Service policy controller
   **/

  // Add network service parameter
  .controller('addNetworkServiceParameterFormCtrl', [
    '$scope',
    '$modalInstance',
    'context',
    'service_parameter',
    'horizon.openstack-service-api.gbp',
    function(scope, modalInstance, context, service_parameter, gbpAPI) {
      var action = {
        submit: function() {
          modalInstance.close(service_parameter);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      // Get policy type
      gbpAPI.getPolicyActionType()
        .success(function(response) {
          scope.types = response.items;
        });

      scope.context = context;
      scope.action = action;
      scope.service_parameter = service_parameter;

    }
  ])

  // Create and edit controller
  .controller('servicePolicyFormCtrl', [
    '$scope',
    '$modalInstance',
    'context',
    'service_policy',
    'addNetworkServiceParameterAction',
    function(scope, modalInstance, context, service_policy, AddAction) {
      var action = {
        submit: function() {
          modalInstance.close(service_policy);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        add_network_service_parameter: new AddAction(scope)
      };

      scope.context = context;
      scope.action = action;
      scope.service_policy = service_policy;
    }
  ])


  /**
   ** External connectivity controller
   **/

  // Add external route parameter
  .controller('addExternalRouteParameterFormCtrl', [
    '$scope',
    '$modalInstance',
    'context',
    'route_parameter',
    function(scope, modalInstance, context, route_parameter) {
      var action = {
        submit: function() {
          modalInstance.close(route_parameter);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      scope.context = context;
      scope.action = action;
      scope.route_parameter = route_parameter;

    }
  ])

  // Create and edit controller
  .controller('externalConnectivityFormCtrl', [
    '$scope', '$modalInstance',
    'context',
    'horizon.openstack-service-api.gbp',
    'external',
    'horizon.openstack-service-api.neutron',
    'addExternalRouteParameterAction',
    function(scope, modalInstance, context, gbpAPI, external, neutronAPI, AddAction) {
      var action = {
        submit: function() {
          modalInstance.close(external);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        add_route_parameter: new AddAction(scope)
      },
      actionMethod;

      scope.ip_versions = [{ name: 'IPv4', value: 4 },{ name: 'IPv6', value: 6 }];

      actionMethod = {

        create: function(){
          scope.ip_version_seleted = scope.ip_versions[0];

          neutronAPI.getSubnets()
          .success(function(response) {
            scope.listSubnets = response.items;
            scope.listSubnetSeleted = scope.listSubnets[0];
          });
        }

      };

      // context.mode = create or edit
      actionMethod['create']();

      scope.context = context;
      scope.action = action;
      scope.external = external;
    }
  ])

  // NAT pool controller
  .controller('natPoolFormCtrl', [
    '$scope',
    '$modalInstance',
    'context',
    'natPool',
    'horizon.openstack-service-api.gbp',
    function(scope, modalInstance, context, natPool, gbpAPI) {
      var action = {
        submit: function() {
          modalInstance.close(natPool);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      },
      actionMethod;

      scope.ip_versions = [{ name: 'IPv4', value: 4 },{ name: 'IPv6', value: 6 }];

      actionMethod = {
        create: function(){
          scope.ip_version_seleted = scope.ip_versions[0];
          scope.listExternalSeleted = scope.listExternals[0];
          scope.listExternalSwitch = true;
        },
        edit: function(){
          var lists = scope.listExternals,
              ips = scope.ip_versions;

          for(var i=0,len=lists.length; i<len; i++){
            if(lists[i].id === natPool.external_segment_id){
              scope.listExternalSeleted = lists[i];
            }
          }

          for(var i=0,len=ips.length; i<len; i++){
            if(ips[i].value === natPool.ip_version){
              scope.ip_version_seleted = ips[i];
            }
          }
        }
      };

      // Get external connectivity
      gbpAPI.listExternalConnectivity()
        .success(function(response) {
          scope.listExternals = response;
          actionMethod[context.mode]();
        });

      scope.context = context;
      scope.action = action;
      scope.natPool = natPool;

    }
  ]);

})();