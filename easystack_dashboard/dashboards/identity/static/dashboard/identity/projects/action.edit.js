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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit project modal dialog.
   * On submit, edit project and display a success message.
   * On cancel, do nothing.
   */
  .factory('editProjectAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
          'horizon.framework.widgets.toast.service',
  function(keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Project'),
      submit:  gettext('Save'),
      success: gettext('Project %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'project-edit-form',
        controller: 'projectformCtrl',
        backdrop:		backDrop,
        resolve: {
          project: function(){ return null; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        },
        windowClass: 'projectsListContent'
      };

      // open up the edit form
      self.open = function(project) {
        var clone = angular.copy(project[0]);
        option.resolve.project = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(project[0], clone);
        });
      };

      // edit form modifies name, email, and project
      // send only what is required
      self.clean = function(project) {
        return {
          id: project.id,
          project: project.project_id,
          name: project.name,
          description: project.description,
          enabled: project.enabled,
          domain_id: project.domain_id
        };
      };

      // submit this action to api
      // and update project object on success
      self.submit = function(project, clone) {
        var cleanedProject = self.clean(clone);
        keystoneAPI.editProject(cleanedProject)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(project, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();