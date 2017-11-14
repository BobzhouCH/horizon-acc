/**
 * 
 * Alarm module
 * All the alarm functions are dependent on this file.
 * 
 * Create time  2015-05-10
 * Edit time    2015-06-05
 */

(function(){
    'use strict';
    /**
     *  Create hz.dashboard.project.volume_snapshots module.
     */

    angular.module('hz.dashboard.project.volume_snapshots', [])
		.constant('horizon.dashboard.volume_snapshot.PATH', (window.WEBROOT || '') + 'project/volume_snapshots/');


})();
