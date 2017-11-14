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
    .directive('hzDetailHeader', hzDetailHeader);

  hzDetailHeader.$inject = ['horizon.framework.basePath'];

  /**
   * @ngdoc directive
   * @name hzDetailHeader
   * @description
   * Provides markup concerning a detail header.  It takes a title
   * and description and transcludes any given markup.
   */
  function hzDetailHeader (basePath) {
    return {
      transclude: true,
      templateUrl: basePath + '/widgets/detail/hz-detail-header.html',
      scope: {
        title: "=",
        description: "="
      }
    };
  }

})();

