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

(function(){
  'use strict';

  angular.module('hz.dashboard.project.networks')

    /**
     * Networks ListController
     * Initialization function
     */
    .controller('adminNetworksController', [
        '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.neutron',
        'horizon.framework.widgets.toast.service', 'networksDeleteAction', 'NetworkEditAction',
        'hz.dashboard.admin.instances.networksCreateAction',
        function(scope, policyAPI, NeutronAPI, toastService, NetworksDeleteAction, NetworkEditAction,
          networksCreateAction){
          var self = this;
          scope.context = {
            header: {
              name: gettext('Name'),
              domain: gettext('Domain'),
              project: gettext('Project'),
              subnets: gettext('Subnets'),
              shared: gettext('Shared'),
              external_network: gettext('External Network')
            },
            error: {
              api: gettext('Unable to retrieve networks.'),
              priviledge: gettext('Insufficient privilege level to view networks information.')
            }
          };
          this.reset = function(){
            scope.inetworks = [];
            scope.networks = [];
            scope.checked = {};
            scope.selected = {};
            scope.inetworksState = false;
            if(scope.selectedData)
              scope.selectedData.aData = [];
          };

          scope.actions = {};
          this.init = function(){
            scope.actions = {
              refresh: self.refresh,
              deleted: new NetworksDeleteAction(scope, 'admin'),
              edit: new NetworkEditAction(scope),
              create: new networksCreateAction(scope),
            };
            self.refresh();
          };
          this.refresh = function(){
            self.reset();
            policyAPI.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
              .success(function(response) {
                if(response.allowed){
                  NeutronAPI.getNetworks({all_projects: 'true'})
                    .success(function(response){
                      scope.networks = response.items;
                      scope.inetworksState = true;
                    });
                }
                else {
                  toastService.add('info', scope.context.error.priviledge)
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
          label: gettext('Subnets'),
          name: 'cidr',
          singleton: true
        }, {
          label: gettext('Shared'),
          name: 'shared',
          singleton: true,
          options: [
            { label: gettext('true'), key: 'True' },
            { label: gettext('false'), key: 'False' }
          ]
        }, {
          label: gettext('External Network'),
          name: "['router:external']",
          singleton: true
        }];

        }]);

})();
