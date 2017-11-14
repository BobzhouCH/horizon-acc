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

  angular.module('hz.dashboard.project.network_policy')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create router modal dialog.
   * On submit, create a new router and display a success message.
   * On cancel, do nothing.
   */
  .factory('createNatPoolAction', [
        'horizon.openstack-service-api.fwaas', '$modal', 'backDrop',
        'horizon.framework.widgets.toast.service',
  function(fwaasAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create Firewall'),
      submit:  gettext('Create'),
      success: gettext('Firewall %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'firewallFormCtrl',
        backdrop:		backDrop,
        windowClass: 'routersListContent',
        resolve: {
          firewall: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newFirewall) {
        fwaasAPI.createFirewall(newFirewall)
          .success(function(response) {
            scope.$parent.$broadcast('firewallRefresh');
            var message = interpolate(context.success, [newFirewall.name]);
            toastService.add('success', message);
          });
      };
    }

    return action;
  }]);

})();
