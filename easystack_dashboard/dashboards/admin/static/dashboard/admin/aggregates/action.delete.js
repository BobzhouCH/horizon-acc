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
  .factory('hz.dashboard.admin.aggregates.DeleteAction', [
    'horizon.openstack-service-api.nova',
    'horizon.framework.widgets.modal.service',
    'horizon.framework.widgets.toast.service',
    'backDrop',
  function(novaAPI, smodal, toastService, backDrop) {

    var context = {
      title: gettext('Delete Aggregate'),
      message: gettext('The amount of aggregates these will be deleted is : %s'),
      tips: gettext('Please confirm your selection.'),
      submit: gettext('Delete'),
      success: gettext('Aggregate %s has been deleted successfully.'),
      error: gettext('Failed to Delete Aggregates: %s.')
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

      // delete selected volume objects
      // action requires the volume to select rows
      self.batchDelete = function(aggregates) {
        self.confirmDelete(aggregates);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(aggregates) {
        //var namelist = aggregates.attrsOfAll('name').join(', ');
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [aggregates.length]),
          submit: context.submit,
          name: aggregates,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(aggregates);
        });
      };

      self.submit = function(aggregates) {
        scope.doAction(context, aggregates, novaAPI.deleteAggregate);
        scope.clearSelected();
      };

    }//end of action

    return action;
  }]);

})();
