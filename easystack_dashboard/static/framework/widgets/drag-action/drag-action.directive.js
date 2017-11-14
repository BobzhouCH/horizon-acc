(function () {
  'use strict';
  //scope.getValue= {max: 1000, min: 1, ctrl: true, unit: 'GB', defVal: 1, prompt: true};
  angular.module('horizon.framework.widgets.drag-action')
  .directive('dragBar', ['horizon.framework.widgets.basePath', function(path){
      return {
      restrict:     'AE',
      scope:  {
        dragBar:   '=',
        setValue:  '='
      },
      link:       link,
      templateUrl:  path+'drag-action/drag-action-bar.html'
    };

      function link(scope, element, attrs){
        var dragWrap    = element.find('.js-drag-wrap'),
          dragInputVal  = element.find('.js-drag-input'),
          selecedBg    = element.find('.js-seleced-bg'),
          dragBtn      = element.find('.js-drag-btn'),
          step      = 0,
          dragWrapLeft  = 0,
          dragWrapWidth  = 0;
          scope.getValue    = scope.dragBar;
          scope.selectedVal   = scope.getValue.min;

          step = scope.getValue.max > 100 ? 10 : 1;
          dragWrapLeft  = dragWrap.offset().left;
          dragWrapWidth  = dragWrap.width();
          dragBtn.css({ left: scope.getValue.min/scope.getValue.max*dragWrapWidth });
          selecedBg.css({ width: scope.getValue.min/scope.getValue.max*dragWrapWidth });
          scope.setValue  = scope.selectedVal;

        scope.$watch('dragBar.min', function(newValue, oldValue) {
            if (newValue != oldValue) {
                scope.getValue    = scope.dragBar;
                scope.selectedVal   = scope.getValue.min;
                dragBtn.css({ left: scope.getValue.min/scope.getValue.max*dragWrapWidth });
                selecedBg.css({ width: scope.getValue.min/scope.getValue.max*dragWrapWidth });
                scope.setValue  = scope.selectedVal;
            }
        });

        dragInputVal.bind('keyup', function(){
          dragWrapLeft  = Math.floor(dragWrap.offset().left);
          dragWrapWidth  = dragWrap.width();

          var inputVal  = scope.selectedVal;
          var reg     = new RegExp("^[1-9]*$");

          if(!reg.test(inputVal)){
            inputVal = parseInt(inputVal);
          }
          if(inputVal >= scope.getValue.max){
            inputVal = scope.getValue.max;
          }

          scope.setValue  = inputVal;

          dragBtn.css({ left: inputVal / scope.getValue.max * dragWrapWidth });
          selecedBg.css({ width: inputVal / scope.getValue.max * dragWrapWidth });
          scope.$apply(scope.selectedVal = inputVal);
          scope.setValue = scope.selectedVal;
        });

        dragInputVal.bind('blur', function(){
          dragWrapLeft  = Math.floor(dragWrap.offset().left);
          dragWrapWidth    = dragWrap.width();

          var inputVal    = scope.selectedVal;

          if(scope.getValue.ctrl){
            if(inputVal <= scope.getValue.min){
              inputVal = scope.getValue.min;
            }
          }
          else{
            if(inputVal <= 1){
              inputVal = 1;
            }
          }

          dragBtn.css({ left: inputVal / scope.getValue.max * dragWrapWidth });
          selecedBg.css({ width: inputVal / scope.getValue.max * dragWrapWidth });
          scope.$apply(scope.selectedVal = inputVal);
          scope.setValue = scope.selectedVal;
        });

        dragBtn.bind('mousedown', function(ev){
          var _this      = $(this),
            disX      = ev.screenX - _this.offset().left-5,
            inputVal    = element.find('.js-drag-input'),
            dragWrapLeft  = Math.floor(dragWrap.offset().left),
            dragWrapWidth  = Math.floor(dragWrap.width()),
            btnLeft;

          $(document).bind('mousemove', dargMousemove);
          $(document).bind('mouseup', dargMouseup);

          function dargMousemove(ev){
            btnLeft    = Math.floor(ev.screenX - dragWrapLeft-disX);

            if(scope.getValue.ctrl){
              if(btnLeft <=  scope.getValue.min/scope.getValue.max*dragWrapWidth){
                btnLeft  = Math.floor(scope.getValue.min/scope.getValue.max*dragWrapWidth);
              }
            }
            else{
              if(btnLeft <=  1/scope.getValue.max*dragWrapWidth){
                btnLeft  = Math.floor(1/scope.getValue.max*dragWrapWidth);
              }
            }

            if(btnLeft >= dragWrapWidth){
              btnLeft  = dragWrapWidth;
            }

            var newVal = btnLeft/dragWrapWidth*scope.getValue.max;
            fillValue(newVal,btnLeft);
          }

          function fillValue(newVal,btnLeft){
            var floorNum  = newVal/step < 1 ? 0.1 : Math.ceil(newVal/step);
            scope.$apply(scope.selectedVal = floorNum*step);
            scope.setValue                 = scope.selectedVal;

            if(scope.getValue.ctrl){
              if(newVal <= scope.getValue.min){
                scope.$apply(scope.selectedVal=scope.getValue.min);
              }
            }
            else{
              if(newVal <= 1){
                scope.$apply(scope.selectedVal=1);
              }
            }

            _this.css({ left: btnLeft });
            selecedBg.css({ width: btnLeft });
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
