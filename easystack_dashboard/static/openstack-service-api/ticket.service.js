/**
 * Copyright 2015 EasyStack Inc.
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

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.ticket', TicketAPI);

  TicketAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service',
  ];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.ticket
   * @description Provides access to Ticket APIs.
   */
  function TicketAPI(apiService, toastService) {

    this.listTickets = function(params) {
      var config = {};
      if (params) {
        config.params = params;
      }
      return apiService.get('/api/tickets/tickets/', config).error(function() {
        toastService.add('error', gettext('Unable to retrieve tickets.'));
      });
    };

    this.createTicket = function(ticket) {
      return apiService.post('/api/tickets/tickets/', ticket).error(function() {
        toastService.add('error', gettext('Unable to create ticket.'));
      });
    };

    this.getTicket = function(ticket_id) {
      return apiService.get('/api/tickets/tickets/' + ticket_id).error(function() {
        toastService.add('error', gettext('Unable to retrieve ticket.'));
      });
    };

    this.deleteTicket = function(ticket_id) {
      return apiService.delete('/api/tickets/tickets/' + ticket_id).error(function() {
        toastService.add('error', gettext('Unable to delete ticket.'));
      });
    };

    this.updateTicket = function(ticket_id, ticket) {
      return apiService.patch('/api/tickets/tickets/' + ticket_id, ticket).error(function() {
        toastService.add('error', gettext('Unable to update ticket.'));
      });
    };

    this.listTypes = function() {
      return apiService.get('/api/tickets/types/').error(function() {
        toastService.add('error', gettext('Unable to get ticket types.'));
      });
    };

    this.getAttachment = function(attachment_id) {
      return apiService.get('/api/tickets/attachments/' + attachment_id).error(function() {
        toastService.add('error', gettext('Unable to get attachment.'));
      });
    };

    this.createAttachment = function(attachment) {
      return apiService.post('/api/tickets/attachments/', attachment).error(function() {
        toastService.add('error', gettext('Unable to create attachment.'));
      });
    };

    this.createReply = function(reply) {
      return apiService.post('/api/tickets/replies/', reply).error(function() {
        toastService.add('error', gettext('Unable to create reply.'));
      });
    };

    this.getRepliesByTicketId = function(ticket_id) {
      return apiService.get('/api/tickets/tickets/' + ticket_id + '/replies/').error(function() {
        toastService.add('error', gettext('Unable to get replies for the current ticket.'));
      });
    };

    this.getStatus = function() {
      return apiService.get('/api/tickets/statuses/').error(function() {
        toastService.add('error', gettext('Unable to get ticket status list.'));
      });
    };

  }
}());
