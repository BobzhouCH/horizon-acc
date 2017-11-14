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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit user modal dialog.
   * On submit, edit user and display a success message.
   * On cancel, do nothing.
   */
  .factory('editAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
                          'horizon.framework.widgets.toast.service',
  function(keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit User'),
      submit:  gettext('Save'),
      success: gettext('User %s has been updated successfully.'),
      error: gettext('User %s update failed.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'formCtrl',
        backdrop: backDrop,
        resolve: {
          user: function(){ return null; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        },
        windowClass: 'usersListContent'
      };

      // open up the edit form
      self.open = function(user) {
        var clone = angular.copy(user[0]);
        option.resolve.user = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(user[0], clone);
        });
      };

      // edit form modifies name, email, and project
      // send only what is required
      self.clean = function(user) {
        return {
          id: user.id,
          project: user.project_id,
          name: user.name,
          email: user.email
        };
      };

      // submit this action to api
      // and update user object on success
      self.submit = function(user, clone) {
        var cleanedUser = self.clean(clone);
        keystoneAPI.editUser(cleanedUser)
          .success(function() {
            var message = interpolate(context.success, [user.name]);
            toastService.add('success', message);
            angular.extend(user, clone);
            // table.module.js parameter change
            scope.selectedData.aData = [];
            scope.selected = {};
            scope.numSelected = 0;
          })
        .error(function() {
            var message = interpolate(context.error, [user.name]);
            toastService.add('error', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();