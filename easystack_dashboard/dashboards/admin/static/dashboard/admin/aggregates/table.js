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

  angular.module('hz.dashboard.admin.aggregates')

  /**
   * @ngdoc AggregatesCtrl
   * @ngController
   *
   * @description
   * Controller for the admin aggregates table.
   * Serve as the focal point for table actions.
   */
  .controller('hz.dashboard.admin.aggregates.AggregatesCtrl', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.policy',
    'horizon.openstack-service-api.nova',
    'horizon.framework.widgets.toast.service',
    'hz.dashboard.admin.aggregates.CreateAction',
    'hz.dashboard.admin.aggregates.EditAction',
    'hz.dashboard.admin.aggregates.DeleteAction',
    'hz.dashboard.admin.aggregates.EditHostAction',
  function(scope, rootScope, policyService, novaAPI, toastService,
    CreateAction, EditAction, DeleteAction, EditHostAction) {

    var self = this;

    scope.context = {
      header: {
        id: gettext('Aggregate ID'),
        name: gettext('Name'),
        zone: gettext('Availability Zone'),
        hosts: gettext('Hosts'),
        metadata: gettext('Metadata'),
        created: gettext('Create Time'),
      },
      error: {
        api: gettext('Unable to retrieve aggregates'),
        priviledge: gettext('Insufficient privilege level to view aggregate information.')
      }
    };


    this.clearSelected = function(){
      scope.checked = {};
      return scope.$table && scope.$table.resetSelected();
    };

    this.hasSelected = function(aggregate) {
      return scope.$table.isSelected(aggregate);
    };

    this.removeSelected = function(aggregate) {
      if (self.hasSelected(aggregate)){
        scope.checked[aggregate.id] = false;
        scope.$table.unselectRow(aggregate);
      }
    };

    this.initScope = function() {
      scope.clearSelected = self.clearSelected;
      scope.allowMenus = self.allowMenus;
      scope.doAction = self.doAction;
      scope.updateAggregate = self.updateAggregate;

      scope.actions = {
        refresh: self.refresh,
        create: new CreateAction(scope),
        edit: new EditAction(scope),
        delete: new DeleteAction(scope),
        editHost: new EditHostAction(scope)
      };
    };

    this.reset = function(){
      scope.aggregates = [];
      scope.iaggregates = [];
      scope.iaggregatesState = false;

      scope.disableEditHosts = true;

      self.clearSelected();
      toastService.clearAll();
    };

    this.init = function(){
      self.initScope();
      self.refresh();

      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          self.allowMenus(scope.selectedData.aData);
      });
    };

    this.doAction = function(context, aggregates, action) {
      for (var n = 0; n < aggregates.length; n++) {
        var aggregate = aggregates[n];
        (function(aggregate) {
          action(aggregate.id)
            .success(function() {
              var message = interpolate(context.success, [aggregate.name]);
              toastService.add('success', gettext(message));
              // update the status
              self.updateAggregate(aggregate);
            })
            .error(function() {
              var message = interpolate(context.error, [aggregate.name]);
              toastService.add('error', gettext(message));
            });
        })(aggregate);
      }
      scope.clearSelected();
    };

    this.updateAggregate = function(aggregate) {
      novaAPI.getAggregate(aggregate.id)
        .success(function(response) {
          // update the aggregate
          angular.extend(aggregate, response);
          // update the menus
          if (self.hasSelected(aggregate)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          // remove the aggregate if needed
          if(status == 404) {
            self.removeSelected(aggregate);
            scope.aggregates.removeId(aggregate.id);
          }
        });
    };


    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(){
      self.reset();
      policyService.check({rules: [['identity', 'identity:get_cloud_admin_resources']]})
        .success(function(response) {
          if (response.allowed) {
            listAggregates();
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });

      function listAggregates() {
        novaAPI.getAggregates()
          .success(function(response) {
            scope.aggregates = response.items;
            scope.iaggregatesState = true;
          });
      }
    };
    scope.refresh = this.refresh;

    /* begining of ---- update menu state*/
    this.allowEditHosts = function(aggregates) {
      scope.disableEditHosts = false;
    };
    /* end of ---- update menu state*/

    //Check if action can be clicked when multi select aggregate.
    this.allowMenus = function(aggregates) {
      self.allowEditHosts(aggregates);
    };

    scope.broadcastRefresh = function(){
      rootScope.$broadcast('zones', true);
    };

    this.init();

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('Availability Zone'),
      name: 'availability_zone',
      singleton: true
    }, {
      label: gettext('Hosts'),
      name: 'hosts',
      singleton: true
    }];

  }])

  /**
   * @ngdoc ZonesCtrl
   * @ngController
   *
   * @description
   * Controller for the admin aggregates table.
   * Serve as the focal point for table actions.
   */
  .controller('hz.dashboard.admin.aggregates.ZonesCtrl', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.policy',
    'horizon.openstack-service-api.nova',
    'horizon.framework.widgets.toast.service',
  function(scope, rootScope, policyService, novaAPI, toastService) {

    var self = this;

    scope.context = {
      header: {
        id: gettext('Zone ID'),
        name: gettext('Name'),
        hosts: gettext('Hosts'),
        state: gettext('State'),
        created: gettext('Create Time'),
      },
      error: {
        api: gettext('Unable to retrieve aggregates'),
        priviledge: gettext('Insufficient privilege level to view aggregate information.')
      }
    };

    this.clearSelected = function(){
      scope.checked = {};
      return scope.$table && scope.$table.resetSelected();
    };

    this.hasSelected = function(zone) {
      return scope.$table.isSelected(zone);
    };

    this.removeSelected = function(zone) {
      if (self.hasSelected(zone)){
        scope.checked[zone.id] = false;
        scope.$table.unselectRow(zone);
      }
    };

    this.initScope = function() {
      scope.zones = [];
      scope.izones = [];
      scope.izonesState = false;

      scope.clearSelected = self.clearSelected;
      scope.actions = {
        refresh: self.refresh,
      };
    };

    this.reset = function(){
      scope.zones = [];
      scope.izones = [];
      scope.izonesState = false;

      self.clearSelected();
      toastService.clearAll();
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(isReset){
      !isReset ? self.reset() : false;
      policyService.check({rules: [['identity', 'identity:get_cloud_admin_resources']]})
        .success(function(response) {
          if (response.allowed) {
            listZones();
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });

      function listZones() {
        novaAPI.getAvailabilityZones(true)
          .success(function(response) {
            scope.zones = response.items;
            scope.izonesState = true;
            scope.zones.resetIds();
          });
      }
    };

    this.init = function(){
      self.initScope();
      self.refresh();
    };

    this.init();

    scope.filterFacets = [{
      label: gettext('Name'),
      name: 'zoneName',
      singleton: true
    }, {
      label: gettext('Hosts'),
      name: 'hosts',
      singleton: true
    }, {
      label: gettext('State'),
      name: 'zoneState',
      singleton: true
    }];

    scope.$on('zones', function() { self.refresh(true); });

  }])

  .filter('available', function(){
    return function(input){
      var state = '';
      if (input.available) {
        state = gettext('Available');
      }
      else {
        state = gettext('Unavailable');
      }
      return state;
    };
  })

  .filter('active', function(){
    return function(input){
      var state = '';
      if (input.active) {
        state = gettext('Active');
      }
      else {
        state = gettext('Inactive');
      }
      return state;
    };
  });

})();
