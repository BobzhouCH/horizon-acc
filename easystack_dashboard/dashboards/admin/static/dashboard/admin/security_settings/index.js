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

    angular.module('hz.dashboard.admin.security_settings')

    /**
     * @ngdoc projectImagesCtrl
     * @ngController
     *
     * @description
     * Controller for the project images table.
     * Serve as the focal point for table actions.
     */
    .controller('adminSecuritySettingsCtrl', [
      '$scope', 'horizon.dashboard.admin.security_settings.Path', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.security', 'horizon.framework.widgets.toast.service',
      function (scope, path, policyService, securityAPI, toastService) {
          var self = this;
          var result = {};
          scope.observing_time = 0;
          scope.locking_time = 0;
          scope.limit_times = 0;
          scope.is_activated = true;
          scope.action = {
              submit: function () {
                  result.observing_time = scope.observing_time;
                  result.locking_time = scope.locking_time;
                  result.limit_times = scope.limit_times;
                  result.is_activated = scope.is_activated;
                  self.submitSecuritySettings(result);
              }
          };

          scope.label = {
              save: gettext('SAVE')
          };

          this.init = function () {
              securityAPI.getLocalSettings()
                .success(function(response){
                      scope.observing_time = parseInt(response.items.observation);
                      scope.locking_time = parseInt(response.items.lockTime);
                      scope.limit_times = parseInt(response.items.lockCount);
                      scope.is_activated = true;
                  })
                .error(function (data) {
                  });
          };

          self.submitSecuritySettings = function (result) {

              securityAPI.editLocalSettings({obsv: result.observing_time, loct: result.locking_time, locc: result.limit_times})
                  .success(function(data){
                      if (data && data.status && data.status == 'success') {
                          toastService.add('success', gettext('Successfully edit localSetting!'));
                      } else {
                          toastService.add('error', gettext('Edit localSetting failed.') + ' ' + data.msg);
                      }
                  });

          };

          this.init();

      }]);
})();