/**
 * Copyright 2015 EasyStack Inc.
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
   * @ngDoc associateAction
   * @ngService
   *
   * @Description
   * Brings up the rebuild instance modal dialog.
   * On submit, rebuild instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('rebuildInstanceAction', ['horizon.openstack-service-api.nova',
                                         '$modal', 'backDrop', 'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'rebuild',
      title: gettext('Rebuild Instance'),
      submit: gettext('Rebuild'),
      success: gettext('Instance %s has been rebuilt successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'rebuild-instance-form',
        controller: 'instanceFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      // open up the associate form
      self.open = function(instances) {
        var instance = instances[0]
        var clone = angular.copy(instance);
        option.resolve.instance = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(instance, clone);
        });
      };

      // send only what is required
      self.clean = function(instance) {
        return {
            image_id: instance.image_id,
            password: instance.password
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        var cleanedInstance = self.clean(clone);
        novaAPI.rebuildServer(instance.id, cleanedInstance)
          .success(function() {
            var message = interpolate(context.success, [instance.name]);
            toastService.add('success', gettext(message));

            scope.updateInstance(instance);
            scope.clearSelected();
          });
      };

    }//end of action

    return action;
  }]);

})();
