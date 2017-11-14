/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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

  angular.module('hz.dashboard.project.vpn')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete router confirmation modal dialog.
   * On submit, delete selected routers.
   * On cancel, do nothing.
   */
  .factory('DeleteIKEpolicyAction', ['horizon.openstack-service-api.vpn', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(vpnAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete IKE Policy'),
      message: gettext('The amount of IKE Policies these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete IKE Policy'),
      success: gettext('Deleted IKE Policies: %s.'),
      error: gettext('Deleted IKE Policies: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single ikepolicy object
      self.singleDelete = function(ikepolicy) {
        self.confirmDelete([ikepolicy.id], [ikepolicy.name]);
      };

      // delete selected ikepolicy objects
      // action requires the ikepolicy to select rows
      self.batchDelete = function() {
        var ikepolicies = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ikepolicies.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(ikepolicies, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ikepolicies, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: ikepolicies,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ikepolicies);
        });
      };

      // on success, remove the ikepolicies from the model
      // need to also remove deleted ikepolicies from selected list
      self.submit = function(ikepolicies) {
        for(var n=0; n<ikepolicies.length; n++){
          self.deleteIKEpolicy(ikepolicies[n]);
        }
        scope.$table.resetSelected();
      };

      var ikepolicyInfo = {};
      self.deleteIKEpolicy = function(ikepolicy) {
        ikepolicyInfo[ikepolicy.id] = ikepolicy.name;
        vpnAPI.deleteIKEpolicy(ikepolicy.id, ikepolicyInfo)
          .success(function() {
            var message = interpolate(context.success, [ikepolicy.name]);
            toastService.add('success', message);

            scope.ikepolicies.removeId(ikepolicy.id);
            delete scope.selected[ikepolicy.id];
          });
      };
    }

    return action;

  }])
  .factory('DeleteIPSecpolicyAction', ['horizon.openstack-service-api.vpn', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(vpnAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete IPSec Policy'),
      message: gettext('The amount of IPSec Policies these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete IPSec Policy'),
      success: gettext('Deleted IPSec Policies: %s.'),
      error: gettext('Deleted IPSec Policies: %s.')
    };

    function action(scope) {

      var self = this;

      // delete a single ipsecpolicy object
      self.singleDelete = function(ipsecpolicy) {
        self.confirmDelete([ipsecpolicy.id], [ipsecpolicy.name]);
      };

      // delete selected ipsecpolicy objects
      // action requires the ipsecpolicies to select rows
      self.batchDelete = function() {
        var ipsecpolicies = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ipsecpolicies.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(ipsecpolicies, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ipsecpolicies, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: ipsecpolicies,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ipsecpolicies);
        });
      };

      // on success, remove the ipsecpolicies from the model
      // need to also remove deleted ipsecpolicies from selected list
      self.submit = function(ipsecpolicies) {
        for(var n=0; n<ipsecpolicies.length; n++){
          self.deleteIPSecpolicy(ipsecpolicies[n]);
        }
        scope.$table.resetSelected();
      };

      var ipsecpolicyInfo = {};
      self.deleteIPSecpolicy = function(ipsecpolicy) {
        ipsecpolicyInfo[ipsecpolicy.id] = ipsecpolicy.name;
        vpnAPI.deleteIPSecPolicy(ipsecpolicy.id, ipsecpolicyInfo)
          .success(function() {
            var message = interpolate(context.success, [ipsecpolicy.name]);
            toastService.add('success', message);

            scope.ipsecpolicies.removeId(ipsecpolicy.id);
            delete scope.selected[ipsecpolicy.id];
          });
      };
    }

    return action;

  }])
  .factory('DeletevpnServiceAction', ['horizon.openstack-service-api.vpn', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(vpnAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete VPN Service'),
      message: gettext('The amount of Delete VPN Services these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete VPN Service'),
      success: gettext('Deleted VPN Service: %s.'),
      error: gettext('Deleted VPN Service: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single vpnservice object
      self.singleDelete = function(vpnservice) {
        self.confirmDelete([vpnservice.id], [vpnservice.name]);
      };

      // delete selected vpnservice objects
      // action requires the vpnservice to select rows
      self.batchDelete = function() {
        var vpnservices = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              vpnservices.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(vpnservices, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(vpnservices, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: vpnservices,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(vpnservices);
        });
      };

      // on success, remove the vpnservices from the model
      // need to also remove deleted vpnservices from selected list
      self.submit = function(vpnservices) {
        for(var n=0; n<vpnservices.length; n++){
          self.deleteVPNService(vpnservices[n]);
        }
        scope.$table.resetSelected();
      };

      var vpnserviceInfo = {};
      self.deleteVPNService = function(vpnservice) {
        vpnserviceInfo[vpnservice.id] = vpnservice.name;
        vpnAPI.deleteVPNService(vpnservice.id, vpnserviceInfo)
          .success(function() {
            var message = interpolate(context.success, [vpnservice.name]);
            toastService.add('success', message);

            scope.vpnservices.removeId(vpnservice.id);
            delete scope.selected[vpnservice.id];
          });
      };
    }

    return action;

  }])
  .factory('DeleteipsecSiteconnAction', ['horizon.openstack-service-api.vpn', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(vpnAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete IPSec Site Connection'),
      message: gettext('The amount of Delete IPSec Site Connections these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete IPSec Site Connection'),
      success: gettext('Deleted IPSec Site Connection: %s.'),
      error: gettext('Deleted IPSec Site Connection: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single ipsecsiteconn object
      self.singleDelete = function(ipsecsiteconn) {
        self.confirmDelete([vpnservice.id], [ipsecsiteconn.name]);
      };

      // delete selected ipsecsiteconn objects
      // action requires the ipsecsiteconn to select rows
      self.batchDelete = function() {
        var ipsecsiteconns = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ipsecsiteconns.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(ipsecsiteconns, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ipsecsiteconns, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: ipsecsiteconns,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ipsecsiteconns);
        });
      };

      // on success, remove the ipsecsiteconns from the model
      // need to also remove deleted ipsecsiteconns from selected list
      self.submit = function(ipsecsiteconns) {
        for(var n=0; n<ipsecsiteconns.length; n++){
          self.deleteipsecSiteconn(ipsecsiteconns[n]);
        }
        scope.$table.resetSelected();
      };

      var ipsecSiteconnInfo = {};
      self.deleteipsecSiteconn = function(ipsecsiteconn) {
        ipsecSiteconnInfo[ipsecsiteconn.id] = ipsecsiteconn.name;
        vpnAPI.deleteIPSecSiteConnection(ipsecsiteconn.id, ipsecSiteconnInfo)
          .success(function() {
            var message = interpolate(context.success, [ipsecsiteconn.name]);
            toastService.add('success', message);

            scope.ipsecsiteconns.removeId(ipsecsiteconn.id);
            delete scope.selected[ipsecsiteconn.id];
          });
      };
    }

    return action;

  }]);

})();