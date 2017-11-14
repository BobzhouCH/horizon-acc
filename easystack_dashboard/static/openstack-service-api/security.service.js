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
	  .service('horizon.openstack-service-api.security', SecurityAPI);

    SecurityAPI.$inject = ['horizon.framework.util.http.service',
						 'horizon.framework.widgets.toast.service'];

    /**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.uusAPI
	 * @description Provides direct pass through to uus data with NO abstraction.
	 */
    function SecurityAPI(apiService, toastService) {

        this.getLocalSettings = function () {
            return apiService.get('/api/uus/security/')
			.error(function (data) {
			    toastService.add('error', gettext('Unable to retrieve settingInfo.'));
			});
        };

        this.editLocalSettings = function (settingData) {
            return apiService.put('/api/uus/security/', settingData)
			.error(function (data) {
			    toastService.add('error', gettext('Unable to edit settingInfo.'));
			});
        };

    }
}());
