(function() {
  'use strict';

  angular.module('hz.dashboard.admin.networks')

  .controller('hz.dashboard.admin.instances.networksFormCtrl', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'network', 'context',
      'horizon.openstack-service-api.keystone',
      'dnsCreateAction','hostRouteCreateAction', 'addressPoolCreateAction',
      function(scope, modalInstance, neutronAPI, network, context, keystoneAPI,
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

        scope.isCloudAdmin = false;
        scope.projects = [];
        keystoneAPI.getCloudAdmin().success(function(data){
          scope.isCloudAdmin = data;
          if (scope.isCloudAdmin) {
            keystoneAPI.getProjects().success(function(data){
              scope.projects = data.items;
            })
          }
        });
        scope.getAddressFromCidr = getAddressFromCidr;

        if (context.mode === 'networkEdit') {

        }

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
          scope.addressValueCheck = addressValueCheck;
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
                }else{
                    scope.networkInvalidTag=false;
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
                }else{
                    scope.networkInvalidTag=false;
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
                }else{
                    scope.networkInvalidTag=false;
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
                 }else{
                   scope.networkInvalidTag=false;
                 }
               }
             }
          }, true);

          scope.subnetRadio = function(obj) {
            switch (obj) {
              case 0:
                scope.numericValue = 0;
                network.cidr = scope.subnetAddressCidr;
                if(!addressValidCheck(scope.subnetAddress)){
                    scope.networkInvalidTag=true;
                }else{
                    scope.networkInvalidTag=false;
                }
                break;
              case 1:
                scope.numericValue = 1;
                network.cidr = scope.subnetAddressCidr1;
                if(!addressValidCheck(scope.subnetAddress1)){
                    scope.networkInvalidTag=true;
                }else{
                    scope.networkInvalidTag=false;
                }
                break;
              case 2:
                scope.numericValue = 2;
                network.cidr = scope.subnetAddressCidr2;
                if(!addressValidCheck(scope.subnetAddress2)){
                    scope.networkInvalidTag=true;
                }else{
                    scope.networkInvalidTag=false;
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
                }else{
                  scope.networkInvalidTag=false;
                }
                break;
            }
          };
          scope.enterName = function(name){
            name = name ? name : '';
            network.defaultSubnetName = name + '_' + 'default_subnet';
          };

          scope.checkGatewayIp = function(){
            if (!network.enable_gateway) {
                network.gateway_ip = null;
            }
          };
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
    ]);
})();

function isNumber(num) {
  return (num==null || num=='') ? false : !isNaN(num);
}

function addressValueCheck(num) {
  if (!isNumber(num)){
    num = '';
  }
  else if (num < 0 ){
    num = 0;
  }
  else if(num > 255) {
    num = 254;
  }
  return num;
}
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
