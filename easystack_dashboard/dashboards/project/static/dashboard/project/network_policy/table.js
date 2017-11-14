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

  angular.module('hz.dashboard.project.network_policy')

  /**
   * @ngdoc project.network_policy
   * @ngController
   *
   * @description
   * Controller for the identity routers table.
   * Serve as the focal point for table actions.
   */

  /**
   ** L3 Policy
   **/
  .controller('projectL3PolicyCtrl', [
      '$scope',
      'createl3PolicyAction',
      'horizon.openstack-service-api.gbp',
      'l3PolicyDeleteAction',
      'editL3PolicyAction',
      'detailL3PolicyAction',
    function(
      scope,
      CreateAction,
      gbpAPI,
      DeleteAction,
      EditAction,
      DetailAction
    ){
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          desc: gettext('Description'),
          policy: gettext('Policy'),
          status: gettext('Status'),
          IPVersion:gettext('IP Version'),
          IPPool:gettext('IP Pool'),
          SubnetPrefixLength: gettext('Subnet Prefix Length'),
          ExternalSegment:gettext('External Segment')
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

      this.reset = function () {
        scope.L3Policys = [];
        scope.iL3Policys = [];
        scope.iL3PolicyState = false;
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
          detail: new DetailAction(scope)
        };
        self.refresh();
        /*self.checkPendingFirewalls(10000);*/

        scope.$on('l3policyRefresh', function(){
          self.refresh();
        });
      };

      // on load, if router has permission
      // fetch table data and populate it
      this.refresh = function () {
        self.reset();
        gbpAPI.listL3Policy()
          .success(function (response) {
            scope.L3Policys = response;
            scope.iL3PolicyState = true;
          });
      };

      this.init();
    }
  ])

  /**
   ** Service policy
   **/
  .controller('projectServicePolicyCtrl', [
      '$scope',
      'createServicePolicyAction',
      'horizon.openstack-service-api.gbp',
      'servicePolicyDeleteAction',
      'editServicePolicyAction',
    function(
      scope,
      CreateAction,
      gbpAPI,
      DeleteAction,
      EditAction
    ){
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          desc: gettext('Description'),
          policy: gettext('Policy'),
          status: gettext('Status'),
          NetworkServiceParams:gettext('Network Service Params')
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

      this.reset = function () {
        scope.servicePolicys = [];
        scope.iServicePolicys = [];
        scope.iServicePolicyState = false;
        if (scope.$table) {
          scope.$table.resetSelected();
        }
      };

      this.init = function () {
        scope.actions = {
          refresh: self.refresh,
          create: new CreateAction(scope),
          edit: new EditAction(scope),
          deleted: new DeleteAction(scope)
        };
        self.refresh();
        /*self.checkPendingFirewalls(10000);*/

        scope.$on('servicePolicyRefresh', function(){
          self.refresh();
        });
      };

      // on load, if router has permission
      // fetch table data and populate it
      this.refresh = function () {
        self.reset();
        gbpAPI.listNetworkServicePolicy()
          .success(function (response) {
            scope.servicePolicys = response;
            scope.iServicePolicyState = true;
          });
      };

      this.init();
    }
  ])

  /**
   ** External connectivity
   **/
  .controller('projectExternalConnectivityCtrl', [
      '$scope',
      'createExternalConnectivityAction',
      'horizon.openstack-service-api.gbp',
      'externalConnectivityDeleteAction',
      'editExternalConnectivityAction',
    function(
      scope,
      CreateAction,
      gbpAPI,
      DeleteAction,
      EditAction
    ){
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          desc: gettext('Description'),
          policy: gettext('Policy'),
          status: gettext('Status'),
          IPVersion:gettext('IP Version'),
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

      this.reset = function () {
        scope.externalConnectivitys = [];
        scope.iExternalConnectivitys = [];
        scope.iExternalConnectivityState = false;
        if (scope.$table) {
          scope.$table.resetSelected();
        }
      };

      this.init = function () {
        scope.actions = {
          refresh: self.refresh,
          create: new CreateAction(scope),
          edit: new EditAction(scope),
          deleted: new DeleteAction(scope)
        };
        self.refresh();
        /*self.checkPendingFirewalls(10000);*/

        scope.$on('externalRefresh', function(){
          self.refresh();
        });
      };

      // on load, if router has permission
      // fetch table data and populate it
      this.refresh = function () {
        self.reset();
        gbpAPI.listExternalConnectivity()
          .success(function (response) {
            scope.externalConnectivitys = response;
            scope.iExternalConnectivityState = true;
          });
      };

      this.init();
    }
  ])

  /**
   ** NAT Pool
   **/
  .controller('projectNatPoolCtrl', [
      '$scope',
      'createNatPoolAction',
      'horizon.openstack-service-api.gbp',
      'natPoolDeleteAction',
      'editNatPoolAction',
    function(
      scope,
      CreateAction,
      gbpAPI,
      DeleteAction,
      EditAction
    ){
      var self = this;
      scope.context = {
        header: {
          name: gettext('Name'),
          desc: gettext('Description'),
          ipversion: gettext('IP Version'),
          status: gettext('Status'),
          IPVersion:gettext('IP Version'),
          IPPool:gettext('IP Pool'),
          SubnetPrefixLength: gettext('Subnet Prefix Length'),
          ExternalSegment:gettext('External Segment')
        },
        action: {
          create: gettext('Create'),
          edit: gettext('Edit'),
          deleted: gettext('Delete')
        },
        error: {
          api: gettext('Unable to retrieve NAT pool'),
          priviledge: gettext('Insufficient privilege level to view NAT pool information.')
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

      this.reset = function () {
        scope.natPools = [];
        scope.iNatPools = [];
        scope.iNatPoolState = false;
        if (scope.$table) {
          scope.$table.resetSelected();
        }
      };

      this.init = function () {
        scope.actions = {
          refresh: self.refresh,
          create: new CreateAction(scope),
          edit: new EditAction(scope),
          deleted: new DeleteAction(scope)
        };
        self.refresh();
        /*self.checkPendingFirewalls(10000);*/

        scope.$on('natRefresh', function(){
          self.refresh();
        });
      };

      // on load, if router has permission
      // fetch table data and populate it
      this.refresh = function () {
        self.reset();

        gbpAPI.listNatPool()
          .success(function (response) {
            scope.natPools = response;
            scope.iNatPoolState = true;
          });
      };

      this.init();
    }
  ]);

})();
