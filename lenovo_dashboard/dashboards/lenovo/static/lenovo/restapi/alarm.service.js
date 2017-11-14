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
	  .service('horizon.openstack-service-api.alarm', AlarmAPI);

    AlarmAPI.$inject = ['horizon.framework.util.http.service',
						 'horizon.framework.widgets.toast.service'];

    function AlarmAPI(apiService, toastService) {

        // toast
        this.toast = function (type, message) {
            toastService.add(type, message);
        };

        this.getResourceAlarms = function () {
            return apiService.get('/api/ceilometer/alerts/')
            .then(function (data) {
                try {
                    if (data.status == 200) {
                        if (data.data && data.data.items && data.data.items.length > 0) {
                            var alarmCount = 0;
                            angular.forEach(data.data.items, function (item) {
                                if (item && item.state && item.state == 'alarm') {
                                    alarmCount++;
                                }
                            });
                            return alarmCount;
                        }
                    } else {
                        //toastService.add('error', gettext('Unable to retrieve resource alarms.'));
                    }
                    return 0;
                } catch (e) {
                    //console.log(e);
                    //toastService.add('error', e);
                    return 0;
                }
            })
            .catch(function (data) {
                //console.log(data);
                //toastService.add('error', gettext('Unable to retrieve resource alarms.'));
                return 0;
            });
        };

        this.getHardwareAlarms = function () {
            return apiService.get('/api/uus/hosts/')
            .then(function (data) {
                try {
                    if (data.status == 200) {
                        if (data.data && data.data.stat_info && data.data.stat_info.alerts) {
                            var alarms = data.data.stat_info.alerts;
                            var alarmCount = 0;
                            if (alarms.critical) {
                                alarmCount = alarmCount + alarms.critical;
                            }

                            if (alarms.warning) {
                                alarmCount = alarmCount + alarms.warning;
                            }

                            return alarmCount;
                        }
                    } else {
                        //toastService.add('error', gettext('Unable to retrieve hardware alarms.'));
                    }
                    return 0;
                } catch (e) {
                    //console.log(e);
                    //toastService.add('error', e);
                    return 0;
                }
            })
            .catch(function (data) {
                //console.log(data);
                //toastService.add('error', gettext('Unable to retrieve hardware alarms.'));
                return 0;
            });
        };
    }
}());
