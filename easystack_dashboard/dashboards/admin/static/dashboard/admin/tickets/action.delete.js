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

  angular.module('hz.dashboard.admin.tickets')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('adminDeleteTicketAction', ['horizon.openstack-service-api.ticket',
          'horizon.framework.widgets.modal.service','horizon.framework.widgets.toast.service',
  function(ticketAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Ticket'),
      message: gettext('The amount of tickets these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Ticket'),
      success: gettext('Deleted Ticket: %s.'),
      error: gettext('Deleted Ticket: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function() {
        var ids = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ids.push(row.item.id);
              names.push({
                id: row.item.id,
                name: row.item.no
              });
            }
        });
        self.confirmDelete(ids, names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, names);
        });
      };


      // on success, remove ticket from the model
      // need to also remove deleted ticket from selected list
      self.submit = function(ids, namelist) {
        for (var i = 0; i < ids.length; i++) {
          self.deleteTicket(ids[i], namelist[i]['name']);
        }
      };

      self.deleteTicket = function(id, name) {
        ticketAPI.deleteTicket(id)
          .success(function(result) {
            var message = interpolate(context.success, [name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
            scope.tickets.removeId(id);
          });
      };


    }

    return action;

  }]);

})();