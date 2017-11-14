(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.network_switches')
     .controller('lenovoNetworkSwitchesDetailController', [
        '$scope', '$modalInstance', 'horizon.openstack-service-api.switch', 'switchData', 'lenovoNetworkSwitchesAction',
    function (scope, modalInstance, switchAPI, inSwitchData, modalAction) {
        var self = this;

        var h = $(window).height();
        var w = Math.max(350, $(window).width() / 8 * 4);
        scope.action = {
            submit: function () {
                modalInstance.close();
            },
            cancel: function () {
                $('.detailContent').stop();
                $('.detailContent').animate({
                    right: -(w + 40)
                }, 400, function () {
                    modalInstance.dismiss('cancel');
                });
            }
        };

        scope.context = {
            header: {
                title: gettext('General Information'),
                hostname: gettext('Host Name'),
                switchIp: gettext('Switch IP'),
                macAddress: gettext('MAC Address'),
                serial: gettext('Serial Number'),
                osVersion: gettext('OS Version'),
                osType: gettext('Firmware Type'),
                cpu: gettext('CPU'),
                memory: gettext('Memory'),
                sshPort: gettext('SSH Port'),
                username: gettext('Username'),
                restPort: gettext('REST Port'),
                protocol: gettext('Protocol'),

                nodeName: gettext('Node Name'),
                port: gettext('Port'),

                adding: gettext('Adding...'),
                editting: gettext('Editting...'),
                deleting: gettext('Deleting...')
            },
            action: {
                create: gettext('Add Port Mapping'),
                edit: gettext('Edit'),
                delete: gettext('Delete Port Mapping')
            }
        };

        this.init = function () {
            this.refresh();
            scope.isAdding = false;
            scope.isEditting = false;
            scope.isDeleting = false;
        };

        this.reset = function () {
            scope.inodes = [];
            scope.nodes = [];
            scope.nodeState = false;

            scope.switchData = {};
            scope.switchHostname = "";

            if (scope.selectedData) {
                scope.selectedData.aData = [];
            }
        }

        this.refresh = function () {
            self.reset();
            switchAPI.getSwitch(inSwitchData.uuid, inSwitchData.pmswitch_id)
                .success(function (data) {
                    scope.switchData = data;
                    scope.switchHostname = inSwitchData.hostname;

                    ////////////////////mock/////////////////////////////////
                    //if (!scope.switchData.rest_tcp_port) {
                    //    scope.switchData.rest_tcp_port = '443';
                    //}
                    ////////////////////mock/////////////////////////////////
                });

            switchAPI.getNodes(inSwitchData.uuid, inSwitchData.pmswitch_id)
                .success(function (response) {

                    //scope.$broadcast('hzTable:rowReset');
                    var specificScope = angular.element('#nodes_all_checkbox').scope();
                    specificScope.specialReset();

                    var temp_count_id = 0;
                    angular.forEach(response.port_mapping, function (value, key) {
                        temp_count_id++;
                        scope.nodes.push({ id: temp_count_id, nodename: key, port: value });
                        //scope.nodes.push({ nodename: key, port: value });
                    });

                    scope.nodeState = true;
                    //angular.element('#nodes_all_checkbox').prop('checked', false);
                });
        }

        scope.showPagination = function () {
            // get $$childHead first and then iterate that scope's $$nextSiblings
            var parentScope = angular.element('#nodes_pagination').scope();

            for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
                if (cs.pages && cs.pages.length > 1) {
                    return true;
                }
            }
            return false;
        }

        scope.actions = {
            refresh: this.refresh,
            modal: new modalAction(scope)
        };

        scope.filterFacets = [
            {
                label: gettext('Node Name'),
                name: 'node',
                singleton: true
            },
            {
                label: gettext('Port'),
                name: 'port',
                singleton: true
            }
        ];

        scope.$watch('scope.switchData', function () {
            $('.detailContent').css({
                height: h,
                width: w,
                right: -w
            });
            $('.detailContent .tab-content').css({
                height: h - 62
            });
            $('.detailContent').stop();
            $('.detailContent').animate({
                right: 0
            }, 400)
            .css('overflow', 'visible');
        });

        this.init();
    }]);
})();