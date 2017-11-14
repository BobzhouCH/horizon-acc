(function () {
  'use strict';

  angular
    .module('horizon.framework', [
      'horizon.framework.conf',
      'horizon.framework.util',
      'horizon.framework.widgets'
    ])
    .constant('horizon.framework.basePath', (window.WEBROOT || '') + 'static/framework/')
    .config([
      '$interpolateProvider',
      '$httpProvider',
      function ($interpolateProvider, $httpProvider) {
        // Replacing the default angular symbol
        // allow us to mix angular with django templates
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
        $(document).on('keypress', 'input', function($event){
            if($event.keyCode === 13){
                $event.preventDefault();
            }
        });
        // Http global settings for ease of use
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';

        // Global http error handler
        // if user is not authorized, log user out
        // this can happen when session expires
        $httpProvider.interceptors.push(['$q', 'horizon.framework.widgets.toast.service', function ($q, toastService) {
          return {
            responseError: function (error) {
              if (error.status === 403 && error.data.indexOf('Quota exceeded') < 0) {
                var error_message = gettext('You have no authority to perform this operation, please contact administrator.');
                if (error.data && window.DEBUG_TOAST_ENABLED === 'True') {
                  error_message += gettext(' Reason: ') + error.data;
                }
                toastService.add('error', error_message);
              } else if (error.status === 401) {
                window.location.replace((window.WEBROOT || '') + 'auth/logout');
              } else if (error.status === 0){
                // If error.status returns 0, means ajax request is cut by redirect
                // we catch this error, put it to $q.defer, this action will return a
                // promise object.
                var deferred = $q.defer();
                return deferred.promise;
              } else{
                return $q.reject(error);
              }
            }
          };
        }]);
      }
    ]);
})();
