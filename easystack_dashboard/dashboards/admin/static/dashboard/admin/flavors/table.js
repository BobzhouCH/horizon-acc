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

  angular.module('hz.dashboard.admin.flavors')

  /**
   * @ngdoc adminFlavorsCtrl
   * @ngController
   *
   * @description
   * Controller for the admin flavors table.
   * Serve as the focal point for table actions.
   */
  .controller('adminFlavorsCtrl', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.nova',
          'horizon.framework.widgets.toast.service',
          'adminCreateFlavorAction',
          'adminEditFlavorAction',
          'adminDeleteFlavorAction',
	  'loadFlavorDetailAction',
    function(
      scope, rootScope, PolicyService, novaAPI, toastService,
      createFlavorAction,
      editFlavorAction,
      deleteAction,
      loadFlavorDetail
    ) {

    scope.context = {
      header: {
        name: gettext('Flavor Name'),
        id: gettext('ID'),
        vcpus: gettext('VCPUs'),
        ram: gettext('RAM'),
        root_disk: gettext('Root Disk'),
        ephemeral_disk: gettext('Ephemeral Disk'),
        swap_disk: gettext('Swap Disk'),
        public: gettext('Public')
      },
      action: {
      },
      error: {
        api: gettext('Unable to retrieve flavors.'),
        priviledge: gettext('Insufficient privilege level to view flavors information.')
      }
    };

    scope.publicStatus = {
      'true': gettext("True"),
      'false': gettext("False")
    };

    scope.filterFacets = [{
      label: gettext('Flavor Name'),
      name: 'name',
      singleton: true
    }, {
      label: gettext('ID'),
      name: 'id',
      singleton: true
    }, {
      label: gettext('VCPUs'),
      name: 'vcpus',
      singleton: true
    }, {
      label: gettext('RAM'),
      name: 'ram',
      singleton: true
    }, {
      label: gettext('Root Disk'),
      name: 'disk',
      singleton: true
    }, {
      label: gettext('Ephemeral Disk'),
      name: 'OS-FLV-EXT-DATA:ephemeral',
      singleton: true
    }, {
      label: gettext('Swap Disk'),
      name: 'swap',
      singleton: true
    }, {
      label: gettext('Public'),
      name: 'is_public',
      singleton: true,
      options: [
        { label: gettext('Yes'), key: 'true'},
        { label: gettext('No'), key: 'false'}
      ]
    }];

    scope.iflavorsState = false;
    var self = this;

    this.reset = function(){
      scope.flavors = [];
      scope.iflavors = [];
      scope.checked = {};
      scope.selected = {};
      scope.iflavorsState= false;
      if(scope.selectedData)
        scope.selectedData.aData = [];
      };

    // on load, if user has permission
    // fetch table data and populate it
    this.init = function(){
      scope.clearSelected = self.clearSelected;
      scope.allowMenus = self.allowMenus;
      scope.updateFlavor = self.updateFlavor;
      scope.remove_Flavor_after_delete = self.remove_Flavor_after_delete;

      //Modify for NFVI,2016-12-27,--Begin 
      scope.actions = {
        refresh: self.refresh,
        create: new createFlavorAction(scope),
        edit: new editFlavorAction(scope),
        deleted: new deleteAction(scope),
	loadFlavorDetail: new loadFlavorDetail(scope),
      };
      //Modify for NFVI,2016-12-27,--End
      self.refresh();
    };

    this.clearSelected = function(){
      scope.checked = {};
      scope.selected = {};
      scope.numSelected = 0;
      if(scope.selectedData)
        scope.selectedData.aData = [];
    };

    this.remove_Flavor_after_delete = function(flavor){
      scope.flavors.removeId(flavor.id);
      self.removeSelected(flavor.id);

    };

    this.removeSelected = function(id) {
      var selected = scope.selected[id];
      if (selected) {
        selected.checked = false;
        delete scope.selected[id];
        scope.checked[id] = false;
        scope.selectedData.aData.removeId(id);
        //scope.numSelected--;
      }
    };

    this.hasSelected = function(flavor) {
      var selected = scope.selected[flavor.id];
      if (selected)
        return selected.checked;
      return false;
    };

    // on load, if user has permission
    // fetch table data and populate it
    this.refresh = function(){
        self.reset();
        PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
        .success(function(response) {
          if (response.allowed){
              novaAPI.getAllFlavors(false)
              .success(function(response) {
                // convert utc to local time
                angular.forEach(response.items, function(item){
                  if(item.swap === ''){
                    item.swap = 0;
                  }
                });
                scope.flavors = response.items;
                scope.iflavorsState= true;
              });
          }
          else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });
    };

    this.init();

  }]);

})();
