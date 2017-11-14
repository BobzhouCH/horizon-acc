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
  .service('horizon.openstack-service-api.ceilometer', CeilometerAPI);

  CeilometerAPI.$inject = ['horizon.framework.util.http.service',
                       'horizon.framework.widgets.toast.service'];
    /**
	 * @ngdoc service
	 * @name horizon.openstack-service-api.caeilometerAPI
	 * @description Provides access to Ceilometer APIs.
	 */
  function CeilometerAPI(apiService, toastService) {
     // Alerts
     /**
	 * @name horizon.openstack-service-api.caeilometerAPI.getAlerts
	 * @description Get a list of alerts.
	 * The listing result is an object with property "items". Each item is a
	 * alert.
	 */
    this.getAlerts = function() {
        return apiService.get('/api/ceilometer/alerts/now/')
        .error(function () {
            toastService.add('error', gettext('Unable to retrieve alerts.'));
      });
    };
    this.getAlertsHistory = function(){
    	
         return apiService.get('/api/ceilometer/alerts/history/')
         .error(function () {
            toastService.add('error', gettext('Unable to retrieve alerts.'));
        });                 
     
    };
    /*added by laixf for alarm show detail*/
    this.getAlert = function(alarm_id) {
    	return apiService.get('/api/ceilometer/alarms/' + alarm_id)
    	  .error(function () {
            toastService.add('error', gettext('Unable to get alarm details'));
        });           
    };
    this.updateAlertState = function (alarm_id,state) {
            var config = {alarm_id: alarm_id};
            return apiService.post('/api/ceilometer/alarm_clear/' + alarm_id, config)
                .error(function () {
                    toastService.add('error', gettext('Unable to clear ' + alarm_id ));
                })
     };
    // Meters
    /**
	 * @name horizon.openstack-service-api.caeilometerAPI.getMeters
	 * @description Get a list of meters.
	 * The listing result is an object with property "items". Each item is a
	 * meter.
	 */
    this.getMeters = function() {
        return apiService.get('/api/ceilometer/meters/')
          .error(function () {
        	  toastService.add('error', gettext('Unable to retrieve meters.'));
          });
     };

     /**
     * @name horizon.openstack-service-api.caeilometerAPI.getMetersFromResource
	 * @description Get a list of meters from a resource id.
	 * The listing result is an object with property "items". Each item is a
	 * meter.
	 */
      this.getMetersFromResource = function(resource_id) { 
          return apiService.post('/api/ceilometer/resourcemeters/', resource_id)
            .error(function () {
            	toastService.add('error', gettext('Unable to retrieve meters.'));
            });
      };

     this.realtimeShow = function() {
          return apiService.get('/api/ceilometer/realtime/')
            .error(function () {
            	toastService.add('error', gettext('Unable to retrieve meters.'));
            });
      };

    // Alarms
    /**
	 * @name horizon.openstack-service-api.ceilometerAPI.createAlarm
	 * @description Create a alarm using the parameters supplied in the
	 *              newServer. The required parameters:
	 * "name", "meter_name", "period" All strings
	 * Other parameters are accepted as per the underlying ceilometerclient:
	 * 'description', 'resource_id', 'comparison_operator', 'threshold',
	 * 'statistic','actions',
	 * This returns the new alarm object on success.
	 * 
	 *  meter_name resource_id  name period description  comparison_operator threshold
	 */
    this.createAlarm = function(newAlarm) {
      return apiService.post('/api/ceilometer/alarms/', newAlarm)
        .error(function () {
        	toastService.add('error', gettext('Unable to create the alarm.'));
        });
    };

    /**
	 * @name horizon.openstack-service-api.ceilometerAPI.getAlarm
	 * @description Get a single alarm by ID
	 * @param {string}
	 *            id Specifies the id of the server to request.
	 */
    this.getAlarm = function(id) {
      return apiService.get('/api/ceilometer/alarms/' + id)
        .error(function () {
        	toastService.add('error', gettext('Unable to retrieve alarm.'));
      });
    };

    this.deleteAlarm = function(alarm_id) {
      return apiService.delete('/api/ceilometer/alarms/' + alarm_id);
    };

    this.editAlarm = function(updatedAlarm) {
      var url = '/api/ceilometer/alarms/' + updatedAlarm.alarm_id;
      return apiService.patch(url, updatedAlarm)
          .error(function () {
        	  toastService.add('error', gettext('Unable to update the alarm.'));
        });
      };

     this.getAlarms = function() {
       return apiService.get('/api/ceilometer/alarms/')
          .error(function () {
        	  toastService.add('error', gettext('Unable to retrieve alarms.'));
          });
      };

     // AlarmStates
     /**
      *  @name horizon.openstack-service-api.caeilometerAPI.getAlaemStates
      *  @description Get a list of alarm states.
      */
        this.getAlarmStates = function() {
            return apiService.get('/api/ceilometer/alarmstates/')
              .error(function () {
                horizon.alert('error', gettext('Unable to retrieve resources.'));
             });
        };

     // Resources
     /**
		 * @name horizon.openstack-service-api.caeilometerAPI.getResources
		 * @description Get a list of resources.
		 * The listing result is an object with property "items". Each item is a
		 * resource.
		 */
      this.getResources = function() {
          return apiService.get('/api/ceilometer/resources/')
            .error(function () {
            	toastService.add('error', gettext('Unable to retrieve resources.'));
            });
        };

      // Samples
      /**
		 * @name horizon.openstack-service-api.caeilometerAPI.getSamples
		 * @description Get a list of samples.
		 * The listing result is an object with property "items". Each item is a
		 * sample.
		 */
       this.getSamples = function() {
           return apiService.get('/api/ceilometer/samples/')
             .error(function () {
            	 toastService.add('error', gettext('Unable to retrieve samples.'));
             });
        };

        // Activities
        /**
		 * @name horizon.openstack-service-api.caeilometerAPI.getActivities
		 * @description Get a list of activities from sample-list.
		 * Following is an example of response data :
		 * {"id": 1,
		 *  "user": "admin"
		 *  "action": "Create Volume",
		 *  "resource": "gdf",
		 *  "timestamp": "2015-04-29 11:38:31",
		 *  "operation_time": 1,
		 *  "type": "volume"
		 *  }
		 */
         this.getActivities = function(num) {
             return apiService.get('/api/ceilometer/activities/'+num)
               .error(function () {
            	   toastService.add('error', gettext('Unable to retrieve activities.'));
               });
          };
         this.getAllActivities = function() {
           return apiService.get('/api/ceilometer/activitiesall')
             .error(function () {
          	   toastService.add('error', gettext('Unable to retrieve activities.'));
             });
         };
         this.getActivitiesByDate = function(data) {
             return apiService.post('/api/ceilometer/activitiesdate',data)
               .error(function () {
            	   toastService.add('error', gettext('Unable to retrieve activities.'));
               });
          };
         this.getOverviewActivities = function() {
             return apiService.get('/api/ceilometer/overviewactivities')
               .error(function () {
            	   toastService.add('error', gettext('Unable to retrieve activities.'));
               });
          };
        // Statistics
        /**
		 * @name horizon.openstack-service-api.caeilometerAPI.getStatistics
		 * @description Get a list of statistics.
		 * The listing result is an object with property "items". Each item is a
		 * statistic.
		 */
         this.getStatisitcs = function(params) {
        	 var config = (params) ? {'params': params} : {};
             return apiService.get('/api/ceilometer/statistics/', config)
               .error(function () {
                 horizon.alert('error', gettext('Unable to retrieve statistics.'));
               });
          };

         // Notify_URL
         /**
		 * @name horizon.openstack-service-api.caeilometerAPI.getNotifyUrl
		 * @description Get prefix of notify url
		 */
           this.getNotifyUrl = function() {
               return apiService.get('/api/ceilometer/notifications/')
                 .error(function () {
                   horizon.alert('error', gettext('Unable to retrieve notify url.'));
                 });
            };
  }

}());
