(function () {
  'use strict';

  /*
   * dragbar
   *
   * scope.config= {max: 1000, min: 1, unit: 'GB'};
   * ```
   *  <dragbar id="size"
   *    name="size"
   *    config="config"
   *    ng-model="image.size">
   *  </dragbar>
   * ```
   * or
   * ```
   *  <dragbar id="size"
   *    name="size"
   *    min="100"
   *    max="500"
   *    start="1"
   *    end="1000"
   *    unit="GB"
   *    ng-model="image.size">
   *  </dragbar>
   * ```
   */
  angular.module('horizon.framework.widgets.dragbar')
  .directive('dragbar', ['horizon.framework.widgets.basePath',
    function(path){
      return {
        restrict: 'AE',
        scope: {
          value: '=ngModel',
          start: '=?start',
          end: '=?end',
          min: '=min',
          max: '=max',
          prompt: '=prompt',
          forbidden: '=forbidden',
          unit: '@unit',
          comment: '@comment',
          name: '@name',
          pattern: '@pattern',
          conf: '=config',
        },
        link: link,
        templateUrl: path + 'dragbar/dragbar.html',
        replace: true,
      };

      function link(scope, element, attrs){
        scope.config = scope.conf || scope;
        var config = scope.config;

        config.min = config.min || 0;
        config.max = parseInt(config.max) || 100;

        config.start = parseInt(config.start) || config.min;
        config.end = parseInt(config.end) || config.max;

        scope.loadPrompt = function() {
          return config.prompt || interpolate('%s %s ~ %s %s', [
                 config.min, config.unit, config.max, config.unit]);
        };
        scope.inputValue = scope.value;

        var dragWrap = element.find('.js-drag-wrap'),
            dragInputVal = element.find('.js-drag-input'),
            selecedBg = element.find('.js-seleced-bg'),
            dragBtn = element.find('.js-drag-btn');

        init();

        function init() {
          updateBarValue(config.min);

          scope.$watch('value', function(newVal, oldVal){
            scope.inputValue = scope.value;
          });

          scope.$watch('inputValue', function(newVal, oldVal){
            // invalid value
            if(!newVal){
              return;
            }

            scope.value = newVal;
            updateBarValue(newVal);
          });
        }

        function range() {
          return (config.end - config.start);
        }

        function distance(val) {
          return (val - config.start);
        }

        function start() {
          return config.start;
        }

        function verifyValue(val) {
          if(val < config.min) {
            val = config.min;
          }
          else if(val > config.max) {
            val = config.max;
          }

          if (val > Math.floor(val)) {
            return parseFloat(val.toFixed(2));
          }

          return val;
        }

        function updateBarValue(val) {
          var dragWrapWidth = dragWrap.width();
          val = verifyValue(val);

          //scope.inputValue = val;
          var pos = distance(val) / range() * dragWrapWidth;
          updateBarPosition(pos);
        }

        function updateBarPosition(pos) {
          dragBtn.css({left: pos});
          selecedBg.css({width: pos});
        }

        dragBtn.bind('mousedown', function(ev){
          var _this = $(this),
              disX = ev.screenX - _this.offset().left - 5,
              dragWrapLeft = Math.floor(dragWrap.offset().left),
              dragWrapWidth = Math.floor(dragWrap.width());
          var step = range() > 100 ? 10 : 1;

          if (range() > 0 && range() <= 1) {
            step = 0.01;
          }

          $(document).bind('mousemove', dargMousemove);
          $(document).bind('mouseup', dargMouseup);

          function dargMousemove(ev){
            var btnLeft = Math.floor(ev.screenX - dragWrapLeft-disX);

            if(btnLeft < 0){
              btnLeft = 0;
            }
            else if(btnLeft > dragWrapWidth){
              btnLeft = dragWrapWidth;
            }

            var newVal = btnLeft / dragWrapWidth * range() + start();
            if(config.max - newVal < step){
              newVal = config.max;
            }else{
              newVal = verifyValue(Math.floor(newVal/step) * step);
            }
            scope.$apply(scope.inputValue = newVal);
          }

          function dargMouseup(){
            $(document).unbind('mousemove', dargMousemove);
            $(document).unbind('mouseup', dargMouseup);
          }

          return false;
        });
      }
  }]);
})();
