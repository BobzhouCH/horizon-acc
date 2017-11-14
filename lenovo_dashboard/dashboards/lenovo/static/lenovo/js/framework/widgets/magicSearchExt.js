(function () {
    'use strict';

    angular
      .module('horizon.framework.widgets.magic-search')
      .directive('hzMagicPagination', hzMagicPaginationContext);

    function hzMagicPaginationContext() {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                show: "="
            }
        };
        return directive;

        function link(scope, element, attrs) {
            //console.log(element);
            var parentScope = angular.element(element[0]).scope();
            var parentScope2 = angular.element('#nodes_pagination').scope();

            for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
                if (cs.pages && cs.pages.length > 1) {
                    show = true;
                    return;
                }
            }
            show = false;
        }
    }
})();