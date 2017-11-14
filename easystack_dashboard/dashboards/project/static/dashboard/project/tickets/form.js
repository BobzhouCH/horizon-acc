/**
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
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
   * @ngdoc formCreateTicketCtrl
   * @ng-controller
   *
   * @description
   * This controller is setting for the create ticket form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('formCreateTicketCtrl', [
    '$scope', '$modalInstance', 'ticket', 'context',
    'horizon.openstack-service-api.ticket',
    function(scope, modalInstance, ticket, context, ticketAPI) {
    
      var action 	= {
        submit: function() { modalInstance.close(ticket); },
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      function getTicketTypes(){
        ticketAPI.listTypes().success(function(response){
          scope.types = response.items;
        });
      }

      function init(){
        scope.context = context;
        scope.ticket 	= ticket;
        scope.action 	= action;
        getTicketTypes();
      }

      init();

    }])

  /**
   * @ngdoc formEditStatusCtrl
   * @ng-controller
   *
   * @description
   * This controller is setting for the edit ticket status form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */

  .controller('formEditStatusCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'ticket', 'context','horizon.openstack-service-api.ticket',
    function(scope, rootScope,
      modalInstance, ticket, context,ticketAPI
    ) {
      var dropdown = {};
      var action = {
        submit: function() {
          modalInstance.close(ticket);
        },
        cancel: function() {
          modalInstance.dismiss('cancel');
        },
      };

      scope.context = context;
      scope.ticket = ticket;
      scope.action = action;

      function init() {
        ticketAPI.getStatus().success(function(response){
          scope.statuses = response.items;
        });
      }

      init();
    }
  ])

  /**
   * @ngdoc TicketDetailForm
   * @ng-controller
   *
   * @description
   * This controller is ticket detail for the action.detail.js.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */

  .controller('TicketDetailForm', [
    '$scope',
    '$timeout',
    '$modalInstance',
    'ticket',
    'context',
    'updateTicketStatusAction',
    'horizon.openstack-service-api.ticket',
    function(
      scope,
      $timeout,
      modalInstance,
      ticket,
      context,
      UpdateTicketStateAction,
      ticketAPI
    ){
      var self = this;
      var w = 700;
      var action = {
        cancel: function() {
          $('.detailContent').stop();
          $('.detailContent').animate({
            right: -(w + 40)
          }, 400, function() {
            modalInstance.dismiss('cancel');
          });
        }
      };

      var h = $(window).height();

      $timeout(function(){
        $('.detailContent').css({
            height: h,
            width: w,
            right: -w
          });
          $('.detailContent .tab-content').css({
            height: h-62
          });
          $('.detailContent').stop();
          $('.detailContent').animate({
              right: 0
          },400)
          .css('overflow', 'visible');
      });

      $(window).resize(function() {
        var w2 = 644;
        var h2 = $(window).height();
        $('.detailContent').css({
          width: w2,
          height: h2
        });
        $('.tab-content').css({
          height: h2-62
        });
      });


      this.getReplies = function(ticket_id) {
        ticketAPI.getRepliesByTicketId(ticket_id)
        .success(function(response){
          scope.replies = response.items ? response.items : [];
          scope.replyState = true;
        }).error(function(response){
          scope.replyState = true;
        });
      };

      this.createReply = function(form, content) {
        var params = {
          ticket_id : ticket.id,
          content : content
        };
        ticketAPI.createReply(params)
          .success(function(reply){
            if (!scope.replies){
              scope.replies = [];
            }
            scope.formData.replyContent = null;
            form.$setPristine();
            scope.replies.push(reply);
            $('.reply-list').animate({scrollTop: $('.reply-list').prop('scrollHeight')}, 600);
          });
      };

      scope.actions = {
        submitReply : self.createReply,
        status : new UpdateTicketStateAction(scope)
      };

      function init() {
        scope.formData = {replyContent: null};
        scope.replyState = false;
        scope.replies = [];
        scope.title = context.title;
        scope.ticket = ticket;
        scope.action = action;
        self.getReplies(ticket.id);
      }

      init();
  }]);

})();