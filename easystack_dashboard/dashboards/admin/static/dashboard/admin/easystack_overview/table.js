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

  angular.module('hz.dashboard.admin.overviews')

  /**
   * @ngdoc adminOverviewsCtrl
   * @ngController
   *
   * @description
   * Controller for the admin overviews table.
   * Serve as the focal point for table actions.
   */
  .controller('adminOverviewsCtrl', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.usersettings',
    'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.keystone',
    function(
      scope, rootScope, PolicyService, UserSettingsAPI, toastService, keystoneAPI) {
        var self = this;
        scope.users = [];
        scope.projects = [];
    scope.context = {
      header: {
        name: gettext('Project Name'),
        domain: gettext('Domain'),
        ram_hours: gettext('RAM Hours'),
        vcpu_hours: gettext('VCPU Hours'),
        volume_hours: gettext('Volume Hours')
      },
      action: {
          create: gettext('Create'),
          edit: gettext('Edit'),
          deleted: gettext('Delete')
      },
      error: {
        api: gettext('Unable to retrieve overviewss'),
        priviledge: gettext('Insufficient privilege level to view overview information.')
      },
      leftPanel: {
        head: gettext('Physical Resource Usage'),
        cpu: gettext('CPU'),
        memory: gettext('Memory'),
        disk: gettext('Disk')
      },
      rightPanel: {
        head: gettext('Virtual Resource Usage'),
        instance: gettext('Instance'),
        cpu: gettext('Virtual Cores'),
        ram: gettext('Virtual RAM'),
      },
      instances: pgettext('InstancesList','Instances')
    };

    scope.instanceStatus = {
      'active': gettext("Active"),
      'stopped': gettext("Stop"),
      'terminated': gettext('Terminated')
    };

    this.reset = function(){
        scope.NovaUsage = [];
        scope.iNovaUsage = [];
        scope.checked = {};
        scope.selected = {};
      };
    scope.NovaUsageState= false;

    function doLogout() {
      toastService.add('info', scope.context.error.priviledge);
      window.location.replace((window.WEBROOT || '') + 'auth/logout');
    }

    // on load, if user has permission
    // fetch table data and populate it
    this.init = function(){
        self.reset();
         PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
        .success(function(response) {
          if (response.allowed){
            UserSettingsAPI.getAdminNovaUsage().success(function(response) {
              for (var i = 0; i < response.items.length; i++) {
                for(var j = 0; j < response.items[i].server_usages.length; j++){
                    response.items[i].server_usages[j].started_at = response.items[i].server_usages[j].started_at.replace(/T/g, ' ');
                    response.items[i].server_usages[j].started_at = response.items[i].server_usages[j].started_at.replace(/Z/g, '');
                    response.items[i].server_usages[j].started_at = rootScope.rootblock.utc_to_local(response.items[i].server_usages[j].started_at);
                }
              };
              scope.NovaUsage = response.items;
              scope.NovaUsageState= true;
            }).error(function() {
              doLogout();
            });
            UserSettingsAPI.getAdminHardwareUsage().success(function(response) {
              scope.HardwareUsage = response.items;
            }).error(function() {
              doLogout();
            });
            UserSettingsAPI.getAdminVirtualUsage().success(function(response) {
              scope.VirtualUsage = response.tenant_limits;
            }).error(function() {
              doLogout();
            });
          }
          else {
            doLogout();
          }
        });

         keystoneAPI.getCloudAdmin().success(function (cloudAdmin) {
             if (cloudAdmin) {
                 keystoneAPI.getDomains().success(function (response) {
                     var domains = response.items;
                     for (var i = 0; i < domains.length; i++) {
                         if (response.items[i].name != 'heat_domain') {
                             var paras = { domain_id: domains[i].id };
                             self.getDomainUsers(paras);
                         }
                     }
                 });
             } else {
                 keystoneAPI.getUsers().success(function (response) {
                     scope.users = response.items;
                 });
             }
         });

         PolicyService.check({ rules: [['identity', 'identity:list_projects']] })
           .success(function (response) {
               scope.isAdmin = response.allowed;
               keystoneAPI.getProjectAdmin()
                 .success(function (isProjectAdmin) {
                     scope.isProjectAdmin = isProjectAdmin;
                     keystoneAPI.getDomainAdmin()
                       .success(function (isDomainAdmin) {
                           scope.isDomainAdmin = isDomainAdmin;
                           if (isProjectAdmin || isDomainAdmin) {
                               self.listProjects(isDomainAdmin);
                           }
                           //else {
                           //    window.location.replace((window.WEBROOT || '') + 'auth/logout');
                           //}
                       });
                 });
           });
    };

    this.getDomainUsers = function (paras) {
        keystoneAPI.getUsers(paras).success(function (response) {
            scope.users.extend(response.items);
        });
    };

    this.listProjects = function (admin) {
        keystoneAPI.getCurrentUserSession().success(
            function(response) {
                scope.currentUser = response;
                var user_id = admin ? null : scope.currentUser.id;
                keystoneAPI.getProjects({ admin: admin, user: user_id })
                  .success(function (response) {
                      for (var i = 0; i < response.items.length; i++) {
                          if (response.items[i].domain_name != 'heat_domain') {
                              scope.projects.push(response.items[i]);
                          }
                      }
                  });
        })
    };

    this.init();

    scope.filterFacets = [{
      label: gettext('Domain'),
      name: 'domain',
      singleton: true
    }, {
      label: gettext('Project Name'),
      name: 'tenant_name',
      singleton: true
    }, {
      label: gettext('VCPU Hours'),
      name: 'total_vcpus_usage',
      singleton: true
    }, {
      label: gettext('RAM Hours'),
      name: 'total_memory_mb_usage',
      singleton: true
    }, {
      label: gettext('Volume Hours'),
      name: 'total_local_gb_usage',
      singleton: true
    }];

  }])

  // progress bar
  .directive('getBar', [function(){
    return {
        restrict: 'AE',
        scope: {
          data: '@dataval',
          percentage: '@'
        },
        template: '<div class="used-box js-used-box"><div class="used-box-bar js-bar"></div></div>',
        link: link
    };

    function link(scope, element, attrs){

      var configMap = {},
          setConfigMap,
          getElementWidth,
          appendBefore,
          setUsedData,
          addAttr,
          init;

      setConfigMap = function(){
        configMap.elementWidth  = element.innerWidth();
        configMap.oUsedBox      = element.find('.js-used-box');
        configMap.oBar          = element.find('.js-bar');
        configMap.oDiv          = element.find('.insert-style');
      };

      // Seting insert style
      function setBeforeContent(){
        configMap.beforeContent = '<style>.used-box-bar:before{ width:'+ configMap.elementWidth +'px; }</style>';
      };

      // Insert the div store css
      element.append('<div class="insert-style none">');

      // Get parent element width
      getElementWidth = function(){
        configMap.oDiv.html('');
        configMap.elementWidth = element.width();
      };

      // Add CSS content to new element
      appendBefore =function(){
        setBeforeContent();
        configMap.oDiv.html(configMap.beforeContent);
      };

      // Add attribute
      addAttr = function(){
        element.attr('data-text',scope.data);
        configMap.oUsedBox.attr('data-text',scope.data);
        configMap.oBar.attr('data-text',scope.data);
        if (parseFloat(scope.percentage) > 100) {
          scope.percentage = 100;
        }
        configMap.oBar.css('width',scope.percentage + '%');
      };

      // Add used data to attribute
      setUsedData = function(){
        scope.$watch('data',function(n,o){
          if(n !== o){
            addAttr();
          }
        });
      };

      // Initialize method
      init = function(){
        setConfigMap();
        appendBefore();
        setUsedData();
      };

      init();

      $(window).resize(function(){
        getElementWidth();
        appendBefore();
      });
    }
  }]);

})();
