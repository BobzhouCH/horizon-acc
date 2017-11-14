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

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngDoc detachAction
   * @ngService
   *
   * @Description
   * Brings up the detach volume confirmation modal dialog.
   * On submit, detach selected volumes.
   * On cancel, do nothing.
   */
  .factory('detachVolume4MeAction', ['horizon.openstack-service-api.nova',
                                     'horizon.openstack-service-api.cinder',
                                     '$modal', 'backDrop',
                                     'horizon.framework.widgets.toast.service',
  function(novaAPI, cinderAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'detach',
      title: gettext('Detach Volume from Instance'),
      submit: gettext('Detach'),
      success: gettext('Volume %s has been detached successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'volume-form',
        controller: 'instanceFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      // open up the detach form
      self.open = function(instances) {
        var instance = instances[0];
        var clone = angular.copy(instance);
        option.resolve.instance = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(instance, clone);
        });
      };

      // detach form modifies size
      // send only what is required
      self.clean = function(instance) {
        return {
          volume_id: instance.volume,
          instance_id: instance.id,
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        var cleanedInstance = self.clean(clone);
        novaAPI.detachVolume4Server(cleanedInstance.instance_id, cleanedInstance)
          .success(function() {
            var message = interpolate(context.success, [clone.volumeName]);
            toastService.add('success', gettext(message));

            scope.updateInstance(instance);
            scope.clearSelected();
          });
      };

    }//end of action

    return action;
  }]);

})();
