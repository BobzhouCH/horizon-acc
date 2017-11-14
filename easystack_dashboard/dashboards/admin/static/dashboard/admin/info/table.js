/**
 * bo.wang@easystack.cn
 * Nov. 18th, 2015
 */
(function() {
  'use strict';

  /**
   * @ngdoc systemServicesTableController
   * @ngController
   *
   * @description
   * get system services data
   */
  angular
    .module('hz.dashboard.admin.info')
    .controller('systemServicesTableController', systemServicesTableController);

    systemServicesTableController.$inject = [
      '$scope',
      '$rootScope',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.nova',
      'horizon.openstack-service-api.cinder',
      'horizon.openstack-service-api.neutron',
      'horizon.framework.widgets.toast.service',
    ];

    function systemServicesTableController(
        scope, rootScope, keystoneAPI, novaAPI, cinderAPI, neutronAPI, toastService) {

     scope.context= {
       header:{
           name: gettext('Name'),
           type: gettext('Service'),
           host: gettext('Host'),
           url: gettext('Endpoint'),
           status: gettext('Status'),
           enabled: gettext('Enabled'),
           zone: gettext('Zone'),
           state: gettext('State'),
           alive: pgettext("StateAlive","Alive"),
           update: gettext('Last Update')
       }
     };
     scope.services = []
     scope.novaservices = []
     scope.cinderservices = []
     scope.neutronagents = []

     init();

     //////////////////////////

     function init(){
       getSystemServices();
       getNovaServices();
       getCinderServices();
       getNeutronAgents();
     };

     function getSystemServices(){
       keystoneAPI.getServices().success(function(data){
         scope.services = data;
         for(var i = 0, len = scope.services.length; i < len; i++){
           scope.services[i].type = gettext(scope.services[i].type);
           //scope.services[i].status = gettext(scope.services[i].status);
           scope.services[i].status = scope.services[i].status === 'Enabled' ? true : false;
         }
       });
     }

     function getNovaServices(){
       novaAPI.getServices().success(function(data){
         if (data.items){
           scope.novaservices = data.items;
           angular.forEach(scope.novaservices, function(item){
             item.updated_at = item.updated_at.replace(/T/g, ' ');
             item.updated_at = rootScope.rootblock.utc_to_local(item.updated_at);
             //item.status = gettext(item.status);
             item.status = item.status === 'enabled' ? true : false;
             item.state = gettext(item.state);
           });
         }
       });
     }

     function getCinderServices(){
       cinderAPI.getServices().success(function(data){
         if (data.items){
           scope.cinderservices = data.items;
           angular.forEach(scope.cinderservices, function(item){
             item.updated_at = item.updated_at.replace(/T/g, ' ');
             item.updated_at = rootScope.rootblock.utc_to_local(item.updated_at);
             //item.status = gettext(item.status);
             item.status = item.status === 'enabled' ? true : false;
             item.state = gettext(item.state);
           });
         }
       });
     }

     function getNeutronAgents(){
       neutronAPI.getAgents().success(function(data){
         if (data.items){
           scope.neutronagents = data.items;
           angular.forEach(scope.neutronagents, function(item){
             item.heartbeat_timestamp = item.heartbeat_timestamp.replace(/T/g, ' ');
             item.heartbeat_timestamp = rootScope.rootblock.utc_to_local(item.heartbeat_timestamp);
             item.alive = pgettext("NetworkService",item.alive);
           });
         }
       });
     }

      scope.servicesFilterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Service'),
        name: 'type',
        singleton: true
      }, {
        label: gettext('Host'),
        name: 'host',
        singleton: true
      }, {
        label: gettext('Endpoint'),
        name: 'url',
        singleton: true
      }, {
        label: gettext('Status'),
        name: 'status',
        singleton: true,
        options: [
          { label: gettext('true'), key: 'True' },
          { label: gettext('false'), key: 'False' }
       ]
      }];

      scope.computeFilterFacets = [{
        label: gettext('Name'),
        name: 'binary',
        singleton: true
      }, {
        label: gettext('Host'),
        name: 'host',
        singleton: true
      }, {
        label: gettext('Zone'),
        name: 'zone',
        singleton: true
      }, {
        label: gettext('Enabled'),
        name: 'status',
        singleton: true,
        options: [
          { label: gettext('true'), key: 'True' },
          { label: gettext('false'), key: 'False' }
        ]
      }, {
        label: gettext('State'),
        name: 'state',
        singleton: true
      }, {
        label: gettext('Last Update'),
        name: 'updated_at',
        singleton: true
      }];

      scope.storageFilterFacets = [{
        label: gettext('Name'),
        name: 'binary',
        singleton: true
      }, {
        label: gettext('Host'),
        name: 'host',
        singleton: true
      }, {
        label: gettext('Zone'),
        name: 'zone',
        singleton: true
      }, {
        label: gettext('Enabled'),
        name: 'status',
        singleton: true,
        options: [
          { label: gettext('true'), key: 'True' },
          { label: gettext('false'), key: 'False' }
        ]
      }, {
        label: gettext('State'),
        name: 'state',
        singleton: true
      }, {
        label: gettext('Last Update'),
        name: 'updated_at',
        singleton: true
      }];

      scope.networkFilterFacets = [{
        label: gettext('Service'),
        name: 'agent_type',
        singleton: true
      }, {
        label: gettext('Name'),
        name: 'binary',
        singleton: true
      }, {
        label: gettext('Host'),
        name: 'host',
        singleton: true
      }, {
        label: pgettext("StateAlive","Alive"),
        name: 'alive',
        singleton: true
      }, {
        label: gettext('Last Update'),
        name: 'heartbeat_timestamp',
        singleton: true
      }];

    }

})();
