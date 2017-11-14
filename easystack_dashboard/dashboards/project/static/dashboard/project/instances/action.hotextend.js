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

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngDoc attachAction
   * @ngService
   *
   * @Description
   * Brings up the resize instance modal dialog.
   * On submit, resize instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('HotExtendDiskAction', [
    'horizon.openstack-service-api.nova',
    '$modal', 'backDrop',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, backDrop, toastService) {
    var context = {
          mode: 'hotextend',
          title: gettext('Hot Extend vDisk'),
          success: gettext('Hot extend vDisk for instance %s started.'),
          error: gettext('Unable to hot extend vDisk for instance %s.'),
          header: {
            loadingDesc: gettext('Loading root device and current Size...'),
            errorDesc: gettext('Failed to load root device and current size.'),
            description: gettext('The root device %s can be extended, its current size is %s GB.'),
            extend: gettext('Extend the root device to:'),
          }
        };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'hot-extend-disk-form',
        controller: 'instanceFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return self.instance; },
          context: function(){ return context; }
        },
        windowClass: 'hotExtendContent'
      };

      // open up the resize form
      self.open = function(instances) {
        if (instances.length != 1)
          return;
        var instance = instances[0];
        self.instance = angular.copy(instance);
        modal.open(option).result.then(function(clone) {
          self.submit(instance, clone);
        });
      };

      self.submit = function(instance, clone) {
        function hotExtendDisk(id) {
          var params =  {
            hot_extend:{
              size: clone.hotExtendDisk,
              granularity: "GB"
            }
          }
          return novaAPI.editHotExtendDisk(id, params);
        };
        scope.doAction(context, [instance], hotExtendDisk);
      };

    }//end of action

    return action;
  }]);

})();
