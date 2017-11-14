/**
 * Copyright 2015 EasyStack Inc.
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
(function () {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.mana', ManaAPI);

  ManaAPI.$inject = ['$q',
                     'horizon.framework.util.http.service',
                     'horizon.framework.widgets.toast.service'];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.mana
   * @description Provides access to ManaAPI APIs.
   */
  function ManaAPI($q, apiService, toastService) {

    var self = this;

    /* getAvailableResources
     *
     * returns: {
     *   'compute': [{'res_type': '...',
     *                'description': 'res type description',
     *                'hosts': [host1, host2, ...],
     *               },
     *               {...},
     *              ],
     *   'network': [{'res_type': 'publicip',
     *                'description':  'public ip',
     *                'data':  [dict1, dict2],
     *               },
     *               {...},
     *              ],
     *   'storage': []
     * }
     */
    this.getAvailableResources = function (filter) {
      var params = (filter) ? {'params': filter} : {};
      return apiService.get('/api/mana/availableresources/', params);
    };

    /* getDedicatedResources
     *
     * returns: {
     *   'compute': [{'res_type': '...',
     *                'description': 'res type description',
     *                'hosts': [host1, host2, ...],
     *               },
     *               {...},
     *              ],
     *   'network': [{'res_type': 'publicip',
     *                'description':  'public ip',
     *                'data':  [dict1, dict2],
     *               },
     *               {...},
     *              ],
     *   'storage': []
     * }
     */
    this.getDedicatedResources = function (filter) {
      var params = (filter) ? {'params': filter} : {};
      return apiService.get('/api/mana/dedicatedresources/', params);
    };

    /* editDedicatedResources
     *
     * changes: a list of {
     *   action: 'add'/'remove',
     *   res_type: 'compute'/'network'/'storage',
     *   res_sub_type: '...',
     *   num: <int>
     * }
     */
    this.editDedicatedResources = function (changes) {
      var body = {'changes': changes};
      return apiService.post('/api/mana/dedicatedresources/', body);
    };

    /* addDedicatedResources
     *
     * ress: a list of {
     *   res_type: 'compute'/'network'/'storage',
     *   res_sub_type: '...',
     *   num: <int>
     * }
     */
    this.addDedicatedResources = function (ress) {
      var body = {'ress': ress};
      return apiService.patch('/api/mana/dedicatedresources/', body);
    };

    /* cleanDedicatedResources
     *
     * cleanup all dedicated resources
     */
    this.cleanDedicatedResources = function () {
      return apiService.delete('/api/mana/dedicatedresources/');
    };

    /* getTransaction
     *
     * id: mana transaction id
     */
    this.getTransaction = function (id) {
      return apiService.get('/api/mana/transactions/{0}/'.format(id));
    };

    this.getTransactionState = function (tran_id) {
      var deferred = $q.defer();
      var refresh = function () {
        self.getTransaction(tran_id)
          .success(function (data) {
            if(data['status'] != 'ok') {
              deferred.notify(data);
              setTimeout(refresh, 3000);
              return;
            }
            var transactions = data['result'];
            var transaction = transactions[0];
            var state = transaction['state'];
            if (state == 'finished'){
              deferred.resolve(data);
            }
            else if (['check-failed', 'rollbacked', 'error'].contains(state)) {
              deferred.reject(data);
            }
            else {
              deferred.notify(data);
              setTimeout(refresh, 3000);
            }
          })
          .error(deferred.reject);
      };
      refresh();
      return deferred.promise;
    };

    /* Compute Resources
     */
    this.getComputeResources = function (filter) {
      var params = (filter) ? {'params': filter} : {};
      return apiService.get('/api/mana/dedicatedresources/compute/', params);
    };

    this.addComputeResources = function (res_sub_type, num) {
      var body = {'res_sub_type': res_sub_type, 'num': num};
      return apiService.post('/api/mana/dedicatedresources/compute/', body);
    };

    this.removeComputeResources = function (res_sub_type, num) {
      var body = {'res_sub_type': res_sub_type, 'num': num};
      return apiService.patch('/api/mana/dedicatedresources/compute/', body);
    };

    this.cleanComputeResources = function () {
      return apiService.delete('/api/mana/dedicatedresources/compute/');
    };

    /* Network Resources
     */
    this.getNetworkResources = function (filter) {
      var params = (filter) ? {'params': filter} : {};
      return apiService.get('/api/mana/dedicatedresources/network/', params);
    };

    this.addNetworResources = function (res_sub_type, num) {
      var body = {'res_sub_type': res_sub_type, 'num': num};
      return apiService.post('/api/mana/dedicatedresources/network/', body);
    };

    this.removeNetworResources = function (res_sub_type, num) {
      var body = {'res_sub_type': res_sub_type, 'num': num};
      return apiService.patch('/api/mana/dedicatedresources/network/', body);
    };

    this.cleanNetworkResources = function () {
      return apiService.delete('/api/mana/dedicatedresources/network/');
    };

    /* Storeage Resources
     */
    this.getStorageResources = function (filter) {
      var params = (filter) ? {'params': filter} : {};
      return apiService.get('/api/mana/dedicatedresources/storage/', params);
    };

    this.addStorageResources = function (res_sub_type, num) {
      var body = {'res_sub_type': res_sub_type, 'num': num};
      return apiService.post('/api/mana/dedicatedresources/storage/', body);
    };

    this.removeStorageResources = function (res_sub_type, num) {
      var body = {'res_sub_type': res_sub_type, 'num': num};
      return apiService.patch('/api/mana/dedicatedresources/storage/', body);
    };

    this.cleanStorageResources = function () {
      return apiService.delete('/api/mana/dedicatedresources/storage/');
    };
  }
}());
