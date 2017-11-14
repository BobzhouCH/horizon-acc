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

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.manila', ManilaAPI);

  ManilaAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.nova
   * @description Provides access to Nova APIs.
   */
  function ManilaAPI(apiService, toastService) {
    this.getTenantAbsoluteLimits = function() {
      return apiService.get('/api/manila/limits/').error(function() {
        toastService.add('error', gettext('Unable to retrieve limits.'));
      });
    };

    this.getShares = function(params) {
      var config = (params) ? {'params': params} : {};
      return apiService.get('/api/manila/shares/', config).error(function() {
        toastService.add('error', gettext('Unable to retrieve shares.'));
      });
    };

    this.createShare = function(share) {
      return apiService.post('/api/manila/shares/', share).error(function() {
        toastService.add('error', gettext('Unable to create share.'));
      });
    };
    this.getFreshShare = function(id) {
      return apiService.get('/api/manila/share/' + id);
    };
    this.getShare = function(id) {
      return apiService.get('/api/manila/share/' + id).error(function() {
        toastService.add('error', gettext('Unable to retrieve share.'));
      });
    };

    this.deleteShare = function(share_id) {
      return apiService.delete('/api/manila/share/' + share_id).error(function() {
        toastService.add('error', gettext('Unable to delete share.'));
      });
    };

    this.updateShare = function(share) {
      return apiService.patch('/api/manila/share/' + share.id, share).error(function() {
        toastService.add('error', gettext('Unable to update share.'));
      });
    };

    this.getShareRules = function(share_id) {
      return apiService.get('/api/manila/share/' + share_id + '/rules').error(function() {
        toastService.add('error', gettext('Unable to get share rules.'));
      });
    };

    this.shareAllow = function(share_id, access_type, access_to, access_level) {
      return apiService.post('/api/manila/shares/' + share_id + '/allow/', {
        access_type: access_type,
        access_to: access_to,
        access_level: access_level
      }).error(function() {
        toastService.add('error', gettext('Unable to allow share.'));
      });
    };

    this.shareDeny = function(share_id, rule_id) {
      return apiService.post('/api/manila/shares/' + share_id + '/deny/', {
        rule_id: rule_id,
      }).error(function() {
        toastService.add('error', gettext('Unable to deny share.'));
      });
    };

    this.shareManage = function(share_id, service_host, protocol, export_path, params) {
      return apiService.post('/api/manila/share/' + share_id + '/manage/',
          angular.extend({}, params || {}, {
            service_host: service_host,
            protocol: protocol,
            export_path: export_path
          })).error(function() {
        toastService.add('error', gettext('Unable to manage share.'));
      });
    };

    this.shareUnmanage = function(share_id) {
      return apiService.post('/api/manila/share/unmanage/', {
        id: share_id
      }).error(function() {
        toastService.add('error', gettext('Unable to unmanage share.'));
      });
    };

    this.shareExtend = function(share_id, new_size) {
      return apiService.post('/api/manila/share/' + share_id + '/extend', {
        new_size: new_size
      }).error(function() {
        toastService.add('error', gettext('Unable to extend share.'));
      });
    };

    this.shareShrink = function(share_id, new_size) {
      return apiService.post('/api/manila/share/' + share_id + '/shrink', {
        new_size: new_size
      }).error(function() {
        toastService.add('error', gettext('Unable to shrink share.'));
      });
    };

    this.getShareSnapshots = function() {
      return apiService.get('/api/manila/share_snapshots/').error(function() {
        toastService.add('error', gettext('Unable to retrieve share snapshots.'));
      });
    };

    this.getShareSnapshot = function(snapshot_id) {
      return apiService.get('/api/manila/share_snapshot/' + snapshot_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve share snapshot.'));
      });
    };

    this.createShareSnapshot = function(snapshot) {
      return apiService.post('/api/manila/share_snapshots/', snapshot).error(function() {
        toastService.add('error', gettext('Unable to create share snapshot.'));
      });
    };

    this.refreshShareSnapshot = function(snapshot_id) {
      return apiService.get('/api/manila/share_snapshot/' + snapshot_id);
    };

    this.updateShareSnapshot = function(snapshot_id, new_snapshot) {
      return apiService.patch('/api/manila/share_snapshot/' + snapshot_id, new_snapshot).error(function() {
        toastService.add('error', gettext('Unable to update share snapshot.'));
      });
    };

    this.deleteShareSnapshot = function(snapshot_id) {
      return apiService.delete('/api/manila/share_snapshot/' + snapshot_id).error(function() {
        toastService.add('error', gettext('Unable to delete share snapshot.'));
      });
    };

    this.getShareServers = function() {
      return apiService.get('/api/manila/share_servers/').error(function() {
        toastService.add('error', gettext('Unable to retrieve share servers.'));
      });
    };

    this.getShareServer = function(server_id) {
      return apiService.get('/api/manila/share_server/' + server_id).error(function() {
        toastService.add('error', gettext('Unable to get share server.'));
      });
    };

    this.deleteShareServer = function(server_id) {
      return apiService.delete('/api/manila/share_server/' + server_id).error(function() {
        toastService.add('error', gettext('Unable to delete share server.'));
      });
    };

    this.getShareNetworks = function(params) {
      var config = (params) ? {'params': params} : {};
      return apiService.get('/api/manila/share_networks/', config).error(function() {
        toastService.add('error', gettext('Unable to retrieve share networks.'));
      });
    };

    this.getShareNetwork = function(network_id) {
      return apiService.get('/api/manila/share_network/' + network_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve share network.'));
      });
    };

    this.createShareNetwork = function(network) {
      return apiService.post('/api/manila/share_networks/', network).error(function() {
        toastService.add('error', gettext('Unable to create share network.'));
      });
    };

    this.updateShareNetwork = function(network) {
      return apiService.patch('/api/manila/share_network/' + network.id, network).error(function() {
        toastService.add('error', gettext('Unable to update share network.'));
      });
    };

    this.deleteShareNetwork = function(network_id) {
      return apiService.delete('/api/manila/share_network/' + network_id).error(function() {
        toastService.add('error', gettext('Unable to delete share network.'));
      });
    };

    this.getSecurityServices = function() {
      return apiService.get('/api/manila/security_services/').error(function() {
        toastService.add('error', gettext('Unable to get security services.'));
      });
    };

    this.getSecurityService = function(service_id){
      return apiService.get('/api/manila/security_service/' + service_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve security services.'));
      });
    };

    this.createSecurityService = function(service) {
      return apiService.post('/api/manila/security_service/', service).error(function() {
        toastService.add('error', gettext('Unable to create security service.'));
      });
    };

    this.updateSecurityService = function(service_id, new_service) {
      return apiService.patch('/api/manila/security_service/' + service_id, new_service).error(function() {
        toastService.add('error', gettext('Unable to update security service.'));
      });
    };

    this.deleteSecurityService = function(service_id) {
      return apiService.delete('/api/manila/security_service/' + service_id).error(function() {
        toastService.add('error', gettext('Unable to update security service.'));
      });
    };

    this.getShareNetworkSecurityServices = function(network_id) {
      return apiService.get('/api/manila/share_network/' + network_id + '/security_services/').error(function() {
        toastService.add('error', gettext('Unable to retrieve security services.'));
      });
    };

    this.createShareNetworkSecurityServices = function(share_network_id, security_service_id) {
      return apiService.post('/api/manila/security_service/', {
        share_network_id: share_network_id,
        security_service_id: security_service_id
      }).error(function() {
        toastService.add('error', gettext('Unable to create security service.'));
      });
    };

    this.deleteShareNetworkSecurityServices = function(share_network_id, security_service_id) {
      return apiService.delete('/api/manila/security_service/', {
        share_network_id: share_network_id,
        security_service_id: security_service_id
      }).error(function() {
        toastService.add('error', gettext('Unable to delete security service.'));
      });
    };

    this.setShareMetadata = function(share_id, metadataList) {
      return apiService.post('/api/manila/share/' + share_id + '/metadata/', metadataList).error(function() {
        toastService.add('error', gettext('Unable to add share metadata.'));
      });
    };

    this.deleteShareMetadata = function(share_id, metadataList) {
      return apiService.delete('/api/manila/share/' + share_id + '/metadata/', metadataList).error(function() {
        toastService.add('error', gettext('Unable to delete share metadata.'));
      });
    };

    this.getTenantQuota = function(tenant_id) {
      return apiService.get('/api/manila/tenant/' + tenant_id + '/quota/').error(function() {
        toastService.add('error', gettext('Unable to get tenant quota.'));
      });
    };

    this.getLimits = function() {
      return apiService.get('/api/manila/limits/').error(function() {
        toastService.add('error', gettext('Unable to get tenant quota.'));
      });
    };

    this.updateTenantQuota = function(tenant_id, quota) {
      return apiService.patch('/api/manila/tenant/' + tenant_id + '/quota/', quota).error(function() {
        toastService.add('error', gettext('Unable to update tenant quota.'));
      });
    };

    this.getDefaultQuota = function(tenant_id) {
      return apiService.get('/api/manila/tenant/' + tenant_id + '/default_quota/').error(function() {
        toastService.add('error', gettext('Unable to get default tenant quota.'));
      });
    };

    this.updateDefaultQuota = function(tenant_id, quota) {
      return apiService.patch('/api/manila/tenant/' + tenant_id + '/default_quota/', quota).error(function() {
        toastService.add('error', gettext('Unable to update default tenant quota.'));
      });
    };

    this.getShareTypes = function() {
      return apiService.get('/api/manila/share_types/').error(function() {
        toastService.add('error', gettext('Unable to get share types.'));
      });
    };

    this.getShareType = function(share_type_id){
      return apiService.get('/api/manila/share_type/' + share_type_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve share type.'));
      });
    };

    this.createShareType = function(share_type) {
      return apiService.post('/api/manila/share_type/', share_type).error(function() {
        toastService.add('error', gettext('Unable to create share type.'));
      });
    };

    this.updateShareType = function(share_type_id, new_share_type) {
      return apiService.patch('/api/manila/share_type/' + share_type_id, new_share_type).error(function() {
        toastService.add('error', gettext('Unable to update share type.'));
      });
    };

    this.deleteShareType = function(share_type_id) {
      return apiService.delete('/api/manila/share_type/' + share_type_id).error(function() {
        toastService.add('error', gettext('Unable to update share type.'));
      });
    };

    this.getShareTypeExtraSpecs = function(share_type_id) {
      return apiService.get('/api/manila/share_type/' + share_type_id + '/extra_specs/').error(function() {
        toastService.add('error', gettext('Unable to get share type extra specs.'));
      });
    };

    this.createShareTypeExtraSpecs = function(share_type_id, specs) {
      return apiService.post('/api/manila/share_type/', share_type_id + '/extra_specs/', specs).error(function() {
        toastService.add('error', gettext('Unable to create share type.'));
      });
    };

    this.deleteShareTypeExtraSpecs = function(share_type_id) {
      return apiService.delete('/api/manila/share_type/' + share_type_id + '/extra_spacs/', spec_keys).error(function() {
        toastService.add('error', gettext('Unable to delete share type extra specs.'));
      });
    };

    this.getShareTypeAccess = function(share_type_id) {
      return apiService.get('/api/manila/share_type/' + share_type_id + '/access/').error(function() {
        toastService.add('error', gettext('Unable to get share type access.'));
      });
    };

    this.addShareTypeAccess = function(share_type_id, project_id) {
      return apiService.post('/api/manila/share_type/', share_type_id + '/access/', {
        project_id: project_id
      }).error(function() {
        toastService.add('error', gettext('Unable to create share type.'));
      });
    };

    this.removeShareTypeExtraSpecs = function(share_type_id, project_id) {
      return apiService.delete('/api/manila/share_type/' + share_type_id + '/access/', {
        project_id: project_id
      }).error(function() {
        toastService.add('error', gettext('Unable to delete share type extra specs.'));
      });
    };
  }
}());
