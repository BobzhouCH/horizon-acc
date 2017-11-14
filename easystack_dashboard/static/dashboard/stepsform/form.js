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

  angular.module('hz.dashboard.mana')

  /**
   * @ngdoc formCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit user form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('stepsFormCtrl', [
    '$scope', '$modalInstance', 'context', 'config',
    function(scope, modalInstance, context, config) {
      var i=0,stepsLength,stepWidth;

      scope.steps = config.steps;
      scope.rightTemplate = config.rightTemplate;
      scope.broadcastName = config.broadcastName;
      stepsLength = scope.steps.length;
      scope.context = context;

      scope.action =  {
        submit: function() { modalInstance.close(scope.stepsResult); },
        cancel: function() { modalInstance.dismiss('cancel'); }
      };

      scope.upShow      = false;
      scope.dwShow      = true;
      scope.submitShow  = false;
      scope.stepsInvalid = {};
      scope.stepsResult = {};

      scope.slide = {

        init: function(state){
          if(state === -1){
            i--;
            this.leftGlide();
            this.glide();
          }
          else if(state === 1){
            i++;
            this.rightGlide();
            this.glide();
          }
          this.slideTitle();
          buttonShow();
        },

        leftGlide: function(){
          if(i<stepsLength-1){
            scope.dwShow      = true;
            scope.upShow      = true;
          }
          if(i<=0){
            i = 0;
            scope.upShow      = false;
          }
          scope.submitShow  = false;
        },

        rightGlide: function(){
          scope.upShow = true;
          if(i>=stepsLength-1){
            i = stepsLength-1;
            scope.dwShow = false;
            scope.submitShow  = true;
          }
        },

        slideTitle: function(){
          var stepList = $('.js-step-list li');
          stepList.removeClass('active');
          stepList.eq(i).addClass('active');
        },

        glide: function(){
          if(!stepWidth){
            stepWidth = $('.js-steps-content').parent().width();
          }
          $('.js-steps-content').animate({
             left: -i*(stepWidth+10)
          }, 500);
        }

      };

      //Buttons to show or hide
      function buttonShow(){
        var stepName = scope.steps[i]['formName'];
        scope.disable = scope.stepsInvalid[stepName];
        scope.submitDisable = scope.stepsInvalid[stepName];
      }

      //broadcast data: {name: '...', invalid: true/false, result: object}
      scope.$on(scope.broadcastName, function(event, data){
        scope.stepsInvalid[data.name] = data.invalid;
        scope.stepsResult[data.name] = data.result;
        buttonShow();
      });
  }]);
})();