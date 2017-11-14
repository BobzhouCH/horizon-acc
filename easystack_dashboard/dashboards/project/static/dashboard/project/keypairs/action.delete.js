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

  angular.module('hz.dashboard.project.keypairs')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('deleteKeyPairAction',
      ['horizon.openstack-service-api.nova',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(novaAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete KeyPair'),
      message: gettext('The amount of keypairs these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete KeyPair'),
      success: gettext('Deleted KeyPair: %s.'),
      error: gettext('Deleted KeyPair: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single keypair object
      self.singleDelete = function(keypair) {
        self.confirmDelete([keypair.name], [keypair.name]);
      };

      // delete selected keypair objects
      // action requires the keypair to select rows
      self.batchDelete = function() {
        var ids = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ids.push(row.item.name);
              names.push(row.item);
            }
        });
        self.confirmDelete(ids, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, names) {
        var namelist = names.attrsOfAll('name').join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, namelist);
        });
      };

      // on success, remove the keypairs from the model
      // need to also remove deleted keypairs from selected list
      self.submit = function(ids, namelist) {
         for(var n=0; n<ids.length; n++){
          novaAPI.deleteKeypair(ids[n])
          .success(function() {
            var message = interpolate(context.success, [namelist]);
            toastService.add('success', message);
            // iterating backwards so we can splice while looping
            for (var i = scope.keypairs.length - 1; i >= 0; i--) {
              var keypair = scope.keypairs[i];
              for (var k = 0; k  < ids.length; k++) {
                if (keypair.name === ids[k]) {
                  scope.keypairs.splice(i, 1);
                  delete scope.selected[keypair.id];
                  break;
                }
              }
            }
          })
          .error(function() {
            var message = interpolate(context.error, [namelist]);
            toastService.add('error', message);
          });
          }
      };
    }

    return action;

  }]);

})();