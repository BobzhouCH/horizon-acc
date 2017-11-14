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

  angular.module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.security-group', SecurityGroupAPI);

  SecurityGroupAPI.$inject = ['horizon.framework.util.http.service',
                              'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.security-group
   * @description Provides access to Security Groups
   */
  function SecurityGroupAPI(apiService, toastService) {
        // toast
        this.toast = function(type, message) {
           toastService.add(type, message);
        };


	    /**
	     * @name horizon.openstack-service-api.SecurityGroup.list
	     * @description
	     * Get a list of security groups.
	     *
	     * The listing result is an object with property "items". Each item is
	     * an image.
	     *
	     * @example
	     * The following is an example response:
	     * {
	     *     "items": [
	     *         {
	     *             "description": "Default security group",
	     *             "id": "4a4c9dd4-ffa0-454a-beaa-23e8fa569062",
	     *             "name": "default",
	     *             "security_group_rules": [
	     *                 {
	     *                     "direction": "ingress",
	     *                     "ethertype": "IPv4",
	     *                     "id": "22961412-fba1-4d0d-8eb8-d4460c921346",
	     *                     "port_range_max": null,
	     *                     "port_range_min": null,
	     *                     "protocol": null,
	     *                     "remote_group_id": "4a4c9dd4-ffa0-454a-beaa-23e8fa569062",
	     *                     "remote_ip_prefix": null,
	     *                     "security_group_id": "4a4c9dd4-ffa0-454a-beaa-23e8fa569062",
	     *                     "tenant_id": "3f867827f7eb45d4aa1d1395237f426b"
	     *                 }
	     *             ],
	     *             "tenant_id": "3f867827f7eb45d4aa1d1395237f426b"
	     *         }
	     *     ]
	     * }
	     */
	    this.query = function() {
	      return apiService.get('/api/network/securitygroups/')
	        .error(function () {
	        	toastService.add('error', gettext('Unable to retrieve security groups.'));
	      });
	    };
	    
	    /**
	     * @name horizon.openstack-service-api.SecurityGroup.createSecurityGroup
	     * @description
	     * Create a new SecurityGroup.  This returns the new SecurityGroup object on success.
	     *
	     * @param {Object} newSecurityGroup
	     * The SecurityGroup to create.
	     *
	     * @param {string} newSecurityGroup.name
	     * The name of the new security group. Required.
	     *
	     * @param {string} newSecurityGroup.description Optional.
	     */
	   this.createSecurityGroup = function(newSecurityGroup) {
	     return apiService.post('/api/network/securitygroups/', newSecurityGroup)
	       .error(function () {
	    	   toastService.add('error', gettext('Unable to create the secuirty group.'));
	       });
	   };

	   /**
	    * @name horizon.openstack-service-api.SecurityGroup.getSecurityGroup
	    * @description
	    * Get a single securitygroup by ID
	    * @param {string} sg_id
	    * Specifies the id of the securitygroup to request.
	    */
	   this.getSecurityGroup = function(sg_id) {
	     return apiService.get('/api/network/securitygroups/' + sg_id + '/')
	       .error(function () {
	    	   toastService.add('error', gettext('Unable to retrieve security group.'));
	     });
	   };

	   /**
	    * @name horizon.openstack-service-api.SecurityGroup.deleteSecurityGroup
	    * @description
	    * Delete a single securitygroup by ID
	    * @param {string} sg_id
	    * Specifies the id of the securitygroup to request.
	    */
	   this.deleteSecurityGroup = function(sg_id) {
	     return apiService.delete('/api/network/securitygroups/' + sg_id + '/');
	   };

	   /**
	    * @name horizon.openstack-service-api.SecurityGroup.editSecurityGroup
	    * @description edit securitygroup with a new name and new description
	    * @returns The new securitygroup object on success.
	    * @param {Object} id
	    * The old server id to update name
	    * @param {Object} param
	    * The name to update.
	    *
	    * Example param object
	    * {
	    *    "name": "myNewSecurityGroup",
	    *    "desc": "new desc"
	    * }
	    *
	    * Description of properties on the param
	    *
	    * @property {string} param.name
	    * The new name of the securitygroup. Required.
	    */
	   this.editSecurityGroup = function(sg_id, param) {
	     return apiService.patch('/api/network/securitygroups/' + sg_id + '/', param)
	       .error(function () {
	    	   toastService.add('error', gettext('Unable to edit security group.'));
	     });
	   };

	   /**
	    * @name horizon.openstack-service-api.SecurityGroup.createSecurityGroupRule
	    * @description
	    * Create a securitygroup using the parameters supplied in the
	    * newSecurityGroupRule. The required parameters:
	    *
	    * "direction", "ethertype", "ip_protocol", "from_port", "to_port"
	    * "cidr", "security_group"
	    *     All strings
	    *
	    *
	    * This returns the new securitygroup object on success.
	    */
	   this.createSecurityGroupRule = function(newSecurityGroupRule) {
	     return apiService.post('/api/network/securitygroups/' + newSecurityGroupRule.id + '/', newSecurityGroupRule)
	       .error(function () {
	    	   toastService.add('error', gettext('Unable to create the security group.'));
	       });
	   };
	   
	   /**
	    * @name horizon.openstack-service-api.SecurityGroup.deleteSecurityGroupRule
	    * @description
	    * Delete a single securitygroup rule by ID
	    * @param {string} sgr_id
	    * Specifies the id of the securitygroup rule to request.
	    */
	   this.deleteSecurityGroupRule = function(sgr_id) {
	     return apiService.delete('/api/network/securitygrouprule/' + sgr_id)
	       .error(function () {
	    	   toastService.add('error', gettext('Unable to delete security group rule.'));
	     });
	   };
	   
	   /**
	    * @name horizon.openstack-service-api.SecurityGroup.getServerSecurityGroup
	    * @description Get server securitygroup
	    * @param {Object} param
	    * The server to update.
	    *
	    * Example param object
	    * {
	    *    "server_id": "xxxxxxxxxxxx",
	    * }
	    *
	    * Specifies the id of the server to request.
	    */
	   this.getServerSecurityGroup = function(server_id) {
	     var param={server_id: server_id};
	     return apiService.get('/api/network/serversecuritygroups/', {params: param})
	       .error(function () {
	    	   toastService.add('error', gettext('Unable to retrieve server security group.'));
	     });
	   };

	   /**
	    * @name horizon.openstack-service-api.SecurityGroup.updateServerSecurityGroup
	    * @description Update server securitygroup
	    * @param {Object} param
	    * The server to update.
	    *
	    * Example param object
	    * {
	    *    "server_id": "xxxxxxxxxxxx",
	    *    "new_security_group_ids": {"xxxxxxxxxxxx","xxxxxxxxxxxx"}
	    * }
	    *
	    * Specifies the id of the server to request.
	    */
	   this.updateServerSecurityGroup = function(param) {
	     return apiService.post('/api/network/serversecuritygroups/', param)
	       .error(function () {
	    	   toastService.add('error', gettext('Unable to update server security group.'));
	     });
	   };
	   
	  }
}());
