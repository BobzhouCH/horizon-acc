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

  angular.module('hz.dashboard.admin.flavors')

  /**
   * @ngdoc flavorFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit flavor form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('flavorFormCtrl', [
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
    'flavor', 'context', 'horizon.framework.esutils.Utils', 'allocateFloatingIPAction',
    '_scope', '$timeout',

    function(scope, rootScope, modalInstance,
      usersettingAPI, keystoneAPI, novaAPI, loadbalancerAPI, neutronAPI, floatingipAPI,
      securityGroupAPI, billingAPI, settingsAPI, flavor, context, utils, allocateFloatingIPAction,
      parentScope, timeout) {

      var dropdown = {},
          action = {
            submit: function() {
              flavor.selectedProjects = scope.selectedProjects;
              modalInstance.close(flavor);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            },
            addProject: function(project) {
              // move project from left to right
              scope.canSelectProjects.remove(project);
              scope.selectedProjects.push(project);
              // clear the old selected items(it's an ugly method, who has a better way?)
              clearAllProps(scope.checkedSelectedProjects);
              clearAllProps(scope.checkedCanSelectProjects);
            },
            removeProject: function(project) {
              // move sec group from right to left
              scope.canSelectProjects.push(project);
              scope.selectedProjects.remove(project);
              // clear the old selected items(it's an ugly method, who has a better way?)
              clearAllProps(scope.checkedSelectedProjects);
              clearAllProps(scope.checkedCanSelectProjects);
            },
            addProjects: function($table) {
              var projects = $table.$scope.selectedData.aData;
              for(var i = 0; i < projects.length; i++) {
                action.addProject(projects[i]);
              }
              $table.resetSelected();
            },
            removeProjects: function($table) {
              var projects = $table.$scope.selectedData.aData;
              for(var i = 0; i < projects.length; i++) {
                action.removeProject(projects[i]);
              }
              $table.resetSelected();
            },
          };

      if (context.mode === 'create' || context.mode === 'edit'){
        scope.loadingCanSelect = true;
        scope.loadingSelected = false;
        scope.canSelectProjects = [];
        scope.selectedProjects = [];
        scope.icanSelectProjects = [];
        scope.iselectedProjects = [];
        scope.checkedSelectedProjects = {};
        scope.checkedCanSelectProjects = {};

        // remove projects that the flavor exists
        self.filterCanSelectProjects = function() {
          for(var i = 0; i< scope.selectedProjects.length; i++) {
            var existId = scope.selectedProjects[i].id;
            scope.canSelectProjects.removeId(existId);
          }
        };

        // get projects in flaovr
        if(flavor.flavor_access){
          scope.selectedProjects = flavor.flavor_access;
        }

        // get projects for selection
        keystoneAPI.getProjects().success(function(response) {
          scope.loadingCanSelect = false;
          scope.canSelectProjects = response.items;
          self.filterCanSelectProjects();
        });

      }

      scope.dropdown = dropdown;
      scope.context = context;
      scope.flavor = flavor;
      scope.action = action;
      scope.valid_worth = true;
      scope.valid_FeeHour = true;
      scope.valid_FeeMonth = true;
      scope.valid_FeeYear = true;
      scope.valid_flavor_id = true;
      scope.valid_ram = true;

      scope.canEdit = true;
      if (flavor != null && flavor != {} && flavor.id != "") {
          novaAPI.getServers({ all_tenants: 'True' })
          .success(function (response) {
              angular.forEach(response.items, function (instance) {
                if (instance.flavor.id == flavor.id) {
                    scope.canEdit = false;
                }
              });
          });
      }


      if (rootScope.rootblock.billing_enable) {
        scope.showBilling = true;
        settingsAPI.getSetting('PREBILLING',false).then(
          function success(data){
            scope.preBilling = data;
        });
      }

      var timer;

      scope.checkName = function() {
        timeout.cancel( timer );
        timer = timeout(function() {
          if(scope.flavor.name ){
            for (var item in parentScope.flavors) {
              if(parentScope.flavors[item].name.toLocaleLowerCase() == scope.flavor.name.toLocaleLowerCase() && parentScope.flavors[item].id != scope.flavor.id) {
                scope.hasName = true;
                return;
              } else {
                scope.hasName = false;
              }
            }
          }
        }, 500);
      };

      scope.checkId = function() {
        timeout.cancel( timer );
        timer = timeout(function() {
          if(scope.flavor.id ){
            var reg = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[0-9]+$', "gi");
            if(scope.flavor.id_auto !== 'auto' && reg.test(scope.flavor.id)) {
              scope.valid_flavor_id = true;
            }
            else {
              scope.valid_flavor_id = false;
            }
            for (var item in parentScope.flavors) {
              if(parentScope.flavors[item].id == scope.flavor.id ) {
                scope.hasId = true;
                return;
              } else {
                scope.hasId = false;
              }
            }
          }
        }, 500);
      };

      scope.checkFeeHour = function() {
        timeout.cancel( timer );
        timer = timeout(function() {
          var reg = new RegExp('^(0|[1-9][0-9]*)(\.[0-9]{0,2})?$', "gi");
          if(reg.test(scope.flavor.fee_hour)) {
            scope.valid_FeeHour = true;
          }
          else {
            scope.valid_FeeHour = false;
          }
        }, 500);
      };

      scope.checkFeeMonth = function() {
        timeout.cancel( timer );
        timer = timeout(function() {
          var reg = new RegExp('^(0|[1-9][0-9]*)(\.[0-9]{0,2})?$', "gi");
          if(reg.test(scope.flavor.fee_month)){
            scope.valid_FeeMonth = true;
              }
          else {
            scope.valid_FeeMonth = false;
          }
        }, 500);
      };

      scope.checkFeeYear = function() {
        timeout.cancel( timer );
        timer = timeout(function() {
          var reg = new RegExp('^(0|[1-9][0-9]*)(\.[0-9]{0,2})?$', "gi");
          if(reg.test(scope.flavor.fee_year)){
            scope.valid_FeeYear = true;
          }
          else {
            scope.valid_FeeYear = false;
          }
        }, 500);
      };

      scope.checkRAM = function () {
          if (scope.flavor.ram % 2 == 0){
              scope.valid_ram = true;
          }else{
              scope.valid_ram = false;
          }
      };

    }]);

    function clearAllProps(obj) {
      for(var key in obj) {
        delete obj[key];
      }
    };

    // function check(num){
    //     if(num != 1){
    //         while(num != 1){
    //             if(num%2 == 0){
    //                 num = num / 2;
    //             }else{
    //                 return false;
    //             }
    //         }
    //         return true;
    //     }else{
    //         return false;
    //     }
    // }

})();
