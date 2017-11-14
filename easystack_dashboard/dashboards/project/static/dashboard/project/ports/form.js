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

  angular.module('hz.dashboard.project.ports')

  /**
   * @ngdoc portFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit port form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('portFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.lbaasv2',
    'horizon.openstack-service-api.neutron',
    'horizon.openstack-service-api.floatingip',
    'horizon.openstack-service-api.security-group',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.settings',
    'port', 'context', 'horizon.framework.esutils.Utils', 'allocateFloatingIPAction',

    function(scope, rootScope, modalInstance,
      usersettingAPI, keystoneAPI, novaAPI, loadbalancerAPI, neutronAPI, floatingipAPI,
      securityGroupAPI, billingAPI, settingsAPI, port, context, utils, allocateFloatingIPAction) {

      var dropdown = {},
          action = {
            submit: function() {
              modalInstance.close(port);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            },
            addSecurityGroup: function(securityGroup) {
              // move sec group from left to right
              scope.canSelectSecurityGroups.remove(securityGroup);
              scope.selectedSecurityGroups.push(securityGroup);
              // clear the old selected items(it's an ugly method, who has a better way?)
              clearAllProps(scope.checkedSelectedSecurityGroups);
              clearAllProps(scope.checkedCanSelectSecurityGroups);
            },
            removeSecurityGroup: function(securityGroup) {
              // move sec group from right to left
              scope.canSelectSecurityGroups.push(securityGroup);
              scope.selectedSecurityGroups.remove(securityGroup);
              // clear the old selected items(it's an ugly method, who has a better way?)
              clearAllProps(scope.checkedSelectedSecurityGroups);
              clearAllProps(scope.checkedCanSelectSecurityGroups);
            },
            addSecurityGroups: function($table) {
              var securityGroups = $table.$scope.selectedData.aData;
              for(var i = 0; i < securityGroups.length; i++) {
              action.addSecurityGroup(securityGroups[i]);
              }
              $table.resetSelected();
            },
            removeSecurityGroups: function($table) {
               var securityGroups = $table.$scope.selectedData.aData;
              for(var i = 0; i < securityGroups.length; i++) {
                action.removeSecurityGroup(securityGroups[i]);
              }
              $table.resetSelected();
            },
            submitSecurityGroups: function() {
              port.selectedSecurityGroups = scope.selectedSecurityGroups;
              modalInstance.close(port);
            },
          };

      scope.openAllocateDialog = function(){
        new allocateFloatingIPAction(scope).open();
        action.cancel();
      };

      if (context.mode === 'create'){
        neutronAPI.getSubnets()
        .success(function(response){
          var subnets = response.items;
          angular.forEach(subnets, function(subnet){
            // HA net has no tenant so filter it
            if(subnet.tenant_id == ""){
              subnets.remove(subnet);
            }
          });
          dropdown.subnets = response.items;
        });

        var PFVFNumConfigured = null;
        var PFVFNumUsed = null;
        // Subnet change
        scope.changeSubnetValue = function () {
          scope.PFVFNumConfigured = null;
          scope.PFVFNumUsed = null;
          novaAPI.getPFVFNumConfigured('physnet2')
            .success(function (res) {
              PFVFNumConfigured = res;
              scope.PFVFNumConfigured = res;
            })
          neutronAPI.getPFVFNumUsed('physnet2')
            .success(function (res) {
              PFVFNumUsed = res;
              scope.PFVFNumUsed = res;
            })
        }

        scope.canCreate = false;
        scope.selectSubnet = false;
        // vNIC change
        scope.changevNICValue = function () {
          if (!PFVFNumConfigured || !PFVFNumUsed) {
            scope.selectSubnet = true;
            port.binding_vnic_type = 'normal';
            return;
          }
          scope.selectSubnet = false;
          scope.canCreate = false;
          if (port.binding_vnic_type == 'direct') {
            if ((PFVFNumUsed.VFNumUsed > PFVFNumConfigured.VFNumConfigured) || (PFVFNumUsed.VFNumUsed == PFVFNumConfigured.VFNumConfigured)) {
              scope.canCreate = true;
            }
          }else if (port.binding_vnic_type == 'direct-physical') {
            if ((PFVFNumUsed.PFNumUsed > PFVFNumConfigured.PFNumConfigured) || (PFVFNumUsed.PFNumUsed == PFVFNumConfigured.PFNumConfigured)) {
              scope.canCreate = true;
            }
          }
        }

        // get security groups for selection
        scope.canSelectSecurityGroups = [];
        securityGroupAPI
        .query()
        .success(function(response) {
          if(response.items){
            angular.forEach(response.items, function(item, index) {
              //item['label'] = gettext('Security Groups') + (++index) + '(' + item['name'] + ')';
              item['label'] = item['name'];
            });
            scope.canSelectSecurityGroups = response.items;
          }
        });

        scope.bandwidthDef = {
          max: 10000,
          min: 1
        };
        port.max_mbps = 1;
      }

      if(context.mode ==='edit'){
        neutronAPI.getSubnets(port.network_id)
        .success(function(response){
          var subnets = response.items;
          angular.forEach(subnets, function(subnet){
            if(subnet.network_router_extenal == true || subnet.network_shared){
              subnets.remove(subnet);
            }
          });
          dropdown.subnets = response.items;
        });

        // get security groups for selection
        securityGroupAPI.query()
        .success(function(response) {
          dropdown.canSelectSecurityGroups = response.items;
        });

        neutronAPI
        .getPort(port.id)
        .success(function(response){
          if(response.max_mbps){
            port.max_mbps = response.max_mbps;
            port.policy_enable = '1';
          }else{
            port.max_mbps = 1;
          }
          angular.extend(port, response);
        });

        port.ip_address = port.fixed_ips[0].ip_address;
        scope.bandwidthDef = {
          max: 10000,
          min: 1
        };
      }

      if (context.mode === 'attach'){
        novaAPI.getServers({status: ["ACTIVE", "PAUSED", "SHUTOFF", "RESIZED"]}).success(function(response) {
          dropdown.instances = response.items;
        })
      }
      if (context.mode === 'detach'){
        novaAPI.getServers({status: ["ACTIVE", "PAUSED", "SHUTOFF", "RESIZED"]}).success(function(response) {
          dropdown.instances = response.items;
        })
      }

      if (context.mode === 'editSecurityGroup'){
        scope.loadingCanSelect = true;
        scope.loadingSelected = false;
        scope.canSelectSecurityGroups = [];
        scope.selectedSecurityGroups = [];
        scope.icanSelectSecurityGroups = [];
        scope.iselectedSecurityGroups = [];
        scope.checkedSelectedSecurityGroups = {};
        scope.checkedCanSelectSecurityGroups = {};

        // remove security groups that the instance exists
        self.filterCanSelectSecurityGroups = function() {
          for(var i = 0; i< scope.selectedSecurityGroups.length; i++) {
            var existId = scope.selectedSecurityGroups[i].id;
            scope.canSelectSecurityGroups.removeId(existId);
          }
        };

        // get security groups in server
          scope.selectedSecurityGroups = port.security_groups_array;

          // get security groups for selection
          securityGroupAPI.query().success(function(response) {
            scope.loadingCanSelect = false;
            scope.canSelectSecurityGroups = response.items;
            dropdown.canSelectSecurityGroups = response.items;
            self.filterCanSelectSecurityGroups();
          });
      }
        scope.dropdown = dropdown;
        scope.context = context;
        scope.port = port;
        scope.action = action;
        scope.binding_vnic_types = [
            'normal',
            'direct',
            'direct-physical',
            'macvtap'
        ];

        if (context.mode === 'create') {
            if (!scope.port.binding_vnic_type) {
                scope.port.binding_vnic_type = scope.binding_vnic_types[0];
            }
        }

        if (context.mode === 'edit') {
            scope.port.binding_vnic_type = port['binding:vnic_type'];
        }
      }])

    .controller('PortDetailCtrl',PortDetailCtrl);
    PortDetailCtrl.$inject = [
      '$scope', '$sce', '$modalInstance','$timeout',
      'detail', 'context', 'ctrl', '$rootScope', 'horizon.openstack-service-api.neutron'];

      function PortDetailCtrl( scope, sce, modalInstance, $timeout, detail, context, ctrl, rootScope, neutronAPI) {
        var w = 888, action = {
          submit: function() {
            modalInstance.close(detail);
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

        vol_id = detail.portData.id;
     　　scope.operationStatus = {
        　　'ACTIVE': gettext('Active'),
        　　'DOWN': gettext('Down'),
        　　'N/A': gettext('N/A')
      　　};
        scope.port = detail.portData;
        neutronAPI
            .getPort(scope.port.id)
            .success(function(response){
              if(response.max_mbps){
                scope.port.max_mbps = response.max_mbps;
                scope.port.policy_enable = '1';
              }
            });

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

        scope.label = context.label;
        scope.title = context.title;
        scope.ctrl = ctrl;
        scope.action = action;
    }

    function clearAllProps(obj) {
      for(var key in obj) {
        delete obj[key];
      }
    };

})();
