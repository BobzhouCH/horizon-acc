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

  angular.module('hz.dashboard.admin.routers')

  /**
   * @ngdoc adminRoutersCtrl
   * @ngController
   *
   * @description
   * Controller for the identity users table.
   * Serve as the focal point for table actions.
   */
  .controller('adminRoutersCtrl', [
    '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.neutron',
    'horizon.framework.widgets.toast.service', 'deleteRouterAction', 'editRouterAction',
    function(
      scope, PolicyService, neutronAPI, toastService, DeleteAction, EditAction
      ) {
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          domain: gettext('Domain'),
          project: gettext('Project'),
          status: gettext('Status'),
          ext_network: gettext('External Network'),
        },
        error: {
          api: gettext('Unable to retrieve routers'),
          priviledge: gettext('Insufficient privilege level to view router information.')
        }
      };

      this.reset = function(){
        scope.routers = [];
        scope.irouters = [];
        scope.checked = {};
        scope.selected = {};
        scope.iroutersState = false;
        if(scope.selectedData)
          scope.selectedData.aData = [];
      };

        scope.actions = {};
        this.init = function(){
          scope.actions = {
            refresh: self.refresh,
            deleted: new DeleteAction(scope),
            edit: new EditAction(scope),
          };
          self.refresh();
        };
      // on load, if user has permission
      // fetch table data and populate it
      this.refresh = function(){
          self.reset();
          PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
          .success(function(response) {
            if (response.allowed){
                neutronAPI.getRouters('all')
                .success(function(response) {
                  scope.routers = response.items;
                      scope.iroutersState = true;
                });
            }
            else {
              toastService.add('info', scope.context.error.priviledge);
              window.location.replace((window.WEBROOT || '') + 'auth/logout');
            }
          });
      };

      this.init();

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Domain'),
        name: 'domain',
        singleton: true
      }, {
        label: gettext('Project'),
        name: 'tenant_name',
        singleton: true
      }, {
        label: gettext('External Network'),
        name: 'external_gateway_info.network',
        singleton: true
      }];

  }]);

})();
