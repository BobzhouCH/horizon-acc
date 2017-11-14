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

    angular.module('hz.dashboard.lenovo.ha_management')

    .controller('lenovoHAManagementCtrl', [
      '$scope', '$rootScope', 'horizon.dashboard.lenovo.ha_management.Path', '$modal', 'bytesFilter', 'horizon.openstack-service-api.uus', 'horizon.openstack-service-api.policy', 'editComputeHAAction',
      function (
        scope, rootScope, path, modal, bytesFilter, uusAPI, policyService, editComputeHAAction
         ) {
          var self = this;

          scope.context = {
              header: {
                  hostname: gettext('Host Name'),
                  role: gettext('Role'),
                  HAStatus: gettext('HA Managed'),
                  auth: gettext('Authenticate'),
                  ip: gettext('Ip Address'),
                  product: gettext('Product'),
                  machine: gettext('Machine Type'),
                  serial: gettext('Serial Number'),
                  action: gettext('Action'),

                  name: gettext('Name'),
                  image_type: gettext('Type'),
                  is_public: gettext('Public'),
                  disk_format: gettext('Format'),
                  size: gettext('Image Size'),
                  HAService: gettext('Compute HA Service:'),
              },
              action: {
                  config: gettext('Configure'),
                  enableHAService: gettext('Enable'),
                  disableHAService: gettext('Disable'),
              }
          };

          scope.hastatus = {
              "yes": gettext("Yes"),
              "no": gettext("No"),
              "NA": gettext("NA")
          };

          scope.authDecode = {
            true: gettext("Authed"),
            false: gettext("UnAuth"),
            null:gettext("UnAuth")
          };

          scope.haServiceStatusMapping = {
              null: gettext("Unknown"),
              0 : gettext("Disabled"),
              1 : gettext("Enabled")
          };

          scope.haServiceStatusImgMapping = {
              null: 'lenovo/img/ac16_powerOFF_24.png',
              0 : 'lenovo/img/ac16_powerOFF_24.png',
              1 : 'lenovo/img/ac16_power_24.png',
          }

          this.reset = function () {
              scope.iservers = [];
              scope.servers = [];
              scope.tmpServers = [];
              scope.haServiceStatus = null;
              scope.servers_map = {};
              scope.haenablelist = {};
              scope.serverState = false;
          };

          this.init = function () {
              self.refresh();
          };

          this.refresh = function () {
              self.reset();
              policyService.check({
                  rules: [
                      ['project', 'image:get_all']
                  ]
              })
              .success(function (response) {
                      if (response.allowed) {
                          uusAPI.getHosts()
                              .success(function (response) {
                                  var rolename_dict = {
                                              "controller": gettext('Controller'),
                                              "compute": gettext('Compute'),
                                              "storage": gettext('Storage'),
                                              "cinder": gettext('Cinder'),
                                              "elk": gettext('ELK'),
                                              "neutron-l3": gettext('Neutron L3'),
                                              "mongo": gettext('MongoDB'),
                                              "zabbix-server": gettext('Zabbix Server'),
                                              "ceph-osd": gettext('Ceph OSD'),
                                              "swift-proxy": gettext('Swift Proxy'),
                                              "undefined": gettext('Unknown'),
                                              "other": gettext('Other')
                                          };

                                  for (var i = 0; i < response.items.length; i++) {
                                      var currentItem = response.items[i];
                                      var server = {};
                                      //followed info retrieve for data only
                                      server.bmcip = response.items[i].bmcip;
                                      server.type = response.items[i].type;
                                      server.https_enabled = response.items[i].https_enabled;
                                      //
                                      server.id = response.items[i].uuid;
                                      server.hostname = response.items[i].hostname;

                                      //ROLE distribute
                                      var translatedRoles = [];
                                      for (var j = 0; j < currentItem.role_names.length; j++) {
                                          var originalRole = currentItem.role_names[j];
                                          translatedRoles.push(rolename_dict[originalRole]);
                                      }
                                      var translatedRoleString = translatedRoles.join(' / ');
                                      server.role = translatedRoleString;
                                      server.authed = response.items[i].authed;
                                      if (server.authed) {
                                          server.hastatusimg = 'lenovo/img/st16_unknown_24.png';
                                          server.hastatus = 'no';
                                      } else {
                                          server.hastatusimg = 'lenovo/img/st16_na_24.png';
                                          server.hastatus = 'NA';
                                      }
                                      server.ip = response.items[i].hostip;
                                      server.product = response.items[i].productname;
                                      server.machine = response.items[i].mt;
                                      server.serial = response.items[i].sn;
                                      if (currentItem.role_names && currentItem.role_names.contains('compute')) {
                                          scope.tmpServers.push(server);
                                          scope.servers_map[server.hostname] = server;
                                      }
                                  }

                                  uusAPI.getComputeHA()
                                      .success(function (response) {
                                          scope.haServiceStatus = response.status;
                                          scope.haenablelist = response.enabled_list;
                                          $.each(response.enabled_list, function (k,v) {
                                              $.each(v, function (i,host_name) {
                                                  if (scope.servers_map[host_name] !== undefined) {
                                                      scope.servers_map[host_name].hastatus = 'yes';
                                                      scope.servers_map[host_name].hastatusimg = 'lenovo/img/success.png';
                                                  }
                                             });
                                          });
                                          scope.servers = scope.tmpServers;
                                          scope.serverState = true;
                                      });
                              });

                      } else if (horizon) {
                          horizon.alert('info', scope.context.error.priviledge);
                      }
                  });
          };

          scope.actions = {
              refresh: this.refresh,
              operate: new editComputeHAAction(scope),
          };

          scope.filterFacets = [
                {
                    label: gettext('Host Name'),
                    name: 'hostname',
                    singleton: true
                },
                {
                    label: gettext('HA Status'),
                    name: 'hastatus',
                    singleton: true
                },
                {
                    label: gettext('Ip Address'),
                    name: 'ip',
                    singleton: true
                },
                {
                    label: gettext('Product'),
                    name: 'product',
                    singleton: true
                },
                {
                    label: gettext('Machine Type'),
                    name: 'machine',
                    singleton: true
                },
                {
                    label: gettext('Serial Number'),
                    name: 'serial',
                    singleton: true
                }
          ];

          this.init();

      }]);

})();
