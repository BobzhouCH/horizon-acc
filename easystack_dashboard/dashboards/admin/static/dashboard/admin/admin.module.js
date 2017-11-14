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

  /**
   * @ngdoc hz.dashboard.admin
   * @ngModule
   *
   * @description
   * Dashboard module to host various admin panels.
   */
  angular
    .module('hz.dashboard.admin', [
        'hz.dashboard.admin.instances',
        'hz.dashboard.admin.server_groups',
        'hz.dashboard.admin.instance_snapshots',
        'hz.dashboard.admin.volumes',
        'hz.dashboard.admin.volume_snapshots',
        'hz.dashboard.admin.flavors',
        'hz.dashboard.admin.volume_types',
        'hz.dashboard.admin.networks',
        'hz.dashboard.admin.images',
        'hz.dashboard.admin.routers',
        'hz.dashboard.admin.billing',
        'hz.dashboard.admin.bill',
        'hz.dashboard.admin.overviews',
        'hz.dashboard.admin.invcodes',
        'hz.dashboard.admin.info',
        'hz.dashboard.admin.hypervisor',
        'hz.dashboard.admin.notice',
        'hz.dashboard.admin.aggregates',
        'hz.dashboard.admin.security_settings',
        'hz.dashboard.admin.tickets',
        'hz.dashboard.admin.optimize',
    ]).constant('horizon.dashboard.admin.basePath', (window.WEBROOT || '/') + "admin");

})();
