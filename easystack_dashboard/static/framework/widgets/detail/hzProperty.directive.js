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

  angular.module("horizon.framework.widgets.detail")
    .directive('hzProperty', hzProperty);

  hzProperty.$inject = ['horizon.framework.basePath'];

  /**
   * @ngdoc directive
   * @name hzProperty
   * @description
    * Provides markup for a label and value, for use within a propertyGroup.
   * If included in a property-group with a layout of "block", will provide
   * appropriate markup.
   */
  function hzProperty(basePath) {
    return {
      transclude: true,
      templateUrl: function(element) {
        var parent = element.parent();
        if (parent.is('hz-property-group') && parent.attr("layout") === 'block') {
          // Returns block-oriented property
          return basePath + '/widgets/detail/hz-property_block.html';
        }
        // Returns div-oriented property
        return basePath + '/widgets/detail/hz-property.html';
      },
      scope: {
        label: "=",
        value: "="
      }
    };
  }

})();

