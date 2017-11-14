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
    .service('horizon.openstack-service-api.floatingip', FloatingIP);

  FloatingIP.$inject = ['horizon.framework.util.http.service',
                        'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name hz.api.FloatingIP
   * @description Provides access to FloatingIP
   */
  function FloatingIP(apiService, toastService) {

    /**
     * @name hz.api.FloatingIP.getFloatingIPSupport
     * @description
     * Get if floatingIP supported
     */
    this.getFloatingIPSupported = function() {
      return apiService.get('/api/network/floatingipSupport/')
        .error(function () {
          toastService.add('error', gettext('Floatingip service is not enabled'));
        });
    };

    /**
     * @name hz.api.FloatingIP.getTenantFloatingIP
     * @description Get tenant floating ips
     */
    this.getTenantFloatingIP = function() {
      return apiService.get('/api/network/tenantfloatingips/')
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve tenant floatingips.'));
        });
    };

    /**
     * @name hz.api.FloatingIP.getReachableFloatingIPs
     * @description Search floating ips that reachable by subnets of a instance
       This returns a map:
          the key of each element is a port id
          the value of each element is all the reachable fips by the port
          such as:
            {port-1: [floating_ip,floating_ip...],
             port-2: [floating_ip,floating_ip...]}
     */
    this.getReachableFloatingIPs = function(instance_id, ports) {
      var seachParas = {reachable_by_instance: instance_id, port_ids: ports};
      return apiService.get('/api/network/tenantfloatingips/', {'params': seachParas})
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve tenant floatingips.'));
        });
    };

    /**
     * @name hz.api.FloatingIP.getFreeTenantFloatingIP
     * @description search for floating ip which is not binded with port
     */
    this.getFreeTenantFloatingIP = function(isFreeFloatingIp) {
      var seachParas = {isFreeFloatingIp: true};
      return apiService.get('/api/network/tenantfloatingips/', {'params': seachParas})
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve tenant floatingips.'));
        });
    };

    /**
     * @name hz.api.FloatingIP.getAssociatedFloatingIPs
     * @description Search floating ips that associated to a instance
     */
    this.getAssociatedFloatingIPs = function(instance_id) {
      var seachParas = {associated_by_instance: instance_id};
      return apiService.get('/api/network/tenantfloatingips/', {'params': seachParas})
        .error(function () {
          toastService.add('error', gettext('Unable to retrieve tenant floatingips.'));
        });
    };

    /**
     * @name hz.api.FloatingIP.allocateTenantFloatingIP
     * @description
     * Allocate a new FloatingIP.
     *
     * @param {Object} newFloatingIP
     * The FloatingIP to allocate.
     *
     * @param {string} newFloatingIP.pool
     * The pool of the new floating ip. Required.
     *
     * @param {string} newFloatingIP.bandwidth. Required.
     */
   this.allocateTenantFloatingIP = function(newFloatingIP) {
     return apiService.post('/api/network/tenantfloatingips/', newFloatingIP)
       .error(function (message, status_code) {
           if (status_code == 403 || status_code == 409)
               {
                   if(message.indexOf('Quota exceeded for resources')>=0){
                       toastService.add('info', gettext('Floating IP Quota exceed.'));
                   }
                   else if(message.indexOf('No more IP addresses')>=0){
                       toastService.add('info', gettext('No more IP address available in floating Ip pool, please contact administrator.'));
                   }
                   else{
                       toastService.add('info', gettext(message));
                   }

               }
           else
               {
                toastService.add('error', gettext('Unable to allocate the floatingIP.'));
               }
       });
   };

   /**
    * @name hz.api.FloatingIP.getFloatingIP
    * @description
    * Get a single floatingIP by ID
    * @param {string} floating_ip_id
    * Specifies the id of the floatingIP to request.
    */
   this.getFloatingIP = function(floating_ip_id) {
     return apiService.get('/api/network/tenantfloatingips/' + floating_ip_id)
       .error(function () {
    	 toastService.add('error', gettext('Unable to retrieve floatingIP.'));
     });
   };

   /**
    * @name hz.api.FloatingIP.releaseFloatingIP
    * @description
    * Release a single floatingIP by ID
    * @param {string} floating_ip_id
    * Specifies the id of the floatingIP to request.
    */
   this.releaseFloatingIP = function(floating_ip_id) {
     return apiService.delete('/api/network/tenantfloatingips/' + floating_ip_id)
       .error(function () {
    	 //toastService.add('error', gettext('Unable to delete floatingIP.'));
     });
   };

   /**
    * @name hz.api.FloatingIP.associateFloatingIP
    * @description
    * Associate a floatingIP to a instance using the parameters supplied in the
    * param. The required parameters:
    *
    * Example param object
    * {
    *    "port_id": "xxxxxxxxxxxxx"
    * }
    *
    */
   this.associateFloatingIP = function(floating_ip_id, param) {
     return apiService.post('/api/network/floatingips/' + floating_ip_id, param);
   };

   /**
    * @name hz.api.FloatingIP.updateFloatingIP
    * @description
    * Update a floatingIP using the parameters supplied in the
    * param. The required parameters:
    *
    * Example param object
    * {
    *    "bandwidth": "100"
    * }
    *
    */
   this.updateFloatingIP = function(floating_ip_id, param) {
     return apiService.patch('/api/network/floatingips/' + floating_ip_id, param)
       .error(function () {
    	 toastService.add('error', gettext('Unable to associate the floating IP.'));
       });
   };

   /**
    * @name hz.api.FloatingIP.disassociateFloatingIP
    * @description
    * Disassociate a single floatingIP associated to a port
    * @param {string} floating_ip_id
    * Specifies the id of the floatingIP to request.
    */
   this.disassociateFloatingIP = function(floating_ip_id, param) {
     return apiService.delete('/api/network/floatingips/' + floating_ip_id, param)
       .error(function () {
    	 toastService.add('error', gettext('Unable to disassociate the floating IP.'));
     });
   };
   
   /**
    * @name hz.api.SecurityGroup.getFloatingIPTargets
    * @description Get floatingIP associate tagets
    */
   this.getFloatingIPTargets = function() {
     return apiService.get('/api/network/floatingiptargets/')
       .error(function () {
    	 toastService.add('error', gettext('Unable to retrieve floatingip targets.'));
     });
   };

   /**
    * @name hz.api.SecurityGroup.getFloatingIPTargetsByInstance
    * @description Get floatingIP associate tagets by instance
    */
   this.getFloatingIPTargetsByInstance = function(instance_id) {
     return apiService.get('/api/network/floatingiptargets/' + instance_id)
       .error(function () {
    	 toastService.add('error', gettext('Unable to retrieve instance floatingip targets.'));
     });
   };
   
   this.getFloatingIPPools = function() {
     return apiService.get('/api/network/floatingippools/')
       .error(function () {
          toastService.add('error', gettext('Unable to retrieve instance floatingip pools.'));
     });
    };

   this.getQosRules = function() {
     return apiService.get('/api/network/qosrules/')
      .error(function() {
          toastService.add('error', gettext('Unable to retrieve qosrules.'));
      });
   };
  }
}());
