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
  .factory('addExternalRouteParameterAction', [
        '$modal', 'backDrop',
        'horizon.openstack-service-api.gbp',
        'horizon.framework.widgets.toast.service',
  function(modal, backDrop, gbpAPI, toastService) {

    var context = {
      mode: 'add',
      title: gettext('Add External Route Parameter'),
      submit:  gettext('Add'),
      success: gettext('External Route Parameter %s was successfully added.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this,
          option,
          clean,
          external_routes = [];

      option = {
        templateUrl: 'external_connectivity_form/',
        controller: 'addExternalRouteParameterFormCtrl',
        backdrop:   backDrop,
        windowClass: 'routersListContent',
        resolve: {
          route_parameter: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      clean = function(parameter){
        var para = parameter;
        return {
          destination:      para.destination,
          nexthop:         para.next_hop
        };
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(parameter) {

        var newClean = clean(parameter);

        external_routes.push(newClean);

        scope.external_routes = external_routes;
      };
    }

    return action;
  }]);

})();
