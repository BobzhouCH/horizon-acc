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
  .factory('disableListenerAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(loadbalancerAPI, smodal, toastService) {

    var context = {
      title: gettext('Disable listeners'),
      message: gettext('The amount of listeners these will be disable is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Disable listeners'),
      success: gettext('Disabled listeners: %s.'),
      error: gettext('Unable to disable listeners %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single listener object
      self.singleDisable = function(listener) {
        self.confirmDisable([listener.id], [listener.name]);
      };

      // delete selected listener objects
      // action requires the listener to select rows
      self.batchDisable = function(table) {
        self.$table = table;
        var listeners = [], names = [];
        angular.forEach(self.$table.$scope.selected, function(row) {
            if (row.checked){
              listeners.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDisable(listeners, names);
      };

      // brings up the confirmation dialog
      self.confirmDisable = function(listeners, names) {
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
          self.disableListener(listeners[i]);
        }

         if(self.$table){
          self.$table.resetSelected();
        }
      };

      this.cleanedListener = function(listener){
        return{
          loadbalancer_id: scope.detail.loadbalancer_id,
          listener:{
            admin_state_up: false
          }
        }
      }

      self.disableListener = function(listener) {
      var cleanedListener = self.cleanedListener(listener);
        loadbalancerAPI.editListener(listener.id, cleanedListener)
          .success(function() {
            var message = interpolate(context.success, [listener.name]);
            toastService.add('success', message);
            scope.updatelistener(listener);
            scope.$table.resetSelected();
          })
      }
    }

    return action;

  }]);

})();
