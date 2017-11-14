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

  angular.module('hz.dashboard.identity.domains')

  /**
   * @ngDoc enableAction
   * @ngService
   *
   * @Description
   * Allow admin to enable or disable a domain.
   */
  .factory('enableDomainAction', ['horizon.openstack-service-api.keystone', 'horizon.framework.widgets.toast.service',
  function(keystoneAPI, toastService) {

    var context = {
      enabledSuccess: gettext('Enabled domain %s.'),
      disabledSuccess: gettext('Disabled domain %s.'),
      enabledError: gettext('Unable to enable domain %s.'),
      disabledError: gettext('Unable to disable domain %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      this.toggle = function(domains) {
        var domain = domains[0];
        // we modify a cloned object and give that to the api
        // if api confirms it, then we update the real model
        var clone = angular.copy(domain);
        clone.enabled = !clone.enabled;

        keystoneAPI.editDomain(clone)
          .success(function() {
            var message = domain.enabled ? context.disabledSuccess : context.enabledSuccess;
            domain.enabled = !domain.enabled;
            toastService.add('success', interpolate(message, [domain.name]));
            scope.clearSelected();
          });
      };
    }

    return action;

  }]);

})();