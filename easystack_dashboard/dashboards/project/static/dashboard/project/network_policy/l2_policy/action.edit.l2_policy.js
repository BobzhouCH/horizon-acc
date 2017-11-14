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
  .factory('editL2PolicyAction', [
        '$modal',
        'backDrop',
        'horizon.openstack-service-api.gbp',
        'horizon.framework.widgets.toast.service',
  function(modal, backDrop, gbpAPI, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit L2 Policy'),
      submit:  gettext('Edit'),
      success: gettext('L2 Policy %s was successfully edited.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this,
          option,
          clean;

      option = {
        templateUrl: 'l2_policy_form/',
        controller: 'l2PolicyFormCtrl',
        backdrop:   backDrop,
        windowClass: 'routersListContent',
        resolve: {
          policy: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      clean = function(policys){
        var policy = policys;
        return {
          name:                     policy.name,
          description:              policy.description,
          l3_policy_id:             policy.l3_policy_id.id,
          inject_default_route:     policy.inject_default_route
        };
      };

      self.open = function($table){
        var l2Policy;
        self.$table = $table;
        l2Policy = angular.copy($table.$scope.selectedData.aData[0]);
        option.resolve.policy = function(){ return l2Policy; };
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(l2policy) {
        var newClean = clean(l2policy);
        gbpAPI.updateL2Policy(l2policy.id, newClean)
          .success(function(response) {
            var message;
            scope.$parent.$broadcast('l2policyRefresh');
            self.$table.resetSelected();
            message = interpolate(context.success, [newClean.name]);
            toastService.add('success', message);
          });
      };
    }

    return action;
  }]);

})();
