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

  angular.module('hz.dashboard.admin.instances')

  /**
   * @ngDoc startInstanceAction
   * @ngService
   *
   * @Description
   * Brings up the start instances confirmation modal dialog.

   * On submit, start selected instances.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.instances.startInstanceAction',
    ['horizon.openstack-service-api.nova',
     'horizon.framework.widgets.modal.service',
     'horizon.framework.widgets.toast.service',
  function(novaAPI, smodal, toastService) {

    var context = {
      title: gettext('Confirm Start Instance'),
      message: gettext('You have selected %s to Start'),
      tips: gettext('Please confirm your selection. This action will start instance.'),
      submit: gettext('Start Instances'),
      success: gettext('Start Instances: %s.'),
      error: gettext('Start Instances: %s.')
    };

      function action(scope) {

        /*jshint validthis: true */
        var self = this;

        // delete a single volume object
        self.singleStart = function(instance) {
          self.confirmStart([instance.id], [instance.name], [instance]);
        };

        // delete selected volume objects
        // action requires the volume to select rows
        self.batchStart = function() {
          var instances = [];
          var names = [];
          angular.forEach(scope.selected, function(row) {
            if (row.checked) {
              instances.push(row.item);
              names.push('"' + row.item.name + '"');
            }
          });
          self.confirmStart(names, instances);
        };

        // brings up the confirmation dialog
        self.confirmStart = function(names, instances) {
          var namelist = names.join(', ');
          var options = {
            title: context.title,
            tips: context.tips,
            body: interpolate(context.message, [namelist]),
            submit: context.submit
          };
          smodal.modal(options).result.then(function() {
            self.submit(instances);
          });
        };

        self.addShutOningStatus = function(instances){
          for(var i = 0,len = instances.length;i<len;i++){
            instances[i].status = 'powering-on';
          }
        }

        self.submit = function(instances) {
          self.addShutOningStatus(instances);
          scope.doAction(context, instances, novaAPI.startServer);
        };
      }

      return action;

    }
  ]);

})();
