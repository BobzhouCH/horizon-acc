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
    .directive('hzPropertyGroup', hzPropertyGroup);

  hzPropertyGroup.$inject = ['horizon.framework.basePath'];

  /**
   * @ngdoc directive
   * @name hzPropertyGroup
   * @description
   * Provides markup for a group of properties.  A group has a label
   * describing its contents.
   *
   * Attrs: layout of "block" will indicate labeled, block layout.
   */
  function hzPropertyGroup(basePath) {
    return {
      transclude: true,
      templateUrl: function(element, attrs) {
        if (attrs.layout === "block") {
          return basePath + '/widgets/detail/hz-property-group_block.html';
        }
        return basePath + '/widgets/detail/hz-property-group.html';
      },
      scope: {
        label: "="
      }
      
    };
  }

})();
