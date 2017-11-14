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

  angular.module('hz.dashboard.admin.invcodes')

  /**
   * @ngdoc formInvCodeController
   * @ng-controller
   *
   */
  .controller('formInvCodeController', [
    '$scope', '$timeout', '$modalInstance', 'horizon.openstack-service-api.billing', 'context', "enable_billing",
    function(scope, timeout, modalInstance, novaAPI, context, enable_billing) {

      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(scope.invcode);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };
      scope.enable_billing = enable_billing;
      scope.dropdown = dropdown;
      scope.context = context;
      scope.invcode = {}
      scope.action = action;
      scope.valid_worth = true;

      var timer;
      scope.checkWorth = function() {
        timeout.cancel( timer );
        timer = timeout(function() {
          var reg = new RegExp('^(0|[1-9][0-9]*)(\.[0-9]{0,2})?$', "gi");
          if(reg.test(scope.invcode.worth)){
            if (scope.invcode.worth > 0) {
              scope.valid_worth = true;
            }else {
              scope.valid_worth = false;
            }
          }else {
            scope.valid_worth = false;
          }
        }, 500);

      };

      $(document).on('focus', '.form_datetime, .datepicker', function() {
        var date = new Date();
        var startDate = new Date(date.getTime() + 3600000);
        $(".form_datetime, .datepicker").datetimepicker({
          format: 'yyyy-mm-dd hh:ii:ss',
          language: 'zh-CN',
          startView: 2,
          minView: 1,
          autoclose: true,
          startDate: startDate
        });
      });

    }
  ]);
})();