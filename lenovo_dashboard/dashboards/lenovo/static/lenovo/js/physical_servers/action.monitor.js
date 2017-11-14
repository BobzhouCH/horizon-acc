/**
 * physical_servers----monitor actions
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.lenovo.physical_servers')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit monitor modal dialog.
   * On submit, edit monitor and display a success message.
   * On cancel, do nothing.
   */
    .factory('lenovoPhysicalServerMonitorAction',
       ['horizon.openstack-service-api.vpn',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service','horizon.dashboard.lenovo.physical_servers.Path',
  function(vpnAPI, modal, backDrop, toastService,path) {
                var context = {
                    mode: 'monitor',
                    title: gettext('Monitor')
                  };
                // monitor setting
                function action(scope) {
                    var self = this;
                    var option = {
                      templateUrl: path + 'monitor',
                      controller: 'physicalServerMonitorForm',
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
                      option.templateUrl = path + 'monitor/'+ clone.id;
                      modal.open(option);
                    };
                  };
            return action;
  }])

    // MonitorsConfig
    .factory('monitorsConfig',['horizon.openstack-service-api.nova','horizon.openstack-service-api.uus','horizon.dashboard.lenovo.physical_servers.Path',
            function(serviceAPI,uusAPI,path){
              function action(scope){
                    var self = this,
                    monitorItems = [],
                    btypes = [],
                    ptypes = [],
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
                self.btypes = btypes;
                self.ptypes = ptypes;

                // Set all monitor data
                self.echartDataFormat = function(){
                  var option = {
                    tooltip: {
                      trigger: 'axis'
                    },
                    grid: {
                      left: '8%',
                      right: '3%',
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
                        }
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
                      //url = '/lenovo/physical_servers/' + rid + '/detail',
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
                   //serviceAPI.getMonitorMetaData1('b8c25441-4bc4-4dae-8b68-1013063392e9')///////////////////////////////////
                   serviceAPI.getOVSMonitorMetaData(scope.instance.hostname)
                   .success(function(response){
                     scope.iMonitorState = true;
                     var items = response;
                     for(var i=0; i<items.length; i++){
                       self.aInstant.push([]);
                       var newItem = {
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

                     var btype = {};
                     var ptype = {};
                     for(var i=0; i<monitorItems.length; i++){
                       if(monitorItems[i].meter === 'ovs_stats.if_packets'){
                          ptype = {
                            name: monitorItems[i].name
                          }
                          if(monitorItems[i].vname){
                             ptype.meter = gettext(items[i].meter) + '('+ items[i].vname +')';
                          }else{
                             ptype.meter = gettext(items[i].meter);
                          }
                          ptypes.push(ptype);
                       }else{
                         btype = {
                           name: monitorItems[i].name
                         }
                         if(monitorItems[i].vname){
                           btype.meter = gettext(items[i].meter) + '('+ items[i].vname +')';
                         }else{
                           btype.meter = gettext(items[i].meter);
                         }
                         btypes.push(btype);
                       }
                     }
                     // if(types && (types.length)){
                     //   scope.monitor_type = types[0].name;
                     // }

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
    .directive('actionInstant', [function(){
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
            var index = attrs.actionInstant,
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
            var index = attrs.actionInstant,
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
    }])

})();
