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

  /**
   * some constants var defined
   */
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

  .controller('billingFormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.billing', 'para', 'context',
    function(scope, modalInstance, billingAPI, para, context) {

      scope.action = {
        submit: function() { modalInstance.close(scope.priceFixing); },
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      scope.context = context;

      if(context.mode === 'showFixing') {
        price.price_fixing_id = priceid;
        scope.fixPricesDetail = para;
      }
      else if(context.mode === 'createFixing') {
        scope.priceFixing = {basedFixedPrices: para};
      }

    }])
    // img detail controller
  .controller('fixPriceDetailForm',[
    '$scope', '$modalInstance', 'horizon.openstack-service-api.billing', 'horizon.openstack-service-api.settings', 'detail', 'context','ctrl',
    function(scope, modalInstance, billingAPI, settingsService, detail, context, ctrl) {
      scope.detail = detail;
      scope.context = context;
      scope.context.headerDetail = constants.priceItemHeader,
      scope.constants = constants;
      scope.productTypes = constants.productTypes;
      scope.billingUnits = constants.billingUnits;
      scope.priceTypes = constants.priceTypes;

      scope.ifixPricesDetailState = false;

      settingsService.getSetting('PREBILLING',false).then(

        function success(data){
          scope.preBilling = data;
        }

      );
      var w = 1100;
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
      billingAPI.getPriceFix(detail.id).success(function(res){
        scope.price_fixing_id = detail.id;
        scope.fixPricesDetailBackup = res.items;
        scope.fixPricesDetail = scope.fixPricesDetailBackup;

        scope.filterProduct = scope.constants.productFilter(scope.fixPricesDetailBackup, function(current){
          scope.fixPricesDetail = current;
        });
        scope.ifixPricesDetailState = true;
      });
      var h = $(window).height();
        scope.$watch('scope.image', function(newValue,oldValue){
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
           var w2 = 1100;
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
  ])  ;
})();