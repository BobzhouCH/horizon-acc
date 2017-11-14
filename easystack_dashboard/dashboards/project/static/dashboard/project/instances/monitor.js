/**
 * Copyright 2015 EasyStack
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

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngdoc InstanceMonitorCtrl
   * @ngController
   *
   * @description
   * Controller for the instance monitor details
   * Serve as the focal point for table actions.
   */
  .controller('InstanceMonitorCtrl', [
    '$scope', '$location','horizon.openstack-service-api.policy', 'horizon.openstack-service-api.ceilometer',
    'horizon.openstack-service-api.nova',
    function(scope, location, PolicyService, CeilometerAPI, novaAPI
          ) {
             var _this       = this;
            this.getStatics = function(meter_name, resource_id, date_options)
            {
                var params = {'instance_id': scope.instanceId,
                              'instance_name': scope.instance_name,
                              'meter_name': meter_name,
                              'resource_id': resource_id,
                              'date_options': date_options
                             };
                CeilometerAPI.getStatisitcs(params)
                .success(function(response){
                    switch(meter_name){
                        case 'cpu_util':
                            scope.cpu_util = response.items;
                            break;
                        case 'memory.usage':
                            scope.memory_usage = response.items;
                            break;
                        case 'network':
                            scope.network_statics = response.items;
                            break;
                        default:
                            if(meter_name == 'network.incoming.bytes.rate')
                              {
                                scope.network_in = response.items;
                              } else if (meter_name == 'network.outgoing.bytes.rate')
                                  {
                                   scope.network_out = response.items;
                                  }
                            break;
                    }
                });
            };
            _this.get_cpu_utils = function ()
            {
                _this.getStatics('cpu_util', scope.instanceId, scope.cpu_util_date_options);
            };
            _this.get_memory_usage = function ()
            {
                _this.getStatics('memory.usage', scope.instanceId, scope.memory_date_options);
            };
            _this.get_network_in = function ()
            {
                _this.getStatics('network.incoming.bytes.rate', scope.networkId, scope.network_in_date_options);
            };
            _this.get_network_out = function ()
            {
                _this.getStatics('network.outgoing.bytes.rate', scope.networkId, scope.network_out_date_options);
            };
            _this.get_network = function ()
            {
                _this.getStatics('network', '', scope.network_out_date_options);
            };
            scope.set_date_options = function (date_options)
            {
                scope.global_date_options = date_options;
                scope.cpu_util_date_options = date_options;
                scope.memory_date_options = date_options;
                scope.network_in_date_options = date_options;
                scope.network_out_date_options = date_options;
            };

            _this.init = function(){
                scope.global_date_options = 1;
                scope.cpu_util_date_options = '1';
                scope.memory_date_options = '1';
                scope.network_in_date_options = '1';
                scope.network_out_date_options = '1';
                scope.compute = ['cpu_util', 'memory.usage'];

                scope.$watch('instance', function(newVal, oldVal){
                    if(newVal != oldVal){
                        scope.instanceId = newVal.id;
                        scope.instance_name = newVal['OS-EXT-SRV-ATTR:instance_name'];
                        _this.get_cpu_utils();
                        _this.get_memory_usage();
                        _this.get_network();
                    }
                });

            };

            _this.init();

  }]);

})();

