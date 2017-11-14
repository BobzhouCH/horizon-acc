/**
 * Copyright 2015 IBM Corp.
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

  angular.module('hz.dashboard.project.policygroups')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create image modal dialog.
   * On submit, create a new image and display a success message.
   * On cancel, do nothing.
   */
  .factory('internalGroupCreateAction', ['horizon.openstack-service-api.gbp',
      '$modal', 'backDrop',
  function(gbpAPI, modal, backdrop) {

    var context = {
      mode: 'create',
      title: gettext('Create Internal Group'),
      submit:  gettext('Create'),
      success: gettext('Internal Group %s was successfully created.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'internal-group-form/',
        controller: 'interlGroupFormCtrl',
        windowClass: 'instancesListContent',
        backdrop: backdrop,
        resolve: {
          policyTargetGroup: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(policyTargetGroup) {
        gbpAPI.createPolicyTargetGroup(policyTargetGroup)
          .success(function(response) {
            //scope.bays.push(response);
            scope.actions.refresh();
            var message = interpolate(context.success, [policyTargetGroup.name]);
            horizon.alert('success', message);
            horizon.autoDismissAlerts();
          });
      };

    }

    return action;
  }])
  .factory('externalGroupCreateAction', ['horizon.openstack-service-api.gbp',
      '$modal', 'backDrop',
  function(gbpAPI, modal, backdrop) {

    var context = {
      mode: 'create',
      title: gettext('Create External Group'),
      submit:  gettext('Create'),
      success: gettext('External Group %s was successfully created.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'external-group-form/',
        controller: 'externalGroupFormCtrl',
        windowClass: 'instancesListContent',
        backdrop: backdrop,
        resolve: {
          extPolicyTargetGroup: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(extPolicyTargetGroup) {
        gbpAPI.createExtPolicyTarget(extPolicyTargetGroup)
          .success(function(response) {
            //scope.bays.push(response);
            scope.actions.refresh();
            var message = interpolate(context.success, [extPolicyTargetGroup.name]);
            horizon.alert('success', message);
            horizon.autoDismissAlerts();
          });
      };

    }

    return action;
  }]);

})();
