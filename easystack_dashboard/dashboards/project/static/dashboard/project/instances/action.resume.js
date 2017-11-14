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
   * @ngDoc resumeInstanceAction
   * @ngService
   *
   * @Description
   * Brings up the resume instances confirmation modal dialog.

   * On submit, resume selected instances when instances are suspended or paused.
   * On cancel, do nothing.
   */
  .factory('resumeInstanceAction', ['horizon.openstack-service-api.nova',
                                    'horizon.framework.widgets.modal.service',
                                    'horizon.framework.widgets.toast.service',
  function(novaAPI, smodal, toastService) {

    var context = {
      title: gettext('Confirm Resume suspended Instance'),
      message: gettext('You have selected %s.'),
      tips: gettext('Please confirm your selection.'),
      submit: gettext('Resume Instances'),
      success: gettext('Resume Instances: %s.'),
      error: gettext('Resume Instances: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single volume object
      self.singleResume = function(instance) {
        self.confirmResume([instance.id], [instance.name], [instance]);
      };

      // delete selected volume objects
      // action requires the volume to select rows
      self.batchResume = function() {
        var instances = [];
        var names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              instances.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmResume(names, instances);
      };

      // brings up the confirmation dialog
      self.confirmResume = function(names, instances) {
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

      self.submit = function(instances) {
        scope.doAction(context, instances, novaAPI.resumeServer);
      };

    }

    return action;

  }]);

})();
