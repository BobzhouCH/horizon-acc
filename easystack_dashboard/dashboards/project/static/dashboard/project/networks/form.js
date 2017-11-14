(function() {
  'use strict';

  angular.module('hz.dashboard.project.networks')

  .controller('neutronFormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron',
    'subnet', 'context', 'subnetId',
    'dnsCreateAction','hostRouteCreateAction', 'addressPoolCreateAction',
    function(scope, modalInstance, neutronAPI, subnet, context, subnetId,
      DnsCreateAction, HostRouteCreateAction, AddressPoolCreateAction) {

      var seft = this;
      var dropdown = {};
      var network = subnet;
      var action = {
        submit: function() {
          subnetId && (subnet.network_id = subnetId);
          modalInstance.close(subnet);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
        // DNS
        dnsCreate: new DnsCreateAction(scope),
        // Host route
        hostRouteCreate: new HostRouteCreateAction(scope),
        // address poll
        addressPoolCreate: new AddressPoolCreateAction(scope)

      };

      //network default: valid
      scope.subnetGatewayMatch = true;
      scope.networkInvalidTag = false;

      // create network
      if (context.mode === 'create') {
        // Sub form DNS
        network.dns_nameservers = [];
        // Address Pool
        network.host_routes = [];
        // host route
        network.allocation_pools = [];
      }

      scope.getAddressFromCidr = getAddressFromCidr;
      
      scope.doesSubnetNameExist = false;
      scope.checkSubnetName = function () {
          if (context.mode === 'edit') {
              var currentSubnetName = scope.subnet.name;
              if (context.createdSubnets) {
                  for (var createdSubnet of context.createdSubnets) {
                      if (currentSubnetName == createdSubnet.name) {
                          scope.doesSubnetNameExist = true;
                          break;
                      } else {
                          scope.doesSubnetNameExist = false;
                      }
                  }
              }
          }
      }

      if (context.mode === 'edit') {
        subnet.enable_gateway = subnet.gateway_ip ? true : false;
        // Sub form DNS
        network.dns_nameservers = subnet.dns_nameservers;
        // Address Pool
        network.host_routes = subnet.host_routes;
        // host route
        network.allocation_pools = subnet.allocation_pools;
      }

      if (context.mode === 'create') {
        neutronAPI.getNetworks({filter_shared: true}).success(function(response) {
          dropdown.roles = response.items;
        });

        subnet.enable_gateway = true;
        subnet.enable_dhcp = true;

        scope.subnetAddress = {
          val0: 192,
          val1: 168,
          val2: 0,
          val3: 0,
          val4: 24
        };
        scope.subnetAddress1 = {
          val0: 10,
          val1: 0,
          val2: 0,
          val3: 0,
          val4: 24
        };
        scope.subnetAddress2 = {
          val0: 172,
          val1: 16,
          val2: 0,
          val3: 0,
          val4: 24
        };
        scope.subnetAddress3 = {
          val0: '',
          val1: '',
          val2: '',
          val3: '',
          val4: ''
        };
        scope.netset = 0;
        // Function to modify the method of temporary notes
        // TODO xinwei
        // scope.addressValueCheck = addressValueCheck;
        scope.maskValueCheck = maskValueCheck;

        seft.FormatCode = function(json) {
          var listData = [];
          for (var v in json) {
            listData.push(json[v]);
          }
          var str = listData.join('.');
          return str.replace(/([^.]*).([^.]*)$/g, '$1/$2');
        };

        scope.subnetCheck = function(val) {
          val = !val;
        };
        scope.subnetAddressCidr = seft.FormatCode(scope.subnetAddress);
        scope.subnetAddressCidr1 = seft.FormatCode(scope.subnetAddress1);
        scope.subnetAddressCidr2 = seft.FormatCode(scope.subnetAddress2);
        scope.subnetAddressCidr3 = seft.FormatCode(scope.subnetAddress3);
        scope.numericValue = 0;
        subnet.cidr = scope.subnetAddressCidr;

        scope.$watch('subnetAddress', function(newv, oldv) {
          if (newv != oldv) {
            scope.subnetAddressCidr = seft.FormatCode(newv);
            if (scope.numericValue == 0) {
               subnet.cidr = scope.subnetAddressCidr;
               if(!addressValidCheck(scope.subnetAddress)){
                 scope.networkInvalidTag=true;
                 scope.subnetGatewayMatch = true;
               }else{
                 scope.networkInvalidTag=false;
                 scope.checkIPValid();
               }
            }
          }
        }, true);
        scope.$watch('subnetAddress1', function(newv, oldv) {
          if (newv != oldv) {
            scope.subnetAddressCidr1 = seft.FormatCode(newv);
            if (scope.numericValue == 1) {
               subnet.cidr = scope.subnetAddressCidr1;
               if(!addressValidCheck(scope.subnetAddress1)){
                 scope.networkInvalidTag=true;
                 scope.subnetGatewayMatch = true;
               }else{
                 scope.networkInvalidTag=false;
                 scope.checkIPValid();
               }
            }
          }
        }, true);
        scope.$watch('subnetAddress2', function(newv, oldv) {
          if (newv != oldv) {
            scope.subnetAddressCidr2 = seft.FormatCode(newv);
            if (scope.numericValue == 2) {
               subnet.cidr = scope.subnetAddressCidr2;
               if(!addressValidCheck(scope.subnetAddress2)){
                 scope.networkInvalidTag=true;
                 scope.subnetGatewayMatch = true;
               }else{
                 scope.networkInvalidTag=false;
                 scope.checkIPValid();
               }
            }
          }
        }, true);
        scope.$watch('subnetAddress3', function(newv, oldv) {
           if (newv != oldv) {
             scope.subnetAddressCidr3 = seft.FormatCode(newv);
             if (scope.netset == 1) {
               network.cidr = scope.subnetAddressCidr3;
               if(!addressValidCheck(scope.subnetAddress3)){
                 scope.networkInvalidTag=true;
                 scope.subnetGatewayMatch = true;
               }else{
                 scope.networkInvalidTag=false;
                 scope.checkIPValid();
               }
             }
           }
        }, true);
        scope.$watch('subnet.gateway_ip', function(newv, oldv) {
          if (newv != oldv) {
            scope.checkIPValid();
          }
        }, true);
        scope.subnetRadio = function(obj) {
          switch (obj) {
            case 0:
              scope.numericValue = 0;
              subnet.cidr = scope.subnetAddressCidr;
              if(!addressValidCheck(scope.subnetAddress)){
                scope.networkInvalidTag=true;
                scope.subnetGatewayMatch = true;
              }else{
                scope.networkInvalidTag=false;
                scope.checkIPValid();
              }
              break;
            case 1:
              scope.numericValue = 1;
              subnet.cidr = scope.subnetAddressCidr1;
              if(!addressValidCheck(scope.subnetAddress1)){
                scope.networkInvalidTag=true;
                scope.subnetGatewayMatch = true;
              }else{
                scope.networkInvalidTag=false;
                scope.checkIPValid();
              }
              break;
            case 2:
              scope.numericValue = 2;
              subnet.cidr = scope.subnetAddressCidr2;
              if(!addressValidCheck(scope.subnetAddress2)){
                scope.networkInvalidTag=true;
                scope.subnetGatewayMatch = true;
              }else{
                scope.networkInvalidTag=false;
                scope.checkIPValid();
              }
              break;
          }
        };

        scope.netsetRadio = function(obj) {
          scope.netset = obj;
          switch (obj) {
            case 0:
              scope.subnetRadio(scope.numericValue);
              break;
            case 1:
              network.cidr = scope.subnetAddressCidr3;
              if(!addressValidCheck(scope.subnetAddress3)){
                scope.networkInvalidTag=true;
                scope.subnetGatewayMatch = true;
              }else{
                scope.networkInvalidTag=false;
                scope.checkIPValid();
              }
              break;
          }
        };
        scope.checkIPValid = function() {
        if(network.gateway_ip !== undefined && network.gateway_ip !="" && network.gateway_ip !== null) {
          var subnet =  network.cidr.split('\/')[0];
          var gateway = network.gateway_ip;
          var mask = network.cidr.split('\/')[1];
          scope.subnetGatewayMatch = judgeGatewayResult(subnet,gateway,mask);
        }
      }
      }

      context.subnetId = subnetId ? false : true;
      scope.dropdown = dropdown;
      scope.context = context;
      scope.subnet = subnet;
      scope.action = action;

      scope.network = network;

    }
  ])

  .controller('networksFormCtrl', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'network', 'context',
      'dnsCreateAction','hostRouteCreateAction', 'addressPoolCreateAction',
      function(scope, modalInstance, neutronAPI, network, context,
        DnsCreateAction, HostRouteCreateAction, AddressPoolCreateAction) {

        var seft = this;
        var dropdown = {};
        var action = {
          submit: function() {
            modalInstance.close(network);
          },
          cancel: function() {
            modalInstance.dismiss('cancel');
          },
          // DNS
          dnsCreate: new DnsCreateAction(scope),
          // Host route
          hostRouteCreate: new HostRouteCreateAction(scope),
          // address poll
          addressPoolCreate: new AddressPoolCreateAction(scope)
        };
        //network default: valid
        scope.subnetGatewayMatch = true;
        scope.networkInvalidTag = false;

        // Sub form DNS
        network.dns_nameservers = [];
        // Address Pool
        network.host_routes = [];
        // host route
        network.allocation_pools = [];

        scope.getAddressFromCidr = getAddressFromCidr;

        if (context.mode === 'create') {
          network.enable_gateway = true;
          network.enable_dhcp = true;
          network.with_subnet = false;
          network.defaultSubnetName = 'default_subnet';
          network.typeLabel='VLAN ID';
          network.dns_nameservers = [];
          network.host_routes = [];
          network.allocation_pools = [];

          network.dns = null;
          network.route = {};
          network.route.destination = null;
          network.route.nexthop = null;
          network.pool = {};
          network.pool.start = null;
          network.pool.end = null;

          scope.subnetAddress = {
            val0: 192,
            val1: 168,
            val2: 0,
            val3: 0,
            val4: 24
          };
          scope.subnetAddress1 = {
            val0: 10,
            val1: 0,
            val2: 0,
            val3: 0,
            val4: 24
          };
          scope.subnetAddress2 = {
            val0: 172,
            val1: 16,
            val2: 0,
            val3: 0,
            val4: 24
          };
          scope.subnetAddress3 = {
            val0: '',
            val1: '',
            val2: '',
            val3: '',
            val4: ''
          };
          scope.netset = 0;
          // Function to modify the method of temporary notes
          // TODO xinwei
          //scope.addressValueCheck = addressValueCheck;
          scope.maskValueCheck = maskValueCheck;

          seft.FormatCode = function(json) {
            var listData = [];
            for (var v in json) {
              listData.push(json[v]);
            }
            var str = listData.join('.');
            return str.replace(/([^.]*).([^.]*)$/g, '$1/$2');
          };

          scope.subnetCheck = function(val) {
            val = !val;
          };

          scope.subnetAddressCidr = seft.FormatCode(scope.subnetAddress);
          scope.subnetAddressCidr1 = seft.FormatCode(scope.subnetAddress1);
          scope.subnetAddressCidr2 = seft.FormatCode(scope.subnetAddress2);
          scope.subnetAddressCidr3 = seft.FormatCode(scope.subnetAddress3);
          scope.numericValue = 0;
          network.cidr = scope.subnetAddressCidr;

          scope.$watch('subnetAddress', function(newv, oldv) {
            if (newv != oldv) {
              scope.subnetAddressCidr = seft.FormatCode(newv);
              if (scope.numericValue == 0) {
                network.cidr = scope.subnetAddressCidr;
                if(!addressValidCheck(scope.subnetAddress)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();
                }
              }
            }
          }, true);
          scope.$watch('subnetAddress1', function(newv, oldv) {
            if (newv != oldv) {
              scope.subnetAddressCidr1 = seft.FormatCode(newv);
              if (scope.numericValue == 1) {
                network.cidr = scope.subnetAddressCidr1;
                if(!addressValidCheck(scope.subnetAddress1)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();
                }
              }
            }
          }, true);
          scope.$watch('subnetAddress2', function(newv, oldv) {
            if (newv != oldv) {
              scope.subnetAddressCidr2 = seft.FormatCode(newv);
              if (scope.numericValue == 2) {
                network.cidr = scope.subnetAddressCidr2;
                if(!addressValidCheck(scope.subnetAddress2)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();
                }
              }
            }
          }, true);
          scope.$watch('subnetAddress3', function(newv, oldv) {
            if (newv != oldv) {
              scope.subnetAddressCidr3 = seft.FormatCode(newv);
              if (scope.netset == 1) {
                network.cidr = scope.subnetAddressCidr3;
                if(!addressValidCheck(scope.subnetAddress3)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();
                }
              }
            }
          }, true);
          scope.$watch('network.gateway_ip', function(newv, oldv) {
            if (newv != oldv) {
              scope.checkIPValid();
            }
          }, true);
          scope.subnetRadio = function(obj) {
            switch (obj) {
              case 0:
                scope.numericValue = 0;
                network.cidr = scope.subnetAddressCidr;
                if(!addressValidCheck(scope.subnetAddress)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();
                }
                break;
              case 1:
                scope.numericValue = 1;
                network.cidr = scope.subnetAddressCidr1;
                if(!addressValidCheck(scope.subnetAddress1)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();

                }
                break;
              case 2:
                scope.numericValue = 2;
                network.cidr = scope.subnetAddressCidr2;
                if(!addressValidCheck(scope.subnetAddress2)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();

                }
                break;
            }
          };

          scope.netsetRadio = function(obj) {
            scope.netset = obj;
            switch (obj) {
              case 0:
                scope.subnetRadio(scope.numericValue);
                break;
              case 1:
                network.cidr = scope.subnetAddressCidr3;
                if(!addressValidCheck(scope.subnetAddress3)){
                  scope.networkInvalidTag=true;
                  scope.subnetGatewayMatch = true;
                }else{
                  scope.networkInvalidTag=false;
                  scope.checkIPValid();
                }
                break;
            }
          };
          scope.enterName = function(name){
            name = name ? name : '';
            network.defaultSubnetName = name.length > 240 ? name : name + '_' + 'default_subnet';
          };

          scope.checkGatewayIp = function(){
            if (!network.enable_gateway) {
                network.gateway_ip = null;
            }
          };

          scope.checkIPValid = function() {
            if(network.gateway_ip !== undefined && network.gateway_ip !="" && network.gateway_ip !== null) {
              var subnet =  network.cidr.split('\/')[0];
              var gateway = network.gateway_ip;
              var mask = network.cidr.split('\/')[1];
              scope.subnetGatewayMatch = judgeGatewayResult(subnet,gateway,mask);
            }
          }
        }

        scope.networkTypeLabel = {
          'vlan': 'VLAN ID',
          'gre': 'GRE ID',
          'vxlan': 'VXLAN ID'
        };

        scope.dropdown = dropdown;
        scope.context = context;
        scope.network = network;
        scope.action = action;

      }
    ])
    // net detail controller
    .controller('netDetailForm', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'detail', 'context', 'ctrl',
      function(scope, modalInstance, neutronAPI, detail, context, ctrl) {
        var w = 644;
        var action = {
          submit: function() {
            modalInstance.close(detail);
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

        neutronAPI.getNetwork(detail.net_id).success(function(network) {
          scope.network = network;
          scope.network.Provider_Network = "Network Type: " + network['provider:network_type'] + "  Physical Network:" + network['provider:physical_network'] + "  Segmentation ID:" + network['provider__segmentation_id'];
          scope.safeSubnets = network.subnets;
          scope.sunnetId = network.id;
        });

        var h = $(window).height();

        scope.$watch('scope.network', function() {
          $('.detailContent').css({
              height: h,
              width: w,
              right: -w
            });
            $('.detailContent .tab-content').css({
              height: h-62
            });
            $('.detailContent').stop();
            $('.detailContent').animate({
                right: 0
            },400)
            .css('overflow', 'visible');
        });

        $(window).resize(function() {
          var w2 = 644;
          var h2 = $(window).height();
          $('.detailContent').css({
            width: w2,
            height: h2
          });
          $('detailContent .tab-content').css({
            height: h2-62
          });
        });

        scope.label = context.label;
        scope.title = context.title;
        scope.ctrl = ctrl;
        scope.action = action;
      }
    ])
    .controller('subnetDetailForm', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'detail', 'context', 'ctrl', 'networkDetailAction',
      function(scope, modalInstance, neutronAPI, detail, context, ctrl, CreateDetailAction) {
        var w = 644;
        var action = {
          submit: function() {
            modalInstance.close(detail);
          },
          cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
          },
          createDetail: new CreateDetailAction(scope)
        };

        neutronAPI.getSubnet(detail.net_id).success(function(subnet) {
          scope.subnet = subnet;
        });

        var h = $(window).height();

        scope.showNetwork = function(network) {
          modalInstance.close(detail);
          scope.action.createDetail.open(network);
        };

        scope.$watch('scope.subnet', function() {
          $('.detailContent').css({
              height: h,
              width: w,
              right: -w
            });
            $('.detailContent .tab-content').css({
              height: h-62
            });
            $('.detailContent').stop();
            $('.detailContent').animate({
                right: 0
            },400)
            .css('overflow', 'visible');
        });

        $(window).resize(function() {
          var w2 = 644;
          var h2 = $(window).height();
          $('.detailContent').css({
            width: w2,
            height: h2
          });
          $('.tab-content').css({
            height: h2-62
          });
        });

        scope.label = context.label;
        scope.title = context.title;
        scope.ctrl = ctrl;
        scope.action = action;
      }
    ])

    // sub form
    .controller('enterFormCtrl', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'context', 'data',
      'horizon.openstack-service-api.keystone', 'dnsCreateAction',
      function(scope, modalInstance, neutronAPI, context, data, keystoneAPI, DnsCreateAction) {
        var action = {
          submit: function() {
            modalInstance.close(data);
          },
          cancel: function() {
            modalInstance.dismiss('cancel');
          }
        };

        scope.data    = data;
        scope.action  = action;
        scope.context = context;
      }])
      //subnet delete form
    .controller('subnetDeleteFormCtrl', ['$scope', '$modalInstance','context',
    'horizon.openstack-service-api.neutron',
      function(scope, $modalInstance, context, neutronAPI) {
        context.message = {
            warning : gettext('Warning: The ports not in use on the subnet will be deleted together.'),
            danger : gettext('Can not delete this subnet, there are one or more instances, routers or loadbalancers on the subnet, please detach resources firstly.'),
        };
        scope.disableSubmit = true;
        scope.context = context;
        scope.portLoading = true;
        scope.submit = function() {
          $modalInstance.close();
        };
        scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
        function setDeviceInfo(ports) {
            var usedPorts = [];
            var notUsedPorts = [];
            for (var i = 0; i < ports.length; i++) {
                if (ports[i].device_owner !== 'network:dhcp') {
                    if (ports[i].device_id) {
                        if (!ports[i].device_name) {
                            ports[i].device_name = ports[i].device_id;
                        }
                        if (ports[i].device_owner && ports[i].device_owner.startsWith('compute:nova')) {
                            ports[i].device_type = 'instance';
                            if (ports[i].instance_name) {
                                ports[i].device_name = ports[i].instance_name;
                            }
                        } else if (ports[i].device_owner && ports[i].device_owner == 'network:router_interface') {
                            ports[i].device_type = 'router';
                        } else if (ports[i].device_owner && ports[i].device_owner.startsWith('neutron:LOADBALANCER')) {
                            ports[i].device_type = 'loadbalance';
                        } else {
                            ports[i].device_type = 'port';
                            ports[i].device_name = ports[i].name ? ports[i].name : ports[i].id;
                        }
                        usedPorts.push(ports[i]);
                    } else {
                        if (!ports[i].name) {
                            ports[i].name = ports[i].id;
                        }
                        notUsedPorts.push(ports[i]);
                    }
                }
            }
            scope.context.usedPorts = usedPorts;
            scope.context.notUsedPorts = notUsedPorts;
        }

        neutronAPI.getPorts({'subnet_id':context.names[0].id}).success(function(response) {
            var ports = response.items;
            setDeviceInfo(ports);
            scope.portLoading = false;
        });

      }])
      //network delete form
    .controller('networkDeleteFormCtrl', ['$scope', '$modalInstance','context',
    'horizon.openstack-service-api.neutron',
      function(scope, $modalInstance, context, neutronAPI) {
        context.message = {
            warning : gettext('Warning: The ports not in use on the network will be deleted together.'),
            danger : gettext('Can not delete this network, there are one or more instances, routers or loadbalancers on the subnets of the network, please detach resources firstly.'),
        };
        var retrieve_all = false;
        if (context.mode=='admin'){
            retrieve_all = true;
        }
        scope.disableSubmit = true;
        scope.context = context;
        scope.portLoading = true;
        scope.submit = function() {
          $modalInstance.close();
        };
        scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
        function setDeviceInfo(ports) {
            var usedPorts = [];
            var notUsedPorts = [];
            for (var i = 0; i < ports.length; i++) {
                if (ports[i].device_owner !== 'network:dhcp') {
                    if (ports[i].device_id) {
                        if (!ports[i].device_name) {
                            ports[i].device_name = ports[i].device_id;
                        }
                        if (ports[i].device_owner && ports[i].device_owner.startsWith('compute:nova')) {
                            ports[i].device_type = 'instance';
                            if (ports[i].instance_name) {
                                ports[i].device_name = ports[i].instance_name;
                            }
                        } else if (ports[i].device_owner && ports[i].device_owner == 'network:router_interface') {
                            ports[i].device_type = 'router';
                        } else if (ports[i].device_owner && ports[i].device_owner.startsWith('neutron:LOADBALANCER')) {
                            ports[i].device_type = 'loadbalance';
                        } else {
                            ports[i].device_type = 'port';
                            ports[i].device_name = ports[i].name ? ports[i].name : ports[i].id;
                        }
                        usedPorts.push(ports[i]);
                    } else {
                        if (!ports[i].name) {
                            ports[i].name = ports[i].id;
                        }
                        notUsedPorts.push(ports[i]);
                    }
                }
            }
            scope.context.usedPorts = usedPorts;
            scope.context.notUsedPorts = notUsedPorts;
        }
        neutronAPI.getPorts({'network_id':context.names[0].id, 'retrieve_all' : retrieve_all}).success(function(response) {
            var ports = response.items;
            setDeviceInfo(ports);
            scope.portLoading = false;
        });

      }])
      ;
})();

