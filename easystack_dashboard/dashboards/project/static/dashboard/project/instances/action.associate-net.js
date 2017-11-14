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
   * Brings up the associate network modal dialog.
   * On submit, associate network and display a success message.
   * On cancel, do nothing.
   */
  .factory('associateNetAction', ['horizon.openstack-service-api.nova',
                                         'horizon.openstack-service-api.neutron',
                                         '$modal', 'backDrop', 'horizon.framework.widgets.toast.service',
  function(novaAPI, neutronAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'associateNet',
      title: gettext('Associate Network to Instance'),
      submit: gettext('Add'),
      success: gettext('Network %s has been associated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'net-form',
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
        if(instance.isNetworkShared){
          return {
            network_id: instance.network_id,
            instance_id: instance.id
          }
        }
        return {
          subnet_id: instance.subnet_id,
          subnet_name: instance.subnet_name,
          network_id: instance.network_id,
          instance_id: instance.id
        };
      };


      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        neutronAPI.getNetwork(clone.network_id).success(function(response) {
          clone.isNetworkShared = response.shared;
          var cleanedInstance = self.clean(clone);
            novaAPI.netassociateServer(cleanedInstance.instance_id, cleanedInstance)
              .success(function () {
                var message = interpolate(context.success, [clone.subnet_name]);
                toastService.add('success', gettext(message));

                scope.updateInstance(instance);
                scope.clearSelected();
            });
        });
      };

    }//end of action

    return action;
  }]);

})();
