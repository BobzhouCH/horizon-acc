/**
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.settings.password')

  /**
   * @ngDoc editPasswordAction
   * @ngService
   *
   * @Description
   * Brings up the edit setting modal dialog.
   * On submit, edit user and display a success message.
   * On cancel, do nothing.
   */
  .factory('settingsLicenseAction', [
  	'$modal', 'backDrop', '$filter',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.nova',
  function(modal, backDrop, $filter, keystoneAPI, novaAPI ) {

      function action(scope) {

          var self = this;

          keystoneAPI.getCurrentUserSession()
          .success(function(response) {
                  var max_nodes = '';
                  var cur_nodes = '';
                  var context = {}
                  /*var now = $filter('date')(new Date(), 'yyyy-MM-dd');
                  var deadline = response.license_info.expiration ? response.license_info.expiration : now;
                  var sArr = now.split("-");
                  var eArr = deadline.split("-");
                  var sRDate = new Date(sArr[0], sArr[1], sArr[2]);
                  var eRDate = new Date(eArr[0], eArr[1], eArr[2]);
		          var left_date = (eRDate - sRDate) / (24 * 60 * 60 * 1000);*/
                  var deadline = response.license_info.expiration ? response.license_info.expiration : '-';
                  var left_date = '-';
                  if((response.license_info.days_remaining && response.license_info.days_remaining != -1) || response.license_info.days_remaining ==0){
                      left_date = response.license_info.days_remaining;
                  }
                  if(response.license_info.expiration && response.license_info.expiration != ''){
                      if (left_date <= 10 && !localStorage.getItem('hasAlert')) {
                          var message = interpolate(gettext('The remaining date of the license is %s days.'), [left_date]);
                          keystoneAPI.toast('info', message);
                          localStorage.setItem('hasAlert',true);
                      }
                  }

                  keystoneAPI.getCloudAdmin()
                    .success(function(result) {
                          if(result == true){
                              scope.license_user = 'admin';
                              var type = response.license_info.type;
                              if(response.license_info.type == 'trial'){
                                  context = {
                                      title: gettext('License Info'),
                                      type_text: gettext('License type'),
                                      type:gettext('trial'),
                                      deadline_text: gettext('Due date'),
                                      deadline: deadline,
                                      left_date_text: gettext('Days remaining'),
                                      left_date: left_date,
                                      submit: gettext('Closed'),
                                      type_before_trans: 'trial',
                                  };
                              }else if(response.license_info.type == 'official'){
                                  max_nodes = response.license_info['max-compute'];
                                  //发送接口获取最大节点数
                                  novaAPI.getHypervisors('All').success(function(data){
                                      cur_nodes = data.items.length
                                      context = {
                                          title: gettext('License Info'),
                                          type_text: gettext('License type'),
                                          type:gettext('official'),
                                          max_nodes_text:gettext('Maximum manageable compute nodes'),
                                          max_nodes:max_nodes,
                                          cur_nodes_text:gettext('Currently managed compute nodes'),
                                          cur_nodes:cur_nodes,
                                          submit: gettext('Closed'),
                                          type_before_trans: 'official',
                                      };

                                  })

                              }


                              var option = {
                                  templateUrl: (window.WEBROOT || '') + 'settings/password/license/',
                                  controller: 'licenseFormCtrl',
                                  backdrop: backDrop,
                                  resolve: {
                                      context: function () {
                                          return context;
                                      }
                                  }
                              };

                              // open up the edit form
                              self.license = function () {
                                  modal.open(option);
                              }
                          }
                    });

          })

      }

        return action;

  }]);

})();
