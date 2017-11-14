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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('poolDetailAction', ['horizon.openstack-service-api.lbaasv2', '$modal', 'backDrop','$rootScope',
  function(lbaasv2API, modal, backdrop, rootScope) {

    var context = {
    };
    context.title = {
      "Detail": gettext("Detail"),
      "Resource": gettext("Resource List"),
      "Info": gettext("Info")
    };

    context.label = {
      "Name": gettext("Name"),
      "ID": gettext("ID"),
      "Subnet": gettext("Subnet"),
      "Protocol": gettext("Protocol"),
      "Method": gettext("Method"),
      "Status": gettext("Status"),
      "Session": gettext("Session Persistence"),
      "Session_Type": gettext("Type"),
      "Cookie_Name": gettext("Cookie Name"),
      "Health_Monitor": gettext("Health Monitor"),
      "HM_Type": gettext("Type"),
      "HM_Max_Retries": gettext("Max Retries"),
      "HM_Timeout": gettext("Timeout"),
      "HM_Delay": gettext("Delay"),
      "created_at": gettext('Create Time'),
      "instance_name": gettext("Instance Name"),
      "ip_address": gettext("IP Address"),
      "port": gettext("Port Number"),
      "weight": gettext("Weight"),
      "status": gettext("Status"),
      "admin_status": gettext("State UP"),
      "Loadbalancer_Name": gettext("Loadbalancer Name"),
      "Listener_Name": gettext("Listener Name")
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
        templateUrl: 'pool-detail',
        controller: 'poolDetailForm',
        backdrop:   backdrop,
        windowClass: 'detailContent',
        scope:scope,
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(pool){
        option.resolve.detail = function(){ return { "pool": pool }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/loadbalancersv2/pool-detail/';
        lbaasv2API.getPool(pool.id).success(function(data) {
          var array = [];
          modal.open(option);
        });
      };

    }

    return action;
  }]);

})();