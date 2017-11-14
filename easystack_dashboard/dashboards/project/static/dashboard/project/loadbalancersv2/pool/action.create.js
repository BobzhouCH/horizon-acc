/*
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

    .factory('poolCreateAction',
        ['horizon.openstack-service-api.lbaasv2',
         'horizon.openstack-service-api.usersettings',
         'horizon.openstack-service-api.keystone',
         '$modal',
         '$rootScope',
         'backDrop',
         'horizon.framework.widgets.toast.service',
         'horizon.openstack-service-api.settings',
      function(lbaasv2API, usersettingAPI, keystoneAPI, modal, rootScope, backDrop, toastService, settingsService) {

        var context = {
          mode: 'create',
          title: gettext('Create pool'),
          submit:  gettext('Create'),
          success: gettext('Pool %s was successfully created.')
        };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'pool-form/',
        controller: 'poolFormCtrl',
        backdrop: backDrop,
        windowClass: 'poolListContent lg-window',
        resolve: {
          pool: function(){ return {}; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      self.open = function(){
        settingsService.getSetting('FLOATING_IP_QOS_RULES_ENABLED',true)
          .then(function(rule) {
            if(rule){
              settingsService.getSetting('FLOATING_IP_QOS_RULES',true)
                .then(function(lenovoQoS) {
                  option.resolve.qosRules = function(){ return lenovoQoS; };
                  modal.open(option).result.then(self.submit);
                });
            }
            else{
              option.resolve.qosRules = function(){ return false; };
              modal.open(option).result.then(self.submit);
            }
        });
      };

      self.submit = function(nPool) {
        lbaasv2API.getListener(nPool.listener_id).success(function (response) {
          nPool.protocol = response.protocol;
          var newPool = {};
          var newHealthMonitor = {};
          newPool.name = nPool.name;
          newPool.description = nPool.description;
          newPool.listener_id = nPool.listener_id;
          newPool.protocol = nPool.protocol;
          newPool.lb_algorithm = nPool.lb_algorithm;
          if (nPool.session_enable === 1) {
            newPool.session_persistence = {};
            newPool.session_persistence.type = nPool.session_persistence.type;
            if (nPool.session_persistence.type === 'APP_COOKIE') {
              newPool.session_persistence.cookie_name = nPool.cookie_name;
            }
          }
          newHealthMonitor.type = nPool.hm_type;
          newHealthMonitor.retry = nPool.hm_max_retries;
          newHealthMonitor.timeout = nPool.hm_timeout;
          newHealthMonitor.delay = nPool.hm_delay;

          lbaasv2API.createPool(newPool)
            .success(function(response) {
              var responsePool = response;
              if (response.listeners[0].id != null) {
                responsePool.operating_status = true;
              }
              else {
                responsePool.operating_status = false;
              }
              responsePool.HealthMonitor = {};
              if (!nPool.healthmonitor) {
                scope.pools.push(responsePool);
                var message = interpolate(context.success, [newPool.name]);
                toastService.add('success', message);
                scope.$table.resetSelected();
              }
              // if nPool.healthmonitor, use pool id to create Healthmonitor
              if (nPool.healthmonitor) {
                setTimeout(function() {
                  newHealthMonitor.pool_id = responsePool.id;
                  lbaasv2API.createHealthMonitor(newHealthMonitor).success(function (response) {
                    responsePool.healthmonitor_id = response.id;
                    scope.pools.push(responsePool);
                    var message = interpolate(context.success, [newPool.name]);
                    toastService.add('success', message);
                    scope.$table.resetSelected();
                  });
                }, 2000);
              }
            });
        });
      };

    };

    return action;
    }]);

})();
