
(function() {
  'use strict';

  /**
   * @ngdoc hz.dashboard.settings
   * @ngModule
   *
   * @description
   * Dashboard module to host various settings panels.
   */
  angular
    .module('hz.dashboard.settings', [
      'hz.dashboard.settings.password',
      'hz.dashboard.settings.lang',
      'hz.dashboard.settings.ticket',
    ])

    //begin:<wujx9>:<new feature(license)>:<action (m)>:<date(2016-11-16)>
    .controller('settingsCtrl', ['$scope', 'editPasswordAction', 'settingsLicenseAction', 'langAction', 'horizon.openstack-service-api.keystone',
      function(scope, EditAction, LicenseAction, LangAction, keystoneAPI) {
        scope.actions = {
          edit: new EditAction(scope),
          lang: new LangAction(scope),
          license: new LicenseAction(scope)
          //end:<wujx9>:<new feature(license)>:<action (m)>:<date(2016-11-16)>
        };
        scope.state = {
          zh_active: false,
          en_active: true
        };

        this.init = function(){
          scope.actions.lang.syncLanguage();
          keystoneAPI.getLDAP().success(function(data){
            scope.ldap_editable = data["editable"];
          });
        };

        this.init();

    }])

    .constant('horizon.dashboard.settings.basepasswordPath', (window.WEBROOT || '') + 'settings/');

})();
