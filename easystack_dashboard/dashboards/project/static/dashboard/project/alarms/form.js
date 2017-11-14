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
* @ngdoc alarmFormCtrl
* @ng-controller
*
* @description
* This controller is use for the create and edit user form.
* Refer to angular-bootstrap $modalInstance for further reading.
*/
.controller('alarmFormCtrl', [
'$scope', '$modalInstance', 'alarmResource', 'context',
function(scope, modalInstance, alarmResource, context) {
  scope.disable = false;
  var action = {
	submit: function() { modalInstance.close(alarmResource); scope.disable = true; },
	cancel: function() { modalInstance.dismiss('cancel'); scope.disable = true; }
  };

  scope.context = context;
  scope.alarmResource = alarmResource;
  scope.action = action;

}])

//edit alarm $modal controller
.controller('editAlarmFormCtrl', [
	'$scope', '$modalInstance', 'horizon.openstack-service-api.ceilometer', 'editData', 'context', 'alarm_id', 'editAlarmNotice', 'alarmSwitch',
	function(scope, modalInstance, ceilometerAPI, editData, context, alarm_id, editAlarmNotice, alarmSwitch){
		scope.disable = false;
		var action = {
			submit: function() { modalInstance.close(editData); scope.disable = true; },
			cancel: function() { modalInstance.dismiss('cancel'); scope.disable = true; }
		 };

		scope.state	= 0;
		scope.notice_checked = { sw: true };
		scope.$watch('editAddNotices',function(n,o){
			if(n){
				scope.notice_checked.sw = n.length > 0 ? true : false;
			}
		});
		
		scope.noticeChecked = function(iBtn){
			scope.notice_checked.sw = iBtn ? true : false;
		};
		scope.addDescription = function(){
			editData.description = editData.name + ' ' +
			gettext('Alarm Periodic') + ' ' +
			editData.threshold_rule.period + 's ' +
			gettext('Continue') + ' ' +
			editData.threshold_rule.evaluation_periods + ' ' +
			gettext('periodics') + ' ' +
			editData.editMonitor_name + ' ' +
			gettext(editData.threshold_rule.statistic) + ' ' +
			gettext(editData.threshold_rule.comparison_operator) + ' ' +
			editData.threshold_rule.threshold + ' ' +
			editData.unit;
		};
		ceilometerAPI.getAlarm(alarm_id)
			.success(function(data) {
				editData		= data;
				scope.state		= 1;

				//Assembly monitoring index
				if(editData.resource_type === 'nic'){
					editData.sMonitor_name	= editData.ip + editData.threshold_rule.meter_name.replace('network','').split('.').join(' ');
				}
				else{
					if(editData.threshold_rule.meter_name.indexOf('_') === -1){
						editData.sMonitor_name	= editData.threshold_rule.meter_name.split('.').join(' ');
					}
					else{
						editData.sMonitor_name	= editData.threshold_rule.meter_name.split('_').join(' ');
					}
				}

				//meter_name remove connector
				if(editData.threshold_rule.meter_name.indexOf('_') === -1){
					editData.editMonitor_name	= editData.threshold_rule.meter_name.split('.').join(' ');
				}
				else{
					editData.editMonitor_name	= editData.threshold_rule.meter_name.split('_').join(' ');
				}
				editData.notice_checked = scope.notice_checked;
				scope.editData	= editData;
				editAlarmNotice(scope);
			});

		editData.notice_checked = scope.notice_checked.sw ;
		scope.editData = editData;
		scope.context = context;
		scope.action = action;
	}
])

// contact list
.controller('createNoticeListCtrl', [
	'$scope', '$modalInstance', 'contact', 'context', 'contacts',
	function(scope, modalInstance, contact, context, contacts) {

	  var action = {
		submit: function() { modalInstance.close(contact); },
		cancel: function() { modalInstance.dismiss('cancel'); }
	  };

	  if(contacts){
		scope.contacts 	= contacts;
		scope.smses		= angular.copy(contacts.data.sms);
		scope.emails	= angular.copy(contacts.data.email);
	  }
	  else{
		scope.smses		= [];
		scope.emails 	= [];
	  }

	  scope.context = context;
	  scope.contact = contact;
	  scope.action = action;

	  if(contacts){
		  scope.contact.name 		= contacts.data.name;
		  scope.contact.disab 		= true;
		  scope.contact.description	= contacts.data.description;
	  }

}]);

})();