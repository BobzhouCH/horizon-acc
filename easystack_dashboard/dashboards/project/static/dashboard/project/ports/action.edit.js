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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit volume modal dialog.
   * On submit, edit volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('editPortAction',
       ['horizon.openstack-service-api.neutron',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(neutronAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Interface'),
      submit: gettext('Save'),
      success: gettext('Interface %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'portFormCtrl',
        windowClass: 'volumesListContent',
        backdrop: backDrop,
        resolve: {
          port: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        }
      };

      // open up the edit form
      self.open = function(port) {
        var clone = angular.copy(port[0]);
        option.resolve.port = function(){ return clone; };
        modal.open(option).result.then(function(newPort){
          self.submit(port[0], newPort);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(newPort) {
        if(!newPort.ip_address){
          newPort.ip_address = undefined;
        }
        var port = {
          name: newPort.name,
          fixed_ips: [{
             subnet_id: newPort.fixed_ips[0].subnet_id,
             ip_address: newPort.ip_address
          }],
          admin_state_up: true,
          'binding:vnic_type': newPort.binding_vnic_type
        };
        if(newPort.security_group){
            port.security_groups = [newPort.security_group];
        }
        if(newPort.qos_policy_id && newPort.policy_enable == 0){
            port.qos_policy_id = null;
        }
        return port;
      };

      self.cleanBindWidthLimit = function(newPort){
        return{
          policy_id: newPort.qos_policy_id,
          max_kbps: (newPort.max_mbps)*1024
        }
      };

      self.QosPolicyAndRuleParams = function(newPort){
        return {
            name: newPort.name,
            max_kbps: (newPort.max_mbps)*1024
        };
      };

      // submit this action to api
      // and update port object on success
      self.submit = function(port, newPort) {
        var cleanedPort = self.clean(newPort);
        neutronAPI.editPort(port.id, cleanedPort)
          .success(function () {
            var cleanedBindWidthLimit = self.cleanBindWidthLimit(newPort);
            if(newPort.policy_enable == 1){
                if(cleanedBindWidthLimit.policy_id){
                    neutronAPI.editBandWidthLimitRules(newPort.bind_width_limit_id, cleanedBindWidthLimit)
                      .success(function(){
                        var message = interpolate(context.success, [port.name]);
                        toastService.add('success', message);
                        self.updatePort(port);
                        scope.$table.resetSelected();
                      })
                }else{
                  var QosPolicyAndRule = self.QosPolicyAndRuleParams(newPort);
                  //create qos policy and rule at the same time
                  neutronAPI.createQosPolicyAndRule(QosPolicyAndRule)
                      .success(function(Policy){
                      neutronAPI.editPort(newPort.id, {qos_policy_id: Policy.id})
                        .success(function (newPort) {
                        newPort.ip_address = newPort.fixed_ips[0].ip_address;
                        var message = interpolate(context.success, [newPort.name]);
                        toastService.add('success', message);
                        self.updatePort(newPort);
                        scope.$table.resetSelected();
                      });
                  })
                }

            }
            if(newPort.policy_enable == 0) {
              var message = interpolate(context.success, [port.name]);
              toastService.add('success', message);
              self.updatePort(port);
              scope.$table.resetSelected();
            }
          });
      };
      self.updatePort = function(port) {
         neutronAPI.getPort(port.id)
           .success(function(response) {
             response.ip_address = response.fixed_ips[0].ip_address;
             angular.extend(port, response);
           });
      };
    }
    return action;
  }]);

})();
