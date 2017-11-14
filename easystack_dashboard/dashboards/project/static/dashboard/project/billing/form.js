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

  angular.module('hz.dashboard.project.billing')

  /**
   * @ngdoc formProductDetail
   * @ng-controller
   *
   */
  .controller('formProductDetail', [
    '$scope', '$modalInstance', 'items',
    function(scope, modalInstance, data) {

      var action = {
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      scope.billingDescription = {
            'Current billing period ends by power-off instance': gettext('Current billing period ends by power-off instance'),
            'Current billing period ends by suspending instance': gettext('Current billing period ends by suspending instance'),
            'Current billing period ends by deleting instance': gettext('Current billing period ends by deleting instance'),
            'Current billing period ends by resizing instance': gettext('Current billing period ends by resizing instance'),
            'Current billing period ends by resizing resource': gettext('Current billing period ends by resizing resource'),
            'Current billing period ends by deleting resource': gettext('Current billing period ends by deleting resource'),
            'Current billing period ends by changing price': gettext('Current billing period ends by changing price'),
            'Periodic billing': gettext('Periodic billing'),
            'Prepayment for resource creation': gettext('Prepayment for resource creation'),
            'Cost changes when resource resizing': gettext('Cost changes when resource resizing'),
            'Refund when resource was deleted within service period': gettext('Refund when resource was deleted within service period'),
            'Prepayment for the next service period when resource has expired': gettext('Prepayment for the next service period when resource has expired')

      };
      scope.consumeType = {
            'consume' :gettext('consume'),
            'returns' :gettext('returns'),
            'keep': gettext('keep')
      };
      scope.iitems = [];
      scope.items = data;
      scope.action = action;

    }])

  .controller('formCharge', [
    '$scope', '$modalInstance', 'payment_id', 'horizon.openstack-service-api.chakra',
    'horizon.framework.widgets.toast.service',
    function(scope, modalInstance, data, chakraAPI, toastService) {

      var action = {
        submit: function(data) { modalInstance.close(data);},
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      scope.payment_id = data;
      scope.action = action;


      scope.reloadPay = function(payment_id){
          chakraAPI.getPayment(payment_id).success(function(data){
          action.submit(data.items[0]);
          var pay_at = data.items[0].pay_at;
          var amount = data.items[0].amount;
          var status = data.items[0].trade_success;
          if (status){
              var message = gettext("Successful Payment") + ":  " + amount + "￥ " + pay_at;
              toastService.add('success',message);
          }else{
              var message = gettext("Failure Payment") + ":  " + amount + "￥ " + pay_at;
              toastService.add('error',message);
          }
         });
      };
    }]);

})();