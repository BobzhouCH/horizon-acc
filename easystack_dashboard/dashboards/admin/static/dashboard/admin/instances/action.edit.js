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

  angular.module('hz.dashboard.admin.instances')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit instance modal dialog.
   * On submit, edit instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.instances.editInstanceAction',
   ['horizon.openstack-service-api.nova',
    '$modal',
    'backDrop',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Instance'),
      submit: gettext('Save'),
      success: gettext('Instance %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'hz.dashboard.admin.instances.instanceFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      // open up the edit form
      self.open = function(instance) {
        var clone = angular.copy(instance[0]);
        option.resolve.instance = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(instance[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(instance) {
        return {
          id: instance.id,
          name: instance.name,
         // description: instance.description,
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        var cleanedInstance = self.clean(clone);
        novaAPI.editServer(instance.id, cleanedInstance)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', gettext(message));
            angular.extend(instance, clone);
            scope.clearSelected();
          });
      };
    }

    return action;
  }]);

})();
