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

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngdoc poolformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit load balancer pool form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('poolFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.lbaasv2',
    'horizon.openstack-service-api.neutron',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'pool', 'context',
    function(scope, rootScope, modalInstance, lbaasv2API, neutronAPI,
             usersettingAPI, keystoneAPI, pool, context) {

      var dropdown = {},
          action = {
            submit: function() {
              modalInstance.close(pool);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };

      if (context.mode === 'create' || context.mode === 'edit'){
        // get pool listeners
        dropdown.listeners = [];
        lbaasv2API.getListeners().success(function (response) {
          for (var i = 0; i < response.items.length; i++) {
            var item = response.items[i];
            if (response.items[i].default_pool_id === null)
              dropdown.listeners.push(item);
          }
        });

        dropdown.protocols = [
          {key: 'TCP', value: gettext('TCP')},
          {key: 'HTTP', value: gettext('HTTP')},
          {key: 'HTTPS', value: gettext('HTTPS')}
        ];

        dropdown.methods = [
          {key: 'ROUND_ROBIN', value: gettext('ROUND_ROBIN')},
          {key: 'LEAST_CONNECTIONS', value: gettext('LEAST_CONNECTIONS')},
          {key: 'SOURCE_IP', value: gettext('SOURCE_IP')}
        ];

        dropdown.types = [
          {key: 'PING', value: gettext('PING')},
          {key: 'TCP', value: gettext('TCP')},
          {key: 'HTTP', value: gettext('HTTP')},
          {key: 'HTTPS', value: gettext('HTTPS')}
        ];

        dropdown.session_persistence = [
          {key: 'SOURCE_IP', value: gettext('SOURCE IP')},
          {key: 'HTTP_COOKIE', value: gettext('HTTP COOKIE')},
          {key: 'APP_COOKIE', value: gettext('APP COOKIE')}
        ];

      }

      scope.dropdown = dropdown;
      scope.context = context;
      scope.pool = pool;
      scope.action = action;

      }
    ])

})();