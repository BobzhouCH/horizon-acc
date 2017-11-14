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

angular.module('hz.dashboard.admin.notice')

.controller('adminNoticeController', [
    '$scope',
    'horizon.openstack-service-api.usersettings',
    'horizon.framework.widgets.toast.service',
    function(scope, UserSettingsAPI, toastService) {

        UserSettingsAPI.getNotice().success(function(data){
          scope.title = data.notice_title;
          scope.context = data.notice_context;
          scope.display = data.notice_display;
        });

        scope.save = function(){
          var newinfo = {}
          newinfo['notice_title']=scope.title;
          newinfo['notice_context']=scope.context;
          newinfo['notice_display']=scope.display;
          UserSettingsAPI.updateNotice(newinfo).success(function(data){
            if (data){
              toastService.add('success', gettext('Notice Info has been saved successfully.'));
            }
          });
        }
    }
]);

})();