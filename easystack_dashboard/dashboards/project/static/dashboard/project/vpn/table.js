/**
*
* Ikepolicies list, IPSecpolicies list, VPNServices list, ipsecSiteconns list
* controller, directive,service
*
*
*/

(function(){
'use strict';

angular.module('hz.dashboard.project.vpn')

    /**
     * Initialization function
     */
    .controller('projectIkepoliciesController', ['$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.vpn',
      'ikepoliciesCreateAction',
      'createikepolicyDetailAction',
      'IKEpolicyEditAction',
      'DeleteIKEpolicyAction',
    function(scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      vpnAPI,
      ikepoliciesCreateAction,
      createikepolicyDetailAction,
      IKEpolicyEditAction,
      DeleteIKEpolicyAction) {

      var self = this;

      scope.context = {
          header: {
              name: gettext('Name'),
              auth_algorithm: gettext('Authorization algorithm'),
              encryption_algorithm: gettext('Encryption algorithm'),
              pfs: gettext('PFS')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve IKE Policies.'),
              priviledge: gettext('Insufficient privilege level to view IKE Policies information.')
          }
      };

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Authorization algorithm'),
        name: 'auth_algorithm',
        singleton: true,
        options: [
          { label: gettext('sha1'), key: 'sha1' },
        ]
      }, {
        label: gettext('Encryption algorithm'),
        name: 'encryption_algorithm',
        singleton: true,
        options: [
          { label: gettext('3des'), key: '3des' },
          { label: gettext('aes-128'), key: 'aes-128' },
          { label: gettext('aes-192'), key: 'aes-192' },
          { label: gettext('aes-256'), key: 'aes-256' }
        ]
      }, {
        label: gettext('Perfect Forward Secrecy'),
        name: 'pfs',
        singleton: true,
        options: [
          { label: gettext('group2'), key: 'group2' },
          { label: gettext('group5'), key: 'group5' },
          { label: gettext('group14'), key: 'group14' }
        ]
      }];

      this.reset = function() {
          scope.ikepolicies = [];
          scope.iikepolicies = [];
          scope.iikepoliciesState = false;
          scope.$table && scope.$table.resetSelected();
          scope.disableikepEdit = true;
      };

      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new ikepoliciesCreateAction(scope),
          createikepolicyDetail: new createikepolicyDetailAction(scope),
          edit: new  IKEpolicyEditAction(scope),
          deleted: new DeleteIKEpolicyAction(scope)
        };
        self.refresh();
        scope.$watch('numSelected', function(current, old) {
          if (current != old)
            self.allowMenus(scope.selectedData.aData);
        });
      };

      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
          vpnAPI.getIKEpolicies()
          .success(function(response){
            var responseIKEp = response;
            keystoneAPI.getCurrentUserSession()
            .success(function(response) {
                scope.ikepolicies = responseIKEp.items;
                scope.iikepoliciesState = true;
             });
          });
      };
      this.allowMenus = function(ikepolicies) {
        self.allowikeedit(ikepolicies);
      };

      this.allowikeedit = function(ikepolicies) {
        if (ikepolicies && ikepolicies.length ==1) {
            scope.disableikepEdit = (ikepolicies[0]['ipsecsiteconns'] == undefined || ikepolicies[0]['ipsecsiteconns'].length ==0) ? false : true;
        } else {
            scope.disableikepEdit = true;
        }
      };

      this.init();

    }])

    .controller('projectIPSecpoliciesController', ['$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.vpn',
      'ipsecpoliciesCreateAction',
      'createipsecpolicyDetailAction',
      'IPSecpolicyEditAction',
      'DeleteIPSecpolicyAction',
    function(scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      vpnAPI,
      ipsecpoliciesCreateAction,
      createipsecpolicyDetailAction,
      IPSecpolicyEditAction,
      DeleteIPSecpolicyAction) {

      var self = this;

      scope.context = {
          header: {
              name: gettext('Name'),
              auth_algorithm: gettext('Authorization algorithm'),
              encryption_algorithm: gettext('Encryption algorithm'),
              pfs: gettext('PFS')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve IPSec Policies.'),
              priviledge: gettext('Insufficient privilege level to view IPSec Policies information.')
          }
      };

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Authorization algorithm'),
        name: 'auth_algorithm',
        singleton: true,
        options: [
          { label: gettext('sha1'), key: 'sha1' },
        ]
      }, {
        label: gettext('Encryption algorithm'),
        name: 'encryption_algorithm',
        singleton: true,
        options: [
          { label: gettext('3des'), key: '3des' },
          { label: gettext('aes-128'), key: 'aes-128' },
          { label: gettext('aes-192'), key: 'aes-192' },
          { label: gettext('aes-256'), key: 'aes-256' }
        ]
      }, {
        label: gettext('Perfect Forward Secrecy'),
        name: 'pfs',
        singleton: true,
        options: [
          { label: gettext('group2'), key: 'group2' },
          { label: gettext('group5'), key: 'group5' },
          { label: gettext('group14'), key: 'group14' }
        ]
      }];

      this.reset = function() {
          scope.ipsecpolicies = [];
          scope.iipsecpolicies = [];
          scope.iipsecpoliciesState = false;
          scope.$table && scope.$table.resetSelected();
          scope.disableipsecpEdit = true;
      };

      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new ipsecpoliciesCreateAction(scope),
          createipsecpolicyDetail: new createipsecpolicyDetailAction(scope),
          edit: new  IPSecpolicyEditAction(scope),
          deleted: new DeleteIPSecpolicyAction(scope)
        };
        self.refresh();
        scope.$watch('numSelected', function(current, old) {
          if (current != old)
            self.allowMenus(scope.selectedData.aData);
        });
      };
      this.allowMenus = function(ipsecpolicies) {
        self.allowipsecedit(ipsecpolicies);
      };

      this.allowipsecedit = function(ipsecpolicies) {
        if (ipsecpolicies && ipsecpolicies.length==1) {
            scope.disableipsecpEdit = (ipsecpolicies[0]['ipsecsiteconns'] == undefined || ipsecpolicies[0]['ipsecsiteconns'].length ==0) ? false : true;
        } else {
            scope.disableipsecpEdit = true;
        }
      };

      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
          vpnAPI.getIPSecPolicies()
          .success(function(response){
            var responseIPSec = response;
            keystoneAPI.getCurrentUserSession()
            .success(function(response) {
                scope.ipsecpolicies = responseIPSec.items;
                scope.iipsecpoliciesState = true;
             });
          });
      };

      this.init();

    }])

    .controller('projectVPNServicesController', ['$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.vpn',
      'vpnServicesCreateAction',
      'createvpnServiceDetailAction',
      'vpnServiceEditAction',
      'DeletevpnServiceAction',
    function(scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      vpnAPI,
      vpnServicesCreateAction,
      createvpnServiceDetailAction,
      vpnServiceEditAction,
      DeletevpnServiceAction) {

      var self = this;

      scope.context = {
          header: {
              name: gettext('Name'),
              local_ips: gettext('Local Side Public IPs'),
              subnet_name: gettext('Subnet'),
              router_name: gettext('Router'),
              status: gettext('Status')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve VPN Services.'),
              priviledge: gettext('Insufficient privilege level to view VPN Services information.')
          }
      };
    scope.vpnserviceStatus = {
      'ACTIVE': gettext("Active"),
      'DOWN': gettext("Down"),
      'ERROR': gettext("Error"),
      'CREATED': gettext("Created"),
      'PENDING_CREATE': gettext("Pending Create"),
      'PENDING_UPDATE': gettext("Pending Update"),
      'PENDING_DELETE': gettext("Pending Delete"),
      'INACTIVE': gettext("Inactive")
    };
      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Local Side Public IPs'),
        name: 'local_ips',
        singleton: true
      }, {
        label: gettext('Subnet'),
        name: 'subnet_name',
        singleton: true
      }, {
        label: gettext('Router'),
        name: 'router_name',
        singleton: true
      }, {
        label: gettext('Status'),
        name: 'status',
        singleton: true,
        options: [
          { label: scope.vpnserviceStatus.ACTIVE, key: 'Active' },
          { label: scope.vpnserviceStatus.DOWN, key: 'Down' },
          { label: scope.vpnserviceStatus.ERROR, key: 'Error' },
          { label: scope.vpnserviceStatus.CREATED, key: 'Created' },
          { label: scope.vpnserviceStatus.PENDING_CREATE, key: 'Pending_Create' },
          { label: scope.vpnserviceStatus.PENDING_UPDATE, key: 'Pending_Update' },
          { label: scope.vpnserviceStatus.PENDING_DELETE, key: 'Pending_Delete' },
          { label: scope.vpnserviceStatus.INACTIVE, key: 'Inactive' }
        ]
      }];

      this.reset = function() {
          scope.vpnservices = [];
          scope.ivpnservices = [];
          scope.ivpnservicesState = false;
          scope.$table && scope.$table.resetSelected();
          scope.disablevpnsEdit = true;
      };

      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new vpnServicesCreateAction(scope),
          createvpnServiceDetail: new createvpnServiceDetailAction(scope),
          edit: new  vpnServiceEditAction(scope),
          deleted: new DeletevpnServiceAction(scope)
        };
        self.refresh();

        self.startUpdateStatus(10000);
        scope.$watch('numSelected', function(current, old) {
          if (current != old)
            self.allowMenus(scope.selectedData.aData);
        });
      };
      this.allowMenus = function(vpnservices) {
        self.allowvpnsedit(vpnservices);
      };
      this.hasSelected = function(vpnservice) {
        return scope.$table.isSelected(vpnservice);
      };

      this.allowvpnsedit = function(vpnservices) {
        var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE'];
        if (vpnservices && vpnservices.length ==1) {
            scope.disablevpnsEdit =  statusList.contains(vpnservices[0].status) ? true : false;
        } else {
            scope.disablevpnsEdit = true;
        }
      };
      this.startUpdateStatus = function(interval){
      var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE'];
/*      if(ISPUBLICREGION === 'True'){
        statusList.push('available','in-use');
      }*/
      function check(){
        for(var i = 0; i < scope.vpnservices.length; i++){
          var vpnservice = scope.vpnservices[i];
          if(statusList.contains(vpnservice.status)){
            self.updatevpnService(vpnservice);
          }
        }
      }
      setInterval(check, interval);
    };

      this.updatevpnService = function(vpnservice) {
      vpnAPI.refreshvpnService(vpnservice.id)
        .success(function(response) {
          angular.extend(vpnservice, response);
          if (self.hasSelected(vpnservice)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404) {
            scope.vpnservices.removeId(vpnservice.id);
            self.removeSelected(vpnservice.id);
          }
        });
    };

    this.removeSelected = function(id) {
      var selected = scope.selected[id];
      if (selected) {
        selected.checked = false;
        delete scope.selected[id];
        scope.checked[id] = false;
        scope.selectedData.aData.removeId(id);
      }
    };

      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
          vpnAPI.getVPNServices()
          .success(function(response){
            var responsevpnServ = response;
            keystoneAPI.getCurrentUserSession()
            .success(function(response) {
                scope.vpnservices = responsevpnServ.items;
                scope.ivpnservicesState = true;
             });
          });
      };

      this.init();

    }])

    .controller('projectipsecSiteconnsController', ['$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.vpn',
      'ipsecSiteconnsCreateAction',
      'createipsecSiteconnDetailAction',
      'ipsecSiteconnEditAction',
      'DeleteipsecSiteconnAction',
    function(scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      vpnAPI,
      ipsecSiteconnsCreateAction,
      createipsecSiteconnDetailAction,
      ipsecSiteconnEditAction,
      DeleteipsecSiteconnAction) {

      var self = this;

      scope.context = {
          header: {
              name: gettext('Name'),
              vpnservice_name: gettext('VPN Service'),
              ikepolicy_name: gettext('IKE Policy'),
              ipsecpolicy_name: gettext('IPSec Policy'),
              status: gettext('Status')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve VPN Services.'),
              priviledge: gettext('Insufficient privilege level to view VPN Services information.')
          }
      };
    scope.ipsecsiteconnStatus = {
      'ACTIVE': gettext("Active"),
      'DOWN': gettext("Down"),
      'ERROR': gettext("Error"),
      'CREATED': gettext("Created"),
      'PENDING_CREATE': gettext("Pending Create"),
      'PENDING_UPDATE': gettext("Pending Update"),
      'PENDING_DELETE': gettext("Pending Delete"),
      'INACTIVE': gettext("Inactive")
    };
      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('VPN Service'),
        name: 'vpnservice_name',
        singleton: true
      }, {
        label: gettext('IKE Policy'),
        name: 'ikepolicy_name',
        singleton: true
      }, {
        label: gettext('IPSec Policy'),
        name: 'ipsecpolicy_name',
        singleton: true
      }, {
        label: gettext('Status'),
        name: 'status',
        singleton: true,
        options: [
          { label: scope.ipsecsiteconnStatus.ACTIVE, key: 'Active' },
          { label: scope.ipsecsiteconnStatus.DOWN, key: 'Down' },
          { label: scope.ipsecsiteconnStatus.ERROR, key: 'Error' },
          { label: scope.ipsecsiteconnStatus.CREATED, key: 'Created' },
          { label: scope.ipsecsiteconnStatus.PENDING_CREATE, key: 'Pending_Create' },
          { label: scope.ipsecsiteconnStatus.PENDING_UPDATE, key: 'Pending_Update' },
          { label: scope.ipsecsiteconnStatus.PENDING_DELETE, key: 'Pending_Delete' },
          { label: scope.ipsecsiteconnStatus.INACTIVE, key: 'Inactive' }
        ]
      }];

      this.reset = function() {
          scope.ipsecsiteconns = [];
          scope.iipsecsiteconns = [];
          scope.iipsecsiteconnsState = false;
          scope.$table && scope.$table.resetSelected();
          scope.disableipsecsitecEdit = true;
      };

      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new ipsecSiteconnsCreateAction(scope),
          createipsecSiteconnDetail: new createipsecSiteconnDetailAction(scope),
          edit: new  ipsecSiteconnEditAction(scope),
          deleted: new DeleteipsecSiteconnAction(scope)
        };
        self.refresh();
        self.startUpdateStatus(10000);
        scope.$watch('numSelected', function(current, old) {
          if (current != old)
            self.allowMenus(scope.selectedData.aData);
        });
      };

      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
          vpnAPI.getIPSecSiteConnections()
          .success(function(response){
            var responseIPSec = response;
            keystoneAPI.getCurrentUserSession()
            .success(function(response) {
                scope.ipsecsiteconns = responseIPSec.items;
                scope.iipsecsiteconnsState = true;
             });
          });
      };

      this.allowMenus = function(ipsecsiteconns) {
        self.allowipsecsitecedit(ipsecsiteconns);
      };
      this.hasSelected = function(ipsecsiteconn) {
        return scope.$table.isSelected(ipsecsiteconn);
      };

      this.allowipsecsitecedit = function(ipsecsiteconns) {
        var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE'];
        if (ipsecsiteconns && ipsecsiteconns.length ==1) {
            scope.disableipsecsitecEdit =  statusList.contains(ipsecsiteconns[0].status) ? true : false;
        } else {
            scope.disableipsecsitecEdit = true;
        }
      };

      this.startUpdateStatus = function(interval){
      var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE'];
/*      if(ISPUBLICREGION === 'True'){
        statusList.push('available','in-use');
      }*/
      function check(){
        for(var i = 0; i < scope.ipsecsiteconns.length; i++){
          var ipsecsiteconn = scope.ipsecsiteconns[i];
          if(statusList.contains(ipsecsiteconn.status)){
            self.updateipsecSiteconn(ipsecsiteconn);
          }
        }
      }
      setInterval(check, interval);
    };

      this.updateipsecSiteconn = function(ipsecsiteconn) {
      vpnAPI.refreshIPSecSiteConnection(ipsecsiteconn.id)
        .success(function(response) {
          angular.extend(ipsecsiteconn, response);
          if (self.hasSelected(ipsecsiteconn)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404) {
            scope.ipsecsiteconns.removeId(ipsecsiteconn.id);
            self.removeSelected(ipsecsiteconn.id);
          }
        });
    };
    this.removeSelected = function(id) {
      var selected = scope.selected[id];
      if (selected) {
        selected.checked = false;
        delete scope.selected[id];
        scope.checked[id] = false;
        scope.selectedData.aData.removeId(id);
      }
    };
      this.init();

    }]);

})();
