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

/**
 ** Author : liufeng24@lenovo.com
 ** Module : extra_specs
 ** Data   : 2016-12-26
 **/

(function() {
  'use strict';

   angular.module('hz.dashboard.admin.flavors')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('loadFlavorDetailAction', ['$modal', 'backDrop','$rootScope',
  function(modal, backdrop, rootScope) {

    var context = {
    };
    context.title = {
      "Overview": gettext("Overview"),
      "ExtraSpecs": gettext("Extra Specs"),
      "Info": gettext("Info")
    };

    context.label = {
      "flavor_id": gettext("Flavor ID"),
      "public": gettext("Public"),
      "vcpus": gettext("VCPUs"),
      "memory": gettext("Memory"),
      "disk": gettext("Disk"),
      "ephemeral": gettext("Ephemeral Disk"),
      "swap": gettext("Swap Space"),
      "rxtx_factor": gettext("RxTx Factor"),
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'detail/',
        controller: 'detailExtraSpecFormController',
        backdrop:   backdrop,
        windowClass: 'detailContent',
        scope:scope,
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
        }
      };

      self.open = function(flavor){
        option.resolve.detail = function(){ return { "flavor": flavor}; };
        modal.open(option);
       };
    }

    return action;
  }]);

})();



