/*
 *    (c) Copyright 2016 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name LaunchInstanceNetworkPortController
   * @description
   * Controller for the Launch Instance - Network Step.
   */
  angular
    .module('hz.dashboard.launch-instance')
    .controller('LaunchInstanceNetworkPortController', LaunchInstanceNetworkPortController);

  LaunchInstanceNetworkPortController.$inject = [
    '$scope',
    //'horizon.framework.widgets.action-list.button-tooltip.row-warning.service'
  ];

  function LaunchInstanceNetworkPortController($scope) {
    var ctrl = this;

    ctrl.context = {
      'instruction': gettext('Ports provide extra communication channels to your instances. You can select ports instead of networks or a mix of both.'),
      'Name': gettext('Name'),
      'IP': gettext('IP'),
      'AdminState': gettext('Admin State'),
      'Status': gettext('Status'),
      'AvailableSelectMessage': gettext('Select an item from Available items below'),
      'bindedWarning': gettext('This port is already binded by other server.'),
    };

    ctrl.portStatuses = {
      'ACTIVE': gettext('Active'),
      'DOWN': gettext('Down')
    };

    ctrl.portAdminStates = {
      'UP': gettext('Up'),
      'DOWN': gettext('Down')
    };

    ctrl.vnicTypes = {
      'normal': gettext('Normal'),
      'direct': gettext('Direct'),
      'macvtap': gettext('MacVTap')
    };

    ctrl.detailHeader = {
      'ID': gettext('ID'),
      'Project ID': gettext('Project ID'),
      'Network ID': gettext('Network ID'),
      'Network': gettext('Network'),
      'MAC Address': gettext('MAC Address'),
      'VNIC type': gettext('VNIC Type'),
      'Host ID': gettext('Host ID')
    };
    ctrl.tableDataMulti = {
      available: $scope.model.ports,
      allocated: $scope.model.newInstanceSpec.ports,
      displayedAvailable: [],
      displayedAllocated: []
    };

    ctrl.subnets = $scope.model.networks;

    ctrl.tableLimits = {
      maxAllocation: -1
    };

    ctrl.tableHelpText = {
      allocHelpText: gettext('Select ports from those listed below.')
    };

    // ctrl.tooltipModel = tooltipService;

    ctrl.nameOrID = function nameOrId(data) {
      return angular.isDefined(data.name) && data.name !== '' ? data.name : data.id;
    };
  }
})();
