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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit domain modal dialog.
   * On submit, edit domain and display a success message.
   * On cancel, do nothing.
   */
  .factory('editDomainAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
          'horizon.framework.widgets.toast.service',
  function(keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Domain'),
      submit:  gettext('Save'),
      success: gettext('Domain %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'form',
        controller: 'domainformCtrl',
        backdrop:		backDrop,
        resolve: {
          domain: function(){ return null; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        },
        windowClass: 'projectsListContent'
      };

      // open up the edit form
      self.open = function(domain) {
        var clone = angular.copy(domain[0]);
        option.resolve.domain = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(domain[0], clone);
        });
      };

      // edit form modifies name and description
      // send only what is required
      self.clean = function(domain) {
        return {
          id: domain.id,
          name: domain.name,
          description: domain.description,
        };
      };

      // submit this action to api
      // and update domain object on success
      self.submit = function(domain, clone) {
        var cleanedDomain = self.clean(clone);
        keystoneAPI.editDomain(cleanedDomain)
          .success(function() {
            var message = interpolate(context.success, [cleanedDomain.name]);
            toastService.add('success', message);
            angular.extend(domain, clone);
            scope.clearSelected();
          });
      };
    }

    return action;
  }]);

})();