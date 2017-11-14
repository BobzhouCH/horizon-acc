(function() {
  'use strict';

  angular.module('hz.dashboard.project.billing')

  .controller('identityProjectBillingPay', ['$scope', 'horizon.openstack-service-api.billing', 'horizon.openstack-service-api.chakra', '$rootScope', '$modal', 'horizon.framework.widgets.toast.service',
    function(scope, billingAPI, chakraAPI, rootScope, modal, toastService) {
      scope.accountInfo = {};
      scope.paymentList = [];
      scope.onoff       = false;
      scope.invcodepay = false;
      scope.invcode_status = null;
      scope.invcode_enable = false;
      scope.yeepay_enable = false;
      scope.bproductState = false;
      scope.alipay_enable = false;
      var invcode;
      this.init = function() {
        billingAPI.getRechargeWays().success(function(data){
            scope.invcode_enable = data.items.invcode;
            scope.yeepay_enable = data.items.yeepay;
            scope.alipay_enable = data.items.alipay;
        });
        chakraAPI.getAccount().success(function(data) {
          if (data.items) {
            scope.accountInfo = data.items[0];
          } else {
            var message = "Your user has no billing account";
            toastService.add('info', gettext(message));
          }
        });
        chakraAPI.getPayment('All').success(function(data) {
          if (data.items) {
            angular.forEach(data.items, function(data) {
              //convert utc to local time
              data.pay_at = rootScope.rootblock.utc_to_local(data.pay_at);
              data.pay_date = data.pay_at.substring(0, 10);
              data.pay_time = data.pay_at.substring(11, 19);
              if(data.ptype =='invcode'){data.ptype = gettext('Invitation Code')}
              else if(data.ptype =='alipay'){data.ptype = gettext('Alipay')}
              else if(data.ptype =='yeepay'){data.ptype = gettext('yeepay')}
              else{data.ptype = gettext('Admin Recharge')};
            });
            scope.paymentList = data.items;
          }
        });
      };
      this.init();
      scope.checkInvcode = function(){
          chakraAPI.getInvCode(scope.invcode).success(function(data){
              if (!scope.invcode){
                  scope.invcode_worth="";
                  scope.showavailable = false;
              }
              else if (data.items.length == 0){
                  //scope.invcode_worth = gettext("Not Available");
                  scope.showavailable = true;
                  scope.onoff = true;
              }else{
                  scope.invcode_status = data.items.status;
                  if (scope.invcode_status == 'available'){
                      invcode = scope.invcode;
                      scope.invcode_worth = data.items.worth;
                      scope.showavailable = false;
                      scope.onoff = false;
                  }else{
                      scope.invcode_worth = gettext(scope.invcode_status);
                      scope.showavailable = true;
                      scope.onoff = true;
                  }
              }
         })
      }
      scope.inputonKeyup = function() {
      	var reg = /(^[0-9]+)(\.\d{1,2})?$/,
      	    val = $('#pay-recharge').val();
      	if(!reg.test(val)){
      		$('#pay-recharge').css({ border: "1px solid #fc202f" });
      		scope.onoff       = true;
      		$('.js-tooltip').removeClass('none');
      	}
      	else{
      		$('#pay-recharge').removeAttr('style');
      		scope.onoff       = false;
      		$('.js-tooltip').addClass('none');
            $('#seifAmount li').each(function(i, ele) {
               $(ele).removeClass('moneyactive')
            });
      	}
      };
      
      scope.submitPay = function() {
        var payType, payValue;
        $('#pay-way li').each(function(i, ele) {
          if ($(ele).hasClass('payactive')) {
            payType = $(ele).attr('data-value');
            if (payType == 'invcode') {
                scope.invcodepay = true
            }
          }
        });
        if (scope.invcodepay){
            payValue = scope.invcode_worth;
            if (scope.invcode_status != 'available') {
                var message = "Please input available invitation code";
                toastService.add('error',gettext(message));
                return
            }
        }else if ($('#pay-recharge').val()) {
          payValue = $('#pay-recharge').val();
        } else {
          $('#seifAmount li').each(function(i, ele) {
            if ($(ele).hasClass('moneyactive')) {
              payValue = $(ele).attr('data-value');
            }
          });
        }
        if (payType && payValue) {
          scope.onoff = true;
          chakraAPI.createPayment({
            "invcode": invcode,
            "type": payType,
            "value": payValue
          }).success(function(data) {
            if(scope.invcodepay){
                var pay_at = data.items.pay_at;
                var amount = data.items.amount;
                var status = data.items.trade_success;
                if (status){
                    data.items.pay_at = rootScope.rootblock.utc_to_local(data.items.pay_at);
                    data.items['pay_date'] = data.items.pay_at.substring(0, 10);
                    data.items['pay_time'] = data.items.pay_at.substring(11, 19);
                    data.items['ptype'] = gettext('Invitation Code');
                    scope.paymentList.splice(0, 0, data.items);
                    scope.accountInfo.balance = (scope.accountInfo.balance + amount).toFixed(2);
                    scope.accountInfo.total_pay = (scope.accountInfo.total_pay + amount).toFixed(2);
                    var message = gettext("Successful Payment") + ":  " + amount + "￥ " + pay_at;
                    toastService.add('success', message);
                }else{
                    var message = gettext("Failure Payment") + ":  " + amount + "￥ " + pay_at;
                    toastService.add('error', message);
                }
                scope.invcode_status = null;
                scope.invcode = '';
                scope.invcode_worth = null;
                scope.onoff = true;
                return;
            }
            var option = {
              templateUrl: 'charge',
              controller: 'formCharge',
              windowClass: 'usersListContent',
              resolve: {
                payment_id: function() {
                  return data[1];
                },
              }
            };
            modal.open(option).result.then(function(item) {
              item.pay_at = rootScope.rootblock.utc_to_local(item.pay_at);
              item['pay_date'] = item.pay_at.substring(0, 10);
              item['pay_time'] = item.pay_at.substring(11, 19);
              scope.paymentList.splice(0, 0, item);
              if (item.trade_success) {
                scope.accountInfo.balance = (scope.accountInfo.balance + item.amount).toFixed(2);
                scope.accountInfo.total_pay = (scope.accountInfo.total_pay + item.amount).toFixed(2);
              }
            });
            window.open(data[0]);
          });
        }
      };
    }
  ])

  .controller('identityProjectBillingCtrl', ['$scope', '$rootScope', '$filter', 'horizon.openstack-service-api.billing', 'horizon.openstack-service-api.keystone', '$modal',
      function(scope, rootScope, filter, billingAPI, keystoneAPI, modal) {
        scope.context = {
          header: {
            resource: gettext('Resource'),
            createTime: gettext('Create Time'),
            updateTime: gettext('Update Time'),
            Items: gettext('Price Item'),
            Pricce: gettext('Unit Price'),
            Description: gettext('Description'),
            Status: gettext('Status'),
            RunTime: gettext('RunTime'),
            billingType: gettext('Billing Type'),
            Total: gettext('Total Cost')
          }
        };
        scope.bproducts_copy = [];
        scope.bproducts = [];
        scope.ibproducts = [];
        scope.checked = {};
        scope.totalPay = {};
        scope.projects = {
             'All': {
                  'name': 'All',
                  'id': 'All'
             }
        };
        scope.project_filter = true;
        scope.projectid = 'All';
        scope.currents = [];
        scope.costs = [];
        scope.producti18n = {
            'snapshot': gettext('Volume Snapshot'),
            'image': gettext('Instance Snapshot'),
            'floatingip': gettext('Floating IP'),
            'router': gettext('Router'),
            'instance': gettext('Instance'),
            'volume': gettext('Volume'),
            'lbaas': gettext('Listener'),
            'backup-full': gettext('Full Backup'),
            'backup-increment': gettext('Increment Backup')

        };
        scope.ptypei18n = {
            'snapshot': gettext('Volume Snapshot'),
            'image': gettext('Instance Snapshot'),
            'floatingip': gettext('Floating IP'),
            'router': gettext('Router'),
            'instance': gettext('Instance'),
            'volume': gettext('Volume')
        };
        scope.productstatus = {
            'disable': gettext('Not Start Charge'),
            'active': gettext('Charging Now'),
            'suspend': gettext('Suspend(not charge)'),
            'stop': gettext('Stop(not charge)'),
            'deleted': gettext('Deleted'),
            'suspend_h' : gettext('Suspend(not charge)'),
            'suspend_m' : gettext('Suspend')

        };
        scope.billingType = {
            'H': gettext('By Hour'),
            'M': gettext('By Month'),
            'Y': gettext('By Year')
        };
        this.init = function() {
          keystoneAPI.getDomainAdmin().success(function(data){
            scope.project_filter = data;
          });

          billingAPI.getProduct().success(function(data) {
            scope.bproductState = true;
        	// convert  utc time to local time
        	var index;
        	for(index = 0; index < data.items.length; index++) {
        		var create_at = data.items[index].create_at;
        		var update_at = data.items[index].update_at;
        		var ptype = data.items[index].ptype;
        		var unit = data.items[index].unit;
        		 if(create_at)
        		   {
        			 data.items[index]['create_at'] = rootScope.rootblock.utc_to_local(create_at);
        		   }
        		 if(update_at)
    			   {
    			     data.items[index]['update_at'] = rootScope.rootblock.utc_to_local(update_at);
    			   }
    			 if(ptype === 'instance'){
    			   if(data.items[index].status === 'suspend'){
                       if(unit === 'H'){
                          data.items[index].status = 'suspend_h';
                       }else{
                          data.items[index].status = 'suspend_m';
                       }
    			   }
    			 }
            }
            if (data.items.length){
            	var projects_len = 0;
              scope.bproducts = data.items;
              scope.bproducts_copy = data.items;
              for (var i = 0; i < scope.bproducts.length; i++) {
                var project = {};
                project['id'] = scope.bproducts[i].project_id;
                project['name'] = scope.bproducts[i].project_name;
                var id = project.id;
                if (!scope.projects.hasOwnProperty(id) && project['name']) {
                   scope.projects[id] = project;
                   projects_len++;
                }
              }
            }
          });

          billingAPI.getCurrent('All').success(function(data) {
              scope.currents = data.items;
              scope.totalPay['getHours'] = 0;
              for (var i = 0; i < scope.currents.length; i++) {
                  scope.totalPay['getHours'] += scope.currents[i].sum;
              }
              scope.totalPay['getDay'] = (scope.totalPay.getHours * 24);
              scope.totalPay['getMonth'] = (scope.totalPay.getDay * 30);
              scope.totalPay['getYear'] = (scope.totalPay.getDay * 365);
            });

          billingAPI.getCost('All').success(function(data) {
            scope.costs = data.items;
            scope.totalCost = {
              "count": 0,
              "sum": 0
            };
            for (var i = 0; i < scope.costs.length; i++) {
              scope.totalCost['count'] += scope.costs[i].count;
              scope.totalCost['sum'] += scope.costs[i].sum;
            }
          });
        };
        this.init();

        scope.projectNamefn = function(project_id) {
        	scope.projectid = project_id;
            scope.bproducts = scope._filter(project_id, "project_id");
            billingAPI.getCost(project_id).success(function(data) {
              scope.costs = data.items;
              scope.totalCost = {
                "count": 0,
                "sum": 0
              };
              for (var i = 0; i < scope.costs.length; i++) {
                scope.totalCost['count'] += scope.costs[i].count;
                scope.totalCost['sum'] += scope.costs[i].sum;
              }
            });
            billingAPI.getCurrent(project_id).success(function(data) {
                scope.currents = data.items;
                scope.totalPay['getHours'] = 0;
                for (var i = 0; i < scope.currents.length; i++) {
                    scope.totalPay['getHours'] += scope.currents[i].sum;
                }
                scope.totalPay['getDay'] = (scope.totalPay.getHours * 24);
                scope.totalPay['getMonth'] = (scope.totalPay.getDay * 30);
                scope.totalPay['getYear'] = (scope.totalPay.getDay * 365);
              });
          };

          scope._filter = function(value, key) {
            var array = scope.bproducts_copy;
            var _temp_array = [];
            if (value == "All") {
              if ((key == "project_id") || (scope.projectid == 'All')){
            	  return array;
              }
              for (var i = 0; i < array.length; i++) {
                  if (array[i]['project_id'] == scope.projectid){
                    _temp_array.push(array[i]);
                  }
              }
              return _temp_array;
            };
            for (var i = 0; i < array.length; i++) {
              if (array[i][key] == value) {
            	  if ((array[i]['project_id'] == scope.projectid) || (scope.projectid == 'All')){
            		  _temp_array.push(array[i]);
            	  }
              }
            }
            return _temp_array;
          }

      scope.detail = function(product_id) {
        billingAPI.getBillingItem(product_id).success(function(data) {
          var option = {
            templateUrl: 'detail',
            controller: 'formProductDetail',
            windowClass: 'projectBillingDetail',
            resolve: {
              items: function() {
                for (var i = 0; i < data.items.length; i++) {
                  if (data.items[i].charge_from) {
                    data.items[i]['charge_from'] = rootScope.rootblock.utc_to_local(data.items[i].charge_from);
                  }
                  if (data.items[i].charge_to) {
                    data.items[i]['charge_to'] = rootScope.rootblock.utc_to_local(data.items[i].charge_to);
                  }
                  if (data.items[i].charge_fee>0){
                    data.items[i].type = 'consume';
                  }else if(data.items[i].charge_fee <0){
                    data.items[i].type = 'returns';
                  }else{
                    data.items[i].type = 'keep';
                  }
                  /*if (data.items[i].charge_fee <0){
                    data.items[i].charge_fee = -data.items[i].charge_fee;
                  }*/
                }
                return data.items;
              }
            }
          };
          modal.open(option).result.then(self.submit);
        });
      }
      scope.costfilter = function(product) {

        if (!product.active) {
          if (product == "All") {
            for (var i = 0; i < scope.costs.length; i++) {
              scope.costs[i].active = false;
            }
            scope.bproducts = scope._filter(product, "ptype");
            scope.active = true;
          } else {
            for (var i = 0; i < scope.costs.length; i++) {
              scope.costs[i].active = false;
              scope.active = false;
            }
            scope.bproducts = scope._filter(product.product, "ptype");
            product.active = true;
          }

        }
      };
      scope.timeFormat = function(integer) {
        return parseInt(integer / 3600) + gettext('Hours') + parseInt((parseFloat(integer / 3600) - parseInt(integer / 3600)) * 60) + gettext('Minutes') + parseInt((parseFloat((parseFloat(integer / 3600) - parseInt(integer / 3600)) * 60) - parseInt((parseFloat(integer / 3600) - parseInt(integer / 3600)) * 60)) * 60) + gettext('Seconds');
      };

    scope.filterFacets = [{
      label: gettext('Resource'),
      name: 'resource_name',
      singleton: true
    }, {
      label: gettext('Status'),
      name: 'status',
      singleton: true
    }, {
      label: gettext('Total Cost'),
      name: 'cost',
      singleton: true
    }, {
        label: gettext('Billing Type'),
        name: 'unit',
        singleton: true,
        options: [
            { label: gettext('By Hour'), key: 'H' },
            { label: gettext('By Month'), key: 'M' },
            { label: gettext('By Year'), key: 'Y' }
        ]
    }, {
      label: gettext('Unit Price'),
      name: 'fee',
      singleton: true
    }, {
      label: gettext('RunTime'),
      name: 'runtime',
      singleton: true
    }, {
      label: gettext('Update Time'),
      name: 'update_at',
      singleton: true
    }, {
      label: gettext('Create Time'),
      name: 'create_at',
      singleton: true
    }];

    }
  ]);

})();
