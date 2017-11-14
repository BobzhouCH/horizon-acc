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

  angular.module('hz.dashboard.identity.domains')

  /**
   * @ngdoc formInvCodeController
   * @ng-controller
   *
   */
  .controller('domainformCtrl', [
    '$scope', '$timeout', '$modalInstance', 'domain','horizon.openstack-service-api.keystone', 'context', '_scope',
    function(scope, timeout, modalInstance, domain, keystoneAPI, context, parentScope) {
      var self = this;

      var action = {
        submit: function() {
          modalInstance.close(scope.domain);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        submitUsers: function(selectedRoles) {
          var domain = scope.action.updateCurrentUsers(selectedRoles);
          modalInstance.close(domain);
        },
      };

      keystoneAPI.getLDAP().success(function(data){
        scope.ldap_enable = data["enable"];
      });

      scope.domain = domain;
      scope.context = context;
      scope.action = action;

      if (context.mode === 'editUsers') {
        self.userManager = new context.UserManager(scope);
      }

      var timer;
      scope.checkName = function() {
        scope.forbid_name = false;
        scope.hasName = false;
        timeout.cancel( timer );

        timer = timeout(function() {
          var name = scope.domain.name;
          if(name){
            if(name == 'Default') {
              scope.forbid_name = true;
              return;
            }
            parentScope.domains.some(function(item) {
              if(item.name == name) {
                scope.hasName = true;
                return;
              }
            });
          }
        }, 500);
      };
    }
  ])
  .controller('domainQuotaFormCtrl',[ '$scope', '$modalInstance', 'horizon.openstack-service-api.keystone', 'horizon.openstack-service-api.usersettings','domain', 'context', 'horizon.openstack-service-api.settings', '_scope', '$timeout',
  function(scope, modalInstance, keystoneAPI, usersettingsAPI, domain, context, settingsService, parentScope, timeout) {
    self = this;

    var nova_quota_name = ['ram', 'key_pairs', 'cores', 'instances',];
    var cinder_quota_name = ['volume_snapshots', 'volumes', 'volume_gigabytes', 'backups', 'backup_gigabytes'];
    var neutron_quota_name = ['network', 'security_group', 'floatingip', 'subnet', 'router', 'loadbalancer', 'listener','healthmonitor', 'pool', 'port'];
    var manila_quota_name = ['shares', 'share_gigabytes', 'share_snapshots', 'share_networks',];

    var dropdown = {};
    var action = {
      submit: function() { modalInstance.close(scope.domainQuota); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };



    this.initDomainQuota = function(domain_quota_items) {
      var novaquota = {};
      var cinderquota = {};
      var neutronquota = {};
      var manilaquota = {};
      var domain_quota_map = {};

      for(var i=0; i<domain_quota_items.length; i++){
        var name = domain_quota_items[i]['name'];
        var domain_quota = domain_quota_items[i]['usage']['quota'];
        var domain_quota_used = domain_quota_items[i]['usage']['used'];
        var proj_quota_has_unlimit = domain_quota_items[i]['has_unlimit'];

        var item = {
          name : name,
          value : domain_quota,
          init : domain_quota,
          min : domain_quota_used,
          max : proj_quota_has_unlimit ? -1 : null,
          used : domain_quota_used,
          checked: domain_quota == -1 ? true : false,
          unlimit: proj_quota_has_unlimit
        };

        if ($.inArray(name, nova_quota_name) != '-1') {
          novaquota[name] = item;
        } else if ($.inArray(name, cinder_quota_name) != '-1') {
          cinderquota[name] = item;
        } else if ($.inArray(name, neutron_quota_name) != '-1') {
          neutronquota[name] = item;
        } else if ($.inArray(name, manila_quota_name) != '-1') {
          manilaquota[name] = item;
        }
      }

      return {
       novaquota : novaquota,
       cinderquota : cinderquota,
       neutronquota : neutronquota,
       manilaquota : manilaquota
      }

    }

    this.getDomainQuota = function() {
        usersettingsAPI.getDomainQuota(domain.id, {check_tenant_unlimit: true}).success(
          function(response) {
            var domain_quota_items = response.items;
            scope.domainQuota = self.initDomainQuota(domain_quota_items);
            scope.isQuotaLoading = false;
          });
    }

    function init() {
        scope.context = context;
        scope.domain = domain;
        scope.action = action;
        scope.isQuotaLoading = true;
        self.getDomainQuota();
    }

    init();

    }
  ]);
})();