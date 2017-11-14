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
   * @ngDoc associateAction
   * @ngService
   *
   * @Description
   * Brings up the associate floatingIp modal dialog.
   * On submit, associate floatingIp and display a success message.
   * On cancel, do nothing.
   */
  .factory('editSecurityGroupAction', ['horizon.openstack-service-api.nova',
                                         'horizon.openstack-service-api.neutron',
                                         '$modal', 'backDrop', 'horizon.framework.widgets.toast.service',
  function(novaAPI, neutronAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'editSecurityGroup',
      title: gettext('Edit Security Group'),
      submit: gettext('Edit'),
      success: gettext('Security Group %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'form/',
        controller: 'loadbalancerFormCtrl',
        backdrop: backDrop,
        resolve: {
          loadbalancer: function(){ return {"loadbalancer":{}}; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        },
        windowClass: 'RowContent'
      };

      // open up the associate form
      self.open = function(loadbalancers) {
        var loadbalancer = loadbalancers[0]
        var clone = angular.copy(loadbalancer);
        option.resolve.loadbalancer = function(){ return {"loadbalancer": clone};};
        modal.open(option).result.then(function(clone){
          self.submit(loadbalancer, clone);
        });
      };

      // send only what is required
      self.clean = function(loadbalancerToClean) {
        return {
          security_groups : [loadbalancerToClean.loadbalancer.security_group],
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(loadbalancer, clone) {
        var cleanedloadbalancer = self.clean(clone);
        neutronAPI.editPort(clone.loadbalancer.vip_port_id, cleanedloadbalancer)
          .success(function() {
            var message = interpolate(context.success, [clone.loadbalancer.security_groups_name]);
            toastService.add('success',gettext(message));
            scope.updateLoadBalancer(loadbalancer);
            scope.$table.resetSelected();
          });
      };

    }//end of action

    return action;
  }]);

})();
