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

  angular.module('hz.dashboard.identity.users')

  /**
   * @ngdoc formCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit user form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('formCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.keystone', 'user', 'context', '_scope', '$timeout',
    function(scope, modalInstance, keystoneAPI, user, context, parentScope, timeout) {
      var self = this;

      scope.cloudAdmin = false
      scope.domainAdmin = false
      scope.roleName = {
        'Member': gettext('Member'),
        'Admin': gettext('Admin'),
        'Maintainer': gettext('Maintainer'),
        // in case the name is lower case
        'member': gettext('Member'),
        'admin': gettext('Admin'),
        'maintainer': gettext('Maintainer'),
      };

      scope.dropdown = {};
      scope.projectsLoading = false;
      scope.context = context;
      scope.user = user;
      scope.action =  {
          submit: function() { modalInstance.close(user); },
          cancel: function() { modalInstance.dismiss('cancel'); }
      };
      scope.currentUser = parentScope.currentUser;

      this.init = function(){
        // if current user is cloud admin
        keystoneAPI.getCloudAdmin().success(function(response) {
          scope.cloudAdmin = response;
        // auto assign new users to _member_ role
          keystoneAPI.getDomainAdmin().success(function(response){
            scope.domainAdmin = response;
            if (context.mode === 'create'){
                keystoneAPI.getRoles().success(function(response) {
                  scope.dropdown.roles = response.items;
                  for (var i=0; i<response.items.length; i++){
                    if (response.items[i].name === 'cloudadmin'){
                      scope.dropdown.roles.remove(response.items[i]);
                    }
                  }
                  if (!scope.cloudAdmin && !scope.domainAdmin){
                    if (response.items[i].name === 'admin'){
                      scope.dropdown.roles.remove(response.items[i]);
                    }
                  }
                });
                if (scope.cloudAdmin){
                  keystoneAPI.getDomains().success(function(response) {
                    var allowDomain = [];
                    for(var i=0;i<response.items.length;i++){
                      if(response.items[i].name != 'heat_domain'){
                        allowDomain.push(response.items[i]);
                      }
                    }
                    scope.dropdown.domains = allowDomain;
                  });
                }else{
                  var params ={domain_id: parentScope.currentUser.user_domain_id};
                  keystoneAPI.getProjects(params).success(function(response) {
                    scope.dropdown.projects = response.items;
                    user.project_id = (user.tenantId || user.default_project_id);
                  });
                }
              }
          });
        });
      }
      this.init()

      var timer;
      scope.checkEmail = function() {
          timeout.cancel( timer );
          timer = timeout(function() {
          keystoneAPI.getUserEmail(user.email).success(function(data){
              scope.hasEmail = !data.result;
          })
        }, 500);
    }
    scope.selectDomain = function(domain) {
      scope.dropdown.projects = [];
      scope.projectsLoading = true;
      var params ={domain_id: domain};
      keystoneAPI.getProjects(params).success(function(response) {
        scope.dropdown.projects = response.items;
        scope.projectsLoading = false;

      });
    }
    scope.selectProject = function(){
      var selectData = scope.dropdown.project_data;
      scope.user.project = selectData.name;
      scope.user.project_id = selectData.id;
    };
    scope.checkName = function() {
      timeout.cancel( timer );
      timer = timeout(function() {
        if(scope.user.name ){
          //for (var item in parentScope.iusers) {
          for (var item in parentScope.users) {
            //if(parentScope.iusers[item].name.toLocaleLowerCase() == scope.user.name.toLocaleLowerCase() && parentScope.iusers[item].id != scope.user.id) {
            if(parentScope.users[item].name.toLocaleLowerCase() == scope.user.name.toLocaleLowerCase() && parentScope.users[item].id != scope.user.id) {
                scope.hasName = true;
                return;
            } else {
              scope.hasName = false;
            }
          }
        }
      }, 500);

    }
    }]);
})();
