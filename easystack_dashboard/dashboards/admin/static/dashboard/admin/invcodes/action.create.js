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
   * @ngDoc createAction
   * @ngService
   *
   */
  .factory('createInvCodeAction', ['horizon.openstack-service-api.chakra',
      '$modal', '$rootScope', 'backDrop', 'horizon.framework.widgets.toast.service',
  function(chakraAPI, modal, rootScope, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create Invitation Codes'),
      submit:  gettext('Create'),
      success: gettext('Invitation Codes %s was successfully created.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'formInvCodeController',
        backdrop:		backDrop,
        windowClass: 'RowContent',
        resolve: {
          context: function(){ return context; },
          enable_billing: function(){return scope.enable_billing;}
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(invcode) {
         invcode.expired = rootScope.rootblock.local_to_utc(invcode.expired);
         chakraAPI.createInvCodes(invcode)
         .success(function(data){
             var message;
             for (var i=0; i<data.items.length; i++){
               data.items[i].expired = rootScope.rootblock.utc_to_local(data.items[i].expired);
               data.items[i].create_at = rootScope.rootblock.utc_to_local(data.items[i].create_at);
               scope.invcodes.push(data.items[i]);
               message = interpolate(context.success, [data.items[i].invcode]);
               toastService.add('success', message);
             }
         });
      };
    }

    return action;
  }]);

})();
