/**
 * Copyright 2015 EasyStack Inc.
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

  angular.module('hz.dashboard.identity.projects')

  /**
   * @ngdoc formCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit project form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('projectformCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.keystone', 'horizon.openstack-service-api.usersettings',
    'project', 'context', 'horizon.openstack-service-api.settings', '_scope', '$timeout',
  function(scope, modalInstance, keystoneAPI, usersettingsAPI, project, context,
   settingsService, parentScope, timeout) {
    self = this;

    self.showDomainInfo = false;
    self.error = {
      domain: gettext('Unable to retrieve domain name.'),
      quota: gettext('Unable to retrieve Quota Information.')
    };

    var dropdown = {};
    var action = {
      submit: function() { modalInstance.close(project); },
      cancel: function() { modalInstance.dismiss('cancel'); },
      submitUsers: function(selectedRoles) {
        var project = scope.action.updateCurrentUsers(selectedRoles);
        modalInstance.close(project);
      },
    };

    scope.isCurrentProject = context.mode === 'edit' &&
            project.id === parentScope.currentUser.project_id ?
            true : false;

    scope.dropdown = dropdown;
    scope.context = context;
    scope.project = project;
    scope.action = action;

    // auto assign new projects to _member_ role
    if (context.mode === 'edit'){
      settingsService.getSetting('OPENSTACK_API_VERSIONS.identity', 2).then(
        function(response) {
          self.showDomainInfo = response >= 3 ? true : false;
          if (self.showDomainInfo) {
            keystoneAPI.getDomain(project.domain_id).then(
                function(response) {
                    scope.domainName = response.data.name;
                },
               function() {
                    horizon.alert('info', self.error.domain);
               });
          }
        }
      );
    }
    else if (context.mode === 'editmember'){
      keystoneAPI.getRoles().success(function(response) {
        dropdown.roles = response.items;
      });
      keystoneAPI.getUsers().success(function(response) {
        dropdown.users = response.items;
      });
    }
    else if (context.mode === 'editUsers') {
      self.userManager = new context.UserManager(scope);
    }

    var timer,oldName = angular.copy(scope.project.name);
    scope.checkName = function() {
      scope.forbid_name = false;
      scope.hasName = false;
      timeout.cancel( timer );

      timer = timeout(function() {
        var name = scope.project.name;
        if(name){
          name = name.toLocaleLowerCase();
          if(name == 'default' || name =='admin') {
            scope.forbid_name = true;
            return;
          }
          parentScope.iprojects.some(function(item) {
            if(item.name.toLocaleLowerCase() == name && oldName != name) {
              scope.hasName = true;
              return true;
            }
          });
        }
      }, 500);

    };
  }])

  .controller('projectCreateFormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.keystone', 'project', 'context',
     'horizon.openstack-service-api.settings', '_scope', '$timeout','$q','projectQuotaService',
  function(scope, modalInstance, keystoneAPI, project, context,
   settingsService, parentScope, timeout, $q, projectQuotaService) {
    self = this;
    scope.project = project;
    self.showDomainInfo = false;
    self.error = {
      domain: gettext('Unable to retrieve domain name.'),
      quota: gettext('Unable to retrieve Quota Information.')
    };
    var action = {
      submit: function() {
                var formData = {project : scope.project,
                                projectQuota : scope.projectQuota,
                                domain_quota_enabled : scope.domain_quota_enabled
                };
                modalInstance.close(formData);
               },
      cancel: function() { modalInstance.dismiss('cancel'); },
    };

    scope.showDomainSelect = function() {
      if (self.showDomainInfo){
        return parentScope.currentUser.is_superuser &&
          parentScope.currentUser.user_domain_id == self.defaultDomain;
      }
      return false;
    };

    var timer,oldName = angular.copy(scope.project.name);
    scope.checkName = function() {
      scope.forbid_name = false;
      scope.hasName = false;
      timeout.cancel( timer );

      timer = timeout(function() {
        var name = scope.project.name;
        if(name){
          name = name.toLocaleLowerCase();
          if(name == 'default' || name =='admin') {
            scope.forbid_name = true;
            return;
          }
          parentScope.iprojects.some(function(item) {
            if(item.name.toLocaleLowerCase() == name && oldName != name) {
              scope.hasName = true;
              return true;
            }
          });
        }
      }, 500);
    };

    this.initProjectQuotaInfo = function(){
      settingsService.getSetting('DOMAIN_QUOTA_ENABLED', false)
        .then(function(enabled){//enable
            if(enabled) {
               scope.domain_quota_enabled = true;
                if(scope.showDomainSelect()) {
                    scope.$watch('project.domain', function(newValue, oldValue){
                        if (newValue != oldValue) {
                            scope.isQuotaLoading = true;
                            self.getProjectQuota(scope, project);
                        }
                    });
                } else {
                    scope.project.domain = parentScope.currentUser.user_domain_id;
                    self.getProjectQuota(scope, project);
                }
            } else {
                scope.domain_quota_enabled = false;
            }
        });
    };

    this.getDomains = function (){
      settingsService.getSetting('OPENSTACK_API_VERSIONS.identity', 2).then(
        function(response) {
          self.showDomainInfo = response >= 3 ? true : false;
          if (self.showDomainInfo) {
            settingsService.getSetting('OPENSTACK_KEYSTONE_DEFAULT_DOMAIN', 2).then(
              function(response) {
                self.defaultDomain = response;
                if (parentScope.currentUser.user_domain_id == self.defaultDomain &&
                    parentScope.currentUser.is_superuser){
                  keystoneAPI.getDomains().success(function(response) {
                    var allowDomain = [];
                    for(var i=0;i<response.items.length;i++){
                      if(response.items[i].name != 'heat_domain'){
                        allowDomain.push(response.items[i]);
                      }
                    }
                    scope.domains = allowDomain;
                  });
                }
                self.initProjectQuotaInfo();
              }
            );
          } else {
            scope.project.domain = parentScope.currentUser.user_domain_id;
            self.initProjectQuotaInfo();
          }
        }
      );
    };

     this.getProjectQuota = function (scope, project){
        var projectPromise = $q.when(1,function(){
          return projectQuotaService.getDefaultProjectQuota();
        });
        var domainPromise = projectQuotaService.getDomainQuota(project.domain);
        var promise = $q.all([projectPromise, domainPromise]);
        promise.then(function(data){
          var projectQuotas = data[0].items;
          var domainQuotas = data[1].items;
          scope.projectQuota = projectQuotaService.initProjectQuota(projectQuotas, domainQuotas);
          scope.isQuotaLoading = false;
        });
    };

    function init(){
      scope.context = context;
      scope.action = action;
      scope.project.enabled = true;
      scope.isLoading = false;
      self.getDomains();
    }
    init();
  }])
  .controller('projectQuotaEditFormCtrl', [ '$scope', '$modalInstance', 'project', 'context',
   'horizon.openstack-service-api.settings', '_scope', '$timeout', '$q', 'projectQuotaService',
  function(scope, modalInstance, project, context,
   settingsService, parentScope, timeout, $q, projectQuotaService) {
    self = this;

    var action = {
      submit: function() {
                 var formData = { project : scope.project,
                                 projectQuota : scope.projectQuota,
                                 domain_quota_enabled : scope.domain_quota_enabled
                                };
                 modalInstance.close(formData);
               },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };

    this.getProjectQuota = function (scope, project) {
      settingsService.getSetting('DOMAIN_QUOTA_ENABLED', false).then(
        function(enabled){//enable
          if(enabled) {
            scope.domain_quota_enabled = true;
            var projectPromise = projectQuotaService.getProjectQuota(project.id);
            var domainPromise = projectQuotaService.getDomainQuota(project.domain_id);
            var promise = $q.all([projectPromise, domainPromise]);
            promise.then(function(data){
              var projectQuotas = data[0].items;
              var domainQuotas = data[1].items;
              scope.projectQuota = projectQuotaService.initProjectQuota(projectQuotas, domainQuotas);
              scope.isQuotaLoading = false;
            });
          } else {
            scope.domain_quota_enabled = false;
            projectQuotaService.getProjectQuota(project.id)
            .then(function(response){
                var projectQuota = response.items;
                scope.projectQuota = projectQuotaService.initProjectQuota(projectQuota);
                scope.isQuotaLoading = false;
            });

          }
        }
      );
    }

    scope.toggleUnlimit = function(item){
        if (item.checked){
          item.value = -1;
          item.min = -1;
        } else {
          item.value = item.init == -1 ? 0 : item.init;
          item.min = 0;
        }
    };

    function init(){
        scope.domain_quota_enabled = false;
        scope.context = context;
        scope.project = project;
        scope.action = action;
        scope.isQuotaLoading = true;
        self.getProjectQuota(scope, project);
    }

    init();

  }]);

})();
