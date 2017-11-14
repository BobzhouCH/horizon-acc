/**
 * Copyright 2015 EasyStack Corp.
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

  angular.module('hz.dashboard.admin.billing')

  .directive('recordData', function(){
      return {
          restrict: 'A',
          scope: true,
          controller: function($scope){
              $scope.resultList = [];
              this.collect = function(json){

                  if($scope.resultList.length){
                      for(var i=0; i<$scope.resultList.length; i++){
                          if($scope.resultList[i].id == json.id){
                              $scope.resultList.splice(i, 1);
                              $scope.resultList.push(json);
                          }else{
                              angular.isDefined(json) && $scope.resultList.push(json);
                          }
                      }
                  }else{
                      angular.isDefined(json) && $scope.resultList.push(json);
                  }

              };
              this.result = function(){
                  return $scope.resultList;
              };
          }
      };
  })
  .directive('billingHover', function(){
        return {
            restrict: 'A',
            scope: {
              billingDisplay: '@?'
            },
            link: function(scope, element, attrs){

                scope.$evalAsync(function(){

                    $.each(element.find('li'), function(i,ele){

                        $(ele).on('click', function(){

                            $(this).addClass('active').siblings('li').removeClass('active');
                            $('.'+scope.billingDisplay).css('display', 'none');
                            $('.'+scope.billingDisplay).eq($(this).index()).css('display', 'block');

                        });

                    });

                });

            }
        };
    })
    .directive('disableItemDown', ['horizon.openstack-service-api.billing', function(billingAPI){
        return {
            restrice: 'A',
            scope: {
                fixTaggle: '@?'
            }, 
            link: function(scope, element, attrs){

                scope.$evalAsync(function(){

                  element.on('click', function(){
                        var ih = $('.'+scope.fixTaggle).eq(1).css('height', 'auto').find('table').show().end().outerHeight();

                        if(!$(this).hasClass('billingArrowDwon')){
                            $('.'+scope.fixTaggle).eq(1)
                            .animate('height', '16px')
                            .slideUp('show', function(){
                              $('.'+scope.fixTaggle).eq(1).show().find('table').css('display', 'none')
                              .end().find('.billingArrow').toggleClass('billingArrowDwon');
                              $('.'+scope.fixTaggle).eq(0).find('table').show();
                              $('.'+scope.fixTaggle).eq(0).css({ overflow: 'hidden', height: 'auto' });
                              $('.billingArrow').hide();
                            });
                        }else{
                            $('.'+scope.fixTaggle).eq(1).css('height', 0).animate({height:ih}, function(){
                                $('.'+scope.fixTaggle).eq(1).css('height', 'auto');
                            })
                            .end()
                            .find('.billingArrow').toggleClass('billingArrowDwon');
                            $('.'+scope.fixTaggle).eq(0).find('table').show();
                            $('.'+scope.fixTaggle).eq(0).css({ overflow: 'hidden', height: 'auto' });
                            $('.billingArrow').hide();
                            $('.'+scope.fixTaggle).eq(1).find('table').hide();
                            $('.'+scope.fixTaggle).eq(1).css({ overflow: 'hidden', height: 'auto' });
                        }
                     });
                    });
            }
        };
    }])
    .directive('setTdBack', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs){

                scope.$evalAsync(function(){
                    element.find('input').css({
                        "border": "none",
                        "background":element.css('backgroundColor')
                    });
                });

            }
        };
    })
    .directive('watchPrice', ['horizon.openstack-service-api.billing', function(billingAPI){
        return {
            restrict: 'A',
            require: '^recordData',
            scope: {
                digitalList: '=?'
            },
            controller: function($scope){
                this.init = function(){
                    $scope.isboole;
                };
            },
            link: function(scope, element, attrs, Ctrl){
                scope.$applyAsync(function(){
                    scope.$evalAsync(function(){
                        var eleInp;

                        function editPrice(fee) {
                          if(!(fee instanceof Number)){
                            fee = parseFloat(fee.replace(/,/g, ''));
                          }
                          var arg={'id': scope.digitalList.id} ;
                          arg[eleInp.attr('name')] = fee;
                          billingAPI.editPriceDetails(arg).success(function(res){
                            scope.digitalList[eleInp.attr('name')] = res[eleInp.attr('name')];
                            element.closest('tr').find('td').css('background', '#f3faf1');
                            element.find('.price-insert').css('visibility', 'hidden');
                            element.find('.price-icon').css('visibility', 'visible');
                            eleInp.css({
                                'background':'transparent',
                                'padding-left': '0',
                                'border': 'none',
                                'color': '#707789'
                            });
                          });
                          return false;
                        };

                        element.on('focus input', 'input', function(){
                            $(this).css({
                                'background':'#fafafb',
                                'padding': '3px',
                                'border': '1px solid #ccc',
                                'color': '#999'
                            });
                            eleInp = $(this);
                            var eleInpAttr = eleInp.attr('name');
                            if(scope.digitalList[eleInpAttr] != eleInp.val()){
                                $(this).siblings('.price-insert').css('visibility', 'visible');
                                $(this).siblings('.price-icon').css('visibility', 'hidden');
                                $(this).siblings('.price-insert').css('margin-left', '75px');
                            }

                            return false;
                        });


                        element.on('blur input', 'input', function(){
                            eleInp = $(this);
                            var eleInpAttr = eleInp.attr('name');
                            if(scope.digitalList[eleInpAttr] == eleInp.val()){
                              $(this).css({
                                'padding': '5px 5px 5px 0px',
                                'border': 'none',
                                'color': 'rgb(112, 119, 137)',
                                'background': 'transparent'
                              });

                            }

                        });

                        element.on('click', '.storage', function(){
                            return editPrice(eleInp.val());
                        });

                        element.on('keypress', '.fee', function($event){
                          if($event.keyCode === 13){
                            var val = eleInp.val();
                            if(val != scope.digitalList[eleInp.attr('name')]){
                              return editPrice(val);
                            }
                          }
                        });

                        element.on('keyup', '.fee', function($event){
                          var val = eleInp.val();
                          var precision = scope.$parent.constants.PRICE_PRECISION;
                          var reg = new RegExp('^[\\d]+[\\.]{0,1}[0-9]{0,'+precision+'}$', "gi");
                          if(val && !reg.test(val.replace(/,/g, ''))){
                            //var f = parseFloat(val) || '';
                            val = scope.digitalList.oldFee;
                            if(val == null)
                              val = scope.digitalList[eleInp.attr('name')] || '';
                            eleInp.val(val);
                          }
                          scope.digitalList.oldFee = val;
                        });

                        element.on('click', '.cancel', function(){
                            eleInp.val(scope.digitalList[eleInp.attr('name')]);
                            element.closest('tr').find('td').css('background', '#fff');
                            element.find('.price-insert').css('visibility', 'hidden');
                            element.find('.price-icon').css('visibility', 'visible');
                            eleInp.css({
                                'background':'transparent',
                                'border': 'none',
                                'padding-left': '0',
                                'color': '#707789'
                            });
                            return false;
                        });

                        /*element.on('click', function(){
                            var eleInp = $(this).closest('tr').find('.js-getbackground').find('input');

                            if(scope.digitalList.fee != eleInp.val()){
                                eleInp.css('background','blue');
                                eleInp.attr('selectedUp', true);
                                scope.digitalList.fee = eleInp.val();
                                //Ctrl.collect(scope.digitalList);

                                billingAPI.editPriceDetails(scope.digitalList).success(function(res){
                                });
                            }
                        });*/
                    });
                });
            }
        };
    }])
    .directive('switchModule', 
        ['horizon.openstack-service-api.billing', '$rootScope',
        function(billingAPI, rootScope){
        return {
            restrict: 'A', 
            scope: {
              editPriceFixUser: '=?'  
            },
            link: function(scope, element, attrs){

               scope.$applyAsync(function(){
                    scope.$evalAsync(function(){

                       element.on('click', 'span', function(){
                         if($(this).closest('div').hasClass('switch-color-yes') && $(this).hasClass('no')){
                               $(this).closest('div').removeClass('switch-color-no');$(this).closest('div').addClass('switch-color-yes');
                               var _copy_json = angular.copy(scope.editPriceFixUser);
                               _copy_json['start_at'] = rootScope.rootblock.local_to_utc(_copy_json.start_at);
                               _copy_json['create_at'] = rootScope.rootblock.local_to_utc(_copy_json.create_at);
                               _copy_json['is_applied'] = false;
                               billingAPI.editPriceFix(_copy_json).success(function(res){
                                   scope.editPriceFixUser['is_applied'] = false;
                                   scope.editPriceFixUser['state'] = res.state;
                               });
                           }
                           if($(this).closest('div').hasClass('switch-color-no') && $(this).hasClass('yes')){
                               $(this).closest('div').removeClass('switch-color-yes');$(this).closest('div').addClass('switch-color-no');
                               var _copy_json = angular.copy(scope.editPriceFixUser);
                               _copy_json['start_at'] = rootScope.rootblock.local_to_utc(_copy_json.start_at);
                               _copy_json['create_at'] = rootScope.rootblock.local_to_utc(_copy_json.create_at);
                               _copy_json['is_applied'] = true;
                               billingAPI.editPriceFix(_copy_json).success(function(res){
                                   scope.editPriceFixUser['is_applied'] = true;
                                   scope.editPriceFixUser['state'] = res.state;
                               });
                           }
                       });
                    });
                });

            }
        };
    }])
    .directive('descriptionRequire', 
        ['horizon.openstack-service-api.billing', '$rootScope',
        function(billingAPI, rootScope){
        return {
            restrice: 'A', 
            scope: {
                priceFix: '=?',
                editPriceFixUser: '=?'
            },
            link: function(scope, element, attrs, ctrl){

                 scope.$applyAsync(function(){
                    scope.$evalAsync(function(){
                        element.on('change', function(){
                            var editPriceFixJson = angular.copy(scope.editPriceFixUser);
                            editPriceFixJson[attrs.descriptionRequire] = $(this).val();
                            editPriceFixJson['start_at'] = rootScope.rootblock.local_to_utc(editPriceFixJson.start_at);
                            editPriceFixJson['create_at'] = rootScope.rootblock.local_to_utc(editPriceFixJson.create_at);
                            billingAPI.editPriceFix(editPriceFixJson).success(function(res){
                                res['start_at'] = rootScope.rootblock.utc_to_local(res.start_at);
                                res['create_at'] = rootScope.rootblock.utc_to_local(res.create_at);
                                angular.extend(scope.editPriceFixUser, res);
                            });
                        });
                    });
                });

            }
        };
    }])
    .directive('submitChangesBear', function(){
        return {
            restrict: 'A',
            require: '^recordData',
            scope: {
                starttimeVal: '@?',
                describeVal: '@?'
            },
            link: function(scope, element, attrs, Ctrl){

                scope.$evalAsync(function(){
                    var resultJson = {};
                    element.on('click', function(){
                       resultJson.starttimeVal = $('.'+scope.starttimeVal).val();
                       resultJson.describeVal = $('.'+scope.describeVal).val();
                       resultJson.updata = Ctrl.result();
                    });

                });
            }
        };
    })
    .directive('esTab', function(){
      return {
        restrict: 'A',
        scope: {
           callback: '@?'
        },
        link: function(scope, element, attrs){
          // TODO(xxw): why this does not work?
          // var callback = scope.$parent[scope.callback];
          element.find('li').bind('click',function(){
            element.find('li').removeClass('active');
            $(this).addClass('active');

            var callback = scope.$parent[scope.callback];
            var val = $(this).attr('val');
            scope.$evalAsync(function(){
              callback(val);
            });
          });
        }
      };
    });

})();
