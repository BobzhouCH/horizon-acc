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

    angular.module('hz.dashboard.admin.invcodes')

    .controller('adminInvcodeController', [
        '$scope',
        '$rootScope',
        'horizon.openstack-service-api.policy',
        'horizon.openstack-service-api.chakra',
        'horizon.openstack-service-api.settings',
        'createInvCodeAction',
        'deleteInvCodeAction',
        'horizon.framework.widgets.toast.service',
        function(scope, rootScope, policyAPI, chakraAPI, settingsAPI,
        		CreateAction, DeleteAction, toastService) {
            var self = this;
            scope.context = {
                header: {
                    invcode: gettext('Invitation Code'),
                    status: gettext('Status'),
                    worth: gettext('Worth'),
                    use_by: gettext('Used By'),
                    use_at: gettext('Used At'),
                    codetype: gettext('Type'),
                    expired: gettext('Expired Time'),
                    create_at: gettext('Created Time'),
                },
                action: {},
                error: {
                    api: gettext('Unable to retrieve invitation code'),
                    priviledge: gettext('Insufficient privilege level to view invitation code information.')
                }
            };
            scope.activationcodei18n = {
                'used': gettext('Used'),
                'available': gettext('Available'),
                'wrong_status': gettext('Wrong Status'),
                'overtime': gettext('Overtime'),
                'verify_failed': gettext('Verify Failed'),
            };
       this.reset = function(){
          scope.iinvcodes = [];
          scope.invcodes = [];
          scope.checked = {};
          scope.selected = {};
          scope.iinvcodesState = false;
          if(scope.selectedData)
            scope.selectedData.aData = [];
        };

        this.init = function(){
          scope.actions = {
            refresh: self.refresh,
            create: new CreateAction(scope),
            deleted: new DeleteAction(scope)
          };
          self.refresh();
          var promise = settingsAPI.getSetting('ENABLE_BILLING', true);
          promise.then(function (response) {
            scope.enable_billing = response;
          });
        };

        this.refresh = function() {
            self.reset();
            policyAPI.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
            .success(function(response) {
            if (response.allowed) {
                chakraAPI.getInvCodes().success(function (data) {
                    scope.invcodes = data.items;
                    scope.iinvcodesState = true;

                    var datetime_to_unix = function (datetime) {
                        var tmp_datetime = datetime.replace(/:/g, '-');
                        tmp_datetime = tmp_datetime.replace(/ /g, '-');
                        var arr = tmp_datetime.split("-");
                        var time = Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]);
                        return time;
                    }

                    angular.forEach(scope.invcodes, function (invcode) {
                        if (invcode.use_at) {
                            invcode.use_at = rootScope.rootblock.utc_to_local(invcode.use_at);
                        }
                        if (invcode.create_at) {
                            invcode.create_at = rootScope.rootblock.utc_to_local(invcode.create_at);
                        }
                        if (invcode.expired) {
                            invcode.expired = rootScope.rootblock.utc_to_local(invcode.expired);
                        }
                    });
                });
            }
            else {
            toastService.add('info', scope.context.error.priviledge);
            window.location.replace((window.WEBROOT || '') + 'auth/logout');
            }
        });
        };

        this.init();

        scope.filterFacets = [{
          label: gettext('Invitation Code'),
          name: 'invcode',
          singleton: true
        }, {
          label: gettext('Status'),
          name: 'status',
          singleton: true,
          options: [
            { label: gettext('Used'), key: 'used' },
            { label: gettext('Available'), key: 'available' },
            { label: gettext('Wrong Status'), key: 'wrong_status' },
            { label: gettext('Overtime'), key: 'overtime' },
            { label: gettext('Verify Failed'), key: 'verify_failed' }
          ]
        }, {
          label: gettext('Worth'),
          name: 'worth',
          singleton: true
        }, {
          label: gettext('Used By'),
          name: 'use_by',
          singleton: true
        }, {
          label: gettext('Used At'),
          name: 'use_at',
          singleton: true
        }, {
          label: gettext('Expired Time'),
          name: 'expired',
          singleton: true,
          options: [
            { label: gettext('true'), key: 'True' },
            { label: gettext('false'), key: 'False' }
          ]
        }, {
          label: gettext('Created Time'),
          name: 'create_at',
          singleton: true
        }];

      }
    ]);

    })();