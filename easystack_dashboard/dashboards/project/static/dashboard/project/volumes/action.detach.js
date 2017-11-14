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

  angular.module('hz.dashboard.project.volumes')

  /**
   * @ngDoc detachAction
   * @ngService
   *
   * @Description
   * Brings up the detach volume confirmation modal dialog.
   * On submit, detach selected volumes.
   * On cancel, do nothing.
   */
  .factory('detachVolumeAction', ['horizon.openstack-service-api.cinder',
                                  'horizon.openstack-service-api.nova',
                                  '$modal', 'backDrop',
                                  'horizon.framework.widgets.toast.service',
                                  '$rootScope',
  function(cinderAPI, novaAPI, modal, backDrop, toastService, rootScope) {

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
        templateUrl: 'form',
        controller: 'volumeFormCtrl',
        backdrop: backDrop,
        resolve: {
          volume: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        },
        windowClass: 'RowContent'
      };

      // open up the detach form
      self.open = function(volumes) {
        var volume = volumes[0]
        var clone = angular.copy(volume);
        option.resolve.volume = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(volume, clone);
        });
      };

      // detach form modifies size
      // send only what is required
      self.clean = function(volume) {
        return {
          volume_id: volume.id,
          instance_id: volume.instance,
        };
      };

      // submit this action to api
      // and update volume object on success
      self.submit = function(volume, clone) {
        var cleanedVolume = self.clean(clone);
        novaAPI.detachVolume4Server(cleanedVolume.instance_id, cleanedVolume)
          .success(function() {
            var message = interpolate(context.success, [volume.name]);
            toastService.add('success', message);

            self.updateVolume(volume);

            scope.$table.resetSelected();
          });
      };

      self.updateVolume = function(volume) {
         cinderAPI.getVolume(volume.id)
           .success(function(response) {
             response.created_at = response.created_at.replace(/T/g,' ');
             response.created_at = rootScope.rootblock.utc_to_local(response.created_at);
             angular.extend(volume, response);
           });
      };

    }//end of action

    return action;
  }]);

})();
