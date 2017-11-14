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
(function () {
  'use strict';

  angular
  .module('horizon.openstack-service-api')
  .service('horizon.openstack-service-api.usersettings', UserSettingsAPI);

  UserSettingsAPI.$inject = ['horizon.framework.util.http.service',
                       'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.UserSettingsAPI
   * @description Provides direct access to UserSetting APIs.
   */
  function UserSettingsAPI(apiService, toastService) {

    // set Lang
    this.setLanguage = function(lang) {
      return apiService.post('/api/language/', lang)
        .error(function () {
          toastService.add('error', gettext('Unable to set the language.'));
        });
    };
    // get Lang
    this.getLanguage = function() {
      return apiService.get('/api/language/')
        .error(function () {
          toastService.add('error', gettext('Unable to get the language.'));
        });
    };
    // Quotas
    this.getDomainQuota = function(domainId, params) {
      var config = (params) ? { 'params' : params} : {};
      return apiService.get('/api/usage/domainquota/' + domainId, config)
        .error(function () {
          toastService.add('error', gettext('Unable to get the Quotas.'));
      });
    };
    // Quotas
    this.getDomainRemainQuota = function(domainId,projectId, params) {
      var config = (params) ? { 'params' : params} : {};
      return apiService.get('/api/usage/domainremainquota/' + domainId+'/'+projectId, config)
        .error(function () {
          toastService.add('error', gettext('Unable to get the Quotas.'));
      });
    };
    // Quotas
    this.getProjectQuota = function(projectId, params) {
      var config = (params) ? { 'params' : params} : {};
      return apiService.get('/api/usage/projectquota/' + projectId, config)
        .error(function () {
          toastService.add('error', gettext('Unable to get the Quotas.'));
      });
    };
    //ComponentQuota
    this.getComponentQuota = function(projectId, params) {
      var config = (params) ? { 'params' : params} : {};
      return apiService.get('/api/usage/componentquota/' + projectId, config)
        .error(function () {
          toastService.add('error', gettext('Unable to get the Quotas.'));
      });
    };
    //Get overview nova usage information, overview table
    this.getAdminNovaUsage = function() {
      return apiService.get('/api/nova/usage/')
        .error(function () {
          toastService.add('error', gettext('Unable to get the admin Nova usage.'));
        });
    };
    //get overview hardware usage information, overview table
    this.getAdminHardwareUsage = function() {
           return apiService.get('/api/usage/adminhardwareusage/')
              .error(function () {
               toastService.add('error', gettext('Unable to get the hardware usage.'));
               });
       };
        //get overview hardware usage information
    this.getAdminVirtualUsage = function() {
           return apiService.get('/api/usage/adminvirtualusage/')
              .error(function () {
               toastService.add('error', gettext('Unable to get the virtual usage.'));
               });
       };
       
       // Update nova quota
       this.updatenovaquota = function(project_id, new_quota) {
         return apiService.post('/api/usage/projectquota/' +project_id+ '/updatenovaquota', new_quota)
           .error(function (message, status) {
           if(status == 400 && message.indexOf('Quota limit') >= 0){
             toastService.add('error', gettext('Quota limit for RAM,Cores,Instances,Keypairs must be greater than or equal to already used and reserved.'));
           }else{
             toastService.add('error', gettext('Unable to update RAM,Cores,Instances,Keypairs quota.'));
           }
           });
       };
       // Update cinder quota
       this.updatecinderquota = function(project_id, new_quota) {
         return apiService.post('/api/usage/projectquota/' +project_id+ '/updatecinderquota', new_quota)
           .error(function (message, status) {
           	toastService.add('error', gettext('Unable to update Volumes,Volume Snapshots,Volume TotalSize quota.'));
           });
       };
       // Update neutron quota
       this.updateneutronquota = function(project_id, new_quota) {
         return apiService.post('/api/usage/projectquota/' +project_id+ '/updateneutronquota', new_quota)
           .error(function () {
           	toastService.add('error', gettext('Unable to update Floating IPs,Networks,Subnets,Routers,Security Groups quota.'));
           });
       };
              // Update nova quota
       this.updateDomainQuota = function(domain_id, new_quota) {
         return apiService.post('/api/usage/domainquota/' +domain_id+ '/updatedomainquota', new_quota)
           .error(function () {
           	toastService.add('error', gettext('Unable to update domain quotas.'));
           });
       };
       // Update manila quota
       this.updatemanilaquota = function(project_id, new_quota) {
         return apiService.post('/api/usage/projectquota/' +project_id+ '/updatemanilaquota', new_quota)
           .error(function () {
             toastService.add('error', gettext('Unable to update Shared Files,Shared File Size,Shared File Snapshots,Shared File Networks quota.'));
           });
       };
       // get notice info
       this.getNotice = function() {
         return apiService.get('/api/notice/')
           .error(function () {
             toastService.add('error', gettext('Unable to get notice.'));
           });
       };
       // update notice info
       this.updateNotice = function(newinfo) {
         return apiService.post('/api/notice/', newinfo)
           .error(function () {
             toastService.add('error', gettext('Unable to update notice.'));
           });
       };
  }
}());
