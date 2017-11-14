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
    .service('horizon.openstack-service-api.neutron', NeutronAPI);

  NeutronAPI.$inject = ['horizon.framework.util.http.service',
                        'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.neutron
   * @description Provides access to Neutron APIs.
   */
  function NeutronAPI(apiService, toastService) {

          //Agents
          /**
           * @name horizon.openstack-service-api.neutronAPI.getAgents
           * @description
           * Get all neutron agents
           */
          this.getAgents = function() {
            return apiService.get('/api/neutron/agents/')
              .error(function () {
                toastService.add('error', gettext('Unable to get neutron agents.'));
            });
          };

         // Networks

         /**
          * @name horizon.openstack-service-api.neturonAPI.getNetworks
          * @description
          * Get a list of networks for a tenant.
          *
          * The listing result is an object with property "items". Each item is
          * a network.
          */
        this.getNetworks = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/neutron/networks/', config)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve networks.'));
            });
        };

         /**
          * @name horizon.openstack-service-api.neutronAPI.createNetwork
          * @description
          * Create a new network.
          * @returns The new network object on success.
          *
          * @param {Object} newNetwork
          * The network to create.  Required.
          *
          * Example new network object
          * {
          *    "name": "myNewNetwork",
          *    "admin_state_up": true,
          *    "net_profile_id" : "asdsarafssdaser",
          *    "shared": true,
          *    "tenant_id": "4fd44f30292945e481c7b8a0c8908869
          * }
          *
          * Description of properties on the network object
          *
          * @property {string} newNetwork.name
          * The name of the new network. Optional.
          *
          * @property {boolean} newNetwork.admin_state_up
          * The administrative state of the network, which is up (true) or
          * down (false). Optional.
          *
          * @property {string} newNetwork.net_profile_id
          * The network profile id. Optional.
          *
          * @property {boolean} newNetwork.shared
          * Indicates whether this network is shared across all tenants.
          * By default, only adminstative users can change this value. Optional.
          *
          * @property {string} newNetwork.tenant_id
          * The UUID of the tenant that will own the network.  This tenant can
          * be different from the tenant that makes the create network request.
          * However, only administative users can specify a tenant ID other than
          * their own.  You cannot change this value through authorization
          * policies.  Optional.
          *
          */
        this.createNetwork = function(newNetwork) {
          return apiService.post('/api/neutron/networks/', newNetwork)
            .error(function () {
                toastService.add('error', gettext('Unable to create the network.'));
            });
        };

        /**
         * @name horizon.openstack-service-api.neutronAPI.getNetwork
         * @description
         * Get a single network by ID
         * @param {string} network_id
         * Specifies the id of the network to request.
         */
        this.getNetwork = function(network_id) {
          return apiService.get('/api/neutron/networks/' + network_id)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve network.'));
          });
        };

        /**
         * @name horizon.openstack-service-api.neutronAPI.deleteNetwork
         * @description
         * Delete a single network by ID
         * @param {string} network_id
         * Specifies the id of the network to request.
         */
        this.deleteNetwork = function(network_id) {
          return apiService.delete('/api/neutron/networks/' + network_id)
            .error(function (message, status_code) {
               if (status_code == 409)
                   {
                       if(message.indexOf('There are one or more ports still in use on the network')>=0){
                           toastService.add('error', gettext('There are one or more subnet still have instances, routers or loadbalancers on the network, can not delete this network, please detach resources firstly.'));
                       }
                       else{
                           toastService.add('error', gettext(message));
                       }
                   }
               else
                   {
                    toastService.add('error', gettext('Unable to delete network.'));
                   }
            });
        };

        /**
         * @name horizon.openstack-service-api.neutronAPI.editNetwork
         * @description edit network
         * @returns The new network object on success.
         */
        this.editNetwork = function(id, param) {
          return apiService.patch('/api/neutron/networks/' + id, param)
            .error(function (message, status_code) {
               if (status_code == 409)
                   {
                       if(message.indexOf("'"+param.name+"'"+' already exist')>=0){
                           toastService.add('error', interpolate(gettext("The network named '%s' already exists."), [param.name]));
                       }
                       else{
                           toastService.add('error', gettext(message));
                       }
                   }
               else
                   {
                    toastService.add('error', gettext('Unable to edit network.'));
                   }
            });
        };

        // Subnets

         /**
          * @name horizon.openstack-service-api.neutronAPI.getSubnets
          * @description
          * Get a list of subnets for a network.
          *
          * The listing result is an object with property "items". Each item is
          * a subnet.
          *
          * @param {string} network_id
          * The network id to retrieve subnets for. Required.
          */
        this.getSubnets = function(network_id, ensure_with_router, all_projects) {
          var config = {params : {
            network_id: network_id,
          }};
          if (ensure_with_router) {
            config.params['ensure_with_router'] = ensure_with_router;
          }
          if (all_projects) {
            config.params['all_projects'] = all_projects;
          }

          return apiService.get('/api/neutron/subnets/', config).error(function () {
            toastService.add('error', gettext('Unable to retrieve subnets.'));
          });
        };

         /**
          * @name horizon.openstack-service-api.neutronAPI.createSubnet
          * @description
          * Create a Subnet for given Network.
          * @returns The JSON representation of Subnet on success.
          *
          * @param {Object} newSubnet
          * The subnet to create.
          *
          * Example new subnet object
          * {
          *    "network_id": "d32019d3-bc6e-4319-9c1d-6722fc136a22",
          *    "ip_version": 4,
          *    "cidr": "192.168.199.0/24",
          *    "name": "mySubnet",
          *    "tenant_id": "4fd44f30292945e481c7b8a0c8908869,
          *    "allocation_pools": [
          *       {
          *          "start": "192.168.199.2",
          *          "end": "192.168.199.254"
          *       }
          *    ],
          *    "gateway_ip": "192.168.199.1",
          *    "id": "abce",
          *    "enable_dhcp": true,
          * }
          *
          * Description of properties on the subnet object
          * @property {string} newSubnet.network_id
          * The id of the attached network. Required.
          *
          * @property {number} newSubnet.ip_version
          * The IP version, which is 4 or 6. Required.
          *
          * @property {string} newSubnet.cidr
          * The CIDR. Required.
          *
          * @property {string} newSubnet.name
          * The name of the new subnet. Optional.
          *
          * @property {string} newSubnet.tenant_id
          * The ID of the tenant who owns the network.  Only administrative users
          * can specify a tenant ID other than their own. Optional.
          *
          * @property {string|Array} newSubnet.allocation_pools
          * The start and end addresses for the allocation pools.  Optional.
          *
          * @property {string} newSubnet.gateway_ip
          * The gateway IP address.  Optional.
          *
          * @property {string} newSubnet.id
          * The ID of the subnet. Optional.
          *
          * @property {boolean} newSubnet.enable_dhcp
          * Set to true if DHCP is enabled and false if DHCP is disabled. Optional.
          *
          */
        this.createSubnet = function(newSubnet) {
          return apiService.post('/api/neutron/subnets/', newSubnet)
            .error(function () {
                toastService.add('error', gettext('Unable to create the subnet.'));
            });
        };

        /**
         * @name horizon.openstack-service-api.neutronAPI.getSubnet
         * @description
         * Get a single subnet by ID
         * @param {string} subnet_id
         * Specifies the id of the subnet to request.
         */
        this.getSubnet = function(subnet_id) {
          return apiService.get('/api/neutron/subnets/' + subnet_id)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve subnet.'));
          });
        };

        /**
         * @name horizon.openstack-service-api.neutronAPI.deleteSubnet
         * @description
         * Delete a single subnet by ID
         * @param {string} subnet_id
         * Specifies the id of the subnet to request.
         */
        this.deleteSubnet = function(subnet_id) {
          return apiService.delete('/api/neutron/subnets/' + subnet_id)
            .error(function (message, status_code) {
               if (status_code == 409)
                   {
                       if(message.indexOf('One or more ports have an IP allocation from this subnet.')>=0){
                           toastService.add('error', gettext('There are one or more instances or routers on the subnet, can not delete this subnet, please detach resources firstly.'));
                       }
                       else{
                           toastService.add('error', gettext(message));
                       }
                   }
               else
                   {
                    toastService.add('error', gettext('Unable to delete subnet.'));
                   }
            });
        };

        /**
         * @name horizon.openstack-service-api.neutronAPI.editSubnet
         * @description edit subnet
         * @returns The new subnet object on success.
         */
        this.editSubnet = function(id, param) {
          return apiService.patch('/api/neutron/subnets/' + id, param)
            .error(function () {
                toastService.add('error', gettext('Unable to edit subnet.'));
          });
        };


        // Ports

         /**
          * @name horizon.openstack-service-api.neutronAPI.getPorts
          * @description
          * Get a list of ports for a network.
          *
          * The listing result is an object with property "items". Each item is
          * a port.
          *
          * @param {string} device_id
          * The device id to retrieve ports for. Required.
          */
        this.getPorts = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/neutron/ports/', config)
            .error(function () {
                toastService.add('error', gettext('Unable to retrieve ports.'));
            });
        };

        this.getDevicePorts = function(device_id, params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/neutron/device/ports/'+device_id, config)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve ports.'));
            });
        };

        this.getComputePorts = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/neutron/compute/ports/', config)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve ports.'));
            });
        };

        this.getComputeAndFreePorts = function(params) {
          var config = (params) ? {'params': params} : {};
          return apiService.get('/api/neutron/computeAndFreePort/ports/', config)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve ports.'));
            });
        };

         this.createQosPolicyAndRule = function(qospolicyandrule){
           return apiService.post('/api/neutron/qospolicyandrules/', qospolicyandrule)
            .error(function(){
              toastService.add('error', gettext('Unable to create qos policy.'));
          })
       };


        /**
         * @name horizon.openstack-service-api.neutronAPI.createQosPolicy
         * @description
         * Create a qos policy.
         * @returns The JSON representation of qos policy on success.
         *
         * @param {Object} newPort
         * The qos policy to create.
         *
         *
         * Description of properties on the qos policy object
         * @property {string} newQosPolicy.name
         * Human-readable name of the resource. required.
         *
         * @property {string} newSubnet.description
         * The human-readable description for the resource. Optional.
         *
         * @property {string} newSubnet.shared
         * Admin-only. Indicates whether this network is shared across all tenants.. Optional.
         *
         */

        this.createQosPolicy = function(newQosPolicy){
          return apiService.post('/api/neutron/qospolicys/', newQosPolicy)
            .error(function(){
              toastService.add('error', gettext('Unable to create qos policy.'));
          })
        };

        /**
        * @name horizon.openstack-service-api.neutronAPI.getQosPolicy
        * @description
        * Get a single qospolicy by ID
        * @param {string} policy_id
        * Specifies the id of the qospolicy to request.
        */

        this.getQosPolicy = function(policy_id){
          return apiService.get('/api/neutron/qospolicy/' + policy_id)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve qos policy.'));
          });
        };

        /**
        * @name horizon.openstack-service-api.neutronAPI.editQosPolicy
        * @description edit Qos Policy
        * @returns The new Qos Policy object on success.
        */
       this.editQosPolicy = function(policy_id, param) {
         return apiService.patch('/api/neutron/qospolicy/' + port_id, param)
           .error(function () {
             toastService.add('error', gettext('Unable to edit qos policy.'));
         });
       };

       /**
        * @name horizon.openstack-service-api.neutronAPI.deleteQosPolicy
        * @description
        * Delete a single port by ID
        * @param {string} port_id
        * Specifies the id of the port to request.
        */
       this.deleteQosPolicy = function(policy_id) {
         return apiService.delete('/api/neutron/qospolicy/' + policy_id)
           .error(function () {
               toastService.add('error', gettext('Unable to delete qos policy.'));
         });
       };

       this.getQosPolicies = function(all_projects) {
          if (all_projects) {
            config.params['all_projects'] = all_projects;
          }
          return apiService.get('/api/neutron/qospolicy/', config)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve qos policies.'));
          });
       };

       this.getBandWidthLimitRules = function(rule_id, params){
          var config = (params)? params :{};
          return apiService.get('/api/neutron/bandwidthlimitrules/'+rule_id, config)
            .error(function () {
              toastService.add('error', gettext('Unable to retrieve band width limit rule.'));
          });
       };

       this.createBandWidthLimitRules = function(newBandWidthLimitRule){
          return apiService.post('/api/neutron/bandwidthlimitrules/', newBandWidthLimitRule)
            .error(function(){
              toastService.add('error', gettext('Unable to create band width limit rule.'));
          })
        };

       this.editBandWidthLimitRules = function(rule_id, newBandWidthLimitRule){
          return apiService.patch('/api/neutron/bandwidthlimitrules/'+rule_id, newBandWidthLimitRule)
            .error(function(){
              toastService.add('error', gettext('Unable to edit band width limit rule.'));
          })
        };

       this.deleteBandWidthLimitRules = function(rule_id, newBandWidthLimitRule){
          return apiService.delete('/api/neutron/bandwidthlimitrules/'+rule_id, newBandWidthLimitRule)
            .error(function(){
              toastService.add('error', gettext('Unable to edit band width limit rule.'));
          })
       };







        /**
         * @name horizon.openstack-service-api.neutronAPI.createPort
         * @description
         * Create a Port for given Network.
         * @returns The JSON representation of Port on success.
         *
         * @param {Object} newPort
         * The port to create.
         *
         *
         * Description of properties on the port object
         * @property {string} newPort.network_id
         * The id of the attached network. Required.
         *
         * @property {number} newPort.device_id
         * Device id attached to the port. Optional.
         *
         * @property {string} newSubnet.tenant_id
         * Tenant id of the port created. Optional.
         *
         * @property {string} newSubnet.name
         * Name of the port created. Optional.
         *
         */
       this.createPort = function(newPort) {
         return apiService.post('/api/neutron/ports/', newPort)
           .error(function () {
               toastService.add('error', gettext('Unable to create the port.'));
           });
       };

       /**
        * @name horizon.openstack-service-api.neutronAPI.getPort
        * @description
        * Get a single port by ID
        * @param {string} port_id
        * Specifies the id of the port to request.
        */
       this.getPort = function(port_id) {
         return apiService.get('/api/neutron/port/' + port_id)
           .error(function () {
               toastService.add('error', gettext('Unable to retrieve port.'));
         });
       };

       /**
        * @name horizon.openstack-service-api.neutronAPI.deletePort
        * @description
        * Delete a single port by ID
        * @param {string} port_id
        * Specifies the id of the port to request.
        */
       this.deletePort = function(port_id) {
         return apiService.delete('/api/neutron/port/' + port_id)
           .error(function () {
               toastService.add('error', gettext('Unable to delete port.'));
         });
       };

       /**
        * @name horizon.openstack-service-api.neutronAPI.editPort
        * @description edit port
        * @returns The new port object on success.
        */
       this.editPort = function(port_id, param) {
         return apiService.patch('/api/neutron/port/' + port_id, param)
           .error(function () {
               toastService.add('error', gettext('Unable to edit port.'));
         });
       };

       // Routers

       /**
        * @name horizon.openstack-service-api.neutronAPI.getRouters
        * @description
        * Get a list of routers.
        *
        * @param retrieve all or just current project
        * The listing result is an object with property "items". Each item is
        * a router.
        *
        */
        this.getRouters = function(retrieve_all) {
            return apiService.get('/api/neutron/routers/' + retrieve_all)
              .error(function () {
                  toastService.add('error', gettext('Unable to retrieve routers.'));
              });
        };

      /**
       * @name horizon.openstack-service-api.neutronAPI.createRouter
       * @description
       * Create a Router.
       * @returns The JSON representation of Router on success.
       *
       * @param {Object} newRouter
       * The router to create.
       *
       * @property {string} newRouter.name
       * Name of the router created. Required.
       *
       */
         this.createRouter = function(newRouter) {
           return apiService.post('/api/neutron/routers/', newRouter)
             .error(function () {
                 toastService.add('error', gettext('Unable to create the routers.'));
             });
         };


           /**
            * @name horizon.openstack-service-api.neutronAPI.getRouter
            * @description
            * Get a single router by ID
            * @param {string} router_id
            * Specifies the id of the router to request.
            */
           this.getRouter = function(router_id) {
             return apiService.get('/api/neutron/router/' + router_id)
               .error(function () {
                   toastService.add('error', gettext('Unable to retrieve router.'));
             });
           };

           /**
            * @name horizon.openstack-service-api.neutronAPI.deleteRouter
            * @description
            * Delete a single router by ID
            * @param {string} router_id
            * Specifies the id of the router to request.
            */
           this.deleteRouter = function(router_id, routerInfo) {
             return apiService.delete('/api/neutron/router/' + router_id)
               .error(function (message, status_code) {
                  var id = message.split(' ')[1];
                  if (status_code == 409){
                    if(message.indexOf('still has ports')>=0){
                      var errMessage     = gettext('Delete router %s failed, reason: router has connected subnet.'),
                          connectMessage = interpolate(errMessage, [routerInfo[id]]);

                       toastService.add('error', connectMessage);
                    }
                    else{
                       toastService.add('error', gettext(message));
                    }
                  }
                  else{
                    toastService.add('error', gettext('Unable to delete router.'));
                  }
             });
           };

           /**
            * @name horizon.openstack-service-api.neutronAPI.editRouter
            * @description edit router
            * @returns The new router object on success.
            */
           this.editRouter = function(router_id, param) {
             return apiService.patch('/api/neutron/router/' + router_id, param)
               .error(function () {
                   toastService.add('error', gettext('Unable to edit router.'));
             });
           };

            /**
             * @name horizon.openstack-service-api.neutronAPI.addinterfaceRouter
             * @description
             * Add a interface to router by ID
             * @param {string} router_id
             * Specifies the id of the router to request.
             */
            this.addinterfaceRouter = function(router_id, param) {
              return apiService.post('/api/neutron/router/' + router_id + '/addinterface', param)
                .error(function (data) {
                      if(data.indexOf('overlaps with cidr')>=0){
                           toastService.add('error', gettext('Subnet connected cidr is overlap with subnets connected to router.'));
                       }
                       else{
                           toastService.add('error', gettext(data));
                       }
              });
            };

            /**
             * @name horizon.openstack-service-api.neutronAPI.removeinterfaceRouter
             * @description
             * Remove a interface to router by ID
             * @param {string} router_id
             * Specifies the id of the router to request.
             */
            this.removeinterfaceRouter = function(router_id, param) {
              return apiService.post('/api/neutron/router/' + router_id + '/removeinterface', param)
                .error(function () {
                    //toastService.add('error', gettext('Unable to remove interface to router.'));
              });
            };

            /**
             * @name horizon.openstack-service-api.neutronAPI.addgatewayRouter
             * @description
             * Add a gateway to router by ID
             * @param {string} router_id
             * Specifies the id of the router to request.
             */
            this.addgatewayRouter = function(router_id, param) {
              return apiService.post('/api/neutron/router/' + router_id + '/addgateway', param)
                .error(function () {
                    toastService.add('error', gettext('Unable to add gateway to router.'));
              });
            };

            /**
             * @name horizon.openstack-service-api.neutronAPI.removegatewayRouter
             * @description
             * Remove a gateway to router by ID
             * @param {string} router_id
             * Specifies the id of the router to request.
             */
            this.removegatewayRouter = function(router_id) {
              return apiService.post('/api/neutron/router/' + router_id + '/removegateway')
                .error(function () {
                    toastService.add('error', gettext('Unable to remove gateway from router.'));
              });
            };

            // get PFVFNum
            this.getPFVFNumUsed = function (name) {
              return apiService.get('/api/neutron/pssrgetpfvfnum/'+name)
                .error(function () {
                  toastService.add('error', gettext('Unable to get pfvfnumused.'));
                });
            }

  }
}());
