/**
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

  angular.module('hz.dashboard.settings.password')

  /**
   * @ngDoc editPasswordAction
   * @ngService
   *
   * @Description
   * Brings up the edit setting modal dialog.
   * On submit, edit user and display a success message.
   * On cancel, do nothing.
   */
  .factory('editPasswordAction', [
  	'horizon.openstack-service-api.keystone',
  	'$modal', 'backDrop',
  	'horizon.dashboard.settings.basepasswordPath',
    'horizon.framework.widgets.toast.service', 'logoutAction',
  function(keystoneAPI, modal, backDrop, path, toastService, LogoutAction) {

    var context = {
      title: 			gettext('Edit Password'),
      old_password: 	gettext('Old Password'),
      new_password: 	gettext('New Password'),
      confirm_password: gettext('Confirm Password'),
      submit:  			gettext('Save'),
      success: 			gettext('Password has been updated successfully. You need to login again.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 	path,
        controller: 	'formEditPasswordCtrl',
        backdrop:		backDrop,
        windowClass: 	'passwordContent',
        resolve: {
          pwd: 		function(){ return {}; },
          context: 	function(){ return context; }
        }
      };

      // open up the edit form
      self.open = function() {
          option.templateUrl = (window.WEBROOT || '') + 'settings/password';
          modal.open(option).result.then(self.submit);
      };

      var logout = new LogoutAction();
      // submit this action to api
      // and update pwd object on success
      self.submit = function(pwd) {
        keystoneAPI.updateUserOwnPassword(pwd)
          .success(function(response) {
            if (response.status == 403) {
              toastService.add('error', gettext("Old Password is Wrong"));
            } else {
              toastService.add('success', context.success);
              logout.open();
            }
          });
      };
    }

    return action;
  }]);

})();
