/**
 * Copyright 2015 IBM Corp.
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
   * @ngdoc hz.dashboard.project
   * @ngModule
   *
   * @description
   * Dashboard module to host various project panels.
   */
  angular
    .module('hz.dashboard.project', [
        'hz.dashboard.project.alarms',
        'hz.dashboard.project.billing',
        'hz.dashboard.project.instances',
        'hz.dashboard.project.volumes',
        'hz.dashboard.project.instance_firewall',
        'hz.dashboard.project.floatingIP',
        'hz.dashboard.project.networks',
        'hz.dashboard.project.images',
        'hz.dashboard.project.routers',
        'hz.dashboard.project.activity',
        'hz.dashboard.project.keypairs',
        'hz.dashboard.project.instance_snapshots',
        'hz.dashboard.project.volume_snapshots',
        'hz.dashboard.project.volume_backups',
        'hz.dashboard.project.firewalls',
        'hz.dashboard.project.loadbalancersv2',
        'hz.dashboard.project.policygroups',
        'hz.dashboard.project.network_policy',
        'hz.dashboard.project.ports',
        'hz.dashboard.lenovo.physical_servers',
        'hz.dashboard.lenovo.upgrade',

        /*begin:add by jiaozh1*/
        'hz.dashboard.project.vpn',
        /*end:add by jiaozh1*/

        'hz.dashboard.lenovo.network_switches',
        'hz.dashboard.lenovo.header',
        'hz.dashboard.lenovo.quickstart',
        'hz.dashboard.project.tickets',
		'hz.dashboard.lenovo.ha_management',
        'hz.dashboard.project.server_groups',
          
        'hz.dashboard.project.alerts'


    ]);

})();
