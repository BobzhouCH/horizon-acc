/**
 * Copyright 2016 Lenovo Inc.
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
	  .service('horizon.openstack-service-api.switch', SwitchAPI);

    SwitchAPI.$inject = ['horizon.framework.util.http.service',
						 'horizon.framework.widgets.toast.service'];

    /**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.uusAPI
	 * @description Provides direct pass through to uus data with NO abstraction.
	 */
    function SwitchAPI(apiService, toastService) {

        // toast
        this.toast = function (type, message) {
            toastService.add(type, message);
        };

        this.getSwitches = function () {
            return apiService.get('/api/uus/switches/')
			.error(function (data) {
			    toastService.add('error', gettext('Unable to retrieve switches.'));
			});
        };

        this.createSwitch = function (newSwitch) {
            return apiService.post('/api/uus/switches/', newSwitch)
              .error(function (data) {
                  toastService.add('error', gettext('Unable to add the switch.'));
              });
        };

        this.getSwitch = function (switch_id, pmswitch_id) {
            return apiService.get('/api/uus/switch/' + switch_id + '+' + pmswitch_id)
			.error(function (data) {
			    toastService.add('error', gettext('Unable to retrieve switch.'));
			});
        };

        this.deleteSwitch = function (switch_id, pmswitch_id) {
            return apiService.delete('/api/uus/switch/' + switch_id + '+' + pmswitch_id)
              .error(function (data) {
                  toastService.add('error', gettext('Unable to delete the switch.'));
              }
            );
        };

        this.editSwitch = function (switch_id, pmswitch_id, switch_data) {
            return apiService.put('/api/uus/switch/' + switch_id + '+' + pmswitch_id, switch_data)
              .error(function (data) {
                  toastService.add('error', gettext('Unable to edit the switch.'));
              }
            );
        };

        this.getNodes = function (switch_id, pmswitch_id) {
            return apiService.get('/api/uus/switch/' + switch_id + '+' + pmswitch_id + '/portmapping')
              .error(function (data) {
                  toastService.add('error', gettext('Unable to retrieve the nodes.'));
              });
        };

        this.createNode = function (switch_id, pmswitch_id, node_data) {
            return apiService.post('/api/uus/switch/' + switch_id + '+' + pmswitch_id + '/portmapping', node_data)
              .error(function (data) {
                  toastService.add('error', gettext('Unable to add the node.'));
              });
        };

        this.deleteNode = function (switch_id, pmswitch_id, node_ids) {
            var nodeIds = encodeURI(node_ids.join('+'));
            return apiService.delete('/api/uus/switch/' + switch_id + '+' + pmswitch_id + '/portmapping?nodes=' + nodeIds)
              .error(function (data) {
                  toastService.add('error', gettext('Unable to delete the node.'));
              }
            );
        };

        this.editNode = function (switch_id, pmswitch_id, node_data) {
            return apiService.patch('/api/uus/switch/' + switch_id + '+' + pmswitch_id + '/portmapping', node_data)
              .error(function (data) {
                  toastService.add('error', gettext('Unable to edit the node.'));
              }
            );
        };

        this.getNodeHostsList = function () {
            return apiService.get('/api/nova/hypervisors/All')
            .then(function (data) {
                try {
                    if (data.status == 200) {
                        if (data.data && data.data.items) {
                            var hostnames = [];
                            angular.forEach(data.data.items, function (item) {
                                if (item && item.hypervisor_hostname) {
                                    hostnames.push(item.hypervisor_hostname);
                                }
                            });

                            //hostnames.push('Test-01');
                            //hostnames.push('Test-02');
                            //hostnames.push('Test-03');
                            //hostnames.push('Test-04');
                            //hostnames.push('Test-05');

                            return hostnames;
                        }
                    } else {
                        console.log(data);
                        toastService.add('error', gettext('Unable to retrieve node hosts list.'));
                    }
                    return [];
                } catch (e) {
                    console.log(data);
                    return [];
                }
            })
            .catch(function (data) {
                console.log(data);
                toastService.add('error', gettext('Unable to retrieve node hosts list.'));
                return [];
            });
        };
    }
}());
