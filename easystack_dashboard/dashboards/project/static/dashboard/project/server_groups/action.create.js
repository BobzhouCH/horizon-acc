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

  angular.module('hz.dashboard.project.server_groups')

  /**
   * @ngDoc createAction
   * @ngService
   *
   */
  .factory('createServerGroupAction',
      ['horizon.openstack-service-api.nova',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       '$modal',
       'backDrop',
       'horizon.framework.widgets.toast.service',
  function(novaAPI, usersettingAPI, keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create ServerGroup'),
      submit:  gettext('Create'),
      success: gettext('ServerGroup %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'formServerGroupCtroller',
        backdrop: backDrop,
        windowClass: 'RowContent',
        resolve: {
          context: function(){ return context; },
          serverGroup: function(){ return {}; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newServerGroup) {
        novaAPI.createServerGroup(newServerGroup)
          .success(function(response) {
            scope.servergroups.push(response);
            var message = interpolate(context.success, [response.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }
    return action;
  }]);

})();
