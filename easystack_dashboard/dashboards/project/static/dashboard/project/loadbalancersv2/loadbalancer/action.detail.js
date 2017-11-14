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
  .factory('loadbalancerDetailAction', ['horizon.openstack-service-api.lbaasv2', '$modal', 'backDrop','$rootScope',
  function(loadbalancerAPI, modal, backdrop, rootScope) {

    var context = {
    };
    context.title = {
      "Overview": gettext("Overview"),
      "listener": gettext("Listener"),
      "Info": gettext("Info")
    };

    context.label = {
      "name": gettext("Name"),
      "subnet": gettext("Subnet"),
      "vip_address": gettext("VIP Address"),
      "floating_ip": gettext("Floating IP"),
      "security_group": gettext("Security Groups"),
      "status": gettext("Status"),
      "created_at": gettext('Create Time'),
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'detail/',
        controller: 'detailFormController',
        backdrop:   backdrop,
        windowClass: 'detailContent',
        scope:scope,
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
        }
      };

      self.open = function(loadbalancer){
        option.resolve.detail = function(){ return { "loadbalancer": loadbalancer }; };
       // option.templateUrl = (window.WEBROOT || '') + 'project/loadbalancersv2/detail/';
        modal.open(option);
        scope.provisioningStatus = {
          'ACTIVE': gettext('Active'),
          'PENDING_CREATE': gettext('Pending Create'),
          'PENDING_UPDATE': gettext('Pending Update'),
          'PENDING_DELETE': gettext('Pending Delete'),
          'ERROR': gettext('Error')
        };
       };
    }

    return action;
  }]);

})();


