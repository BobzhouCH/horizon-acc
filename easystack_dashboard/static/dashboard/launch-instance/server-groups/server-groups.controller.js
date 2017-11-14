(function () {
  'use strict';

  var module = angular.module('hz.dashboard.launch-instance');

  /**
   * @ngdoc controller
   * @name hz.dashboard.launch-instance.LaunchInstanceServerGroupsCtrl
   * @description
   * Allows selection of server groups.
   */
  module.controller('LaunchInstanceServerGroupsCtrl', [
    'launchInstanceModel',
    function (launchInstanceModel) {
      var ctrl = this;

      ctrl.label = {
        title: gettext('Server Groups'),
        subtitle: gettext('Select the server groups.'),
        name: gettext('Name'),
        policies: gettext('Policies'),
        members: gettext('Members'),
        metadata: gettext('Metadata'),
        description: gettext('Description'),
      };

      ctrl.tableData = {
        available: launchInstanceModel.serverGroups,
        allocated: launchInstanceModel.newInstanceSpec.server_group,
        displayedAvailable: [],
        displayedAllocated: [],
      };

      ctrl.tableHelp = {
        noneAllocText: gettext(
          'Select one  server groups from the available groups below.'
        ),
        availHelpText: gettext('Select one')
      };

      ctrl.tableLimits = {
        maxAllocation: 1
      };

      ctrl.filterFacets = [
        {
          label: gettext('Name'),
          name: 'name',
          singleton: true
        },
      ];
    }
  ]);

  module.controller('LaunchInstanceServerGroupsHelpCtrl', [function () {
      var ctrl = this;

      ctrl.title = gettext('Server Groups Help');

      ctrl.paragraphs = [
        // jscs:disable maximumLineLength
        gettext('server group.')
        // jscs:enable maximumLineLength
      ];
    }
  ]);

})();
