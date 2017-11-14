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

  angular.module('hz.dashboard.project.policygroups')

    /**
     * @ngdoc projectBaysCtrl
     * @ngController
     *
     * @description
     * Controller for the project bays table.
     * Serve as the focal point for table actions.
     */
    .controller('projectPolicyGroupInternalCtrl', [
        '$scope', '$rootScope', '$q', 'horizon.openstack-service-api.gbp',
        'internalGroupDetailAction', 'internalGroupCreateAction', 'internalGroupEditAction', 'internalGroupDeleteAction',
        function(scope, rootScope, $q, GBPAPI, internalGroupDetailAction, internalGroupCreateAction, internalGroupEditAction, internalGroupDeleteAction) {

          var self = this;

          scope.context = {
            header: {
              name: gettext('Name'),
              description : gettext('Description'),
              providedRuleSets : gettext('Provided Rule Sets'),
              consumedRuleSets : gettext('Consumed Rule Sets'),
              l2Policy : gettext('L2 Policy'),
            },
          };

          this.reset = function(){
            if(scope.selectedData)
              scope.selectedData.aData = [];
          };

          this.init = function(){
            self.refresh();
          };

          this.refresh = function(){
            scope.groupState = false;
            GBPAPI.listPolicyTargetGroup().success(function(response) {
              scope.groups = response;
              scope.groupState = true;
            })
          };

          scope.actions = {
            refresh: this.refresh,
            createAction: new internalGroupCreateAction(scope),
            editAction: new internalGroupEditAction(scope),
            deleteAction: new internalGroupDeleteAction(scope),
            detail: new internalGroupDetailAction(),
          };

          this.init();

        }])
  .controller('projectPolicyGroupExternalCtrl', [
      '$scope', '$rootScope', '$q', 'horizon.openstack-service-api.gbp',
      'externalGroupDetailAction', 'externalGroupCreateAction', 'externalGroupEditAction', 'externalGroupDeleteAction',
      function(scope, rootScope, $q, GBPAPI, externalGroupDetailAction, externalGroupCreateAction, externalGroupEditAction, externalGroupDeleteAction) {

          var self = this;

          scope.context = {
            header: {
              name: gettext('Name'),
              description : gettext('Description'),
              providedRuleSets : gettext('Provided Rule Sets'),
              consumedRuleSets : gettext('Consumed Rule Sets'),
              externalConnectivity : gettext('External Connectivity'),
            },
          };

          this.reset = function(){
            if(scope.selectedData)
              scope.selectedData.aData = [];
          };

          this.init = function(){
            self.refresh();
          };

          this.refresh = function(){
            scope.extGroupState = false;
            GBPAPI.listExtPolicyTarget().success(function(response) {
              scope.extGroups = response;
              scope.extGroupState = true;
            })
          };

          scope.actions = {
            refresh: this.refresh,
            createAction: new externalGroupCreateAction(scope),
            editAction: new externalGroupEditAction(scope),
            deleteAction: new externalGroupDeleteAction(scope),
            detail: new externalGroupDetailAction(),
          };

          this.init();
      }]);

})();
