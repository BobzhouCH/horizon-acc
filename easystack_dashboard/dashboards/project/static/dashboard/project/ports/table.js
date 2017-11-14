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
   * @ngdoc projectRoutersCtrl
   * @ngController
   *
   * @description
   * Controller for the identity routers table.
   * Serve as the focal point for table actions.
   */
  .controller('projectPortsCtrl', [
      '$scope', 'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.neutron',
      'createPortAction',
      'attachInstanceAction', 'editPortAction',
      'detachInstanceAction', 'deletePortAction','portDetailAction', 'PortSecurityGroupAction',
      'horizon.framework.widgets.toast.service',
    function(
      scope, PolicyService, usersettingAPI, keystoneAPI,neutronAPI, CreateAction, attachInstanceAction,
       editPortAction, detachInstanceAction, deletePortAction, portDetailAction, PortSecurityGroupAction,toastService) {
      var self = this;
    scope.context = {
      header: {
        name: gettext('Name'),
        ip_address: gettext('IP Address'),
        subnet: gettext('Subnet'),
        floating_ips: gettext('Floating IPs'),
        attached_instance: gettext('Attached Instance'),
        qos_policy: gettext('Qos Policy'),
        status: gettext('Status'),
        created_at: gettext('Create Time')
      },
      action: {
        create: gettext('Create'),
        attach: gettext('Attach'),
        detach: gettext('Detach'),
        Delete: gettext('Delete'),
        edit: gettext('Edit')
      },
      error: {
        api: gettext('Unable to retrieve ports'),
        priviledge: gettext('Insufficient privilege level to view router information.')
      }
    };

    scope.operationStatus = {
        'ACTIVE': gettext('Active'),
        'DOWN': gettext('Down'),
        'BUILD': gettext('Build'),
        'N/A': gettext('N/A')
      };

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('IP Address'),
      name: 'ip_address',
      singleton: true
    }, {
      label: gettext('Subnet'),
      name: 'subnet_name',
      singleton: true
    }, {
      label: gettext('Floating IPs'),
      name: 'floatingip',
      singleton: true
    }, {
      label: gettext('Attached Instance'),
      name: 'instance_name',
      singleton: true
    }, {
      label: gettext('Status'),
      name: 'status',
      singleton: true
    }];

    this.reset = function() {
      scope.ports = [];
      scope.iports = [];
      scope.checked = {};
      scope.selected = {};
      scope.iportstate = false;
        if(scope.selectedData)
          scope.selectedData.aData = [];
    }

    this.initScope = function() {
      scope.clearSelected = self.clearSelected;
      scope.allowMenus = self.allowMenus;
      scope.updatePorts = self.updatePorts;
      scope.removeSelected = self.removeSelected;
      scope.actions = {
        refresh: self.refresh,
        create: new CreateAction(scope),
        attach: new attachInstanceAction(scope),
        detach: new detachInstanceAction(scope),
        deleted: new deletePortAction(scope),
        edit: new editPortAction(scope),
        detail: new portDetailAction(scope),
        editSecurityGroups: new PortSecurityGroupAction(scope),
      };
    };

    this.init = function(){
      self.initScope();
      self.refresh();
      self.startUpdateStatus(10000);

      scope.$watch('numSelected', function(current, old) {
        if (current != old) {
          self.allowMenus(scope.selectedData.aData);
        }
      });
    };

    this.startUpdateStatus = function(interval){
      var statusList = [];

      function check(){
        for(var i = 0; i < scope.ports.length; i++){
          var port = scope.ports[i];
          if(statusList.contains(port.provisioning_status)){
            self.updatePorts(port);
          }
        }
      }
      setInterval(check, interval);
    };

    this.clearSelected = function(){
      scope.checked = {};
      scope.selected = {};
      scope.numSelected = 0;
      if(scope.selectedData)
        scope.selectedData.aData = [];
    };

    this.hasSelected = function(port) {
      var selected = scope.selected[port.id];
      if (selected)
        return selected.checked;
      return false;
    };

    this.removeSelected = function(id) {
      var selected = scope.selected[id];
      if (selected) {
        selected.checked = false;
        delete scope.selected[id];
        scope.checked[id] = false;
        scope.selectedData.aData.removeId(id);
        //scope.numSelected--;
      }
    };

    this.updatePorts = function(port) {
      neutronAPI.getPort(port.id)
        .success(function(response) {
          // update the port
          angular.extend(port, response);
          // update the menus
          if (self.hasSelected(port)) {
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

    this.refresh = function(){
      self.reset();
      neutronAPI.getComputeAndFreePorts().success(function(response){
        angular.forEach(response.items, function(port) {
          port.ip_address = port.fixed_ips[0].ip_address;
        });
        scope.ports = response.items;
        scope.iportstate = true;
      })
    };

    this.allowDelete = function(ports){
      scope.deleteTag = false;
    };

    this.allowAttach = function(ports){
      scope.attachTag = false;
      for(var i = 0; i < ports.length; i++){
        if(ports[i].device_id !=''){
          scope.attachTag = true;
        }
      }
    };

    this.allowDetach = function(ports){
      scope.detachTag = false;
      for(var i = 0; i < ports.length; i++){
        if(ports[i].device_id ==''){
          scope.detachTag = true;
        }
      }
    };

    this.allowMenus = function(ports) {
      self.allowDelete(ports);
      self.allowAttach(ports);
      self.allowDetach(ports);
    };
    this.init();

  }]);

})();
