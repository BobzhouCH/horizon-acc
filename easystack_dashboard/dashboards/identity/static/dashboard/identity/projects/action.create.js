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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create project modal dialog.
   * On submit, create a new project and display a success message.
   * On cancel, do nothing.
   */
  .factory('createProjectAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
          'horizon.framework.widgets.toast.service','projectQuotaService',
  function(keystoneAPI, modal, backDrop, toastService, projectQuotaService) {

    var context = {
      mode: 'create',
      title: gettext('Create Project'),
      submit:  gettext('Create'),
      success: gettext('Project %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'projectCreateFormCtrl',
        backdrop:		backDrop,
        windowClass: 'projectCreateContent',
        resolve: {
          project: function(){ return {}; },
          context: function(){ return context; },
          _scope: function(){return scope;}
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(formData) {
         var newProject = formData.project;
         var projectQuota = formData.projectQuota;
         var domain_quota_enabled = formData.domain_quota_enabled;
        if (!newProject.domain){
           newProject.domain = scope.currentUser.user_domain_id;
        }
        keystoneAPI.createProject(newProject)      
          .success(function(response) {
            var project_id = response.id;
            if (response.domain_id != null){
                keystoneAPI.getDomain(response.domain_id).success(
                  function (data){
                    response.domain = data;
                });
            }
            scope.projects.push(response);
            var message = interpolate(context.success, [newProject.name]);
            toastService.add('success', message);

            // grant new project to current user.
            if (newProject.domain == scope.currentUser.user_domain_id) {
              keystoneAPI.getRoles().success(function (response){
                angular.forEach(response.items, function(role){
                    if(role.name === 'admin') {
                        keystoneAPI.grantRole(project_id, role.id, scope.currentUser.id);
                    }
                });
              });
            }
            scope.$table && scope.$table.resetSelected();
          })
        .then(function(response){
            if (domain_quota_enabled) {
              var project = response.data;
              projectQuotaService.updateProjectQuota(project, projectQuota, function(){
                scope.$table && scope.$table.resetSelected();
              });
            }
        });
      };
    }

    return action;
  }]);

})();