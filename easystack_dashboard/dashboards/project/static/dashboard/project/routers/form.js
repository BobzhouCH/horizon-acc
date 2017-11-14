/**
 * Copyright 2015 IBM Corp.
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
  angular.module('hz.dashboard.project.routers')

  /**
   
   * @ngdoc routerFormCtrl
   
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit router form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('routerFormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.keystone',
    'router', 'context', 'horizon.openstack-service-api.neutron',
    'horizon.openstack-service-api.floatingip',
    'horizon.openstack-service-api.fwaas',
    'horizon.openstack-service-api.billing', 'horizon.openstack-service-api.settings', '$rootScope',
    function(scope, modalInstance, keystoneAPI, router, context, neutronAPI, floatingipAPI,fwaasAPI, billingAPI, settingsAPI, rootScope) {
      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(router);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };


      if (context.mode === 'setGateway') {
        dropdown.IPs = [];
        scope.floatingIPState = false;
        floatingipAPI.getTenantFloatingIP().success(function(response) {
          var ip_array = [];
          angular.forEach(response.items, function(item) {
            if (!item.router_id && !item.instance_id) {
              ip_array.push(item);
            }
          });
          dropdown.IPs = ip_array;
          scope.floatingIPState = true;
        });
      }

      if(context.mode === "associate_firewall"|| context.mode ==="disassociate_firewall"){
        scope.firewallstate = false;
        fwaasAPI.getFirewalls()
            .success(function (response) {
              dropdown.firewalls = response.items;
              scope.firewallstate = true;
        });
      }

      if (context.mode === 'add-rule') {
        fwaasAPI.getFirewallRules({policy: 'null'}).success(function(response) {
          var all_rules = response.items;
          var tmp_rules = [];
          for(var i = 0; i < all_rules.length; i++){
            //if(all_rules[i].shared)
            tmp_rules.push(all_rules[i])
          }
          scope.rules = tmp_rules;
        });
      }

      if (rootScope.rootblock.billing_need) {
        scope.showBilling = true;
        if (rootScope.rootblock.active_fixing) {
          // get get router price
          billingAPI.getPriceItems('router').success(function(data) {
            scope.unitPrice = data.items[0];
            scope.price = Number(scope.unitPrice['fee_hour']);
          });
          billingAPI.getBalance().success(function(data) {
            if (data <= 0) {
              scope.showBalance = true;
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
                scope.price = scope.unitPrice['fee_month'];
       	        scope.router.unit = 'M';

       	    }else if(scope.unitSelect && scope.unitSelect.unit === 'Y'){
                scope.price = scope.unitPrice['fee_year'];
       	        scope.router.unit = 'Y';
       	    }else{
                scope.price = scope.unitPrice['fee_hour'];
       	        scope.router.unit = 'H';
       	    }
          };
        } else {
          scope.noFixing = true;
        }
      }


      scope.dropdown = dropdown;
      scope.context = context;
      scope.router = router;
      scope.action = action;
    }
  ])

  .controller('formConnect', [
    '$scope', '$modalInstance', 'context', 'horizon.openstack-service-api.neutron', 'routerId',
    function(scope, modalInstance, context, neutronAPI, routerId) {

      var action = {
        submit: function() {
          modalInstance.close(scope.router);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };


      scope.context = context;
      scope.action = action;
      scope.routerId = routerId;
      scope.router = {
        "ip": null
      };
      scope.router['routerId'] = scope.routerId;
      scope.selected_subnet;
      scope.router_subnets = [];
      scope.available_subnets = [];
      scope.loadingSubnets = true;
      scope.networks = [];
      scope.used_ips = [];

      var _select = function() {
        neutronAPI.getNetworks({filter_shared: true}).success(function(networks) {
          for (var j = 0; j < networks.items.length; j++) {
            if (!(networks.items[j]['router:external'])) {
              for (var k = 0; k < networks.items[j].subnets.length; k++) {
                if ($.inArray(networks.items[j].subnets[k].id, scope.router_subnets) < 0) {
                  var newdata = {};
                  newdata['network_name']  = networks.items[j].name;
                  newdata['network_id']    = networks.items[j].id;
                  newdata['cidr']          = networks.items[j].subnets[k].cidr;
                  newdata['subnet_name']   = networks.items[j].subnets[k].name;
                  newdata['subnet_id']     = networks.items[j].subnets[k].id;
                  scope.available_subnets.push(newdata);
                }
              }
            }
          }
          scope.loadingSubnets = false;
        });
      }

      this.init = function() {
        neutronAPI.getRouter(scope.routerId).success(function(router) {
          scope.router['name'] = router.items.name;
        });

        neutronAPI.getRouters('').success(function(routers) {
          var num = 0;
          for (var i = 0; i < routers.items.length; i++) {
            neutronAPI.getDevicePorts(routers.items[i].id).success(function(ports) {
              for (var j = 0; j < ports.items.length; j++) {
                scope.router_subnets.push(ports.items[j].subnet_id);
              };
              num++;
              if (num == routers.items.length) {
                _select();
              }
            });
          };
        });
      };
      this.init();
    }
  ])

  .controller('formCreateRule', [
    '$scope', '$modalInstance', 'context', 'horizon.openstack-service-api.neutron', 'routerId',
    'horizon.openstack-service-api.nova',
    function(scope, modalInstance, context, neutronAPI, routerId, novaAPI) {

      var action = {
        submit: function() {
          modalInstance.close(scope.rule);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      scope.context = context;
      scope.action = action;
      scope.routerId = routerId;
      scope.available_subnets = [];
      scope.available_addresses = [];
      scope.rule = {
        "router_id": scope.routerId
      };
      scope.instanceNames = {};
      function getInstancesInfo(available_addresses){
        for (var i=0; i < available_addresses.length; i++) {
          var instance_id = available_addresses[i].device_id;
          novaAPI.getServer(instance_id).success(
            function(data){
              scope.instanceNames[data.id] = data.name;
            });
        }
      }

      this.init = function() {
        neutronAPI.getRouter(scope.routerId).success(function(router) {
          scope.rule['router_name'] = router.items.name;
          var external_gateway_info = router.items.external_gateway_info;
          // no external gateway, do nothing.
          if (!external_gateway_info) {
            return;
          }
          scope.rule['router_gateway'] = external_gateway_info.external_fixed_ips[0].ip_address;

          var external_subnet_id = external_gateway_info.external_fixed_ips[0].subnet_id;
          neutronAPI.getPorts({'device_id':router.items.id}).success(function(ports) {
            for (var i = 0; i < ports.items.length; i++) {
              var port_subnet_id = ports.items[i].fixed_ips[0].subnet_id;
              if (external_subnet_id != port_subnet_id) {
                scope.available_subnets.push(port_subnet_id);
              }
            }
            if (scope.available_subnets.length == 0) {
              return;
            }
            for (var i=0; i<scope.available_subnets.length; i++) {
              var params = {
                'subnet_id': scope.available_subnets[i]
              };
              neutronAPI.getPorts(params).success(function(ports) {
                for (var k = 0; k < ports.items.length; k++) {
                  for (var j = 0; j < scope.available_subnets.length; j++) {
                    var instance_subnet_id = ports.items[k].fixed_ips[0].subnet_id;
                    var device_owner = ports.items[k].device_owner;
                    if ( (instance_subnet_id == scope.available_subnets[j]) && (device_owner.indexOf("compute:") == 0) ){
                      var result = {
                        'ip_address': ports.items[k].fixed_ips[0].ip_address,
                        'device_id': ports.items[k].device_id
                      };
                      scope.available_addresses.push(result);
                    }
                  }
                }
                getInstancesInfo(scope.available_addresses);
              });
            }
          });
        });
      };

      this.init();
    }
  ])

  // routers detail controller
   .controller('routerDetailForm',[
      '$scope', '$modalInstance', 'horizon.openstack-service-api.neutron', 'context',
      'routerDetail', 'CreateRuleAction', 'DeleteRuleAction', 'ConnectAction', 'DisConnectAction', 'removeFirewallRuleAction',
       'horizon.openstack-service-api.fwaas', 'associateFirewallAction','disassociateFirewallAction','addRuleForPolicyAction',
      function(scope, modalInstance, neutronAPI, context, routerDetail, CreateRuleAction,
               DeleteRuleAction, ConnectAction, DisConnectAction,RemoveFirewallRuleAction, fwaasAPI, AssociateFirewall,
               DisassociateFirewall, AddRuleForPolicyAction) {
        var w = 1000;
        var self = this;
        var action = {
            submit: function() { modalInstance.close(detail); },
            cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function(){
                modalInstance.dismiss('cancel');
              });
            }
        };

        self.getDevicePort = function(routerDetail) {
          neutronAPI.getDevicePorts(routerDetail.router.id, {private: true}).success(function (data) {
            for (var j = 0; j < data.items.length; j++) {
              // to filter out HA ports
              if (data.items[j].subnet.indexOf('HA subnet tenant') != 0) {
                scope.routersOverview.push(data.items[j]);
              }
            }
          });
        };

        self.getFirewallRules = function() {
          fwaasAPI.getFirewallRules()
              .success(function (response) {
                scope.firewallRules = response.items;
                scope.ifirewallRuleState = true;
              });
        };

        self.getRuter = function(routerDetail){
          neutronAPI.getRouter(routerDetail.router.id).success(function (data) {
            scope.routerForwarding = data.items.portforwardings;
            if (scope.routerForwarding) {
              for (var i = 0; i < scope.routerForwarding.length; i++) {
                scope.routerForwarding[i].id = i + 1;
              }
            }
            scope.router = data;
          });
        };

        //inite the scope
        self.init = function(){
          self.initScope();
          self.updateFirewallDetail(routerDetail.router);
          self.getFirewallRules();
          self.getDevicePort(routerDetail);
          self.getRuter(routerDetail);

          self.startUpdateStatus(5000);
        };

        self.initScope = function(){
          scope.routerForwarding     = [];
          scope.irouterForwarding    = [];
          scope.checked              = {};
          scope.router_id              = routerDetail.router.id;
          scope.current_router = routerDetail.router;
          scope.updateFirewallDetail = self.updateFirewallDetail;

          //firewall detail
          scope.firewallRuleToShow  = [];
          scope.ifirewallRuleToShow = [];
          scope.ifirewallRuleState = false;
          scope.firewallToShow ={};

          scope.routersOverview  = [];
          scope.iroutersOverview = [];
          scope.checked          = {};

          scope.actions = {
            create: new CreateRuleAction(scope),
            deleted: new DeleteRuleAction(scope),

            createConnec: new ConnectAction(scope),
            deletedConnec: new DisConnectAction(scope),

            //firewall detail
            associateFirewall: new AssociateFirewall(scope),
            disassociateFirewall: new DisassociateFirewall(scope),
            removeFirewallRuleAction: new RemoveFirewallRuleAction(scope),
            addRuleForPolicyAction: new AddRuleForPolicyAction(scope)
          };

          scope.firewallStatusToString = {
            'ACTIVE': gettext('ACTIVE'),
            'DOWN': gettext('DOWN'),
            'BUILD': gettext('BUILD'),
            'ERROR': gettext('ERROR'),
            'PENDING_CREATE': gettext('PENDING_CREATE'),
            'PENDING_UPDATE': gettext('PENDING_UPDATE'),
            'PENDING_DELETE': gettext('PENDING_DELETE')
          };

          scope.actionString = {
           'allow': gettext('Allow'),
           'deny': gettext('Deny')
          };
          scope.filterFacets = [{
            label: gettext('Name'),
            name: 'name',
            singleton: true
          }, {
            label: gettext('Description'),
            name: 'description',
            singleton: true
          }, {
            label: gettext('Policy'),
            name: 'policy.name',
            singleton: true
          }, {
            label: gettext('Action'),
            name: 'action',
            singleton: true,
            options: [
              { label: scope.actionString.allow, key: 'Allow' },
              { label: scope.actionString.deny, key: 'Deny' }
            ]
          }, {
            label: gettext('Protocol'),
            name: 'protocol',
            singleton: true
          }, {
            label: gettext('Source IP'),
            name: 'source_ip_address',
            singleton: true
          }, {
            label: gettext('Source Port'),
            name: 'source_port',
            singleton: true
          }, {
            label: gettext('Destination IP'),
            name: 'destination_ip_address',
            singleton: true
         }, {
            label: gettext('Destination Port'),
            name: 'destination_port',
            singleton: true
          }, {
            label: gettext('Share'),
            name: 'shared',
            singleton: true
          }];


        };

        //update the data of firewall detail page
        self.updateFirewallDetail = function(router){
          neutronAPI.getRouter(router.id)
            .success(function(response) {
              angular.extend(router, response.items);
              if(router.firewall_id){
                self.updateFirewall(router.firewall_id);
              }
            })
        };

      self.startUpdateStatus = function(interval){
        var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE'];
        function check(){
          if(statusList.contains(scope.firewallToShow.status)){
            self.updateFirewall(scope.firewallToShow.id);
          }
        }
        setInterval(check, interval);
      };

        //update firewall
        self.updateFirewall = function(firewall_id){
          fwaasAPI.getFirewall(firewall_id).success(function(response){
            var firewall = response;
            scope.firewallToShow = firewall;
            fwaasAPI.getFirewallRules().success(function (response) {
              var firewallRules = response.items;
              var firewallDict = self.to_dict(firewallRules);
              var firewallRuleToShow = [];
              angular.forEach(firewall.policy.firewall_rules, function(rule_id){
                firewallRuleToShow.push(firewallDict[rule_id]);
              });
              scope.firewallRuleToShow = firewallRuleToShow;
              scope.ifirewallRuleState = true;
            });
          })
        };

        self.init();

        self.to_dict = function(objects){
          var objects_dict=[];
          angular.forEach(objects, function(o){
            objects_dict[o.id] = o;
          });
          return objects_dict;
        };

        var h = $(window).height();

          scope.$watch('scope.router', function(){
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
            var w2 = 1000;
            var h2 = $(window).height();
            $('.detailContent').css({
            width: w2,
            height: h2
          });
          $('.tab-content').css({
            height: h2-62
          });
        });

        scope.context = context;
        scope.action = action;
      }
   ])

})();
