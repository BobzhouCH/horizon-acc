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

  angular.module('hz.dashboard.admin.instances')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create router modal dialog.
   * On submit, create a new router and display a success message.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.instances.createSnapshotAction',
      ['horizon.openstack-service-api.nova',
       'horizon.openstack-service-api.glance',
       '$modal', 'backDrop',
       'horizon.framework.widgets.toast.service',
  function(novaAPI, glanceAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'createsnapshot',
      title: gettext('Create Snapshot'),
      submit:  gettext('Create'),
      success: gettext('Instance Snapshot %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'snapshot-form/',
        controller: 'hz.dashboard.admin.instances.instanceFormCtrl',
        backdrop: backDrop,
        windowClass: 'instancesListContent',
        resolve: {
          instance: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(instances){
        var clone = angular.copy(instances[0]);
        option.resolve.instance = function() { return clone; };
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(instance) {
        var metadata = {};
        if(instance.unit){
          metadata = {'description': instance.description,'unit':instance.unit};
        }else{
          metadata = {'description': instance.description};
        }
        novaAPI.createServerSnapshot(instance.id, instance.snapshotname, metadata=metadata)
          .success(function(response) {
            var message = interpolate(context.success, [instance.snapshotname]);

            // In order to determine whether the instance is created the snapshot.
            scope.snapshotsData.push(response);

            toastService.add('success', gettext(message));
            scope.updateInstance(instance);
            scope.clearSelected();
          });
      };
    };

    return action;
  }]);

})();