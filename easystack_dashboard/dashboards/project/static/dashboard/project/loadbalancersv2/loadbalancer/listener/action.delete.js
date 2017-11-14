/**
 * Copyright 2015 IBM Corp.
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

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete volume confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('deleteListenerAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(loadbalancerAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete listeners'),
      message: gettext('The amount of listeners these will be deleted is : %s.'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete listeners'),
      success: gettext('Deleted listeners: %s.'),
      error: gettext('Unable to delete listeners %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single volume object
      self.singleDelete = function(listener) {
        self.confirmDelete([listener.id], [listener.name]);
      };

      // delete selected volume objects
      // action requires the volume to select rows
      self.batchDelete = function(table) {
        self.$table = table;
        var listeners = [], names = [];
        angular.forEach(self.$table.$scope.selected, function(row) {
            if (row.checked){
              listeners.push(row.item);
              names.push('"'+ row.item.name +'"');
           }
        });
        self.confirmDelete(listeners, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(listeners, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: listeners,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(listeners);
        });
      };


      self.submit = function(listeners) {
        for(var i = 0; i < listeners.length; i++){
          self.deleteListener(listeners[i]);
        }

        if(self.$table){
          self.$table.resetSelected();
        }
      };

      self.deleteListener = function(listener) {
        loadbalancerAPI.deleteListener(listener.id)
          .success(function() {
            var message = interpolate(context.success, [listener.name]);
            toastService.add('success', message);
            scope.updatelistener(listener);
            scope.clearSelected();
          })
      }
    }

    return action;

  }]);

})();
