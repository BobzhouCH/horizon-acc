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

  angular.module('hz.dashboard.admin.server_groups')

  /**
   * @ngdoc projectFloatingIPCtrl
   * @ngController
   *
   * @description
   * Controller for the identity floatingIP table.
   * Serve as the focal point for table actions.
   */
  .controller('adminServerGroupsCtrl', [
    '$scope',
    'horizon.openstack-service-api.policy',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.nova',
    'createServerGroupAction', 
    'serverGroupDeleteAction',
    'createSGDetailAction',
    'horizon.framework.widgets.toast.service',
    function(
      scope,
      PolicyService, usersettingAPI, keystoneAPI,
      novaAPI,
      CreateAction,
      DeleteAction,
      CreateSGDetailAction,
      toastService) {

    var self = this;
    scope.context = {
      header: {
        group_name: gettext('Group name'),
        policies: gettext('Policies'),
        members: gettext('Members'),
        metadata:gettext('Metadata'),
      },
      error: {
        api: gettext('Unable to retrieve server groups'),
        priviledge: gettext('Insufficient privilege level to view server_groups information.')
      }
    };

    scope.filterFacets = [{
      label: gettext('Group name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Policies'),
      name: 'policies',
      singleton: true
    }, {
      label: gettext('Members'),
      name: 'members',
      singleton: true
    }, {
      label: gettext('Metadata'),
      name: 'metadata',
      singleton: true
    }];

    this.formatServerGroup = function(sg){
      sg.policies = sg.policies.join(", ");
      sg.members = sg.members.join(", ");
      sg.metadata = " ";
    };

    this.reset = function(){
      scope.servergroups = [];
      scope.iservergroups = [];
      scope.checked = {};
      scope.selected = {};
      scope.iservergroupState = false;
      if(scope.selectedData)
          scope.selectedData.aData = [];

      scope.disableRelease = true;
    };

    this.init = function(){
      scope.actions = {
        refresh: self.refresh,
        create: new CreateAction(scope),
        deleted: new DeleteAction(scope),
        createDetail: new CreateSGDetailAction(scope),
       };
      self.refresh();

    };

    // polices state translate english into chinese
    scope.sgpolices = {
      'affinity': gettext('Affinity'),
      'anti-affinity': gettext('Anti-Affinity')
    }

    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(){
      self.reset();
      PolicyService.check({rules: [['identity', 'identity:get_cloud_admin_resources']]})
        .success(function(response) {
          if (response.allowed) {
            listServerGroups();
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });

      function listServerGroups() {
      
        novaAPI.getServerGroups({all_projects: 1})
          .success(function(response) {
            // convert utc to local time
            if (response.items) {
              angular.forEach(response.items, function(item){
                self.formatServerGroup(item);
              });
            }
            console.log(response.items);
            scope.servergroups = response.items;
            scope.iservergroupState = true;
          });
     
    }};

    this.init();

  }]);

})();
