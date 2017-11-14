/**
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

  angular.module('hz.dashboard.settings.lang')

  /**
   * @ngDoc editPasswordAction
   * @ngService
   *
   * @Description
   * Brings up the edit setting modal dialog.
   * On submit, edit user and display a success message.
   * On cancel, do nothing.
   */
  .factory('langAction', [
    'horizon.openstack-service-api.usersettings',
    '$modal', 'backDrop',
    'horizon.dashboard.settings.basepasswordPath',
    'horizon.framework.widgets.toast.service',
  function(settingAPI, modal, backDrop, path, toastService) {

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // Chinese and English switching
      self.setLanguage = function(lang){
        settingAPI.setLanguage({'lang': lang})
          .success(function(){
            window.location.reload();
          });
      };

      self.syncLanguage = function(){
        var lang = horizon.cookies.getRaw('horizon_language');
        if(lang) {
          self.updateLang(lang);
        }
        else {
          settingAPI.getLanguage()
            .success(function(response){
              //console.log(response);
              self.updateLang(response);
            });
        }
      };

      self.updateLang = function(lang){
        scope.state.en_active = false;
        scope.state.zh_active = false;

        if(lang === 'zh-cn'){
          scope.state.zh_active = true;
        }
        else{
          scope.state.en_active = true;
        }
      };
    }

    return action;
  }]);

})();
