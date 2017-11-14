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

  angular.module('hz.dashboard.project.floatingIP')

  /**
   * @ngDoc associateInstanceAction
   * @ngService
   *
   * @Description
   * Brings up the associate instance modal dialog.
   * On submit, associate a new instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('associateInstanceAction',
      ['horizon.openstack-service-api.floatingip',
       '$modal',
       'horizon.framework.widgets.toast.service',
  function(floatingipAPI, modal, toastService) {

    var context = {
      mode: 'associate-instance',
      title: gettext('Associate With Instance'),
      submit:  gettext('Associate'),
      success: gettext('Floating ip %s was associated successfully.')
    };

    function action(scope) {
      var self = this;
      var option = {
        templateUrl: 'associate',
        controller: 'floatingIPFormCtrl',
        windowClass: 'floatingIPListContent',
        resolve: {
          floatingip: function(){ return {}; },
          context: function(){ return context; },
          qosRules: function() { return {}; }
        }
      };

      self.open = function(floatingips){
        var floatingip = floatingips[0];
        var clone = angular.copy(floatingip);
        option.resolve.floatingip = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(floatingip, clone);
        });
      };

      self.submit = function(floatingip, newFloatingIp) {
        var params = {
          'port_id': newFloatingIp.port
        };
        floatingipAPI.associateFloatingIP(newFloatingIp.id, params)
          .success(function () {
            var message = interpolate(context.success, [newFloatingIp.floating_ip_address]);
            toastService.add('success', message);
            scope.$table.resetSelected();
            floatingipAPI.getFloatingIP(newFloatingIp.id).success(function(data){
              angular.extend(floatingip, data);
            });
          })
         .error(function (error) {
           if(error.search('is not reachable from subnet') > 0) {
             error = gettext('Unable to associate the floatingIP.') +
                     gettext('External network is not reachable from the instance.');
           }
           else {
             error = gettext('Unable to associate the floatingIP.');
           }
           toastService.add('error', error);
         });
      };
    }

    return action;
  }]);

})();
