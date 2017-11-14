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
   * @ngdoc identityProjectsCtrl
   * @ngController
   *
   * @description
   * Controller for the identity projects table.
   * Serve as the focal point for table actions.
   */
  .controller('identityProjectsCtrl', [
    '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.keystone',
    'createProjectAction', 'editProjectAction',
    'deleteProjectAction', 'enableProjectAction',
    'editProjectQuotaAction', 'editProjectUsersAction',
    function(
      scope, PolicyService, keystoneAPI,
      CreateAction, EditAction,
      DeleteAction, EnableAction, EditQuota, EditUsers) {
    var self = this;

    scope.context = {
      header: {
        name: gettext('Name'),
        description: gettext('Description'),
        id: gettext('Project ID'),
        enabled: gettext('Enabled'),
        domain: gettext('Domain'),
      },
      action: {
        edit: gettext('Edit'),
        enable: gettext('Enable'),
        disable: gettext('Disable'),
        deleted: gettext('Delete')
      },
      error: {
        api: gettext('Unable to retrieve projects'),
        priviledge: gettext('Insufficient privilege level to view project information.'),
        user: gettext('Unable to retrieve current user info.'),
        projects: gettext('Unable to retrieve current user allowed projects.')
      }
    };
    this.reset = function() {
      scope.projects = [];
      scope.iprojects = [];
      scope.checked = {};
      scope.selected = {};
      scope.iprojectsState = false;
      scope.allowedProjects = [];
      if(scope.selectedData)
          scope.selectedData.aData = [];
    };

    scope.isCurrentProject = function(project_id){
       return project_id == scope.currentUser.project_id;
    };

    // Check if a given project can be set as the active 
    // project for the current user
    function canBeSetAsActive(projectId) {
      if (projectId !== scope.currentUser.project_id) {
        for(var i = 0; i < self.allowedProjects.length; i++) {
          if (projectId === scope.allowedProjects[i].id) {
            return true;
          }
        }
      }
      return false;
    };
    // Retrieve information about the current user,
    // particularly the currently active project and the allowed
    // projects that can be set as the active one.
    function getUserInfo() {
      keystoneAPI.getCurrentUserSession().success(
        function(response) {
          scope.currentUser = response;
        },
        function() {
          if (horizon) {
            horizon.alert('error', self.context.error.user);
          }
          return $q.reject();
        }
      ).then(
        function(response) {
          scope.allowedProjects = response.data.items;
        },
        function() {
          if (horizon) {
            horizon.alert('info', self.context.error.projects);
          }
        }
      )
    };
    this.init = function(){
      scope.actions = {
        refresh: self.refresh,
        create: new CreateAction(scope),
        edit: new EditAction(scope),
        deleted: new DeleteAction(scope),
        enable: new EnableAction(scope),
        editquota: new EditQuota(scope),
        editUsers: new EditUsers(scope),
      };
      getUserInfo();
      scope.canBeSetAsActive = canBeSetAsActive;
      self.refresh();

      keystoneAPI.getCloudAdmin()
        .success(function(result) {
          scope.isCloudAdmin = result;
        });
    };
    // on load, if project has permission
    // fetch table data and populate it
    this.refresh = function(){
      self.reset();
      PolicyService.check({ rules: [['identity', 'identity:list_projects']] })
        .success(function(response) {
          scope.isAdmin = response.allowed;
          keystoneAPI.getProjectAdmin()
            .success(function(isProjectAdmin) {
              scope.isProjectAdmin = isProjectAdmin;
              keystoneAPI.getDomainAdmin()
                .success(function(isDomainAdmin) {
                  scope.isDomainAdmin = isDomainAdmin;
                  if (isProjectAdmin || isDomainAdmin) {
                    self.listProjects(isDomainAdmin);
                  } else {
                    window.location.replace((window.WEBROOT || '') + 'auth/logout');
                  }
                });
            });
        });
    };

    this.listProjects = function(admin) {
      var user_id = admin ? null : scope.currentUser.id;
      keystoneAPI.getProjects({admin: admin, user: user_id})
        .success(function(response) {
          for(var i=0;i<response.items.length;i++){
            if(response.items[i].domain_name != 'heat_domain'){
                scope.projects.push(response.items[i]);
            }
          }
          scope.iprojectsState = true;
        });
    };

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Description'),
      name: 'description',
      singleton: true
    }, {
      label: gettext('Project ID'),
      name: 'id',
      singleton: true
    }, {
      label: gettext('Domain'),
      name: 'domain_name',
      singleton: true
    }, {
      label: gettext('Enabled'),
      name: 'enabled',
      singleton: true,
      options: [
        { label: gettext('true'), key: 'true' },
        { label: gettext('false'), key: 'false' }
      ]
    }];

    this.init();

  }]);

})();
