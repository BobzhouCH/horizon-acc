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

  angular.module('hz.dashboard.project.floatingIP')

  /**
   * @ngdoc projectFloatingIPCtrl
   * @ngController
   *
   * @description
   * Controller for the identity floatingIP table.
   * Serve as the focal point for table actions.
   */
  .controller('projectFloatingIPCtrl', [
    '$scope',
    'horizon.openstack-service-api.policy',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.floatingip',
    'allocateFloatingIPAction',
    'releaseFloatingIPAction',
    'updateBandwidthAction',
    'associateInstanceAction',
    'associateFloatingIPRouterAction',
    'disassociateAction',
    'horizon.framework.widgets.toast.service',
    function(
      scope,
      PolicyService, usersettingAPI, keystoneAPI,
      floatingipAPI,
      AllocateAction,
      ReleaseAction,
      UpdateBandwidthAction,
      associateInstanceAction,
      associateRouterAction,
      disassociateAction,
      toastService) {

    var self = this;

    scope.context = {
      header: {
        ip: gettext('IP Address'),
        instance: gettext('Device Name'),
        //begin:jiaozh1:add:2016-12-07:bug:Bugzilla - bug 76437
        instance_type : gettext('Device Type'),
        //end:jiaozh1:add:2016-12-07:bug:Bugzilla - bug 76437
        bandwidth: gettext('Bandwidth (Mbps)'),
        pool: gettext('Floating IP Pool')
      },
      action: {
        allocate: gettext('Apply For IP To Project'),
        release: gettext('Release Floating IPs'),
        bandwidth: gettext('Update Bandwidth')
      },
      error: {
        api: gettext('Unable to retrieve floating ip'),
        priviledge: gettext('Insufficient privilege level to view floatingIP information.')
      }
    };

    scope.deviceType = {
      'Instance': gettext('Instance'),
      'Router': gettext('Router'),
      'Loadbalancer': gettext('Load Balancer')
    };

    scope.filterFacets = [{
      label: gettext('IP Address'),
      name: 'ip',
      singleton: true
    }, {
      label: gettext('Device Name'),
      name: 'instance_name',
      singleton: true
    }, {
      label: gettext('Device Type'),
      name: 'instance_type',
      singleton: true,
      options: [
        { label: scope.deviceType.Instance, key: 'Instance' },
        { label: scope.deviceType.Router, key: 'Router' },
        { label: scope.deviceType.Loadbalancer, key: 'Loadbalancer' }
      ]
    }, {
      label: gettext('Bandwidth (Mbps)'),
      name: 'bandwidth',
      singleton: true
    }, {
      label: gettext('Floating IP Pool'),
      name: 'pool',
      singleton: true
    }];
    this.reset = function(){
      scope.floatingIP = [];
      scope.ifloatingIP = [];
      scope.checked = {};
      scope.selected = {};
      scope.ifloatingIPState = false;
      if(scope.selectedData)
          scope.selectedData.aData = [];

      scope.disableRelease = true;
    };

    this.init = function(){
      scope.actions = {
        refresh: self.refresh,
        allocate: new AllocateAction(scope),
        release: new ReleaseAction(scope),
        bandwidth: new UpdateBandwidthAction(scope),
        associateInst: new associateInstanceAction(scope),
        associateRouter: new associateRouterAction(scope),
        disassociate: new disassociateAction(scope)
      };
      self.refresh();

      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          self.allowMenus(scope.selectedData.aData);
      });
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(){
      scope.disableCreate = false;
      self.reset();
      PolicyService.check({ rules: [['project', '']] })
        .success(function(response) {
          if (response.allowed) {
            floatingipAPI.getTenantFloatingIP()
              .success(function(response) {
                var responseIP = response;
                  keystoneAPI.getCurrentUserSession()
                  .success(function(response) {
                    usersettingAPI.getComponentQuota(response.project_id, {only_quota: true, component_name:'neutron'})
                            .success(function(data){
                              for (var i = 0; i < data.items.length; i++){
                                if (data.items[i].name === 'floating_ips'){
                                  scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                                  break;
                                }
                              }
                                  scope.floatingIP = responseIP.items;
                                  scope.ifloatingIPState = true;
                              });
                     });
              });
          }
          else if (horizon) {
            toastService.add('info', scope.context.error.priviledge);
          }
        });
    };

    this.allowRelease = function(fips){
      var disableRelease = true;
      fips.some(function(fip) {
        //attached instance
        if(fip.instance_id) {
          disableRelease = true;
          return true;
        }
        disableRelease = false;
      });
      scope.disableRelease = disableRelease;
    };

    this.allowMenus = function(fips) {
      self.allowRelease(fips);
    };

    this.init();

  }]);

})();
