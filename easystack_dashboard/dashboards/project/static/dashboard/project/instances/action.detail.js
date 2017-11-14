/**
 * Copyright 2015 EasyStack Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('instanceDetailAction', [
    '$modal', '$sce',
    'horizon.openstack-service-api.keystone', 
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.neutron',
  function(modal, sce, keystoneAPI, novaAPI, neutronAPI) {

    var ctrl = {
        'active': gettext("Active"),
        'saving': gettext("Saving"),
        'queued': gettext("Queued"),
        'pending_delete': gettext("Pending Delete"),
        'killed': gettext("Killed"),
        'deleted': gettext("Deleted")
    };

    var context = {};

    context.title = {
      "Details_List": gettext("Detail"),
      "Info": gettext("Info"),
      "Resources": gettext("Resources"),
      "Specs": gettext("Specs"),
      "ExtraSpecs": gettext("Extra Specs"),
      "Console": gettext("Console"),
      "ConsoleLog": gettext("Console Log"),
      "Fault": gettext("Fault"),
    };

    context.label = {
      abc : 'abcd',
      Info : {
        "ID": gettext("ID"),
        "Name": gettext("Name"),
        "Status": gettext("Status"),
        "Created": gettext("Created At"),
        "Uptime": gettext("Uptime"),
        "AvailabilityZone": gettext("Availability Zone")
      },
      Resources : {
        "Volume": gettext("Volume"),
        "Keypair_name": gettext("Keypair Name"),
        "Image_name": gettext("Image Name"),
        "SecurityGroup": gettext("SecurityGroup")
      },
      Specs : {
        "RAM": gettext("RAM"),
        "VCPUs": gettext("VCPUs"),
        "Disk": gettext("Disk")
      },
      Networks: {
        "Network": gettext("Network"),
        "NetworkName": gettext("Network Name"),
        "SubNetworkName": gettext("Subnet Name"),
        "Segment": gettext("CIDR"),
        "InternalIP": gettext("Fixed IP"),
        "FloatingIP": gettext("Floating IP"),
        "MACAddress": gettext("MAC Address")
      },
      instancedetaili18n : {
        'ACTIVE': gettext("Active"),
        'DELETED': gettext("Deleted"),
        'BUILD': gettext('Build'),
        'SHUTOFF': gettext("Shutoff"),
        'SUSPENDED': gettext("Suspended"),
        'PAUSED': gettext("Paused"),
        'ERROR': gettext("Error"),
        'RESIZE': gettext("Resize/Migrate"),
        'VERIFY_RESIZE': gettext("Confirm or Revert Resize/Migrate"),
        'REVERT_RESIZE': gettext("Revert Resize/Migrate"),
        'REBOOT': gettext("Reboot"),
        'HARD_REBOOT': gettext("Hard Reboot"),
        'PASSWORD': gettext("Password"),
        'REBUILD': gettext("Rebuild"),
        'MIGRATING': gettext("Migrating"),
        'RESCUE': gettext("Rescue"),
        'SOFT_DELETED': gettext("Soft Delete"),
      },
      Fault : {
        'Message' : gettext("Message"),
        'Code' : gettext("Code"),
        'Details' : gettext("Details"),
        'Created' : gettext("Created Time"),
      }
    };

    context.loadDataFunc = function(scope) {
      initScope(scope);

      novaAPI.getServer(scope.instance.id)
        .success(function(instance) {
          // NOTE(lzm): response after closed (bug EAS-2114)
          if (!scope.$root) {
            return;
          }
          instance.created = instance.created.replace(/T/g, ' ');
          instance.created = instance.created.replace(/Z/g, ' ');
          instance.created = scope.$root.rootblock.utc_to_local(instance.created);
          angular.extend(scope.instance, instance);
          keystoneAPI.isPublicRegion().success(function(isPublicRegion) {
            if (!isPublicRegion) {
              getExtraSpecs(scope);
              getNetworkInfo(scope);
              refreshConsoleUrl(scope);
              refreshConsoleOutput(scope);
            }
          });
        });

    };


    function getExtraSpecs(scope) {
      novaAPI.getFlavor(scope.instance.flavor.id, true, true)
          .success(function (response) {
              var array = [];
              var id = 0;
              for(var key in response.extras){
                array.push({'id': id++, 'key': key,'value': response.extras[key]});
              }
              scope.extraSpecs = array;
          })
    }

    function getNetworkInfo(scope) {
      neutronAPI.getDevicePorts(scope.instance.id).success(function(response) {
        var networks = response.items;
        // TODO: This piece of logic below is too complicate.
        // will change it when ip_groups structure is refined.
        for (var key in scope.instance.ip_groups) {
          if (scope.instance.ip_groups.hasOwnProperty(key)) {
            var ip_group = scope.instance.ip_groups[key];
            if (ip_group.non_floating && ip_group.non_floating.length>0) {
              for (var i=0; i<=ip_group.non_floating.length-1; i++) {
                var ip = ip_group.non_floating[i];
                for (var j=0; j<=networks.length-1; j++) {
                  var network = networks[j];
                  if (ip['OS-EXT-IPS-MAC:mac_addr'] === network['mac_address']) {
                    ip['subnet'] = network['subnet'];
                    ip['cidr'] = network['cidr'];
                  }
                }
              }
            }
          }
        }
      });
    }


    function refreshConsoleUrl(scope) {
      var instance = scope.instance;
      if (instance.status == 'ACTIVE') {
        novaAPI.getServerVNC(instance.id).success(function(response) {
          scope.console_url = sce.trustAsResourceUrl(response);
        });
      }
    }

    function refreshConsoleOutput(scope) {
      var instance = scope.instance;
      if (instance.status != 'ERROR') {
          novaAPI.getServerConsoleOutput(instance.id, instance.consoleLines)
          .success(function(response) {
            scope.instance.consoleLog = response;
          });

      }
    }

    function initScope(scope) {
      scope.instance.consoleLines = 30;
      scope.instance.consoleLog = '';

      scope.action.submit = function() {
        refreshConsoleOutput(scope);
      };
    }

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'detail',
        controller: 'instanceDetailForm',
        windowClass: 'detailContent',
        resolve: {
          instance: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(instance){
        option.resolve.instance = function(){ return angular.copy(instance); };
        modal.open(option);
      };

    }

    return action;
  }]);

})();
