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

    /**
     * @ngdoc hz.dashboard.settings
     * @ngModule
     *
     * @description
     * Dashboard module to host various settings panels.
     */
    angular
      .module('hz.dashboard.lenovo.header')
      .controller('alarmCtrl', ['$scope', '$rootScope', 'horizon.openstack-service-api.alarm', 'horizon.openstack-service-api.keystone',
        function (scope, rootScope, alarmAPI, keystoneAPI) {

            var self = this;

            scope.resourceAlarmCount = 0;
            scope.hardwareAlarmCount = 0;
            //scope.showHardwareAlarm = false;

            self.refresh = function () {

                keystoneAPI.getCloudAdmin()
                  .success(function (result) {
                      if (result == true) {
                          //scope.showHardwareAlarm = true;

                          alarmAPI.getHardwareAlarms()
                              .then(function (response) {
                                  scope.hardwareAlarmCount = response;
                              });
                      }
                  });

                alarmAPI.getResourceAlarms()
                  .then(function (response) {
                      scope.resourceAlarmCount = response;
                  });
            }

            setInterval(self.refresh, 3000 * 100);

            scope.dropdownEnter = function (event) {
                //console.log("AHAHAH");
                //$(event.target).dropdown();
                $(event.target).dropdown('toggle');
                //$('.dropdown-toggle').dropdown();
            };

            rootScope.$on("updateAlarm", function (event, data) {
                self.refresh();
            });

            self.refresh();
        }]);
})();
