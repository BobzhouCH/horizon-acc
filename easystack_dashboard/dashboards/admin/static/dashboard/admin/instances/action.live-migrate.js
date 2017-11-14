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
   * Brings up the liveMigrate volume modal dialog.
   * On submit, liveMigrate volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.instances.LiveMigrateAction', [
    'horizon.openstack-service-api.nova',
    '$modal', 'backDrop',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'liveMigrate',
      title: gettext('Live Migrate Instance'),
      submit: gettext('Live Migrate'),
      success: gettext('Instance %s has been migrated successfully.')
    };

    context.loadDataFunc = function(scope) {
      //novaAPI.getHypervisors('All')
      //begin:jiaozh1:add:2016-11-22:bug:Bugzilla - bug 75256
      //novaAPI.getServices('nova-compute')
      novaAPI.getHypervisorsformigrate(scope.instance.id)
      //end:jiaozh1:add:2016-11-22:bug:Bugzilla - bug 75256
        .success(function(response) {
          var hosts = response.items;
          hosts = hosts.filter(function(item) {
            item.available = (item.state == "up" && item.status == "enabled");
            item.id = item.name = item.service.host;
            // remove the host itself
            return item.available && (item.name != scope.instance.hostname);
          });

          if (hosts.length > 0) {
            scope.instance.host = hosts[0].id;
          }
          scope.dropdown.hosts = hosts;
        });
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'live-migrate-form',
        controller: 'hz.dashboard.admin.instances.FormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return self.instance; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      // open up the live-migrate form
      self.open = function(instances) {
        var instance = instances[0];
        self.instance = angular.copy(instance);
        modal.open(option).result.then(function(clone){
          self.submit(instance, clone);
        });
      };

      // live-migrate form modifies size
      // send only what is required
      self.clean = function(instance) {
        return {
          id: instance.id,
          host: instance.host,
          block_migrate: !instance.sharedStorage
        };
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        var cleanedInstance = self.clean(clone);
        novaAPI.liveMigrateServer(cleanedInstance.id, cleanedInstance)
          .success(function() {
            //var message = interpolate(context.success, [instance.name]); //laixf 2017/7/1 for migrate display
            var message = interpolate("Instance %s start migrating", [instance.name]);
            toastService.add('success', gettext(message));

            scope.updateInstance(instance);
            scope.clearSelected();
          });
      };

    }//end of action

    return action;
  }]);

})();
