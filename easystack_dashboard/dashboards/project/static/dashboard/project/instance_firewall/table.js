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

angular.module('hz.dashboard.project.instance_firewall')

    /**
     * Instance firewalls ListController
     * Initialization function
     */

    .controller('projectInstance_firewallsController', [
        '$scope',
        'horizon.openstack-service-api.policy',
        'horizon.openstack-service-api.usersettings',
        'horizon.openstack-service-api.keystone',
        'horizon.openstack-service-api.security-group',
        'SecurityCreateAction',
        'SecurityDeleteAction',
        'horizon.framework.widgets.toast.service',
        function(scope, policyAPI, usersettingAPI, keystoneAPI, SecurityGroupAPI, SecurityCreateAction, SecurityDeleteAction, toastService){
            var self = this;
            scope.context = {
                header: {
                    name: gettext('Name'),
                    description: gettext('Description')
                },
                action: {
                },
                error: {
                    api: gettext('Unable to retrieve security groups'),
                    priviledge: gettext('Insufficient privilege level to view security group information.')
                }
            };
            this.reset = function() {
                scope.instance_firewalls = [];
                scope.iinstance_firewalls = [];
                scope.instance_firewallState = false;
                scope.checked = {};
                if(scope.selectedData)
          scope.selectedData.aData = [];
            };
            this.init = function(){
                scope.actions = {
                  refresh: self.refresh,
                  create: new SecurityCreateAction(scope),
                  deleted: new SecurityDeleteAction(scope)
                };
                self.refresh();
              };
            this.refresh = function(){
                scope.disableCreate = false;
                self.reset();
                policyAPI.check({ rules: [['project', '']] })
                .success(function(response) {
                    if(response.allowed){
                        SecurityGroupAPI.query()
                        .success(function(response){
                          var responseSG = response;
                          keystoneAPI.getCurrentUserSession()
                            .success(function(response) {
                                usersettingAPI.getProjectQuota(response.project_id, {only_quota: true})
                                .success(function(data){
                                    for (var i = 0; i < data.items.length; i++){
                                      if (data.items[i].name === 'security_groups'){
                                        scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                                        break;
                                      }
                                    }
                                    scope.instance_firewalls = responseSG.items;
                                    scope.instance_firewallState = true;
                              });
                            });
                        });
                    }
                    else if(horizon){
                        toastService.add('info', scope.context.error.priviledge);
                    }
                });
            };

            scope.filterFacets = [{
              label: gettext('Name'),
              name: 'name',
              singleton: true
            }, {
              label: gettext('Description'),
              name: 'description',
              singleton: true
            }];

            this.init();

    }]);

})();