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
   * @ngdoc hz.dashboard.project.firewalls
   * @ngModule
   *
   * @description
   * Provides all of the services and widgets required
   * to support and display the identity users panel.
   */
  angular.module('hz.dashboard.project.firewalls', [])

  .service('firewallsRule',function(){
     this.clean = function(rule){
     var source_ip_address = rule.sourceip_0 + '.' + rule.sourceip_1 + '.' + rule.sourceip_2 + '.' + rule.sourceip_3;
     var destination_ip_address= rule.destinationip_0 + '.' + rule.destinationip_1 + '.' + rule.destinationip_2 + '.' + rule.destinationip_3;
     if (rule.sourceip_4) {
       source_ip_address = source_ip_address + '/' + rule.sourceip_4;
     }
     if (rule.destinationip_4) {
       destination_ip_address = destination_ip_address + '/' + rule.destinationip_4;
     }
       return this.filterNullProp({
          action: rule.action,
          destination_ip_address: destination_ip_address,
          destination_port: rule.destination_port,
          name: rule.name,
          protocol: rule.protocol,
          shared: rule.shared,
          source_ip_address: source_ip_address,
          source_port: rule.source_port,
          description: rule.description
        });
     };

     // if one prop's val of the json obj is null ,then filter the prop
     this.filterNullProp = function(json){
       for(var prop in json){
         if(!json[prop]){
           delete json[prop];
         }
       }
       return json;
     }
  });

})();
