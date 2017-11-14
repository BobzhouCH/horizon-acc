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

   .controller('LoadBalancersTableController',
    ['$scope', '$rootScope',
    'horizon.framework.widgets.toast.service',
    'horizon.openstack-service-api.lbaasv2',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'createLoadbalancersAction', 'loadbalancerAssociateFloatingIp', 'loadbalancerDisassociateFloatingIp','loadbalancerDetailAction',
    'deleteLoadBalancerAction', 'editSecurityGroupAction','allocateFloatingIPAction',
    function (
      scope, rootScope, toastService, loadbalanceAPI, usersettingAPI, keystoneAPI,
      CreateLoadBalancer, AssociateFloatingIp, DisableAssociateFloatingIp, LoadbalancerDetail,
      DeleteLoadBalancer, EditSecurityGroup, allocateFloatingIPAction) {
    var self = this;

    scope.context = {
      header: {
        name: gettext('Name'),
        description: gettext('Description'),
        vip: gettext('VIP Address'),
        subnet: gettext('Subnet'),
        floating_ip: gettext('Floating IP'),
        security_group: gettext('Security Groups'),
        status: gettext('Status'),
        created_at: gettext('Create Time'),
      },
      actions: {
        create: gettext('Create'),
        deleted: gettext('Delete'),
        associatefloatingip: gettext('Associate Floating IP'),
        disassociatefloatingip: gettext('disassociate Floating IP'),
        editsecuritygroup: gettext('Edit Security Group')
      },
    };

    scope.operatingStatus = {
      'ONLINE': gettext('Online'),
      'OFFLINE': gettext('Offline'),
      'DEGRADED': gettext('Degraded'),
      'ERROR': gettext('Error')
    };

    scope.provisioningStatus = {
      'ACTIVE': gettext('Active'),
      'PENDING_CREATE': gettext('Pending Create'),
      'PENDING_UPDATE': gettext('Pending Update'),
      'PENDING_DELETE': gettext('Pending Delete'),
      'ERROR': gettext('Error')
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
      label: gettext('VIP Address'),
      name: 'vip_address',
      singleton: true
    }, {
      label: gettext('Subnet'),
      name: 'subnet',
      singleton: true
    }, {
      label: gettext('Floating IP'),
      name: 'floating_ip',
      singleton: true
    }, {
      label: gettext('Security Groups'),
      name: 'security_groups_name',
      singleton: true
    }, {
      label: gettext('Status'),
      name: 'provisioning_status',
      singleton: true,
      options: [
        { label: scope.provisioningStatus.ACTIVE, key: 'Active' },
        { label: scope.provisioningStatus.PENDING_CREATE, key: 'Pending Create' },
        { label: scope.provisioningStatus.PENDING_UPDATE, key: 'Pending Update' },
        { label: scope.provisioningStatus.PENDING_DELETE, key: 'Pending Update' },
        { label: scope.provisioningStatus.ERROR, key: 'Error' }
      ]
    }, {
      label: gettext('Create Time'),
      name: 'create_time',
      singleton: true
    }];
    this.clearSelected = function(){
      scope.checked = {};
      scope.selected = {};
      scope.numSelected = 0;
      if(scope.selectedData)
        scope.selectedData.aData = [];
    };

    this.hasSelected = function(loadbalancer) {
      var selected = scope.selected[loadbalancer.id];
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

    this.reset = function(){
      scope.loadbalancers = [];
      scope.iloadbalancers = [];
      scope.iloadbalancersState = false;

      scope.disableDelete = true;
      scope.disableCreate = true;
      scope.disableAssociateFloatingIp = true;
      scope.disableDisAssociateFloatingIp = true;
      scope.disableEditSecurityGroup = true;
      self.clearSelected();
      toastService.clearAll();
    };

    this.initScope = function() {
      scope.clearSelected = self.clearSelected;
      scope.allowMenus = self.allowMenus;
      scope.updateLoadBalancer = self.updateLoadBalancer;

      scope.actions = {
        refresh: self.refresh,
        create: new CreateLoadBalancer(scope),
        associatefloatingip: new AssociateFloatingIp(scope),
        disableAssociateFloatingIp: new DisableAssociateFloatingIp(scope),
        deleteLoadBalancerAction: new DeleteLoadBalancer(scope),
        editSecurityGroup: new EditSecurityGroup(scope),
        loadbalancerDetail: new LoadbalancerDetail(scope),
        allocate: new allocateFloatingIPAction(scope)
      };
    };

    this.init = function(){
      self.initScope();
      self.refresh();
      self.startUpdateStatus(10000);

      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          self.allowMenus(scope.selectedData.aData);
      });
    };

    this.startUpdateStatus = function(interval){
      var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE' ];

      function check(){
        for(var i = 0; i < scope.loadbalancers.length; i++){
          var loadbalancer = scope.loadbalancers[i];
          if(statusList.contains(loadbalancer.provisioning_status)){
            self.updateLoadBalancer(loadbalancer);
          }
        }
      }
      setInterval(check, interval);
    };

    this.updateLoadBalancer = function(loadbalancer) {
      loadbalanceAPI.getLoadBalancer(loadbalancer.id, true)
        .success(function(response) {
          // update the volume
          angular.extend(loadbalancer, response);
          // update the menus
          if (self.hasSelected(loadbalancer)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404) {
            scope.loadbalancers.removeId(loadbalancer.id);
            self.removeSelected(loadbalancer.id);
          }
        });
    };

    this.refresh = function(){
      scope.disableCreate = false;
      self.reset();
        loadbalanceAPI.getLoadBalancers(true)
          .success(function(response) {
            scope.loadbalancers = response.items;
            scope.iloadbalancersState = true;
            keystoneAPI.getCurrentUserSession()
              .success(function(response) {
                usersettingAPI.getComponentQuota(response.project_id, {only_quota: true, component_name: 'neutron'})
                  .success(function(data){
                    for (var i = 0; i < data.items.length; i++){
                      if (data.items[i].name === 'loadbalancers'){
                        scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                        break;
                      }
                    }
                  });
              });
          });
    };

    this.allowDelete = function(loadbalancers){
      scope.disableDelete = false;
      //begin:jiaozh1:add:2016-12-05:bug:Bugzilla - bug 76158
      //begin:hejing7:remove the comment of following code: 2017-02-23:Bugzilla - bug 80328
      angular.forEach(loadbalancers, function(loadbalancer){
        if(loadbalancer.listeners.length > 0){
          scope.disableDelete = true;
        }
      })
      //end:hejing7:remove the comment of following code: 2017-02-23:Bugzilla - bug 80328
      //end:jiaozh1:add:2016-12-05:bug:Bugzilla - bug 76158
    };

    this.allowDisAssociateFloatingIp = function(loadbalancers){
      scope.disableDisAssociateFloatingIp = false;
      angular.forEach(loadbalancers, function(loadbalancer){
        if(!loadbalancer.floating_ip.id){
          scope.disableDisAssociateFloatingIp = true;
        }
      })
    };

    this.allowAssociateFloatingIp = function(loadbalancers){
      scope.disableAssociateFloatingIp = false;
      angular.forEach(loadbalancers, function(loadbalancer){
        if(loadbalancer.floating_ip.id){
          scope.disableAssociateFloatingIp = true;
        }
      })
    };

    this.allowEditSecurityGroup = function(loadbalancers){
      scope.disableEditSecurityGroup = false;
    };

    this.allowMenus = function(loadbalancers) {
      self.allowDelete(loadbalancers);
      self.allowDisAssociateFloatingIp(loadbalancers);

      self.allowAssociateFloatingIp(loadbalancers);
      self.allowEditSecurityGroup(loadbalancers);
    };

    this.init();

  }])

  .controller('projectPoolsController', ['$rootScope', '$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.neutron',
      'horizon.openstack-service-api.lbaasv2',
      'poolCreateAction', 'poolDeleteAction', 'poolEditAction',
      'poolEnableAction', 'poolDisableAction', 'poolDetailAction',
    function(
      rootScope, scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      NeutronAPI,
      Lbaasv2API,
      PoolCreateAction, PoolDeleteAction, PoolEditAction,
      PoolEnableAction, PoolDisableAction, PoolDetailAction) {

      var self = this;

      scope.context = {
        header: {
          name: gettext('Name'),
          description: gettext('Description'),
          subnet: gettext('Subnet'),
          protocol: gettext('Protocol'),
          lb_method: gettext('LB Method'),
          state: gettext('State'),
          operating_status: gettext('Operating Status'),
          create_at: gettext('Create Time')
        },
        action: {
        },
        error: {
          api: gettext('Unable to retrieve pool'),
          priviledge: gettext('Insufficient privilege level to view pool information.')
        }
      };

      scope.provisioningStatus = {
        'ACTIVE': gettext('Active'),
        'PENDING_CREATE': gettext('Pending Create'),
        'PENDING_UPDATE': gettext('Pending Update'),
        'PENDING_DELETE': gettext('Pending Delete'),
        'ERROR': gettext('Error')
      };

      scope.operationStatus = {
        'true': gettext('Available'),
        'false': gettext('Unavailable')
      };

      scope.loadbalancerMethod = {
        'ROUND_ROBIN': gettext('ROUND_ROBIN'),
        'LEAST_CONNECTIONS': gettext('LEAST_CONNECTIONS'),
        'SOURCE_IP': gettext('SOURCE_IP')
      };

      scope.sessionPersistence = {
        'null': '-',
        'SOURCE_IP': gettext('SOURCE IP'),
        'HTTP_COOKIE': gettext('HTTP COOKIE'),
        'APP_COOKIE': gettext('APP COOKIE')
      };

      scope.enableStatus = {
        'true': gettext('Enabled'),
        'false': gettext('Disabled')
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
        label: gettext('Subnet'),
        name: 'subnet_cidr',
        singleton: true
      }, {
        label: gettext('Protocol'),
        name: 'protocol',
        singleton: true
      }, {
        label: gettext('LB Method'),
        name: 'lb_algorithm',
        singleton: true,
        options: [
          { label: scope.loadbalancerMethod.ROUND_ROBIN, key: 'ROUND_ROBIN' },
          { label: scope.loadbalancerMethod.LEAST_CONNECTIONS, key: 'LEAST_CONNECTIONS' },
          { label: scope.loadbalancerMethod.SOURCE_IP, key: 'SOURCE_IP' }
        ]
      }, {
        label: gettext('State'),
        name: 'admin_state_up',
        singleton: true,
        options: [
          { label: scope.enableStatus.true, key: 'Enabled' },
          { label: scope.enableStatus.false, key: 'Disabled' }
        ]
      }, {
        label: gettext('Operating Status'),
        name: 'operating_status',
        singleton: true,
        options: [
          { label: scope.operationStatus.true, key: 'Available' },
          { label: scope.operationStatus.false, key: 'Unavailable' }
        ]
      }, {
        label: gettext('Create Time'),
        name: 'create_time',
        singleton: true
      }];

      this.clearSelected = function(){
        scope.checked = {};
        scope.selected = {};
        scope.numSelected = 0;
        if(scope.selectedData)
          scope.selectedData.aData = [];
      };

      this.hasSelected = function(pool) {
        var selected = scope.selected[pool.id];
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

      this.reset = function(){
        scope.pools = [];
        scope.ipools = [];
        scope.ipoolsState = false;

        scope.disableDelete = true;
        scope.disableCreate = true;
        scope.disableEnable = true;
        scope.disableDisable = true;
        scope.disableEdit = true;

        self.clearSelected();
        toastService.clearAll();
      };

      this.initScope = function() {
        scope.clearSelected = self.clearSelected;
        scope.allowMenus = self.allowMenus;
        scope.updatePool = self.updatePool;

        scope.actions = {
        refresh: self.refresh,
        create: new PoolCreateAction(scope),
        deleted: new PoolDeleteAction(scope),
        edit: new PoolEditAction(scope),
        enable: new PoolEnableAction(scope),
        disable: new PoolDisableAction(scope),
        poolDetail: new PoolDetailAction(scope)
        };
      };

      // on load, if user has permission
      // fetch table data and populate it
      this.init = function(){
        self.initScope();
        self.refresh();
        self.startUpdateStatus(10000);

      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          self.allowMenus(scope.selectedData.aData);
        });
      };

      this.startUpdateStatus = function(interval){
        var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE'];

        function check(){
          for(var i = 0; i < scope.pools.length; i++){
            var pool = scope.pools[i];
            if(statusList.contains(pool.provisioning_status)){
              self.updatePool(Pool);
            }
          }
        }
        setInterval(check, interval);
      };

      this.updatePool = function(pool) {
      Lbaasv2API.getPool(pool.id, true)
        .success(function(response) {
          // update the pool
          if (response.listeners[0].id != null) {
            response.operating_status = true;
          }
          else{
            response.operating_status = false;
          }
          angular.extend(pool, response);
          // update the menus
          if (self.hasSelected(pool)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404) {
            scope.pools.removeId(pool.id);
            self.removeSelected(pool.id);
          }
        });
      };

      this.refresh = function() {
        scope.disableCreate = false;
        self.reset();
        Lbaasv2API.getPools()
          .success(function (response) {
            scope.pools = response.items;
            for (var i = 0; i < scope.pools.length; i ++) {
              if (scope.pools[i].listeners[0].id != null) {
                scope.pools[i].operating_status = true;
              }
              else scope.pools[i].operating_status = false;
            }
            scope.ipoolsState = true;
            keystoneAPI.getCurrentUserSession()
              .success(function(response) {
                usersettingAPI.getComponentQuota(response.project_id, {only_quota: true, component_name: 'neutron'})
                  .success(function(data){
                    for (var i = 0; i < data.items.length; i++){
                      if (data.items[i].name === 'pools'){
                        scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                        break;
                      }
                    }
                  });
              });
          });
      };

      this.checkPoolStatus = function(pools,status){
        for(var i=0;i<pools.length;i++) {
          if(pools[i].admin_state_up === status) {
            return true;
          }
        }
        return false;
      }

      this.allowDelete = function(pools){
        scope.disableDelete = false;
      };

      this.allowEnable = function(pools){
        scope.disableEnable = this.checkPoolStatus(pools,true);
      };

      this.allowDisable = function(pools){
        scope.disableDisable = this.checkPoolStatus(pools,false);
      };

      this.allowEdit = function(pools){
        scope.disableEdit = false;
      };

      this.allowMenus = function(pools) {
        self.allowDelete(pools);
        self.allowEnable(pools);
        self.allowDisable(pools);
        self.allowEdit(pools);
      };

      this.init();

    }]);
})();
