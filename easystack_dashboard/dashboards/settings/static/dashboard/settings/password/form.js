/**
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.identity.users')

  /**
   * @ngdoc formEditPasswordCtrl
   * @ng-controller
   *
   * @description
   * This controller is setting for the create and edit password form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('formEditPasswordCtrl', [
    '$scope', '$modalInstance', 'pwd', 'context',
    function(scope, modalInstance, pwd, context) {
    
      var action 	= {
        submit: function() { modalInstance.close(pwd); },
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      scope.context = context;
      scope.pwd 	= pwd;
      scope.action 	= action;
    }]);
})();