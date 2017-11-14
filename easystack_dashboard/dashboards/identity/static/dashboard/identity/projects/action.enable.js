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
   * @ngDoc enableAction
   * @ngService
   *
   * @Description
   * Allow admin to enable or disable a project.
   */
  .factory('enableProjectAction', ['horizon.openstack-service-api.keystone', 'horizon.framework.widgets.toast.service',
  function(keystoneAPI, toastService) {

    var context = {
      enabledSuccess: gettext('Enabled project %s.'),
      disabledSuccess: gettext('Disabled project %s.'),
      enabledError: gettext('Unable to enable project %s.'),
      disabledError: gettext('Unable to disable project %s.')
    };

    function action(scope) {
      var self = this;

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

      /*jshint validthis: true */
      self.toggle = function(project,clean) {
        var project = project[0];
        // we modify a cloned object and give that to the api
        // if api confirms it, then we update the real model
        var clone = angular.copy(project);
        clone.enabled = !clone.enabled;
        var cleanedProject = self.clean(clone);
        keystoneAPI.editProject(cleanedProject)
          .success(function() {
            var message = project.enabled ? context.disabledSuccess : context.enabledSuccess;
            project.enabled = !project.enabled;
            toastService.add('success', interpolate(message, [project.name]));

            scope.$table.resetSelected();
            scope.enab = true;
            scope.activate = true;
          })
          .error(function() {
            var message = project.enabled?
              context.disabledError:
              context.enabledError;
             toastService.add('error', interpolate(message, [project.name]));
          });
      };
    }

    return action;

  }]);

})();
