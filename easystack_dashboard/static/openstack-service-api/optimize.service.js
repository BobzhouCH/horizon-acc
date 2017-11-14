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
	  .service('horizon.openstack-service-api.optimize', OptimizeAPI);
	
	  OptimizeAPI.$inject = ['horizon.framework.util.http.service',
	                       'horizon.framework.widgets.toast.service'];
	/**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.OptimizeAPI
	 * @description Provides access to Optimize APIs.
	 */
	function OptimizeAPI(apiService, toastService) {

		// Hosts
		/**
		 * @name horizon.openstack-service-api.OptimizeAPI.getHostRelationShips
		 * @description Get host list.
		 */



        //    $rootScope.static_url = static_url;
        this.getHostLists = function(data) {
            var url = '/api/optimize/vm-host-layouts/';
            //url ='/static/dashboard/admin/optimize/json/vm-host-layouts.json'; //local test
            var params = data ? {params:data} : '';
            return apiService.get(url,params)
              .error(function () {
                toastService.add('error', gettext('Unable to retrieve hosts.'));
              });
        };

        // Logs
		/**
		 * @name horizon.openstack-service-api.OptimizeAPI.get log list
		 * @description Get log list.
		 */
        this.getLogLists = function() {
            var url = '/api/optimizations';
            //url ='/static/dashboard/admin/optimize/json/log-tables.json'; //local test
            return apiService.get(url)
              .error(function () {
                toastService.add('error', gettext('Unable to retrieve logs.'));
              });
        };

        this.getIfHasTask = function(config) {
            var url =  '/api/optimizations/current-task';
            var params = config ? {params:config} : {};
            //url ='/static/dashboard/admin/optimize/json/strategies.json'; //local test
            return apiService.get(url, params)
              .error(function () {
                //toastService.add('error', gettext('Unable to retrieve strategies.'));
              });
        };

        this.getStrategy= function() {
            var url = '/api/optimizations/strategies/';
            //url ='/static/dashboard/admin/optimize/json/strategies.json'; //local test
            return apiService.get(url)
              .error(function () {
                toastService.add('error', gettext('Unable to retrieve strategies.'));
              });
        };

        this.getStrategyChart = function(config){
            var url = '/api/optimizations-preview';
            //url ='/static/dashboard/admin/optimize/json/optimizations-preview.json'; //local test
            return apiService.post(url, config)
              .error(function () {
                toastService.add('error', gettext('Unable to retrieve strategies.'));
              });
        }

        this.optimizeAction = function(config){
            var url = '/api/optimizations';
            return apiService.post(url, config)
              .error(function () {
                toastService.add('error', gettext('There was a problem communicating with the server, please try again.'));
              });
        }

        this.getTaskJob = function(taskId) {
            var url = '/api/optimizations/' + taskId;
            //url ='/static/dashboard/admin/optimize/json/log-tables-detail.json'; //local test
            return apiService.get(url)
              .error(function () {
                //toastService.add('error', gettext('Unable to retrieve strategies.'));
              });
        };

        this.getClusters = function() {
            var url =  '/api/optimizations/clusters/';
            return apiService.get(url)
              .error(function () {
                //toastService.add('error', gettext('Unable to retrieve strategies.'));
              });
        };

        this.updateClusterStrategy = function(config){
            var cluster_id = config.cluster_id;
            var strategy_id = config.strategy_id;
            var url = '/api/optimizations/clusters/' +cluster_id + '/strategy/'+ strategy_id + '/update/';
            return apiService.post(url, config)
              .error(function () {
                toastService.add('error', gettext('There was a problem communicating with the server, please try again.'));
              });
        }


	}
}());

