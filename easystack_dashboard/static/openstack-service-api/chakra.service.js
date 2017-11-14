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
 *
 * author: Chao.Song
 */
(function(){
	'use strict';

	angular
	.module('horizon.openstack-service-api')
	.service('horizon.openstack-service-api.chakra',ChakraAPI);

	ChakraAPI.$inject = ['horizon.framework.util.http.service',
	                     'horizon.framework.widgets.toast.service'];

	/**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.ChakraAPI
	 * @description Provides access to Chakra APIs.
	 */

	function ChakraAPI(apiService, toastService){
		//Account
		/**
		 * @name horizon.openstack-service-api.ChakraAPI.getAccount
		 * @description Get account info.
		 */
		this.getAccounts = function(){
	        return apiService.get('/api/chakra/accounts/').error(
				function(){
					toastService.add('error',gettext('Unable to get accout info.'));
				}
			);
		};

		this.getAccount = function(){
			return apiService.get('/api/chakra/account/').error(
					function(){
						toastService.add('error',
								gettext('Unable to get accout info.'));
					}
			);
		};

		this.createAccount = function(account){
			return apiService.post('/api/chakra/account/',account).error(
				function(){
					toastService.add('error',
							gettext('Unable to create account.'));
				}
			);
		};

		//Invcodes
		/**
		 * @name horizon.openstack-service-api.chakraAPI.getInvcodes
		 * @description Get invitation codes
		 */
		this.getInvCodes = function(){
			return apiService.get('/api/chakra/invcodes/').error(
					function(){
						toastService.add('error',
								gettext('Unable to get invitation codes.'))
					});
		};

		this.createInvCodes = function(invcodes){
			return apiService.post('/api/chakra/invcodes/', invcodes).error(
					function(){
						toastService.add('error',gettext('Unable to get invitation codes.'));
					});
		};

		//Invcode
		this.getInvCode = function(invcode){
			return apiService.get('/api/chakra/invcode/'+invcode).error(
					function(){
						toastService.add('error',gettext('Unable to get invitation codes.'))
					});
		};

		this.deleteInvCodes = function(id){
			return apiService.delete('/api/chakra/invcode/'+id).error(
					function(){
						toastService.add('error', gettext('Unable to get invitation codes.'));
					});
		};

		//Payment
		/**
		 * @name horizon.openstack-service-api.ChakraAPI.getPayment
		 * @description Get payment info of current account.
		 */
		this.getPayment = function(id){
			return apiService.get('/api/chakra/payment/'+id).error(
					function(){
						toastService.add('error',gettext('Unable to get payment info.'))
					});
		};
		/**
		 * @name horizon.openstack-service-api.ChakraAPI.createPayment
		 * @description Create a payment for charge
		 */
		this.createPayment = function(payment){
			return apiService.post('/api/chakra/payment/', payment).error(
					function(data){
						toastService.add('error', gettext(data));
					});
		};
	}
}());
