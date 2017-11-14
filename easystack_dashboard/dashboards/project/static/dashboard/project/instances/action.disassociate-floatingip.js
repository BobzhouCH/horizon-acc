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
   * @ngDoc disassociateAction
   * @ngService
   *
   * @Description
   * Brings up the disassociate floatingIp confirmation modal dialog.
   * On submit, disassociate selected floatingIps.
   * On cancel, do nothing.
   */
  .factory('disassociateFloatingIpAction', ['horizon.openstack-service-api.nova',
                                            'horizon.openstack-service-api.floatingip',
                                            '$modal', 'backDrop',
                                            'horizon.framework.widgets.toast.service',
  function(novaAPI, floatingipAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'disassociate',
      title: gettext('Disassociate Floating IP from Instance'),
      submit: gettext('Disassociate'),
      success: gettext('Floating IP %s has been disassociated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'floatingip-form',
        controller: 'instanceFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      // open up the disassociate form
      self.open = function(instances) {
        var instance = instances[0];
        var clone = angular.copy(instance);
        option.resolve.instance = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(instance, clone);
        });
      };

      // disassociate form modifies size
      // send only what is required
      self.clean = function(instance) {
        return {
          floatingip_id: instance.floatingip,
          port_id: null,
          instance_id: instance.id,
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        var cleanedInstance = self.clean(clone);
        floatingipAPI.disassociateFloatingIP(cleanedInstance.floatingip_id, cleanedInstance)
          .success(function() {
            var message = interpolate(context.success, [clone.floatingipName]);
            toastService.add('success', gettext(message));

            scope.updateInstance(instance);
            scope.clearSelected();
          });
      };

    }//end of action

    return action;
  }]);

})();
