/**
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngdoc hz.dashboard.settings.ticket
   * @ngModule
   *
   * @description
   * Provides all of the services and widgets required
   * to support and display the identity users panel.
   */
angular.module('hz.dashboard.settings.ticket', [])

  .controller('ticketTopBarController', ['$scope', '$timeout', 'createTicketAction',
  'horizon.openstack-service-api.ticket', '$q',
    function(scope, $timeout, CreateTicketAction, ticketAPI, $q) {

      var self = this;
      scope.statusMap = {
      'Open' : {name : 'Open', id :null},
      'In Process' : {name : 'In Process', id : null},
      'Solved' : {name : 'Solved', id : null},
      'Closed' : {name : 'Closed', id : null}
    };
      scope.context = {
          tips: gettext('You have<span>&nbsp;%s&nbsp;</span>tickets to solve')
      };

      scope.actions = {
        create : new CreateTicketAction(scope)
      };

      scope.showTickets = function(){
        self.loadTicket();
      };

    this.loadTicket = function(){

      ticketAPI.getStatus().success(function(response){
        var statuses = response.items;
        if (statuses) {
          statuses.forEach(function(status) {
            if (scope.statusMap[status.name]){
              scope.statusMap[status.name].id = status.id;
            }
          });
        }

        scope.tickets = [];
        scope.ticketState = false;
        scope.ticketTips = "";
        var openPromise = self.getTickets({ all_projects : false, status_id : scope.statusMap['Open'].id});
        var inProcessPromise = self.getTickets({ all_projects : false, status_id : scope.statusMap['In Process'].id});
        $q.all([openPromise, inProcessPromise]).then(
            function(data){
                var openTickets = data[0];
                var inProcessIickets = data[1];
                var items = [].concat(openTickets, inProcessIickets);
                scope.tickets = items;
                scope.ticketState = true;
                scope.ticketTips = interpolate(scope.context.tips, [scope.tickets.length]);
                for (var i = 0; i < scope.tickets.length; i++){
                    try{
                        scope.tickets[i].create_at = new Date(scope.tickets[i].create_at).getTime();
                    } catch(e){
                    }
                 }
            },
            function(response){
                scope.tickets = [];
                scope.ticketState = true;
                scope.ticketTips = interpolate(scope.context.tips, [scope.tickets.length]);
            });
       });
    };

    this.getTickets = function(params){
      return ticketAPI.listTickets(params).then(function(response) {
        var items = response.data.items;
        return items;
       })
    };

      function init() {
        scope.tickets = [];
        scope.ticketState = false;
        scope.ticketTips = "";
        scope.doPostCreateAction = self.doPostCreateAction;
      }

      init();

  }]);

})();