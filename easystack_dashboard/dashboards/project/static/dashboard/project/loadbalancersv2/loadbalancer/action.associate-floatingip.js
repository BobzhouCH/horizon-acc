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
  .factory('loadbalancerAssociateFloatingIp', ['horizon.openstack-service-api.floatingip',
                                         'horizon.openstack-service-api.neutron',
                                         '$modal', 'backDrop', 'horizon.framework.widgets.toast.service',
  function(floatingipAPI,neutronAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'associateFloatingIp',
      title: gettext('Associate Floating IP to loadbalancer'),
      submit: gettext('Associate'),
      success: gettext('Floating IP %s has been associated successfully.')
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
        var loadbalancer = loadbalancers[0];
        var clone = angular.copy(loadbalancer);
        option.resolve.loadbalancer = function(){ return {"loadbalancer": clone};};
        modal.open(option).result.then(function(clone){
          self.submit(loadbalancer, clone);
        });
      };


      // submit this action to api
      self.submit = function(loadbalancer, clone) {
        var port_id = clone.loadbalancer.vip_port_id;
        neutronAPI.getPort(port_id).success(function(response){
          var ip_address = response.fixed_ips[0].ip_address;
          var portid_ipaddress = port_id + "_"+ ip_address;
          //associate floating ip to loadbalancer
          floatingipAPI.associateFloatingIP(clone.loadbalancer.floatingip, {"port_id": portid_ipaddress})
          .success(function() {
            floatingipAPI.getFloatingIP(clone.loadbalancer.floatingip)
              .success(function(response){
                var message = interpolate(context.success, [response.ip]);
                toastService.add('success',gettext(message));
                scope.updateLoadBalancer(loadbalancer);
                scope.$table.resetSelected();
            })
          });
        })

      };
    }//end of action

    return action;
  }]);

})();
