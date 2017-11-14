/**
 * Copyright 2015 IBM Corp.
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

    angular.module('hz.dashboard.admin.optimize')

    /**
     * @ngDoc createAction
     * @ngService
     *
     * @Description
     * Brings up the create strategy modal dialog.
     * On submit, create a new strategy and display a success message.
     * On cancel, do nothing.
     */
        .factory('optimizeConduct',
        [
            '$modal', 'backDrop',
            'horizon.framework.widgets.toast.service',
            function (modal, backDrop, toastService) {

                var context = {
                    mode: 'create',
                    title: gettext('Pre-optimization View'),
                    submit: gettext('Accept'),
                    success: gettext('Instance Snapshot %s was successfully created.')
                };

                function action(scope) {

                    /*jshint validthis: true */
                    var self = this;
                    var option = {
                        templateUrl: (window.WEBROOT || '/') + 'admin/optimize/prevOptimize',
                        controller: 'conductOptimizeCtrl',
                        backdrop: backDrop,
                        windowClass: 'prevOptimizeContent',
                        resolve: {
                            context: function () {
                                return context;
                            }
                        }
                    };

                    self.open = function () {
                        modal.open(option).result.then(self.submit);
                    };

                };

                return action;
            }])
        .controller('conductOptimizeCtrl', [
            '$scope', '$rootScope', '$http', '$modalInstance',
            'horizon.openstack-service-api.optimize',
            'horizon.framework.widgets.toast.service',
            'globalTask',
            function (scope, rootScope, $http, modalInstance, optimizeAPI, toastService, globalTask) {

                var self = this;
                var arrStr = document.cookie.split("; ");
                var tokenStr;
                for (var i = 0; i < arrStr.length; i++) {
                    if (arrStr[i].split('=')[0] == "csrftoken") {
                        tokenStr = arrStr[i].split('=')[1];
                    }
                }
                var index = window.location.pathname.substr(1).indexOf("/");
                var baseUrl = window.location.origin + window.location.pathname.substr(0, index + 2) + 'api';
                scope.conductDisabled = '';
                scope.disableConduct = true;
                scope.strategyChartState = false;
                scope.context = {
                    fieldset: {
                        'name': gettext('Optimization Scheme')
                    },
                    'title': gettext('Pre-optimization View'),
                    'desc': gettext('optimization summary..'),
                    'submit': gettext('Accept')
                }
                scope.action = {
                    submit: function () {
                        rootScope.hasMigrate = true;
                        modalInstance.close();
                        if (rootScope.taskId != false) {
                            toastService.add('error', gettext('There is an optimization task proccessing, please try again later.'));
                        } else {
                            var config = {
                                'algorithm_id': scope.selectedStrategy.id,
                                'cluster_id':rootScope.clusterId
                            };
                            optimizeAPI.optimizeAction(config)
                                .success(function(data) {
                                    rootScope.taskId = data.resultObj;
                                    if (rootScope.taskId && rootScope.taskId != null && rootScope.taskId !='' && rootScope.taskId!= false) {
                                        new globalTask(rootScope.taskId);
                                    } else {
                                        rootScope.hasMigrate = false;
                                    }
                                }).error(function () {
                                    rootScope.hasMigrate = false;
                                })
                            /*$.ajax({
                                dataType: "json",
                                type: "POST",
                                data: JSON.stringify(data),
                                url: baseUrl + '/optimizations' + '?' + $.now(),
                                headers: {
                                    'X-Requested-With': 'XMLHttpRequest',
                                    'X-CSRFTOKEN': tokenStr
                                },
                                success: function (data) {
                                    rootScope.taskId = data.resultObj;
                                },
                                error: function (data) {
                                    toastService.clearAll();
                                    toastService.add('error', gettext('There was a problem communicating with the server, please try again.'))
                                }
                            });*/
                        }
                    },
                    cancel: function () {
                        modalInstance.dismiss('cancel');
                    }
                };

                this.init = function () {
                    scope.selectText = {
                        hasStrategy:gettext('Select Strategy'),
                        noStrategy:gettext('No Strategy Available')
                    }
                    optimizeAPI.getStrategy()
                        .success(function (response) {
                            //response = eval(response); //for test local json
                            var items = response.resultObj;
                            if(items.length && items.length >0){

                                //begin:strategy id -> for cluster id
                                if(rootScope.selectedStrategyId && rootScope.selectedStrategyId != ''){
                                    $.each(items,function(i){
                                        if(rootScope.selectedStrategyId == items[i].id){
                                            scope.strategyList = [];
                                            scope.strategyList.push(items[i]);
                                            scope.selectedStrategy = items[i];
                                            scope.context.desc = items[i].desc;
                                            var data = {
                                                'preview': items[i].id,
                                                'cluster_id':rootScope.clusterId
                                            };
                                            self.getStrategyChart(data);
                                        }
                                    })
                                }else{
                                    scope.strategyList = items;
                                    scope.selectedStrategy = items[0];
                                    scope.context.desc = items[0].desc;
                                    //get strategy chart - type=chord
                                    var data = {
                                        'preview': items[0].id,
                                        'cluster_id':rootScope.clusterId
                                    };
                                    self.getStrategyChart(data);
                                }
                                //end:strategy id -> for cluster id
                            } else {
                                $('#optimize-chart').html(gettext('No Optimization Scheme'));
                            }
                        });
                }

                self.getStrategyChart = function (dataSend) {
                    optimizeAPI.getStrategyChart(dataSend)
                        .success(function(data){
                            scope.strategyChartState = true;
                            scope.strategyDesc = data.resultObj.summary;
                            //var data = eval(data);
                            var formatData = self.convertHost(data.resultObj.migrations);
/*                            if ($('#conduct-button').hasClass('disabled')) {
                                $('#conduct-button').removeClass('disabled');
                            }*/
/*                            if (rootScope.forbid_migration == true) {
                                //scope.conductDisabled = 'disabled';
                                $('#conduct-button').addClass('disabled')
                            } else {*/
                                //if (data.resultObj.migrations && data.resultObj.migrations.length > 0) {
                                if (data.resultObj.need_optimize && data.resultObj.need_optimize == true) {
                                   scope.disableConduct = false;
                                    if(data.resultObj.migrations && data.resultObj.migrations.length > 0){
                                        self.echartsOptimize('chord', 'optimize-chart', formatData);
                                    }
                                } else {
                                    scope.strategyDesc = '';
                                    $('#optimize-chart').html(gettext('Do not need to perform optimization.'));
                                }
/*                            }*/

                        })
                   /* $.ajax({
                        type: "POST",
                        //type: "GET",
                        //url: baseUrl + '/optimizations-preview' + '?' + $.now(),
                        url: 'http://10.100.219.116/dashboard/static/dashboard/admin/optimize/json/optimizations-preview.json',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRFTOKEN': tokenStr
                        },
                        data: JSON.stringify(dataSend),
                        //data: {'preview': id},
                        success: function (data) {
                            var data = eval(data);
                            var formatData = self.convertHost(data.resultObj.migrations);
                            if ($('#conduct-button').hasClass('disabled')) {
                                $('#conduct-button').removeClass('disabled');
                            }
                            if (rootScope.forbid_migration == true) {
                                //scope.conductDisabled = 'disabled';
                                $('#conduct-button').addClass('disabled')
                            } else {
                                if (!data.resultObj.migrations.length || data.resultObj.migrations.length <= 0) {
                                    $('#conduct-button').addClass('disabled')
                                }
                            }


                            self.echartsOptimize('chord', 'optimize-view', formatData);
                        }
                    });*/
                }

                scope.updateStrategySelection = function (obj) {
                    scope.context.desc = obj.desc;
                    scope.selectedStrategy = obj;
                    var data = {
                        'preview': obj.id,
                        'cluster_id':rootScope.clusterId
                    };
                    self.getStrategyChart(data);
                }

                self.indexOfHost = function (l, e) {
                    for (var i = 0; i < l.length; i++) {
                        if (l[i].isSame(e.src_host_id, e.dst_host_id))
                            return i;
                    }
                    return -1;
                }

                self.createNewHost = function (host1, host2) {
                    var obj = {}
                    obj.host1 = host1;
                    obj.host2 = host2;
                    obj.vmlist = [];
                    obj.migrations = [];

                    obj.isSame = function (host1, host2) {
                        if ((obj.host1 == host1 && obj.host2 == host2) || (obj.host2 == host1 && obj.host1 == host2))
                            return true;
                        else
                            return false;
                    };
                    return obj
                }

                self.convertHost = function (migrations) {
                    var self = this;
                    var result = [];
                    for (var i in migrations) {
                        var m = migrations[i];
                        if (m.src_host_id != null && m.dst_host_id != null) {
                            var index = self.indexOfHost(result, m);
                            if (index < 0) {
                                index = result.length;
                                var new_migration = self.createNewHost(m.src_host_id, m.dst_host_id);
                                new_migration.vmlist.push(m.vm_id);
                                new_migration.migrations.push(m);

                                result.push(new_migration);
                            }
                            else {
                                result[index].vmlist.push(m.vm_id);
                                result[index].migrations.push(m);
                            }
                        }
                    }
                    return result;
                }

                self.echartsOptimize = function (type, id, objArray) {
                    var self = this;
                    require(
                        [
                            'echarts'
                        ],
                        function (ec) {
                            var option = self.echarts_chord(objArray);
                            var myChart = ec.init(document.getElementById(id));
                            myChart.setOption(option);
                        }
                    )
                }

                self.echarts_chord = function (objArray) {
                    var lendArr = [];
                    var nodesArr = [];
                    var linksArr = [];
                    for (var i = 0; i < objArray.length; i++) {
                        if (objArray[i].host1 != null && $.inArray(objArray[i].host1, lendArr) == -1) {
                            lendArr.push(objArray[i].host1);
                            nodesArr.push({'name': objArray[i].host1})
                        }
                        if (objArray[i].host2 != null && $.inArray(objArray[i].host2, lendArr) == -1) {
                            lendArr.push(objArray[i].host2);
                            nodesArr.push({'name': objArray[i].host2})
                        }

                        linksArr.push(
                            {
                                source: objArray[i].host1,
                                target: objArray[i].host2,
                                weight: objArray[i].vmlist.length,
                                name: objArray[i].migrations
                            },
                            {target: objArray[i].host1, source: objArray[i].host2, weight: 0.9}
                        )
                    }

                    var option = {
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                if (params.indicator2) {
                                    var tips = '';
                                    for (var i = 0; i < params.value.name.length; i++) {
                                        tips += params.value.name[i].vm_id + ' from ' + params.value.name[i].src_host_id + ' ' + gettext('MoveTo') + ' ' + params.value.name[i].dst_host_id + '<br />';
                                    }
                                    return tips;
                                } else {
                                    return params.value.name
                                }
                            }
                        },
                        legend: {
                            show: false,
                            orient: 'vertical',
                            x: 'left',
                            y: '50',
                            itemGap: 30,
                            data: lendArr
                        },
                        series: [
                            {
                                type: 'chord',
                                sort: 'ascending',
                                sortSub: 'descending',
                                showScale: false,
                                clockWise: true,
                                /*itemStyle : {
                                 normal : {
                                 label : {
                                 rotate : true
                                 }
                                 }
                                 },*/
                                // 使用 nodes links 表达和弦图
                                nodes: nodesArr,
                                links: linksArr
                            }
                        ]
                    };
                    return option;
                }

                this.init();


            }])

})();