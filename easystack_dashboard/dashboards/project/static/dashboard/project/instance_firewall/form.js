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

  .controller('SecurityFormCtrl', [
    '$scope', '$modalInstance', 'security', 'context',
    function(scope, modalInstance, security, context) {

      var dropdown = {};
      var action = {
        submit: function() { modalInstance.close(security); },
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      if (context.mode === 'create'){

      }

      scope.context = context;
      scope.security = security;
      scope.action = action;

    }])

  .controller('SecurityRuleFormCtrl', ['$scope', '$modalInstance', 'horizon.openstack-service-api.security-group', 'securityRule', 'context',
      function(scope, modalInstance, SecurityGroupAPI, securityRule, context){

	    scope.minToPort = 1;
        scope.$watch('securityRule.from_port', function(current, old) {
          if (current != old)
            scope.minToPort = current + 1;
  	    	scope.outOfPortRangeErrMsg = interpolate(gettext("Destination port must greater than source port, it's range should be in %s~65535."), [current+1]);
        });
        var action = {
          submit: function() { modalInstance.close(securityRule); },
          cancel: function() { modalInstance.dismiss('cancel'); }
        };

        SecurityGroupAPI.query().success(function(response){
            scope.dropdown = response.items;
        });

        //
        scope.GameRules = {
            direction     : true,
            icmp_type     : false,
            icmp_code     : false,
            ip_protocol   : false,
            from_port     : false,
            to_port       : false,
            security_group: false,
            ethertype     : false,
            port_or_range : true,
            port          : true,
            remote        : true,
            cidr          : true,
        };
        scope.SecurityGroupRules = {
            'tcp': {
                'name': 'TCP',
                'ip_protocol': 'tcp',
                'from_port': null,
                'to_port': null,
            },
            'udp': {
                'name': 'UDP',
                'ip_protocol': 'udp',
                'from_port': null,
                'to_port': null,
            },
            'icmp': {
                'name': 'ICMP',
                'ip_protocol': 'icmp',
                'from_port': null,
                'to_port': null,
            },
            'all_tcp': {
                'name': 'All TCP',
                'ip_protocol': 'tcp',
                'from_port': 1,
                'to_port': 65535,
            },
            'all_udp': {
                'name': 'All UDP',
                'ip_protocol': 'udp',
                'from_port': 1,
                'to_port': 65535,
            },
            'all_icmp': {
                'name': 'All ICMP',
                'ip_protocol': 'icmp',
                'from_port': -1,
                'to_port': -1,
            },
            'ssh': {
                'name': 'SSH',
                'ip_protocol': 'tcp',
                'port': 22,
            },
            'smtp': {
                'name': 'SMTP',
                'ip_protocol': 'tcp',
                'port': 25,
            },
            'dns': {
                'name': 'DNS',
                'ip_protocol': 'udp',
                'port': 53,
            },
            'http': {
                'name': 'HTTP',
                'ip_protocol': 'tcp',
                'port': 80,
            },
            'pop3': {
                'name': 'POP3',
                'ip_protocol': 'tcp',
                'port': 110,
            },
            'imap': {
                'name': 'IMAP',
                'ip_protocol': 'tcp',
                'port': 143,
            },
            'ldap': {
                'name': 'LDAP',
                'ip_protocol': 'tcp',
                'port': 389,
            },
            'https': {
                'name': 'HTTPS',
                'ip_protocol': 'tcp',
                'port': 443,
            },
            'smtps': {
                'name': 'SMTPS',
                'ip_protocol': 'tcp',
                'port': 465,
            },
            'imaps': {
                'name': 'IMAPS',
                'ip_protocol': 'tcp',
                'port': 993,
            },
            'pop3s': {
                'name': 'POP3S',
                'ip_protocol': 'tcp',
                'port': 995,
            },
            'ms_sql': {
                'name': 'MS SQL',
                'ip_protocol': 'tcp',
                'port': 1433,
            },
            'mysql': {
                'name': 'MYSQL',
                'ip_protocol': 'tcp',
                'port': 3306,
            },
            'rdp': {
                'name': 'RDP',
                'ip_protocol': 'tcp',
                'port': 3389,
            },
        };
        scope.portOrRangeSwitch = function(str){
            if(!str)return;
            switch(str){
                case 'port': 
                    scope.GameRules.port      = true;
                    scope.GameRules.from_port = false;
                    scope.GameRules.to_port   = false;
                    break;
                case 'range': 
                    scope.GameRules.port      = false;
                    scope.GameRules.from_port = true;
                    scope.GameRules.to_port   = true;
                    break;
            }
        };
        scope.remoteSwitch = function(str){
            if(!str)return;
            switch(str){
                case 'cidr': 
                    scope.GameRules.cidr           = true;
                    scope.GameRules.security_group = false;
                    break;
                case 'sg': 
                    scope.GameRules.cidr           = false;
                    scope.GameRules.security_group = true;
                    securityRule.ethertype         = "IPv4";
                    securityRule.cidr = "";
                    break;
            }
        };

        scope.context = context;
        scope.securityRule = securityRule;
        scope.action = action;
  }])
  ;
})();