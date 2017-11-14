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

   angular.module('hz.dashboard.project.volumes')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('volumeDetailAction', ['horizon.openstack-service-api.cinder', '$modal', 'backDrop','$rootScope',
  function(cinderAPI, modal, backdrop, rootScope) {

    var context = {
    };
    context.title = {
      "Overview": gettext("Overview"),
      "Snapshot": gettext("Snapshot"),
      "Info": gettext("Info"),
      "Backup":   gettext('Backup')
    };

    context.error = {
      "noAttached": gettext('No Attached')
    };

    context.label = {
      "ID": gettext("ID"),
      "Name": gettext("Name"),
      "Size": gettext("Size"),
      "Status": gettext("Status"),
      "created_at": gettext('Create Time'),
      "backup_time":gettext('Backup Time'),
      "attached_to": gettext('Attachments'),
      "attached_mode": gettext('Attached Mode')
    };

    context.header = {
      name: gettext('Name'),
      description: gettext('Description'),
      size: gettext('Size'),
      state: gettext('State '),
      created_at: gettext('Create Time'),
      backup_time:gettext('Backup Time'),
      type:gettext('Type'),
    };

    var ctrl = {
          'active': gettext("Active"),
          'saving': gettext("Saving"),
          'queued': gettext("Queued"),
          'pending_delete': gettext("Pending Delete"),
          'killed': gettext("Killed"),
          'deleted': gettext("Deleted")
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'volume-detail',
        controller: 'volumeDetailForm',
        backdrop:   backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(volumeData){
        option.resolve.detail = function(){ return { "volumeData": volumeData }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/volumes/detail/';
        modal.open(option);
      };

    }

    return action;
  }]);

})();


