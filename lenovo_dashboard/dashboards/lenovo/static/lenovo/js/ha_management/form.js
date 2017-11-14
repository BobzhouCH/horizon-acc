/**
 * Copyright 2015 EasyStack Inc.
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

  angular.module('hz.dashboard.lenovo.ha_management')

  /**
   * @ngdoc formCtrl
   * @ng-controller
   *
   * @description
   * This controller is used for edit Compute HA form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('edithaformCtrl', [
    '$scope', '$modalInstance', 'servers', 'haServiceStatus',
  function(scope, modalInstance, servers, haServiceStatus
 ) {
    var self = this;

    scope.context = {
      mode: 'editHA',
      title: gettext('Compute HA Management'),
      submit:  gettext('Submit'),
      revert:  gettext('Revert'),
      header: {
        action: gettext('Action'),
        add: gettext('Add'),
        remove: gettext('Remove'),
        hostname: gettext('Host Name'),
        ip: gettext('Ip Address'),
        haservice: gettext('Compute HA Service:'),
        unmangedHosts: gettext('Unmanaged Hosts'),
        managedHosts: gettext('Managed Hosts'),
      },
      hastatus: {
        "enable": gettext("Enable"),
        "disable": gettext("Disable")
      }
    };
    scope.haServiceStatusImgMapping = {
          null: 'lenovo/img/ac16_powerOFF_24.png',
          0 : 'lenovo/img/ac16_powerOFF_24.png',
          1 : 'lenovo/img/ac16_power_24.png',
      }
    scope.servers = servers;
    scope.haServiceStatus = haServiceStatus;
    scope.hastatus = {
        userSelectHAService: haServiceStatus,
    }
    scope.tables = {managedNodes: null, unmanagedNodes: null};

    this.addNode = function(node) {
        scope.unmanagedNodes.remove(node);
        scope.managedNodes.push(node);
        // clear the old selected items
        scope.tables.unmanagedNodes.unselectRow(node);
    };

    this.removeNode = function(node) {
        scope.managedNodes.remove(node);
        scope.unmanagedNodes.push(node);
        // clear the old selected items
        scope.tables.managedNodes.unselectRow(node);
    };

    this.addNodes = function(nodes) {
        for(var i = nodes.length - 1; i >= 0; i--) {
          self.addNode(nodes[i]);
        }
    };

    this.removeNodes = function(nodes) {
        for(var i = nodes.length - 1; i >= 0; i--) {
          self.removeNode(nodes[i]);
        }
    };

    this.reset = function () {
       scope.managedNodes = [];
       scope.unmanagedNodes = [];
       scope.imanagedNodes = [];
       scope.iunmanageddNodes = [];
       $.each(scope.servers, function(i, server) {
          if (server.hastatus === 'yes') {
              scope.managedNodes.push(angular.copy(server));
          } else if (server.hastatus === 'no'){
              scope.unmanagedNodes.push(angular.copy(server));
          }
       });
       scope.hastatus.userSelectHAService = scope.haServiceStatus;

      // if(scope)
      // scope.$$childTail.$$childTail.userSelectHAService = scope.haServiceStatus;
       scope.checked = {};
       if (scope.selectedData) {
          scope.selectedData.aData = [];
       }
       scope.selected = {};

       if(scope.tables.managedNodes) {scope.tables.managedNodes.resetSelected();}
       if(scope.tables.unmanagedNodes) {scope.tables.unmanagedNodes.resetSelected();}
    };


    scope.action = {
        submit: function() {
            var data = {
                managedNodes: scope.managedNodes,
                unmanagedNodes: scope.unmanagedNodes,
                userSelectHAService: scope.hastatus.userSelectHAService,
            }
            modalInstance.close(data);
        },
        cancel: function() { modalInstance.dismiss('cancel'); },
        addNodes: this.addNodes,
        removeNodes: this.removeNodes,
        addNode: this.addNode,
        removeNode: this.removeNode,
        revert: this.reset,
    }

    scope.filterFacets = [
            {
                label: gettext('Host Name'),
                name: 'hostname',
                singleton: true
            }

      ];

    this.reset();
  }])

})();
