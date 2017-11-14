/**
 * Copyright 2015 EasyStack Corp.
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

  var constants = {};

  constants.PRICE_PRECISION = 6;

  constants.priceItemHeader = {
    itemId: gettext('Price ID'),
    price: gettext('Unit Price'),
    priceMonth: gettext('Month Price'),
    priceYear: gettext('Year Price'),
    unit: gettext('Price Unit'),
    type: gettext('Price Type'),
    rules: gettext('Price Rules'),
    ptype: gettext('Product Type'),
    actions: gettext('Actions')
  };

  constants.productTypes = {
    //instance,image,volume,floatingip,snapshot
    'instance': gettext('Instance'),
    'image': gettext('Instance Snapshot'),
    'volume': gettext('Volume'),
    'floatingip': gettext('Floating IP'),
    'snapshot': gettext('Volume Snapshot'),
    'backup': gettext('Volume Backup'),
    'router': gettext('Router'),
    'listener': gettext('Listener'),
    'backup-full': gettext('Full Backup'),
    'backup-increment': gettext('Increment Backup'),
  };

  constants.billingUnits = {
    //H,M
    'H': gettext('Hour'),
    'M': gettext('MB'),
  };

  constants.priceTypes = {
    'fix': gettext('Fixed'),
    'multi': gettext('Multiply'),
  };

  constants.productFilter = function(all, current) {
    function filterProduct(ptype) {
      var result = all.filter(function(price, pos) {
        if (ptype === 'all'){
          return true;
        }else if (ptype === '!instance' && price.ptype !== 'instance'){
          return true;
        }else if (price.ptype == ptype){
          return true;
        }else{
          return false;
        }
      });
      current(result);
    }
    return filterProduct;
  };

  angular.module('hz.dashboard.admin.billing')

  .controller('billingCtrl', [
    '$scope', 'horizon.openstack-service-api.billing',
    'billingCreateAction','horizon.openstack-service-api.policy',
    'horizon.openstack-service-api.settings',
    'horizon.framework.widgets.toast.service',
    function(scope, BillingAPI, CreateAction, PolicyService, settingsService, toastService) {

      scope.context = {
        header: constants.priceItemHeader,
        action: {
          edit: gettext('Edit'),
          enable: gettext('Enable'),
          disable: gettext('Disable'),
          deleted: gettext('Delete')
        },
        error: {
          api: gettext('Unable to retrieve Current Price'),
          priviledge: gettext('Insufficient privilege level to view Current Price.')
        }
      };
      scope.constants = constants;
      scope.productTypes = constants.productTypes;
      scope.billingUnits = constants.billingUnits;
      scope.priceTypes = constants.priceTypes;

      scope.currentPrices = [];
      scope.icurrentPrices = [];
      scope.checked = {};
      scope.icurrentPricesState = false;
      scope.actions = {
        create: new CreateAction(scope)
      };

      settingsService.getSetting('PREBILLING',false).then(

        function success(data){
          scope.preBilling = data;
        }

      );

      this.init = function() {
        PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
        .success(function(response) {
              if (response.allowed) {
                BillingAPI.getCurrentPrice().success(function (res) {
                  scope.currentPricesBackup = res.items;
                  scope.currentPrices = scope.currentPricesBackup;
                  scope.icurrentPricesState = true;

                  scope.filterProduct = constants.productFilter(scope.currentPricesBackup, function (current) {
                    scope.currentPrices = current;
                  });
                });
              }
              else{
                toastService.add('info', scope.context.error.priviledge);
                window.location.replace((window.WEBROOT || '') + 'auth/logout');
              }
             });
            };
      var self = this ;
      scope.$on('pricefixingChanged',function(){
        scope.icurrentPricesState = false;
        self.init();
      });
      this.init();

      scope.fixPricesFilterFacets = [{
        label: gettext('Price ID'),
        name: 'id',
        singleton: true
      }, {
        label: gettext('Price Rules'),
        name: 'rule_dscription',
        singleton: true
      }, {
        label: gettext('Unit Price'),
        name: 'create_at',
        singleton: true
      }, {
        label: gettext('Price Type'),
        name: 'start_at',
        singleton: true,
        options: [
          { label: gettext('Fixed'), key: 'fix' },
          { label: gettext('Multiply'), key: 'multi' }
        ]
      }, {
        label: gettext('Product Type'),
        name: 'start_at',
        singleton: true,
        options: [
          { label: gettext('Instance'), key: 'instance' },
          { label: gettext('Instance Snapshot'), key: 'image' },
          { label: gettext('Volume'), key: 'volume' },
          { label: gettext('Floating IP'), key: 'floatingip' },
          { label: gettext('Volume Snapshot'), key: 'snapshot' },
          { label: gettext('Volume Backup'), key: 'backup' },
          { label: gettext('Router'), key: 'router' },
          { label: gettext('Listener'), key: 'listener' }
        ]
      }];
    }
  ])

    .controller('filterFacetsCtrl', [
    '$scope',
    function(scope) {

      scope.constants = constants;
      scope.productTypes = constants.productTypes;
      scope.priceTypes = constants.priceTypes;

      scope.fixPricesFilterFacets = [{
        label: gettext('Price ID'),
        name: 'id',
        singleton: true
      }, {
        label: gettext('Price Rules'),
        name: 'rule_dscription',
        singleton: true
      }, {
        label: gettext('Unit Price'),
        name: 'fee_hour',
        singleton: true
      }, {
        label: gettext('Price Type'),
        name: 'type',
        singleton: true,
        options: [
          { label: gettext('Fixed'), key: 'fix' },
          { label: gettext('Multiply'), key: 'multi' }
        ]
      }, {
        label: gettext('Product Type'),
        name: 'ptype',
        singleton: true,
        options: [
          { label: gettext('Instance'), key: 'instance' },
          { label: gettext('Instance Snapshot'), key: 'image' },
          { label: gettext('Volume'), key: 'volume' },
          { label: gettext('Floating IP'), key: 'floatingip' },
          { label: gettext('Volume Snapshot'), key: 'snapshot' },
          { label: gettext('Volume Backup'), key: 'backup' },
          { label: gettext('Router'), key: 'router' },
          { label: gettext('Listener'), key: 'listener' }
        ]
      }];

      scope.priceFilterFacets = [{
        label: gettext('Fixed ID'),
        name: 'id',
        singleton: true
      }, {
        label: gettext('Description'),
        name: 'description',
        singleton: true
      }, {
        label: gettext('Created Time'),
        name: 'create_at',
        singleton: true
      }, {
        label: gettext('Time to Apply'),
        name: 'start_at',
        singleton: true
      }, {
        label: gettext('State'),
        name: 'state',
        singleton: true,
        options: [
          { label: gettext('Expired'), key: 'EXPIRED' },
          { label: gettext('Using'), key: 'USING' },
          { label: gettext('Plan To Apply'), key: 'PLAN' },
          { label: gettext('To Use'), key: 'TOUSE' },
          { label: gettext('No Apply Time'), key: 'NO_START_TIME' }
        ]
      }];

    }
  ])

  .controller('billingCtrlFix', [
    '$scope', '$rootScope', '$interval', 'horizon.openstack-service-api.billing', 'billingCreateAction', 'billingPriceDetailAction',
    'billingCreateFixAction', 'billingDeleteFixAction', 'horizon.framework.widgets.toast.service', 'horizon.framework.widgets.modal.service',
        'horizon.openstack-service-api.policy','billingFixPriceDetailAction',
    function(scope, rootScope, $interval, BillingAPI, CreateAction, DetailAction, CreateFixAction, DeleteFixAction, toastService, smodal, PolicyService, fixPriceDetailAction)
    {
      var self = this;
      scope.context = {
        header: {
          fixId: gettext('Fixed ID'),
          createTime: gettext('Created Time'),
          applyTime: gettext('Time to Apply'),
          description: gettext('Description'),
          state: gettext('State'),
          enabled: gettext('Enabled'),
          actions: gettext('Actions')
        },
        error: {
          api: gettext('Unable to retrieve Current Price'),
          priviledge: gettext('Insufficient privilege level to view Fix Price information.')
        },
        headerDetail: constants.priceItemHeader,
        start: {
          title: gettext('Confirm Start To Use Price Fixing'),
          message: gettext('You have selected starting to use price fixing:  %s.'),
          tips: gettext(''),
          submit: gettext('Start to Use')
        },
        tooltip: {
          enable: gettext('click enable,it will be used by schedule.'),
          disable: gettext('click disable,it will not be used by schedule.')
        }
      };

      scope.fixPrices = [];
      scope.ifixPrices = [];
      scope.fixPricesDetail = [];
      scope.ifixPricesDetail = [];
      scope.checked = {};
      scope.ifixPricesState = false;
      scope.disableFix = false;
      scope.price_fixing_id;

      scope.fixPriceStates = {
        'EXPIRED': gettext('Expired'),
        'USING': gettext('Using'),
        'PLAN': gettext('Plan To Apply'),
        'TOUSE': gettext('To Use'),
        'NO_START_TIME': gettext('No Apply Time')
      };
      scope.constants = constants;
      scope.productTypes = constants.productTypes;
      scope.billingUnits = constants.billingUnits;
      scope.priceTypes = constants.priceTypes;

      // brings up the confirmation dialog
      var confirmDelete = function(pricefixing) {
        var description = pricefixing.description;
        var options = {
          title: scope.context.start.title,
          tips: scope.context.start.tips,
          body: interpolate(scope.context.start.message, [description]),
          submit: scope.context.start.submit
        };
        smodal.modal(options).result.then(function(){
            start_use(pricefixing.id);
        });
      };

      //start to use price fixing after confirm
      var start_use = function(id){
        var body = {};
        body['id'] = id;
        body['is_applied'] = 1;
        body['start_at'] = -1;
        scope.disableStart = true;
        scope.disableCheckBox = true;
        scope.checked = {};
        scope.selected = {};
        if(scope.selectedData){
          scope.selectedData.aData = [];
        }
        BillingAPI.editPriceFix(body).success(function(res) {
          var active_index = -1;
          var edited_index = -1;
          for (var i = 0; i < scope.fixPrices.length; i++) {
            if (scope.fixPrices[i].id == id) {
              scope.fixPrices[i]['is_applied'] = 1;
              scope.fixPrices[i]['start_at'] = gettext("starting");
              scope.fixPrices[i]['state'] = gettext("starting");
              edited_index = i;
            }else if(scope.fixPrices[i].is_active){
                active_index = i;
            }
          }
          var fetchPriceFixingTimer = $interval(function(){
              BillingAPI.getPriceFixing(id).success(function(data){
                if(data.items.is_active){
                  $interval.cancel(fetchPriceFixingTimer);
                  if (edited_index >= 0){
                      scope.fixPrices[edited_index]['is_applied'] = 1;
                      if (data.items.start_at){
                          scope.fixPrices[edited_index]['start_at'] = rootScope.rootblock.utc_to_local(data.items.start_at);
                      }
                      scope.fixPrices[edited_index]['state'] = "USING";
                      //广播使兄弟节点刷新
                      rootScope.$broadcast('pricefixingChanged');
                  }
                  if (active_index >= 0){
                      scope.fixPrices[active_index]['is_active'] = false;
                      scope.fixPrices[active_index]['state'] = "EXPIRED";
                      scope.disableFix = false;
                  }
                }else{


                }
              }
              );
          },5000);
        });
      };

      this.start = function(pricefixing) {
          confirmDelete(pricefixing);
      };
      this.refresh = function (){
        self.reset();
        self.init();
      }
      this.reset = function(){
        scope.fixPrices = [];
        scope.ifixPrices = [];
        scope.ifixPricesState = false;
        scope.checked = {};
        scope.selected = {};
        if(scope.selectedData){
          scope.selectedData.aData = [];
        }
      };
      scope.actions = {
        refresh: self.refresh,
        start: self.start,
        create: new CreateAction(scope),
        detail: new DetailAction(scope),
        fixPriceDetail: new fixPriceDetailAction(scope),
        createFix: new CreateFixAction(scope),
        deleteFix: new DeleteFixAction(scope)
      };
      this.init = function() {
        PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
        .success(function(response) {
              if (response.allowed) {
                BillingAPI.getFixHistory().success(function (res) {
                  scope.fixPricesBackup = res.items;
                  scope.fixPrices = scope.fixPricesBackup;
                  scope.ifixPricesState = true;

                  if ((res.items.length == 1) && (!res.items[0].start_at)) {
                    scope.disableFix = true;
                    var message = gettext("Please set start time and update price to use the initial price template.");
                    toastService.add('info', gettext(message));
                  }
                  for (var i = 0; i < res.items.length; i++) {
                    if (res.items[i].state === 'PLAN' || res.items[i].state === 'TOUSE') {
                      scope.disableFix = true;
                    }
                    if (!res.items[i].is_applied) {
                      scope.disableFix = true;
                    }
                    var start_time = res.items[i].start_at;
                    if (start_time) {
                      res.items[i]['start_at'] = rootScope.rootblock.utc_to_local(start_time);
                    }
                    var create_time = res.items[i].create_at;
                    if (create_time) {
                      res.items[i]['create_at'] = rootScope.rootblock.utc_to_local(create_time);
                    }
                  }
                });
              }
              else{
                toastService.add('info', scope.context.error.priviledge);
                window.location.replace((window.WEBROOT || '') + 'auth/logout');
              }
            });
      };

      this.init();

      $(document).on('focus', '.form_datetime, .datepicker', function() {
        var date = new Date();
        var startDate = new Date(date.getTime() + 3600000);
        $(".form_datetime, .datepicker").datetimepicker({
          format: 'yyyy-mm-dd hh:ii:ss',
          language: 'zh-CN',
          startView: 2,
          minView: 1,
          autoclose: true,
          startDate: startDate
        });
      });

  }])

  .filter('mustFloat', function(){
    return function(val){
      if(!isNaN(val)) {
        val = parseFloat(val);
      }
      return val;
    };
  });

})();
