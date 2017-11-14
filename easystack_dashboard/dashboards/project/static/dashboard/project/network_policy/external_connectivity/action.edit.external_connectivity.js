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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the create router modal dialog.
   * On submit, create a new router and display a success message.
   * On cancel, do nothing.
   */
  .factory('editExternalConnectivityAction', [
        '$modal',
        'backDrop',
        'horizon.openstack-service-api.gbp',
        'horizon.framework.widgets.toast.service',
  function(modal, backDrop, gbpAPI, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit External Connectivity'),
      submit:  gettext('Edit'),
      success: gettext('External connectivity %s was successfully edit.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this,
          clean,
          option = {
            templateUrl: 'external_connectivity_form/',
            controller: 'externalConnectivityFormCtrl',
            backdrop:   backDrop,
            windowClass: 'routersListContent',
            resolve: {
              external: function(){ return {}; },
              context: function(){ return context; }
            }
          };

      clean = function(external){
        var exter = external;
        return {
          name:                     exter.name,
          description:              exter.description,
          shared:                   exter.shared
        };
      };

      self.open = function(singleExternal){
        var newSingleExternal = angular.copy(singleExternal[0]);
        option.resolve.external = function(){ return newSingleExternal; };
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(externals) {

        var newExternal = clean(externals);

        gbpAPI.updateExternalConnectivity(externals.id, newExternal)
          .success(function(response) {
            scope.$parent.$broadcast('externalRefresh');
            var message = interpolate(context.success, [newExternal.name]);
            toastService.add('success', message);
          });
      };
    }

    return action;
  }]);

})();
