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

  angular.module('hz.dashboard.project.keypairs')

  /**
   * @ngDoc createAction
   * @ngService
   *
   */
  .factory('createKeyPairAction',
      ['horizon.openstack-service-api.nova',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       '$modal',
       'backDrop',
       'horizon.framework.widgets.toast.service',
  function(novaAPI, usersettingAPI, keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create KeyPair'),
      submit:  gettext('Create'),
      success: gettext('KeyPair %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'formKeyPairCtroller',
        backdrop: backDrop,
        windowClass: 'RowContent',
        resolve: {
          test: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(keypair) {
        novaAPI.createKeypair(keypair)
          .success(function(response) {
            modal.open(
            {
              templateUrl: 'newkeypair',
              controller: 'formKeyPairCtroller',
              backdrop: backDrop,
              windowClass: 'newKeyPair',
              resolve: {
                test: function(){ return response; },
                context: function(){ return context; }
              }
             }
            );
            response.id = response.fingerprint;
            scope.keypairs.push(response);
            var message = interpolate(context.success, [response.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();