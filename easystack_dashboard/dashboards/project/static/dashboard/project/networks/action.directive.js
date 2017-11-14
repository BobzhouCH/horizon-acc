(function() {
  'use strict';

  angular.module('hz.dashboard.project.networks')

  .directive('advancedOptionsDis', advancedOptionsDis)
    .directive('limitLength', limitLength);

  function advancedOptionsDis() {
    var directive = {
      link: link,
      restrict: 'AE',
      scope: {
        advancedOff: '@?',
        showLabel: '@'
      },
    };
    return directive;

    function link(scope, element, attrs) {
            var optBtn = {
              show: gettext("Advanced Options"),
              hide: gettext("Hide Advanced Options")
            }
      element.on('click', function() {
        if (!$(this).hasClass('slide-ty')) {
          $('.' + attrs.advancedOptionsDis).slideUp("slow");
          if (scope.advancedOff) {
            $('.' + scope.advancedOff).html('<label class="control-label fl required">'+optBtn.show+'</label>');
          }
        } else {
          $('.' + attrs.advancedOptionsDis).slideDown("slow");
          if (scope.advancedOff) {
            $('.' + scope.advancedOff).html('<label class="control-label fl required">'+optBtn.hide+'</label>');
          }
        }
        $(this).toggleClass('slide-ty');
      });

    };

  }

  function limitLength() {
    var directive = {
      link: link,
      require: 'ngModel',
      restrict: 'AE'
    };
    return directive;

    function link(scope, element, attrs, ctrl) {
      element.on('keyup', function() {});
    }
  }

})();