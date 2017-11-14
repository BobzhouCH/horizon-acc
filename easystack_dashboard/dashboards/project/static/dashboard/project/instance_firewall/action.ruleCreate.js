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

  angular.module('hz.dashboard.project.instance_firewall')

  .factory('SecurityRuleCreateAction',
      ['horizon.openstack-service-api.security-group',
       '$modal',
       'backDrop',
       'horizon.framework.widgets.toast.service',
  function(securityAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Adding Rule'),
      submit:  gettext('Add Rule'),
      success: gettext('Rule was successfully created.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'rule_form',
        controller: 'SecurityRuleFormCtrl',
        backdrop: backDrop,
        windowClass: 'SecurityRuleContent',
        resolve: {
          securityRule: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(obj){
        modal.open(option).result.then(function(rule){
          self.submit(rule, obj);
        });
      };

      self.submit = function(newRule, obj) {
        newRule.id          = obj.dataInstanceId;
        newRule.ip_protocol = newRule.rule_menu;
        if(!newRule.direction){
            newRule.direction = "ingress";
        }
        if(!newRule.ethertype){
            newRule.ethertype = "IPv4";
        }
        if(newRule.port){
            newRule.from_port = newRule.port;
            newRule.to_port = newRule.port;
        }
        if(!newRule.to_port){
            newRule.to_port = newRule.from_port;
        }
        if(!newRule.from_port){
            newRule.from_port = null;
        }
        if(!newRule.to_port){
            newRule.to_port = null;
        }
        if(!newRule.cidr){
            newRule.cidr = null;
        }
        if(!newRule.security_group){
            newRule.security_group = null;
        }
        securityAPI.createSecurityGroupRule(newRule).success(function(response){
            var message = interpolate(context.success);
            toastService.add('success', message);
            var oRemote = response.ip_range.cidr ? gettext('CIDR') + ': ' + response.ip_range.cidr : gettext('Security Groups') + ': ' + response.group.name;

            function portRangeConvertToString(min, max) {
                var oPortString;
                if (min == null || max == null) {
                    oPortString = gettext('Any');
                }
                else if (min == max) {
                    oPortString = min;
                }
                else {
                    oPortString = min + ' - ' + max;
                }
                return oPortString;
            }

            var oEleRule = '<tr>' +
                '<td eagle-eye="data_col">'+gettext(response.direction)+'</td>' +
                '<td eagle-eye="data_col">'+response.ethertype+'</td>' +
                '<td eagle-eye="data_col">'+response.ip_protocol+'</td>' +
                '<td eagle-eye="data_col">'+portRangeConvertToString(response.from_port, response.to_port)+ '</td>' +
                '<td eagle-eye="data_col">'+oRemote+'</td>' +
                '<td eagle-eye="data_col" class="delect-icon-bt"><i class="js-delect-iconbt delect-iconbt" data-delectId="'+response.id+'"></i></td>' +
             '</tr>';
            $('.js-detail-box').eq(obj.dataIndex).find('tbody').prepend(oEleRule);
        });
      };
    }

    return action;
  }]);

})();