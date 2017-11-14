/**
 * Copyright 2015 EasyStack Corp.
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

      angular.module('hz.dashboard.project.alarms')

      /**
       * @ngDoc editAction
       * @ngService
       *
       * @Description
       * Brings up the edit user modal dialog.
       * On submit, edit user and display a success message.
       * On cancel, do nothing.
       */
      .factory('alarmEditAction',
          ['horizon.openstack-service-api.ceilometer',
           '$modal', 'backDrop',
           'horizon.framework.widgets.toast.service',
      function(ceilometerAPI, modal, backDrop, toastService) {

        var context = {
          mode: 'edit',
          title: gettext('Edit Alarm'),
          submit:  gettext('Save'),
          success: gettext('Alarm %s has been updated successfully.')
        };

        function action(scope) {

          /*jshint validthis: true */
          var self = this;
          var option = {
            templateUrl: 'editform',
            controller: 'editAlarmFormCtrl',
            windowClass: 'alarmContent',
            backdrop: backDrop,
            resolve: {
              alarmSwitch: function(){ return {}; },
              context: function(){ return context; },
              editData: function(){ return {}; }
            }
          };

          ceilometerAPI.getNotifyUrl()
            .success(function(url){
              // open up the edit form
              self.open = function(data) {
                option.resolve.alarm_id = function(){ return data[0].alarm_id; };
                modal.open(option).result.then(self.submit);
              };

          // edit form modifies name, email, and project
          // send only what is required
          self.asign = function(newData) {
            var updateAlarms = {};
                updateAlarms.description 			= newData.description;
                updateAlarms.timestamp 				= newData.timestamp;
                updateAlarms.time_constraints 		= [];
                updateAlarms.enabled 				= newData.enabled;
                updateAlarms.state_timestamp 		= newData.state_timestamp;
                updateAlarms.alarm_id 				= newData.alarm_id;
                updateAlarms.state 					= newData.state;
                updateAlarms.insufficient_data_actions 		= newData.insufficient_data_actions;
                updateAlarms.repeat_actions 		= newData.repeat_actions;
                updateAlarms.user_id 				= newData.user_id;
                updateAlarms.project_id 			= newData.project_id;
                updateAlarms.type					= "threshold";
                updateAlarms.name					= newData.name;

                updateAlarms.threshold_rule			= {
                    meter_name: 			newData.threshold_rule.meter_name,
                    evaluation_periods: 	newData.threshold_rule.evaluation_periods,
                    period:					newData.threshold_rule.period,
                    statistic:				newData.threshold_rule.statistic,
                    threshold:				newData.threshold_rule.threshold,
                    query:					[{
                        field:		"resource_id",
                        type: 		"",
                        value: 		newData.threshold_rule.query[0].value,
                        op:			'eq'
                    }],
                    comparison_operator:	newData.threshold_rule.comparison_operator,
                    exclude_outliers:       newData.threshold_rule.exclude_outliers
                };
                var actions		= newData.editAddNotices;
                var allActions  = ['alarm', 'ok', 'insufficient_data'];

                for(var n=0,len=allActions.length; n<len; n++){
                    updateAlarms[allActions[n] + '_actions'] = [];
                }

                if(newData.notice_checked.sw){
                    for(var i=0, len=actions.length; i<len; i++){
                        if(actions[i].state){
                            var arr = updateAlarms[actions[i].state + '_actions'];

                            for(var k=0; k<actions[i].data.email.length; k++){
                                arr.push(url+'/api/ceilometer/sendmail?email=' + actions[i].data.email[k].value + '&&' + actions[i].data.name);
                            }

                            // Later useful
                            /*for(var j=0; j<actions[i].data.sms.length; j++){
                                arr.push(url+'/api/ceilometer/sendmessage?sms=' + actions[i].data.sms[j].value + '&&' + actions[i].data.name);
                            }*/
                        }
                    }
                }
             return updateAlarms;
          };

          // submit this action to api
          // and update user object on success
          self.submit = function(editData) {
            editData.alarm_actions = [];
            editData.insufficient_data_actions = [];
            editData.ok_actions = [];

            var newData	= self.asign(editData);

            ceilometerAPI.editAlarm(newData)
              .success(function(d,s) {
                var message = interpolate(context.success, [d.name]);
                toastService.add('success', message);
               for(var i=0; i<scope.alarms.length; i++){
                    if(scope.alarms[i].alarm_id == d.alarm_id){
                        angular.extend(scope.alarms[i], d);
                    }
                }

                scope.$table.resetSelected();

                //notify alarms ring to refresh
                scope.$emit("updateAlarm");
              });
          };
        });
        }
        return action;
      }]);

    })();