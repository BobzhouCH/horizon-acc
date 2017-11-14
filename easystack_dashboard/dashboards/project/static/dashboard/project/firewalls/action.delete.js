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

  angular.module('hz.dashboard.project.firewalls')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete router confirmation modal dialog.
   * On submit, delete selected routers.
   * On cancel, do nothing.
   */
  .factory('deleteFirewallAction', ['horizon.openstack-service-api.fwaas', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(fwaasAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Firewalls'),
      message: gettext('The amount of firewalls these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete'),
      success: gettext('Deleted Firewalls: %s.'),
      error: gettext('Deleted Firewalls: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function() {
        var firewalls = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              firewalls.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(firewalls, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(firewalls, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: firewalls,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(firewalls);
        });
      };

      // on success, remove the routers from the model
      // need to also remove deleted routers from selected list
      self.submit = function(firewalls) {
        for(var n=0; n<firewalls.length; n++){
          self.deleteFirewall(firewalls[n]);
        }
        scope.$table.resetSelected();
      };

      self.deleteFirewall = function(firewall) {
        fwaasAPI.deleteFirewall(firewall.id)
          .success(function() {
            var message = interpolate(context.success, [firewall.name]);
            toastService.add('success', message);

            scope.firewalls.remove(firewall);
            delete scope.selected[firewall.id];
          });
      };
    }

    return action;

  }]);

})();
