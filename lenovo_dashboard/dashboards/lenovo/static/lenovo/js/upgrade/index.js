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

    angular.module('hz.dashboard.lenovo.upgrade')

    /**
     * @ngdoc lenovoUpgradesCtrl
     * @ngController
     *
     * @description
     * Controller for the project images table.
     * Serve as the focal point for table actions.
     */
    .controller('lenovoUpgradesCtrl', [
      '$modal', 'horizon.dashboard.lenovo.upgrade.Path', '$scope', 'horizon.openstack-service-api.policy', 'horizon.framework.widgets.toast.service',
            'horizon.openstack-service-api.upgrade',
      function (modall, path, scope, policyService, toastService, upgradeAPI) {
          var self = this;

          scope.iupgrades = [];
          scope.upgrades = [];
          scope.upgradeState = false;

          scope.context = {
              action: {
                  upgrade: gettext('Upgrade')
              },
              error: {
                  api: gettext('Unable to retrieve upgrade records'),
                  priviledge: gettext('Insufficient privilege level to view user information.')
              }
          };

          scope.statusDecode = {
            "Finished": gettext("Finished"),
            "Rollingback": gettext("Rollingback"),
            "Updating": gettext("Updating"),
          };

          scope.resultDecode = {
            "Success": gettext("Success"),
            "Failed": gettext("Failed"),
            "null": gettext("null"),
          };

          this.reset = function () {
              scope.iupgrades = [];
              scope.upgrades = [];
              scope.upgradeState = false;

              if (scope.selectedData) {
                  scope.selectedData.aData = [];
              }
          };

          // on load, if user has permission
          // fetch table data and populate it
          this.init = function () {
              self.refresh();
              self.startUpdateStatus(3000);
          };

          this.refresh = function () {
              self.reset();
              upgradeAPI.getUpgrades()
                .success(function (response) {
                    //angular.element('#upgrades_all_checkbox').scope().specialReset();
                    var temp_count_id = 0;
                    angular.forEach(response.items, function (item) {

                        if (!item.id && item.id != 0) {
                            temp_count_id++;
                            item.id = temp_count_id;
                        }
                    });

                    scope.upgrades = response.items;
                    scope.upgradeState = true;

                })
                .error(function (data) {
                    console.log(data);
                });
          };

          this.startUpdateStatus = function (interval) {
            var statusList = ["Updating","Rollingback"];
            function checkStatus() {
                var upgrades = scope.upgrades;
                for (var i = 0; i < upgrades.length; i++) {
                    var upgrade = upgrades[i];
                    if (statusList.contains(upgrade.status)) {
                        self.refresh();
                    }
                }
            }

            setInterval(checkStatus, interval);
          };

          scope.showPagination = function () {
              // get $$childHead first and then iterate that scope's $$nextSiblings
              var parentScope = angular.element('#upgrades_pagination').scope();

              for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
                  if (cs.pages && cs.pages.length > 1) {
                      return true;
                  }
              }
              return false;
          }

          scope.actions = {
              refresh: this.refresh
          };

          var upgradeOption = {
              templateUrl: path + 'upgrade/start/',
              controller: 'lenovoUpgradeStartController',
              windowClass: 'neutronListContent',
              resolve: {
                  upgradeData: function () {

                  }
              }
          };

          self.submit = function (data) {
              if (data && data.status && data.status == 'success') {
                  toastService.add('success', gettext(data.msg));
              }
              if (data && data.status && data.status == 'failed') {
                  toastService.add('error', gettext(data.msg));
              }
              self.refresh();
          }

          scope.start_up = function () {
               modall.open(upgradeOption).result.then(self.submit);
          };

          scope.filterFacets = [
              {
                  label: gettext('ID'),
                  name: 'id',
                  singleton: true
              },
              {
                  label: gettext('Upgrade Version'),
                  name: 'upgradeVersion',
                  singleton: true
              },
              {
                  label: gettext('Previous Version'),
                  name: 'previousVersion',
                  singleton: true
              },
              {
                  label: gettext('Upgrade Status'),
                  name: 'status',
                  singleton: true,
                  options: [
                  {label:scope.statusDecode['Finished'], key: 'Finished'},
                  {label:scope.statusDecode['Rollingback'], key: 'Rollingback'},
                  {label:scope.statusDecode['Updating'], key: 'Updating'}
                  ]
              },
              {
                  label: gettext('Upgrade Result'),
                  name: 'result',
                  singleton: true,
                  options: [
                  {label:scope.resultDecode['Success'], key: 'Success'},
                  {label:scope.resultDecode['Failed'], key: 'Failed'},
                  {label:scope.resultDecode['null'], key: 'null'}
                  ]
              },
              {
                  label: gettext('Timestamp'),
                  name: 'timestamp',
                  singleton: true
              }
          ];

          this.init();

      }]);
})();