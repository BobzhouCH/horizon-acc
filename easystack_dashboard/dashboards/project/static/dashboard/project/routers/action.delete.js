/**
 * Copyright 2015 EasyStack Corp.
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

  angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete router confirmation modal dialog.
   * On submit, delete selected routers.
   * On cancel, do nothing.
   */
  .factory('deleteRouterAction', ['horizon.openstack-service-api.neutron', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(neutronAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Router'),
      message: gettext('The amount of routers these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Router'),
      success: gettext('Deleted Routers: %s.'),
      error: gettext('Deleted Routers: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single router object
      self.singleDelete = function(router) {
        self.confirmDelete([router.id], [router.name]);
      };

      // delete selected router objects
      // action requires the router to select rows
      self.batchDelete = function() {
        var routers = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              routers.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(routers, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(routers, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: routers,
          imgOwner: 'router'
        };
        smodal.modal(options).result.then(function(){
          self.submit(routers);
        });
      };

      // on success, remove the routers from the model
      // need to also remove deleted routers from selected list
      self.submit = function(routers) {
        for(var n=0; n<routers.length; n++){
          self.deleteRouter(routers[n]);
        }
        scope.$table.resetSelected();
      };

      var routerInfo = {};
      self.deleteRouter = function(router) {
        routerInfo[router.id] = router.name;
        neutronAPI.deleteRouter(router.id, routerInfo)
          .success(function() {
            var message = interpolate(context.success, [router.name]);
            toastService.add('success', message);

            scope.routers.removeId(router.id);
            delete scope.selected[router.id];
          });
      };
    }

    return action;

  }]);

})();