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

  angular.module('hz.dashboard.project.firewalls')

  /**
   * @ngdoc projectFirewallCtrl
   * @ngController
   *
   * @description
   * Controller for the identity routers table.
   * Serve as the focal point for table actions.
   */
  .controller('projectFirewallCtrl', [
      '$scope', 'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.fwaas',
      'editFirewallAction', 'createFirewallAction', 'deleteFirewallAction',
      'setGatewayAction', 'clearGatewayAction', 'routerDetailAction',
      'disassociateRouterAction','associateRouterAction',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.fwaas',
    function(
      scope, PolicyService, fwaasAPI,
      EditAction, CreateAction, DeleteAction,
      SetGatewayAction, ClearGatewayAction, RouterDetailAction, DisassociateAction, AssociateAction,toastService) {
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          desc: gettext('Description'),
          policy: gettext('Policy'),
          status: gettext('Status')
        },
        action: {
          create: gettext('Create'),
          edit: gettext('Edit'),
          deleted: gettext('Delete')
        },
        error: {
          api: gettext('Unable to retrieve firewalls'),
          priviledge: gettext('Insufficient privilege level to view firewall information.')
        }
      };

      scope.statusToString = {
        'ACTIVE': gettext('ACTIVE'),
        'DOWN': gettext('DOWN'),
        'BUILD': gettext('BUILD'),
        'ERROR': gettext('ERROR'),
        'PENDING_CREATE': gettext('PENDING_CREATE'),
        'PENDING_UPDATE': gettext('PENDING_UPDATE'),
        'PENDING_DELETE': gettext('PENDING_DELETE')
      };

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Description'),
        name: 'description',
        singleton: true
      }, {
        label: gettext('Policy'),
        name: 'policy.name',
        singleton: true
      }, {
        label: gettext('Status'),
        name: 'status',
        singleton: true,
        options: [
          { label: scope.statusToString.ACTIVE, key: 'ACTIVE' },
          { label: scope.statusToString.DOWN, key: 'DOWN' },
          { label: scope.statusToString.BUILD, key: 'BUILD' },
          { label: scope.statusToString.ERROR, key: 'ERROR' },
          { label: scope.statusToString.PENDING_CREATE, key: 'PENDING_CREATE' },
          { label: scope.statusToString.PENDING_UPDATE, key: 'PENDING_UPDATE' },
          { label: scope.statusToString.PENDING_DELETE, key: 'PENDING_DELETE' }
        ]
      }];

      this.reset = function () {
        scope.firewalls = [];
        scope.ifirewalls = [];
        scope.ifirewallsState = false;
        if (scope.$table) {
          scope.$table.resetSelected();
        }
      };

      this.init = function () {
        scope.actions = {
          refresh: self.refresh,
          create: new CreateAction(scope),
          edit: new EditAction(scope),
          deleted: new DeleteAction(scope),
          associate: new AssociateAction(scope),
          disassociate: new DisassociateAction(scope)
        };
        self.refresh();
        self.checkPendingFirewalls(10000);

        scope.$on('firewallRefresh', function(){
          self.refresh();
        })
      };

      // on load, if router has permission
      // fetch table data and populate it
      this.refresh = function () {
        self.reset();
        PolicyService.check({rules: [['neutron', 'neutron:list_firewalls']]})
          .success(function (response) {
            if (response.allowed) {
              fwaasAPI.getFirewalls()
                .success(function (response) {
                  scope.firewalls = response.items;
                  scope.ifirewallsState = true;
                });
            }
            else {
              toastService.add('info', scope.context.error.priviledge);
            }
          });
      };

      this.checkPendingFirewalls = function(interval){
        var firewallPendingStatus = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE'];

        function check(){
    	  for(var i = 0; i < scope.firewalls.length; i++){
    	    var firewall = scope.firewalls[i];
    		if(firewallPendingStatus.contains(firewall.status)){
    		  self.getPendingFirewall(firewall);
    		}
          }
        }

        setInterval(check, interval);
      }

      this.getPendingFirewall = function(firewall){
    	fwaasAPI.refreshFirewall(firewall.id)
    	  .success(function(response){
            angular.extend(firewall, response);
    	  });
      };

      this.init();
    }
  ]);

})();
