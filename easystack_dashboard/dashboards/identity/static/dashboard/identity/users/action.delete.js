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
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete user confirmation modal dialog.
   * On submit, delete selected users.
   * On cancel, do nothing.
   */
  .factory('deleteAction', ['horizon.openstack-service-api.keystone', 'horizon.framework.widgets.modal.service',
    'horizon.framework.widgets.toast.service',
  function(keystoneAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete User'),
      message: gettext('The amount of users these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. Delete user action cannot be undone.'),
      submit: gettext('Delete User'),
      success: gettext('Deleted users: %s.'),
      error: gettext('Deleted users: %s.'),
      using: gettext('Deleting current user: "%s" is not allowed.'),
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single user object
      self.singleDelete = function(user) {
        self.confirmDelete([user.id], [user.name]);
      };

      // delete selected user objects
      // action requires the user to select rows
      self.batchDelete = function() {
        var ids = [], names = [];
        var current = {};
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              if (scope.limitOperation(row.item)) {
                current.name = row.item.name;
                return;
              }
              ids.push(row.item.id);
              names.push(row.item);
            }
        });
        if (current.name){
          var message = interpolate(context.using, [current.name]);
          toastService.add('error', message);
          return;
        }
        self.confirmDelete(ids, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, names) {
        var namelist = names.attrsOfAll('name').join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, namelist);
        });
      };

      // on success, remove the users from the model
      // need to also remove deleted users from selected list
      self.submit = function(ids, namelist) {
        for(var n=0; n<ids.length; n++){
    	  keystoneAPI.deleteUser(ids[n])
          .success(function() {
            // iterating backwards so we can splice while looping
            for (var i = scope.users.length - 1; i >= 0; i--) {
              var user = scope.users[i];
              for (var k = 0; k  < ids.length; k++) {
                if (user.id === ids[k]) {
                  scope.users.splice(i, 1);
                  var message = interpolate(context.success, [user.name]);
                  toastService.add('success', message);
                  delete scope.selected[user.id];
                  scope.$table.resetSelected();
                  break;
                }
              }
            }
          })
          .error(function() {
            var message = interpolate(context.error, [namelist]);
            toastService.add('error', message);
          });
        }
      };
    }

    return action;

  }]);

})();