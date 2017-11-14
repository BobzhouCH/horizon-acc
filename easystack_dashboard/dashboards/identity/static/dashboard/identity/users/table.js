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

  .factory('checkUserDomainAdmin', ['horizon.openstack-service-api.keystone', function(keystoneAPI){

    function action(scope){
      var self = this;

      self.checkMethod = function(iuser){
        keystoneAPI.userIsDomainAdmin(iuser.id, iuser.domain_id)
          .success(function(response){
            iuser['is_admin_checked'] = true;
            if(response){
              iuser['is_domain_admin'] = true;
            } else {
                iuser['is_domain_admin'] = false;
            }
          });
      };

      self.watchMethod = function(){
        scope.$watch('iusers', function(newValue, oldValue){
           if(angular.equals(newValue, oldValue)){
              return false;
           }

           for(var i = 0; i<scope.iusers.length; i++){
              if (!scope.iusers[i].is_admin_checked){
                self.checkMethod(scope.iusers[i]);
              }
           }
        });
      };

    };

    return action;

  }])

  /**
   * @ngdoc identityUsersCtrl
   * @ngController
   *
   * @description
   * Controller for the identity users table.
   * Serve as the focal point for table actions.
   */
  .controller('identityUsersCtrl', [
    '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.keystone',
    'createAction', 'editAction', 'passwordAction',
    'deleteAction', 'enableAction','horizon.framework.widgets.toast.service',
    'checkUserDomainAdmin',
    function(
      scope, PolicyService, keystoneAPI,
      CreateAction, EditAction, PasswordAction,
      DeleteAction, EnableAction, toastService,
      CheckUserDomainAdmin) {

    var self = this,
        checkUser;

    scope.context = {
      header: {
        domainId: gettext('Domain ID'),
        tenantId: gettext('Project ID'),
        name: gettext('User Name'),
        email: gettext('Email'),
        id: gettext('User ID'),
        enabled: gettext('Enabled'),
        action: gettext('Action'),
        domain_belong: gettext('Domain Belonging'),
        domainadmin: gettext('Domain Admin'),
      },
      action: {
        edit: gettext('Edit'),
        enable: gettext('Enable'),
        disable: gettext('Disable'),
        deleted: gettext('Delete')
      },
      error: {
        api: gettext('Unable to retrieve users'),
        priviledge: gettext('Insufficient privilege level to view user information.')
      }
    };

    scope.filterFacets = [{
      label: gettext('User Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Email'),
      name: 'email',
      singleton: true
    }, {
      label: gettext('User ID'),
      name: 'id',
      singleton: true
    }, {
      label: gettext('Domain Belonging'),
      name: 'domain',
      singleton: true
    }, {
      label: gettext('Domain Admin'),
      name: 'is_domain_admin',
      singleton: true,
      options: [
        { label: gettext('true'), key: 'true' },
        { label: gettext('false'), key: 'false' }
      ]
    }, {
      label: gettext('Enabled'),
      name: 'enabled',
      singleton: true,
      options: [
        { label: gettext('true'), key: 'true' },
        { label: gettext('false'), key: 'false' }
      ]
    }];

    this.reset = function() {
      scope.users = [];
      scope.iusers = [];
      scope.checked = {};
      scope.selected = {};
      scope.iusersState = false;
      if(scope.selectedData)
          scope.selectedData.aData = [];
    };

    scope.isCurrentUser = function(user_id){
      return user_id == scope.userID;
    };

    scope.isCloudAdmin = function(user) {
      if (user) {
        return user.name == 'admin' && user.is_domain_admin;
      }
      return false;
    };

    scope.limitOperation = function(user) {
      if (scope.isCurrentUser(user.id)) {
        return true;
      }
      if (scope.isCloudAdmin(user)) {
        return true;
      }

      return false;
    };

    scope.canNotDeleted = function(users) {
      for (var i=0; i<users.length; i++) {
        if (scope.limitOperation(users[i])){
          return true;
        }
      }
      return false;
    };

    this.init = function(){
      scope.actions = {
        refresh: self.refresh,
        create: new CreateAction(scope),
        edit: new EditAction(scope),
        password: new PasswordAction(scope),
        deleted: new DeleteAction(scope),
        enable: new EnableAction(scope)
      };

      keystoneAPI.getCurrentUserSession().success(
      function(response) {
        scope.currentUser = response;
        if (scope.currentUser.username === 'admin' && scope.currentUser.user_domain_id === 'default') {
          scope.currentUserIsCloudAdmin = true;
        }
      });

      self.refresh();

      keystoneAPI.getLDAP().success(function(data){
        scope.ldap_editable = data["editable"];
      });

      checkUser = new CheckUserDomainAdmin(scope);
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(){
      self.reset();
      keystoneAPI.getCloudAdmin().success(function(cloudAdmin) {
        if (cloudAdmin) {
          keystoneAPI.getDomains().success(function(response) {
          scope.iusersState = true;
          var domains = response.items;
          for (var i=0; i<domains.length; i++) {
            if(response.items[i].name != 'heat_domain'){
              var paras = {domain_id: domains[i].id};
              self.getDomainUsers(paras);
            }
          }
        });
        } else{
          keystoneAPI.getUsers().success(function(response) {
             scope.users = response.items;
             scope.iusersState = true;
          });
        }

        checkUser.watchMethod();
      });
    };

    this.getDomainUsers = function(paras){
      keystoneAPI.getUsers(paras).success(function(response) {
        scope.users.extend(response.items);
      });
    };

    self.reset();

    this.init();

  }]);

})();
