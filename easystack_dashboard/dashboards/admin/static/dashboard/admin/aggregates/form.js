/**
 * Copyright 2015 Easystack Corp.
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

  angular.module('hz.dashboard.admin.aggregates')

  /**
   * @ngdoc routerformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit router form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('hz.dashboard.admin.aggregates.FormCtrl', [
    '$scope', '$modalInstance', 'horizon.openstack-service-api.nova',
    'context', 'aggregate',
    function(scope, modalInstance, novaAPI, context, aggregate) {
      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(aggregate);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      };

      scope.dropdown = dropdown;
      scope.context = context;
      scope.aggregate = aggregate;
      scope.action = action;
      scope.zones = [];
      //scope.gotZones = false;

      if(context.loadDataFunc) {
        context.loadDataFunc(scope);
      }

      //novaAPI.getAvailabilityZones(true)
      //  .success(function (response) {
      //      scope.zones = response.items;
      //      if(scope.zones && scope.zones.length>0){
      //          scope.aggregate.availability_zone = scope.zones[0];
      //          scope.gotZones = true;
      //      }
      //  });
    }
  ])

  // Edit host
  .controller('hz.dashboard.admin.aggregates.HostFormCtrl', [
    '$scope',
    '$timeout',
    '$modalInstance',
    'horizon.openstack-service-api.nova',
    'context',
    'hz.dashboard.admin.aggregates.HostsAction',
    'aggregate',
    function(scope, $timeout, modalInstance, novaAPI, context, HostsAction, aggregate) {
      var action = {
        submit: function() {
          modalInstance.close(aggregate);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        }
      },
      hostsAction = new HostsAction(scope),
      aggr        = aggregate;

      scope.hostsAction = hostsAction;
      scope.loadingHosts = true;
      scope.hosts = [];
      scope.ihosts = [];
      scope.selectedHosts = [];
      scope.iselectedHosts = [];

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'hypervisor_hostname',
        singleton: true
      }];

      hostsAction.getHosts()
      .success(function(hosts) {
        scope.sourceHosts = hosts.items;
        scope.hosts = angular.copy(scope.sourceHosts);

        for(var i=0,len=aggr.hosts.length; i<len; i++){
          for(var k=scope.hosts.length-1; k>=0; k--){
            if(aggr.hosts[i] === scope.hosts[k].hypervisor_hostname){
              scope.hosts.splice(k, 1);
            }
          }
        }

        scope.loadingHosts = false;
      });

      $timeout(function(){
        scope.selectedHosts = aggr.aHosts;
      });

      scope.context = context;
      scope.action = action;
    }
  ]);

})();