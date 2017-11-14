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

  angular.module('hz.dashboard.identity.projects')

  /**
   * @ngDoc editProjectQuotaAction
   * @ngService
   *
   * @Description
   * Brings up the edit project quota modal dialog.
   * On submit, edit project and display a success message.
   * On cancel, do nothing.
   */
  .factory('editDomainQuotaAction', ['horizon.openstack-service-api.keystone',
                                      'horizon.openstack-service-api.usersettings',
                                      'horizon.openstack-service-api.settings',
                                      '$modal', 'backDrop',
                                      'horizon.framework.widgets.modal.service',
                                      'horizon.framework.widgets.toast.service',
                                      '$q',
                                      'horizon.framework.util.q.extensions',
  function(keystoneAPI, usersettingsAPI, settingsAPI, modal, backDrop, smodal, toastService , $q,qExtenstions) {

    var context = {
      mode: 'editquota',
      title: gettext('Edit Domain Quota'),
      submit:  gettext('Save'),
      success: gettext('Domain %s Quota has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'quota-form',
        controller: 'domainQuotaFormCtrl',
        backdrop: backDrop,
        resolve: {
          domain: function(){ return null; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        },
        windowClass: 'projectsQuotaContent lg-window'
      };

      // open up the edit form
      self.open = function(domain) {
        var clone = angular.copy(domain[0]);
        option.resolve.domain = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(domain[0], clone);
        });
      };

    function cleanData(srcObj, fields, toObj){
        if (!angular.isArray(fields)){
            return ;
        }
        for (var i=0; i<=fields.length; i++){
            if (srcObj[fields[i]]) {
                toObj[fields[i]] = srcObj[fields[i]].value;
            }
        }
    }
      self.domainQuotaClean = function(domainQuota){
        var quotas = {};
        var novaFields = ['ram', 'cores', 'instances', 'key_pairs'];
        cleanData(domainQuota.novaquota, novaFields, quotas);

        var cinderFields = ['volumes', 'volume_snapshots', 'volume_gigabytes', 'backups', 'backup_gigabytes'];
        cleanData(domainQuota.cinderquota, cinderFields, quotas);

        var neutronFields = ['floatingip', 'network', 'subnet', 'router', 'security_group', 'healthmonitor',
            'listener', 'loadbalancer', 'pool', 'port'];
        cleanData(domainQuota.neutronquota, neutronFields, quotas);

        var manilaFields = ['shares', 'share_gigabytes', 'share_snapshots', 'share_networks'];
        cleanData(domainQuota.manilaquota, manilaFields, quotas);

      return quotas;
      };
      // submit this action to api
      // and update domain object on success
      self.submit = function(domain, domainQuota) {
        var cleanedDomainQuota =self.domainQuotaClean(domainQuota);
        usersettingsAPI.updateDomainQuota(domain.id, cleanedDomainQuota).then(
          function(data){
            var message = interpolate(context.success, [domain.name]);
            toastService.add('success', message);
            scope.$table && scope.$table.resetSelected();
          }
        );
      };
    }

    return action;
  }]);

})();
