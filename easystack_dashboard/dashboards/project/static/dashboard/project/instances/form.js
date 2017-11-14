/**
 * Copyright 2015 Easystack Corp.
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

(function() {
  'use strict';

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngdoc instanceFormCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the instance form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('instanceFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.nova', 'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.neutron', 'horizon.openstack-service-api.floatingip',
    'horizon.openstack-service-api.billing', 'horizon.openstack-service-api.security-group',
    'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.settings',
    'instance', 'context',
    function(scope, rootScope, modalInstance,
      novaAPI, cinderAPI, neutronAPI, floatingipAPI, billingAPI, securityGroupAPI, glanceAPI, settingsAPI,
      instance, context
    ) {
      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(instance);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        addSecurityGroup: function(securityGroup) {
          // move sec group from left to right
          scope.canSelectSecurityGroups.remove(securityGroup);
          scope.selectedSecurityGroups.push(securityGroup);
          // clear the old selected items(it's an ugly method, who has a better way?)
          clearAllProps(scope.checkedSelectedSecurityGroups);
          clearAllProps(scope.checkedCanSelectSecurityGroups);
        },
        removeSecurityGroup: function(securityGroup) {
          // move sec group from right to left
          scope.canSelectSecurityGroups.push(securityGroup);
          scope.selectedSecurityGroups.remove(securityGroup);
          // clear the old selected items(it's an ugly method, who has a better way?)
          clearAllProps(scope.checkedSelectedSecurityGroups);
          clearAllProps(scope.checkedCanSelectSecurityGroups);
        },
        addSecurityGroups: function($table) {
          var securityGroups = $table.$scope.selectedData.aData;
          for(var i = 0; i < securityGroups.length; i++) {
            action.addSecurityGroup(securityGroups[i]);
          }
          $table.resetSelected();
        },
        removeSecurityGroups: function($table) {
          var securityGroups = $table.$scope.selectedData.aData;
          for(var i = 0; i < securityGroups.length; i++) {
            action.removeSecurityGroup(securityGroups[i]);
          }
          $table.resetSelected();
        },
        /*
        * submit form of EditSecurityGroups
        * selectedSecs: {id: xxx, name: xxx}, ...}
        */
        submitSecurityGroups: function() {
          instance.selectedSecurityGroups = scope.selectedSecurityGroups;
          modalInstance.close(instance);
        },
      };

      if (context.mode === 'attach') {
        scope.selectVolume = function (volumeid) {
          scope.instance.volumeName = dropdown.volumesMap[volumeid].name;
          scope.instance.volume_type = dropdown.volumesMap[volumeid].volume_type;
          scope.instance.volume_attached_mode = dropdown.volumesMap[volumeid].volume_type === 'sharable'? 'ro':'rw';
        };

        cinderAPI.getVolumes()
          .success(function(response) {
            var attachments = response.items;

            var attachedVolumes = [];
            var attachedVolumesMap = {};
            var availability_zone = instance.availability_zone;
            for (var i = 0; i < attachments.length; i++) {
              var attachment = attachments[i];
               if (attachment.status === 'available' || (attachment.volume_type === 'sharable' && attachment.status === 'in-use')){
               // Where volume is multiattach and "in-use", also can attach.
                 var attachedVolume = {
                   id: attachment.id,
                   name: attachment.name,
                   device: attachment.device,
                   volume_type:attachment.volume_type
                 };
                 attachedVolumes.push(attachedVolume);
                 attachedVolumesMap[attachedVolume.id] = attachedVolume;
               }
            }
            dropdown.volumes = attachedVolumes;
            dropdown.volumesMap = attachedVolumesMap;

            if (attachedVolumes.length > 0) {
              scope.instance.volume = attachedVolumes[0].id;
              scope.instance.volumeName = attachedVolumes[0].name;
              scope.instance.volume_type = attachedVolumes[0].volume_type;
              scope.instance.volume_attached_mode = attachedVolumes[0].volume_type === 'sharable'? 'ro':'rw' ;
            }
          });
      } else if (context.mode === 'detach') {
        novaAPI.getServerVolumes(instance.id).success(function(response) {
          var attachments = response.items;

          var attachedVolumes = [];
          var attachedVolumesMap = {};
          for (var i = 0; i < attachments.length; i++) {
            var attachment = attachments[i];
            if (!attachment.volumeName)
              attachment.volumeName = attachment.volumeId;
            var attachedVolume = {
              id: attachment.volumeId,
              name: attachment.volumeName,
              device: attachment.device
            };
            attachedVolumes.push(attachedVolume);
            attachedVolumesMap[attachedVolume.id] = attachedVolume;
          }
          dropdown.volumes = attachedVolumes;
          dropdown.volumesMap = attachedVolumesMap;

          if (attachedVolumes.length > 0) {
            scope.instance.volume = attachedVolumes[0].id;
            scope.instance.volumeName = attachedVolumes[0].name;
          }
        }); // end of success()
      } else if (context.mode === 'associate') {
        // get nics that can be associated to floating ip
        floatingipAPI.getReachableFloatingIPs(instance.id)
          .success(function(response) {
            // nics(targets) for select
            var nics = [];
            var nicsMap = {};

            var targets = response.avail_targets;
            for (var i = 0; i < targets.length; i++) {
              var target = targets[i];
              var nic = {
                id: target.id,
                name: target.name,
                port_id: target.port_id
              };
              nics.push(nic);
              nicsMap[nic.id] = nic;
            }
            dropdown.nics = nics;
            dropdown.nicsMap = nicsMap;

            if (nics.length > 0) {
              scope.instance.nic = nics[0].id;
              scope.instance.nicName = nics[0].name;
            }

            //floatingips for select
            var portFloatingipsMap = {};
            var floatingipsMap = {};

            var port2floatingips = response.avail_floatingips;
            for (var port in port2floatingips) {
              portFloatingipsMap[port] = [];
              var floatingips = port2floatingips[port];
              for (var i = 0; i < floatingips.length; i++) {
                var floatingip = floatingips[i];
                var floatingip = {
                  id: floatingip.id,
                  name: floatingip.ip,
                  bandwidth: floatingip.bandwidth
                };
                portFloatingipsMap[port].push(floatingip);
                floatingipsMap[floatingip.id] = floatingip;
              }
            }
            dropdown.portFloatingipsMap = portFloatingipsMap;
            dropdown.floatingipsMap = floatingipsMap;
          }); // end of getReachableFloatingIPs().success()
      } else if (context.mode === 'disassociate') {
        floatingipAPI.getAssociatedFloatingIPs(instance.id)
          .success(function(response) {
            var floatingips = [];
            var floatingipsMap = {};
            var results = response.items;
            for (var i = 0; i < results.length; i++) {
              var result = results[i];
              var floatingip = {
                id: result.id,
                name: result.ip
              };
              floatingips.push(floatingip);
              floatingipsMap[floatingip.id] = floatingip;
            }
            dropdown.floatingips = floatingips;
            dropdown.floatingipsMap = floatingipsMap;

            if (floatingips.length > 0) {
              scope.instance.floatingip = floatingips[0].id;
              scope.instance.floatingipName = floatingips[0].name;
            }
          }); // end of getAssociatedFloatingIPs().success()
      } else if (context.mode === 'associateNet') {
        neutronAPI.getDevicePorts(instance.id).success(function(response) {
          function isAssociate(exists, subnet_id){
            var is_exists = false;
            exists.forEach(function(port) {
              if (port.subnet_id == subnet_id) {
                is_exists = true;
              }
            });
            return is_exists;
          }
          var exist_ports = response.items;
          neutronAPI.getNetworks({'router:external': false})
          .success(function(response) {
            var subnets = [];
            var subnetsMap = {};

            var targets = response.items;

            // get subnets from networks, and provided to user to selected.
            targets.forEach(function(network){
              var s = network['subnets'];
              s.forEach(function(subnet) {
                // remove the networks which already attached instance.
                if (!isAssociate(exist_ports, subnet.id)){
                    subnets.push(subnet);
                    subnetsMap[subnet.id] = subnet;
                }
              });
            });

            dropdown.subnets = subnets;
            dropdown.subnetsMap = subnetsMap;

            if (subnets.length > 0) {
              scope.instance.subnet_id = subnets[0].id;
              scope.instance.subnet_name = subnets[0].name;
              scope.instance.network_id = subnets[0].network_id;
            }
          });
        });
      } else if (context.mode === 'disassociateNet') {
        neutronAPI.getDevicePorts(instance.id)
          .success(function(response) {
            var nics = [];
            var nicsMap = {};
            var targets = response.items;
            for (var i = 0; i < targets.length; i++) {
              var target = targets[i];
              var nic = {
                id: target.id,
                subnet_name: target.subnet,
                fixed_ip: target.fixed_ip,
                state: target.status,
                network_name: target.network
              };
              nics.push(nic);
              nicsMap[nic.id] = nic;
            }
            dropdown.nics = nics;
            dropdown.nicsMap = nicsMap;

            if (nics.length > 0) {
              scope.instance.nic = nics[0].id;
              scope.instance.fixed_ip = nics[0].fixed_ip;
              scope.instance.port_id = nics[0].id;
            }
          });
      } else if (context.mode === 'editSecurityGroups') {
        scope.loadingCanSelect = true;
        scope.loadingSelected = true;
        scope.canSelectSecurityGroups = [];
        scope.selectedSecurityGroups = [];
        scope.icanSelectSecurityGroups = [];
        scope.iselectedSecurityGroups = [];
        scope.checkedSelectedSecurityGroups = {};
        scope.checkedCanSelectSecurityGroups = {};

        // remove security groups that the instance exists
        self.filterCanSelectSecurityGroups = function() {
          for(var i = 0; i< scope.selectedSecurityGroups.length; i++) {
            var existId = scope.selectedSecurityGroups[i].id;
            scope.canSelectSecurityGroups.removeId(existId);
          }
        };

        // get security groups in server
        securityGroupAPI.getServerSecurityGroup(instance.id).success(function(response) {
          scope.loadingSelected = false;
          scope.selectedSecurityGroups = response.items;

          // get security groups for selection
          securityGroupAPI.query().success(function(response) {
            scope.loadingCanSelect = false;
            scope.canSelectSecurityGroups = response.items;
            self.filterCanSelectSecurityGroups();
          });
        });

      } else if (context.mode === 'rebuild') {
        glanceAPI.getImages().success(function(response) {
            dropdown.images = response.items;
        });
      } else if (context.mode === 'resize') {

        if (rootScope.rootblock.billing_need && rootScope.rootblock.active_fixing) {

          billingAPI.getPriceItems('instance')
            .success(function(data){
              var instanceBilling = scope.instance_billing = data.items;

              function updateFeeForFlavor () {
                for (var i=0; i<=instanceBilling.length-1; i++) {
                  var billing = instanceBilling[i];
                  if (scope.instance.flavor && scope.instance.flavor === billing.flavor.id) {
                    if(scope.preBilling){
                      if(instance.unit){
                        if(instance.unit === 'M'){
                          scope.price = Number(billing['fee_month']);
                        }else if(instance.unit === 'Y'){
                          scope.price = Number(billing['fee_year']);
                        }else{
                          scope.price = Number(billing['fee_hour']);
                        }
                      }
                    }else{
                      scope.instancePrice = Number(billing['fee']);
                      scope.monthInstancePrice = (scope.instancePrice * 24 * 30).toFixed(2);
                    }

                  }
                }
              }

              //updateFeeForFlavor();

              if(scope.preBilling){
                billingAPI.getProductById(instance.id).success(function(data){

                  var instance = data.items ;
                  angular.forEach(scope.payment_type ,function(arr){

                    if(instance[0].unit === arr.unit){
                      scope.unitSelect = arr;
                      scope.instance.unit = instance[0].unit;
                      updateFeeForFlavor();
                    }

                  });

                });

              }else{
                updateFeeForFlavor();
              }

              scope.$watch('instance.flavor', function(newVal, oldVal){
                if (newVal !== oldVal) {
                  updateFeeForFlavor();
                }
              },true);
            })
          .error(function(){

          });

        }
      }else if (context.mode === 'hotextend') {
        scope.description = context.header.loadingDesc;
        scope.device = {};
        novaAPI.getServer(instance.id)
            .success(function(response) {
                scope.device.root_device_name = response.root_device_name;
                scope.device.root_gb = response.root_gb;
                if(response.root_device_name === undefined || response.root_gb === undefined || response.root_device_name === null ||response.root_gb === null) {
                  scope.description = context.header.errorDesc;
                } else {
                  scope.description = interpolate(context.header.description, [response.root_device_name, response.root_gb]);
                }
            })
            .error(function() {
                scope.description = context.header.errorDesc;
            });

        scope.inputCheck = function () {
            //current rool gb is null
            if (!scope.device.root_gb) {
                return;
            } else {
                // input disk size less than root_gb
                if (scope.instance.hotExtendDisk <= scope.device.root_gb) {
                    scope.inputError = true;
                } else {
                    scope.inputError = false;
                }
            }
        }
      }

      scope.dropdown = dropdown;
      scope.context = context;
      scope.instance = instance;
      scope.action = action;

      if(context.loadDataFunc != null) {
        context.loadDataFunc(scope);
      }

      if (rootScope.rootblock.billing_need) {
        scope.showBilling = true;
        if (rootScope.rootblock.active_fixing) {
          if(context.mode === "createsnapshot"){
            billingAPI.getPriceItems('image').success(function(data) {
              scope.unitPrice = data.items[0];
              scope.price = Number(scope.unitPrice['fee_hour']);
              scope.monthPrice = (scope.price * 12 * 30).toFixed(2);
            });
          }
          /*billingAPI.getPriceItems('instance').success(function(data) {
            scope.unitPrice = data.items[0];
            scope.price = Number(scope.unitPrice['fee_hour']);
            scope.monthPrice = (scope.price * 12 * 30).toFixed(2);
          });*/
          scope.showBalance = true;
          billingAPI.getBalance().success(function(data) {
            if (data <= 0) {
              scope.showBalance = true;
            } else {
              scope.showBalance = false;
            }
          });
          settingsAPI.getSetting('PREBILLING',false).then(

              function success(data){
                scope.preBilling = data;
              }

            );

          scope.payment_type = [
            {unit:'H',unitLabel:gettext('By Hour')},
            {unit:'M',unitLabel:gettext('By Month')},
            {unit:'Y',unitLabel:gettext('By Year')}
          ];
          scope.unitSelect = scope.payment_type[0];
          scope.changePayment = function (payment){
            scope.unitSelect = payment;
            if(scope.unitSelect && scope.unitSelect.unit === 'M'){
       	      scope.price = Number(scope.unitPrice['fee_month']);
       	      scope.instance.unit = 'M';
       	    }else if(scope.unitSelect && scope.unitSelect.unit === 'Y'){
       	      scope.price = Number(scope.unitPrice['fee_year']);
       	      scope.instance.unit = 'Y';
       	    }else{
       	      scope.price = Number(scope.unitPrice['fee_hour']);
       	      scope.instance.unit = 'H';
       	    }
          };
        } else {
          scope.noFixing = true;
        }
      }

    }
  ])

  // instance monitor controller
  .controller('instanceMonitorForm', [
    '$scope',
    '$modalInstance',
    'monitorConfig',
    'instance',
    'context',
    'horizon.openstack-service-api.nova',
    function(
      scope,
      modalInstance,
      MonitorConfig,
      instance,
      context,
      serviceAPI){
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
        monitor = new MonitorConfig(scope);

    scope.instance = instance;

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

    scope.action = action;
    scope.monitors = monitor;
    scope.context = context;

    // init
    monitor.eventAction('day');
    scope.eDataState = false;
    scope.eDataResult = false;
    scope.iMonitorState = false;

    // scope.monitor_type = context.type;
    scope.changeMonitorName = function (name) {
      scope.monitor_type = name;
    }
  }])

  // instance detail controller
  .controller('instanceDetailForm', [
      '$rootScope','$scope', '$modalInstance', '$timeout', 'instance', 'context', 'ctrl',
    function(rootScope, scope, modalInstance, $timeout, instance, context, ctrl) {
      var w = 888;

      var action = {
        submit: function() {
          modalInstance.close(instance);
        },
        cancel: function() {
           $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
        }
      };

      var h = $(window).height();

      $timeout(function(){
        $('.detailContent').css({
              height: h,
              width: w,
              right: -w
        });
        $('.tab-content').css({
          height: h-62
        });
        $('.detailContent').stop();
        $('.detailContent').animate({
            right: 0
        },400)
        .css('overflow', 'visible');
      });
      $(window).resize(function() {
        var w2 = 888;
        var h2 = $(window).height();
          $('.detailContent').css({
            width: w2,
            height: h2
          });
          $('.tab-content').css({
            height: h2-62
          });
      });

      scope.instance = instance;
      scope.label = context.label;
      scope.title = context.title;
      scope.ctrl = ctrl;
      scope.action = action;

      if(context.loadDataFunc != null) {
        context.loadDataFunc(scope);
      }
    }
  ]);

  function clearAllProps(obj) {
      for(var key in obj) {
        delete obj[key];
      }
  };

})();
