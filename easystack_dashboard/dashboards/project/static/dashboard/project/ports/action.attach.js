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

  angular.module('hz.dashboard.project.ports')

  /**
   * @ngDoc attachAction
   * @ngService
   *
   * @Description
   * Brings up the attach instance modal dialog.
   * On submit, attach instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('attachInstanceAction', ['horizon.openstack-service-api.neutron',
                                  'horizon.openstack-service-api.nova',
                                  '$modal', 'backDrop',
                                  'horizon.framework.widgets.toast.service',
                                  '$rootScope',
  function(neutronAPI, novaAPI, modal, backDrop, toastService, rootScope) {

    var context = {
      mode: 'attach',
      title: gettext('Attach Interface'),
      submit: gettext('Attach'),
      success: gettext('Interface %s has been attached successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'form',
        controller: 'portFormCtrl',
        backdrop: backDrop,
        resolve: {
          port: function(){ return null; },
          context: function(){ return context; },
          qosRules: function() { return {}; },
        },
        windowClass: 'RowContent'
      };

      // open up the attach form
      self.open = function(ports) {
        var port = ports[0];
        var clone = angular.copy(port);
        option.resolve.port = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(port, clone);
        });
      };

      // send only what is required
      self.clean = function(port) {
        return {
          instance_id: port.instance_id,
          port_id: port.id
        };
      };


      // submit this action to api
      // and update instance object on success
      self.submit = function(port, clone) {
        var cleanedPort = self.clean(clone);
        novaAPI.netassociateServer(cleanedPort.instance_id, cleanedPort)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', gettext(message));
            self.startUpdateStatus(3000, port);
            scope.$table.resetSelected();
          });
      };

      self.startUpdateStatus = function(interval, port){
        var status_list =['DOWN', 'BUILD'];
        var si = setInterval(check, interval);
        function check(){
          if(!port.device_id ||status_list.contains(port.status)){
            scope.updatePorts(port);
          }else{
            clearInterval(si);
          }
        }
      };

    }//end of action

    return action;
  }]);

})();
