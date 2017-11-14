/**
*
* Networks list
* controller, directive,service
*
*
*/

(function(){
'use strict';

angular.module('hz.dashboard.project.networks')

    /**
     * Networks ListController
     * Initialization function
     */
    .controller('projectNetworksController', ['$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.neutron',
      'networksCreateAction',
      'networksDeleteAction',
      'NetworkEditAction',
      'networkDetailAction',
    function(scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      NeutronAPI,
      networksCreateAction,
      networksDeleteAction,
      NetworkEditAction,
      CreateDetailAction) {

      var self = this;

      scope.context = {
          header: {
              name: gettext('Name'),
              subnets: gettext('Subnets'),
              network: gettext('Networks'),
              shared: gettext('Shared'),
              external_network: gettext('External Network')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve networks.'),
              priviledge: gettext('Insufficient privilege level to view networks information.')
          }
      };

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Subnets'),
        name: 'subnetSummary',
        singleton: true
      }, {
        label: gettext('Shared'),
        name: 'shared',
        singleton: true,
        options: [
          { label: gettext('true'), key: 'True' },
          { label: gettext('false'), key: 'False' }
        ]
      }, {
        label: gettext('External Network'),
        name: 'router:external',
        singleton: true,
        options: [
          { label: gettext('true'), key: 'True' },
          { label: gettext('false'), key: 'False' }
        ]
      }];

      this.reset = function() {
          scope.inetworks = [];
          scope.networks = [];
          scope.inetworksState = false;
          scope.$table && scope.$table.resetSelected();
      };

      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new networksCreateAction(scope),
          deleted: new networksDeleteAction(scope),
          edit: new  NetworkEditAction(scope),
          createDetail: new CreateDetailAction(scope),
        };
        self.refresh();
        scope.$on('networkRefresh', function(){
            self.refresh();
        });
      };

      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
          policyAPI.check({ rules: [['project', 'neutron:create_network']] })
          .success(function(response) {
              if(response.allowed){
                  NeutronAPI.getNetworks({filter_shared: true})
                  .success(function(response){
                    var responseN = response;
                    keystoneAPI.getCurrentUserSession()
                    .success(function(response) {
                      usersettingAPI.getComponentQuota(response.project_id, {only_quota: true, component_name: 'neutron'})
                              .success(function(data){
                                    var hasNetwork = false;
                                    var hasSubnet = false;
                                    for (var i = 0; i < data.items.length; i++){
                                      if (data.items[i].name === 'networks'){
                                        scope.networkQuota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                                        hasNetwork = true;
                                      } else if (data.items[i].name === 'subnets'){
                                        scope.subnetQuota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                                        hasSubnet = true;
                                      }
                                      if (hasNetwork && hasSubnet) {
                                        break;
                                      }
                                    }
                                    var subnetNum = 0;
                                    for(var i=0; i < responseN.items.length; i++){
                                        subnetNum += responseN.items[i].subnets.length;
                                    }
                                    scope.subnetNum = subnetNum;
                                    self.filterSubnets(responseN.items);
                                    scope.networks = responseN.items;
                                    scope.inetworksState = true;
                              });
                     });
                  });
              }
              else if(horizon){
                  toastService.add('info', scope.context.error.priviledge);
              }
          });
      };

      this.filterSubnets = function(filterNet) {
        for (var i = 0; i < filterNet.length; i++) {
          var subnetSum = " ";
          for (var j = 0; j < filterNet[i].subnets.length; j++) {
            subnetSum += filterNet[i].subnets[j].name + ":[" + filterNet[i].subnets[j].cidr + "] ";
          }
          filterNet[i].subnetSummary = subnetSum;
        }
      };

      this.init();

    }])

    .controller('projectSubnetsController', ['$rootScope', '$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.neutron',
      'subnetCreateAction', 'subnetDeleteAction',
      'subnetEditAction', 'networkDetailAction',
    function(
      rootScope,
      scope,
      toastService,
      policyAPI,
      usersettingAPI, keystoneAPI,
      NeutronAPI,
      SubnetCreateAction,
      SubnetDeleteAction,
      SubnetEditAction,
      CreateDetailAction) {

      var self = this;
      scope.context = {
          header: {
              name: gettext('Name'),
              cidr: gettext('Network Address'),
              ipver_str: gettext('IP Version'),
              gateway_ip: gettext('Gateway IP'),
              network: gettext('Network')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve subnet'),
              priviledge: gettext('Insufficient privilege level to view subnet information.')
          }
      };
      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Network Address'),
        name: 'cidr',
        singleton: true
      }, {
        label: gettext('Gateway IP'),
        name: 'gateway_ip',
        singleton: true
      }, {
        label: gettext('Network'),
        name: 'network',
        singleton: true
      }];
      this.reset = function() {
          scope.subnets = [];
          scope.safeSubnets = [];
          scope.subnetsState= false;
          scope.$table && scope.$table.resetSelected();
      };
      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new SubnetCreateAction(scope),
          deleted: new SubnetDeleteAction(scope),
          edit: new SubnetEditAction(scope),
          createDetail: new CreateDetailAction(scope)
        };
        self.refresh();
        rootScope.$on('subnetRefresh', function(){
          self.refresh();
        });
      };

      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
          policyAPI.check({ rules: [['project', 'neutron:create_network']] })
          .success(function(response) {
              if(response.allowed){
                  NeutronAPI.getNetworks({filter_shared: true}).success(function(response){
                    var responseSub = response;
                    keystoneAPI.getCurrentUserSession()
                    .success(function(response) {
                      usersettingAPI.getComponentQuota(response.project_id, {only_quota: false, component_name: 'neutron'})
                              .success(function(data){
                                for (var i = 0; i < data.items.length; i++){
                                  if (data.items[i].name === 'subnets'){
                                    scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                                    break;
                                  }
                                }
                                    scope.subnetsState= true;
                                    for(var i=0; i<responseSub.items.length; i++){
                                      for(var j=0; j<responseSub.items[i].subnets.length; j++){
                                          scope.safeSubnets.push(responseSub.items[i].subnets[j]);
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
