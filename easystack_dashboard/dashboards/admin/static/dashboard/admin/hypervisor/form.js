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

  angular.module('hz.dashboard.admin.hypervisor')

  /**
   * @ngdoc formKeyPairCtroller
   * @ng-controller
   *
   */
  .controller('computeHostFormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.nova', 'service', 'context',
    function(scope, modalInstance, novaAPI, service, context) {

      var action = {
        submit: function() { modalInstance.close(service); },
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      scope.context = context;
      scope.service = service;
      scope.action = action;

    }]);
})();