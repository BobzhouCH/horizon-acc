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

  angular.module('hz.dashboard.project.volumes')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit volume modal dialog.
   * On submit, edit volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('editVolumeAction',
       ['horizon.openstack-service-api.cinder',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Volume'),
      submit: gettext('Save'),
      success: gettext('Volume %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'volumeFormCtrl',
        windowClass: 'volumesListContent',
        backdrop: backDrop,
        resolve: {
          volume: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        }
      };

      // open up the edit form
      self.open = function(volume) {
        var clone = angular.copy(volume[0]);
        option.resolve.volume = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(volume[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(volume) {
        return {
          id: volume.id,
          name: volume.name,
          description: volume.description,
        };
      };

      // submit this action to api
      // and update volume object on success
      self.submit = function(volume, clone) {
        var cleanedVolume = self.clean(clone);
        cinderAPI.editVolume(cleanedVolume)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', message);
            angular.extend(volume, clone);

            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
