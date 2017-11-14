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
* @ngDoc createAction
* @ngService
*
* @Description
* Brings up the create user modal dialog.
* On submit, create a new user and display a success message.
* On cancel, do nothing.
*/
.factory('alarmCreateAction',
    ['horizon.openstack-service-api.ceilometer', '$modal', 'backDrop',
     'horizon.framework.widgets.toast.service', '$rootScope',
    function(ceilometerAPI, modal, backDrop, toastService, rootScope) {

        var context = {
        mode: 'create',
        title: gettext('Create Alarm'),
        submit:  gettext('Create'),
        success: gettext('Alarm %s was successfully created.')
        };

        function action(scope) {

        /*jshint validthis: true */
        var self = this;
        var option = {
        templateUrl: 'form/',
        controller: 'alarmFormCtrl',
        windowClass: 'alarmContent',
        backdrop: backDrop,
        resolve: {
            alarmResource: function(){ return {}; },
            context: function(){ return context; }
         }
        };
        self.open = function(){
        modal.open(option).result.then(self.submit);
        };

        self.submit = function(alarmsVal) {
            ceilometerAPI.getNotifyUrl()
                .success(function(url){
                    var alarms = {};
                    alarms.description 			= alarmsVal.description;
                    alarms.repeat_actions 		= false;
                    alarms.type					= "threshold";
                    alarms.name					= alarmsVal.name;
                    alarms.threshold_rule		= {
                    meter_name: 			alarmsVal.add[0]['selectVal'],
                    evaluation_periods: 	alarmsVal.evaluation_periods,
                    period:					alarmsVal.period,
                    statistic:				alarmsVal.statistic,
                    threshold:				alarmsVal.threshold,
                    query:					[{
                    field:		"resource_id",
                    type: 		"",
                    value: 		alarmsVal.add[0]['rid'],
                    op:			'eq'
                }],
            comparison_operator:	alarmsVal.comparison_operator
        };

    if(alarmsVal.notice_checked){
        var actions		= alarmsVal.addNotices;
        for(var i=0, len=actions.length; i<len; i++){
            if(actions[i].state){
                var arr = alarms[actions[i].state + '_actions'] = [];
                for(var k=0; k<actions[i].data.email.length; k++){
                    if(actions[i].data.email[k].value){
                        arr.push('email://' + actions[i].data.email[k].value + '?' + actions[i].data.name);
                    }
        }
    // Later useful
    /*for(var j=0; j<actions[i].data.sms.length; j++){
        if(actions[i].data.sms[j].value){
            arr.push(url+'/api/ceilometer/sendmessage?sms=' + actions[i].data.sms[j].value + '&&' + actions[i].data.name);
        }
    }*/
            }
        }
    }

    ceilometerAPI.createAlarm(alarms)
        .success(function(createData) {
            createData.resource_name = alarmsVal.add[0].displayname;
                createData.id = createData.alarm_id;
                createData['create_time'] = rootScope.rootblock.utc_to_local(createData.create_time);
                scope.alarms.unshift(createData);
                var message = interpolate(context.success, [alarms.name]);
                toastService.add('success', message);
                // table.module.js parameter change
                scope.$table.resetSelected();

                //notify alarms ring to refresh
                scope.$emit("updateAlarm");
            });
        });
    };
}

return action;
}])

//Alarms create notice list
.factory('createNoticeList', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop', function(keystoneAPI, modal, backDrop){
    var context = {
        mode: 'create',
        title: gettext('Create List'),
        submit:  gettext('Create'),
        success: gettext('Alarm %s was successfully created.')
    };
    function noticeList(scope){
    var self = this;
    var option = {
        templateUrl: 'form_create_notice_list',
        controller: 'createNoticeListCtrl',
        windowClass: 'noticeListContent',
        backdrop: backDrop,
    resolve: {
        contact: function(){ return {}; },
        context: function(){ return context; }
        }
    };

    self.open = function(d,t){
        if(t === 'edit'){
            option.resolve.context  = function(){
            return {
                mode: 'edit',
                title: gettext('Edit List'),
                submit:  gettext('Save'),
                success: gettext('Alarm %s was successfully edit.')
        };
    };
}
        else{
            option.resolve.context  = function(){
            return {
                mode: 'create',
                title: gettext('Create List'),
                submit:  gettext('Create'),
                success: gettext('Alarm %s was successfully created.')
            };
        };
}
    option.resolve.contacts  = function(){ return d; };
    modal.open(option).result.then(self.submit);
};
self.submit = function(contactVal) {

if(contactVal.disab){
    var iBtn = true;
    delete contactVal.disab;
    keystoneAPI.editNotifyList(contactVal)
        .success(function(createData) {
        for(var i=0; i<scope.contacts.length; i++){
            if(scope.contacts[i].name === createData.name){
                angular.extend(scope.contacts[i],createData);
    }
}
    if(scope.editAddNotices){
        for(var i=0; i<scope.editAddNotices.length; i++){
            scope.editAddNotices[i].data.email = []
            for(var j=0; j<createData.email.length; j++){
                scope.editAddNotices[i].data.email.push({'value': createData.email[j].value});
            }
        }
        }
    });
}
    else{
        keystoneAPI.createNotifyList(contactVal)
            .success(function(createData) {
                scope.contacts.unshift(contactVal);
            });
        }
    }
}
    return noticeList;
}])

//edit alarm list three
.factory('editAlarmNotice', [function(){
    function editNotice(scope){
    var notice = [];
    var smses = [];
    var emails = [];
    var notice_actions = null;
    var name = '';
    var editValue = [];
    scope.editAddNotices = [];
    scope.editAlarmStates = [];

    !scope.editData.alarm_actions.length ? scope.editAlarmStates.push('alarm') : notice.push('alarm');
    !scope.editData.insufficient_data_actions.length ? scope.editAlarmStates.push('insufficient_data') : notice.push('insufficient_data');
    !scope.editData.ok_actions.length ? scope.editAlarmStates.push('ok') : notice.push('ok');
    for(var i=0; i<notice.length; i++){
        notice_actions = scope.editData[(notice[i]+'_actions')];
    for(var k=0; k<notice_actions.length; k++){
        if(notice_actions[k].indexOf('@') !== -1){
            emails.push(notice_actions[k]);
        }
        else{
            smses.push(notice_actions[k]);
        }
    }

    name = smses.length ? smses[0].split('&&')[1] : emails[0].split('&&')[1];

    editValue.push({ state: notice[i], data: { name: name, sms: smses, email: emails } });
    emails = [];
    smses  = [];
}

var editJson  = {};
var arrSms  = [];
var arrEmail  = [];

for(var j=0; j<editValue.length; j++){
    editJson.state = editValue[j].state;

    editJson.data  = {
        name: editValue[j].data.name
    };

    for(var n=0; n<editValue[j].data.email.length; n++){
        var aEmail = editValue[j].data.email[n].split('=')[1].split('&&')[0];
        arrEmail.push({ value: aEmail });
    }
    editJson.data.email = arrEmail;
    arrEmail = [];

    for(var t=0; t<editValue[j].data.sms.length; t++){
        var aSms = editValue[j].data.sms[t].split('=')[1].split('&&')[0];
        arrSms.push({ value: aSms });
    }
    editJson.data.sms = arrSms;
    arrSms = [];

    scope.editAddNotices.push(editJson);
        editJson  = {};
    }
        scope.editData.editAddNotices = scope.editAddNotices;
    }
    return editNotice;
    }]);
})();