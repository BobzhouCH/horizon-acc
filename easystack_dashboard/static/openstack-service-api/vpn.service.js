/**
 * Copyright 2015 EasyStack Inc.
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
(function () {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.vpn', VpnAPI);

  VpnAPI.$inject = ['horizon.framework.util.http.service',
                        'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.vpn
   * @description Provides access to Neutron APIs.
   */
  function VpnAPI(apiService, toastService) {

        // VPN
        this.getIKEpolicies = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/vpn/ikepolicies/', config)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve IKE Policies.'));
            });
        };

        this.createIKEpolicy = function(ikePolicy) {
          return apiService.post('/api/vpn/ikepolicies/', ikePolicy)
            .error(function () {
                toastService.add('error', gettext('Unable to create the IKE Policy.'));
            });
        };

        this.getIKEpolicy = function(ikepolicy_id) {
          return apiService.get('/api/vpn/ikepolicy/' + ikepolicy_id)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve IKE Policy.'));
          });
        };

        /**
         * @name horizon.openstack-service-api.vpnAPI.IKEpolicy
         * @description edit IKEpolicy
         * @returns The new network object on success.
         */
        this.editIKEpolicy = function(id, param) {
          return apiService.patch('/api/vpn/ikepolicy/' + id, param)
            .error(function (message, status_code) {
              if (status_code == 409){
                if(message.indexOf('in use by existing IPsecSiteConnection')>=0){
                  var errMessage     = gettext("Update IKE Policy %s failed, reason: IKE Policy is in use by existing IPSec site connection and can't be updated or deleted."),
                      connectMessage = interpolate(errMessage, [id]);

                   toastService.add('error', connectMessage);
                }
                else{
                   toastService.add('error', gettext(message));
                }
              }
              else{
                toastService.add('error', gettext('Unable to edit IKE Policy.'));
              }
          });
        };

        /**
        * @name horizon.openstack-service-api.vpnAPI.deleteIKEpolicy
        * @description
        * Delete a single IKEpolicy by ID
        * @param {string} ikepolicy_id
        * Specifies the id of the router to request.
        */
        this.deleteIKEpolicy = function(ikepolicy_id, ikepolicyInfo) {
         return apiService.delete('/api/vpn/ikepolicy/' + ikepolicy_id)
           .error(function (message, status_code) {
              var id = message.split(' ')[1];
              if (status_code == 409){
                if(message.indexOf('in use by existing IPsecSiteConnection')>=0){
                  var errMessage     = gettext("Delete IKE Policy %s failed, reason: IKE Policy is in use by existing IPSec site connection and can't be updated or deleted."),
                      connectMessage = interpolate(errMessage, [ikepolicyInfo[id]]);

                   toastService.add('error', connectMessage);
                }
                else{
                   toastService.add('error', gettext(message));
                }
              }
              else{
                toastService.add('error', gettext('Unable to delete IKE Policy.'));
              }
         });
        };


        this.getIPSecPolicies = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/vpn/ipsecpolicies/', config)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve IPSec Policies.'));
            });
        };

        this.createIPSecPolicy = function(ipsecPolicy) {
          return apiService.post('/api/vpn/ipsecpolicies/', ipsecPolicy)
            .error(function () {
                toastService.add('error', gettext('Unable to create the IPSec Policy.'));
            });
        };

        this.getIPSecPolicy = function(ipsecpolicy_id) {
          return apiService.get('/api/vpn/ipsecpolicy/' + ipsecpolicy_id)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve IPSec Policy.'));
          });
        };

        /**
         * @name horizon.openstack-service-api.vpnAPI.editIPSecPolicy
         * @description edit IPSecPolicy
         * @returns The new IPSecPolicy object on success.
         */
        this.editIPSecPolicy = function(id, param) {
          return apiService.patch('/api/vpn/ipsecpolicy/' + id, param)
            .error(function (message, status_code) {
              if (status_code == 409){
                if(message.indexOf('in use by existing IPsecSiteConnection')>=0){
                  var errMessage     = gettext("Update IPSec Policy %s failed, reason: IPSec Policy is in use by existing IPSec site connection and can't be updated or deleted."),
                      connectMessage = interpolate(errMessage, [id]);

                   toastService.add('error', connectMessage);
                }
                else{
                   toastService.add('error', gettext(message));
                }
              }
              else{
                toastService.add('error', gettext('Unable to edit IPSec Policy.'));
              }
          });
        };

        /**
        * @name horizon.openstack-service-api.vpnAPI.deleteIPSecPolicy
        * @description
        * Delete a single IPSecPolicy by ID
        * @param {string} ipsecpolicy_id
        * Specifies the id of the IPSecPolicy to request.
        */
        this.deleteIPSecPolicy = function(ipsecpolicy_id, ipsecpolicyInfo) {
         return apiService.delete('/api/vpn/ipsecpolicy/' + ipsecpolicy_id)
           .error(function (message, status_code) {
              var id = message.split(' ')[1];
              if (status_code == 409){
                if(message.indexOf('in use by existing IPsecSiteConnection')>=0){
                  var errMessage     = gettext("Delete IPSec Policy %s failed, reason: IPSec Policy is in use by existing IPSec site connection and can't be updated or deleted."),
                      connectMessage = interpolate(errMessage, [ipsecpolicyInfo[id]]);

                   toastService.add('error', connectMessage);
                }
                else{
                   toastService.add('error', gettext(message));
                }
              }
              else{
                toastService.add('error', gettext('Unable to delete IPSec Policy.'));
              }
         });
        };


        this.getVPNServices = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/vpn/vpnservices/', config)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve VPN Services.'));
            });
        };

        this.createVPNService = function(vpnservice) {
          return apiService.post('/api/vpn/vpnservices/', vpnservice)
            .error(function () {
                toastService.add('error', gettext('Unable to create the VPN Service.'));
            });
        };

        this.getVPNService = function(vpnservice_id) {
          return apiService.get('/api/vpn/vpnservice/' + vpnservice_id)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve VPN Service.'));
          });
        };

        this.refreshvpnService = function(vpnservice_id) {
          return apiService.get('/api/vpn/vpnservice/' + vpnservice_id);
        };


        /**
         * @name horizon.openstack-service-api.vpnAPI.editVPNService
         * @description edit VPNService
         * @returns The new VPNService object on success.
         */
        this.editVPNService = function(id, param) {
          return apiService.patch('/api/vpn/vpnservice/' + id, param)
            .error(function (message, status_code) {
              if (status_code == 400){
                if(message.indexOf('Invalid state PENDING')>=0){
                  var errorstatus = ""
                  if (message.indexOf('Invalid state PENDING_CREATE')>=0) {
                        errorstatus ="created";
                  }
                  if (message.indexOf('Invalid state PENDING_UPDATE')>=0) {
                        errorstatus ="updated";
                  }
                  if (message.indexOf('Invalid state PENDING_DELETE')>=0) {
                        errorstatus ="deleted";
                  }
                  var errMessage     = gettext('VPN Service %s is being %s and cannot be updated.'),
                      connectMessage = interpolate(errMessage, [id, errorstatus]);

                   toastService.add('error', connectMessage);
                }
                else{
                   toastService.add('error', gettext(message));
                }
              }
              else{
                toastService.add('error', gettext('Unable to edit VPN Service.'));
              }
          });
        };

        /**
        * @name horizon.openstack-service-api.vpnAPI.deleteVPNService
        * @description
        * Delete a single VPNService by ID
        * @param {string} vpnservice_id
        * Specifies the id of the VPNService to request.
        */
        this.deleteVPNService = function(vpnservice_id, vpnserviceInfo) {
         return apiService.delete('/api/vpn/vpnservice/' + vpnservice_id)
           .error(function (message, status_code) {
              var id = message.split(' ')[1];
              if (status_code == 409){
                if(message.indexOf('is still in use')>=0){
                  var errMessage     = gettext("Delete VPN Service %s failed, reason: VPN Service is in use by existing IPSec site connection and can't deleted."),
                      connectMessage = interpolate(errMessage, [vpnserviceInfo[id]]);

                   toastService.add('error', connectMessage);
                }
                else{
                   toastService.add('error', gettext(message));
                }
              }
              else{
                toastService.add('error', gettext('Unable to delete VPN Service.'));
              }
         });
        };

        this.getIPSecSiteConnections = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/vpn/ipsecsiteconnections/', config)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve IPSec Site Connections.'));
            });
        };

        this.createIPSecSiteConnection = function(ipsecsiteconn) {
          return apiService.post('/api/vpn/ipsecsiteconnections/', ipsecsiteconn)
            .error(function () {
                toastService.add('error', gettext('Unable to create the IPSec Site Connection.'));
            });
        };

        this.getIPSecSiteConnection = function(ipsecsiteconn_id) {
          return apiService.get('/api/vpn/ipsecsiteconnection/' + ipsecsiteconn_id)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve IPSec Site Connection.'));
          });
        };

        this.refreshIPSecSiteConnection = function(ipsecsiteconn_id) {
          return apiService.get('/api/vpn/ipsecsiteconnection/' + ipsecsiteconn_id);
        };

        /**
         * @name horizon.openstack-service-api.vpnAPI.editIPSecSiteConnection
         * @description edit IPSecSiteConnection
         * @returns The new IPSecSiteConnection object on success.
         */
        this.editIPSecSiteConnection = function(id, param) {
          return apiService.patch('/api/vpn/ipsecsiteconnection/' + id, param)
            .error(function (message, status_code) {
              if (status_code == 400){
                if(message.indexOf('Invalid state PENDING')>=0){
                  var errorstatus = ""
                  if (message.indexOf('Invalid state PENDING_CREATE')>=0) {
                        errorstatus ="created";
                  }
                  if (message.indexOf('Invalid state PENDING_UPDATE')>=0) {
                        errorstatus ="updated";
                  }
                  if (message.indexOf('Invalid state PENDING_DELETE')>=0) {
                        errorstatus ="deleted";
                  }
                  var errMessage     = gettext('IPSec Site Connection %s is being %s and cannot be updated.'),
                      connectMessage = interpolate(errMessage, [id, errorstatus]);

                   toastService.add('error', connectMessage);
                }
                else{
                   toastService.add('error', gettext(message));
                }
              }
              else{
                toastService.add('error', gettext('Unable to edit IPSec Site Connection.'));
              }
          });
        };

        /**
        * @name horizon.openstack-service-api.vpnAPI.deleteIPSecSiteConnection
        * @description
        * Delete a single IPSecSiteConnection by ID
        * @param {string} ipsecsiteconn_id
        * Specifies the id of the IPSecSiteConnection to request.
        */
        this.deleteIPSecSiteConnection = function(ipsecsiteconn_id, ipsecsiteconnInfo) {
         return apiService.delete('/api/vpn/ipsecsiteconnection/' + ipsecsiteconn_id)
           .error(function (message) {
                toastService.add('error', gettext('Unable to delete IPSec Site Connection.'));
         });
        };

      }
}());
