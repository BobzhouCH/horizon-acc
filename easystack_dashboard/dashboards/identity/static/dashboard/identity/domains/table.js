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
   * @ngdoc identityDomainsCtrl
   * @ngController
   *
   * @description
   * Controller for the identity domains table.
   * Serve as the focal point for table actions.
   */
  .controller('identityDomainsCtrl', [
    '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.keystone',
    'horizon.framework.widgets.toast.service', 'horizon.openstack-service-api.settings', 'createDomainAction', 'deleteDomainAction','editDomainQuotaAction',
    'editDomainAction', 'enableDomainAction', 'editDomainUsersAction',
    function(
      scope, PolicyService, keystoneAPI, toastService, settingsAPI, CreateAction, DeleteAction,
      EditQuota,EditAction, EnableAction, EditDomainUsersAction) {
    var self = this;
    scope.context = {
      header: {
        name: gettext('Name'),
        description: gettext('Description'),
        domain_id: gettext('Domain ID'),
        enabled: gettext('Enabled')
      },
      action: {
      },
      error: {
        api: gettext('Unable to retrieve domains'),
        priviledge: gettext('Insufficient privilege level to view domain information.'),
      }
    };
    this.clearSelected = function(){
        scope.checked = {};
        return scope.$table && scope.$table.resetSelected();
    };
    this.reset = function() {
      scope.domains = [];
      scope.idomains = [];
      scope.checked = {};
      scope.selected = {};
      if(scope.selectedData)
          scope.selectedData.aData = [];
      self.clearSelected();
      toastService.clearAll();
    };
    this.init = function(){
      scope.clearSelected = self.clearSelected;
      scope.actions = {
        create: new CreateAction(scope),
        delete: new DeleteAction(scope),
        editquota: new EditQuota(scope),
        edit: new EditAction(scope),
        enable: new EnableAction(scope),
        editUsers: new EditDomainUsersAction(scope),
        refresh: self.refresh,
      };
      self.refresh();
      scope.domain_quota_enabled = false;
      scope.limitDomainQuotaEdit();
    };
    //restrict delete action if domain is enabled.
    scope.limitOperation = function(domain) {
      if (domain.enabled) {
        return true;
      }
      return false;
    };
    //this is to achieve if domainquota enabled
    scope.limitDomainQuotaEdit = function(){
      settingsAPI.getSetting('DOMAIN_QUOTA_ENABLED', false).then(
        function(data){
          if(data){
            scope.domain_quota_enabled = true;
          }
        }
      );

    }
    scope.canNotDeleted = function(domains) {
      for (var i=0; i<domains.length; i++) {
        if (scope.limitOperation(domains[i])){
          return true;
        }
      }
      return false;
    };
    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(){
        self.reset();
       PolicyService.check({ rules: [['identity', 'identity:list_domains']] })
        .success(function(response) {
          if (response.allowed){
              keystoneAPI.getDomains()
              .success(function(response) {
                  for(var i=0;i<response.items.length;i++){
                    if(response.items[i].name != 'heat_domain'){
                        scope.domains.push(response.items[i]);
                    }
                  }
              });
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });
    };

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Description'),
      name: 'description',
      singleton: true
    }, {
      label: gettext('Domain ID'),
      name: 'id',
      singleton: true
    }, {
      label: gettext('Enabled'),
      name: 'enabled',
      singleton: true,
      options: [
        { label: gettext('true'), key: 'true' },
        { label: gettext('false'), key: 'false' }
      ]
    }];

    this.init();

  }]);

})();