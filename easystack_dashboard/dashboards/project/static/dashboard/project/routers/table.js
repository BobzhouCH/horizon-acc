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

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngdoc projectRoutersCtrl
   * @ngController
   *
   * @description
   * Controller for the identity routers table.
   * Serve as the focal point for table actions.
   */
  .controller('projectRoutersCtrl', [
      '$scope', 'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.neutron',
      'editRouterAction', 'createRouterAction', 'deleteRouterAction',
      'associateFirewallAction','disassociateFirewallAction',
      'setGatewayAction', 'clearGatewayAction', 'routerDetailAction',
      'horizon.framework.widgets.toast.service',
      //'$location',
      '$window',
    function(
      scope, PolicyService, usersettingAPI, keystoneAPI, neutronAPI,
      EditAction, CreateAction, DeleteAction,associateAction,disassociateAction,
      //SetGatewayAction, ClearGatewayAction, RouterDetailAction, toastService, $location ){
      SetGatewayAction, ClearGatewayAction, RouterDetailAction, toastService, $window) {
      var self = this;
    scope.context = {
      header: {
        name: gettext('Name'),
        status: gettext('Status'),
        firewall: gettext('Firewall'),
        ext_network: gettext('External Network'),
      },
      action: {
        create: gettext('Create'),
        edit: gettext('Edit'),
        deleted: gettext('Delete')
      },
      error: {
        api: gettext('Unable to retrieve routers'),
        priviledge: gettext('Insufficient privilege level to view router information.')
      }
    };
    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
        label: gettext('Firewall'),
        name: 'firewall_name',
        singleton: true
    }, {
      label: gettext('External Network'),
      name: 'external_gateway',
      singleton: true
    }];
    this.reset = function() {
      scope.routers = [];
      scope.irouters = [];
      scope.checked = {};
      scope.selected = {};
      scope.iroutersState = false;
        if(scope.selectedData)
          scope.selectedData.aData = [];
    }

    this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new CreateAction(scope),
          edit: new EditAction(scope),
          deleted: new DeleteAction(scope),
          setGateway: new SetGatewayAction(scope),
          clearGateway: new ClearGatewayAction(scope),
          routerDetail: new RouterDetailAction(scope),
          associate: new associateAction(scope),
          disassociate: new disassociateAction(scope)
        };
        self.refresh();
　　　 scope.updateRouter = self.updateRouter;
        scope.$watch('numSelected', function(current, old) {
      　　  if (current != old) {
       　　   self.allowMenus(scope.selectedData.aData);
       　　 }
     　　});
      };

    this.getRouterById = function(id, routers){
        var result = new Object();
        angular.forEach(routers, function(router){
            if(id == router.id){
                result = router;
            }
        })
        return result;
    };

    this.allowDelete = function(routers){
	  for(var i = 0; i < routers.length; i++){
	    var router = routers[i];
        if(router.external_gateway_info){
	      return true;
        }
	  }
      return false;
    };

    self.allowMenus = function(routers){
      this.allowAssociate(routers);
      this.allowDisassociate(routers);
      scope.deleteRouterTag  = this.allowDelete(routers);
    };

    self.allowAssociate = function(routers){
      angular.forEach(routers, function(router){
        scope.associateTag = false;
          if(router.firewall_id){
            scope.associateTag = true;
          }
      })
    };

    self.allowDisassociate = function(routers){
      angular.forEach(routers, function(router){
        scope.disassociateTag = false;
          if(!router.firewall_id){
            scope.disassociateTag = true;
          }
      })
    };

　　self.hasSelected = function(router) {
      var selected = scope.selected[router.id];
      if (selected)
        return selected.checked;
      return false;
    };

    this.updateRouter = function(router) {
      neutronAPI.getRouter(router.id)
        .success(function(response) {
          // update the port
          angular.extend(router, response.items);
          // update the menus
          if (self.hasSelected(router)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404) {
            scope.ports.removeId(port.id);
            self.removeSelected(port.id);
          }
        });
    };

    // on load, if router has permission
    // fetch table data and populate it
    this.refresh = function(){
        scope.disableCreate = false;
        self.reset();
        PolicyService.check({ rules: [['neutron', 'neutron:list_routers']] })
        .success(function(response) {
          if (response.allowed){
              neutronAPI.getRouters('')
              .success(function(response) {
                var responseR = response;
                    keystoneAPI.getCurrentUserSession()
                    .success(function(response) {
                      usersettingAPI.getComponentQuota(response.project_id, {only_quota: true, component_name: 'neutron'})
                              .success(function(data){
                                  for (var i = 0; i < data.items.length; i++){
                                    if (data.items[i].name === 'routers'){
                                      scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                                      break;
                                    }
                                  }
                                  for (var i = 0; i < responseR.items.length; i++){
                                    if (responseR.items[i].external_gateway_info !== null){
                                      responseR.items[i].external_gateway = responseR.items[i].external_gateway_info.network + " (" + responseR.items[i].external_gateway_info.external_fixed_ips[0].ip_address + ")";
                                    }else{
                                      responseR.items[i].external_gateway = "-";
                                    }
                                  }
                                  scope.routers = responseR.items;
                                  scope.iroutersState = true;

                                  //var current_url = $location.absUrl();
                                  //var current_url = location.href;
                                  var current_url = $window.location.href;
                                  var start = current_url.indexOf('#');
                                  if (start != -1) {
                                      var param = current_url.substr(start + 2);
                                      var router = self.getRouterById(param, responseR.items);
                                      if (router) {
                                          scope.actions.routerDetail.open(router);
                                      }
                                  }
                              });
                     });
              });
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
          }
        });
    };

    this.init();

  }]);

})();
