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
	  .service('horizon.openstack-service-api.uus', UusAPI);

	UusAPI.$inject = ['horizon.framework.util.http.service',
						 'horizon.framework.widgets.toast.service'];

	/**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.uusAPI
	 * @description Provides direct pass through to uus data with NO abstraction.
	 */
	function UusAPI(apiService, toastService) {

		// toast
		this.toast = function (type, message) {
			toastService.add(type, message);
		};

		//00 GET HOSTS

		this.getHosts = function () {
			return apiService.get('/api/uus/hosts/')
			.error(function () {
				toastService.add('error', gettext('Unable to retrieve hosts.'));
			});
		};

		//01 GET HOST + UUID
		this.getHost = function(id){
			return apiService.get('/api/uus/host/' + id)
				.error(function () {
					toastService.add('error', gettext('Unable to retrieve host.'));
				});
		};

		//02 POST HOST + UUID
		this.postHost = function(updatedHost){
			var url = '/api/uus/host/' + updatedHost.id;
			return apiService.patch(url, updatedHost.operation)
				.error(function () {
					toastService.add('error', gettext('Unable to update host.'));
				});
		};

		//03 DELETE HOST + UUID
		this.deleteHost = function(id){// caution! double--msg sys!
			return apiService.delete('/api/uus/host/' + id)
                .success(function (data) {// data.status, data.msg
                    toastService.add('success', gettext('Successfully delete server!'));
                })
                .error(function (data) {
                    toastService.add('error', gettext('delete server failed!'));
                });
		};

		//04 POST HOST AUTH + UUID
		this.authenticate = function(id, uid, pwd){
			var url = '/api/uus/host/' + id + '/auth';
			return apiService.post(url, {'userid': uid,
                                         'password': pwd})
                .success(function (data) {
                    if (data && data.status && data.status == 'success') {
                        //toastService.add('success', gettext('successfully Auth server:') + ' ' + data.msg);
                    } else {
                        toastService.add('error', gettext('Auth server failed:') + ' ' + data.msg);
                    }
                })
				.error(function () {
					toastService.add('error', gettext('Unable to auth server.'));
				});
		};

        //04A POST HOST AUTH + UUID
		this.launchBMC = function(id, bmcip, enabled){
			var link_url = '#';
            if(bmcip != ''){
                if(enabled){
                    link_url = "https://"+bmcip+"/";
                }else{
                    link_url = "http://"+bmcip+"/";
                }
            }
            //window.location.assign('http://www.baidu.com');
            //window.location.href = link_url;
            window.open(link_url);

            //toastService.add('success', gettext('successfully launchBMC, link url is: '+link_url));
		};

		//04B POWER ON
		this.powerOn = function(id){
			var url = '/api/uus/host/' + id;
			return apiService.post(url, {'operation': 'poweron'})
                .success(function (data) {// data.status, data.msg
                    toastService.add('success', gettext('Successfully power on server!'));
                })
                .error(function (data) {
                    toastService.add('error', gettext('power on server failed!'));
                });
		};

		//04C POWER OFF
		this.powerOff = function(id){
			var url = '/api/uus/host/' + id;
			return apiService.post(url, {'operation': 'poweroff'})
				.success(function (data) {// data.status, data.msg
                    toastService.add('success', gettext('Successfully power off server!'));
                })
                .error(function (data) {
                    toastService.add('error', gettext('power off server failed!'));
                });
		};

		//04D POWER REBOOT
		this.powerReboot = function(id){
			var url = '/api/uus/host/' + id;
			return apiService.post(url, {'operation': 'reboot'})
				.success(function (data) {// data.status, data.msg
                    toastService.add('success', gettext('Successfully reboot server!'));
                })
                .error(function (data) {
                    toastService.add('error', gettext('reboot server failed!'));
                });
		};
                this.get_node_VM = function(host_name){
                         return	apiService.get('/api/nova/servers/'+host_name+'/node',{})
                	        .error(function(data){
                		toastService.add('error',gettext("Cannot get VM list"));
                		});
                };
                this.change_host_state = function(host_name,lock_status){
                	return apiService.post('/api/nova/host/'+host_name+'/status',{'status':lock_status});
                	         
                };
		this.lock_node = function(hostname, action) {
			var url = '/api/nova/host/'+hostname+'/lock';
			return apiService.post(url,{'action':action})
				.success(function(data){
				  if (data && data.status && data.status == 'success') {
                                           toastService.add('success',  gettext(data.msg));
                                     } 
                                  else {
                                           toastService.add('error', gettext(data.msg));
                                     }
                                                        
				})
				.error(function(data){
                                   toastService.add('error',gettext('Failed!'+data.msg));
				});
                
                };
		//05 GET HOST + UUID EVENT
		this.getHostEvent = function(id){
			return apiService.get('/api/uus/host/' + id + '/eventlogs')
				.error(function () {
					toastService.add('error', gettext('Unable to retrieve host event.'));
				});
		}

		this.getHistoryPower = function (id, interval, duration) {
		    var url = '/api/uus/host/' + id + '/power_hisroty';
		    return apiService.post(url, { 'interval': interval, 'duration': duration })
                .error(function (data) {
                    toastService.add('error', gettext('Unable to retrieve host history power cap data.'));
                });
		};

		this.getPowerCapping = function (id) {
		    var url = '/api/uus/host/' + id + '/power_capping';
		    return apiService.get(url);
		};

		this.postPowerCapping = function (id, newCap) {
		    var url = '/api/uus/host/' + id + '/power_capping';
		    return apiService.post(url, { 'newCap': newCap })
                .success(function (response) {
                    toastService.add('success', gettext('Successfully updated power cap value.'));
                })
                .error(function (data) {
                    toastService.add('error', gettext('Unable to update host power cap value.'));
                });
		};

		this.getComputeHA = function () {
			return apiService.get('/api/uus/policyha/')
			.error(function () {
				toastService.add('error', gettext('Unable to retrieve compute HA status.'));
			});
		};

		this.postComputeHA = function (halist) {
		    var url = '/api/uus/policyha/';
		    return apiService.post(url, { 'halist': halist })
                .success(function (response) {
                    toastService.add('success', gettext('Successfully submitted HA configuration.'));
                })
                .error(function (data) {
                    toastService.add('error', gettext('Unable to submit HA configuration.'));
                });
		};
	}
}());
