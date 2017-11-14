(function() {
  'use strict';

  angular
    .module('hz.dashboard.admin.tickets')
    .factory('adminTicketsDetailAction', [
      '$modal', 'backDrop',
      function(modal, backDrop){
        var context = {};

        context.title = {
          "Detail": gettext("Detail")
        };

        function action(scope){
          var self = this,
              option = {
                templateUrl: 'ticket-detail/',
                controller:  'adminTicketDetailForm',
                windowClass: 'detailContent',
                backdrop:   backDrop,
                resolve: {
                  ticket: function(){ return null; },
                  context: function(){ return context; }
                }
              };

          ///////////////

          self.open = function(ticket){
            option.resolve.ticket = function(){ return ticket; };
            modal.open(option);
          };
        };

        return action;
      }
    ])

    /*
     * 
     * Details of change state function
     * 
    */
    .factory('adminUpdateTicketStatusAction', [
      'horizon.openstack-service-api.ticket',
      'horizon.framework.widgets.toast.service',
      function(ticketAPI,toastService){

        var statusMap = {
          'Open' : {name : 'Open', id :null},
          'In Process' : {name : 'In Process', id : null},
          'Solved' : {name : 'Solved', id : null},
          'Closed' : {name : 'Closed', id : null}
        };

        var context = {
          success: gettext('Ticket %s has been updated successfully.')
        };

        function action(scope){

          var self = this;

          this.getTicketStatuses = function(){
            ticketAPI.getStatus().success(function(response){
              var statuses = response.items;
              if (statuses) {
                statuses.forEach(function(status) {
                  if (statusMap[status.name]){
                    statusMap[status.name].id = status.id;
                  }
                });
              }
             });
          };

          self.update = function(status_name){
            var status_id = statusMap[status_name] && statusMap[status_name].id;
            if(!status_id) {
              return;
            }
            var params = {
                "status_id": status_id,
            };
            ticketAPI.updateTicket(scope.ticket.id, params)
              .success(function(response) {
                var message = interpolate(context.success, [scope.ticket.no]);
                toastService.add('success', gettext(message));
                scope.ticket.status_name = status_name;
                scope.ticket.status_id = response.status_id;
              });
          };

          function init(){
            self.getTicketStatuses();
          };

          init();
        };

        return action;
      }
    ]);

})();
