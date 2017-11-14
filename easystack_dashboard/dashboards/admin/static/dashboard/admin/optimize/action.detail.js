/**
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
     * Brings up the create user modal dialog.
     * On submit, create a new user and display a success message.
     * On cancel, do nothing.
     */
        .factory('createLogDetailAction',
        ['$modal', 'backDrop',
            function (modal, backdrop) {

                function action(scope) {

                    /*jshint validthis: true */

                    var self = this;
                    var option = {
                        templateUrl: (window.WEBROOT || '/') + 'admin/optimize/log-detail',
                        controller: 'logDetailCtrl',
                        backdrop: backdrop,
                        windowClass: 'logDetailContent',
                        resolve: {
                            detail: function () {
                                return detail;
                            }
                        }
                    };

                    $('.logDetailContent').css('height',$(window).height())

                    self.open = function (id, algorithm_id) {
                        option.resolve.detail = function(){ return { "id": id, "algorithm_id":algorithm_id }; };
                        modal.open(option).result.then(self.submit);
                    };

                }

                return action;
            }])
    .controller('logDetailCtrl', [
            '$scope', '$rootScope', '$modalInstance', 'horizon.openstack-service-api.optimize', 'horizon.framework.widgets.toast.service', 'detail',
            function(scope, rootScope, modalInstance, optimizeAPI, toastService, detail){
                var self = this;
                scope.action = {
                    cancel: function(){
                        modalInstance.close();
                    }
                }

                scope.context = {
                    'tabUtilization':gettext('CPU utilization before and after the optimization'),
                    'tabRecordList':gettext('Migration record list'),
                    'hostList':gettext('Host List'),
                    'title':''
                }

                scope.filterFacets = [];

                self.echartsOptimize = function (type, id, objArray, algorithm_id) {
                    require(
                        [
                            'echarts'
                        ],
                        function (ec) {
                            var option = self.echarts_mix(objArray, algorithm_id)
                            var myChart = ec.init(document.getElementById(id));
                            myChart.setOption(option);
                        }
                    )
                }
                self.echarts_mix = function (data, algorithm_id) {
                    var hostArr = [];
                    var beforeData = [];
                    var afterData = [];
                    if (data.resultObj.before && data.resultObj.before != null) {
                        var beforeHostArr = data.resultObj.before;
                        var afterHostArr = data.resultObj.after ? data.resultObj.after : [];
                        for (var j = 0; j < beforeHostArr.length; j++) {
                            if ($.inArray(beforeHostArr[j].hostName, hostArr) == -1) {
                                hostArr.push(beforeHostArr[j].hostName)
                            }
                            //if ($.inArray(beforeHostArr[j].hostUsage.cpuUtil, beforeData) == -1) { //comments for value equal
                            if(algorithm_id == 'PM') {
                                beforeData.push(beforeHostArr[j].VMsUsage.cpuUsage ? beforeHostArr[j].VMsUsage.cpuUsage : 0);
                            }else{
                                beforeData.push(beforeHostArr[j].hostUsage.cpuUtil ? beforeHostArr[j].hostUsage.cpuUtil : 0);
                            }
                            //}
                        }
                        for (var j = 0; j < afterHostArr.length; j++) {
                            if ($.inArray(afterHostArr[j].hostName, hostArr) == -1) {
                                hostArr.push(afterHostArr[j].hostName)
                            }
                            //if ($.inArray(afterHostArr[j].hostUsage.cpuUtil, afterData) == -1) {//comments for value equal
                            if(algorithm_id == 'PM') {
                                afterData.push(afterHostArr[j].VMsUsage.cpuUsage ? afterHostArr[j].VMsUsage.cpuUsage : 0);
                            }else{
                                afterData.push(afterHostArr[j].hostUsage.cpuUtil ? afterHostArr[j].hostUsage.cpuUtil : 0)
                            }

                            //}
                        }
                    } else {
                        return;
                    }
                    var title = '';
                    if(algorithm_id == 'PM'){
                        title = gettext('CPU Allocation Rate');
                    }else{
                        title = gettext('CPU Utilization Rate');
                    }
                    scope.logChartTitle = title;
                    var option = {
                        tooltip: {
                            trigger: 'axis',
                            formatter:function(params){
                                return params[0].name;
                            }
                        },
                        legend: {
                            selectedMode:false,
                            data: [
                                gettext('workload_before'),
                                gettext('workload_after'),
                                gettext('workload_increase'),
                                gettext('workload_decrease')
                            ]
                        },
                        calculable: true,
                        grid: {x: 60, x2: 40},
                        xAxis: [
                            {
                                type: 'category',
                                data: hostArr,
                                axisLabel: {
                                    show: false,
                                    interval: 0
                                },
                            },
                            {
                                type: 'category',
                                axisLine: {show: false},
                                axisTick: {show: false},
                                //axisLabel: {show: false},
                                splitArea: {show: false},
                                splitLine: {show: false},
                                data: hostArr,
                                axisLabel: {
                                    show: false,
                                    interval: 0
                                },
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                axisLabel: {formatter: '{value}'}
                            }
                        ],
                        series: [
                            {
                                name: gettext('workload_decrease'),
                                type: 'bar',
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(163,205,90,0.5)',
                                        label: {show: true, textStyle: {color: '#000'}, position: 'insideTop'}
                                    }
                                },
                                data: beforeData
                            },
                            {
                                name: gettext('workload_increase'),
                                type: 'bar',
                                xAxisIndex: 1,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(255,69,0,0.5)',
                                        label: {
                                            show: true,
                                            textStyle: {color: '#000'},
                                            position: 'insideTop',
                                            formatter: function (p) {
                                                return p.value > 0 ? (p.value + '\n') : '';
                                            }
                                        }
                                    }
                                },
                                data: afterData
                            },
                            {
                                name: gettext('workload_before'),
                                type: 'line',
                                smooth: false,
                                itemStyle: {normal: {color: 'rgba(132,112,255,0.7)'}},
                                data: beforeData
                            },
                            {
                                name: gettext('workload_after'),
                                type: 'line',
                                smooth: false,
                                itemStyle: {normal: {color: 'rgba(60,179,113,0.7)'}},
                                data: afterData
                            }
                        ]
                    };

                    return option;
                }

                this.clearSelected = function () {
                    scope.checked = {};
                    return scope.$table && scope.$table.resetSelected();
                };

                this.hasSelected = function (log) {
                    return scope.$table.isSelected(log);
                };

                this.removeSelected = function (log) {
                    if (self.hasSelected(log)) {
                        scope.checked[log.id] = false;
                        scope.$table.unselectRow(log);
                    }
                };

                this.initScope = function () {
                    scope.taskList = [];
                    scope.itaskList = [];
                    scope.itaskListState = false;

                    scope.clearSelected = self.clearSelected;
                    scope.actions = {
                        refresh: self.refresh
                    };
                };

                this.reset = function () {
                    scope.taskList = [];
                    scope.itaskList = [];
                    scope.itaskListState = false;

                    self.clearSelected();
                    toastService.clearAll();
                };

                // fetch table data and populate it
                this.refresh = function () {
                    optimizeAPI.getTaskJob(detail.id)
                        .success(function (response) {
                            //response = eval(response); //for test local json
                            var items = response.resultObj.marigation_actions;
                            self.echartsOptimize('mix', 'optimize-detail-cpuUsage', response, detail.algorithm_id);
                            scope.taskList = items;
                            scope.itaskListState = true;
                            scope.taksSummary = response.resultObj.summary;

                        });
                };

                this.init = function () {
                    self.initScope();
                    self.refresh();
                };

                var w = 644;
                var h = $(window).height();
                scope.$watch('scope.taskList', function (newValue, oldValue) {
                    $('.logDetailContent').css({
                        height: h,
                        width: w,
                        right: -w
                    });
                    $('.tab-content').css({
                        height: h - 62
                    });
                    $('.logDetailContent').stop();
                    $('.logDetailContent').animate({
                        right: 0
                    }, 400)
                        .css('overflow', 'visible');
                });
                $(window).resize(function () {
                    var w2 = 888;
                    var h2 = $(window).height();
                    $('.logDetailContent').css({
                        width: w2,
                        height: h2
                    });
                    $('.tab-content').css({
                        height: h2 - 62
                    });
                });

                this.init();

            }])

})();