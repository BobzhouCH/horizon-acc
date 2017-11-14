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
   * @ngDoc editTicketStatusAction
   * @ngService
   *
   * @Description
   * Brings up the edit ticket status modal dialog.
   * On submit, edit instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('adminEditTicketStatusAction', ['horizon.openstack-service-api.ticket',
                                  '$modal',
                                  'backDrop',
                                  'horizon.framework.widgets.toast.service',
  function(ticketAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Edit Status'),
      submit: gettext('Save'),
      success: gettext('Ticket %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'edit-status-form',
        controller: 'adminFormEditStatusCtrl',
        backdrop: backDrop,
        resolve: {
          ticket: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      // open up the edit form
      self.open = function(tickets) {
        var clone = angular.copy(tickets[0]);
        option.resolve.ticket = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit(tickets[0], clone);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(ticket) {
        return {
            "status_id": ticket.status_id,
        };
      };

      // submit this action to api
      // and update ticket object on success
      self.submit = function(ticket, clone) {
        var cleanedTicket = self.clean(clone);
        ticketAPI.updateTicket(ticket.id, cleanedTicket)
          .success(function(response) {
            var message = interpolate(context.success, [ticket.no]);
            toastService.add('success', gettext(message));
            ticket.status_id = response.status_id;
            ticket.status_name = scope.statusIdMap[response.status_id]
              && scope.statusIdMap[response.status_id].name;
            scope.clearSelected();
          });
      };
    }

    return action;
  }]);

})();
