(function(){
'use strict';

angular.module('hz.dashboard.project.alarms')
    .directive('switchDirective', ['horizon.openstack-service-api.ceilometer', function(ceilometerAPI){
        return {
            restrict: 'EA',
            scope: {
                data: 		'=monitorData',
                dataNew: 	'=imonitorData',
                tag:		'=sName',
                search:		'=searchText'
            },

            templateUrl: '/static/dashboard/project/alarms/action_list.html',
            link: function(scope,ele,attr){

                scope.$watch('data',function(n,o){
                    scope.d = n;
                    set(n);
                });
                scope.filtertext = {
                    'instance': gettext('Instance'),
                    'volume': gettext('Volume'),
                    'account': gettext('Account')
                };
                //Monitor resource filtering
                function set(data,attr){
                    scope.dataNew 	= [];
                    var typeTxt		= [];
                    scope.navs		= [];

                    for(var i=0; i<data.length; i++){
                        typeTxt.push(data[i]['type']);
                    }

                    scope.navs = removal(typeTxt);
                    scope.navs.sort();
                    attr = attr ? attr : scope.navs[0];

                    scope.tag = attr;

                    for(var i=0; i<data.length; i++){
                        if(data[i]['type'] == attr && !data[i]['btn']){
                            scope.dataNew.push(data[i]);
                        }
                    }
                }

                // Duplicate removal
                function removal(array){
                    for(var i=0;i<array.length;i++) {
                        for(var j=i+1;j<array.length;j++) {
                            if(array[i]===array[j]) {
                                array.splice(j,1);
                                j--;
                            }
                        }
                    }
                    return array;
                }

                //resource filtering
                $(ele).on('click', 'li', function(){
                    $(ele).find('li').removeClass('active');
                    scope.search = '';									//Click tab clean search terms.
                    $(this).addClass('active');
                    set(scope.d,scope.navs[$(this).index()]);
                });
            }
        };
    }])

    //Add monitor resource directive
    .directive('addResources', [function(){
        return {
            restrict: 'EA',
            scope: {
                addData: '=?',
                dataNew: '=imonitorData',
                data: 	 '=monitorData',
                tag:	 '=sName'
            },
            link: function(scope,ele,attr){
                $(ele).on('click', '.js-add', function(){
                    $(this).parent().parent().remove();
                    var arrVal = $(this).parent().parent().find('select').val().split(',');
                    var id = $(this).parent().parent().attr('resource-id');
                    handover(id,arrVal);
                });

                //Monitor resource switch
                function handover(id,arrVal){

                    //Add the hidden field to the data source
                    for(var i=0; i<scope.data.length; i++){
                        if(id == scope.data[i].resource_id){
                            scope.data[i].btn 	= 1;
                        }
                        else{
                            scope.data[i].btn 	= 0;
                        }
                    }

                    //Add monitor resource
                    for(var i=0; i<scope.dataNew.length; i++){

                        if(id == scope.dataNew[i].resource_id){
                            scope.dataNew[i]['selectVal'] 		= arrVal[0];
                            scope.dataNew[i]['rid'] 			= arrVal[1];
                            scope.dataNew[i]['monitor_name'] 	= arrVal[2];
                            scope.dataNew[i]['unit'] 			= arrVal[3];
                            scope.dataNew[i]['selectListName'] 	= arrVal[4];

                            if(!scope.addData.length){
                                scope.addData.unshift(scope.dataNew[i]);
                                scope.dataNew.splice(i,1);
                            }
                            else{
                                if(scope.addData[0].type == scope.tag){
                                    var pop = scope.dataNew.splice(i,1);
                                    scope.dataNew.unshift(scope.addData[0]);
                                    scope.addData = [];
                                    scope.addData.unshift(pop[0]);
                                }
                                else{
                                    scope.addData = [];
                                    var pop = scope.dataNew.splice(i,1);
                                    scope.addData.unshift(pop[0]);
                                }
                            }

                        }

                    }
                }

            }
        }
    }])

    //add notice resource
    .directive('noticeResource', function(){
        return {
            restrict: 'EA',
            scope:{
                noticeAlarmStates:		'=?',
                noticeContacts:			'=?',
                noticeAdd:				'=?'
            },
            link: function(scope,ele,attr){

                //add
                ele.find('.js-noticeAdd').on('click', function(){
                    var selectAlarmStateVal	= ele.find('.js-alarmState').val();
                    var selectContactVal	= ele.find('.js-contact').val();
                    var selectContactJson	= null;

                    for(var i=0, len=scope.noticeContacts.length; i<len; i++){
                        if(selectContactVal === scope.noticeContacts[i].name){
                            selectContactJson = scope.noticeContacts[i];
                        }
                    }

                    scope.noticeAdd.unshift({ state: selectAlarmStateVal, data: selectContactJson });

                    for(var k=0,len=scope.noticeAlarmStates.length; k<len; k++){
                        if(scope.noticeAlarmStates[k] === selectAlarmStateVal){
                            scope.noticeAlarmStates.splice(k, 1);
                        }
                    }
                });

                //move
                $(ele).on('click', '.js-noticeMove', function(){
                    var attr = $(this).attr('data-states');
                    for(var i=0; i<scope.noticeAdd.length; i++){
                        if(scope.noticeAdd[i].state === attr){
                            scope.noticeAlarmStates.unshift(attr);
                            scope.noticeAdd.splice(i,1);
                        }
                    }
                });
            }
        }
    })

    //delete monitor resource directive
    .directive('removeResources', [function(){
        return {
            restrict: 'EA',
            scope: {
                addData: 		'=?',
                monitorData: 	'=?',
                imonitorData: 	'=?',
                tag:	 		'=sName'
            },
            link: function(scope,ele,attr){

                //delete monitor resource
                $(ele).on('click', '.js-remove', function(){
                    $(this).parent().parent().remove();

                    var id = $(this).parent().parent().attr('resource-id');
                    if(scope.addData[0].type == scope.tag){
                        scope.addData[0].btn = 0;
                        scope.imonitorData.unshift(scope.addData[0]);
                        scope.addData = [];
                    }
                    else{
                        scope.addData = [];
                        for(var i=0; i<scope.monitorData.length; i++){
                            scope.monitorData[i].btn = 0;
                        }
                    }
                });
            }
        }
    }])

    //Animation
    .directive('monitorWrap', function(){
        return {
            restrict: 'EA',
            link: function(scope,ele,attr){
                var width	= ele.find('.js-module').width();
                var aTab	= ele.find('.js-tab li');
                var aLine   = ele.find('.js-tab li .step-line');

                $(ele).find('.js-next').on('click', function(){
                    var index 	= $(ele).find('.js-next').index($(this));
                    var obj		= $(ele).find('.js-wrap');
                    aTab.removeClass('step-active');
                    aTab.eq(index).addClass('step-complete');
                    aTab.eq(index+1).addClass('step-active');
                    aTab.eq(index).find('.step-line').addClass('step-line-solid')

                    obj.stop();
                    obj.animate({
                        left: -width*(index+1)
                    },'slow');
                });

                $(ele).find('.js-up').on('click', function(){
                    var index 	= $(ele).find('.js-up').index($(this));
                    var obj		= $(ele).find('.js-wrap');
                    aTab.removeClass('step-active');
                    aTab.eq(index).removeClass('step-complete');
                    aTab.eq(index).addClass('step-active');
                    aTab.eq(index).find('.step-line').removeClass('step-line-solid')

                    obj.stop();
                    obj.animate({
                        left: -width*index
                    },'slow');
                })
            }
        }
    })

    // focus
    .directive('setFocus', ['$timeout', function($timeout){
        return {
            restrict: 'A',
            link: function(scope, element){
                 $timeout(function() {
                    element[0].focus();
              },1000);
            }
        }
    }]);
})();
