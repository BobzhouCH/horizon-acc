/*
*    (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
*
* Licensed under the Apache License, Version 2.0 (the 'License');
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an 'AS IS' BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function() {
  'use strict';

  describe('Launch Instance Tests', function() {

    beforeEach(module('hz.dashboard'));

    it('should be defined.', function () {
      expect(angular.module('hz.dashboard.aws-launch-instance')).toBeDefined();
    });

    describe('AwslaunchInstanceWorkflow', function () {
      var AwslaunchInstanceWorkflow;

      beforeEach(module(function($provide) {
        // Need to mock hz.framework.workflow from 'horizon'
        var workflow = function(spec, decorators) {
          angular.forEach(decorators, function(decorator) {
            decorator(spec);
          });
          return spec;
        };

        $provide.value('horizon.openstack-service-api.serviceCatalog', {});
        $provide.value('horizon.framework.util.workflow.service', workflow);
      }));

      beforeEach(inject(function ($injector) {
        AwslaunchInstanceWorkflow = $injector.get('AwslaunchInstanceWorkflow');
      }));

      it('should be defined', function () {
        expect(AwslaunchInstanceWorkflow).toBeDefined();
      });

      it('should have a title property', function () {
        expect(AwslaunchInstanceWorkflow.title).toBeDefined();
      });

      it('should have the six steps defined', function () {
        expect(AwslaunchInstanceWorkflow.steps).toBeDefined();
        expect(AwslaunchInstanceWorkflow.steps.length).toBe(6);

        var forms = [
          'AwslaunchInstanceSourceForm',
          'AwslaunchInstanceFlavorForm',
          'AwslaunchInstanceNetworkForm',
          'AwslaunchInstanceAccessAndSecurityForm',
          'AwslaunchInstanceKeypairForm',
          'AwslaunchInstanceConfigurationForm'
        ];

        forms.forEach(function(expectedForm, idx) {
          expect(AwslaunchInstanceWorkflow.steps[idx].formName).toBe(expectedForm);
        });
      });

      it('specifies that the network step requires the network service type', function() {
        expect(AwslaunchInstanceWorkflow.steps[2].requiredServiceTypes).toEqual(['network']);
      });
    });

    describe('AwslaunchInstanceWizardModalSpec', function () {
      var AwslaunchInstanceWizardModalSpec;

      beforeEach(inject(function ($injector) {
        AwslaunchInstanceWizardModalSpec = $injector.get('AwslaunchInstanceWizardModalSpec');
      }));

      it('should be defined', function () {
        expect(AwslaunchInstanceWizardModalSpec).toBeDefined();
      });
    });

    describe('AwsLaunchInstanceWizardCtrl', function() {
      var ctrl;
      var model = {
        createInstance: function() {
          return 'created';
        },
        initialize: angular.noop
      };

      var scope = {};

      beforeEach(module(function ($provide) {
        $provide.value('serviceCatalog', {});
        $provide.value('AwslaunchInstanceModel', model);
      }));

      beforeEach(inject(function ($controller) {
        spyOn(model, 'initialize');
        var locals = {
          $scope: scope,
          AwslaunchInstanceWorkflow: { thing: true }
        };
        ctrl = $controller('AwsLaunchInstanceWizardCtrl', locals);
      }));

      it('defines the controller', function() {
        expect(ctrl).toBeDefined();
      });

      it('calls initialize on the given model', function() {
        expect(scope.model.initialize).toHaveBeenCalled();
      });

      it('sets scope.workflow to the given workflow', function() {
        expect(scope.workflow).toEqual({ thing: true });
      });

      it('defines scope.submit', function() {
        expect(scope.submit).toBeDefined();
        expect(scope.submit()).toBe('created');
      });

    });

    describe('AwsLaunchInstanceModalCtrl', function() {
      var ctrl;
      var modal;
      var scope;
      var $window;

      beforeEach(module(function($provide) {
        modal = {
          open: function() {
            return {
              result: {
                then: angular.noop
              }
            };
          }
        };
        $window = { location: { href: '/' } };

        $provide.value('$modal', modal);
        $provide.value('$modalSpec', {});
        $provide.value('$window', $window);
      }));

      beforeEach(inject(function($controller) {
        scope = {};
        ctrl = $controller('AwsLaunchInstanceModalCtrl', { $scope: scope });
      }));

      it('defines the controller', function() {
        expect(ctrl).toBeDefined();
      });

      it('defines openLaunchInstanceWizard', function() {
        expect(scope.openLaunchInstanceWizard).toBeDefined();
      });

      describe('openLaunchInstanceWizard function tests', function() {
        var func;
        var launchContext;

        beforeEach(function() {
          func = scope.openLaunchInstanceWizard;
          launchContext = {};
        });

        it('calls modal.open', function() {
          spyOn(modal, 'open').and.returnValue({ result: { then: angular.noop } });
          func(launchContext);
          expect(modal.open).toHaveBeenCalled();
        });

        it('calls modal.open with expected values', function() {
          spyOn(modal, 'open').and.returnValue({ result: { then: angular.noop } });
          launchContext = { info: 'information' };
          func(launchContext);

          var resolve = modal.open.calls.argsFor(0)[0].resolve;
          expect(resolve).toBeDefined();
          expect(resolve.launchContext).toBeDefined();
          expect(resolve.launchContext()).toEqual({ info: 'information' });
        });

        it('sets up the correct success and failure paths', function() {
          var successFunc;
          var errFunc;

          launchContext = { successUrl: '/good/path', dismissUrl: '/bad/path' };
          spyOn(modal, 'open').and
            .returnValue({
              result: {
                then: function(x, y) { successFunc = x; errFunc = y; }
              }
            });
          func(launchContext);
          successFunc('successUrl');
          expect($window.location.href).toBe('/good/path');
          errFunc('dismissUrl');
          expect($window.location.href).toBe('/bad/path');
        });

        it("doesn't redirect if not configured to", function() {
          var successFunc;
          var errFunc;
          launchContext = {};
          spyOn(modal, 'open').and
            .returnValue({
              result: {
                then: function(x, y) { successFunc = x; errFunc = y; }
              }
            });
          func(launchContext);
          successFunc('successUrl');
          expect($window.location.href).toBe('/');
          errFunc('dismissUrl');
          expect($window.location.href).toBe('/');
        });
      });
    });
  });
})();
