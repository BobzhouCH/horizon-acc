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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit load balancer pool modal dialog.
   * On submit, edit pool and display a success message.
   * On cancel, do nothing.
   */
  .factory('poolEditAction',
       ['horizon.openstack-service-api.lbaasv2',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(lbaasv2API, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Pool'),
      submit: gettext('Save'),
      success: gettext('Pool %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'pool-form/',
        controller: 'poolFormCtrl',
        windowClass: 'volumesListContent lg-window',
        backdrop: backDrop,
        resolve: {
          pool: function(){ return null; },
          context: function(){ return context; }
        }
      };

      // open up the edit form
      self.open = function(pool) {
        var clone = angular.copy(pool[0]);
        if (clone.healthmonitor_id)
            clone.healthmonitor = true;
        else
            clone.healthmonitor = false;
        if (clone.healthmonitor_id) {
          lbaasv2API.getHealthMonitor(true, clone.healthmonitor_id).success(function (response) {
            clone.hm_type = response.type;
            clone.hm_max_retries = response.max_retries;
            clone.hm_timeout = response.timeout;
            clone.hm_delay = response.delay;
          });
        }
        if (clone.session_persistence !== null) {
          clone.session_enable = '1';
          if (clone.session_persistence.type === 'APP_COOKIE'){
              clone.cookie_name = clone.session_persistence.cookie_name;
          }
        }
        else {
          clone.session_enable = '0';
        }
        option.resolve.pool = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(pool[0], clone);
        });
      };

      self.clean = function(pool) {
        var p = {};
        p.name = pool.name;
        p.description = pool.description;
        p.protocol = pool.protocol;
        p.lb_algorithm = pool.lb_algorithm;
        if (pool.session_enable === '1') {
          p.session_persistence = {};
          p.session_persistence.type = pool.session_persistence.type;
          if (pool.session_persistence.type === 'APP_COOKIE') {
            p.session_persistence.cookie_name = pool.cookie_name;
          }
        }

        return p;
      };

      self.cleanH = function(healthmonitor) {
        return {
          max_retries: healthmonitor.hm_max_retries,
          timeout: healthmonitor.hm_timeout,
          delay: healthmonitor.hm_delay
        };
      };

      self.cleanH_to_create = function(healthmonitor) {
        return {
          type: healthmonitor.hm_type,
          retry: healthmonitor.hm_max_retries,
          timeout: healthmonitor.hm_timeout,
          delay: healthmonitor.hm_delay
        };
      };

      // submit this action to api
      // and update pool and healthmonitor object on success
      self.submit = function(pool, clone) {
        var cleanedPool = self.clean(clone);
        var cleanedHealthMonitor = self.cleanH(clone);
        var cleanedHealthMonitor_create = self.cleanH_to_create(clone);
        if (clone.session_enable ==="0")
          clone.session_persistence = null;
        lbaasv2API.editPool(clone.id, cleanedPool)
          .success(function() {
            if (clone.healthmonitor) {
              setTimeout(function() {
                if (clone.healthmonitor_id == null) {
                  cleanedHealthMonitor_create.pool_id = clone.id;
                  lbaasv2API.createHealthMonitor(cleanedHealthMonitor_create)
                    .success(function (response) {
                      clone.healthmonitor_id = response.id;
                      var message = interpolate(context.success, [clone.name]);
                      toastService.add('success', message);
                      angular.extend(pool, clone);
                      scope.$table.resetSelected();
                    });
                }
                else
                  lbaasv2API.editHealthMonitor(clone.healthmonitor_id, cleanedHealthMonitor)
                    .success(function () {
                      var message = interpolate(context.success, [clone.name]);
                      toastService.add('success', message);
                      angular.extend(pool, clone);
                      scope.$table.resetSelected();
                    });
              }, 2000);
            }
            else {
              var message = interpolate(context.success, [clone.name]);
              toastService.add('success', message);
              angular.extend(pool, clone);
              scope.$table.resetSelected();
            }

          });
      };
    }

    return action;
  }]);

})();
