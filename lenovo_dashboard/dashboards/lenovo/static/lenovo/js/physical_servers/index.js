/**
 * Copyright 2016 Lenovo Corp.
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

    angular.module('hz.dashboard.lenovo.physical_servers')

        /**
         * @ngdoc projectImagesCtrl
         * @ngController
         *
         * @description
         * Controller for the project images table.
         * Serve as the focal point for table actions.
         */
        .controller('lenovoPhysicalServersCtrl', [
            '$scope', '$rootScope', 'horizon.dashboard.lenovo.physical_servers.Path', '$modal', 'bytesFilter', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.uus',
            'lenovoPhysicalServerDetailAction', 'lenovoPhysicalServersAction', 'horizon.framework.widgets.toast.service', 'horizon.physical.nova.service',
            'lenovoPhysicalServerMonitorAction',
            function (
                scope, rootScope, path, modal, bytesFilter, policyService, uusAPI,
                lenovoPhysicalServerDetailAction, lenovoPhysicalServersAction, toastService, novaService,
                lenovoPhysicalServerMonitorAction
            ) {
                var self = this;

                scope.context = {
                    icon: {
                        controller: gettext('Controller'),
                        compute: gettext('Compute'),
                        storage: gettext('Storage'),
                        others: gettext('Others')
                    },
                    header: {
                        hostname: gettext('Host Name'),
                        role: gettext('Role'),
                        status: gettext('Status'),
                        power: gettext('Power'),
                        ip: gettext('Ip Address'),
                        product: gettext('Product'),
                        machine: gettext('Machine Type'),
                        serial: gettext('Serial Number'),
                        action: gettext('Action'),
                        lock_status: gettext('Admin status'),

                        name: gettext('Name'),
                        image_type: gettext('Type'),
                        //status: gettext('Status'),
                        is_public: gettext('Public'),
                        disk_format: gettext('Format'),
                        size: gettext('Image Size'),

                        // ksm: gettext('KSM'),
                        // zram: gettext('ZRAM'),
                    },
                    action: {
                        POS: gettext('Power On'),
                        PFS: gettext('Power Off'),
                        delete: gettext('Delete'),
                        restart: gettext('Restart'),
                        authenticate: gettext('Authenticate'),
                        launchBMC: gettext('Launch Management Module'),
                        monitor: gettext('Monitor'),
                        // ksm: gettext('KSM'),
                        // zram: gettext('ZRAM')
                    },
                    error: {
                        api: gettext('Unable to retrieve imagess'),
                        priviledge: gettext('Insufficient privilege level to view user information.')
                    }
                };

                // scope.KSMStatus = {
                //     "NA": gettext("NA"),
                //     "On": pgettext("KSM", "On"),
                //     "Off": pgettext("KSM", "Off"),
                // };

                this.reset = function () {
                    scope.clearSelected();
                    scope.iservers = [];
                    scope.servers = [];
                    scope.serverInfoData = [];
                    scope.serverState = false;

                    scope.stat_info = {};

                    scope.images = [];
                    scope.iimages = [];
                    scope.imageState = false;
                    scope.checked = {};
                    //clean all selected items
                    scope.selected = {};
                    scope.numSelected = 0 ;                   
                    if (scope.selectedData) {
                        scope.selectedData.aData = [];
                    }
                };

                scope.clearSelected = function () {
                    return scope.$table && scope.$table.resetSelected();
                };


                // on load, if user has permission
                // fetch table data and populate it
                this.init = function () {
                    scope.actions = {
                        refresh: this.refresh,
                        //create: new CreateAction(scope),
                        //imageCreateVolumeAction: new ImageCreateVolumeAction(scope),
                        //edit: new EditAction(scope),
                        //deleted: new DeleteAction(scope),
                        //createDetail: new CreateDetailAction(scope),
                        //searchForId: this.searchForId,
                        action: new lenovoPhysicalServersAction(scope),
                        detail: new lenovoPhysicalServerDetailAction(scope),
                        monitor: new lenovoPhysicalServerMonitorAction(scope),
                    };
                    self.refresh();
                    scope.selected = {};
                    self.list_host_status();

                };
                self.isEnteredPopOverArea = false;
                self.isEnteredTriggerArea = false;
                self.lastTriggeredArea = null;
	          self.pollingHostTimer = null; 
                scope.popoverEnter = function (event) {
                    self.isEnteredTriggerArea = true;
                    if (self.lastTriggeredArea != event.target) {
                        $('.popover.fade.right.in').popover('hide');
                    }
                    $(event.target).popover('show');

                    $('.popover.fade.right.in').on("mouseleave", function () {
                        self.isEnteredPopOverArea = false;
                        $(event.target).popover('hide');
                    });

                    $('.popover.fade.right.in').on("mouseenter", function () {
                        self.isEnteredPopOverArea = true;
                    });
                };

                scope.popoverLeave = function (event) {
                    self.isEnteredTriggerArea = false;
                    self.lastTriggeredArea = event.target;
                    setTimeout(function () {
                        if (!self.isEnteredPopOverArea && !self.isEnteredTriggerArea) {
                            $(event.target).popover('hide');
                        }
                    }, 500);
                };

                //scope.popoverLeave = function (event) {
                //    $(event.target).popover('destroy');
                //};

                scope.removeInstance = function (value) {
                    alert('good');
                };

                scope.serverInfoData = [];
                // scope.novaData = {};
                scope.novaLoadStatus = {};

                this.refresh = function () {
                    self.reset();
                    scope.$emit("updateAlarm");
                    policyService.check({
                        rules: [
                            ['project', 'image:get_all']
                        ]
                    })
                        .success(function (response) {
                            if (response.allowed) {

                                uusAPI.getHosts()
                                    .success(function (response) {

                                        var val = '';
                                        var rol;

                                        var rolename_dict = {
                                            "controller": gettext('Controller'),
                                            "compute": gettext('Compute'),
                                            "storage": gettext('Storage'),
                                            "cinder": gettext('Cinder'),
                                            "elk": gettext('ELK'),
                                            "neutron-l3": gettext('Neutron L3'),
                                            "mongo": gettext('MongoDB'),
                                            "zabbix-server": gettext('Zabbix Server'),
                                            "ceph-osd": gettext('Ceph OSD'),
                                            "swift-proxy": gettext('Swift Proxy'),
                                            "undefined": gettext('Unknown'),
                                            "other": gettext('Other')
                                        };

                                        for (var i = 0; i < response.items.length; i++) {
                                            var currentItem = response.items[i];
                                            var server = {};
                                            //followed info retrieve for data only
                                            server.bmcip = response.items[i].bmcip;
                                            server.type = response.items[i].type;
                                            server.https_enabled = response.items[i].https_enabled;
                                            server.id = response.items[i].uuid;
                                            server.hostname = response.items[i].hostname;
                                            server.authed = response.items[i].authed;

                                            //ROLE distribute
                                            var translatedRoles = [];
                                            for (var j = 0; j < currentItem.role_names.length; j++) {
                                                var originalRole = currentItem.role_names[j];
                                                translatedRoles.push(rolename_dict[originalRole]);
                                            }
                                            var translatedRoleString = translatedRoles.join(' / ');
                                            server.role = translatedRoleString;

                                            //STATUS distribute
                                            if (response.items[i].status == 'NotSup') {
                                                server.status = gettext('NotSup');
                                                server.statusimg = 'lenovo/img/st16_notsup_24.png';
                                            } else if (response.items[i].status == 'NA') {
                                                server.status = gettext('NA');
                                                server.statusimg = 'lenovo/img/st16_na_24.png';
                                            } else if (response.items[i].status == 'UnAuth') {
                                                server.status = gettext('UnAuth');
                                                server.statusimg = 'lenovo/img/st16_unauth_24.png';
                                            } else if (response.items[i].status == 'Healthy') {
                                                server.status = gettext('Healthy');
                                                server.statusimg = 'lenovo/img/success.png';
                                            } else if (response.items[i].status == 'Warning') {
                                                server.status = gettext('Warning');
                                                server.statusimg = 'lenovo/img/warning.png';
                                            } else if (response.items[i].status == 'Critical') {
                                                server.status = gettext('Critical');
                                                server.statusimg = 'lenovo/img/critical.png';
                                            }

                                            //POWER distribute
                                            if (response.items[i].power == 'on') {
                                                server.powerimg = 'lenovo/img/ac16_power_24.png';
                                                server.power = gettext('On');
                                                server.powerraw = 'On';
                                            } else if (response.items[i].power == 'off') {
                                                server.powerimg = 'lenovo/img/ac16_powerOFF_24.png';
                                                server.power = gettext('Off');
                                                server.powerraw = 'Off';
                                            } else if (response.items[i].power == 'pending') {
                                                server.powerimg = 'lenovo/img/loading.gif';
                                                server.power = gettext('Pending');
                                                server.powerraw = 'Pending';
                                            }
                                            
                                            server.powerState = response.items[i].power;
                                            if (response.items[i].alerts) {
                                                server.critical = response.items[i].alerts.Critical;
                                                server.warning = response.items[i].alerts.Warning;
                                                server.info = response.items[i].alerts.Healthy;
                                            }

                                            server.ip = response.items[i].hostip;
                                            server.product = response.items[i].productname;
                                            server.machine = response.items[i].mt;
                                            server.serial = response.items[i].sn;
                                            server.Lock_status = response.items[i].Lock_status;

                                            server.action = {
                                                class: 'btn-danger',
                                                id: 'servers__row_9E343266123C20DF5FFD65AB15F12D2F__action_delete',
                                                value: 'servers__delete__9E343266123C20DF5FFD65AB15F12D2F'
                                            };
                                            // scope.novaData[server.hostname] = {};

                                            // self.novaKsmInfo(server, scope);
                                            // self.zRamInfo(server, scope);
                                            scope.serverInfoData.push(server);
                                        }
                                        scope.stat_info.compute = response.stat_info.compute;
                                        scope.stat_info.controller = response.stat_info.controller;
                                        scope.stat_info.others = response.stat_info.others;
                                        scope.stat_info.storage = response.stat_info.storage;
                                    });
                            } else if (horizon) {
                                horizon.alert('info', scope.context.error.priviledge);
                            }
                        });

                    policyService
                        .check({
                            rules: [
                                ['project', 'image:get_all']
                            ]
                        })
                        .success(function (response) {
                            scope.servers = scope.serverInfoData;
                            scope.serverState = true;
                        });

                };

                // this.novaKsmInfo = function (server, scope) {
                //     server.ksm = { status: '', loadingStatus: 'suspending' };
                //     //only support compute node
                //     var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
                //     var computeFlag = reg.test(server.role) ? server.role.indexOf('计算') > -1 : server.role.indexOf('Compute') > -1;
                //     var powerOnFlag = server.powerraw === 'On';
                //     if (!computeFlag || !powerOnFlag) {
                //         server.ksm.loadingStatus = 'success';
                //         server.ksm.status = "NA";
                //         return false;
                //     }
                //
                //     novaService.getKsmInfo(server.hostname).then(function (result) {
                //         server.ksm.loadingStatus = 'success';
                //         var status = result.data.status.toUpperCase();
                //         server.ksm.status = status === "ON" ? "On" : "Off";
                //     });
                // }
                //
                // this.zRamInfo = function (server, scope) {
                //     server.zram = { status: '', loadingStatus: 'suspending' };
                //     //only support compute node
                //     var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
                //     var computeFlag = reg.test(server.role) ? server.role.indexOf('计算') > -1 : server.role.indexOf('Compute') > -1;
                //     var powerOnFlag = server.powerraw === 'On';
                //     if (!computeFlag || !powerOnFlag) {
                //         server.zram.loadingStatus = 'success';
                //         server.zram.status = "NA";
                //         return false;
                //     }
                //
                //     novaService.getzRamInfo(server.hostname).then(function (result) {
                //         server.zram.loadingStatus = 'success';
                //         var status = result.data.status.toUpperCase();
                //         server.zram.status = status === "ON" ? "On" : "Off";
                //     });
                // }
                
                this.list_host_status= function()
                {
              	
             	   function check_host_lock_status(){ 
             	   	
             	      var polling_host = false;
             	   	
             	      for(var i=0; i< scope.servers.length; i++)
              	      {
              		  if(scope.servers[i].Lock_status=="Unlocking" || scope.servers[i].Lock_status=="Locking" )
              		       polling_host = true;
                      }
             	   	
             	      if( polling_host)
             	      {       	
             	            uusAPI.getHosts()
                             .success(function (data){
	                         for(var i=0; i < data.items.length; i++)
	                         {
	                              if(scope.servers[i].id == data.items[i].uuid)
	                        	 {
	                        	      if(data.items[i].Lock_status=="Unlocked" || data.items[i].Lock_status=="Locked")
	                        	 	{
	                        	 		/*if(self.pollingHostTimer)
	                        	 		     clearInterval(self.pollingHostTimer);*/
	                        	 		     
	                        	 	}
	                        	       scope.servers[i].hostname = data.items[i].hostname;
	                                       scope.servers[i].Lock_status = data.items[i].Lock_status;                                      
	                                        
	                        	 } 
	                         }                       
	                               	    
	                     });
                        }
                  }
                  
                  self.pollingHostTimer = setInterval(check_host_lock_status, 10000);       
               }
               
                scope.lock_node = function (server){
                   var do_action;  
                   var state_to_change;
                   var server_selected={};
                   var check_host_timer= null;
                   var clear_timer = true;   
                   server_selected=server[0];
               
                   function get_host_lock_status()
                   {
             	             	
             	      uusAPI.getHosts()
                        .success(function (data){

                          for(var i=0; i < data.items.length; i++)
                          {
                              if(scope.servers[i].id == data.items[i].uuid)
                        	 {
  
                        	       scope.servers[i].hostname = data.items[i].hostname;
                                       scope.servers[i].Lock_status = data.items[i].Lock_status;                                      
                                        
                        	 } 
                          }                       
                               	    
                      });
                          
                    }
                                
                   if(server_selected.Lock_status=="Unlocked")
                   {
                      state_to_change="Locking";
                      do_action= "Lock";
                   }else if (server_selected.Lock_status=="Locked")
                   { 
                      state_to_change="Unlocking";
                      do_action= "Unlock";
                   }
                   else 
                   {
                      state_to_change=null;
                      toastService.add('error',  gettext("locking is processing "));
                      return;                       	       
                   }  
                   uusAPI.change_host_state(server_selected.hostname,state_to_change)
                        .success(function(resp){
                          uusAPI.getHosts()
                           .success(function (data){
               		     for(var i=0; i < data.items.length; i++)
                	     {
                     	       if(scope.servers[i].id == data.items[i].uuid)
                	       {
                	          scope.servers[i].hostname = data.items[i].hostname;
                                  scope.servers[i].Lock_status = data.items[i].Lock_status;             
                               
                               } 
                             }                       
                        
                                                                         
                             uusAPI.lock_node(server_selected.hostname, do_action)
            	               .success(function(data){
            	                  get_host_lock_status(); 	
            	                  scope.selected ={};
                                  scope.numSelected = 0;        
                                    
                                  if (scope.selectedData) {
                                      scope.selectedData.aData = [];
                                  } 
            	                 
                       
               		      })
              		      .error( function(data){
               	
               	                  get_host_lock_status(); 	
            	                  scope.selected ={};
                                  scope.numSelected = 0;        
                                    
                                  if (scope.selectedData) {
                                      scope.selectedData.aData = [];
                                   } 
    	      		     });  //uusAPI.lock_node       		  	
                     
                    
	                 });//uusAPI.getHosts

                     }); //  uusAPI.change_host_state       
                }
      
                scope.powerOn = function (server) {
                    uusAPI.powerOn(server[0].id);
                };

                scope.powerOff = function (server) {
                    uusAPI.powerOff(server[0].id);
                };

                scope.powerReboot = function (server) {
                    uusAPI.powerReboot(server[0].id);
                };

                // scope.moreBtnClick = function (e) {
                //     var novaStatus = {
                //         'ksm': {
                //             'On': [],
                //             'Off': [],
                //             'none': [],
                //             'suspending': [],
                //             'enable': false,
                //             displayText: ''
                //         },
                //         'zram': {
                //             'On': [],
                //             'Off': [],
                //             'none': [],
                //             'suspending': [],
                //             'enable': false,
                //             displayText: ''
                //         },
                //         // selectData: []
                //     };
                //
                //     function setStatus(type) {
                //         if (novaStatus[type].On.length === scope.selectedData.aData.length) {
                //             novaStatus[type].displayText = '/ Off';
                //         }
                //
                //         if (novaStatus[type].Off.length === scope.selectedData.aData.length) {
                //             novaStatus[type].displayText = '/ On';
                //         }
                //         // no loading and on/off is not null
                //         if (novaStatus[type].suspending.length === 0 && novaStatus[type].none.length === 0 && novaStatus[type].displayText) {
                //             novaStatus[type].enable = true;
                //         }
                //         // angular.forEach(novaStatus[type].suspending, function (obj, index) {
                //         //     if (obj.loadingStatus == 'suspending') {
                //         //         novaStatus[type].enable = novaStatus[type].enable ;
                //         //     }
                //         //     console.log(obj)
                //         // })
                //
                //     }
                //
                //     function classifyStatus(obj, type) {
                //         if (!obj[type].status || obj[type].status === 'NA') {
                //             novaStatus[type].none.push(obj[type])
                //         } else {
                //             obj[type].status === 'On' ? novaStatus[type].On.push(obj[type]) : novaStatus[type].Off.push(obj[type]);
                //         }
                //         if (obj[type].loadingStatus == 'suspending') {
                //             novaStatus[type].suspending.push(obj[type])
                //         }
                //     }
                //
                //     if (scope.selectedData.aData && scope.selectedData.aData.length > 0) {
                //         angular.forEach(scope.selectedData.aData, function (obj, index) {
                //             if (obj) {
                //
                //                 classifyStatus(obj, 'ksm');
                //                 classifyStatus(obj, 'zram');
                //             }
                //         })
                //
                //         setStatus('ksm');
                //         setStatus('zram');
                //     }
                //     scope.novaStatus = novaStatus;
                // }

                var authServerOption = {
                    templateUrl: path + 'server/auth/',
                    controller: 'lenovoPhysicalServersAuthServerController',
                    windowClass: 'neutronListContent',
                    resolve: {
                        serverData: function () {
                        }
                    }
                };

                scope.authServer = function (serverData) {
                    if (serverData || serverData.length > 0) {
                        authServerOption.resolve.serverData = function () {
                            return serverData[0]
                        };
                        modal.open(authServerOption).result.then(self.submitAuthServer);
                    }
                };

                self.submitAuthServer = function (serverAuthResultData) {

                    self.refresh();
                    var id = serverAuthResultData.server_id;
                    var uid = serverAuthResultData.userid;
                    var pwd = serverAuthResultData.password;


                    uusAPI.authenticate(id, uid, pwd)
                        .success(function (data) {
                            toastService.add('info', gettext('Start to auth the server'));
                        });
                };


                scope.filterFacets = [{
                    label: gettext('Host Name'),
                    name: 'hostname',
                    singleton: true
                },
                {
                    label: gettext('Role'),
                    name: 'role',
                    singleton: true
                },
                {
                    label: gettext('Status'),
                    name: 'status',
                    singleton: true
                },
                {
                    label: gettext('Power'),
                    name: 'power',
                    singleton: true
                },
                // {
                //     label: gettext('KSM'),
                //     name: 'ksm.status',
                //     singleton: true
                // },
                // {
                //     label: gettext('ZRAM'),
                //     name: 'zram.status',
                //     singleton: true
                // },
                {
                    label: gettext('Ip Address'),
                    name: 'ip',
                    singleton: true
                },
                {
                    label: gettext('Product'),
                    name: 'product',
                    singleton: true
                },
                {
                    label: gettext('Machine Type'),
                    name: 'machine',
                    singleton: true
                },
                {
                    label: gettext('Serial Number'),
                    name: 'serial',
                    singleton: true
                },
                {
                    label: gettext('Action'),
                    name: 'action',
                    singleton: true
                }
                ];

                this.init();

            }
        ]);

})();