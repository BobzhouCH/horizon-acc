(function() {
  'use strict';

  angular.module('hz.dashboard.project.vpn')

  .controller('ikepoliciesFormCtrl', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'ikepolicy', 'context',
      function(scope, modalInstance, vpnAPI, ikepolicy, context) {
      var dropdown = {
            auth_algorithms:[
                {key: 'sha1', value: 'sha1'}
            ],
            encryption_algorithms: [
                {key: '3des', value: '3des'},
                {key: 'aes-128', value: 'aes-128'},
                {key: 'aes-192', value: 'aes-192'},
                {key: 'aes-256', value: 'aes-256'}
            ],
            ike_versions: [
                {key: 'v1', value: 'v1'},
                {key: 'v2', value: 'v2'}
            ],
            lifetime_units: [
                {key: 'seconds', value: gettext('Seconds')}
            ],
            pfses: [
                {key: 'group2', value: 'group2'},
                {key: 'group5', value: 'group5'},
                {key: 'group14', value: 'group14'}
            ],
            phase1_negotiation_modes: [
                {key: 'main', value: gettext('Main Mode')}
            ]
          },
          action = {
            submit: function() {
              modalInstance.close(ikepolicy);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };
        scope.action = action;
        scope.dropdown = dropdown;
        scope.context = context;
        scope.ikepolicy = ikepolicy;
        scope.helpInfo = gettext('Equal to or greater than 60');
        scope.mdescription = gettext("Create IKE Policy for current project.\
            Assign a name and description for the IKE Policy.");
      }
    ])

  .controller('ikepolicyDetailForm',[
    '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'detail', 'context','ctrl',
    function(scope, modalInstance, vpnAPI, detail, context,ctrl) {
      var w = 644;
      var action = {
          submit: function() { modalInstance.close(detail); },
          cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
          }
      };
      vpnAPI.getIKEpolicy(detail.ikepolicy_id).success(function(data) {
          scope.ikepolicy = data;
      });
      var h = $(window).height();
        scope.$watch('scope.ikepolicy', function(newValue,oldValue){
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
      scope.label = context;
      scope.ctrl = ctrl;
      scope.action = action;
    }
  ])
  .controller('ipsecpoliciesFormCtrl', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'ipsecpolicy', 'context',
      function(scope, modalInstance, vpnAPI, ipsecpolicy, context) {
      var dropdown = {
            auth_algorithms:[
                {key: 'sha1', value: 'sha1'}
            ],
            encapsulation_modes: [
                {key: 'tunnel', value: gettext('Tunnel mode')},
                {key: 'transport', value: gettext('Transport mode')}
            ],
            encryption_algorithms: [
                {key: '3des', value: '3des'},
                {key: 'aes-128', value: 'aes-128'},
                {key: 'aes-192', value: 'aes-192'},
                {key: 'aes-256', value: 'aes-256'}
            ],
            lifetime_units: [
                {key: 'seconds', value: gettext('Seconds')}
            ],
            pfses: [
                {key: 'group2', value: 'group2'},
                {key: 'group5', value: 'group5'},
                {key: 'group14', value: 'group14'}
            ],
            transform_protocols: [
                {key: 'esp', value: 'esp'},
                {key: 'ah', value: 'ah'},
                {key: 'ah-esp', value: 'ah-esp'}
            ]
          },
          action = {
            submit: function() {
              modalInstance.close(ipsecpolicy);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };
        scope.action = action;
        scope.dropdown = dropdown;
        scope.context = context;
        scope.ipsecpolicy = ipsecpolicy;
        scope.helpInfo = gettext('Equal to or greater than 60');
        scope.mdescription = gettext("Create IPSec Policy for current project. An IPSec policy is an association of the following attributes:");
        scope.authorizationdes = gettext("Authorization algorithm: Auth_algorithm limited to SHA1 only.");
        scope.encapsulationdes = gettext("Encapsulation mode: The type of IPsec tunnel (tunnel/transport) to be used.");
        scope.encryptiondes = gettext("Encryption algorithm: The type of algorithm (3des, aes-128, aes-192, aes-256) used in the IPSec Policy.");
        scope.Lifetimedes = gettext("Lifetime: Life time consists of units and value. Units in 'seconds' and the default value is 3600.");
        scope.pfsdes = gettext("Perfect Forward Secrecy: PFS limited to using Diffie-Hellman groups 2, 5(default) and 14.");
        scope.Transformdes = gettext("Transform Protocol: The type of protocol (esp, ah, ah-esp) used in IPSec Policy.");
        scope.alldes = gettext("All fields are optional.");
      }
    ])
  .controller('ipsecpolicyDetailForm',[
    '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'detail', 'context',
    function(scope, modalInstance, vpnAPI, detail, context) {
      var w = 644;
      var action = {
          submit: function() { modalInstance.close(detail); },
          cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
          }
      };
      vpnAPI.getIPSecPolicy(detail.ipsecpolicy_id).success(function(data) {
          scope.ipsecpolicy = data;
      });
      var h = $(window).height();
        scope.$watch('scope.ipsecpolicy', function(newValue,oldValue){
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
      scope.label = context;
      scope.action = action;
    }
  ])
  .controller('vpnservicesFormCtrl', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'horizon.openstack-service-api.neutron', 'vpnservice', 'context',
      function(scope, modalInstance, vpnAPI, neutronAPI, vpnservice, context) {
      var self = this;
      var dropdown = {
            admin_states: [
                {key: 'true', value: gettext('UP')},
                {key: 'false', value: gettext('DOWN')}
            ]
          },
          action = {
            submit: function() {
              modalInstance.close(vpnservice);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };

        neutronAPI.getRouters('').success(function(response) {
            var responseRouters = response.items;
            dropdown.routers = [];
            vpnAPI.getVPNServices()
              .success(function(response){
                var responsevpnServ = response.items;
                if (responseRouters && responseRouters.length >0) {
                    for (var i=0; i <responseRouters.length; i++) {
                        var responsevpnService =  responsevpnServ.filter(function(item) {
                         return item.router_id == responseRouters[i].id;
                        });
                        if (responsevpnService.length <=0 && responseRouters[i].external_gateway_info != null) {
                            dropdown.routers.push(responseRouters[i]);
                        }
                    }
                    if (dropdown.routers.length>0) {
                        scope.getDevicePort(dropdown.routers[0].id);
                    }
                } else {
                    dropdown.sub_networks = [];
                }
            });
        });
        scope.getDevicePort = function(router_id) {
          dropdown.sub_networks = [];
          vpnservice.subnet_id = undefined;
          neutronAPI.getDevicePorts(router_id, {private: true}).success(function (data) {
            for (var j = 0; j < data.items.length; j++) {
              if (data.items[j].subnet.indexOf('HA subnet tenant') != 0) {
                dropdown.sub_networks.push(data.items[j]);
              }
            }
          });
        };

        scope.action = action;
        scope.dropdown = dropdown;
        scope.context = context;
        scope.vpnservice = vpnservice;
        scope.helpInfo = gettext('The state of VPN service to start in.If DOWN (False) VPN service does not forward packets.');
        scope.mdescription = gettext("Create VPN Service for current project.");
        scope.mdescription1 = gettext("The VPN service is attached to a router and references to a single subnet to push to a remote site.");
        scope.mdescription2 = gettext("Specify a name, description, router, and subnet for the VPN Service. Admin State is UP (True) by default.");
        scope.mdescription3 = gettext("The router, subnet and admin state fields are required, all others are optional.");
      }
    ])
  .controller('vpnserviceDetailForm',[
    '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'detail', 'context',
    function(scope, modalInstance, vpnAPI, detail, context) {
      var w = 644;
      var action = {
          submit: function() { modalInstance.close(detail); },
          cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
          }
      };
      vpnAPI.getVPNService(detail.vpnservice_id).success(function(data) {
          scope.vpnservice = data;
      });
      var h = $(window).height();
        scope.$watch('scope.vpnservice', function(newValue,oldValue){
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
      scope.admin_states = {
         true: gettext("UP"),
         false: gettext("DOWN")
      };
      scope.vpnserviceStatus= {
          'ACTIVE': gettext("Active"),
          'DOWN': gettext("Down"),
          'ERROR': gettext("Error"),
          'CREATED': gettext("Created"),
          'PENDING_CREATE': gettext("Pending Create"),
          'PENDING_UPDATE': gettext("Pending Update"),
          'PENDING_DELETE': gettext("Pending Delete"),
          'INACTIVE': gettext("Inactive")
        };
      scope.label = context;
      scope.action = action;
    }
  ])
  .controller('ipsecsiteconnsFormCtrl', [
      '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'horizon.openstack-service-api.neutron', 'ipsecsiteconn', 'context',
      'dnsCreateAction','hostRouteCreateAction', 'addressPoolCreateAction',
      function(scope, modalInstance, vpnAPI, neutronAPI, ipsecsiteconn, context) {
       var self = this;
       var dropdown = {
            admin_states: [
                {key: 'true', value: gettext('UP')},
                {key: 'false', value: gettext('DOWN')}
            ],
            dpd_actions: [
                {key: 'hold', value: gettext('Hold')},
                {key: 'clear', value: gettext('Clear')},
                {key: 'disabled', value: gettext('Disabled')},
                {key: 'restart', value: gettext('Restart')},
                {key: 'restart-by-peer', value: gettext('Restart by peer')}
            ],
            initiators: [
                {key: 'bi-directional', value: gettext('Bi-directional')},
                {key: 'response-only', value: gettext('Response only')}
            ]
          },
          action = {
            submit: function() {
              scope.peeraddressBlur();
              if (scope.peercidrsDisable == true) {
                  return;
              }
              modalInstance.close(ipsecsiteconn);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };
        vpnAPI.getVPNServices().success(function(response) {
            dropdown.vpnservices = response.items;
        });
        vpnAPI.getIPSecPolicies().success(function(response) {
            dropdown.ipsecpolicies = response.items;
        });
        vpnAPI.getIKEpolicies().success(function(response) {
            dropdown.ikepolicies = response.items;
        });
        this.dec2bin = function dec2bin(num){
            if(isNaN(num))return;
            return parseInt(num,10).toString(2);
        };
        this.ipTodec2bin = function (arrayStr) {
            var array = arrayStr.split('.');
            var ipdec2bin = '';
            for (var i=0; i < array.length; i++) {
                array[i] = self.dec2bin(array[i]);
                var oldarrayi = array[i];
                if (array[i].length <8) {
                    for (var j =0; j< (8- oldarrayi.length); j++) {
                        array[i] = 0+ array[i];
                    }
                }
                ipdec2bin += array[i];
            }
            return ipdec2bin;
        };


        this.adrrconflict = function adrrconflict( selectadrrs, netaddress) {
            var minmask =0;
            if (selectadrrs != '' && netaddress != '') {
                minmask = parseInt(selectadrrs.split('/')[1]) <= parseInt(netaddress.split('/')[1])
                    ? parseInt(selectadrrs.split('/')[1]): parseInt(netaddress.split('/')[1]);
            }
            if (self.ipTodec2bin(selectadrrs.split('/')[0]).substring(0, minmask) == self.ipTodec2bin(netaddress.split('/')[0]).substring(0, minmask)) {
                return true;
            }
            return false;
        };
        scope.peeraddressBlur = function (formunvalidate) {
            scope.peercidrsDisable = false;
            if (formunvalidate) {
                return;
            }
            var netaddr = "";
            var avalibleaddrs = scope.ipsecsiteconn.peer_cidrs instanceof Array ? scope.ipsecsiteconn.peer_cidrs: scope.ipsecsiteconn.peer_cidrs.split(',');
            var selectedvpnservice = scope.dropdown.vpnservices.filter(function (item) {
                return item.id == scope.ipsecsiteconn.vpnservice_id;
            });
            if (selectedvpnservice && selectedvpnservice.length >0) {
                netaddr = selectedvpnservice[0].subnet_name;
            }
            if (netaddr != "" && avalibleaddrs.length >0) {
                for (var i =0; i < avalibleaddrs.length; i++) {
                    var isconflict = self.adrrconflict(netaddr, avalibleaddrs[i]);
                    if (isconflict) {
                        scope.peercidrsDisable = true;
                        break;
                    }
                }
            }
        }
        scope.action = action;
        scope.dropdown = dropdown;
        scope.context = context;
        scope.ipsecsiteconn = ipsecsiteconn;
        scope.peeraddresshelpInfo = gettext('Peer gateway public IPv4 address or FQDN for the VPN Connection');
        scope.peeridhelpInfo = gettext('Peer router identity for authentication. Can be IPv4 address, e-mail,key ID, or FQDN');
        scope.peercidrshelpInfo = gettext('Remote peer subnet(s) address(es) with mask(s) in CIDR format (e.g. 20.1.0.0/24, 21.1.0.0/24) and the remote peer address cannot overlap with the local subnet address corresponding to the selected VPN service.');
        scope.pskhelpInfo = gettext('The pre-defined key string between the two peers of the VPN connection');
        scope.mtuhelpInfo = gettext('Equal to or greater than 68 if the local subnet is IPv4.');
        scope.dpdintervalhelpInfo = gettext('Valid integer lesser than DPD timeout');
        scope.dpdtimeouthelpInfo = gettext('Valid integer greater than the DPD interval');
        scope.adminstatehelpInfo = gettext('The state of IPSec site connection to start in. If DOWN (False), IPSec site connection does not forward packets.');
        scope.mdescription = gettext("Create IPSec Site Connection for current project.");
        scope.mdescription1 = gettext("Assign a name and description for the IPSec Site Connection. All fields in this tab are required.");
        scope.mdescription2 = gettext("Fields in this tab are optional.You can configure the detail of IPSec site connection created.");
        scope.peercidrsDisable = false;
      }
    ])
  .controller('ipsecsiteconnDetailForm',[
    '$scope', '$modalInstance', 'horizon.openstack-service-api.vpn', 'detail', 'context',
    function(scope, modalInstance, vpnAPI, detail, context) {
      var w = 644;
      var action = {
          submit: function() { modalInstance.close(detail); },
          cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
          }
      };
      vpnAPI.getIPSecSiteConnection(detail.ipsecsiteconn_id).success(function(data) {
          scope.ipsecsiteconn = data;
      });
      var h = $(window).height();
        scope.$watch('scope.ipsecsiteconn', function(newValue,oldValue){
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
      scope.admin_states = {
         true: gettext("UP"),
         false: gettext("DOWN")
      };
      scope.ipsecsiteconnStatus = {
          'ACTIVE': gettext("Active"),
          'DOWN': gettext("Down"),
          'ERROR': gettext("Error"),
          'CREATED': gettext("Created"),
          'PENDING_CREATE': gettext("Pending Create"),
          'PENDING_UPDATE': gettext("Pending Update"),
          'PENDING_DELETE': gettext("Pending Delete"),
          'INACTIVE': gettext("Inactive")
        };
      scope.label = context;
      scope.action = action;
    }
  ]);
})();

