/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('billingDeleteFixAction', ['horizon.openstack-service-api.billing', 'horizon.framework.widgets.modal.service',
  function(billingAPI, smodal) {

    var context = {
      title: gettext('Delete Price Fixing'),
      message: gettext('The amount of price fixings these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Price Fixing'),
      success: gettext('Deleted Price Fixing: %s.'),
      error: gettext('Deleted Price Fixing: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.deletenums = function(selected){
        var ids = [];
        angular.forEach(selected, function(item) {
            if (!item.is_applied){
               ids.push(item.id);
            }
        });
        return ids.length;
      };

      self.batchDelete = function(selected) {
        var ids = [], fixings = [];
        angular.forEach(selected, function(item) {
            if (!item.is_applied){
               ids.push(item.id);
               //fixings.push('"'+ item.description +'"');
               fixings.push({
                id: item.id,
                name: item.description
              });
            }
        });
        self.confirmDelete(ids, fixings, selected);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, fixings, selected) {
        var fixinglist = fixings.attrsOfAll('name').join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [fixings.length]),
          submit: context.submit,
          name: fixings,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, fixinglist, selected);
        });
      };

      // on success, remove the fixings from the model
      // need to also remove deleted fixings from selected list
      self.submit = function(ids, fixinglist, selected) {
          for(var n=0; n<ids.length; n++){
          billingAPI.deletePriceFixing(ids[n])
          .success(function() {
            // iterating backwards so we can splice while looping
            for (var i = scope.fixPrices.length - 1; i >= 0; i--) {
              var fix = scope.fixPrices[i];
              for (var k = 0; k  < ids.length; k++) {
                if (fix.id === ids[k]) {
                  scope.fixPrices.splice(i, 1);
                  selected.removeId(fix.id);
                  break;
                }
              }
            }
            scope.disableFix = false;
          })
          .error(function() {
          });
          }
      };
    }

    return action;

  }]);

})();
