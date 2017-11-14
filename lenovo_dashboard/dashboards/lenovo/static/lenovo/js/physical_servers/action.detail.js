(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.physical_servers')
    .factory('lenovoPhysicalServerDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'horizon.dashboard.lenovo.physical_servers.Path',
          function (keystoneAPI, modal, path) {

              var context = {
              };

              var subnet_context = {};
              subnet_context.title = {
                  "Overview": gettext("Overview"),
                  "Subnet": gettext("Subnet")
              };
              subnet_context.label = {
                  "ID": gettext("ID"),
                  "Name": gettext("Name"),
                  "Network": gettext("Network"),
                  "IP_version": gettext("IP version"),
                  "CIDR": gettext("CIDR"),
                  "IP_Pool": gettext("Allocation Pool"),
                  "DHCP_Enable": gettext("DHCP Enable"),
                  "Gateway_IP": gettext("Gateway IP"),
                  "Host_Routes": gettext("Host_Routes"),
                  "DNS_Servers": gettext("DNS Servers")
              };

              context.title = {
                  "Overview": gettext("Overview"),
                  "Subnets": gettext("Subnets"),
                  "Info": gettext("Info")
              };
              context.label = {
                  "ID": gettext("ID"),
                  "Name": gettext("Name"),
                  "Project_ID": gettext("Project ID"),
                  "Status": gettext("Status"),
                  "Shared": gettext("Shared"),
                  "External_Network": gettext("External Network"),
                  "Provider_Network": gettext("Provider Network")
              };
              context.header = {
                  system_info: gettext('System Info'),
                  hostname: gettext('Host Name'),
                  role: gettext('Role'),
                  status: gettext('Status'),
                  power: gettext('Power'),
                  ip: gettext('IP Address'),
                  product: gettext('Product'),
                  machine: gettext('Machine Type'),
                  serial: gettext('Serial Number'),
                  UUID: gettext('UUID'),
                  action: gettext('Action'),

                  system_component: gettext('System Component'),
                  cpu: gettext('CPU'),
                  identity: gettext('Identity'),
                  nic: gettext('NIC'),
                  memory: gettext('Memory'),
                  raid: gettext('RAID Controller'),
                  driver: gettext('Driver'),
                  ext_card: gettext('Extend Card'),

                  ID: gettext('ID'),
                  severity: gettext('Severity'),
                  source: gettext('Source'),
                  date: gettext('Date'),
                  message: gettext('Message'),

                  name: gettext('Name'),
                  image_type: gettext('Type'),
                  //status: gettext('Status'),
                  is_public: gettext('Public'),
                  disk_format: gettext('Format'),
                  size: gettext('Image Size')
              };

              var ctrl = {
                  'active': gettext("Active"),
                  'saving': gettext("Saving"),
                  'queued': gettext("Queued"),
                  'pending_delete': gettext("Pending Delete"),
                  'killed': gettext("Killed"),
                  'deleted': gettext("Deleted"),
                  'create': gettext('Create Subnet'),
                  'delete': gettext('Delete Subnet'),
                  'edit': gettext('Edit'),
                  'more': gettext('More')
              };

              function action(scope) {
                  /*jshint validthis: true */
                  var self = this;
                  var option = {
                      templateUrl: path + 'detail/',
                      controller: 'physicalServerDetailController',
                      //backdrop: false,
                      windowClass: 'detailContent',
                      resolve: {
                          context: function () { return context; },
                          serverId: function () { return '88888'; },
                          serverName: function () { return '88888'; },
                          serverIp: function () { return '88888'; },
                          serverPower: function () { return '88888'; },
                          Lock_status: function () { return '88888'; }
                      }
                  };

                  self.open = function (serverId, serverName, serverIp, serverPower, Lock_status) {
                      option.resolve.serverId = function () { return serverId; };
                      option.resolve.serverName = function () { return serverName; };
                      option.resolve.serverIp = function () { return serverIp; };
                      option.resolve.serverPower = function () { return serverPower; };
                      option.resolve.Lock_status  = function () { return Lock_status; };

                      modal.open(option);
                      //window.location.href = "#" + serverId;
                  };

              }

              return action;
          }]);

    angular.module('hz.dashboard.lenovo.physical_servers')
    .service('lenovoInterfaceConfigAction',
    ['$modal', 'horizon.dashboard.lenovo.physical_servers.Path',
        'horizon.openstack-service-api.nova', 'horizon.framework.widgets.toast.service',
          function (modal, path, novaAPI, toastService) {

              //function action(scope, serverId) {
              function action(scope, serverId, serverName, serverIp, Lock_status) {
                  /*jshint validthis: true */
                  var self = this;
                  self.controllerScope = scope;

                  var editInterfaceOption = {
                      templateUrl: path + 'interface_config/',
                      controller: 'lenovoInterfaceConfigController',
                      windowClass: 'neutronListContent',
                      resolve: {
                          physicalMachineId: function () { },
                          configName: function () { }
                      }
                  }

                  self.editInterfaceConfig = function (selectedInterfaceName, pci_passthrough_supported, pci_sriov_supported) {
                     if(Lock_status=='Locked')
                       {
                      editInterfaceOption.resolve.physicalMachineId = function () { return serverId };
                      editInterfaceOption.resolve.physicalMachineName = function () { return serverName };
                      editInterfaceOption.resolve.physicalMachineIp = function () { return serverIp };
                      editInterfaceOption.resolve.configName = function () { return selectedInterfaceName };
                      editInterfaceOption.resolve.pci_passthrough_supported = function () { return pci_passthrough_supported };
                      editInterfaceOption.resolve.pci_sriov_supported = function () { return pci_sriov_supported };
                      modal.open(editInterfaceOption).result.then(self.submitEditInterfaceConfig);
                       }
                     else
                       {
                           alert("Please Lock Node first!");   
                       }  
                  }

                  self.submitEditInterfaceConfig = function (configEditData) {
                      //console.log(switchEditData);
                      //novaAPI.editLenovoInterfaceConfig(editInterfaceOption.resolve.physicalMachineId(), configEditData)
                      novaAPI.editLenovoInterfaceConfig(editInterfaceOption.resolve.physicalMachineName(), editInterfaceOption.resolve.physicalMachineIp(), configEditData)
                        .success(function (data) {
                            //alert("Return from Server: " + data);
                            if (data && data.status && data.status == 'success') {
                                toastService.add('success', gettext('Successfully edit a interface config!'));
                            } else {
                                toastService.add('error', gettext('Edit interface config failed.'));
                            }

                            self.controllerScope.refreshInterfaces();
                        })
                        .error(function (data) {
                            alert("Submit ERROR: " + data);
                            toastService.add('error', gettext('Edit interface config failed.'));

                            self.controllerScope.refreshInterfaces();
                        });
                  }

              }

              return action;
          }
    ]);


})();
