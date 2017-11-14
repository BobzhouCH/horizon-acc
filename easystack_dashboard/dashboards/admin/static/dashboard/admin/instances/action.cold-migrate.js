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

  angular.module('hz.dashboard.admin.instances')

  /**
   * @ngDoc attachAction
   * @ngService
   *
   * @Description
   * Brings up the cold migrate modal dialog.
   * On submit, cold migrate and display a success message.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.instances.ColdMigrateAction', [
    'horizon.openstack-service-api.nova',
    'horizon.framework.widgets.modal.service',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, smodal, toastService) {

    var context = {
      mode: 'coldMigrate',
      title: gettext('Cold Migrate Instance'),
      submit: gettext('Cold Migrate'),
      success: gettext('Instance %s has been migrated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // open up the cold-migrate form
      self.open = function(instances) {
        if(instances.length != 1)
          return;

        var context = {
          action: novaAPI.migrateServer,
          title: gettext('Cold Migrate Instance'),
          message: gettext('You have selected "%s" to migrate.'),
          tips: gettext('Please confirm your action,Cold Migration will cause the instance shutdown until the action completed.'),
          dis_message: gettext('No available nova-compute in this domain,could not be migrated.'),
          submit: gettext('Cold Migrate'),
          success: gettext('Cold Migrated instance: %s.'),
          error: gettext('Failed to migrate instance: %s.')
        };
        self.confirmAction(context, instances[0]);
      };

      self.confirm = function(instance) {
        var context = {
          action: novaAPI.confirmresizeServer,
          title: gettext('Confirm the Cold Migration'),
          message: gettext('You will confirm the Cold Migration of instance: %s.'),
          tips: gettext('Please confirm your action.'),
          submit: gettext('Confirm'),
          success: gettext('Confirmed the Cold Migration of instance: %s.'),
          error: gettext('Failed to confirm the Cold Migration of instance: %s.')
        };
        //self.confirmAction(context, instance);
        scope.doAction(context, [instance], context.action);
      };

      self.revert = function(instance) {
        var context = {
          action: novaAPI.revertresizeServer,
          title: gettext('Revert the Cold Migration'),
          message: gettext('You will revert the Cold Migration of instance %s.'),
          tips: gettext('Please confirm your action.'),
          submit: gettext('Revert'),
          success: gettext('Reverted the Cold Migration of instance: %s.'),
          error: gettext('Failed to revert the Cold Migration of instance: %s.')
        };
        //self.confirmAction(context, instance);
        scope.doAction(context, [instance], context.action);
      };

      // brings up the confirmation dialog
      self.confirmAction = function(context, instance) {
        novaAPI.getServices('nova-compute')
        .success(function(data){
          var count = 0;
          if (data.items){
            var availability_zone = instance["OS-EXT-AZ:availability_zone"];
            for (var i = 0; i < data.items.length; i++){
              if (data.items[i].zone === availability_zone && data.items[i].status === "enabled"){
                count++;
              }
            }
          }
          var options = {
            title: context.title,
            tips: (count >= 2 ? context.tips : ""),
            body: (count >= 2 ? interpolate(context.message, [instance.name]) : context.dis_message),
            submit: context.submit,
            disabled: (count >= 2 ? false : true)
          };
          smodal.modal(options).result.then(function(){
            scope.doAction(context, [instance], context.action);
          });
        });
      };

    }//end of action

    return action;
  }]);

})();
