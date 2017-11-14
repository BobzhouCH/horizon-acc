/**
 * Copyright 2015 EasyStack Corp.
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

  angular.module('hz.dashboard.project.ports')

  /**
   * @ngDoc detachAction
   * @ngService
   *
   * @Description
   * Brings up the detach volume confirmation modal dialog.
   * On submit, detach selected volumes.
   * On cancel, do nothing.
   */
  .factory('detachInstanceAction', ['horizon.openstack-service-api.neutron',
                                  'horizon.openstack-service-api.nova',
                                  '$modal', 'backDrop',
                                  'horizon.framework.widgets.toast.service',
                                  '$rootScope',
  function(neutronAPI, novaAPI, modal, backDrop, toastService, rootScope) {

    var context = {
      mode: 'detach',
      title: gettext('Detach Interface from Instance'),
      submit: gettext('Detach'),
      success: gettext('Interface %s has been detached successfully.')
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
          qosRules: function() { return {}; }
        },
        windowClass: 'RowContent'
      };

      // open up the detach form
      self.open = function(ports) {
        var port = ports[0];
        var clone = angular.copy(port);
        option.resolve.port = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(port, clone);
        });
      };

      // detach form modifies size
      // send only what is required
      self.clean = function(port) {
        return {
          //fixed_ip: port.fixed_ip,
          port_id: port.id,
          instance_id: port.device_id
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(port, clone) {
        var cleanedPort = self.clean(clone);
        novaAPI.netdisassociateServer(cleanedPort.instance_id, cleanedPort)
          .success(function() {
            var message = interpolate(context.success, [clone.name]);
            toastService.add('success', gettext(message));
            self.startUpdateStatus(3000, port);
            scope.$table.resetSelected();
          });
      };

      self.startUpdateStatus = function(interval, port){
        interval = setInterval(check, interval);
        function check(){
          if(port.device_id){
            scope.updatePorts(port);
          }else{
            clearInterval(interval);
          }
        }
      };
    }//end of action

    return action;
  }]);

})();
