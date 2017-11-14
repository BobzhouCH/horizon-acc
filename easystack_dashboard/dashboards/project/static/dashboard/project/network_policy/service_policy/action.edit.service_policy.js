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
  .factory('editServicePolicyAction', [
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
            templateUrl: 'service_policy_form/',
            controller: 'servicePolicyFormCtrl',
            backdrop:   backDrop,
            windowClass: 'routersListContent',
            resolve: {
              service_policy: function(){ return {}; },
              context: function(){ return context; }
            }
          };

      clean = function(policys){
        var policy = policys;
        return {
          name:                     policy.name,
          description:              policy.description,
          shared:                   policy.shared
        };
      };

      self.open = function(singlePolicy){
        var newSinglePolicy = angular.copy(singlePolicy[0]);
        option.resolve.service_policy = function(){ return newSinglePolicy; };
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(policys) {

        var newPolicy = clean(policys);

        gbpAPI.updateNetworkServicePolicy(policys.id, newPolicy)
          .success(function(response) {
            scope.$parent.$broadcast('servicePolicyRefresh');
            var message = interpolate(context.success, [newPolicy.name]);
            toastService.add('success', message);
          });
      };
    }

    return action;
  }]);

})();
