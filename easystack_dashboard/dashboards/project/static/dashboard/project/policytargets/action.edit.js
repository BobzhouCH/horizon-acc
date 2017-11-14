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

  angular.module('hz.dashboard.project.policygroups')

  .factory('internalGroupEditAction', [
      'horizon.openstack-service-api.gbp', '$modal', 'backDrop',
      'horizon.framework.widgets.toast.service',
  function(GbpAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Internal Group'),
      submit:  gettext('Save'),
      success: gettext('Internal Group %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'internal-group-form/',
        controller: 'interlGroupFormCtrl',
        backdrop: backDrop,
        resolve: {
          policyTargetGroup: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the edit form
      self.open = function(groups) {
        var clone = angular.copy(groups[0]);
        option.resolve.policyTargetGroup = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(clone);
        });
      };

      // submit this action to api
      // and update router object on success
      self.submit = function(clone) {

        GbpAPI.updatePolicyTargetGroup(clone.id, clone)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            scope.actions.refresh();
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }])
  .factory('externalGroupEditAction', [
      'horizon.openstack-service-api.gbp', '$modal', 'backDrop',
      'horizon.framework.widgets.toast.service',
  function(GbpAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit External Group'),
      submit:  gettext('Save'),
      success: gettext('External Group %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'external-group-form/',
        controller: 'externalGroupFormCtrl',
        backdrop: backDrop,
        resolve: {
          extPolicyTargetGroup: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'routersListContent'
      };

      // open up the edit form
      self.open = function(groups) {
        var clone = angular.copy(groups[0]);
        option.resolve.extPolicyTargetGroup = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(clone);
        });
      };

      // submit this action to api
      // and update router object on success
      self.submit = function(clone) {

        GbpAPI.updateExtPolicyTarget(clone.id, clone)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            scope.actions.refresh();
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
