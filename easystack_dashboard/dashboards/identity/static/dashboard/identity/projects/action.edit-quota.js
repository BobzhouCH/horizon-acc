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
  .factory('editProjectQuotaAction', ['horizon.openstack-service-api.keystone',
                                      'horizon.openstack-service-api.usersettings',
                                      'horizon.openstack-service-api.settings',
                                      '$modal', 'backDrop',
                                      'horizon.framework.widgets.modal.service',
                                      'horizon.framework.widgets.toast.service',
                                      '$q',
                                      'horizon.framework.util.q.extensions',
                                      'projectQuotaService',
  function(keystoneAPI, usersettingsAPI, settingsAPI, modal, backDrop, smodal,
   toastService , $q,qExtenstions, projectQuotaService) {

    var context = {
      mode: 'editquota',
      title: gettext('Edit Project Quota'),
      submit:  gettext('Save'),
      success: gettext('Project %s Quota has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'quota-form',
        controller: 'projectQuotaEditFormCtrl',
        backdrop: backDrop,
        resolve: {
          project: function(){ return null; },
          context: function(){ return context; },
          _scope: function(){return scope;},
        },
        windowClass: 'projectsQuotaContent lg-window'
      };

      // open up the edit form
      self.open = function(project) {
        var clone = angular.copy(project[0]);
        option.resolve.project = function(){ return clone; };
        modal.open(option).result.then(function(formData){
          self.submit(project[0], formData);
        });
      };


      // submit this action to api
      // and update project object on success
      self.submit = function(project, formData) {
         var projectQuota = formData.projectQuota;
         var domain_quota_enabled = formData.domain_quota_enabled;
         projectQuotaService.updateProjectQuota(project, projectQuota, function(){
         scope.$table && scope.$table.resetSelected();
      });

      };
    }

    return action;
  }]);

})();
