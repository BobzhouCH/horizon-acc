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

  angular.module('hz.dashboard.admin.billing')

  .factory('billingCreateAction', ['horizon.openstack-service-api.billing', '$modal', 'backDrop',
  function(billingAPI, modal, backDrop) {

    var context = {
      mode: 'createPriceItem',
      title: gettext('Create Price Item'),
      submit:  gettext('Create'),
      success: gettext('Price Item %s was successfully created.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'billingFormCtrl',
        backdrop: backDrop,
        resolve: {
          para: function(){ return {}; },
          context: function(){ return context; },
          priceid:function(){ return null;}
        }
      };

      self.open = function(val){
        option.resolve.para = function(){ return {price_fixing_id: val}; };
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newPriceDetails) {
        var pricedetailsJson = {};
        pricedetailsJson.itemName = newPriceDetails.item_name;
        pricedetailsJson.fee = newPriceDetails.fee;
        pricedetailsJson.unit = newPriceDetails.unit;
        //pricedetailsJson.className = newPriceDetails.className;
        pricedetailsJson.ptype = newPriceDetails.ptype;
        pricedetailsJson.rule = newPriceDetails.rule;
        pricedetailsJson.price_fixing_id = newPriceDetails.price_fixing_id;

        billingAPI.createPriceItems(pricedetailsJson)
          .success(function(response) {
            var pricedetailslist = {};
            pricedetailslist.id = response.id;
            pricedetailslist.fee = pricedetailsJson.fee;
            pricedetailslist.unit = pricedetailsJson.unit;
            pricedetailslist.priceitem = {};
            pricedetailslist.priceitem.rule = pricedetailsJson.rule;
            pricedetailslist.priceitem.ptype = pricedetailsJson.ptype;

            scope.fixPricesDetail.unshift(pricedetailslist);
        });
      };
    }

    return action;
  }])
  .factory('billingCreateFixAction', 
  ['horizon.openstack-service-api.billing', '$modal', '$rootScope', 'disableItemDown', 'backDrop',
  function(billingAPI, modal, rootScope, disableItemDown, backDrop){
    var context = {
      mode: 'createFixing',
      title: gettext('Create Price Fixing'),
      submit:  gettext('Create'),
      success: gettext('Fixed Price %s was successfully created'),
    };

    function action(scope){
      var self = this;

      var option = {
        templateUrl: 'form',
        controller: 'billingFormCtrl',
        backdrop: backDrop,
        resolve: {
          para: function(){ return scope.fixPrices; },
          context: function(){ return context; },
          priceid: function(){ return null; }
        }
      };

      self.open = function(val){
        modal.open(option).result.then(self.submit);
      };

      self.clean = function(priceFixing){
        return {
          start_at: rootScope.rootblock.local_to_utc(priceFixing.start_at),
          description: priceFixing.description,
          base_id: priceFixing.base_id,
        };
      };

      self.submit = function(newPriceFixing) {
        var cleanPriceFixing = self.clean(newPriceFixing);
        billingAPI.createPriceFix(cleanPriceFixing)
          .success(function(res){
            var fixPrice = res;
            fixPrice['create_at'] = rootScope.rootblock.utc_to_local(fixPrice.create_at);
            fixPrice['start_at'] = rootScope.rootblock.utc_to_local(fixPrice.start_at);
            scope.fixPrices.push(fixPrice);
            scope.disableFix = true;
            scope.price_fixing_id = fixPrice.id;
            billingAPI.getPriceFix(fixPrice.id).success(function(res){
              scope.fixPricesDetailBackup = res.items;
              scope.fixPricesDetail = scope.fixPricesDetailBackup;
              //scope.fixPricesDetail.unshift(res.items);
              /*disableItemDown();*/
              scope.disableCheckBox = false;
              scope.filterProduct = scope.constants.productFilter(scope.fixPricesDetailBackup, function(current){
                scope.fixPricesDetail = current;

              });
            });
        });
      };
    }

    return action;
  }])
  .factory('billingPriceDetailAction', ['horizon.openstack-service-api.billing', 'disableItemDown',
  function(billingAPI, disableItemDown){
      function action(scope){
          this.detailResult = function(fixid){
            //$('.js-billing-content-items').eq(1).find('table').show();
            //$('.js-billing-content-items').eq(1).css({ overflow: 'hidden', height: 'auto' });
            //$('.billingArrow').show();
            var billingContentItmes = $('.js-billing-content-items'),
                billingArrow        = $('.billingArrow');

            billingAPI.getPriceFix(fixid).success(function(res){
                scope.price_fixing_id = fixid;
                scope.fixPricesDetailBackup = res.items;
                scope.fixPricesDetail = scope.fixPricesDetailBackup;

                billingContentItmes.eq(1).find('table').show();
                billingContentItmes.eq(1).css({ overflow: 'hidden', height: 'auto' });
                billingArrow.show();

                disableItemDown();

                scope.filterProduct = scope.constants.productFilter(scope.fixPricesDetailBackup, function(current){
                  scope.fixPricesDetail = current;
                });
            });
          };
      }
      return action;
  }])
  .factory('billingFixPriceDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
  function(keystoneAPI, modal, backdrop) {

    var context = {
      "mode": 'create',
      "title": 				gettext('Detail'),
      "launch": 			gettext("Launch"),
      "create_volume": 		gettext("Create Volume"),
      "edit": 				gettext("Edit"),
      "delete_image": 		gettext("Delete Image"),
      "detail_overview": 	gettext("Detail Overview"),
      "owner": 				gettext("Owner"),
      "status": 			gettext("Status"),
      "base_os": 			gettext("Base OS"),
      "size": 				gettext("Size"),
      "min_disk": 			gettext("Min. Disk"),
      "min_ram": 			gettext("Min. RAM"),
      "disk_format": 		gettext("Disk Format"),
      "container_format": 	gettext("Container Format"),
      "public": 			gettext("Public"),
      "protected": 			gettext("Protected"),
      "checksum": 			gettext("Checksum"),
      "created": 			gettext("Created Time"),
      "updated": 			gettext("Updated Time"),
      "id": 				gettext("ID"),
      "instances": 			gettext("Instances"),
      "metadata": 			gettext("Metadata"),
      "no_description": 	gettext("(No Description)"),
      "custom_properties": 	gettext("Custom Properties"),
      "kernel_id": 			gettext("Kernel ID"),
      "ramdisk_id": 		gettext("Ramdisk ID"),
      "architecture": 		gettext("Architecture"),
      "properties": 		gettext("Basic Properties"),
      "All":                gettext("All"),
      "Instance":           gettext("Instance"),
      "Others":             gettext("Others"),
      "Yuan":               gettext("Yuan"),
      "Filter":             gettext("Filter"),
      "Update":             gettext("Update"),
      "Cancel":             gettext("Cancel"),
      "NoData":             gettext("No Data")
    };

    var ctrl = {
          'active': gettext("Active"),
          'saving': gettext("Saving"),
          'queued': gettext("Queued"),
          'pending_delete': gettext("Pending Delete"),
          'killed': gettext("Killed"),
          'deleted': gettext("Deleted")
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'fixprice-detail',
        controller: 'fixPriceDetailForm',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(fixPrice){
        option.resolve.detail = function(){ return fixPrice; };
        modal.open(option);
      };

    }

    return action;
  }])
  .factory('disableItemDown', function(){
      function disableItemDown(){
          $('.js-billing-content-items').eq(0).animate({
              height: '16'
          },600).find('table').css('display', 'none').end().find('.billingArrow').addClass('billingArrowDwon');
          $('.js-billing-content-items').eq(1).css('display', 'block');
          $('.js-billing-content-items').eq(1).find('table').eq(0).css('display', 'table');
          $('.js-billing-content-items').eq(1).find('.js-billingArrow').css('display', 'block');
      }
      return disableItemDown;
  });

})();
