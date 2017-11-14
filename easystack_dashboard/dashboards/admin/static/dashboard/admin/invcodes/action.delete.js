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

  angular.module('hz.dashboard.admin.invcodes')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('deleteInvCodeAction', ['horizon.openstack-service-api.chakra',
          'horizon.framework.widgets.modal.service','horizon.framework.widgets.toast.service',
  function(chakraAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Invitation Code'),
      message: gettext('The amount of invitation codes these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Invitation Code'),
      success: gettext('Deleted Invitation Code: %s.'),
      error: gettext('Deleted Invitation Code: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function() {
        var ids = [], invcodes = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ids.push(row.item.id);
              //invcodes.push('"'+ row.item.invcode +'"');
              invcodes.push({
                id: row.item.id,
                name: row.item.invcode
              });
            }
        });
        self.confirmDelete(ids, invcodes);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, invcodes) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [invcodes.length]),
          submit: context.submit,
          name: invcodes,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids);
        });
      };

      // on success, remove the invcodes from the model
      // need to also remove deleted invcodes from selected list
      self.submit = function(ids) {
       for(var n=0; n<ids.length; n++){
        chakraAPI.deleteInvCodes(ids[n])
          .success(function() {
            // iterating backwards so we can splice while looping
            for (var i = scope.invcodes.length - 1; i >= 0; i--) {
              var invcode = scope.invcodes[i];
              for (var k = 0; k  < ids.length; k++) {
                if (invcode.id === ids[k]) {
                  scope.invcodes.splice(i, 1);
                  delete scope.selected[invcode.id];
                  scope.numSelected --;
                  console.log(invcode,invcode.invcode);
                  var message = interpolate(context.success, [invcode.invcode]);
                  toastService.add('success', message);
                  break;
                }
              }
            }
          })
          .error(function() {
          });
    	  }
      };
    }

    return action;

  }]);

})();