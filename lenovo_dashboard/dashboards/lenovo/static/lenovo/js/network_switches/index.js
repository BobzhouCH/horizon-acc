/**
 * Copyright 2016 Lenovo Corp.
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

(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')

    /**
     * @ngdoc projectImagesCtrl
     * @ngController
     *
     * @description
     * Controller for the project images table.
     * Serve as the focal point for table actions.
     */
    .controller('lenovoNetworkSwitchesCtrl', [
      '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.switch', 'lenovoNetworkSwitchesAction',
      function (scope, policyService, switchAPI, action) {
          var self = this;

          scope.context = {
              header: {
                  ipAddress: gettext('IP Address'),
                  hostname: gettext('Host Name'),
                  username: gettext('Username'),
                  osType: gettext('OS Type'),
                  cpu: gettext('CPU'),
                  memory: gettext('Memory'),
                  hardwareType: gettext('Hardware Type'),
                  protocol: gettext('Protocol'),

                  adding: gettext('Adding...'),
                  editting: gettext('Editting...'),
                  deleting: gettext('Deleting...')
              },
              action: {
                  create: gettext('Add Switch'),
                  edit: gettext('Edit'),
                  delete: gettext('Delete Switches')
              },
              error: {
                  api: gettext('Unable to retrieve imagess'),
                  priviledge: gettext('Insufficient privilege level to view user information.')
              }
          };

          this.reset = function () {
              scope.iswitches = [];
              scope.switches = [];
              scope.switchState = false;

              scope.switch = [];
              scope.nodes = [];

              //scope.checked = {};
              //scope.selected = {};
              if (scope.selectedData) {
                  scope.selectedData.aData = [];
              }
          };

          // on load, if user has permission
          // fetch table data and populate it
          this.init = function () {
              self.refresh();
              scope.isAdding = false;
              scope.isEditting = false;
              scope.isDeleting = false;
          };

          this.refresh = function () {
              self.reset();
              //policyService.check({ rules: [['project', 'image:getdd_all']] })
              //.success(function (response) {
              //if (response.allowed) {
              switchAPI.getSwitches()
                .success(function (response) {
                    angular.element('#switches_all_checkbox').scope().specialReset();
                    var temp_count_id = 0;
                    angular.forEach(response.items, function (item) {

                        if (!item.id && item.id != 0) {
                            temp_count_id++;
                            item.id = temp_count_id;
                        }

                        ////////////////////mock/////////////////////////////////
                        //if (!item.hw_type) {
                        //    item.hw_type = 'G8272';
                        //}

                        //if (!item.protocol) {
                        //    item.protocol = 'REST';
                        //}
                        ////////////////////mock/////////////////////////////////

                    });

                    //for (var i = 0; i < 1000; i++) {
                    //    scope.switches.push(response.items[0]);
                    //}
                    scope.switches = response.items;
                    scope.switchState = true;

                    //switchAPI.getSwitch(scope.switches[0].uuid)
                    //    .success(function (response) {
                    //        scope.switch = response;

                    //        switchAPI.getNodes(scope.switch.uuid, scope.switch.pmswitch_id)
                    //            .success(function (response) {
                    //                scope.nodes = response.port_mapping;
                    //            })
                    //            .error(function (data) {
                    //                console.log(data);
                    //            });
                    //    })
                    //    .error(function (data) {
                    //        console.log(data);
                    //    });
                })
                .error(function (data) {
                    console.log(data);
                });
              //    }
              //    else if (horizon) {
              //        horizon.alert('info', scope.context.error.priviledge);
              //    }
              //});
          };

          scope.showPagination = function () {
              // get $$childHead first and then iterate that scope's $$nextSiblings
              var parentScope = angular.element('#switches_pagination').scope();

              for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
                  if (cs.pages && cs.pages.length > 1) {
                      return true;
                  }
              }
              return false;
          }

          scope.actions = {
              refresh: this.refresh,
              modal: new action(scope)
          };

          scope.filterFacets = [
                {
                    label: gettext('IP Address'),
                    name: 'ip',
                    singleton: true
                },
                {
                    label: gettext('Host Name'),
                    name: 'hostname',
                    singleton: true
                },
                {
                    label: gettext('OS Type'),
                    name: 'os_type',
                    singleton: true
                },
                {
                    label: gettext('Hardware Type'),
                    name: 'hw_type',
                    singleton: true
                },
                {
                    label: gettext('Protocol'),
                    name: 'protocol',
                    singleton: true
                }
          ];

          this.init();

      }]);
})();