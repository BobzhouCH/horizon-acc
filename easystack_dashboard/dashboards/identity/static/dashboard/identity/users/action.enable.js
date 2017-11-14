/**
 * Copyright 2015 EasyStack Inc.
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

  angular.module('hz.dashboard.identity.users')

  /**
   * @ngDoc enableAction
   * @ngService
   *
   * @Description
   * Allow admin to enable or disable a user.
   */
  .factory('enableAction', ['horizon.openstack-service-api.keystone', 'horizon.framework.widgets.toast.service',
  function(keystoneAPI, toastService) {

    var context = {
      enabledSuccess: gettext('Enabled user %s.'),
      disabledSuccess: gettext('Disabled user %s.'),
      enabledError: gettext('Unable to enable user %s.'),
      disabledError: gettext('Unable to disable user %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      this.toggle = function(users) {
        var user = users[0];
        // we modify a cloned object and give that to the api
        // if api confirms it, then we update the real model
        var clone = angular.copy(user);
        clone.enabled = !clone.enabled;

        keystoneAPI.editUser(clone)
          .success(function() {
            var message = user.enabled ? context.disabledSuccess : context.enabledSuccess;
            user.enabled = !user.enabled;
            keystoneAPI.userIsDomainAdmin(user.id, user.domain_id)
              .success(function(response){
                if(response){
                  user['is_domain_admin'] = true;
                }
              });
            toastService.add('success', interpolate(message, [user.name]));

            scope.$table.resetSelected();
            scope.enabled             = true;
            scope.activate            = true;
          });
      };
    }

    return action;

  }]);

})();