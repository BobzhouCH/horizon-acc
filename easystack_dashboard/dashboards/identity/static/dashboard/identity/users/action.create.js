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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('createAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
                            'horizon.framework.widgets.toast.service',
  function(keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create User'),
      submit:  gettext('Create'),
      success: gettext('User %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'formCtrl',
        backdrop: backDrop,
        windowClass: 'usersListContent',
        resolve: {
          user: function(){ return {}; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newUser) {
        keystoneAPI.createUser(newUser)
          .success(function(response) {
            scope.users.push(response);
            var message = interpolate(context.success, [newUser.name]);
             toastService.add('success', message);

            // remove the passwords from user object
            delete newUser.password;
            delete newUser.cpassword;
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();