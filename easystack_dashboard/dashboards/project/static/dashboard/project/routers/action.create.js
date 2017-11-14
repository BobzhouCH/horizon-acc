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

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create router modal dialog.
   * On submit, create a new router and display a success message.
   * On cancel, do nothing.
   */
  .factory('createRouterAction', [
        'horizon.openstack-service-api.neutron',
        'horizon.openstack-service-api.usersettings',
        'horizon.openstack-service-api.keystone',
        '$modal', 'backDrop',
        'horizon.framework.widgets.toast.service', 'horizon.dashboard.router.Path',
  function(neutronAPI, usersettingAPI, keystoneAPI, modal, backDrop, toastService, path) {

    var context = {
      mode: 'create',
      title: gettext('Create Router'),
      submit:  gettext('Create'),
      success: gettext('Router %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: path+ 'form/',
        controller: 'routerFormCtrl',
        backdrop:		backDrop,
        windowClass: 'routersListContent',
        resolve: {
          router: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        context.mode = 'createRouter';
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newRouter) {
        neutronAPI.createRouter(newRouter)
          .success(function(response) {
            scope.routers.push(response);
            var message = interpolate(context.success, [newRouter.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
