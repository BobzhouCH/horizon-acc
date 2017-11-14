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

  angular.module('hz.dashboard.project.policygroups')
  .factory('internalGroupDetailAction', ['$modal', 'backDrop',
  function(modal, backdrop) {

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'internal-group-detail',
        controller: 'interlGroupDetailFormCtrl',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
        }
      };

      self.open = function(group_id){
        option.resolve.detail = function(){ return { "id": group_id }; };
        modal.open(option);
      };

    }

    return action;
  }])
  .factory('externalGroupDetailAction', ['$modal', 'backDrop',
  function(modal, backdrop) {

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'external-group-detail',
        controller: 'externalGroupDetailFormCtrl',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
        }
      };

      self.open = function(group_id){
        option.resolve.detail = function(){ return { "id": group_id }; };
        modal.open(option);
      };

    }

    return action;
  }]);

  
})();