function isNumber(num) {
  return (num==null || num=='') ? false : !isNaN(num);
}

// Function to modify the method of temporary notes
// TODO xinwei
/*function addressValueCheck(num) {
  if (!isNumber(num)){
    num = '';
  }
  else if (num < 0 ){
    num = 0;
  }
  else if(num >= 255) {
    num = 255;
  }
  return num;
}*/

//to check if the network-address is valid
function addressValidCheck(obj){
  for(var i in obj){
    if(obj[i]==='') {
      return false;
    }
  }
  return true;
}

function maskValueCheck(num) {
  if (!isNumber(num)){
    num='';
  }
  else if (num < 0 ){
    num = 0;
  }
  else if(num > 30) {
    num = 30;
  }
  return num;
}

function getAddressFromCidr(obj, tail_num) {
  /* get the ip address from cidr,
   * e.g, if cidr is 192.168.0.1/24, we can get like this:
   * 192.168.0.<tail_num>
   */
  if (obj) {
    var arr = obj.split('/')[0].split('.');
    return arr[0] + '.' + arr[1] + '.' + arr[2] + '.' + tail_num;
  }
  return null;
}

function h_fillbitsfromleft(num) {
    if (num >= 8 ){
        return(255);
    }
    bitpat=0xff00;
    while (num > 0){
        bitpat=bitpat >> 1;
        num--;
    }
    return(bitpat & 0xff);
}

