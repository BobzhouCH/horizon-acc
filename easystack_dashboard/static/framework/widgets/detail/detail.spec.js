/*
 *    (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  "use strict";

  describe("Detail Features", function() {

    var digestMarkup = function(scope, compile, markup) {
      var element = angular.element(markup);
      compile(element)(scope);

      scope.$digest();
      return element;
    };

    // hz is needed for things like setting the interpolators.
    beforeEach(module('templates'));
    beforeEach(module('horizon.framework'));
    beforeEach(module('horizon.framework.detail'));

    describe("Directives", function() {
      var $scope, $compile;

      // basePath is only used by those that need external templates
      beforeEach(module(function($provide) {
        $provide.value('basePath', '/static/framework/');
      }));

      // only needed by those that need external templates
      beforeEach(module('templates'));

      beforeEach(inject(function($injector) {
        $compile = $injector.get('$compile');
        $scope = $injector.get('$rootScope').$new();
      }));

      describe("detailHeader", function() {

        it("defines basic elements", function() {
          $scope.scopeTitle = "A Title";
          $scope.scopeDesc = "A Description";
          var markup = '<hz-detail-header title="scopeTitle" ' +
                       'description="scopeDesc"><a href="#"></a></hz-detail-header>';

          var $element = digestMarkup($scope, $compile, markup);

          expect($element).toBeDefined();
          expect($element.find('.detail-header').length).toBe(1);
          expect($element.find('h1').length).toBe(1);
          expect($element.find('h1').text()).toBe("A Title");
          expect($element.find('p').length).toBe(1);
          expect($element.find('p').text()).toBe("A Description");
        });

      });

      describe("propertyGroups", function() {

        it("creates a div with a class of 'row'", function() {
          var markup = '<hz-property-groups><a href="#"></a></hz-property-groups>';
          var $element = digestMarkup($scope, $compile, markup);
          expect($element.find("div.row").length).toBe(1);
        });

      });

      describe("propertyGroup", function() {

        it("creates an element spanning half the width", function() {
          $scope.someLabel = "My Label";
          var markup = '<hz-property-group label="someLabel" layout="block">' +
            '<a href="#"></a></hz-property-group>';
          var $element = digestMarkup($scope, $compile, markup);
          expect($element.find("div.col-md-6").length).toBe(1);
        });

        it("creates an h3 element with the label", function() {
          $scope.someLabel = "My Label";
          var markup = '<hz-property-group label="someLabel" layout="block">' +
            '<a href="#"></a></hz-property-group>';
          var $element = digestMarkup($scope, $compile, markup);
          expect($element.find("h3").length).toBe(1);
          expect($element.find("h3").html()).toBe('My Label');
        });

        it("creates div with class of 'detail-statuses'", function() {
          var markup = '<hz-property-group><a href="#"></a></status-group>';
          var $element = digestMarkup($scope, $compile, markup);
          expect($element.find("div.detail-statuses").length).toBe(1);
        });

      });

      describe("property", function() {

        it("creates label and value elements", function() {
          $scope.someLabel = "My Label";
          $scope.someValue = "My Value";
          var markup = '<hz-property label="someLabel" value="someValue"></hz-property>';
          var $element = digestMarkup($scope, $compile, markup);
          expect($element.find("b").length).toBe(1);
          expect($element.find("div b").html()).toBe('My Label');
          expect($element.text().trim()).toBe('My Label My Value');
        });

        it("outputs block-style notation if specified", function() {
          $scope.someLabel = "My Label";
          $scope.someValue = "My Value";
          var markup = '<hz-property-group layout="block">' +
            '<hz-property label="someLabel" value="someValue">' +
            '</hz-property></hz-property-group>';
          var $element = digestMarkup($scope, $compile, markup);

          expect($element.find("dt").length).toBe(1);
          expect($element.find("dt").html()).toBe('My Label');
          expect($element.find("dd").length).toBe(1);
          expect($element.find("dd").html()).toBe('My Value');
        });
      });

    });

  });

})();
