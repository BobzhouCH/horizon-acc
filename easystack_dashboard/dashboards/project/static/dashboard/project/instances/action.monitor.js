/**
 * Copyright 2015 Easystack Corp.
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

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngDoc instanceMonitorAction
   * @ngService
   *
   * @Description
   * Brings up the instance monitor modal dialog.
   * On cancel, do nothing.
   */
  .factory('instanceMonitorAction', ['$modal',
                                     'backDrop',
                                     'horizon.framework.widgets.toast.service',
    function(modal, backDrop, toastService) {

      var context = {
        mode: 'monitor',
        title: gettext('Instance Monitor')
      };

      function action(scope) {

        /*jshint validthis: true */
        var self = this;
        var option = {
          templateUrl: 'monitor',
          controller: 'instanceMonitorForm',
          backdrop: backDrop,
          resolve: {
            instance: function(){ return null; },
            context: function(){ return context; }
          },
          windowClass: 'monitorFormCtrl'
        };

        // open up the monitor form
        self.open = function(instance) {
          var clone = angular.copy(instance[0]);
          option.resolve.instance = function(){ return clone; };
          option.templateUrl = (window.WEBROOT || '') + 'project/instances/monitor/' + clone.id;
          modal.open(option);
        };

      };

      return action;
    }])

  // Monitor
  .factory('monitorConfig',[
    'horizon.openstack-service-api.nova',
    function(serviceAPI){
    function action(scope){
      var self = this,
          context = {
            cpu: gettext('CPU')
          },
          monitorItems = [],
          types = [],
          allMonitorData = [],
          one_day = 1,
          one_week = 7,
          one_month = 30,
          half_year = 180,
          instant_time = 2;

      self.aInstant = [];
      self.iNow = null;
      self.aIndex = [];

      // Monitor data config
      self.monitorItems = monitorItems;
      self.types = types;

      // Set all monitor data
      self.echartDataFormat = function(){
        var option = {
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            left: '7%',
            right: '7%',
            top: '10%',
            bottom: '12%'
          },
          axisTick: {
            lineStyle: {
              color: '#ccc'
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: '#ccc'
              }
            },
            axisLabel:{
              textStyle:{
                color:"#717171",
                fontSize:12
              },
              // formatter: function (val) {
              //     if (val) {
              //         return val.split(" ").join("\n");
              //     } else {
              //         return null;
              //     }
              // }
            },
            data: []
          },
          yAxis: {
            axisLine: {
              lineStyle: {
                color: '#ccc'
              }
            },
            axisLabel:{
              textStyle:{
                color:"#717171",
                fontSize:12
              }
            },
            type: 'value'
          },
          series: [
            {
              name:'',
              type:'line',
              animation: false,
              itemStyle : {
                normal : {
                  color:'#358577',
                  lineStyle:{
                    color:'#358577'
                  }
                }
              },
              data:[]
            }
          ]
        };

        return option;
      };

      self.setMonitorData = function(id, name, singleValue){
        var singleVal = singleValue;
        var option = self.echartDataFormat();
        for(var i=0,len=singleVal.length; i<len; i++){
          var val  = parseInt(singleVal[i].avg),
              time = singleVal[i].period_end.replace('T', ' '),
              tipsName = name;

          // value
          option.series[0].data.push(val);
          option.series[0].name = tipsName;
          // time
          option.xAxis.data.push(time);
        }
        scope.drawingChart(id, option);
      };

      // Call function
      function getSingleMonitorData(i, option){
        var rid = monitorItems[i].rid,
            url = '/project/instances/' + rid + '/detail',
            data = {
              date_options: option,
              rid: rid
            };

        data.meter = monitorItems[i].meter;

        serviceAPI.getMonitor(url, data)
        .success(function(response){
          scope.eDataState = true;
          if( option === instant_time){
            if(self.aInstant[i].length>300){
              self.aInstant[i].splice(0, 1);
            }
            self.aInstant[i].push(response[0]);
            self.setMonitorData(monitorItems[i].id, monitorItems[i].name, self.aInstant[i]);
          }
          else{
            self.setMonitorData(monitorItems[i].id, monitorItems[i].name, response);
          }
        });
      };
      var iBtn = true;
      function repeatCallAjax(option){
        function callFn(){
          for(var i=0,len=monitorItems.length; i<len; i++){
            getSingleMonitorData(i, option);
          }
        };

       if(iBtn){
         serviceAPI
         .getMonitorMetaData(scope.instance.id)
         .success(function(response){
           scope.iMonitorState = true;
           var items = response, newItem;

           for(var i=0; i<items.length; i++){
             self.aInstant.push([]);
             newItem = {
                rid: items[i].id,
                meter: items[i].meter,
                unit: gettext(items[i].unit),
                id: 'monitor-item-' + i
             };
             if(items[i].vname){
               newItem.name = gettext(items[i].name) + '('+ items[i].vname +')';
               newItem.vname = gettext(items[i].vname);
             }
             else{
               newItem.name = gettext(items[i].name);
             }
             monitorItems.push(newItem);
           }


           var type = {};
           for(var i=0; i<monitorItems.length; i++){
            type = {
              name:monitorItems[i].name
            }
            if(monitorItems[i].vname){
              type.meter = monitorItems[i].meter+'('+monitorItems[i].vname+')';
            }else{
              type.meter = monitorItems[i].meter;
            }
            types.push(type);
           }

           if(types && (types.length)){
             scope.monitor_type = types[0].name;
           }


           callFn();
           iBtn = false;
         });
       }
       else{
         callFn();
       }
      };

      function singleCallAjax(option, index){
        getSingleMonitorData(index, option);
      };

      // Initialization
      self.init = function(){
        var option = self.echartDataFormat();
        scope.tags = {
          oneDay: false,
          oneWeek: false,
          oneMonth: false,
          halfYear: false,
          instantTime: false,
          option: 1
        };

        scope.cleanAllChart(option);
        scope.eDataState = false;
        scope.eDataResult = false;
      };

      self.eventAction = function(tag, index){
        if(!index){
          self.init();
        }

        var strategy = {
          instant: function(){
            scope.tags.instantTime = true;
            singleCallAjax(instant_time, index);
          },

          stopInstant: function(){
            scope.tags.instantTime = false;
            singleCallAjax(scope.tags.option, index);
          },

          day: function(){
            scope.tags.oneDay = true;
            scope.tags.option = one_day;
            repeatCallAjax(one_day);
          },

          week: function(){
            scope.tags.oneWeek = true;
            scope.tags.option = one_week;
            repeatCallAjax(one_week);
          },

          month: function(){
            scope.tags.oneMonth = true;
            scope.tags.option = one_month;
            repeatCallAjax(one_month);
          },

          year: function(){
            scope.tags.halfYear = true;
            scope.tags.option = half_year;
            repeatCallAjax(half_year);
          }
        };

        strategy[tag]();
      };
    };

    return action;
  }])

  // action-instant
  .directive('actionInstants', [function(){
    return {
      restrict: 'A',
      template: '<a class="js-real" href="javascript:;" ng-show="isReal">{$ realTime $}</a>'+
                '<a class="js-stop" href="javascript:;" ng-show="isStop" class="active">{$ stop $}</a>',
      link: linkInstant
    };

    ///////////////////////////
    function linkInstant(scope, element, attrs){
      var iNow   = null,
          sendRequest;

      scope.realTime = gettext('Real Time');
      scope.stop = gettext('stop');
      scope.isReal = true;
      scope.isStop = false;

      sendRequest = function(){
        for(var i=0; i<scope.monitors.aIndex.length; i++){
          scope.monitors.eventAction('instant', scope.monitors.aIndex[i]);
        }
      };

      element.find('.js-real').click(function(){
        var index = attrs.actionInstants,
            option,
            parentDom;

        scope.isReal = false;
        scope.isStop = true;
        scope.monitors.aIndex.push(index);

        scope.monitors.eventAction('instant', index);

        option = scope.monitors.echartDataFormat();
        scope.cleanSingleChart(scope.monitors.monitorItems[index].id, option);

        parentDom = element.find(this).parent().parent();
        parentDom.find('.js-interval').hide();
        parentDom.find('.js-instant').show();

        clearInterval(scope.monitors.iNow);
        scope.monitors.iNow = setInterval(function(){
          if(scope.monitors.aIndex.length === 0){
            clearInterval(scope.monitors.iNow);
            return false;
          }
          sendRequest();
        },2000);
        return false;
      });

      element.find('.js-stop').click(function(){
        var index = attrs.actionInstants,
            subindex,
            option,
            parentDom;

        scope.isReal = true;
        scope.isStop = false;
        subindex = $.inArray(index, scope.aIndex);
        scope.monitors.aIndex.splice(subindex, 1);
        scope.monitors.aInstant[index] = [];

        parentDom = element.find(this).parent().parent();
        parentDom.find('.js-interval').show();
        parentDom.find('.js-instant').hide();

        option = scope.monitors.echartDataFormat();
        scope.cleanSingleChart(scope.monitors.monitorItems[index].id, option);

        scope.monitors.eventAction('stopInstant', index);
      });
    };
  }]);

})();
