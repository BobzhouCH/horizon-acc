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
  .factory('createExternalConnectivityAction', [
        '$modal', 'backDrop',
        'horizon.openstack-service-api.gbp',
        'horizon.framework.widgets.toast.service',
  function(modal, backDrop, gbpAPI, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create External Connectivity'),
      submit:  gettext('Create'),
      success: gettext('External Connectivity %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this,
          option,
          clean;

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
          ip_version:               exter.ip_version.value,
          cidr:                     exter.cidr,
          external_routes:          exter.external_routes,
          subnet_id:                exter.subnet_id.id,
          port_address_translation: exter.port_address_translation,
          shared:                   exter.shared
        };
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(external) {
        var newClean = clean(external);

        gbpAPI.createExternalConnectivity(newClean)
         .success(function(response) {
            if(scope.actions && scope.actions.hasOwnProperty('refresh')){
              scope.actions.refresh();
            }else{
              if(scope.extConns){
                scope.extConns.push(response);
              }
            }
            scope.$parent.$broadcast('externalRefresh');
            var message = interpolate(context.success, [newClean.name]);
            toastService.add('success', message);
         });
      };
    }

    return action;
  }]);

})();
