/**
 * Copyright 2015 IBM Corp.
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

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create volume modal dialog.
   * On submit, create a new volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('editListenersAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.openstack-service-api.neutron',
       '$modal',
       '$rootScope',
       'backDrop',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.settings',

  function(loadbalancerAPI, neutronAPI, modal, rootScope, backDrop, toastService, settingsService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Listener'),
      submit: gettext('Edit'),
      success: gettext('Listener %s was successfully edited.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'listener-form/',
        controller: 'listenerFormCtrl',
        backdrop: backDrop,
        windowClass: 'loadbalancersListContent',
        resolve: {
          listener: function(){ return {"listener":{}}; },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        }
      };

      self.open = function($table){
        var listener = angular.copy($table.$scope.selectedData.aData[0]);
        settingsService.getSetting('FLOATING_IP_QOS_RULES_ENABLED',true)
          .then(function(rule) {
            if(rule){
              settingsService.getSetting('FLOATING_IP_QOS_RULES',true)
                .then(function(lenovoQoS) {
                  option.resolve.qosRules = function(){ return lenovoQoS };
                  option.resolve.listener = function(){ return {"listener":listener} };
                  modal.open(option).result.then(self.submit);
                });
            }
            else{
              option.resolve.qosRules = function(){ return false };
              option.resolve.listener = function(){ return {"listener":listener} };
              modal.open(option).result.then(function(clone){
                self.submit($table.$scope.selectedData.aData[0], clone);
              });
            }
        });
      };
      this.cleanClone = function(clone){
        return {
          loadbalancer_id: scope.detail.loadbalancer_id,
          listener:{
            name : clone.listener.name,
            description: clone.listener.description,
            connection_limit: clone.listener.connection_limit,
          }
        }

      }
      self.submit = function(listener, clone) {
        var cleanedClone = self.cleanClone(clone);
        loadbalancerAPI.editListener(listener.id, cleanedClone)
          .success(function(response) {
            angular.extend(listener, cleanedClone.listener);
            var message = interpolate(context.success, [listener.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
