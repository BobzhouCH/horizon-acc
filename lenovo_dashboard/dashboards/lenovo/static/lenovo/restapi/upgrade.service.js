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
	  .service('horizon.openstack-service-api.upgrade', UpgradeAPI);

    UpgradeAPI.$inject = ['horizon.framework.util.http.service',
						 'horizon.framework.widgets.toast.service'];

    /**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.uusAPI
	 * @description Provides direct pass through to uus data with NO abstraction.
	 */
    function UpgradeAPI(apiService, toastService) {

        // toast
        this.toast = function (type, message) {
            toastService.add(type, message);
        };

        this.getUpgrades = function () {
            return apiService.get('/api/uus/upgrades/')
			.error(function (data) {
			    toastService.add('error', gettext('Unable to retrieve upgrade records.'));
			});
        };

        this.createUpgrade = function () {
             return apiService.post('/api/uus/upgrades/')
			.error(function (data) {
			    toastService.add('error', gettext('Failed to upgrade!'));
			});
        }
    }
}());
