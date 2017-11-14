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
        '$modal',
        'backDrop',
        'horizon.openstack-service-api.gbp',
        'horizon.framework.widgets.toast.service',
  function(modal, backDrop, gbpAPI, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create NAT Pool'),
      submit:  gettext('Create'),
      success: gettext('NAT pool %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'natPoolFormCtrl',
        backdrop:   backDrop,
        windowClass: 'routersListContent',
        resolve: {
          natPool: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(natPools) {

        natPools.ip_version = natPools.ip_version.value;
        natPools.external_segment_id = natPools.external_segment_id.id;

        gbpAPI.createNatPool(natPools)
          .success(function(response) {
            scope.$parent.$broadcast('natRefresh');
            var message = interpolate(context.success, [natPools.name]);
            toastService.add('success', message);
          });
      };
    }

    return action;
  }]);

})();
