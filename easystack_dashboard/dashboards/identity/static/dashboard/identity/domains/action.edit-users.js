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

  angular.module('hz.dashboard.identity.domains')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit domain modal dialog.
   * On submit, edit domain and display a success message.
   * On cancel, do nothing.
   */
  .factory('editDomainUsersAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
  function(keystoneAPI, modal, backDrop) {

    var context = {
      mode: 'editUsers',
      title: gettext('Edit Domain Users'),
      submit:  gettext('Save'),
      success: gettext('The users of domain %s has been updated successfully.'),
      header: {
        action: gettext('Action'),
        usersForSelection: gettext('Users for Selection'),
        selectedUsers: gettext('Added Users'),
        roles: gettext('Roles'),
      },
    };

    context.UserManager = function(scope) {
      var self = this;
      scope.loadingCanSelectUsers = true;
      scope.loadingSelectedUser = true;
      scope.canSelectUsers = [];
      scope.selectedUsers = [];
      scope.icanSelectUsers = [];
      scope.iselectedUsers = [];
      scope.selectedRoles = {};
      //NOTE(lzm): this two tables will be initialized in html.
      scope.tables = {canSelectUsers: null, selectedUsers: null};
      scope.dropdown = scope.dropdown || {};
      scope.rolesMap = {
        'admin': gettext('Admin'),
        'Member': gettext('Member')
      };

      // remove users that exist in the domain
      function filterCanSelectUsers() {
        for(var i = 0; i< scope.selectedUsers.length; i++) {
          var existId = scope.selectedUsers[i].id;
          scope.canSelectUsers.removeId(existId);
        }
      };

      function initRoles(users) {
        for(var i=0; i<users.length; i++){
          var user = users[i];
          var roles = user.roles;
          var userSelectedRoles = {};
          for(var k=0; k<roles.length; k++){
            userSelectedRoles[roles[k].id] = { 'checked': true };
          }
          scope.selectedRoles[user.id] = userSelectedRoles;
        }
      }

      function init(domain) {
        // get users of this domain
        keystoneAPI.getDomainUsers(domain.id).success(function(response) {
          scope.loadingSelectedUser = false;
          scope.selectedUsers = response.items;
          domain.origUsers = angular.copy(scope.selectedUsers);

          // get users for selection
          var paras = {domain_id: domain.id};
          keystoneAPI.getUsers(paras).success(function(response) {
            scope.loadingCanSelectUsers = false;
            scope.canSelectUsers = response.items;
            filterCanSelectUsers();
          });

          initRoles(scope.selectedUsers);
        });

        // get roles for selection
        keystoneAPI.getRoles().success(function(response) {
          scope.dropdown.roles = response.items;
        });
      }
      init(scope.domain);

      this.addUser = function(user) {
        // init roles
        var roles = [];
        for (var i = 0; i < scope.dropdown.roles.length; i++) {
          var role = scope.dropdown.roles[i];
          if (!role.admin) {
            roles.push(role);
          }
          else if (user.is_domain_admin) {
            roles.push(role);
          }
        }
        user.roles = roles;
        // move user from left to right
        scope.canSelectUsers.remove(user);
        scope.selectedUsers.push(user);
        initRoles([user]);
        // clear the old selected items
        scope.tables.canSelectUsers.unselectRow(user);
      };

      this.removeUser = function(user) {
        // move user from right to left
        scope.selectedUsers.remove(user);
        scope.canSelectUsers.push(user);
        delete scope.selectedRoles[user.id];
        // clear the old selected items
        scope.tables.selectedUsers.unselectRow(user);
      };

      this.addUsers = function(users) {
        for(var i = users.length - 1; i >= 0; i--) {
          self.addUser(users[i]);
        }
      };

      this.removeUsers = function(users) {
        for(var i = users.length - 1; i >= 0; i--) {
          self.removeUser(users[i]);
        }
      };

      /*
      * update scope.domain.currentUsers
      * selectedRoles: {user-id: {role-1:{checked: true}, role-2: {checked: false}, ...}, ...}
      */
      this.updateCurrentUsers = function(selectedRoles) {
        var currentUsers = [];
        for(var userId in selectedRoles) {
          var user = selectedRoles[userId];
          var roles = [];
          for(var roleId in user) {
            if(user[roleId].checked)
              roles.push({id: roleId});
          }
          currentUsers.push({id: userId, roles: roles});
        }
        scope.domain.currentUsers = currentUsers;
        return scope.domain;
      };

      scope.action.addUser = this.addUser;
      scope.action.removeUser = this.removeUser;
      scope.action.addUsers = this.addUsers;
      scope.action.removeUsers = this.removeUsers;
      scope.action.updateCurrentUsers = this.updateCurrentUsers;
    };// end of UserManager

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'users-form',
        controller: 'domainformCtrl',
        backdrop: backDrop,
        resolve: {
          domain: function(){ return null; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        },
        windowClass: 'editUsersContent'
      };

      // open up the edit form
      self.open = function(domains) {
        var domain = angular.copy(domains[0]);
        option.resolve.domain = function(){ return domain; };
        modal.open(option).result.then(self.submit);
      };

      // edit users, send only what is required
      self.clean = function(domain) {
        return {
          domain_id: domain.id,
          orig_users: domain.origUsers,
          users: domain.currentUsers
        };
      };

      // submit this action to api
      self.submit = function(domain) {
        var cleaned = self.clean(domain);
        keystoneAPI.editDomainUsersAndAddProjectAdminRole(cleaned)
          .success(function() {
            var message = interpolate(context.success, [domain.name]);
            keystoneAPI.toast('success', message);

            scope.$table.resetSelected();
          })
          .error(function(response, status) {
            if (status == 409) {
              keystoneAPI.toast('error', response);
            }
            else {
              keystoneAPI.toast('error', gettext('Unable to edit the domain users.'));
            }
          });
      };
    }

    return action;
  }]);

})();
