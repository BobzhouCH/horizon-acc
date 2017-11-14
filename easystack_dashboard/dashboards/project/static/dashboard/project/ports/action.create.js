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

  angular.module('hz.dashboard.project.ports')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create ports modal dialog.
   * On submit, create a new port and display a success message.
   * On cancel, do nothing.
   */
  .factory('createPortAction',
      ['horizon.openstack-service-api.neutron',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       '$modal',
       '$rootScope',
       '$q',
       'backDrop',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.settings',
  function(neutronAPI, usersettingAPI, keystoneAPI, modal, rootScope, $q, backDrop, toastService, settingsService) {

    var context = {
      mode: 'create',
      title: gettext('Create Interfaces'),
      submit: gettext('Create'),
      success: gettext('Interfaces %s was successfully created.'),
      localLang : {
          selectAll: gettext('Select All'),
          selectNone: gettext('Select None'),
          search: gettext('Type here to search...'),
          nothingSelected: gettext("Select Security Groups")
      }
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'portFormCtrl',
        backdrop: backDrop,
        windowClass: 'volumesListContent',
        resolve: {
          port: function(){ return {}; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

     // Default QOS_RULE = False
      self.open = function(){
       settingsService.getSetting('FLOATING_IP_QOS_RULES_ENABLED',true)
         .then(function(rule) {
           if(rule){
             settingsService.getSetting('FLOATING_IP_QOS_RULES',true)
               .then(function(lenovoQoS) {
                 option.resolve.qosRules = function(){ return lenovoQoS };
                 modal.open(option).result.then(self.submit);
               });
           }
           else{
             option.resolve.qosRules = function(){ return false };
             modal.open(option).result.then(self.submit);
           }
         });
      };
      var PortFormat = function(newPort){
        if(!newPort.ip_address){
          newPort.ip_address = undefined;
        }
       var port = {
         name: newPort.name,
         fixed_ips: [{
           subnet_id: newPort.subnet_id,
           ip_address: newPort.ip_address
         }],
         security_groups: [],
         admin_state_up: true,
         'binding:vnic_type': newPort.binding_vnic_type
       };
       if(newPort.selectedSecurityGroups.length > 0){
          angular.forEach(newPort.selectedSecurityGroups, function(selectedSecurityGroup){
            port.security_groups.push(selectedSecurityGroup.id);
          });
       }
       return port;
      };

      var QosPolicyAndRuleParams = function(newPort){
        return {
            name: newPort.name,
            max_kbps: (newPort.max_mbps)*1024
        };
      };

      var BandLimitRuleParams = function(newQosPolicy_id, newRule){
        return {
          policy_id: newQosPolicy_id,
          max_kbps: (newRule.max_mbps)*1024,
          max_burst_kbps: (newRule.max_mbps)*1024
        };
      };

      self.submit = function(newPort) {
        neutronAPI.getSubnet(newPort.subnet_id).success(function(response){
          var portCleaned = PortFormat(newPort);
          portCleaned.network_id = response.network_id;
          neutronAPI.createPort(portCleaned)
            .success(function(response) {
              if(newPort.policy_enable == 1){
                  var QosPolicyAndRule = QosPolicyAndRuleParams(newPort);
                  neutronAPI.createQosPolicyAndRule(QosPolicyAndRule)
                      .success(function(Policy){
                      neutronAPI.editPort(response.id, {qos_policy_id: Policy.id})
                        .success(function (newPort) {
                        newPort.ip_address = newPort.fixed_ips[0].ip_address;
                        scope.ports.push(newPort);
                        var message = interpolate(context.success, [newPort.name]);
                        toastService.add('success', message);
                        scope.$table.resetSelected();
                      });
                  });
              }

              if(newPort.policy_enable == 0) {
                  response.ip_address = response.fixed_ips[0].ip_address;
                  scope.ports.push(response);
                  var message = interpolate(context.success, [response.name]);
                  toastService.add('success', message);
                  scope.$table.resetSelected();
              }

            });
        });
      };
    }
    return action;
  }]);

})();
