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
   * Brings up the delete volume confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('deleteLoadBalancerAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, smodal, toastService) {

    var context = {
      title: gettext('Delete loadbalancers'),
      message: gettext('The amount of loadbalancers these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. Delete loadbalancers action cannot be undone.'),
      submit: gettext('Delete loadbalancers'),
      success: gettext('Deleted loadbalancers: %s.'),
      error: gettext('Unable to delete loadbalancers %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single loadbalancer object
      self.singleDelete = function(loadbalancer) {
        self.confirmDelete([loadbalancer.id], [loadbalancer.name]);
      };

      // delete selected loadbalancer objects
      // action requires the loadbalancer to select rows
      self.batchDelete = function() {
        var loadbalancers = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              loadbalancers.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(loadbalancers, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(loadbalancers, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: loadbalancers,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(loadbalancers);
        });
      };

      // on success, remove the volumes from the model
      // need to also remove deleted volumes from selected list
      self.submit = function(loadbalancers) {
        for(var i = 0; i < loadbalancers.length; i++){
          self.deleteLoadbalancer(loadbalancers[i]);
        }
      };

      self.deleteLoadbalancer = function(loadbalancer) {
        lbaasv2API.deleteLoadBalancer(loadbalancer.id, false)
          .success(function() {
            var message = interpolate(context.success, [loadbalancer.name]);
            toastService.add('success', message);
            scope.updateLoadBalancer(loadbalancer);
            scope.clearSelected();
          })
      }
    }

    return action;

  }]);

})();