function calcNWmask(cform) {
	var NWmaskStr = '';
    tmpvar = parseInt(cform,10);
    if (isNaN(tmpvar) || tmpvar > 32 || tmpvar < 0){
       return ""
    }
    if (tmpvar >= 8){
        NWmaskStr = '255';
        tmpvar-=8;
    }else{
        NWmaskStr = h_fillbitsfromleft(tmpvar)+ ".0.0.0";
		return(NWmaskStr);
    }
    if (tmpvar >= 8){
        NWmaskStr += ".255";
        tmpvar-=8;
    }else{
        NWmaskStr += "." + h_fillbitsfromleft(tmpvar) + ".0.0";
		return(NWmaskStr);
    }
    if (tmpvar >= 8){
        NWmaskStr += ".255";
        tmpvar-=8;
    }else{
        NWmaskStr += "." + h_fillbitsfromleft(tmpvar) + ".0";
		return(NWmaskStr);
    }
    NWmaskStr += "." + h_fillbitsfromleft(tmpvar);
    return(NWmaskStr);
}

function getIPsAndResult(ipAddr1,ipAddr2) {
	var ipArray1 = ipAddr1.split(".");
	var ipArray2 = ipAddr2.split(".");
	var returnResult = "";
	for (var i = 0; i < 4; i++) {
		var number1 = parseInt(ipArray1[i]);
		var number2 = parseInt(ipArray2[i]);
		returnResult += number1&number2;
		if(i<3){
			returnResult += ".";
		}
	}
	return returnResult;
}

function judgeGatewayResult(ipAddr,gateway,subnetMask) {
	var andResult1 = getIPsAndResult(ipAddr,calcNWmask(subnetMask));
	var andResult2 = getIPsAndResult(gateway,calcNWmask(subnetMask));
	if(andResult1 == andResult2){
		return true;
	}else{
		return false;
	}
}