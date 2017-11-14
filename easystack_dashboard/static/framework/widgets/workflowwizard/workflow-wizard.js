(function () {
  'use strict';

  var extend = angular.extend;
  var forEach = angular.forEach;

  angular.module('horizon.framework.widgets.workflowwizard', ['ui.bootstrap'])

    .constant('horizon.framework.widgets.workflowwizard.labels', {
      cancel: gettext('Cancel'),
      back: gettext('Back'),
      next: gettext('Next'),
      finish: gettext('Finish')
    })

    .constant('horizon.framework.widgets.workflowwizard.events', {
      ON_INIT_SUCCESS: 'ON_INIT_SUCCESS',
      ON_INIT_ERROR: 'ON_INIT_ERROR',
      ON_SWITCH: 'ON_SWITCH',
      ON_NEXT_SWITCH: "ON_NEXT_SWITCH",
      BEFORE_SUBMIT: 'BEFORE_SUBMIT',
      AFTER_SUBMIT: 'AFTER_SUBMIT'
    })

    .directive('workflowWizard', ['horizon.framework.widgets.basePath', function (path) {
      return {
        controller: [
          '$scope',
          '$q',
          'horizon.framework.widgets.workflowwizard.labels',
          'horizon.framework.widgets.workflowwizard.events',
          function ($scope, $q, wizardLabels, wizardEvents) {
            var viewModel = $scope.viewModel = {};
            var initTask = $q.defer();

            $scope.initPromise = initTask.promise;
            $scope.currentIndex = -1;
            $scope.workflow = $scope.workflow || {};
            var steps = $scope.steps = $scope.workflow.steps || [];
            $scope.wizardForm = {};

            viewModel.btnText = extend({}, wizardLabels, $scope.workflow.btnText);
            viewModel.err = $scope.workflow.err ;
            viewModel.btnIcon = $scope.workflow.btnIcon || {};
            viewModel.showSpinner = false;
            viewModel.hasError = false;
            viewModel.disabled = false;

            function switchTo(index) {
              /**
               * In each step's controller, $scope.$index can be used by the step
               * to identify itself. For example:
               *
               * var comingToMe = (event.to === $scope.$index);
               */

              if(index>$scope.currentIndex){
                if($scope.wizardForm[$scope.steps[$scope.currentIndex].formName]){
                  if($scope.wizardForm[$scope.steps[$scope.currentIndex].formName].$invalid){
                    return;
                  }
                }
                $scope.$broadcast(wizardEvents.ON_NEXT_SWITCH, {
                  from: $scope.currentIndex,
                  to: index
                });
                //$scope.currentIndex = index;
                return;
              }
              $scope.$broadcast(wizardEvents.ON_SWITCH, {
                from: $scope.currentIndex,
                to: index
              });
              $scope.currentIndex = index;
              $scope.openHelp = false;
            }

            function showError(errorMessage) {
              viewModel.showSpinner = false;
              viewModel.errorMessage = errorMessage;
              viewModel.hasError = true;
              viewModel.disabled = false;
            }

            function beforeSubmit() {
              $scope.$broadcast(wizardEvents.BEFORE_SUBMIT);
            }

            function afterSubmit() {
              $scope.$broadcast(wizardEvents.AFTER_SUBMIT);
              //$scope.close();
            }

            function onClickFinishBtn() {
              beforeSubmit();
              $scope.submit().then(afterSubmit, showError);
              viewModel.disabled = true;
              $scope.close();
            }

            $scope.switchTo = switchTo;
            $scope.showError = showError;
            viewModel.onClickFinishBtn = onClickFinishBtn;

            $scope.initPromise.then(
              function () {
                $scope.$broadcast(wizardEvents.ON_INIT_SUCCESS);
              },
              function () {
                $scope.$broadcast(wizardEvents.ON_INIT_ERROR);
              }
            );

            /**
             * Each step in the workflow can provide an optional `checkReadiness`
             * method, which should return a promise. When this method is provided
             * with a step, the `.ready` property of the step will be set to
             * `false` until the promise gets resolved. If no `checkReadiness` method
             * is provided, the `.ready` property of the step will be set to `true`
             * by default.
             *
             * This is useful for workflows where some steps are optional and/or
             * displayed to the UI conditionally, and the check for the condition
             * is an asynchronous operation.
             *
             * @return {Promise} This promise gets resolved when all the checking
             * for each step's promises are done.
             *
             * @example

              ```js
                var launchInstanceWorkFlow = {
                  //...
                  steps: [
                    // ...
                    {
                      title: gettext('Network'),
                      templateUrl: path + 'launch-instance/network/network.html',
                      helpUrl: path + 'launch-instance/network/network.help.html',
                      formName: 'launchInstanceNetworkForm',

                      checkReadiness: function () {
                        var d = $q.defer();
                        setTimeout(function () {
                          d.resolve();
                        }, 500);
                        return d.promise;
                      }
                    }
                    //...
                  ],
                  //...
                };
              ```
             */
            function checkAllReadiness() {
              var stepReadyPromises = [];

              forEach(steps, function (step, index) {
                step.ready = !step.checkReadiness;

                if (step.checkReadiness) {
                  var promise = step.checkReadiness();
                  stepReadyPromises.push(promise);
                  promise.then(
                    function () {
                      step.ready = true;
                    },
                    function () {
                      $scope.steps.splice(index, 1);
                    }
                  );
                }
              });

              viewModel.ready = (stepReadyPromises.length === 0);
              return $q.all(stepReadyPromises);
            }

            function switchToFirstReadyStep() {
              forEach(steps, function (step, index) {
                if ($scope.currentIndex < 0 && step.ready) {
                  $scope.currentIndex = index;
                  return;
                }
              });
            }

            // angular promise doesn't have #always method right now,
            // this is a simple workaround.
            function always() {
              initTask.resolve();
              viewModel.ready = true;
              switchToFirstReadyStep();
            }

            checkAllReadiness().then(always, always);
          }],
        templateUrl: path + 'workflowwizard/workflow-wizard.html'
      };
    }
    ]);

})();
