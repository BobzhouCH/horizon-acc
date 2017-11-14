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

  angular.module('hz.dashboard.project.volume_snapshots')

  /**
   * @ngdoc snapshotsVolumeFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for update volume snapshot status form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('volumeSnapshotsStatusFormCtrl', ['$scope', '$modalInstance',
    'snapshot', 'context', '$rootScope', 'horizon.dashboard.volume_snapshot.enum.STATUS',
    function(scope, modalInstance, snapshot, context, rootScope, snapshotStatus) {

      scope.volumeSnapshotStatus = {
        'available': gettext("Available"),
        'in-use': gettext("In use"),
        'error': gettext("Error"),
        'creating': gettext("Creating"),
        'error_extending': gettext("Error Extending"),
        'extending': gettext("Extending"),
        'attaching': gettext("Attaching"),
        'detaching': gettext("Detaching"),
        'deleting': gettext("Deleting"),
        'error_deleting': gettext("Error Deleting"),
        'backing-up': gettext("Backing Up"),
        'restoring-backup': gettext("Restoring Backup"),
        'error_restoring': gettext("Error Restoring")
      };

      var action = {
        submit: function() {
          modalInstance.close(snapshot);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      scope.context = context;
      scope.snapshot = snapshot;
      scope.action = action;
      scope.snapshotStatus = snapshotStatus;
      scope.initStatus = snapshot.status;

    }]);
})();

