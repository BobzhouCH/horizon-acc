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

  angular.module('hz.dashboard.admin.aggregates')

  /**
   * @ngDoc attachAction
   * @ngService
   *
   * @Description
   * Brings up the liveMigrate volume modal dialog.
   * On submit, liveMigrate volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.aggregates.CreateAction', [
    'horizon.openstack-service-api.nova',
    '$modal', 'backDrop',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create Aggregate'),
      submit: gettext('Create'),
      success: gettext('Aggregate %s has been created successfully.')
    };

    context.loadDataFunc = function(scope) {
      ;
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'form',
        controller: 'hz.dashboard.admin.aggregates.FormCtrl',
        backdrop: backDrop,
        resolve: {
          aggregate: function(){ return self.aggregate; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      // open up the live-migrate form
      self.open = function() {
        self.aggregate = {};
        modal.open(option).result.then(function(aggregate){
          self.submit(aggregate);
        });
      };

      // submit this action to api
      // and update aggregate object on success
      self.submit = function(aggregate) {
        if(aggregate.availability_zone == ''){
          aggregate.availability_zone = null;
        }
        //novaAPI.createAggregate(aggregate.name, aggregate.availability_zone.zoneName)
        novaAPI.createAggregate(aggregate.name, aggregate.availability_zone)
          .success(function(aggregate) {
            var message = interpolate(context.success, [aggregate.name]);
            toastService.add('success', gettext(message));

            scope.aggregates.add(aggregate);
            scope.updateAggregate(aggregate);
            scope.clearSelected();
          });
      };

    }//end of action

    return action;
  }]);

})();
