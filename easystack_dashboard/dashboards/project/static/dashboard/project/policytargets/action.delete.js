/**
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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

  .factory('internalGroupDeleteAction', ['horizon.openstack-service-api.gbp',
      'horizon.framework.widgets.modal.service', 'horizon.framework.widgets.toast.service',
    function(GbpAPI, smodal, toastService) {

      var context = {
      title: gettext('Delete Internal Group'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Internal Group'),
      success: gettext('Deleted Internal Groups: %s.'),
      error: gettext('Deleted Internal Groups: %s.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;

      // delete selected image objects
      // action requires the image to select rows
      self.batchDelete = function() {
        var groups = [];
        var names = [];
        angular.forEach(scope.selected, function(row) {
          if (row.checked){
            groups.push(row.item);
            names.push('"'+ row.item.name +'"');
          }
        });
        self.confirmDelete(groups, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(groups, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: groups,
          imgOwner: "noicon",
        };
        smodal.modal(options).result.then(function(){
          self.submit(groups, names);
        });
      };

      // on success, remove the images from the model
      // need to also remove deleted images from selected list
      self.submit = function(groups, names) {
        for (var i = 0; i < groups.length; i++) {
          self.deleteAction(groups[i].id, groups[i].name);
        }
      };

      self.deleteAction = function(id, group) {
        var self = this;
        self.group = group;
        GbpAPI.deletePolicyTargetGroup(id)
          .success(function(result) {
            var message = interpolate(context.success, [group]);
            toastService.add('success', message);
            scope.actions.refresh();
            scope.$table.resetSelected();
          })
          .error(function() {
            var message = interpolate(context.error, [group]);
            horizon.alert('error', message);
          });
      };
    }

      return action;

    }
  ])
  .factory('externalGroupDeleteAction', ['horizon.openstack-service-api.gbp',
      'horizon.framework.widgets.modal.service', 'horizon.framework.widgets.toast.service',
    function(GbpAPI, smodal, toastService) {

      var context = {
      title: gettext('Delete External Group'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete External Group'),
      success: gettext('Deleted External Groups: %s.'),
      error: gettext('Deleted External Groups: %s.')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;

      // delete selected image objects
      // action requires the image to select rows
      self.batchDelete = function() {
        var groups = [];
        var names = [];
        angular.forEach(scope.selected, function(row) {
          if (row.checked){
            groups.push(row.item);
            names.push('"'+ row.item.name +'"');
          }
        });
        self.confirmDelete(groups, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(groups, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: groups,
          imgOwner: "noicon",
        };
        smodal.modal(options).result.then(function(){
          self.submit(groups, names);
        });
      };

      // on success, remove the images from the model
      // need to also remove deleted images from selected list
      self.submit = function(groups, names) {
        for (var i = 0; i < groups.length; i++) {
          self.deleteAction(groups[i].id, groups[i].name);
        }
      };

      self.deleteAction = function(id, group) {
        var self = this;
        self.group = group;
        GbpAPI.deleteExtPolicyTarget(id)
          .success(function(result) {
            var message = interpolate(context.success, [group]);
            toastService.add('success', message);
            scope.actions.refresh();
            scope.$table.resetSelected();
          })
          .error(function() {
            var message = interpolate(context.error, [group]);
            horizon.alert('error', message);
          });
      };
    }

      return action;

    }
  ]);

})();
