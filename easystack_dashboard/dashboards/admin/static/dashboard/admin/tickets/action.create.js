/**
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
   * @ngDoc CreateTicketAction
   * @ngService
   *
   * @Description
   * Brings up the edit setting modal dialog.
   * On submit, edit user and display a success message.
   * On cancel, do nothing.
   */
  .factory('adminCreateTicketAction', [
  	'$modal', 'backDrop', 'horizon.framework.widgets.toast.service',
  	'horizon.openstack-service-api.ticket',
  function(modal, backDrop, toastService, ticketAPI) {
    var context = {
      title: 			gettext('Create Ticket'),
      submit:  			gettext('Create'),
      success: 			gettext('Ticket has been created successfully.'),
    };

     function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'ticket-form/',
        controller: 	'adminFormCreateTicketCtrl',
        backdrop:		backDrop,
        windowClass: 	'ticketContent',
        resolve: {
          ticket: 		function(){ return {}; },
          context: 	function(){ return context; }
        }
      };

      // open up the edit form
      self.open = function() {
          option.templateUrl = (window.WEBROOT || '') + 'admin/tickets/form/';
          modal.open(option).result.then(self.submit);
      };

      // submit this action to api
      self.submit = function(ticket) {
        ticketAPI.createTicket(ticket).success(function(response){
          var message = interpolate(context.success, [ticket.no]);
          toastService.add('success', gettext(message));
          if (scope.doPostCreateAction){
            scope.doPostCreateAction(response);
          }
        });
      };
    }
    return action;

  }]);

})();
