/**
 * Copyright 2015 EasyStack Inc.
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

  angular.module('hz.dashboard.admin.instances')

  /**
   * @ngDoc deleteInstanceAction
   * @ngService
   *
   * @Description
   * Brings up the delete instances confirmation modal dialog.

   * On submit, delete selected instances.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.instances.deleteInstanceAction',
   ['horizon.openstack-service-api.nova',
    'horizon.framework.widgets.modal.service',
    '$timeout',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, smodal, timeout, toastService) {

    var context = {
      title: gettext('Delete Instance'),
      message: gettext('The amount of instances these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Instances'),
      success: gettext('Delete Instances: %s.'),
      error: gettext('Delete Instances: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single volume object
      self.singleDelete = function(instance) {
        self.confirmDelete([instance.id], [instance.name], [instance]);
      };

      // delete selected volume objects
      // action requires the volume to select rows
      self.batchDelete = function() {
        var instances = [];
        var names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              instances.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(names, instances);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(names, instances) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: instances,
          imgOwner: "instance"
        };
        smodal.modal(options).result.then(function(){
          self.submit(instances);
        });
      };

      self.deleteInstance = function(instance){
        novaAPI.deleteServer(instance.id)
          .success(function(){
            var message = interpolate(context.success, [instance.name]);
            toastService.add('success', gettext(message));
            // update the status
            scope.updateInstance(instance);
            scope.clearSelected();
            scope.disableCreate = false;
          })
          .error(function(){
            var message = interpolate(context.error, [instance.name]);
            toastService.add('error', gettext(message));
          });
      };

      self.submit = function(instances) {

        for(var i=instances.length-1; i>=0; i--){
          self.deleteInstance(instances[i]);
        }

      };

    }

    return action;

  }]);

})();
