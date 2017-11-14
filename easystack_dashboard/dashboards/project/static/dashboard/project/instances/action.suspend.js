/**
 * Copyright 2015 Easystack Corp.
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

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngDoc suspendInstanceAction
   * @ngService
   *
   * @Description
   * Brings up the suspend instances confirmation modal dialog.

   * On submit, suspend selected instances.
   * On cancel, do nothing.
   */
  .factory('suspendInstanceAction', ['horizon.openstack-service-api.nova',
                                     'horizon.framework.widgets.modal.service',
                                     'horizon.framework.widgets.toast.service',
  function(novaAPI, smodal, toastService) {

    var context = {
      title: gettext('Confirm Suspend Instance'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection.'),
      submit: gettext('Suspend Instances'),
      success: gettext('Suspend Instances: %s.'),
      error: gettext('Suspend Instances: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single volume object
      self.singleSuspend = function(instance) {
        self.confirmSuspend([instance.id], [instance.name], [instance]);
      };

      // delete selected volume objects
      // action requires the volume to select rows
      self.batchSuspend = function() {
        var instances = [];
        var names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              instances.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmSuspend(names, instances);
      };

      // brings up the confirmation dialog
      self.confirmSuspend = function(names, instances) {
        var namelist = names.join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [namelist]),
          submit: context.submit
        };
        smodal.modal(options).result.then(function(){
          self.submit(instances);
        });
      };

      self.addSuspengingStatus = function(instances){
        for(var i = 0,len = instances.length;i<len;i++){
          instances[i].status = 'suspending';
        }
      }

      self.submit = function(instances) {
        self.addSuspengingStatus(instances);
        scope.doAction(context, instances, novaAPI.suspendServer);
      };

    }

    return action;

  }]);

})();
