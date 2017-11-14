/**
 * Copyright 2015 EasyStack Corp.
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

  angular.module('hz.dashboard.admin.instance_snapshots')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('deleteInstanceSnapshotAdminAction',
      ['horizon.openstack-service-api.glance',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(glanceAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Instance Snapshot'),
      message: gettext('The amount of instance snapshots these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Instance Snapshot'),
      success: gettext('Deleted Instance Snapshot: %s.'),
      error: gettext('Deleted Instance Snapshot: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single keypair object
      self.singleDelete = function (snapshot) {
        self.confirmDelete([snapshot.name], [snapshot.name]);
      };

      // delete selected keypair objects
      // action requires the keypair to select rows
      self.batchDelete = function () {
        var snapshots = [], names = [];
        angular.forEach(scope.selected, function (row) {
          if (row.checked) {
            snapshots.push(row.item);
            names.push('"' + row.item.name + '"');
          }
        });
        self.confirmDelete(snapshots, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function (snapshots, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: snapshots,
          imgOwner: 'instance_snapshot'
        };
        smodal.modal(options).result.then(function () {
          self.submit(snapshots);
        });
      };

      // on success, remove the keypairs from the model
      // need to also remove deleted keypairs from selected list
      self.submit = function (snapshots) {
        for (var n = 0; n < snapshots.length; n++) {
          self.deleteInstanceSnapshot(snapshots[n]);
        }
        scope.$table.resetSelected();
      };

      self.deleteInstanceSnapshot = function (snapshot) {
        glanceAPI.deleteSnapshot(snapshot.id)
            .success(function () {
              var message = interpolate(context.success, [snapshot.name]);
              toastService.add('success', message);
              scope.instances.removeId(snapshot.id);
              delete scope.selected[snapshot.id];
            });
      };
    }
    return action;

  }]);

})();
