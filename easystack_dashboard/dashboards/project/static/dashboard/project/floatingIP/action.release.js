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

  angular.module('hz.dashboard.project.floatingIP')

  /**
   * @ngDoc releaseAction
   * @ngService
   *
   * @Description
   * Brings up the delete volume confirmation modal dialog.
   * On submit, delete selected floatingIP.
   * On cancel, do nothing.
   */
  .factory('releaseFloatingIPAction',
      ['horizon.openstack-service-api.floatingip',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(floatingipAPI, smodal, toastService) {

    var context = {
      title: gettext('Release floating ip'),
      message: gettext('The amount of floatingIPs these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. Release action cannot be undone.'),
      submit: gettext('release'),
      success: gettext('release Floating ips: %s.'),
      error: gettext('Floating ip: %s is used, can not be deleted.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // release selected floating ip objects
      // action requires the floating ip to select rows
      self.batchRelease = function() {
        var ids = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ids.push(row.item.id);
              //names.push('"'+ row.item.ip +'"');
              names.push({
                id: row.item.id,
                name: row.item.ip
              });
            }
        });
        self.confirmRelease(ids, names);
      };

      // brings up the confirmation dialog
      self.confirmRelease = function(ids, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'ip'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, names);
        });
      };

      // on success, remove the floatingIP from the model
      // need to also remove release floatingIP from selected list
      self.submit = function(ids, names) {
        for(var i = 0; i < ids.length; i++) {
          self.releaseFloatingIP(ids[i], names[i])
        }
      };

      self.releaseFloatingIP = function(id, name) {
        floatingipAPI.releaseFloatingIP(id)
          .success(function() {
            var message = interpolate(context.success, [name.name]);
            toastService.add('success', message);
            // iterating backwards so we can splice while looping
            for (var i = scope.floatingIP.length - 1; i >= 0; i--) {
              var fltip = scope.floatingIP[i];
              if (fltip.id === id) {
                  scope.floatingIP.splice(i, 1);
                  delete scope.selected[id];
                  scope.$table.resetSelected();
                  break;
              }
            }
          })
          .error(function() {
            var message = interpolate(context.error, [name.name]);
            toastService.add('error', message);
          });
      };
    }

    return action;

  }]);

})();
