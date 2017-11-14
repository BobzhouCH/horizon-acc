/*
*  Created by lihuimi on 2017.3.23.
*  physical servers monitor modal setting
* */
(function() {
  'use strict';
  angular.module('hz.dashboard.lenovo.physical_servers')

  // instance monitor controller
    .controller('physicalServerMonitorForm',['$scope', '$modalInstance','instance', 'context',
        'monitorsConfig', 'horizon.openstack-service-api.nova',
        function(scope, modalInstance,instance, context, MonitorsConfig, serviceAPI){

         // modal 弹窗设置
        var action = {
            submit: function() {
                modalInstance.close(instance);
                },
            cancel: function() {
                modalInstance.dismiss('cancel');
                clearInterval(scope.monitors.iNow);
            }
        },
        echartIds = [],
        monitor = new MonitorsConfig(scope);

        scope.instance = instance;
        scope.action = action;
        scope.monitors = monitor;
        scope.context = context;

        // 图表显示
        scope.drawingChart = function(id,option){
          echartIds.push(id);
          echarts.init(document.getElementById(id)).setOption(option);
        };
        scope.cleanAllChart = function(option){
          for(var i=0; i<echartIds.length; i++){
            echarts.init(document.getElementById(echartIds[i])).setOption(option,true);
          }
        };
        scope.cleanSingleChart = function(id, option){
          echarts.init(document.getElementById(id)).setOption(option,true);
        };

        // init
        monitor.eventAction('day');
        scope.eDataState = false;
        scope.eDataResult = false;
        scope.iMonitorState = false;

        // change type
        scope.changeMonitorType = function (name) {
            scope.monitor_type = name;
        }
        scope.changeMonitorTypes = function () {
            delete scope.monitor_type;
        }

  }])

})();
