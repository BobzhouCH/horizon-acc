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
   * Brings up the create listener modal dialog.
   * On submit, create a new listener and display a success message.
   * On cancel, do nothing.
   */
  .factory('createListenersAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.openstack-service-api.neutron',
       '$modal',
       '$rootScope',
       'backDrop',
       'horizon.framework.widgets.toast.service',
       'horizon.openstack-service-api.settings',

  function(loadbalancerAPI, neutronAPI, modal, rootScope, backDrop, toastService, settingsService) {

    var context = {
      mode: 'create',
      title: gettext('Create Listener'),
      submit: gettext('Create'),
      success: gettext('Listener %s was successfully created.')
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

     // Default QOS_RULE = False
      self.open = function(){
        settingsService.getSetting('FLOATING_IP_QOS_RULES_ENABLED',true)
          .then(function(rule) {
            if(rule){
              settingsService.getSetting('FLOATING_IP_QOS_RULES',true)
                .then(function(lenovoQoS) {
                  option.resolve.qosRules = function(){ return lenovoQoS };
                  modal.open(option).result.then(self.submit);
                });
            }
            else{
              option.resolve.qosRules = function(){ return false };
              modal.open(option).result.then(self.submit);
            }
        });
      };

      self.defaultListener = function(loadbalancer_id){
        var defaultlistener ={};
        defaultlistener.protocol = "TCP"
        defaultlistener.port = "8888"
        return {
          'listener' :  defaultlistener,
          'loadbalancer_id': loadbalancer_id
        };

      }

      self.submit = function(newListener) {
        newListener.listener.loadbalancer_id = scope.detail.loadbalancer.id;
        loadbalancerAPI.createListener(newListener)
          .success(function(response) {
            scope.listeners.push(response);
            var message = interpolate(context.success, [response.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
