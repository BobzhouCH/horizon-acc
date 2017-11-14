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
   * Brings up the attach volume modal dialog.
   * On submit, attach volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('attachVolume2MeAction', ['horizon.openstack-service-api.nova',
                                     'horizon.openstack-service-api.cinder',
                                     '$modal', 'backDrop',
                                     'horizon.framework.widgets.toast.service',
  function(novaAPI, cinderAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'attach',
      title: gettext('Attach Volume to Instance'),
      submit: gettext('Attach'),
      success: gettext('Volume %s attaching request has been sent successfully,please check later.')
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

      // open up the attach form
      self.open = function(instances) {
        var instance = instances[0];
        var clone = angular.copy(instance);
        option.resolve.instance = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(instance, clone);
        });
      };

      // attach form modifies size
      // send only what is required
      self.clean = function(instance) {
        //device -- null means auto
        if (!instance.device)
          instance.device = null;
        return {
          volume_id: instance.volume,
          device: instance.device,
          instance_id: instance.id,
 //         multiattach: instance.volume_type === 'sharable'? true:false,
 //         metadata: {attached: instance.volume_attached_mode}
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        var cleanedInstance = self.clean(clone);
        novaAPI.attachVolume2Server(cleanedInstance.instance_id, cleanedInstance)
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
