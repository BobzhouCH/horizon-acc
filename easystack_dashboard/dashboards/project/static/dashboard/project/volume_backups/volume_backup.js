(function(){
    'use strict';
    angular.module('hz.dashboard.project.volume_backups', [])
      .constant('horizon.dashboard.volume_backups.PATH', (window.WEBROOT || '') + 'project/volume_backups/');
})();
