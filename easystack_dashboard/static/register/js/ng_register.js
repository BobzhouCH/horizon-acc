(function(){
    var webroot = window.WEBROOT;
    var _invcode_enable = window.INVCODE_NEED;
    var _captcha_enable = window.CAPTCHA_ENABLE;
    var m1 = angular.module('registermod', []);
    m1.config(['$interpolateProvider', '$httpProvider', function($interpolateProvider, $httpProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';

        $httpProvider.interceptors.push(function($q) {
          return {
            responseError: function(error) {
              if (error.status === 401){
                //window.location.replace('/auth/logout');
                console.log('401');
              }
              return $q.reject(error);
            }
          };
        });
    }]);

    m1.controller('registerctrl',
        ['$scope', '$location', '$http', 'httpService',
        function($scope, $location, $http, httpService){

        $scope.iYanzm = '';

        if (angular.lowercase(_invcode_enable) === "true"){
            _invcode_enable = true;
        }else{
            _invcode_enable = false;
        }
        $scope.invcode_enable = _invcode_enable
        if (angular.lowercase(_captcha_enable) === "true"){
            _captcha_enable = true;
        }else{
            _captcha_enable = false;
        }
        $scope.captcha_enable = _captcha_enable
        $scope.departmentJson = {};

    }]);

    m1.directive('publicJiaoyan', ['httpService', function(httpService){
        return {
            restrict: 'A',
            require: 'ngModel',
            scope:{
              attrtips : '=?',
            },
            controller : function($scope){
                $scope.regTypes = {
                    regList : [
                        { name : 'default' , tips : false},
                        { name : 'required' , tips : false},
                        { name : 'pattern' , tips : false},
                        { name : 'pass' , tips : true}
                    ]
                };
            },
            link: function(scope, element, attrs, ctrl){
                element.on('change', function(){
                    if(attrs.publicJiaoyan == 'verify_email'){
                       for(var attr in scope.attrtips){
                         if(scope.attrtips[attr] == true){
                             element.addClass('err');
                             element.nextAll('.p-errshow').css('visibility', 'visible');
                             return;
                         }
                        }
                        httpService.post(webroot+'email/', {"email": $(this).val()}).success(function(data){
                            if(data == 'True'){
                                ctrl.$setValidity('email', true);
                            }else{
                              ctrl.$setValidity('email', false);
                            };
                            for(var attr in scope.attrtips){
                              if(scope.attrtips[attr] == true){
                                  element.addClass('err');
                                  element.nextAll('.p-errshow').css('visibility', 'visible');
                                  if(element.next('.p-errshow').hasClass('en-err')){
                                      element.next('.p-errshow').html('Your email address has been occupied');
                                  }
                                  if(element.next('.p-errshow').hasClass('ch-err')){
                                      element.next('.p-errshow').html('邮箱已被注册');
                                  }
                              return;
                             }
                            };
                            element.removeClass('err');
                            element.nextAll('.p-errshow').css('visibility', 'hidden');
                        }).error(function(err){
                            console.log(err);
                        });
                    }else if(attrs.publicJiaoyan == 'phone_code'){console.log($(this).val());
                        httpService.post(webroot+'phonecode/', {"invitation_code": $(this).val()}).success(function(data){
                            if(data == 'True'){
                                element.removeClass('err');
                                element.next('.p-errshow').css('visibility', 'hidden');
                            }else{
                                element.addClass('err');
                                element.next('.p-errshow').css('visibility', 'visible');
                                if(element.next('.p-errshow').hasClass('en-err')){
                                    element.next('.p-errshow').html('Your phone verification code is wrong');
                                }
                                if(element.next('.p-errshow').hasClass('ch-err')){
                                    element.next('.p-errshow').html('短信验证码有误');
                                }
                            }
                        }).error(function(err){
                            console.log(err);
                        });
                    }else if(attrs.publicJiaoyan == 'new-password'){
                        if(scope.attrtips.required == true || scope.attrtips.minlength == true){
                            element.addClass('err');
                            element.nextAll('.p-errshow').css('visibility', 'visible');
                            element.next('.p-errshow').html('请输入至少8位密码');
                            return;
                        }else if(scope.attrtips.minlength == false && scope.attrtips.pattern == true){
                            element.addClass('err');
                            element.nextAll('.p-errshow').css('visibility', 'visible');
                            element.next('.p-errshow').html('密码需要包含数字和字母（或符号），并且至少八位字符。');
                            return;
                        }else{
                            element.removeClass('err');
                            element.next('.p-errshow').css('visibility', 'hidden');
                        }
                    }

                    else{
                        for(var attr in scope.attrtips){
                          if(scope.attrtips[attr] == true){
                              element.addClass('err');
                              element.nextAll('.p-errshow').css('visibility', 'visible');
                              return;
                          }
                         }
                        element.removeClass('err');
                        element.next('.p-errshow').css('visibility', 'hidden');
                    }
                });
                element.on('focus blur', function(){
                    element.toggleClass('blur-sy');
                });
            }
        };
    }]);
    m1.directive('pwJiaoyan', function(){
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                pwStr: '=?',
                attrtips: '=?',
                pwId: '@?'
            },
            link: function(scope, element, attrs, ctrl){
               function passwordCheck(){
                   scope.$apply(function(){
                       var match = (ctrl.$viewValue === scope.pwStr.$modelValue);
                       ctrl.$setValidity('match', match);
                       for(var attr in scope.attrtips){
                           if(scope.attrtips[attr] == true){
                               element.addClass('err');
                               element.next('.p-errshow').css('visibility', 'visible');
                               return;
                           }
                       }
                       element.removeClass('err');
                       element.next('.p-errshow').css('visibility', 'hidden');
                   });
               }
               var pwElement = '';
               scope.$evalAsync(function(){ pwElement = $('#'+scope.pwId);});
               element.on('focus', function(){
                   pwElement.on('blur', passwordCheck);
                   element.on('blur', passwordCheck);
               });

               element.on('focus blur', function(){
                   element.toggleClass('blur-sy');
               });
            }
        };
    });

    m1.directive('yanzmJiaoyan', ['httpService', function(httpService){
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                attrtips: '=?'
            },
            link: function(scope, element, attrs, ctrl){
                element.on('blur', function(){
                    scope.$apply(function(){
                        var codeChar = ctrl.$viewValue;
                        httpService.post(webroot+'verify/', {"code": codeChar}).success(function(data){
                            var match = scope.$eval(angular.lowercase(data));
                            ctrl.$setValidity('yanzm', match);
                            for(var attr in scope.attrtips){
                               if(scope.attrtips['required'] == true){
                                   element.addClass('err');
                                   element.nextAll('.p-errshow').css('visibility', 'visible');
                                   element.next('.p-errshow').html('请输入右图中验证码');
                                   return;
                               }
                               if(scope.attrtips['required'] == false && scope.attrtips['yanzm'] == true){
                                   element.addClass('err');
                                   element.nextAll('.p-errshow').css('visibility', 'visible');
                                   element.next('.p-errshow').html('输入的验证码错误');
                                   return;
                               }
                            }
                            element.removeClass('err');
                            element.nextAll('.p-errshow').css('visibility', 'hidden');
                        }).error(function(err){
                        });
                    });
                });
                element.on('focus blur', function(){
                    element.toggleClass('blur-sy');
                });
            }
        };
    }]);

    m1.directive('invcodeCheck', ['httpService', function(httpService){
      return {
          restrict: 'A',
          require: 'ngModel',
          scope: {
              attrtips: '=?'
          },
          link: function(scope, element, attrs, ctrl){
              element.on('change', function(){
                  //scope.$apply(function(){
                      var invcode = $(this).val().replace(/\s+/g, '');
                      var match = false;
                      httpService.post(webroot+'invitationcode/', {"invitation_code": invcode}).success(function(data){
                          if (data == "True"){match = true};
                          ctrl.$setValidity('public', match);
                          for(var attr in scope.attrtips){
                             if(scope.attrtips[attr] == true){
                                 element.addClass('err');
                                 element.nextAll('.p-errshow').css('visibility', 'visible');
                                 if(element.next('.p-errshow').hasClass('en-err')){
                                   element.next('.p-errshow').html('Wrong Code');
                                 }
                                 if(element.next('.p-errshow').hasClass('ch-err')){
                                     element.next('.p-errshow').html('邀请码错误');
                                 }
                                 return;
                             }
                          }
                          element.removeClass('err');
                          element.nextAll('.p-errshow').css('visibility', 'hidden');
                      }).error(function(err){
                      });
                  //});
              });
              element.on('focus blur', function(){
                  element.toggleClass('blur-sy');
              });
          }
      };
  }]);


    m1.directive('registerHover', function(){
        return {
            restrict: 'A',
            scope: {
              plainDisplay: '@?'
            },
            link: function(scope, element, attrs){

                scope.$evalAsync(function(){

                    $.each(element.find('li'), function(i,ele){

                        $(ele).on('click', function(){

                            $(this).addClass('active').siblings('li').removeClass('active');
                            $('.'+scope.plainDisplay).css('display', 'none');
                            $('.'+scope.plainDisplay).eq($(this).index()).css('display', 'block');

                        });

                    });

                });

            }
        };
    });

    m1.directive('phoneCode', ['httpService', function(httpService){
        return {
            restrict: 'A',
            scope: {
                sjId : '@?',
                sendStr : '@?'
            },
            link: function(scope, element, attrs){
                console.log(element.attr('onOff'));
                var iDate = 60;
                var timer = null;
                element.on('click', function(){
                    var mobile_phone = $('#'+scope.sjId).val();
                    if(!element.attr('onOff') && mobile_phone){
                        httpService.post(webroot+'phonecode/', {"mobile_phone": mobile_phone}).success(function(data){
                            element.attr('onOff', true);
                            element.css('cursor','not-allowed');
                            timer = setInterval(function(){
                                iDate --;
                                if(iDate == 0){
                                    element.removeAttr('onOff');
                                    clearInterval(timer);
                                    iDate = 60;
                                    element.css('cursor','pointer');
                                    element.html(scope.sendStr);
                                }else{element.html(scope.sendStr + '('+ iDate +')');}
                            }, 1000);
                        }).error(function(err){
                            console.log(err);
                        });
                    }
                });
            }
        };
    }]);

    m1.directive('plainFormSubmit', ['httpService', function(httpService){
        return {
            restrict: 'A',
            scope: {
                id: '@?submitId'
            },
            link: function(scope, element, attrs){

                element.on('click', function(){
                    var _this = $(this);
                    _this.attr('disabled', 'disabled');
                    var arr = decodeURIComponent($('#'+scope.id).serialize()).split('&');
                    var json = {};
                    for(var i=0; i<arr.length; i++){
                        var hov = arr[i].split('=');
                        json[hov[0]] = hov[1];
                    }

                    var userList = {};
                    if(scope.id == 'plainForm'){
                        userList['name'] = json.esEmail;
                        userList['email'] = json.esEmail;
                        userList['password'] = json.esPassYes;
                        userList['mobile'] = json.esShouji;
                        userList['user_type'] = 'individual';
                        userList['user_role'] = 'domain_admin';
                        userList['reg_code'] = json.esVerify;
                    }
                    if(scope.id == 'compleForm'){
                        userList['name'] = json.qyUserName;
                        userList['password'] = json.qyPassYes;
                        userList['email'] = json.qyEmail;
                        userList['mobile'] = json.qyShouji;
                        userList['user_type'] = 'enterprise';
                        userList['user_role'] = 'domain_admin';
                        userList['contact_name'] = json.qylxrUserName;
                        userList['department'] = json.szbm;
                        userList['teletephone'] = json.qyPhone;
                        userList['company_name'] = json.qyLocation;
                        userList['reg_code'] = json.esVerify;
                        userList['address'] = json.gsszd + json.gsszd1 + json.gsszd2 + json.qyComLocation;
                    }
                    element.html('正在发送邮件...');
                    element.addClass('nosubmit');
                    httpService.post(webroot+'user/', {'user': userList}).success(function(data, status){
                    	if(status == 200){
                             element.removeClass('err');
                             _this.removeAttr('disabled');
                             window.location.href ="active_reminder?email="+userList['email'];
                        }
                    }).error(function(data, status){
                        if(data === 'The name has been occupied'){
                          data = '名称已被占用';
                        }
                        if(data === 'The request you have made requires authentication.'){
                          data = '你的要求需要认证';
                        }
                        if(data === 'Send validation email failed'){
                          data = '发送验证电子邮件失败';
                        }
                        errorFn(data + ',请重新注册或联系管理员');
                        _this.removeAttr('disabled');
                        element.html('立即注册');
                        element.removeClass('nosubmit');
                    });
                });
            }
        };
    }]);


   m1.service('httpService', ['$http', function($http){

       var httpCall = function (method, url, data, config) {
          if (!angular.isDefined(config)) {
            config = {};
          }
          // url and method are always provided
          config.method = method;
          config.url = url;
          if (angular.isDefined(data)) {
            config.data = data;
          }
          return $http(config);
        };

        this.get = function(url, config) {
          return httpCall('GET', url, undefined, config);
        };

        this.post = function(url, data, config) {
          return httpCall('POST', url, data, config);
        };

        this.patch = function(url, data, config) {
          return httpCall('PATCH', url, data, config);
        };

        // NOTE the deviation from $http.delete which does not have the data param
        this.delete = function (url, data, config) {
          return httpCall('DELETE', url, data, config);
        };

   }]);

})();
