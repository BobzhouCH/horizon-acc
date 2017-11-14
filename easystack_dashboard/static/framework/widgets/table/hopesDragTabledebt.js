(function() {
    'use strict';

    angular.module('horizon.framework.widgets.tableDrag', [])

    .directive('hopesTableDrag', function(){
        return {
            restrict: 'AE',
            replace: true,
            compile: function(element, attr){

                return {
                    post: function($scope, element, attr){

                      var self     = null,
                          minWidth = 10;

                      function moveFn(selfW, nextW){
                        self.parent().css({
                          width: selfW
                        });

                        self.parent().next().css({
                          width: nextW
                        });
                      };

                      element.find('thead tr:eq(1) th span').on('mousedown', function(ev){

                          self      = $(this);
                          var downLeft  = ev.clientX,
                              selfThWidth  = self.parent().outerWidth(),
                              selfThLeft   = self.parent().offset().left,
                              nextThWidth  = self.parent().next().outerWidth();

                          $(document).on('mousemove', function(ev){

                             var moveLeft       = ev.clientX,
                                 diffX          = ev.clientX - downLeft,
                                 selfNewThWidth = selfThWidth + diffX,
                                 nextNewThWidth = nextThWidth - diffX;

                             if(nextNewThWidth <= minWidth){
                               nextNewThWidth = minWidth;
                               return false;
                             }

                             if(selfNewThWidth <= minWidth){
                               selfNewThWidth = minWidth;
                               return false;
                             }

                             moveFn(selfNewThWidth, nextNewThWidth);
                          });

                          $(document).on('mouseup', function(ev){
                              $(document).unbind('mousemove');
                              $(document).unbind('mouseup');
                          });

                          ev.stopPropagation();

                          return false;
                      });

                    },

                    pre: function($scope, element, attr){

                        var ihopesTh = element.find('thead tr:eq(1) th'),
                            ihopesTd = element.find('tbody tr'),
                            ele      = '<span class="hopesBrother"></span>',
                            len      = ihopesTh.length-1;

                        $.each(ihopesTh, function(i, n){
                          if(i !== 0 && i < len){
                            $(n).append(ele);
                          }
                        });
                    }

                };
            }
        };
    });
})();