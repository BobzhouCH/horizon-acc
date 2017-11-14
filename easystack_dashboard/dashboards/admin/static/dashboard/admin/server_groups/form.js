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

angular.module('hz.dashboard.admin.server_groups')

/**
* @ngdoc alarmFormCtrl
* @ng-controller
*
* @description
* This controller is use for the create and edit user form.
* Refer to angular-bootstrap $modalInstance for further reading.
*/
.controller('formServerGroupCtroller', [
'$scope', '$modalInstance', 'serverGroup', 'context',
function(scope, modalInstance, serverGroup, context) {
  scope.disable = false;
  var dropdown = {};
  var action = {
	submit: function() { modalInstance.close(serverGroup); scope.disable = true; },
	cancel: function() { modalInstance.dismiss('cancel'); scope.disable = true; }
  };

  scope.dropdown = dropdown;
  scope.context = context;
  scope.serverGroup = serverGroup;
  scope.action = action;

}])


})();
