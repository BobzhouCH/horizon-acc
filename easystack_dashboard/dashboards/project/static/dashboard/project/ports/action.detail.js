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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On cancel, do nothing.
   */
  .factory('portDetailAction', ['horizon.openstack-service-api.neutron', '$modal', 'backDrop','$rootScope',
  function(neutronAPI, modal, backdrop, rootScope) {

    var context = {
    };
    context.title = {
      "Overview": gettext("Overview"),
      "virtual_interface": gettext("Virtual Interface"),
      "Info": gettext("Info")
    };

    context.label = {
      "ID": gettext("ID"),
      "Name": gettext("Name"),
      "subnet_name": gettext("Subnet"),
      "ip_address": gettext("IP Address"),
      "mac_address": gettext('MAC Address'),
      "instance_name": gettext('Attached Instance'),
      "security_group": gettext('Security Group'),
      "Status": gettext('Status'),
      "create_at": gettext('Create Time'),
      "mbps": gettext('Bind Width Limit')
    };

    var ctrl = {
          'active': gettext("Active"),
          'saving': gettext("Saving"),
          'queued': gettext("Queued"),
          'pending_delete': gettext("Pending Delete"),
          'killed': gettext("Killed"),
          'deleted': gettext("Deleted")
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'detail/',
        controller: 'PortDetailCtrl',
        backdrop:   backdrop,
        windowClass: 'detailContent',
        scope: scope,
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(portData){
        option.resolve.detail = function(){ return { "portData": portData }; };
        modal.open(option);
      };

    }

    return action;
  }]);

})();


