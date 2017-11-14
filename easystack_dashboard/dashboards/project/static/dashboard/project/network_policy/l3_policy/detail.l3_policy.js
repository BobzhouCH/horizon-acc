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

  angular.module('hz.dashboard.project.network_policy')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create router modal dialog.
   * On submit, create a new router and display a success message.
   * On cancel, do nothing.
   */
  .factory('detailL3PolicyAction', [
        '$modal',
        'backDrop',
        'horizon.openstack-service-api.gbp',
        'horizon.framework.widgets.toast.service',
  function(modal, backDrop, gbpAPI, toastService) {

    var context = {};

    context.title = {
      Detail: gettext('Detail')
    };

    var ctrl = {
        'create':gettext('Create L2 Policy'),
        'delete': gettext('Delete L2 Policy'),
        'edit': gettext('Edit'),
        'more': gettext('More'),
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this,
          option;

      option = {
        templateUrl: 'l3_policy_detail/',
        controller: 'l3PolicyDetailFormCtrl',
        backdrop:   backDrop,
        windowClass: 'detailContent',
        resolve: {
          l3_detail: function(){ return {}; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(detail){
        modal.open(option);
      };

    }

    return action;
  }]);

})();