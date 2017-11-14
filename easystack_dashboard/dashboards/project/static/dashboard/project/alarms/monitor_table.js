
(function(){
'use strict';

angular.module('hz.dashboard.project.alarms')

    //form create alarm controller
    .controller('monitorListController', ['$scope', 'horizon.openstack-service-api.ceilometer',
        'horizon.openstack-service-api.keystone', 'horizon.openstack-service-api.chakra', 'createNoticeList',
        'horizon.openstack-service-api.nova',
        function(scope, ceilometerAPI, keystoneAPI, chakraAPI, CreateNoticeList, novaAPI){
        scope.context = {

        };

        scope.monitors			= [];
        scope.imonitors			= [];
        scope.addmonitors 		= [];							//Monitoring resources added
        scope.attrname    		= '';
        scope.monitorState		= 0;
        scope.search			= { text: '' };

        scope.alarmResource.add = scope.addmonitors;			//Monitoring resources submitted

        //Notece modal
        scope.actions		= {
            createNoticeList:		new CreateNoticeList(scope)
        };
        scope.notice_checked	= true;
        scope.alarmStates		= [];
        scope.contacts			= [];
        scope.addNotices		= [];
        scope.alarmResource.addNotices	= scope.addNotices;
        scope.alarmResource.notice_checked = scope.notice_checked;

        scope.noticeChecked = function(iBtn){
            scope.notice_checked = iBtn ? true : false;
            scope.alarmResource.notice_checked = scope.notice_checked;
        }
        scope.alarmstatei18n = {
                'insufficient_data': gettext('Insufficient Data'),
                'ok': gettext('Normal'),
                'alarm': gettext('Alarm'),
        };
        scope.addDescription = function(){
            scope.alarmResource.description = scope.alarmResource.name + ' ' +
            gettext('Alarm Periodic') + ' ' +
            scope.alarmResource.period + 's ' +
            gettext('Continue') + ' ' +
            scope.alarmResource.evaluation_periods + ' ' +
            gettext('periodics') + ' ' +
            scope.addmonitors[0].monitor_name + ' ' +
            gettext(scope.alarmResource.statistic) + ' ' +
            gettext(scope.alarmResource.comparison_operator) + ' ' +
            scope.alarmResource.threshold + ' ' +
            scope.addmonitors[0].unit;
        }

        var meter_filter = function(meter){
            for (var j=0; j<meter.length; j++){
                if (meter[j].name.indexOf('_') >= 0 ){
                    meter[j].newName = meter[j].name.split('_').join(' ');
                    meter[j].monitor_name = meter[j].name.split('_').join(' ');
                }else{
                    meter[j].newName = meter[j].name.split('.').join(' ');
                    meter[j].monitor_name = meter[j].name.split('.').join(' ');
                }
                if(meter[j].newName.indexOf('network') === -1){
                    meter[j].selectListName = meter[j].newName;
                }
                else{
                    meter[j].selectListName = meter[j].newName.replace('network', ' '+meter[j].ip);
                }
            }
            return meter
        }
        this.init	= function(){
            //Form monitoring resources get data
           // ceilometerAPI.getResources()
             // .success(function(response) {
                      novaAPI.getServers()
                          .success(function (res) {
                              var monitors = [];
                              for(var i=0; i<res.items.length; i++){
                                  var monitor = {};
                                  if(res.items[i]['OS-EXT-STS:power_state'] == 1){
                                      monitor.type = 'instance';
                                      monitor.description = null;
                                      monitor.displayname = res.items[i].name;
                                      monitor.resource_id = res.items[i].id;
                                      monitors.push(monitor);
                                  }
                              }
                              keystoneAPI.getCloudAdmin()
                                .success(function(response){
                                  if(response){
                                    scope.getAccount(monitors);
                                  }else{
                                    scope.monitors = monitors;
                                    scope.monitorState = 1;
                                  }
                                });
                              ceilometerAPI.getMetersFromResource(monitors).success(function(response){
                                  var meters = response.items;
                                  for(var i=0; i<meters.length; i++){
                                      if (monitors[i].resource_id == meters[i][0].resource_id){
                                          monitors[i].meterVal	= meter_filter(meters[i]);
                                      }else{
                                          console.log(monitors[i].resource_id);
                                          console.log(meters[i][0].resource_id);
                                      }
                                  }
                                });
                          })
              // });

             scope.getAccount = function(monitors){
               chakraAPI.getAccounts()
                 .success(function(response){
                   if(response.items.length){
                     for(var i=0;i<response.items.length;i++){
                       if(response.items[i].name != 'Default'){
                         response.items[i]['type'] = 'account';
                         response.items[i]['displayname'] = response.items[i].name;
                         response.items[i]['resource_id'] = response.items[i].id;
                         response.items[i]['meterVal'] = [{
                           'name' : 'account',
                           'unit' : 'RMB',
                           'resource_id' : response.items[i].id,
                           'monitor_name' : 'account',
                           'selectListName' : 'account'
                         }];
                         monitors.push(response.items[i]);
                        }
                      }
                    }
                    scope.monitors = monitors;
                    scope.monitorState = 1;
                })
                .error(function(){
                    scope.monitors = monitors;
                    scope.monitorState = 1;
                 });
             }

            //AlarmStates
            ceilometerAPI.getAlarmStates()
             .success(function(response) {
                    scope.alarmStates 	= response.items;
              });

            //Contacts
            keystoneAPI.getNotifyList()
             .success(function(response) {
                    scope.contacts 	= response.items;
              });
            keystoneAPI.getLDAP().success(function(data){
              scope.ldap_editable = data["editable"];
            });
        }
        this.init();
    }])

    //edit alarm controller
    .controller('editAlarmCtroller', ['$scope', 'horizon.openstack-service-api.keystone',
        'createNoticeList', function(scope, keystoneAPI, CreateNoticeList){
        scope.editResource	= [];
        scope.editSetMsg	= [];
        scope.alarmstatei18n = {
                'insufficient_data': gettext('Insufficient Data'),
                'ok': gettext('Normal'),
                'alarm': gettext('Alarm'),
        };
        //Notece modal
        scope.actions		= {
            createNoticeList:		new CreateNoticeList(scope)
        };

        scope.alarmStates		= [];
        scope.contacts			= [];
        scope.addNotices		= [];

        this.init	= function(){
            //Contacts
            keystoneAPI.getNotifyList()
             .success(function(response) {
                    scope.contacts 	= response.items;
              });
            keystoneAPI.getLDAP().success(function(data){
              scope.ldap_editable = data["editable"];
            });
        }
        this.init();
    }])

    //add mobile email and user name
    .controller('addNoticeUserNameCtrl', ['$scope', 'horizon.openstack-service-api.keystone', 
        function(scope, keystoneAPI){
        scope.contact.sms		= scope.smses;
        scope.contact.email		= scope.emails;
        scope.onoff				= true;
        scope.notice	= {
            sms:		true,
            smsInput: 	false,
            email:		true,
            emailInput:	false
        };
        keystoneAPI.getLDAP().success(function(data){
          scope.ldap_editable = data["editable"];
        });
        scope.showContact = function(name,num){
            if(name === 'sms'){
                scope.notice.sms		= num ? false : true;
                scope.notice.smsInput	= num ? true : false;
                scope.smsNumber		= '';
                scope.smsRemarks	= '';
            }
            if(name === 'email'){
                scope.notice.email		= num ? false : true;
                scope.notice.emailInput	= num ? true : false;
                scope.emailAddress		= '';
                scope.emailRemarks		= '';
                scope.onoff				= false;
            }
        }
        scope.addContactData = function(name){
            if(name === 'sms'){
                scope.smses.unshift({ value: scope.smsNumber, tag: scope.smsRemarks });
                scope.smsNumber		= '';
                scope.smsRemarks	= '';
                scope.smssse = false;
            }
            if(name === 'email'){
                scope.emails.unshift({ value: scope.emailAddress, tag: scope.emailRemarks });
                scope.emailAddress		= '';
                scope.emailRemarks		= '';
                scope.onoff				= false;
            }
        }
        scope.enterData		= function(){
            scope.onoff	= true;
        }
        scope.removeContact = function(name,val){
            var data 	= name === 'sms' ? scope.smses : scope.emails;
            for(var i=0; i<data.length; i++){
                if(data[i]['value'] === val){
                    data.splice(i,1);
                }
            }
        }
    }]);
})();
