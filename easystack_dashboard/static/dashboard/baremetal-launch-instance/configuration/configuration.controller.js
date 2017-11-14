/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  var MAX_SCRIPT_SIZE = 16 * 1024;

  angular
    .module('hz.dashboard.baremetal-launch-instance')
    .controller('LaunchBareInstanceConfigurationController', LaunchInstanceConfigurationController);

  /**
   * @ngdoc controller
   * @name LaunchInstanceConfigurationController
   * @description
   * The `LaunchInstanceConfigurationController` controller is responsible for
   * setting the following instance properties:
   *
   * @property {string} user_data, default to empty string.
   *    The maximum size of user_data is 16 * 1024.
   * @property {string} disk_config, default to `AUTO`.
   * @property {boolean} config_drive, default to false.
   * @returns {undefined} Returns nothing
   */
  function LaunchInstanceConfigurationController() {
    var ctrl = this;

    ctrl.MAX_SCRIPT_SIZE = MAX_SCRIPT_SIZE;

    ctrl.diskConfigOptions = [
      { value: 'AUTO', text: gettext('Automatic') },
      { value: 'MANUAL', text: gettext('Manual') }
    ];
    ctrl.label = {
      subtitle: gettext("You can customize your instance after it has launched using the options available here.'Customization Script' is analogous to 'User Data' in other systems."),
      intro: gettext('Customization Script'),
      rightTitle: gettext('(Modified)'),
      rightTopPanel: gettext('Script size'),
      limitError: gettext('The script is larger than the maximum size'),
      file: gettext('Load script from a file'),
      propOf: gettext('of'),
      helpTxt1: gettext('Custom scripts are attached to instances to perform specific actions when the instance is launched. For example, if you are unable to install <samp>cloud-init</samp> inside a guest operating system, you can use a custom script to get a public key and add it to the user account.'),
      helpTxt2: gettext('Type your script directly into the Customization Script field. If your browser supports the HTML5 File API, you may choose to load your script from a file. The size of your script should not exceed 16 Kb.')
    };
  }
})();
