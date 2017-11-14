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
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete domain confirmation modal dialog.
   * On submit, delete selected domains.
   * On cancel, do nothing.
   */
  .factory('deleteDomainAction', ['horizon.openstack-service-api.keystone', 'horizon.framework.widgets.modal.service',
    'horizon.framework.widgets.toast.service',
  function(keystoneAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Domain'),
      message: gettext('The amount of domains these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. Delete domain action cannot be undone.'),
      submit: gettext('Delete Domain'),
      success: gettext('Deleted domains: %s.'),
      error: gettext('Failed to delete domain: %s.'),
    };

    var cannotDeleteDomainContext = {
      title: gettext('Cannot delete domain'),
      message: gettext('You cannot delete selected domain %s yet.'),
      tips: gettext('You must delete all the projects and users which belong to this domain before you delete this domain.'),
      submit: gettext('I know')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single domain object
      self.singleDelete = function(domain) {
        self.confirmDelete([domain.id], [domain.name]);
      };

      // delete selected domain objects
      // action requires the domain to select rows
      self.batchDelete = function() {
        var domains = [], names = [];
        angular.forEach(scope.selected, function(row) {
          if (row.checked){
            domains.push(row.item);
            names.push('"'+ row.item.name +'"');
          }
        });
        self.confirmDelete(domains, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(domains, names) {
        var namelist = names.join(', ');
        keystoneAPI.getDomainUsers(domains[0].id)
          .success(function(response){
            if(response.items.length === 0){
              keystoneAPI.getProjects({domain_id: domains[0].id})
                .success(function(response){
                  if(response.items.length === 0){
                    var options = {
                      title: context.title,
                      tips: context.tips,
                      body: interpolate(context.message, [names.length]),
                      submit: context.submit,
                      name: domains,
                      imgOwner: 'noicon'
                    };
                    smodal.modal(options).result.then(function(){
                      self.deleteDomains(domains);
                    });
                  }else{
                    var options = {
                      title: cannotDeleteDomainContext.title,
                      tips: cannotDeleteDomainContext.tips,
                      body: interpolate(cannotDeleteDomainContext.message, [namelist]),
                      submit: cannotDeleteDomainContext.submit
                    };
                    smodal.modal(options);
                  }
                })
                .error(function(err) {
                  var message = interpolate(context.error, [domain.name]);
                  toastService.add('error', message + err);
                });
            }else{
              var options = {
                title: cannotDeleteDomainContext.title,
                tips: cannotDeleteDomainContext.tips,
                body: interpolate(cannotDeleteDomainContext.message, [namelist]),
                submit: cannotDeleteDomainContext.submit
              };
              smodal.modal(options);
            }
          })
          .error(function(err) {
            var message = interpolate(context.error, [domain.name]);
            toastService.add('error', message + err);
          });
        };

      // on success, remove the domain from the model
      // need to also remove deleted domains from selected list
      self.deleteDomains = function(domains) {
        for(var i = 0; i < domains.length; i++){
          self.deleteDomain(domains[i]);
        }
      };

      self.deleteDomain = function(domain) {
        keystoneAPI.deleteDomain(domain.id)
          .success(function() {
            scope.domains.removeId(domain.id);
            scope.$table.resetSelected();
            var message = interpolate(context.success, [domain.name]);
            toastService.add('success', message);
            scope.clearSelected();
          })
          .error(function(err) {
            var message = interpolate(context.error, [domain.name]);
            toastService.add('error', message + err);
            scope.clearSelected();
          });
      };
    }

    return action;

  }]);

})();