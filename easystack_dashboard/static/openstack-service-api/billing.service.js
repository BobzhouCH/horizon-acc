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
(function() {
	'use strict';

	  angular
	  .module('horizon.openstack-service-api')
	  .service('horizon.openstack-service-api.billing', BillingAPI);
	
	  BillingAPI.$inject = ['horizon.framework.util.http.service',
	                       'horizon.framework.widgets.toast.service'];
	/**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.BillingAPI
	 * @description Provides access to Billing APIs.
	 */
	function BillingAPI(apiService, toastService) {

		// CurrentPrice
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getCurrentPrice
		 * @description Get current price.
		 */
		this.getCurrentPrice = function() {
			return apiService.get('/api/billing/currentprice/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get current price.'));
					});
		};

		// PriceFixHistory
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getFixHistory
		 * @description get price fix history
		 */
		this.getFixHistory = function() {
			return apiService.get('/api/billing/pricefixhistory/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get price fixing history.'));
					});
		};

		// PriceFix
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getPriceFix
		 * @description Get a price fix by ID
		 */
		this.getPriceFix = function(id) {
			return apiService.get('/api/billing/pricefix/' + id).error(
					function() {
						toastService.add('error',
								gettext('Unable to get price fixing details.'));
					});
		};

		this.getPriceFixing = function(id) {
			return apiService.get('/api/billing/pricefixing/' + id).error(
					function(data) {
						toastService.add('error', gettext(data));
					});
		};

		this.deletePriceFixing = function(id) {
			return apiService.delete('/api/billing/pricefixing/' + id).error(
					function(data) {
						toastService.add('error', gettext(data));
					});
		};

		/**
		 * @name horizon.openstack-service-api.BillingAPI.editPriceFix
		 * @description Update a price fix by ID
		 */
		this.editPriceFix = function(new_fix) {
			var url = '/api/billing/pricefix/' + new_fix.id + '/';
			return apiService.put(url, new_fix).error(
					function(data, status) {
						if (status != 500){
						    toastService.add('info', gettext(data));
						}else{
							toastService.add('error', gettext(data));
						}
					});
		};

		/**
		 * @name horizon.openstack-service-api.BillingAPI.createPriceFix
		 * @description Create a price fix
		 */
		this.createPriceFix = function(fix) {
			return apiService.post('/api/billing/pricefix/default/', fix).error(
					function() {
						toastService.add('error',
								gettext('Unable to create price fixing.'));
					});
		};

		// PriceItems
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getPriceItems
		 * @description Get a price items by ID
		 */
		this.getPriceItems = function(ptype) {
			return apiService.get('/api/billing/priceitems/' + ptype).error(
					function() {
						toastService.add('error',
								gettext('Unable to get price items.'));
					});
		};

		/**
		 * @name horizon.openstack-service-api.BillingAPI.editPriceItems
		 * @description Update a price fix by ID
		 */
		this.editPriceItems = function(new_items) {
			var url = '/api/billing/priceitems/' + new_items.id;
			return apiService.put(url, new_items).error(
					function() {
						toastService.add('error',
								gettext('Unable to update price items.'));
					});
		};

		/**
		 * @name horizon.openstack-service-api.BillingAPI.createPriceItem
		 * @description Create a price item
		 */
		this.createPriceItems = function(item) {
			return apiService.post('/api/billing/priceitems/', item).error(
					function() {
						toastService.add('error',
								gettext('Unable to create price item.'));
					});
		};

		/**
		 * @name horizon.openstack-service-api.BillingAPI.deletePriceItem
		 * @description delete a price item
		 */
		this.deletePriceItem = function(item_id) {
			return apiService.delete('/api/billing/priceitem/' + item_id).error(
					function() {
						toastService.add('error',
								gettext('Unable to delete price item.'));
					});
		};

		// PriceDetails
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getPriceDetails
		 * @description Get a price details
		 */
		this.getPriceDetails = function() {
			return apiService.get('/api/billing/pricedetails/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get price details.'));
					});
		};

		/**
		 * @name horizon.openstack-service-api.BillingAPI.editPriceDetials
		 * @description Update a price detail by ID
		 */
		this.editPriceDetails = function(price) {
			var url = '/api/billing/pricedetails/' + price.id;
			return apiService.put(url, price).error(
					function() {
						toastService.add('error',
								gettext('Unable to update price items.'));
					});
		};

		/**
		 * @name horizon.openstack-service-api.BillingAPI.createPriceDetails
		 * @description Create a price details
		 */
		this.createPriceDetails = function(price) {
			return apiService.post('/api/billing/pricedetails/', price).error(
					function() {
						toastService.add('error',
								gettext('Unable to create price details.'));
					});
		};


		// Product
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getProduct
		 * @description Get products of this account.
		 */
		this.getProduct = function() {
			return apiService.get('/api/billing/product/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get product info.'));
					});
		};
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getProduct
		 * @description Get products of this account.
		 */
		this.getProductById = function(id) {
			return apiService.get('/api/billing/product/resource_id=' + id).error(
					function() {
						toastService.add('error',
								gettext('Unable to get product info.'));
					});
		};
		
		// Statistic
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getCost
		 * @description Get statistic info of consumption records
		 */
		this.getCost = function(id) {
			return apiService.get('/api/billing/statistic/cost/' + id).error(
					function() {
						toastService.add('error',
								gettext('Unable to get statistic info.'));
					});
		};
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getCurrent
		 * @description Get statistic info of current consumption
		 */
		this.getCurrent = function(id) {
			return apiService.get('/api/billing/statistic/current/' + id).error(
					function() {
						toastService.add('error',
								gettext('Unable to get statistic info.'));
					});
		};


		// BillingItem
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getBillingItem
		 * @description Get billing details info of some product
		 */
		this.getBillingItem = function(id) {
			return apiService.get('/api/billing/billingitem/'+id).error(
					function() {
						toastService.add('error',
								gettext('Unable to get billing item info.'));
					});
		};


		// RsourceName
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getResourceName
		 * @description Get display name by resource id
		 */
		this.getResourceName = function(id) {
			return apiService.get('/api/ceilometer/rename/'+id).error(
					function() {
						toastService.add('error',
								gettext('Unable to get resource name.'));
					});
		};

		// EnableBilling
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getEnableBilling
		 * @description Get enable billing or not
		 */
		this.getEnableBilling = function() {
			return apiService.get('/api/billing/enablebilling/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get enable billing status.'));
					});
		};

		// ActiveFixing
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getActiveFixing
		 * @description Get active fixing
		 */
		this.getActiveFixing = function() {
			return apiService.get('/api/billing/activefixing/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get active fixing status.'));
					});
		};

		// Pay
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getRechargeWays
		 * @description Get enabled recharge ways
		 */
		this.getRechargeWays = function() {
			return apiService.get('/api/billing/recharge/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get recharge ways.'));
					});
		};

		// Balance
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getBalance
		 * @description Get active fixing
		 */
		this.getBalance = function() {
			return apiService.get('/api/billing/balance/').error(
					function(data) {
						toastService.add('error', gettext(data));
					});
		};
		// Product
		/**
		 * @name horizon.openstack-service-api.BillingAPI.getAdminProduct
		 * @description Get products of this account.
		 */
		this.getAdminProduct = function() {
			return apiService.get('/api/billing/admin/product/').error(
					function() {
						toastService.add('error',
								gettext('Unable to get product info.'));
					});
		};
	}
}());

