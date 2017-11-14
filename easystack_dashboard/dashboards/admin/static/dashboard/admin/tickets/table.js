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
   * @ngdoc adminTicketsCtrl
   * @ngController
   *
   * @description
   * Controller for the admin images table.
   * Serve as the focal point for table actions.
   */
  .controller('adminTicketsCtrl', [
    '$scope', 'horizon.openstack-service-api.ticket',
    'adminCreateTicketAction', 'adminEditTicketStatusAction', 'adminDeleteTicketAction',
    'horizon.framework.widgets.toast.service',
    'adminTicketsDetailAction','horizon.openstack-service-api.policy',
    function( scope, ticketAPI, CreateAction, EditStatusAction, DeleteAction, toastService,
       TicketsDetailAction, PolicyService) {
    var self = this;
    scope.statusMap = {
      'Open' : {name : 'Open', id :null, text: gettext('Open')},
      'In Process' : {name : 'In Process', id : null, text: gettext('In Process')},
      'Solved' : {name : 'Solved', id : null, text: gettext('Solved')},
      'Closed' : {name : 'Closed', id : null, text: gettext('Closed')}
    };
    scope.statusIdMap = {};
    scope.context = {
      header: {
        ticket_no: gettext('Ticket No.'),
        title: gettext('Title'),
        user: gettext('User'),
        project_id: gettext('Project ID'),
        project_name: gettext('Project Name'),
        ticket_type: gettext('Ticket Type'),
        status: gettext('Status'),
        update_time: gettext('Updated Time'),
        create_time: gettext('Created Time'),
      },
      typeName : {
          'Compute' : gettext('Compute'),
          'Network' : gettext('Network'),
          'Storage' : gettext('Storage'),
          'Management' : gettext('Management'),
          'Authority' : gettext('Authority'),
          'Others' : gettext('Others')
      }
    };

    scope.showContext = {
      cur_show_status : 'All',
      cur_type_id : null
    };

    scope.clearSelected = function(){
      return scope.$table && scope.$table.resetSelected();
    };

    this.getTickets = function(params){
      ticketAPI.listTickets(params).success(function(response) {
        scope.tickets = [].concat(scope.tickets, response.items);
        scope.iticketState = true;
       }).error(function(){
        scope.iticketState = true;
      });
    };

    this.getTicketStatuses = function(){
      ticketAPI.getStatus().success(function(response){
        var statuses = response.items;
        if (statuses) {
          statuses.forEach(function(status) {
            if (scope.statusMap[status.name]){
              scope.statusMap[status.name].id = status.id;
              scope.statusIdMap[status.id] = scope.statusMap[status.name]
            }
          });
        }
       });
    };

    this.getTicketTypes = function(){
      ticketAPI.listTypes().success(function(response){
        if (response && response.items) {
            angular.forEach(response.items, function(type){
                type.type_name = scope.context.typeName[type.name] || type.name;
            });
            scope.types = response.items;
        }
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
      var params = {
        all_projects : true,
        type_id : scope.showContext.cur_type_id
      };
      if (!params.type_id){
        delete params.type_id;
      }
      if (scope.showContext.cur_show_status == 'All') {
        self.getTickets(params);
      } else if (scope.showContext.cur_show_status == 'Solved') {
        params.status_id = scope.statusMap['Solved'].id;
        params.status_id && self.getTickets(params);
        var params2 = angular.copy(params);
        params2.status_id = scope.statusMap['Closed'].id;
        params2.status_id && self.getTickets(params2);
      } else if (scope.showContext.cur_show_status == 'Unsolved') {
        params.status_id = scope.statusMap['Open'].id;
        params.status_id && self.getTickets(params);
        params2 = angular.copy(params);
        params2.status_id = scope.statusMap['In Process'].id;
        params2.status_id && self.getTickets(params2);
      }

    };
    scope.doPostCreateAction = function(ticket){
      scope.showContext = {
        cur_show_status : 'All',
        cur_type_id : null
      };
      scope.actions.refresh();
    };

    this.download = function(){
     window.location.href = (window.WEBROOT || '') + 'admin/tickets/tickets-download/?all_projects=true';
    };

    scope.actions = {
      refresh: self.refresh,
      download: self.download,
      create: new CreateAction(scope),
      edit: new EditStatusAction(scope),
      deleted: new DeleteAction(scope),
      detail: new TicketsDetailAction(scope)
    };

    scope.change = function(status) {
      if (status) {
        scope.showContext.cur_show_status = status;
      }
      scope.actions.refresh();
    }

    // fetch table data and populate it
    this.init = function(){
        PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
        .success(function(response) {
          if (response.allowed) {
            self.getTicketStatuses();
            self.getTicketTypes();
            self.refresh();
            scope.dUrl = (window.WEBROOT || '') + 'admin/tickets/tickets-download/?all_projects=true';
          } else {
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
          }
        });
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
      label: gettext('Project Name'),
      name: 'project_name',
      singleton: true
    },{
      label: gettext('Project ID'),
      name: 'requester_project_id',
      singleton: true
    },{
      label: gettext('Ticket Type'),
      name: 'type_name',
      singleton: true,
      options: [
        { label: scope.context.typeName.Compute, key: 'Compute' },
        { label: scope.context.typeName.Network, key: 'Network' },
        { label: scope.context.typeName.Storage, key: 'Storage' },
        { label: scope.context.typeName.Management, key: 'Management' },
        { label: scope.context.typeName.Authority, key: 'Authority' },
        { label: scope.context.typeName.Others, key: 'Others' }
      ]
    },{
      label: gettext('Status'),
      name: 'status_name',
      singleton: true,
      options: [
        { label: scope.statusMap['Open'].text, key: 'Open' },
        { label: scope.statusMap['In Process'].text, key: 'In Process' },
        { label: scope.statusMap['Solved'].text, key: 'Solved' },
        { label: scope.statusMap['Closed'].text, key: 'Closed' }
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

  }])
  .filter('transTicketStatus', function(){

    var statusMapping = {
      'Open' : gettext('Open'),
      'In Process' : gettext('In Process'),
      'Solved' : gettext('Solved'),
      'Closed' : gettext('Closed')
    };

    return function(status_name){
      var result = statusMapping[status_name];

      return result || status_name;
    };
  })

  .filter('transTicketType', function(){

    var typeMapping = {
      'Compute' : gettext('Compute'),
      'Network' : gettext('Network'),
      'Storage' : gettext('Storage'),
      'Management' : gettext('Management'),
      'Authority' : gettext('Authority'),
      'Others' : gettext('Others')
    };

    return function(type_name){
      var result = typeMapping[type_name];
      return result || type_name;
    };
  });

})();
