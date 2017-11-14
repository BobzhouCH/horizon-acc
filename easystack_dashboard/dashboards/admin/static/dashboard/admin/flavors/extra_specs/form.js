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

/**
 ** Author : liufeng24@lenovo.com
 ** Module : extra_specs
 ** Data   : 2016-12-26
 **/

(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngdoc listenerFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit volume form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('extraFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'extra', 'context', 'flavor', 'value1', 'novaAPI', 'horizon.framework.esutils.Utils',
    function(scope, rootScope, modalInstance,
      extra, context, flavor, value1, novaAPI, utils) {

      var dropdown = {},
          action = {
            submit: function() {
              modalInstance.close(extra);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };

      dropdown.key_type = [
        {key: gettext('Custom Extra Spec'),   value: 'CustomExtraSpec'},
        {key: gettext('CPU Policy'),   value: 'hw:cpu_policy'},
        {key: gettext('CPU Threads Policy'),  value: 'hw:cpu_thread_policy'},
        {key: gettext('Number of vNUMA Nodes'),  value: 'hw:numa_nodes'},
        {key: gettext('NUMA Node Pinning'), value:'hw:numa_node'},
        {key: gettext('Huge Pages'),  value: 'hw:mem_page_size'},
        {key: gettext('PCI NUMA Affinity'), value:'hw:pci_numa_affinity'},
        {key: gettext('PCI Alias Device'), value: 'pci_passthrough:alias'}
      ];

      dropdown.cpu_policy = [
        {key: 'Dedicated',   value: 'dedicated'},
        {key: 'Shared',  value: 'shared'}
      ];

      dropdown.cpu_thread_policy = [
        {key: gettext('Prefer'),   value: 'prefer'},
        {key: gettext('Isolate'),   value: 'isolate'},
        {key: gettext('Require'),  value: 'require'}
      ];

      dropdown.mem_page_size = [
        {key: gettext('Small (4k)'),   value: 'small'},
        {key: gettext('Large (2M)'),  value: 'large'},
        {key: gettext('Any'),  value: 'any'}
      ];

       dropdown.pci_numa_affinity  = [
       {key: gettext('Strict'), value: 'strict'},
       {key: gettext('Prefer'), value: 'prefer'}
       ];

/*
      // example for taogq
      if (context.mode === 'edit'){
        floatingipAPI.getFreeTenantFloatingIP().success(function(response){
          dropdown.floatingips = response.items;
        });
      }

*/
        scope.dropdown = dropdown;
        scope.extra = extra;
        scope.context = context;
        scope.action = action;

        if(value1){
            scope.extra.value1 = value1;
        }else {
            delete scope.extra.value1;
        }

        // begin by lihuimi: According to the Number of the vNUMA Nodes value to display the value of the NUMA Node Pinning
        scope.extra.key1 = 0;
        // scope.$watch('extra.value1', function (newValue, oldValue) {
        //     if(newValue != oldValue){
        //         if(!scope.extra.value1 || scope.extra.value1==='1'){
        //             scope.extra.key1 = 0;
        //         }else{
        //             delete scope.extra.key1;
        //         }
        //     }
        // })

        scope.updateInputValue = function () {
            delete scope.extra.key;
            delete scope.extra.value;
            if(!scope.extra.value1 || scope.extra.value1==='1' || scope.extra.value1==='0'){
                scope.extra.key1 = 0;
            }else{
                delete scope.extra.key1;
            }
        }
        // end by lihuimi
      }])

  // begin by lihuimi: Custom validation format The rules for NUMA Node Pinning
  .directive('validateValue', function () {
      return {
          restrict: 'A',
          require: 'ngModel',
          link: function (scope, elm, attrs, ctrl) {
              scope.$watch(attrs.ngModel, function (n) {

                  if(!n){
                    return;
                  }
                  var oldValue = attrs.validateValue;
                  if(oldValue !== n){
                      var reg = /^[0-9]+$/;
                      if(n.length){
                          n = parseInt(n);
                          var val = parseInt(scope.extra.value1);
                          if(reg.test(n) && (n<val)){
                              ctrl.$setValidity('validateValue', true);
                              return n;
                          }else {
                              ctrl.$setValidity('validateValue', false);
                              return undefined;
                          }
                      }
                  }
              })
          }
      }
  })
  // end by lihuimi

})();
