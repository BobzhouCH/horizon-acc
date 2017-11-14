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
    .module('hz.dashboard.admin.hypervisor')
    .controller('hypervisorTableController', hypervisorTableController);

  hypervisorTableController.$inject = [
      '$scope',
      '$rootScope',
      'horizon.openstack-service-api.nova',
      'horizon.framework.widgets.toast.service',
      'disableComputeHost',
      'horizon.framework.esutils.Utils'
    ];

    function hypervisorTableController(
             scope, rootScope, novaAPI, toastService, disableComputeHost, utils) {

     scope.context= {
       header:{
           hostname: gettext('HostName'),
           type: gettext('Type'),
           vcpu_used: gettext('VCPUs (used)'),
           vcpu_total: gettext('VCPUs (total)'),
           ram_used: gettext('RAM (used)'),
           ram_total: gettext('RAM (total)'),
           local_storage_used: gettext('Instance Used Storage'),
           local_storage_total: gettext('Local Storage (total)'),
           instances: gettext('Instance Count'),
           host: gettext('Host'),
           enabled: gettext('Enabled'),
           zone: gettext('Zone'),
           state: gettext('State'),
           alive: gettext('Alive'),
           update: gettext('Last Update'),
           instancename: gettext('Instance Managed Name'),
           instanceid: gettext('UUID')
       },
       success_enable: gettext('Compute host: %s has been enabled successfully'),
       instances: pgettext('InstancesList','Instances')
     };

     var self = this;

     scope.actions = {};

     scope.enabled = true;

     scope.html = {};
     scope.hypervisors = [];
     scope.novaservices = [];
     scope.host_servers = {};
     scope.show_servers = {};


     //////////////////////////

     this.getHypervisors = function(){
       scope.ihypervisorsState = false;
       scope.hypervisors = [];
       novaAPI.getHypervisors('All').success(function(data){
         scope.hypervisors = data.items;
         self.getHostServers(data.items);
         scope.ihypervisorsState = true;
         for(var i = 0; i<scope.hypervisors.length; i++){
          scope.hypervisors[i].memory_mb_used = utils.convertUnit(scope.hypervisors[i].memory_mb_used, 'MB');
          scope.hypervisors[i].memory_mb = utils.convertUnit(scope.hypervisors[i].memory_mb, 'MB');
          scope.hypervisors[i].local_gb_used = utils.convertUnit(scope.hypervisors[i].local_gb_used, 'GB');
          scope.hypervisors[i].local_gb = utils.convertUnit(scope.hypervisors[i].local_gb, 'GB');
         }
       });
     };

     this.getNovaServices = function(){
       scope.inovaservicesState=false;
       scope.novaservices = [];
       novaAPI.getServices().success(function(data){
         if (data.items){
           var id = 1;
           angular.forEach(data.items, function(item){
             if (item.binary == 'nova-compute'){
               scope.novaservices.remove(item);
               item.updated_at = item.updated_at.replace(/T/g, ' ');
               item.updated_at = rootScope.rootblock.utc_to_local(item.updated_at);
               item['id'] = id++;
               item.status = item.status === 'enabled' ? true : false;
               scope.novaservices.push(item);
               item.state = gettext(item.state);
             }
           });
         }
         scope.inovaservicesState=true;
       });
     };

     this.getHostServers = function(items){
       scope.host_servers = {};
       angular.forEach(items, function(item){
         novaAPI.getHypervisors(item.hypervisor_hostname).success(function(res){
           if (res.items){
             scope.host_servers[item.hypervisor_hostname] = res.items[0].servers;
             scope.show_servers[item.hypervisor_hostname] = false;
           }
         });
       });
     };

     this.listServers = function(hostname){
       scope.show_servers[hostname] = !scope.show_servers[hostname];
     };

     this.selectHost = function(item, selected){
       var index = $.inArray(item, selected);
       if (index > -1){
         selected.remove(item);
         if (selected.length == 1){
           scope.enabled = (selected[0].status === 'enabled') || (selected[0].status === true);
         }
         return;
       }
       if (selected.length == 0){
         scope.enabled = (item.status === 'enabled') || (item.status === true);
       }
     };

     scope.resetSelected = function(){
       scope.html.$table.resetSelected();
     };

     this.enableComputeHost = function(html){
       scope.html = html;
       var service = html.selectedData.aData[0];
       var param = {};
       param['node_id'] = service.host;
       param['binary'] = service.binary;
       novaAPI.enableService(param).success(function(data){
         var message = interpolate(scope.context.success_enable, [data.host]);
         toastService.add('success', message);
         service['status'] = data.status;
         scope.resetSelected();
       });
     };

     this.init = function(){
       this.getHypervisors();
       this.getNovaServices();
       scope.actions = {
         hypervisor_refresh: this.getHypervisors,
         compute_refresh: this.getNovaServices,
         disable: new disableComputeHost(scope),
         enable: this.enableComputeHost,
         server_list: this.listServers,
         select_host: this.selectHost
       };
     };

     this.init();

      scope.hypervisorsFilterFacets = [{
        label: gettext('HostName'),
        name: 'hypervisor_hostname',
        singleton: true
      }, {
        label: gettext('Type'),
        name: 'hypervisor_type',
        singleton: true
      }, {
        label: gettext('VCPUs (used)'),
        name: 'vcpus_used',
        singleton: true
      }, {
        label: gettext('VCPUs (total)'),
        name: 'vcpus',
        singleton: true
      }, {
        label: gettext('RAM (used)'),
        name: 'memory_mb_used',
        singleton: true
      }, {
        label: gettext('RAM (total)'),
        name: 'memory_mb',
        singleton: true
      }, {
        label: gettext('Instance Used Storage'),
        name: 'local_gb_used',
        singleton: true
      }, {
        label: gettext('Local Storage (total)'),
        name: 'local_gb',
        singleton: true
      }, {
        label: gettext('Instance Count'),
        name: 'running_vms',
        singleton: true
      }];

      scope.computeFilterFacets = [{
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

    }

})();
