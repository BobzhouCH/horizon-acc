/**
 * Copyright 2016 EasyStack Corp.
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
  angular.module('hz.dashboard.admin.bill')

  .controller('adminBillCtrl', ['$scope', '$rootScope', '$filter', 'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.policy', 'horizon.framework.widgets.toast.service',
    'horizon.openstack-service-api.keystone',
      function(scope, rootScope, filter, billingAPI, PolicyService, toastService, keystoneAPI) {

        scope.bproducts = [];
        scope.bproductsAll = [];
        scope.ibproducts = [];
        scope.bproductState = false;
        scope.currentDomainId = '';
        scope.dUrl = (window.WEBROOT || '') + 'admin/bill/download/';
        scope.context = {
          header: {
            resource: gettext('Resource'),
            createTime: gettext('Create Time'),
            updateTime: gettext('Update Time'),
            Items: gettext('Price Item'),
            Pricce: gettext('Unit Price'),
            Description: gettext('Description'),
            Status: gettext('Status'),
            RunTime: gettext('RunTime'),
            billingType: gettext('Billing Type'),
            Total: gettext('Cost'),
            project: gettext('Project')
          }
        };

        scope.billingType = {
            'H': gettext('By Hour'),
            'M': gettext('By Month'),
            'Y': gettext('By Year')
        };

        function getProducts(domainId){
          billingAPI.getAdminProduct().success(function(data) {
            var displayProducts = [];
            if (data && data.items) {
                // convert  utc time to local time
                for(var index = 0; index < data.items.length; index++) {
                    var create_at = data.items[index].create_at;
                    var update_at = data.items[index].update_at;
                    var ptype = data.items[index].ptype;
                    var unit = data.items[index].unit;
                     if(create_at)
                       {
                         data.items[index]['create_at'] = rootScope.rootblock.utc_to_local(create_at);
                       }
                     if(update_at)
                       {
                         data.items[index]['update_at'] = rootScope.rootblock.utc_to_local(update_at);
                       }
                     if(ptype === 'instance'){
                       if(data.items[index].status === 'suspend'){
                           if(unit === 'H'){
                              data.items[index].status = 'suspend_h';
                           }else{
                              data.items[index].status = 'suspend_m';
                           }
                       }
                     }
                     if (domainId && domainId == data.item[index].domain_id) {
                        displayProducts.add(data.items[index]);
                     }
                }

                scope.bproductsAll = data.items;
                if (domainId) {
                    scope.bproducts = displayProducts;
                } else {
                    scope.bproducts = scope.bproductsAll;
                }
            } else {
                scope.bproducts = [];
                scope.bproductsAll = [];
            }
            scope.bproductState = true;
          });
        }

        function getDomians() {
          keystoneAPI.getDomains()
            .success(function(response) {
                if (response.items) {
                    scope.domains = response.items;
                } else {
                    scope.domains = [];
                }
            });
        }
        this.refresh = function() {
            scope.bproductState = false;
            getProducts();
        };
        this.init = function() {
            PolicyService.check({ rules: [['identity', 'identity:get_cloud_admin_resources']] })
            .success(function(response) {
                if (response.allowed) {
                    getProducts();
                    getDomians();
                } else {
                    toastService.add('info', scope.context.error.priviledge);
                    window.location.replace((window.WEBROOT || '') + 'auth/logout');
                }
            });
        };

        scope.switchDomain = function() {
            if (scope.bproductsAll && scope.bproductsAll.length > 0) {
                if (scope.currentDomainId) {
                    scope.bproducts = scope.bproductsAll.filter(function (item){
                        return scope.currentDomainId == item.domain_id;
                    });
                    scope.dUrl = (window.WEBROOT || '') + 'admin/bill/download/' + scope.currentDomainId ;
                } else {
                    scope.bproducts = scope.bproductsAll;
                    scope.dUrl = (window.WEBROOT || '') + 'admin/bill/download/';
                }
            }
        };
        scope.actions = {
          refresh: this.refresh
        };

        scope.timeFormat = function(integer) {
          return parseInt(integer / 3600) + "小时" + parseInt((parseFloat(integer / 3600) - parseInt(integer / 3600)) * 60) + "分钟" + parseInt((parseFloat((parseFloat(integer / 3600) - parseInt(integer / 3600)) * 60) - parseInt((parseFloat(integer / 3600) - parseInt(integer / 3600)) * 60)) * 60) + "秒";
        };
        scope.filterFacets = [{
          label: gettext('Resource'),
          name: 'resource_name',
          singleton: true
        }, {
          label: gettext('Project'),
          name: 'project_name',
          singleton: true
        }, {
          label: gettext('Cost'),
          name: 'cost',
          singleton: true
        },{
          label: gettext('Billing Type'),
          name: 'unit',
          singleton: true,
          options: [
            { label: gettext('By Hour'), key: 'H' },
            { label: gettext('By Month'), key: 'M' },
            { label: gettext('By Year'), key: 'Y' }
          ]
        }, {
          label: gettext('Unit Price'),
          name: 'fee',
          singleton: true
        }, {
          label: gettext('RunTime'),
          name: 'runtime',
          singleton: true
        }, {
          label: gettext('Update Time'),
          name: 'update_at',
          singleton: true
        }, {
          label: gettext('Create Time'),
          name: 'create_at',
          singleton: true
        }];

        this.init();
    }
  ]);

})();

