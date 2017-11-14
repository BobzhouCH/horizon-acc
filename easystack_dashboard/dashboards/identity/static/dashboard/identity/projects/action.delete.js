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
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete project confirmation modal dialog.
   * On submit, delete selected projects.
   * On cancel, do nothing.
   */
  .factory('deleteProjectAction', ['horizon.openstack-service-api.keystone', 'horizon.framework.widgets.modal.service',
    'horizon.framework.widgets.toast.service',
  function(keystoneAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete project'),
      message: gettext('The amount of projects these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. Delete project action cannot be undone.'),
      submit: gettext('Delete project'),
      success: gettext('Deleted projects: %s.'),
      error: gettext('Failed to delete project: %s.'),
      using: gettext('Deleting current project: "%s" is not allowed.'),
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single project object
      self.singleDelete = function(project) {
        self.confirmDelete([project.id], [project.name]);
      };

      // delete selected project objects
      // action requires the project to select rows
      self.batchDelete = function() {
        var projects = [], names = [];
        var current = {};
        angular.forEach(scope.selected, function(row) {
          if (row.item.name == 'admin') {
            return;
          }
          if (scope.isCurrentProject(row.item.id)){
            current.name = row.item.name;
            return;
          }
          if (row.checked){
            projects.push(row.item);
            names.push('"'+ row.item.name +'"');
          }
        });

        if (current.name){
          var message = interpolate(context.using, [current.name]);
          toastService.add('error', message);
          return;
        }
        self.confirmDelete(projects, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(projects, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: projects,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.deleteProjects(projects);
        });
      };

      // on success, remove the projects from the model
      // need to also remove deleted projects from selected list
      self.deleteProjects = function(projects) {
        for(var i = 0; i < projects.length; i++){
          self.deleteProject(projects[i]);
        }
      };

      self.deleteProject = function(project) {
        keystoneAPI.deleteProject(project.id)
          .success(function() {
            scope.projects.removeId(project.id);
            scope.$table.resetSelected();
            var message = interpolate(context.success, [project.name]);
            toastService.add('success', message);
          })
          .error(function(err) {
            var message = interpolate(context.error, [project.name]);
            toastService.add('error', message + err);
          });
      };
    }

    return action;

  }]);

})();