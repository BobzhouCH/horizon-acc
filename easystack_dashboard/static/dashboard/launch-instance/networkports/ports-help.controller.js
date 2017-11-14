/*
 *    (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
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
   * @name LaunchInstanceNetworkPortsHelpCtrl
   * @description
   * Controller for the Launch Instance - Network Step Help.
   */
  angular
    .module('hz.dashboard.launch-instance')
    .controller('LaunchInstanceNetworkPortsHelpCtrl', LaunchInstanceNetworkPortsHelpCtrl);

  function LaunchInstanceNetworkPortsHelpCtrl() {
    var ctrl = this;

    ctrl.title = gettext('NetworkPorts Help');

    ctrl.paragraphs = [
      // jscs:disable maximumLineLength
      gettext('A port represents a virtual switch port on a logical network switch.'),
      gettext('Ports can be created under a network by administrators.'),
      gettext('Virtual instances attach their interfaces to ports.'),
      gettext('The logical port also defines the MAC address and the IP address(es) to be assigned to the interfaces plugged into them.'),
      gettext('When IP addresses are associated to a port, this also implies the port is associated with a subnet, as the IP address was taken from the allocation pool for a specific subnet.'),
      gettext('When the <b>Admin State</b> for a port is set to <b>Up</b> and it has no <b>Device Owner</b>,then the port is available for use. You can set the <b>Admin State</b> to <b>Down</b>if you are not ready for other users to use the port.'),
      gettext('The status indicates whether the port has an active connection.')
      // jscs:enable maximumLineLength
    ];
  }
})();
