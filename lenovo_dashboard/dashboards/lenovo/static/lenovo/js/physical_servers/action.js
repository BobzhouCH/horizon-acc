(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.physical_servers')
        .service('lenovoPhysicalServersAction', ['$modal', 'horizon.dashboard.lenovo.physical_servers.Path',
            'horizon.openstack-service-api.uus', 'horizon.framework.widgets.toast.service', 'horizon.physical.nova.service',
            function (modal, path, serverAPI, toastService, novaService) {

                var context = {};

                function action(scope) {

                    var self = this;
                    self.controllerScope = scope;

                    var deleteServerOption = {
                        templateUrl: path + 'server/delete/',
                        controller: 'lenovoPhysicalServersDeleteServerController',
                        windowClass: 'neutronListContent',
                        resolve: {
                            serverIds: function () {
                            },
                            serverNames: function () {
                            }
                        }
                    };

                    self.deleteServer = function (servers) {
                        if (servers) {
                            var serverIds = [];
                            var serverNames = [];
                            angular.forEach(servers, function (row) {
                                serverIds.push(row.id);
                                serverNames.push(row.hostname);
                            });
                            deleteServerOption.resolve.serverIds = function () {
                                return serverIds
                            };
                            deleteServerOption.resolve.serverNames = function () {
                                return serverNames.join(',')
                            };
                            modal.open(deleteServerOption).result.then(self.submitDeleteServer);
                        }
                    };

                    self.submitDeleteServer = function (serverIds) {
                        var hasError = false;

                        angular.forEach(serverIds, function (serverId) {
                            serverAPI.deleteHost(serverId);
                            //.success(function (data) {
                            //  if (data && data.status && data.status == 'success') {
                            //  } else {
                            //      hasError = true;
                            //      //toastService.add('error', gettext('Delete server failed.') + ' ' + data.msg);
                            //  }
                            //})
                            //.error(function (data) {
                            //    hasError = true;
                            //    //toastService.add('error', gettext('Delete server failed.') + ' ' + data);
                            //});
                        });
                        //
                        //if (!hasError) {
                        //    toastService.add('success', gettext('Successfully delete servers!'));
                        //}
                    };

                    self.launchBMC = function (server) {
                        serverAPI.launchBMC(server[0].id, server[0].bmcip, server[0].https_enabled);
                    };


                    self.setKsmStatus = function (data) {
                        if (data && data.length > 0) {

                            angular.forEach(data, function (obj, index) {

                                obj.ksm.loadingStatus = 'suspending'
                                novaService.setKsmStatus({
                                    hostname: obj.hostname,
                                    enable: scope.novaStatus.ksm.displayText === '/ On' ? 'enable' : 'disable'
                                }).then(function (result) {
                                    if (result.statusText === 'OK') {
                                        obj.ksm.loadingStatus = 'success'
                                        obj.ksm.status = result.config.data.action === 'enable' ? 'On' : 'Off'
                                    } else {
                                        obj.ksm.loadingStatus = 'error'
                                    }
                                })
                                    .catch(function (err) {
                                        console.log(err)
                                    })
                            })
                        }
                    };

                    self.setzramStatus = function (data) {
                        if (data && data.length > 0) {

                            angular.forEach(data, function (obj, index) {

                                obj.zram.loadingStatus = 'suspending'

                                novaService.setZramStatus({
                                    hostname: obj.hostname,
                                    enable: scope.novaStatus.zram.displayText === '/ On' ? 'enable' : 'disable'
                                }).then(function (result) {
                                    if (result.statusText === 'OK') {
                                        obj.zram.loadingStatus = 'success'
                                        obj.zram.status = result.config.data.action === 'enable' ? 'On' : 'Off'
                                    } else {
                                        obj.zram.loadingStatus = 'error'
                                    }
                                })
                            })
                        }

                    };
                }

                return action;
            }
        ]);
})();