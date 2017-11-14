(function () {
 'use strict';

  angular.module('hz.dashboard', [
    'hz.dashboard.aws-launch-instance',
    'hz.dashboard.launch-instance',
    'hz.dashboard.baremetal-launch-instance',
    'hz.dashboard.tech-debt',
    'hz.dashboard.workflow',
    'MagicSearch' //magic-search.js
  ])
  .constant('dashboardBasePath',  (window.WEBROOT || '') + 'static/dashboard/');

})();
