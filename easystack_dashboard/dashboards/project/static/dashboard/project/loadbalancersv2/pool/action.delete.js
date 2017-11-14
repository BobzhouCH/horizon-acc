/**
 * Copyright 2015 IBM Corp.
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

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete load balancer pool confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('poolDeleteAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, smodal, toastService) {

    var context = {
      title: gettext('Delete Pool'),
      message: gettext('The amount of pools these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Pool'),
      success: gettext('Deleted pools: %s.'),
      error: gettext('Unable to delete pools %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single pool object
      self.singleDelete = function(pool) {
        self.confirmDelete([pool.id], [pool.name]);
      };

      // delete selected pool objects
      // action requires the pool to select rows
      self.batchDelete = function() {
        var pools = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              pools.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(pools, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(pools, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: pools,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(pools);
        });
      };

      // on success, remove the pools from the model
      // need to also remove deleted pools from selected list
      self.submit = function(pools) {
        for(var i = 0; i < pools.length; i++){
          self.deletePool(pools[i]);
        }
      };

      self.deletePool = function(pool) {
        if (pool.healthmonitor_id !== null) {
          lbaasv2API.deleteHealthMonitor(pool.healthmonitor_id)
            .success(function(){
              lbaasv2API.deletePool(pool.id, false)
                .success(function() {
                  var message = interpolate(context.success, [pool.name]);
                  toastService.add('success', message);
                  scope.updatePool(pool);
                  scope.clearSelected();
                })
                .error(function(response) {
                  var message = interpolate(context.error, [pool.name, response]);
                  toastService.add('error', message);
                });
            });
        }
        else {
          lbaasv2API.deletePool(pool.id, false)
          .success(function() {
            var message = interpolate(context.success, [pool.name]);
            toastService.add('success', message);
            scope.updatePool(pool);
            scope.clearSelected();
          })
          .error(function(response) {
            var message = interpolate(context.error, [pool.name, response]);
            toastService.add('error', message);
          });

        }
      }

    }

    return action;

  }]);

})();