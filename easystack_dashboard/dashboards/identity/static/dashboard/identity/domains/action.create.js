/**
 * Copyright 2015 EasyStack Inc.
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

  angular.module('hz.dashboard.identity.domains')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create domain modal dialog.
   * On submit, create a new domain and display a success message.
   * On cancel, do nothing.
   */
  .factory('createDomainAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
          'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.chakra', '$rootScope',
  function(keystoneAPI, modal, backDrop, toastService, chakraAPI, rootScope) {

    var context = {
      mode: 'create',
      title: gettext('Create Domain'),
      submit:  gettext('Create'),
      success: gettext('Domain %s was successfully created.'),
      billing_success: gettext('Billing account %s was successfully created.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'form',
        controller: 'domainformCtrl',
        backdrop: backDrop,
        windowClass: 'projectsListContent',
        resolve: {
          domain: function(){ return {}; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newDomain) {
        keystoneAPI.createDomain(newDomain).success(function(response){
          scope.domains.splice(0, 0, response);
          var message = interpolate(context.success, [newDomain.name]);
          toastService.add('success', message);
          if (rootScope.rootblock.billing_enable){
            var params = {"balance": 0, "ref_resource": response.id, "name": response.name};
            chakraAPI.createAccount(params).success(function(response){
              var message = interpolate(context.billing_success, [response.items[0].name]);
              toastService.add('success', message);
            });
          }
        });
      };
    }

    return action;
  }]);

})();