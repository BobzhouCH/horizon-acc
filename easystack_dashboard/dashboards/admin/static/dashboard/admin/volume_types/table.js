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

  angular.module('hz.dashboard.admin.volume_types')

  /**
   * @ngdoc adminVolumeTypesController
   * @ngController
   *
   * @description
   * Controller for the volume snapshot table.
   * Serve as the focal point for table actions.
   */
    .controller('adminVolumeTypesController', ['$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.neutron',
      'horizon.openstack-service-api.cinder',
      'createVolumeTypeAction',
      'deleteVolumeTypeAction',
      'associateQosSpecAction',
      'editVolumeTypeAction',
      'extraSpecsAddAction',
    function(scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      NeutronAPI,
      CinderAPI,
      volumeTypeCreateAction,
      volumeTypeDeleteAction,
      associateQosSpecAction,
      editVolumeTypeAction,
      extraSpecsAddAction) {

      var self = this;

      scope.context = {
          header: {
              name: gettext('Name'),
              description: gettext('Description'),
              associatedQoSSpec: gettext('AssociatedQoSSpec'),
              encryption: gettext('Encryption')
          },
          extraSpecsHeader:{
              name:gettext('Key'),
              value:gettext('Value')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve networks.'),
              priviledge: gettext('Insufficient privilege level to view networks information.')
          }
      };

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: gettext('Description'),
        name: 'description',
        singleton: true
      }, {
        label: gettext('AssociatedQoSSpec'),
        name: 'associated_qos_spec',
        singleton: true
      }, {
        label: gettext('Encryption'),
        name: 'encryption',
        singleton: true,
      }];

      this.reset = function() {
          scope.ivolumetypes = [];
          scope.volumetypes = [];
          scope.ivolumetypesState = false;
          scope.$table && scope.$table.resetSelected();
      };

      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new volumeTypeCreateAction(scope),
          associate: new associateQosSpecAction(scope),
          deleted: new volumeTypeDeleteAction(scope),
          edit: new editVolumeTypeAction(scope),
          addExtraSpecs: new extraSpecsAddAction(scope)
        };
        scope.eselected = {};
        self.refresh();
        scope.$on('volumetypeRefresh', function(){
            self.refresh();
        });
      };
      scope.detailContext = {
        extraSpecsHeader:{
              name:gettext('Key'),
              value:gettext('Value')
        }
      };
      scope.detailActions = {
        addExtraSpecs: new extraSpecsAddAction(scope)
      };
      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
                  CinderAPI.getAdminVolumeTypes()
                  .success(function(response){
                    scope.volumetypes = response.items;
                    scope.ivolumetypesState = true;
                  });
      };

      scope.refresh = self.refresh ;

      /*scope.$on('phztable.refresh',function(){
        scope.refresh();
      });*/
      this.init();

    }])
    .controller('adminVolumeTypeQosSpecController', ['$scope',
      'horizon.framework.widgets.toast.service',
      'horizon.openstack-service-api.policy',
      'horizon.openstack-service-api.usersettings',
      'horizon.openstack-service-api.keystone',
      'horizon.openstack-service-api.neutron',
      'horizon.openstack-service-api.cinder',
      'createQosSpecAction',
      'deleteQosSpecAction',
      'NetworkEditAction',
      'networkDetailAction',
    function(scope,
      toastService,
      policyAPI,
      usersettingAPI,
      keystoneAPI,
      NeutronAPI,
      CinderAPI,
      createQosSpecAction,
      deleteQosSpecAction,
      NetworkEditAction,
      CreateDetailAction) {

      var self = this;

      scope.context = {
          header: {
              name: gettext('Name'),
              consume:pgettext('VolumeTypes','Consume')
          },
          extraSpecsHeader:{
              name:gettext('Key'),
              value:gettext('Value')
          },
          action: {
          },
          error: {
              api: gettext('Unable to retrieve networks.'),
              priviledge: gettext('Insufficient privilege level to view networks information.')
          }
      };

      scope.filterFacets = [{
        label: gettext('Name'),
        name: 'name',
        singleton: true
      }, {
        label: pgettext('VolumeTypes','Consume'),
        name: 'consumer',
        singleton: true
      }];

      this.reset = function() {
          scope.iqosspecs = [];
          scope.qosspecs = [];
          scope.iqosspecsState = false;
          scope.$table && scope.$table.resetSelected();
      };

      this.init = function(){
        scope.actions = {
          refresh: self.refresh,
          create: new createQosSpecAction(scope),
          deleted: new deleteQosSpecAction(scope),
          edit: new  NetworkEditAction(scope),
          createDetail: new CreateDetailAction(scope),
        };
        self.refresh();
        scope.$on('qosSpecRefresh', function(){
            self.refresh();
        });
      };

      scope.detailContext = {
        extraSpecsHeader:{
              name:gettext('Key'),
              value:gettext('Value')
        }
      };

      this.refresh = function(){
          scope.disableCreate = false;
          self.reset();
                  CinderAPI.getQosSpecs()
                  .success(function(response){
                    scope.qosspecs = response.items;
                    scope.iqosspecsState = true;
                  });
      };

      scope.refresh = self.refresh ;

      scope.$on('qoshztable.refresh',function(){
        scope.refresh();
      });

      this.init();

    }]);

})();
