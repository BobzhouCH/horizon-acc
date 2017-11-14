/**
 * Copyright 2015 EasyStack
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

  angular.module('hz.dashboard.project.activity')

  /**
   * @ngdoc projectActivityCtrl
   * @ngController
   *
   * @description
   * Controller for the project activity table.
   * Serve as the focal point for table actions.
   */
  .controller('projectActivityCtrl', [
    '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.ceilometer',
          'horizon.framework.widgets.toast.service',
    function(
      scope, PolicyService, CeilometerAPI, toastService
      ) {
      var self  = this;
    scope.context = {
      header: {
        id: gettext('ID'),
        user: gettext('User'),
        operatorname: gettext('Operator'),
        type: gettext('Type'),
        resource: gettext('Resource Name'),
        action: gettext('Action'),
        operation_time: gettext('Operation Seconds(s)'),
        timestamp: gettext('Time')
      },
      error: {
        api: gettext('Unable to retrieve activities'),
        priviledge: gettext('Insufficient privilege level to view activity information.')
      }
    };
    scope.operationlogActioni18n = {
        'Create Instance': gettext('Create Instance'),
        'Delete Instance': gettext('Delete Instance'),
        'Pause Instance': gettext('Pause Instance'),
        'Unpause Instance': gettext('Unpause Instance'),
        'Shutdown Instance': gettext('Shutdown Instance'),
        'Start Instance': gettext('Start Instance'),
        'Reboot Instance': gettext('Reboot Instance'),
        'Suspend Instance': gettext('Suspend Instance'),
        'Unsuspend Instance': gettext('Unsuspend Instance'),
        'PowerOff Instance': gettext('PowerOff Instance'),
        'PowerOn Instance': gettext('PowerOn Instance'),
        'Resume Instance': gettext('Resume Instance'),
        'Resize Instance': gettext('Resize Instance'),
        'Create Snapshot': gettext('Create Snapshot'),
        'Delete Snapshot': gettext('Delete Snapshot'),
        'Create Volume': gettext('Create Volume'),
        'Delete Volume': gettext('Delete Volume'),
        'Create Instance Snapshot': gettext('Create Instance Snapshot'),
        'Delete Instance Snapshot': gettext('Delete Instance Snapshot'),
        'Update Router': gettext('Update Router'),
        'Create Router': gettext('Create Router'),
        'Delete Router': gettext('Delete Router'),
        'Resize Volume': gettext('Resize Volume'),
        'Allocate Floating IP': gettext('Allocate Floating IP'),
        'Delete Floating IP': gettext('Delete Floating IP'),
        'Create Network': gettext('Create Network'),
        'Update Network': gettext('Update Network'),
        'Delete Network': gettext('Delete Network'),
        'Create Image': gettext('Create Image'),
        'Delete Image': gettext('Delete Image'),
        'Upload Image': gettext('Upload Image'),
        'Create Subnet': gettext('Create Subnet'),
        'Delete Subnet': gettext('Delete Subnet'),
        'Update Subnet': gettext('Update Subnet'),
        'Rebuild Instance': gettext('Rebuild Instance'),
        'Attach Volume': gettext('Attach Volume'),
        'Detach Volume': gettext('Detach Volume'),


        'Create Security_group': gettext('Create Security Group'),
        'Delete Security_group': gettext('Delete Security Group'),
        'Update Security_group': gettext('Update Security Group'),

        'Create Security_group_rule': gettext('Create Security Group Rule'),
        'Delete Security_group_rule': gettext('Delete Security Group Rule'),
        'Update Security_group_rule': gettext('Update Security Group Rule'),

        'Create Keypair': gettext('Create KeyPair'),
        'Delete Keypair': gettext('Delete KeyPair')
      };
      scope.operationlogTypei18n = {
              'instance': gettext('Instance'),
	              'image': gettext('Image'),
		              'volume': gettext('Volume'),
			              'router': gettext('Router'),
				              'ip.floating': gettext('Floating IP'),
					              'snapshot': gettext('Volume Snapshot'),
						              'network': gettext('Network'),
							              'subnet': gettext('subnet'),

								              'security_group': gettext('Security Groups'),
									              'security_group_rule': gettext('Security Group Rule'),
										              'keypair': gettext('Key Pair')
											            };
    scope.searchLog = function(){
        self.reset();
        PolicyService.check({ rules: [['telemetry', 'telemetry:query_sample']] })
        .success(function(response) {
          if (response.allowed){
            var data = self.generateDate();
            if(data === 'all'){
              CeilometerAPI.getAllActivities()
              .success(function(response) {
                scope.activities = response.items;
                    scope.iactivitiesState = true;
              });
            }else{
              CeilometerAPI.getActivitiesByDate(data)
              .success(function(response) {
                scope.activities = response.items;
                    scope.iactivitiesState = true;
              });
            }
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
          }
        });
    };
    this.generateDate = function (){
      var data = {};
      var now = new Date();
      if(scope.query.timeRange === 'hour'){
        var lastHour = new Date(now.getTime() - 60*60000);
        data = {
          start: self.parseDate(lastHour),
          end:self.parseDate(now)
        };
      }else if(scope.query.timeRange === 'day'){
        var lastDay = new Date(now.getTime() - 24*60*60000);
        data = {
          start:self.parseDate(lastDay),
          end:self.parseDate(now)
        };
      }else if(scope.query.timeRange === 'month'){
        var current = new Date();
        var lastMonth = new Date(current.setMonth(now.getMonth()-1));
        data = {
          start:self.parseDate(lastMonth),
          end:self.parseDate(now)
        };
      }else if(scope.query.timeRange === 'other'){
        data = {
          start:scope.query.start,
          end:scope.query.end
        };
      }else if(scope.query.timeRange === 'all'){
        data = 'all';
      }
      return data;
    };
    // this function defined for mocking the condition where you click the left accordion
    // panel ,the default behavior the log table displays.
    this.generateOneDayDate = function(){
      var now = new Date();
      var lastDay = new Date(now.getTime() - 24*60*60000);
      return {
        start:self.parseDate(lastDay),
        end:self.parseDate(now)
      };
    };
    this.parseDate= function(date){
      return date.getFullYear()+'-'+self.formatDateNum(date.getMonth()+1)+'-'+self.formatDateNum(date.getDate())+' '+self.formatDateNum(date.getHours())+':'+self.formatDateNum(date.getMinutes());
    };
    this.formatDateNum = function(dateNum){
      return parseInt(dateNum)<10?'0'+ parseInt(dateNum): parseInt(dateNum);
    };
    this.reset = function() {
      scope.activities = [];
      scope.iactivities = [];
      scope.iactivitiesState = false;
      scope.selected = {};
      scope.checked = {};
      if(scope.selectedData){
          scope.selectedData.aData = [];
      }
    };
    this.init = function(){
        scope.actions = {
          refresh: self.refresh
        };
        self.refresh();
      };
    // on load, if user has permission
    // fetch table data and populate it
    // it is a function that be called when
    // you click the left accordion panel ,and it is the default behavior
    // that the function calls the log by one day
    this.refresh = function(){
        self.reset();
        PolicyService.check({ rules: [['telemetry', 'telemetry:query_sample']] })
        .success(function(response) {
          if (response.allowed){
            var data = self.generateOneDayDate();
            CeilometerAPI.getActivitiesByDate(data)
              .success(function(response) {
                scope.activities = response.items;
                angular.forEach(scope.activities, function(activity){
                    activity.actionDecode = scope.operationlogActioni18n[activity.action] || activity.action;
                    activity.typeDecode = scope.operationlogTypei18n[activity.type] || activity.type;
                });
                    scope.iactivitiesState = true;
              });
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
          }
        });
    };

    $(function(){
       $('#start').datetimepicker({
          format: 'yyyy-mm-dd hh:ii',
          language: 'zh-CN',
          startView: 2,
          minView: 0,
          autoclose: true
        }).on('changeDate', function(){
          var start = $('#start').val();
          if (start) {
            var endTime = new Date(start).getTime() + 5*60*1000;
            $('#end').datetimepicker('setStartDate', new Date(endTime));
          }
        });

       $('#end').datetimepicker({
          format: 'yyyy-mm-dd hh:ii',
          language: 'zh-CN',
          startView: 2,
          minView: 0,
          autoclose: true
        }).on('changeDate', function(){
          var end = $('#end').val();
          if (end) {
            var startTime = new Date(end).getTime() - 5*60*1000;
            $('#start').datetimepicker('setEndDate', new Date(startTime));
          }
        });
    });

    this.init();

    //this to generate the search options if there is decode str in the table
        function generateDecodeMagicSearchOptions(decodeObj){
	      var magicDeocdeSearchOptionArr= [];
	            for(var prop in decodeObj){
		            magicDeocdeSearchOptionArr.push({ label: decodeObj[prop], key: decodeObj[prop] });
			          }
				        return magicDeocdeSearchOptionArr;
					    }
    scope.filterFacets = [{
      label: gettext('Action'),
      name: 'actionDecode',
      singleton: true,
      options: generateDecodeMagicSearchOptions(scope.operationlogActioni18n)
    }, {
      label: gettext('Type'),
      name: 'typeDecode',
      singleton: true,
      options: generateDecodeMagicSearchOptions(scope.operationlogTypei18n)
    }, {
      label: gettext('Resource Name'),
      name: 'resource',
      singleton: true
    }, {
      label: gettext('Operator'),
      name: 'operatorname',
      singleton: true
    }, {
      label: gettext('Operation Seconds(s)'),
      name: 'operation_time',
      singleton: true
    }, {
      label: gettext('Time'),
      name: 'timestamp',
      singleton: true
    }];

  }]);

})();
