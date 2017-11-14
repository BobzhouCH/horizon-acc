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
	  .service('horizon.openstack-service-api.overview', OverviewAPI);

    OverviewAPI.$inject = ['horizon.framework.util.http.service',
						 'horizon.framework.widgets.toast.service'];

    function OverviewAPI(apiService, toastService) {

        // toast
        this.toast = function (type, message) {
            toastService.add(type, message);
        };

        this.getInstanceStates = function () {
            return apiService.get('/api/nova/servers/', {})
            .then(function (data) {
                try {
                    if (data.status == 200) {
                        if (data.data && data.data.items) {
                            var instanceStates = {
                                ACTIVE: 0,
                                ERROR: 0,
                                Stopped: 0,
                            };
                            angular.forEach(data.data.items, function (item) {
                                if (item && item.status) {
                                    if (instanceStates.hasOwnProperty(item.status)) {
                                        instanceStates[item.status]++;
                                    }else {
                                        instanceStates.Stopped++;
                                    }
                                }
                            });

                            return instanceStates;
                        }
                    } else {
                        console.log(data);
                        toastService.add('error', gettext('Unable to retrieve instance states.'));
                    }
                    return [];
                } catch (e) {
                    console.log(data);
                    return [];
                }
            })
            .catch(function (data) {
                console.log(data);
                toastService.add('error', gettext('Unable to retrieve instance states.'));
                return [];
            });
        };
    }
}());
