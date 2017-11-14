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
   * @ngDoc passwordAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, update user password and display a success message.
   * On cancel, do nothing.
   */
  .factory('passwordAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
           'horizon.framework.widgets.toast.service',
  function(keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'password',
      title: gettext('Change Password'),
      submit:  gettext('Save'),
      success: gettext('Password for user %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'formCtrl',
        backdrop:		backDrop,
        resolve: {
          user: function(){ return null; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        },
        windowClass: 'usersListContent'
      };

      /** Open the password form dialog */
      self.open = function(user) {
        option.resolve.user = function() { return user[0]; };
        modal.open(option).result.then(self.submit);
      };

      /** Submit data to API and handle update */
      self.submit = function(updatedUser) {
    	  keystoneAPI.editUser(updatedUser)
          .success(function() {

            var message = interpolate(context.success, [updatedUser.name]);
            toastService.add('success', message);

            // remove the passwords from user object
            delete updatedUser.password;
            delete updatedUser.cpassword;
            
            scope.$table.resetSelected();

            // if the user changed his/her own password
            // automatically log the user out
            if (updatedUser.id === scope.userID){
              window.location.replace('/auth/logout');
            }
          });
      };
    }

    return action;
  }]);

})();