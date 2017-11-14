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
 angular.module('hz.dashboard.identity.projects')
  .directive('projectQuotaItem',function(){
     return {
          require: '^form',
          restrict: 'AE',
          templateUrl: 'project_quota/project_quota_item.html',
          scope:{
            id: '@',
            name: '@',
            label: '@',
            quota: '=',
          },
          link: function(scope, element, attrs, form){
                scope.quotaField = form[scope.name];
                scope.toggleCheckState = function(){
                    var quota = scope.quota;
                    if (quota.domain_quota != -1 && quota.checked) {
                        quota.checked = false;
                        return;
                    }
                    if (quota.checked){
                      scope.quotaField.$setViewValue(-1);
                    } else {
                      var value = quota.init == -1 ? 0 : quota.init;
                      scope.quotaField.$setViewValue(value);
                    }
                    scope.quotaField.$render();
                };
                var curQuota = null;
                scope.$watch(function(){
                        if (scope.quota && scope.quota !== curQuota) {
                            curQuota = scope.quota;
                            return true;
                        } else {
                            return false;
                        }
                    },
                    function(newValue, oldValue){
                        if (newValue && newValue != oldValue) {
                            scope.quotaField.$setPristine();
                        }
                    });
          }
        };
})
.directive('projectQuotaValidate', function(){
    var INTEGER_REGEXP = /^-?\d+$/;
    return {
          require: 'ngModel',
          restrict: 'A',
          scope:{
            quota: '=',
          },
          link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(function(viewValue){
                var min = scope.quota.min;
                var max = scope.quota.max;
                var checked = scope.quota.checked;
                if (checked && viewValue == -1){
                    return viewValue;
                }

                ngModel.$setValidity('pattern', true);
                ngModel.$setValidity('min', true);
                ngModel.$setValidity('max', true);

                if (!INTEGER_REGEXP.test(viewValue)) {
                    ngModel.$setValidity('pattern', false);
                    return undefined;
                }

                if (angular.isNumber(min)) {
                    if (min > parseInt(viewValue)) {
                        ngModel.$setValidity('min', false);
                        return undefined;
                    }
                }

                if (angular.isNumber(max)) {
                    if (max < parseInt(viewValue)) {
                        ngModel.$setValidity('max', false);
                        return undefined;
                    }
                }
                return viewValue;

            });

          }
        };

});

})();
