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

  angular.module('hz.dashboard.project.tickets')

  /**
   * @ngdoc adminTicketsCtrl
   * @ngController
   *
   * @description
   * Controller for the admin images table.
   * Serve as the focal point for table actions.
   */
  .controller('ticketsCtrl', [
    '$scope', 'horizon.openstack-service-api.ticket',
    'createTicketAction', 'horizon.framework.widgets.toast.service',
    'ticketsDetailAction',
    function(
      scope, ticketAPI,
      CreateAction, toastService, TicketsDetailAction) {
    var self = this;

    scope.statusIdMap = {};
    scope.context = {
      header: {
        ticket_no: gettext('Ticket No.'),
        title: gettext('Title'),
        user: gettext('User'),
        ticket_type: gettext('Ticket Type'),
        status: gettext('Status'),
        update_time: gettext('Updated Time'),
        create_time: gettext('Created Time'),
      },
    };

    scope.ticketStatus = {
      'Open' : gettext('Open'),
      'In Process' : gettext('In Process'),
      'Solved' : gettext('Solved'),
      'Closed' : gettext('Closed')
    };

    scope.ticketTypes = {
      'Compute' : gettext('Compute'),
      'Network' : gettext('Network'),
      'Storage' : gettext('Storage'),
      'Management' : gettext('Management'),
      'Authority' : gettext('Authority'),
      'Others' : gettext('Others')
    };

    scope.clearSelected = function(){
      return scope.$table && scope.$table.resetSelected();
    };

    this.getTickets = function(){
      ticketAPI.listTickets().success(function(response) {
        scope.tickets = response.items;
        scope.iticketState = true;
       }).error(function(){
        scope.iticketState = true;
      });
    };

    this.reset = function(){
      scope.clearSelected();
      scope.tickets = [];
      scope.itickets = [];
      scope.iticketState= false;
      scope.checked = {};
      scope.selected = {};
    };

    this.refresh = function(){
      self.reset();
      self.getTickets();

    };
    scope.doPostCreateAction = function(ticket){
      scope.actions.refresh();
    }

    scope.actions = {
      refresh: self.refresh,
      create: new CreateAction(scope),
      detail: new TicketsDetailAction(scope)
    };

    // fetch table data and populate it
    this.init = function(){
      self.refresh();
    };

    scope.filterFacets = [{
      label: gettext('Ticket No.'),
      name: 'no',
      singleton: true
    },{
      label: gettext('Title'),
      name: 'title',
      singleton: true
    },{
      label: gettext('User'),
      name: 'user_name',
      singleton: true
    },{
      label: gettext('Ticket Type'),
      name: 'type_name',
      singleton: true,
      options: [
        { label: scope.ticketTypes.Compute, key: 'Compute' },
        { label: scope.ticketTypes.Network, key: 'Network' },
        { label: scope.ticketTypes.Storage, key: 'Storage' },
        { label: scope.ticketTypes.Management, key: 'Management' },
        { label: scope.ticketTypes.Authority, key: 'Authority' },
        { label: scope.ticketTypes.Others, key: 'Others' }
      ]
    },{
      label: gettext('Status'),
      name: 'status_name',
      singleton: true,
      options: [
        { label: scope.ticketStatus.Open, key: 'Open' },
        { label: gettext('In Process'), key: 'In Process' },
        { label: scope.ticketStatus.Solved, key: 'Solved' },
        { label: scope.ticketStatus.Closed, key: 'Closed' }
      ]
    },{
      label: gettext('Updated Time'),
      name: 'update_at',
      singleton: true
    },{
      label: gettext('Created Time'),
      name: 'create_at',
      singleton: true
    }];

    this.init();

  }]);

})();
