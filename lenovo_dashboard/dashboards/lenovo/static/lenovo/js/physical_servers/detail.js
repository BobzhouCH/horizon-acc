(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.physical_servers')
     .filter('display_interface_ports', function () {
         return function (inputValue) {
             var result = '';

             angular.forEach(inputValue, function (data) {
                 result += ';' + data.name;
             });

             result = result.substring(1);
             return result;
         };
     })
    .filter('display_interface_provider_networks', function () {
        return function (inputValue) {
            var result = '';

            angular.forEach(inputValue, function (data) {
                result += ';' + data.name;
            });

            result = result.substring(1);
            return result;
        };
    })
    .filter('display_interface_attributes', function () {
        return function (inputValue) {
            var result = '';

            angular.forEach(inputValue, function (data) {
                result += ';' + data.name + '=' + data.value;
            });

            result = result.substring(1);
            return result;
        };
    })
    .controller('physicalServerDetailController', [
        '$scope', '$filter', '$modalInstance', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.uus', 'horizon.openstack-service-api.neutron', 'serverId', 'serverName', 'serverIp','serverPower','Lock_status', 'context', 'horizon.openstack-service-api.nova', 'horizon.framework.widgets.toast.service', 'lenovoInterfaceConfigAction',
    function (scope, filter, modalInstance, policyService, uusAPI, neutronAPI, serverId, serverName, serverIp, serverPower, Lock_status, context, novaAPI, toastService, action) {
        scope.poc = {};
        scope.pocSubmit = function () {
            var uploadString = JSON.stringify(scope.poc,null,'\t');
            alert(uploadString);

            novaAPI.sendPOC(scope.poc).success(
                function (response) {
                    alert(response);
                }
            );
        }

        scope.serverName = serverName;
        scope.serverIp = serverIp;
        scope.Lock_status = Lock_status;
        scope.actions = {
            //modal: new action(scope, serverId)
            modal: new action(scope, serverId, serverName, serverIp, Lock_status)
        };

        scope.ports = [];
        scope.iports = [];
        scope.interfaces = [];
        scope.iinterfaces = [];
	scope.showPortsAndInterfacesTab = false;

        scope.interface = {};
        scope.interface.network_type = 'none';

        scope.interface.ports = [];
        scope.interface_ports = [];
        scope.interface_ports_checked = [];

        scope.interface.providerNetworks = [];
        scope.interface_providerNetworks = [];
        scope.interface_providerNetworks_checked = [];

        scope.port_auto_decode = {
            0: 'No',
            1: 'Yes'
        }

        var self = this;

        scope.refreshInterfaces = function () {
            //novaAPI.getLenovoInterfaces(serverId)
            novaAPI.getLenovoInterfaces(serverName, serverIp)
            .success(
                function (response) {
                    //alert("Get response from server: " + response + JSON.stringify(response));
                    self.interfaces_fake_data(response);
                }
            ).error(function (msg) {
                alert("Error: " + msg + ", will use fake data");
                toastService.add('error', gettext('Unable to get interfaces data successfully.'));
                self.interfaces_fake_data();
            });

            //novaAPI.getLenovoInterfacePorts(serverId)
            novaAPI.getLenovoPorts(serverName, serverIp)
            .success(
                function (response) {
                   // alert("Get response from server: " + response + JSON.stringify(response));
                    self.interface_ports_fake_data(response);
                }
            ).error(function (msg) {
                alert("Error: " + msg + ", will use fake data");
                toastService.add('error', gettext('Unable to get interface ports data successfully.'));
                self.interface_ports_fake_data();
            });
        };

        if (serverPower == 'on') {
        scope.refreshInterfaces();
        }

        self.interfaces_fake_data = function (data) {
            if (data) {
                scope.interfaces = data;
		  scope.showPortsAndInterfacesTab = true;
		  if (data.length > 0) {
                    if (data[0]) {
                        if (data[0]['physerver_type']) {
                            if (data[0]['physerver_type'] == "not_compute") {
                                scope.showPortsAndInterfacesTab = false;
                            }
                        }
                    }
                  }

               // scope.showPortsAndInterfacesTab = true;

            } else {
                scope.interfaces = [
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "eth0",
                        "network_type": "infra,ZZZZZZ,WWWWWW,DDDDD,CCCCC,WWWWW,AAAAAA,xxxxx",
                        "type": "ethernet",
                        "vlan_id": 0,
                        "ports": "eth0,eth1",
                        "uses": "",
                        "used_by": "",
                        "provider_networks": "providernet-a,providernet-b",
                        "attributes": "MTU=1500,accelerated=TRUE",
                        "support_config": "yes",
                        "pci_passthrough_supported": "yes",
                        "pci_sriov_supported": "yes"
                    },
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "eth1",
                        "network_type": "infra,ZZZZZZ,WWWWWW,DDDDD,CCCCC,WWWWW,AAAAAA,xxxxx",
                        "type": "ethernet",
                        "vlan_id": 0,
                        "ports": "eth0,eth1",
                        "uses": "",
                        "used_by": "",
                        "provider_networks": "providernet-a,providernet-b",
                        "attributes": "MTU=1500,accelerated=TRUE",
                        "support_config": "yes",
                        "pci_passthrough_supported": "yes",
                        "pci_sriov_supported": "no"
                    },
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "eth2",
                        "network_type": "infra,ZZZZZZ,WWWWWW,DDDDD,CCCCC,WWWWW,AAAAAA,xxxxx",
                        "type": "ethernet",
                        "vlan_id": 0,
                        "ports": "eth0,eth1",
                        "uses": "",
                        "used_by": "",
                        "provider_networks": "providernet-a,providernet-b",
                        "attributes": "MTU=1500,accelerated=TRUE",
                        "support_config": "yes",
                        "pci_passthrough_supported": "no",
                        "pci_sriov_supported": "yes"
                    },
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "eth3",
                        "network_type": "infra,ZZZZZZ,WWWWWW,DDDDD,CCCCC,WWWWW,AAAAAA,xxxxx",
                        "type": "ethernet",
                        "vlan_id": 0,
                        "ports": "eth0,eth1",
                        "uses": "",
                        "used_by": "",
                        "provider_networks": "providernet-a,providernet-b",
                        "attributes": "MTU=1500,accelerated=TRUE",
                        "support_config": "yes",
                        "pci_passthrough_supported": "no",
                        "pci_sriov_supported": "no"
                    },
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "eth4",
                        "network_type": "data",
                        "type": "ethernet",
                        "vlan_id": 1,
                        "ports": "eth0,eth1,eth2",
                        "uses": "",
                        "used_by": "",
                        "provider_networks": "providernet-a1,providernet-b1",
                        "attributes": "MTU=1500",
                        "support_config": "no",
                        "pci_passthrough_supported": "no",
                        "pci_sriov_supported": "no"
                    }
                ];
            }
        };

        self.interface_ports_fake_data = function (data) {
            if (data) {
                scope.ports = data;
            } else {
                scope.ports = [
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "port_AAA",
                        "mac": "00:1e:67:68:01:37",
                        "pci": "0000:0b:00.0",
                        "processor": 0,
                        "auto": 0,
                        "device": "Ethernet Controller Intel Corporation I350 Gigabit Network Connection"
                    },
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "port_BBB",
                        "mac": "11:1e:67:68:01:37",
                        "pci": "1111:0b:00.0",
                        "processor": 0,
                        "auto": 0,
                        "accelerated": 1,
                        "device": "Ethernet Controller Intel Corporation I350 Gigabit Network Connection"
                    },
                    {
                        "id": "XXXXXXXXXXXXXX",
                        "name": "port_CCC",
                        "mac": "11:1e:67:68:01:37",
                        "pci": "1111:0b:00.0",
                        "processor": 0,
                        "auto": 0,
                        "accelerated": 1,
                        "device": "Ethernet Controller Intel Corporation I350 Gigabit Network Connection"
                    }
                ];
            }
        }

        var w = 1255;
        var action = {
            //submit: function () {
            //    modalInstance.close(serverId);
            //},
            cancel: function () {
                //$('.detailContent').stop();
                $('.detailContent').animate({
                    right: -(w + 40)
                }, 400, function () {
                    modalInstance.dismiss('cancel');
                });
            }
        };

        //neutronAPI.getSubnet(detail.net_id).success(function(subnet) {
        //  scope.subnet = subnet;
        //});

        //scope.testCount = 1;

        this.resetEventLog = function () {
            scope.serverLog = [];
            scope.iserverLog = [];
        };

        scope.powerParam = {};
        // unit is minute
        scope.powerIntervals = ['100', '200', '300', '400', '500'];
        // unit is day
        scope.powerDurations = ['1', '2', '3', '4', '5'];
        scope.powerParam.powerInterval = scope.powerIntervals[2] + "m";
        scope.powerParam.powerIntervalOption = scope.powerIntervals[2];
        scope.powerParam.powerDuration = scope.powerDurations[2];
        scope.powerParam.powerDurationOption = scope.powerDurations[2];

        scope.changePowerIntervalOption = function () {
            scope.powerParam.powerInterval = scope.powerParam.powerIntervalOption+ "m";
            scope.refreshPowerHistory();
        }

        scope.changePowerDurationOption = function () {
            scope.powerParam.powerDuration = scope.powerParam.powerDurationOption;
            scope.refreshPowerHistory();
        }

        this.resetPowerHistory = function () {
            scope.powerData = {};
            scope.ipowerData = {};
        };

        this.resetPowerCapping = function () {
            scope.cappingData = {
                Cap: '-',
                Min: '-',
                Max: '-',
                IsCapable: '-',
                IsEnable: '-'
            };
            scope.capping = {};
        };

        scope.getHostInfo = function() {
            policyService.check({ rules: [['project', 'image:get_all']] })
            .success(function (response) {
                if (response.allowed) {
                    uusAPI.getHost(serverId)
                      .success(function (response) {

                          console.log(JSON.stringify(response));

                            //var pro_info = '';
                            var pro_info = {};
                            var pro;
                            var raw;
                            var memo_size;
                            var memo_mod;
                            var memo_spd;
                            var memo_manu;
                            var memo_info = {};
                            var memo;
                            var raid_mod;
                            var raid_manu;
                            var raid_info = '';
                            var raid;
                            var mm_type;
                            var detail_power;
                            var detail_role;
                            var authed;
                            var nic_mod;
                            var nic_manu;
                            var nic_name;
                            var nic;
                            var nic_info = {};
                            var identity_name;
                            var identity_des;
                            var identity_type;
                            var identity_value;
                            var identity;
                            var identity_info = {};

                            if(response.type == 2){
                                mm_type = "IMM";
                            }else if(response.type == 31){
                                mm_type = "TSM";
                            }else{
                                mm_type = "BMC";
                            }

                            if(response.authed == true){
                                authed = true;
                            }else{
                                authed = false;
                            }

                            for(var i = 0; i<response.Processor.length; i++){
                                //pro = response.Processor[i].OtherFamilyDescription;
                                //if(pro == ''){ pro = response.Processor[i].Name; }
                                //pro_info = pro_info + pro + ', ';
                                pro = response.Processor[i].caption;
                                pro += ': ' + response.Processor[i].name;
                                pro += ' ' + response.Processor[i].number_of_enabled_cores + 'cores';
                                pro_info[i] = pro;
                            }

                            for(var j = 0; j<response.PhysicalMemory.length; j++){
                                raw = response.PhysicalMemory[j].capacity;
                                memo = '';
                                memo_size = raw/(1024*1024*1024);
                                memo_mod = response.PhysicalMemory[j].model;
                                memo_spd = response.PhysicalMemory[j].speed;
                                memo_manu = response.PhysicalMemory[j].manufacturer;

                                memo = memo_size + 'GB ' + memo_mod + ' ' + memo_spd + 'MHz ' + memo_manu;
                                memo_info[j] = memo;
                            }

                            for(var k = 0; k<response.RAID.length; k++){
                                raid_mod = response.RAID[k].Model;
                                raid_manu = response.RAID[k].Manufacturer;

                                raid = raid_mod + '(' + raid_manu + ')';
                                raid_info = raid_info + raid + ', ';
                            }

                            for(var l = 0; l<response.Nic.length; l++){
                                nic = '';
                                //nic_name = response.Nic[l].name;
                                //nic_mod = response.Nic[l].model;
                                //nic_manu = response.Nic[l].manufacturer;

                                //nic = nic_name + ' ' + nic_mod + ' ' + nic_manu ;
                                //nic_info[l] =  nic;
                                nic += response.Nic[l].deviceID;
                                nic += ': ' + response.Nic[l].name;
                                nic_info[l] = nic;
                            }

                            for(var m = 0; m<response.SoftwareIdentity.length; m++){
                                identity = '';
                                identity_name = response.SoftwareIdentity[m].name;
                                identity_des = response.SoftwareIdentity[m].description;
                                identity_type = response.SoftwareIdentity[m].identity_info_type;
                                identity_value = response.SoftwareIdentity[m].identity_info_value;

                                identity = identity_name + ' ' + identity_type + ' ' + identity_value+ ' ' + identity_des ;
                                identity_info[m] = identity;
                            }


                            //ROLE distribute
                            if(response.role_names[0] == 'controller'){
                                detail_role = gettext('Controller');
                            }else if(response.role_names[0] == 'compute'){
                                detail_role = gettext('Compute');
                            }else if(response.role_names[0] == 'storage'){
                                detail_role = gettext('Storage');
                            }else if(response.role_names[0] == 'cinder'){
                                detail_role = gettext('Cinder');
                            }else{
                                detail_role = gettext('Others');
                            }
                            //POWER distribute
                            if(response.power == 'on'){
                                detail_power = gettext('On');
                            }else if(response.power == 'off'){
                                detail_power = gettext('Off');
                            }else if(response.power == 'pending'){
                                detail_power = gettext('Pending');
                            }

                            scope.mm_type = mm_type;


                            scope.serverData = {
                                hostname: response.hostname,
                                power: detail_power,
                                role: detail_role,
                                hostip: response.hostip,
                                bmcip: response.bmcip,
                                product: response.productname,
                                type: response.mt,
                                serial: response.sn,
                                uuid: response.uuid,
                                //cpu: pro_info.substring(0, pro_info.length - 2),
                                cpu: pro_info,
                                memory: memo_info,
                                nic: nic_info,
                                identity: identity_info,
                                raid: raid_info.substring(0, raid_info.length - 2),
                                driver: raid_info.substring(0, raid_info.length - 2),
                                extcard: '[ ]',// refer to 2.2, there is no extcard info.
                                authed: authed
                            };

                            if (scope.serverData.authed == true){
                                scope.refreshPowerCapping();
                                scope.refreshPowerHistory();
                            }
                            scope.refreshHostEvent();
                      });
                }
                else if (horizon) {
                    horizon.alert('info', scope.context.error.priviledge);
                }
            });
        };

        policyService.check({ rules: [['project', 'image:get_all']] })
            .success(function (response) {
                if (response.allowed) {
                    uusAPI.getHostEvent(serverId)
                      .success(function (response) {
                            for(var i = 0; i < response.events.length; i++){
                                var it = {};
                                it.id = response.events[i].id;

                                //severity distribute
                                if(response.events[i].severity == 'Info'){
                                    it.severity = gettext('Info');
                                }else if(response.events[i].severity == 'Warning'){
                                    it.severity = gettext('Warning');
                                }else if(response.events[i].severity == 'Critical'){
                                    it.severity = gettext('Critical');
                                }

                                it.source = response.events[i].source;
                                // TODO: parse iso date format by 3rd-party js lib
                                it.date = response.events[i].datetime.split('T').join(' ');
                                it.message = response.events[i].msg;
                                scope.serverLog.push(it);
                            }
                      });
                }
                else if (horizon) {
                    horizon.alert('info', scope.context.error.priviledge);
                }
            });

        scope.refresh = function () {
            self.reset();
        }
        
        scope.isPowerDataDisplayed = false;
        scope.needShowPowerDataPagination = false;
        scope.chartInstance = null;

        scope.refreshHostEvent = function () {
            self.resetEventLog();
            scope.$emit("updateAlarm");
            uusAPI.getHostEvent(serverId)
                .success(function (response) {
                    for (var i = 0; i < response.events.length; i++) {
                        var it = {};
                        it.id = response.events[i].id;

                        //severity distribute
                        if (response.events[i].severity == 'Info') {
                            it.severity = gettext('Info');
                        } else if (response.events[i].severity == 'Warning') {
                            it.severity = gettext('Warning');
                        } else if (response.events[i].severity == 'Critical') {
                            it.severity = gettext('Critical');
                        }

                        it.source = response.events[i].source;
                        // TODO: parse iso date format by 3rd-party js lib
                        it.date = response.events[i].datetime.split('T').join(' ');
                        it.message = response.events[i].msg;
                        scope.serverLog.push(it);
                    }
                });
        };

        scope.refreshPowerHistory = function () {
            var interval = scope.powerParam.powerInterval;
            var duration = scope.powerParam.powerDuration;
            self.resetPowerHistory();
            uusAPI.getHistoryPower(serverId, interval, duration)
                .success(function (response) {
                    scope.powerData = response;
                    var chartXData = [];
                    var chartYData = [];
                    angular.forEach(scope.powerData, function (data, index, array) {
                        data.time = filter('date')(data.PolledOn*1000, 'yyyy-MM-dd HH:mm:ss');
                        chartXData.push(data.time);
                        chartYData.push(data.PowerInput);
                    });

                    if (!scope.isPowerDataDisplayed) {
                        if (scope.powerData.length > 10) {
                            scope.needShowPowerDataPagination = true;
                        }
                        scope.isPowerDataDisplayed = true;
                    }

                    var chartOption = {
                        tooltip: {
                            trigger: 'axis',
                            formatter: 'Power: {c}<br />Time: {b}'
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
                            axisLabel: {
                                show: false,
                                textStyle: {
                                    color: "#717171",
                                    fontSize: 12
                                }
                            },
                            data: chartXData
                        },
                        yAxis: {
                            axisLine: {
                                lineStyle: {
                                    color: '#ccc'
                                }
                            },
                            axisLabel: {
                                textStyle: {
                                    color: "#717171",
                                    fontSize: 12
                                }
                            },
                            type: 'value'
                        },
                        series: [
                          {
                              name: '',
                              type: 'line',
                              animation: false,
                              itemStyle: {
                                  normal: {
                                      color: '#358577',
                                      lineStyle: {
                                          color: '#358577'
                                      }
                                  }
                              },
                              data: chartYData
                          }
                        ]
                    };

                    if (!scope.chartInstance) {
                        scope.chartInstance = echarts.init(document.getElementById('powerChart'));
                    }
                    scope.chartInstance.setOption(chartOption);
                })
        };

        scope.refreshPowerCapping = function () {
            self.resetPowerCapping();
            uusAPI.getPowerCapping(serverId)
                .success(function (response) {
                    //angular.extend(response, scope.cappingData);
                    angular.copy(response, scope.cappingData);
                    scope.capping.value = scope.cappingData.Cap;
                    //scope.$apply();
                    //scope.cappingData = response;
                }).error(function (data) {
                    toastService.add('error', gettext('Unable to retrieve host power cap data.'));
                });
        };

        scope.boolToYN = {
            true: gettext('Yes'),
            false: gettext('No')
        }

        scope.filterFacets = [
            {
                label: gettext('ID'),
                name: 'id',
                singleton: true
            },
            {
                label: gettext('Severity'),
                name: 'severity',
                singleton: true
            },
            {
                label: gettext('Source'),
                name: 'source',
                singleton: true
            },
            {
                label: gettext('Date'),
                name: 'date',
                singleton: true
            },
            {
                label: gettext('Message'),
                name: 'message',
                singleton: true
            }
        ];

        var h = $(window).height();

        scope.showNetwork = function (network) {
            modalInstance.close(serverId);
            scope.action.createDetail.open(network);
        };

        scope.$watch('scope.subnet', function () {
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

        $(window).resize(function () {
            var w2 = 644;
            var h2 = $(window).height();
            $('.detailContent').css({
                width: w2,
                height: h2
            });
            $('.tab-content').css({
                height: h2 - 62
            });
        });

        scope.label = context.label;
        scope.header = context.header;

        scope.powerHeader = {
            interval: gettext('Interval'),
            duration: gettext('Duration'),
            time: gettext('Time'),
            power: gettext('Power'),
            min: gettext('Min'),
            max: gettext('Max')
        };

        scope.cappingHeader = {
            infoHeader: gettext('Current Power Cap Info'),
            settingHeader: gettext('Power Cap Setting'),
            cap: gettext('Cap'),
            min: gettext('Min'),
            max: gettext('Max'),
            isCapable: gettext('Is Capable'),
            isEnable: gettext('Is Enable'),
            update: gettext('Update')
        };

        scope.updateCapping = function () {
            uusAPI.postPowerCapping(serverId, scope.capping.value)
                .success(function (response){
                    scope.cappingData.Cap = response.Cap;
                    scope.capping.value = response.Cap;
            });
        };

        scope.powerFilterFacets = [
            {
                label: gettext('Time'),
                name: 'time',
                singleton: true
            },
            {
                label: gettext('Power'),
                name: 'PowerInput',
                singleton: true
            },
            {
                label: gettext('Min'),
                name: 'Min',
                singleton: true
            },
            {
                label: gettext('Max'),
                name: 'Max',
                singleton: true
            }
        ]

        //scope.title = context.title;
        //scope.ctrl = ctrl;
        scope.action = action;

        scope.getHostInfo();
    }
    ])
    .controller('lenovoInterfaceConfigController', [
        '$scope', '$modalInstance', 'physicalMachineId', 'physicalMachineName', 'physicalMachineIp', 'configName', 'pci_passthrough_supported', 'pci_sriov_supported', 'horizon.openstack-service-api.nova', 'horizon.framework.widgets.toast.service',
        function (scope, modalInstance, serverId, serverName, serverIp, interfaceName, pci_passthrough_supported, pci_sriov_supported, novaAPI, toastService) {

            scope.action = {
                submit: function () {
                    modalInstance.close(scope.interface);
                },
                cancel: function () {
                    modalInstance.dismiss('cancel');
                },
            };

            scope.interface_port_clicked = function (clickedName) {
                var myArray = scope.interface.ports;
                if ($.inArray(clickedName, myArray) < 0) {
                    myArray.push(clickedName);
                } else {
                    myArray.splice($.inArray(clickedName, myArray), 1);
                }

                console.log(myArray);
            }

            scope.interface_providerNetwork_clicked = function (clickedName) {
                var myArray = scope.interface.provider_networks;
                if ($.inArray(clickedName, myArray) < 0) {
                    myArray.push(clickedName);
                } else {
                    myArray.splice($.inArray(clickedName, myArray), 1);
                }

                console.log(myArray);
            }

            scope.ports = [];
            scope.iports = [];
            scope.interfaces = [];
            scope.iinterfaces = [];

            scope.interface = {};
            scope.interface.id = '';
            scope.interface.name = '';
            scope.interface.network_type = 'none';
            scope.interface.vfnum = 0;
	    scope.interface.max_vfnum = 0;
            scope.interface.ports = [];
            scope.interface.provider_networks = [];
            scope.interface.pci_passthrough_supported = pci_passthrough_supported;
            scope.interface.pci_sriov_supported = pci_sriov_supported;

            scope.interface_ports = [];
            scope.interface_ports_checked = [];

            scope.interface_providerNetworks = [];
            scope.interface_providerNetworks_checked = [];

            scope.port_auto_decode = {
                0: 'No',
                1: 'Yes'
            }

            var self = this;

            //novaAPI.getLenovoInterfacePorts(serverId)
            novaAPI.getLenovoInterfacePorts(serverName, serverIp, interfaceName)
            .success(
                function (response) {
                    //alert("Get response from server: " + response + JSON.stringify(response));
                    self.interface_ports_fake_data(response);
                }
            ).error(function (msg) {
                alert("Error: " + msg + ", will use fake data");
                toastService.add('error', gettext('Unable to get interface ports data successfully.'));
                self.interface_ports_fake_data();
            });

            self.interface_ports_fake_data = function (port_data) {
                if (port_data) {
                    scope.ports = port_data;
                } else {
                    scope.ports = [
                        {
                            "id": "XXXXXXXXXXXXXX",
                            "name": "port_AAA",
                            "mac": "00:1e:67:68:01:37",
                            "pci": "0000:0b:00.0",
                            "processor": 0,
                            "auto": 0,
                            "device": "Ethernet Controller Intel Corporation I350 Gigabit Network Connection"
                        },
                        {
                            "id": "XXXXXXXXXXXXXX",
                            "name": "port_BBB",
                            "mac": "11:1e:67:68:01:37",
                            "pci": "1111:0b:00.0",
                            "processor": 0,
                            "auto": 0,
                            "accelerated": 1,
                            "device": "Ethernet Controller Intel Corporation I350 Gigabit Network Connection"
                        },
                        {
                            "id": "XXXXXXXXXXXXXX",
                            "name": "port_CCC",
                            "mac": "11:1e:67:68:01:37",
                            "pci": "1111:0b:00.0",
                            "processor": 0,
                            "auto": 0,
                            "accelerated": 1,
                            "device": "Ethernet Controller Intel Corporation I350 Gigabit Network Connection"
                        }
                    ];
                }

                angular.forEach(scope.ports, function (port) {
                    scope.interface_ports_checked.push(false);
                    scope.interface_ports.push(port.name);
                });

                //novaAPI.getLenovoInterfaceNetworks(serverId)
                novaAPI.getLenovoInterfaceNetworks(serverName, serverIp, interfaceName)
                .success(
                    function (response) {
                        //alert("Get response from server: " + response + JSON.stringify(response));
                        self.interface_networks_fake_data(response);
                    }
                ).error(function (msg) {
                    alert("Error: " + msg + ", will use fake data");
                    toastService.add('error', gettext('Unable to get interface networks data successfully.'));
                    self.interface_networks_fake_data();
                });
            }

            self.interface_networks_fake_data = function (network_data) {
                if (network_data) {
                    scope.interface_providerNetworks = network_data;
                } else {
                    scope.interface_providerNetworks = [
                        'network_AAA',
                        'network_BBB',
                        'network_CCC'
                    ];
                }

                angular.forEach(scope.interface_ports, function (interface_port) {
                    scope.interface_providerNetworks_checked.push(false);
                });

                //novaAPI.getLenovoInterfaceConfig(serverId, interfaceName)
                novaAPI.getLenovoInterfaceConfig(serverName, serverIp, interfaceName)
                .success(
                    function (response) {
                        //alert("Get response from server: " + response + JSON.stringify(response));
                        self.interface_config_fake_data(response);
                    }
                ).error(function (msg) {
                    alert("Error: " + msg + ", will use fake data");
                    toastService.add('error', gettext('Unable to get interface config data successfully.'));
                    self.interface_config_fake_data();
                });
            }

            self.interface_config_fake_data = function (config_data) {
                if (config_data) {
                    scope.interface.id = config_data.id;
                    scope.interface.name = config_data.name;
                    scope.interface.network_type = config_data.network_type;
                    scope.interface.vfnum = config_data.vfnum;
                    scope.interface.max_vfnum = config_data.max_vfnum;

                    angular.forEach(config_data.ports.split(','), function (data) {
                        var myArray = scope.interface_ports;
                        var item_index = $.inArray(data, myArray);
                        if (item_index >= 0) {
                            scope.interface_ports_checked[item_index] = true;
                            scope.interface.ports.push(data);
                        }
                    });

                    angular.forEach(config_data.provider_networks.split(','), function (data) {
                        var myArray = scope.interface_providerNetworks;
                        var item_index = $.inArray(data, myArray);
                        if (item_index >= 0) {
                            scope.interface_providerNetworks_checked[item_index] = true;
                            scope.interface.provider_networks.push(data);
                        }
                    });
                } else {
                    scope.interface.id = 'interface_id_XXXXXX';
                    scope.interface.name = 'testName';
                    scope.interface.network_type = 'pci-sriov';
                    scope.interface.vfnum = 88;
                    scope.interface.max_vfnum = 120;

                    var fakePorts = ['port_BBB', 'port_CCC'];
                    var fakeNetworks = ['network_AAA', 'network_BBB'];

                    angular.forEach(fakePorts, function (data) {
                        var myArray = scope.interface_ports;
                        var item_index = $.inArray(data, myArray);
                        if (item_index >= 0) {
                            scope.interface_ports_checked[item_index] = true;
                            scope.interface.ports.push(data);
                        }
                    });

                    angular.forEach(fakeNetworks, function (data) {
                        var myArray = scope.interface_providerNetworks;
                        var item_index = $.inArray(data, myArray);
                        if (item_index >= 0) {
                            scope.interface_providerNetworks_checked[item_index] = true;
                            scope.interface.provider_networks.push(data);
                        }
                    });
                }
            }

            scope.intertface_config_Submit = function () {
                //novaAPI.editLenovoInterfaceConfig(serverId, scope.interface).success(
                novaAPI.editLenovoInterfaceConfig(serverName, serverIp, scope.interface).success(
                    function (response) {
                        alert(response);
                    }
                );
            }
        }
    ]);
})();
