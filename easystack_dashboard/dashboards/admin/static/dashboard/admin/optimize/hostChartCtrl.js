(function () {
    'use strict';

    /**
     * @ngdoc hz.dashboard.admin.optimize
     * @ngModule
     *
     * @description
     * Provides all of the services and widgets required
     * to support and display the admin optimize panel.
     */
    angular.module('hz.dashboard.admin.optimize')
        .controller('adminOptimizeCtrl', [
            '$scope', '$rootScope',
            'horizon.openstack-service-api.optimize',
            'horizon.framework.widgets.toast.service',
            'optimizeConduct',
            'globalTask',
            function (scope, rootScope, optimizeAPI, toastService, optimizeConduct, globalTask) {
            var self = this;
            rootScope.taskId = false;
            /*if ($('#optimizetopology').length === 0) {
             return;
             }*/
            rootScope.forbid_migration = false; //visible
            rootScope.disableMigration = true;
            rootScope.hasMigrate = true;
            scope.ihostlistState = false;
            this.refresh = function(id){
                rootScope.clusterClicked = true;
                var data = {id:id}
                optimizeAPI.getHostLists(data)
                    .success(function (res) {
                        var hostsList = res.resultObj;
                        scope.hostLists = hostsList;
                        //var hostsLen = 0;  //one host is up can optimize
                        if(hostsList.length > 0){
                            /*
                            for(var i=0;i<hostsList.length;i++){
                                if(hostsList[i].status == 'up'){
                                    hostsLen += 1;
                                }
                            }
                            if(hostsLen <= 1){
                                rootScope.forbid_migration = true; //unvisible
                            } else {
                                rootScope.disableMigration = false;
                            }
                            */
                            rootScope.disableMigration = false;
                        }
                        /*
                        else{
                            rootScope.forbid_migration = true; //unvisible
                        }
                        */
                        scope.ihostlistState = true;
                    })
            }

            this.data_onece = function (params) {
                optimizeAPI.getIfHasTask(params)
                    .success(function(data){
                        if (data.resultObj && data.resultObj != '') {
                            var taskId = data.resultObj;
                            if (taskId && taskId != null && taskId != '') {
                                rootScope.taskId = taskId;
                                rootScope.disableMigration = true;
                                if (rootScope.taskId != false) {
                                    new globalTask(rootScope.taskId);
                                }
                            } else {
                                rootScope.taskId = false;
                                rootScope.hasMigrate = false;
                            }
                        } else {
                            rootScope.taskId = false;
                            rootScope.hasMigrate = false;
                        }
                    })
            }

            var timer;

            this.init = function(id){

                if ($('#optimizetopology').length === 0) {
                    return;
                }
               // $('#optimizeContainer').spin(horizon.conf.spinner_options.modal);
                self.refresh(id);
                clearInterval(timer);
                timer = setInterval(function () {
                    self.refresh(id);
                }, 30000);
                this.data_onece({aggregate_id:id, state:1}); //state:1(running) 2(finished)
            }

            scope.context = {
                'conductText':gettext('Conduct Optimization')
            }

            scope.actions = {
                create: new optimizeConduct(scope),
            };

            scope.showBalloon = function(d, e){
                var $this = $(e.target);
                boxEvent.show_balloon(d, $this);
            }

            $(document)
                .click(function () {
                    boxEvent.delete_balloon();
                })
                .on('click', 'a.closeTopologyBalloon', function (e) {
                    e.preventDefault();
                    boxEvent.delete_balloon();
                })
                .on('click', '.topologyBalloon', function (e) {
                    e.stopPropagation();
                })
                .on('click','#optimize-tabset > .nav-tabs > li',function(event){
                    clearInterval(timer);
                    /*add cluster
                    if ($(event.target).parent().attr('id') == 'topology-tab') {
                        timer = setInterval(function () {
                            self.refresh();
                        }, 3000);
                    }
                    */
                })

            var boxEvent = {
                svg_container: '#optimizeContainer',
                balloon_id: null,
                balloon_tmpl: Hogan.compile($('#balloon_container').html()),
                balloon_device_tmpl: Hogan.compile($('#balloon_device').html()),
                show_balloon: function (d, element) {
                    var self = this;
                    if (self.balloon_id) {
                        self.delete_balloon();
                    }
                    var balloon_tmpl = self.balloon_tmpl;
                    var device_tmpl = self.balloon_device_tmpl;
                    var balloon_id = 'bl_' + d.id;

                    var device_position = element;

                    if (d.hostUsage && d.hostUsage != null) {
                        var html_data = {
                            balloon_id: balloon_id,
                            id_label: gettext("ID"),
                            id: d.id,
                            name: d.hostName,
                            cpuusage_label: gettext("CPU Usage"),
                            cpuusage: d.hostUsage.cpuUtil + '%',
                            memory_label: gettext("Memory Usage"),
                            memoryusage: d.hostUsage.memoryUtil + '%'
                        }
                        var x = device_position.offset().left - 220;
                        var y = device_position.offset().top - 140;
                    } else {
                        var html_data = {
                            balloon_id: balloon_id,
                            id_label: gettext("ID"),
                            id: d.id,
                            name: d.vmName,
                            cpuusage_label: gettext("CPU Usage"),
                            cpuusage: d.vmUsage.cpuUtil + '%',
                            memory_label: gettext("Memory Usage"),
                            memoryusage: d.vmUsage.memoryUtil + '%'
                        }
                        var x = device_position.offset().left - 270;
                        var y = device_position.offset().top -180;
                    }

                    var html = balloon_tmpl.render(html_data, {
                        table1: device_tmpl
                    });
                    $(self.svg_container).append(html);


                    var $balloon = $('#' + balloon_id);
                    $('#' + balloon_id).css({
                        'left': x,
                        'top': y
                    })
                        .addClass('topPosition')
                        .show();

                    self.balloon_id = balloon_id;
                },
                delete_balloon: function () {
                var self = this;
                if (self.balloon_id) {
                    $('#' + self.balloon_id).remove();
                    self.balloon_id = null;
                }
            }
            }

            //this.init();

            //begin:wujx:optimzation:<add cluster>:20170310
            this.clusterStrategyCheck = function(){
                if(scope.clustersList && scope.clustersList.length >0 && scope.clusterStrategies && scope.clusterStrategies.length >0){
                    $.each(scope.clustersList,function(i){
                        $.each(scope.clusterStrategies,function(j){
                            if(scope.clusterStrategies[j].aggregates && scope.clusterStrategies[j].aggregates.length>0){
                                for(var m=0;m<scope.clusterStrategies[j].aggregates.length;m++){
                                    if(scope.clustersList[i].id.toString() == scope.clusterStrategies[j].aggregates[m].toString()){
                                        scope.clustersList[i].selectedStrategy = scope.clusterStrategies[j].name;
                                        scope.clustersList[i].selectedStrategyId = scope.clusterStrategies[j].id;
                                    }
                                }

                            }
                        })
                    })
                }
            }

            this.getClusters = function(){
                optimizeAPI.getClusters()
                    .success(function (res) {
                        var clusters = res.resultObj;
                        scope.clustersList = clusters;
                        self.clusterStrategyCheck();
                    })
                optimizeAPI.getStrategy()
                    .success(function (response) {
                        //response = eval(response); //for test local json
                        var strategies = response.resultObj;
                        scope.clusterStrategies = strategies;
                        self.clusterStrategyCheck();
                    });

            }

            scope.changeTopology = function(id, strtegy_id){
                scope.hostLists = [];
                scope.ihostlistState = false;
                rootScope.selectedStrategyId = strtegy_id;
                rootScope.clusterId = id;
                self.init(id);
            }
            scope.backToClusters = function(){
                rootScope.clusterClicked = false;
                scope.ihostlistState = false;
                scope.hostLists = [];
                clearInterval(timer);
            }
                //init - get cluster list
            this.getClusters();
            $('#topology-tab').on('click',function(){
                self.getClusters();
            });
            scope.strategyFn = {
               changeStrategy:function(e) {
                   e.stopPropagation();
               },
               selectedStategy: function(id, name){
                    var elem = $(event.target).children('span')
                   /* cluster select strategies checkbox - select more than one
                    if(elem.hasClass('glyphicon-ok')){
                        elem.removeClass('glyphicon glyphicon-ok')
                    }else{
                        elem.addClass('glyphicon glyphicon-ok')
                    }
                    */
                   //cluster select strategies radio box - select only one
                   $.each(elem.parents('li').siblings(),function(){
                       $(this).find('.glyphicon-ok').removeClass('glyphicon glyphicon-ok')
                   })
                   elem.addClass('glyphicon glyphicon-ok')
                    scope.newStrategyId = id;
                    scope.selectedStrategyName = name;
               },
              changeStrategyAction:function(cluster, init_strategy_id){
                  var old_strategy_id = init_strategy_id;
                  var new_strategy_id = scope.newStrategyId;
                  $(event.target).parents('.dropdown').removeClass('open');
                  var addNewStrategyAction = function(data){
                      optimizeAPI.updateClusterStrategy(data)
                                .success(function (response) {
                                    //response = eval(response); //for test local json
                                    if(response.success ==true){
                                        cluster.selectedStrategy = scope.selectedStrategyName;
                                        cluster.selectedStrategyId = data.strategy_id;
                                        //self.clusterStrategyCheck();
                                    }
                                });
                  }

                   var data_new = {
                      cluster_id:parseInt(cluster.id),
                      strategy_id:new_strategy_id,
                      remove: 'false',
                  }
                  if(init_strategy_id && init_strategy_id!=null){
                      var data_old = {
                          cluster_id:parseInt(cluster.id),
                          strategy_id:old_strategy_id,
                          remove: 'true',
                      }
                      optimizeAPI.updateClusterStrategy(data_old)
                        .success(function (response) {
                            //response = eval(response); //for test local json
                              if(response.success == true){
                                  addNewStrategyAction(data_new)
                              }
                        });

                  }else{
                      addNewStrategyAction(data_new)
                  }
              }
            }



        }])
        .controller('hz.dashboard.admin.optimize.LogsCtrl', [
            '$scope', '$rootScope',
            'horizon.openstack-service-api.optimize',
            'horizon.framework.widgets.toast.service',
            'createLogDetailAction',
            function (scope, rootScope, optimizeAPI, toastService, CreateDetailAction) {

                var self = this;

                var actions = {
                    createDetail: new CreateDetailAction(scope),
                };

                scope.detailOpen = function(id, algorithm_id){
                    var modal = new CreateDetailAction(scope);
                    modal.open(id, algorithm_id);
                }

                scope.context = {
                    header: {
                        id: gettext('ID'),
                        state: gettext('State'),
                        operate: gettext('Operator'),
                        created: gettext('Start Time'),
                        end: gettext('End Time'),
                        scheme: gettext('Optimization Scheme')
                    },
                    error: {
                        api: gettext('Unable to retrieve logs'),
                        priviledge: gettext('Insufficient privilege level to view log information.')
                    }
                };

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
                    scope.logList = [];
                    scope.ilogList = [];
                    scope.ilogListState = false;

                    scope.clearSelected = self.clearSelected;
                    scope.actions = {
                        refresh: self.refresh
                    };
                };

                this.reset = function () {
                    scope.logList = [];
                    scope.ilogList = [];
                    scope.ilogListState = false;

                    self.clearSelected();
                    toastService.clearAll();
                };

                // fetch table data and populate it
                this.refresh = function (isReset) {
                    !isReset ? self.reset() : false;
                    optimizeAPI.getLogLists()
                        .success(function (response) {
                            //response = eval(response); //for test local json
                            scope.logList = response.resultObj;
                            scope.ilogListState = true;

                        });
                };

                this.init = function () {
                    self.initScope();
                    self.refresh();
                };

                var self = this;

                $('#log-tab').on('click',function(){
                    rootScope.clusterClicked = false;
                    self.init();
                });

                scope.filterFacets = [{
                    label: gettext('ID'),
                    name: 'id',
                    singleton: true
                }, {
                    label: gettext('Create Time'),
                    name: 'start_at',
                    singleton: true
                }];

                scope.$on('logList', function () {
                    self.refresh(true);
                });

            }])
        .filter('logStateFilter', function () {
            return function (v) {
                var state = '-';
                switch (v) {
                    case 0:
                        state = 'planned';
                        break;
                    case 1:
                        state = 'processing';
                        break;
                    case 2:
                        state = 'success';
                        break;
                    case 3:
                        state = 'failed';
                        break;
                    case 4:
                        state = 'aborted';
                        break;
                    case 5:
                        state = 'timeout';
                        break;
                }
                return gettext(state);
            }
        })
        .filter('concatIds', function () {
            return function (v) {
                var str = '';
                if(v.length >0){
                    str = v.join(',');
                }
                return str;
            }
        })
        .controller('hz.dashboard.admin.optimize.manageCtrl', [
            '$scope', '$rootScope',
            'horizon.openstack-service-api.optimize',
            'horizon.framework.widgets.toast.service',
            function (scope, rootScope, optimizeAPI, toastService) {
                var self = this;

                scope.context = {
                    header: {
                        id: gettext('ID'),
                        name: gettext('Name'),
                        aggregates: gettext('Clusters ID'),
                        desc: gettext('Description')
                    },
                    error: {
                        api: gettext('Unable to retrieve strategies'),
                        priviledge: gettext('Insufficient privilege level to view strategies information.')
                    }
                };

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
                    scope.management = [];
                    scope.imanagement = [];
                    scope.imanagementState = false;

                    scope.clearSelected = self.clearSelected;
                    scope.actions = {
                        refresh: self.refresh
                    };
                };

                this.reset = function () {
                    scope.management = [];
                    scope.imanagement = [];
                    scope.imanagementState = false;

                    self.clearSelected();
                    toastService.clearAll();
                };

                // fetch table data and populate it
                this.refresh = function (isReset) {
                    !isReset ? self.reset() : false;
                    optimizeAPI.getStrategy()
                        .success(function (response) {
                            //response = eval(response); //for test local json
                            scope.management = response.resultObj;
                            scope.imanagementState = true;

                        });
                };

                this.init = function () {
                    self.initScope();
                    self.refresh();
                };

                var self = this;

                $('#manage-tab').on('click',function(){
                    rootScope.clusterClicked = false;
                    self.init();
                });

                scope.filterFacets = [{
                    label: gettext('ID'),
                    name: 'id',
                    singleton: true
                }, {
                    label: gettext('Name'),
                    name: 'name',
                    singleton: true
                }];

                scope.$on('management', function () {
                    self.refresh(true);
                });
            }])
        .factory('globalTask',['$rootScope', 'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.optimize', function(rootScope, toastService, optimizeAPI){
            function jobQuery(taskId){
                if(taskId && taskId != null && taskId != 'null'){
                    optimizeAPI.getTaskJob(taskId)
                        .success(function(data){
                            if (data.resultObj.status != 'success') {
                                var actionArr = data.resultObj.marigation_actions;
                                if (actionArr.length && actionArr.length > 0) {
                                    for (var i = 0; i < actionArr.length; i++) {
                                        $('.vmWrap').each(function () {
                                            if ($(this).attr('id') == actionArr[i].vm_name) {//actionArr[i].vm_name
                                                if (!$(this).hasClass('boxShadow'))
                                                    $(this).addClass('boxShadow');
                                            }
                                        })
                                    }
                                }
                                if (data.resultObj.status == 'planned' || data.resultObj.status == 'processing') {
                                    setTimeout(function(){
                                        jobQuery(rootScope.taskId)
                                    }, 5000);
                                } else {
                                    rootScope.hasMigrate = false;
                                    rootScope.taskId = false;
                                    $('.vmWrap').removeClass('boxShadow');
                                    toastService.add('error', gettext('Optimize failed.'));
                                }
                                rootScope.hasMigrate = true;
                            } else {
                                rootScope.taskId = false;
                                rootScope.hasMigrate = false;
                                $('.vmWrap').removeClass('boxShadow');
                                toastService.add('success', gettext('Optimize successfully.'));
                            }
                        })
                }
            }
            return jobQuery;
        }])

        .filter('textFilter',function(){
            return function (v) {
                return gettext(v);
            }
        })
})();