(function() {
  'use strict';

  angular.module('hz.dashboard.project.vpn')
    .factory('valFactoryEmit', function(){
        return {};
    })
    .factory('ikepoliciesCreateAction', ['$rootScope', 'backDrop', 'horizon.openstack-service-api.vpn', 'horizon.openstack-service-api.usersettings', '$modal',
           'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.keystone','horizon.dashboard.vpn.Path',
        function(rootScope, backdrop, vpnAPI, usersettingAPI, modal, toastService, keystoneAPI, path) {

          var context = {
            mode: 'create',
            title: gettext('Add New IKE Policy'),
            submit:  gettext('Create'),
            success: gettext("Added IKE Policy '%s'.")
          };

          function action(scope) {

            var self = this;
            var option = {
              templateUrl: path + 'ikepolicies-form',
              controller: 'ikepoliciesFormCtrl',
              windowClass: 'ikepoliciesListContent lg-window',
              backdrop: backdrop,
              resolve: {
                ikepolicy: function(){ return {}; },
                context: function(){ return context; }
              }
            };

            self.open = function(){
              modal.open(option).result.then(self.submit);
            };

            self.submit = function(newIkepolocy) {
                if (!newIkepolocy.description) {
                    newIkepolocy.description = '';
                }
                vpnAPI.createIKEpolicy(newIkepolocy)
                  .success(function(response) {
                    scope.ikepolicies.push(response);
                    var message = interpolate(context.success, [response.name]);
                    toastService.add('success', message);
                    scope.$table.resetSelected();
                  });
            };
          }

          return action;
        }])
    .factory('ipsecpoliciesCreateAction', ['$rootScope', 'backDrop', 'horizon.openstack-service-api.vpn', 'horizon.openstack-service-api.usersettings', '$modal',
           'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.keystone', 'horizon.dashboard.vpn.Path',
        function(rootScope, backdrop, vpnAPI, usersettingAPI, modal, toastService, keystoneAPI, path) {

          var context = {
            mode: 'create',
            title: gettext('Add New IPSec Policy'),
            submit:  gettext('Create'),
            success: gettext("Added IPSec Policy '%s'.")
          };

          function action(scope) {

            var self = this;
            var option = {
              templateUrl: path + 'ipsecpolicies-form',
              controller: 'ipsecpoliciesFormCtrl',
              windowClass: 'lg-window',
              backdrop: backdrop,
              resolve: {
                ipsecpolicy: function(){ return {}; },
                context: function(){ return context; }
              }
            };

            self.open = function(){
              modal.open(option).result.then(self.submit);
            };

            self.submit = function(newIPSecpolic) {
                if (!newIPSecpolic.description) {
                    newIPSecpolic.description = '';
                }
                vpnAPI.createIPSecPolicy(newIPSecpolic)
                  .success(function(response) {
                    scope.ipsecpolicies.push(response);
                    var message = interpolate(context.success, [response.name]);
                    toastService.add('success', message);
                    scope.$table.resetSelected();
                  });
            };
          }

          return action;
        }])
    .factory('vpnServicesCreateAction', ['$rootScope', 'backDrop', 'horizon.openstack-service-api.vpn', 'horizon.openstack-service-api.usersettings', '$modal',
           'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.keystone','horizon.dashboard.vpn.Path',
        function(rootScope, backdrop, vpnAPI, usersettingAPI, modal, toastService, keystoneAPI, path) {

          var context = {
            mode: 'create',
            title: gettext('Add VPN Service'),
            submit:  gettext('Create'),
            success: gettext("Added VPN Service '%s'.")
          };

          function action(scope) {

            var self = this;
            var option = {
              templateUrl: path + 'vpnservices-form',
              controller: 'vpnservicesFormCtrl',
              windowClass: 'vpnservicesListContent',
              backdrop: backdrop,
              resolve: {
                vpnservice: function(){ return {}; },
                context: function(){ return context; }
              }
            };

            self.open = function(){
              modal.open(option).result.then(self.submit);
            };

            self.submit = function(newvpnService) {
                if (!newvpnService.description) {
                    newvpnService.description = '';
                }
                vpnAPI.createVPNService(newvpnService)
                  .success(function(response) {
                    scope.vpnservices.push(response);
                    var message = interpolate(context.success, [response.name]);
                    toastService.add('success', message);
                    scope.$table.resetSelected();
                  });
            };
          }

          return action;
        }])
    .factory('ipsecSiteconnsCreateAction', ['$rootScope', 'backDrop', 'horizon.openstack-service-api.vpn', 'horizon.openstack-service-api.usersettings', '$modal',
           'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.keystone','horizon.dashboard.vpn.Path',
        function(rootScope, backdrop, vpnAPI, usersettingAPI, modal, toastService, keystoneAPI, path) {

          var context = {
            mode: 'create',
            title: gettext('Add IPSec Site Connection'),
            submit:  gettext('Create'),
            success: gettext("Added IPSec Site Connection '%s'.")
          };

          function action(scope) {

            var self = this;
            var option = {
              templateUrl: path + 'ipsecsiteconns-form',
              controller: 'ipsecsiteconnsFormCtrl',
              windowClass: 'lg-window ipsecsiteconnsListContent',
              backdrop: backdrop,
              resolve: {
                ipsecsiteconn: function(){ return {}; },
                context: function(){ return context; }
              }
            };

            self.open = function(){
              modal.open(option).result.then(self.submit);
            };

            self.submit = function(newipsecSiteconns) {
                if (newipsecSiteconns.peer_cidrs) {
                    newipsecSiteconns.peer_cidrs = newipsecSiteconns.peer_cidrs.replace(' ', '').split(',');
                }
                if (!newipsecSiteconns.description) {
                    newipsecSiteconns.description = '';
                }
                vpnAPI.createIPSecSiteConnection(newipsecSiteconns)
                  .success(function(response) {
                    scope.ipsecsiteconns.push(response);
                    var message = interpolate(context.success, [response.name]);
                    toastService.add('success', message);
                    scope.$table.resetSelected();
                  });
            };
          }

          return action;
        }]);

  })();