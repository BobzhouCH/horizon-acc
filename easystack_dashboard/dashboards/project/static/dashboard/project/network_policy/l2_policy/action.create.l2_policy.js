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
  .factory('createl2PolicyAction', [
        '$modal',
        'backDrop',
        'horizon.openstack-service-api.gbp',
        'horizon.framework.widgets.toast.service',
  function(modal, backDrop, gbpAPI, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create L2 Policy'),
      submit:  gettext('Create'),
      success: gettext('L2 Policy %s was successfully created.')
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

      self.open = function(table){
        if(table){
          table.resetSelected();
        }
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(policys) {
        var newClean = clean(policys);

        gbpAPI.createL2Policy(newClean)
          .success(function(response) {
            scope.$parent.$broadcast('l2policyRefresh');
            var message = interpolate(context.success, [newClean.name]);
            toastService.add('success', message);
          });
      };
    }

    return action;
  }]);

})();