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

  angular.module('hz.dashboard.admin.aggregates')

  /**
   * @ngDoc attachAction
   * @ngService
   *
   * @Description
   * Brings up the liveMigrate volume modal dialog.
   * On submit, liveMigrate volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('hz.dashboard.admin.aggregates.EditHostAction', [
    'horizon.openstack-service-api.nova',
    '$modal', 'backDrop',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Add/Remove Hosts'),
      submit: gettext('Save'),
      success: gettext('Aggregate %s has been updated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this, aggregate;

      var option = {
        templateUrl: 'hosts-form',
        controller: 'hz.dashboard.admin.aggregates.HostFormCtrl',
        backdrop: backDrop,
        resolve: {
          aggregate: function(){ return self.aggregate; },
          context: function(){ return context; }
        },
        windowClass: 'EditHostContent'
      };

      // open up the live-migrate form
      self.open = function(aggregates) {
        aggregate = aggregates[0];
        aggregate.aHosts = [];
        for(var i=0,len=aggregate.hosts.length; i<len; i++){
          aggregate.aHosts.push({ 'hypervisor_hostname': aggregate.hosts[i] });
        }
        self.aggregate = angular.copy(aggregate);

        modal.open(option).result.then(self.submit);
      };

      // seting a new data
      self.clean = function(newAggregate){
        var oldHost = aggregate.hosts,
            newHost = [],
            removeOldHost = [],
            addNewHost = [];

        for(var k=0,len=newAggregate.aHosts.length; k<len; k++){
          newHost.push(newAggregate.aHosts[k].hypervisor_hostname);
        }

        for(var i=0,len=oldHost.length; i<len; i++){
          var index = $.inArray(oldHost[i], newHost);
          if(index === -1){
            removeOldHost.push(oldHost[i]);
          }
        }

        for(var k=0,len=newHost.length; k<len; k++){
          var index = $.inArray(newHost[k], oldHost);
          if(index === -1){
            addNewHost.push(newHost[k]);
          }
        }

        return {
          remove_host: removeOldHost,
          add_host: addNewHost
        };
      };

      // submit this action to api
      self.submit = function(newAggregate) {
        var newData     = self.clean(newAggregate),
            aggregateId = newAggregate.id,
            sendMethod;

        sendMethod = function(aggregateId, action, host, index){
          novaAPI.updateAggregateHosts(aggregateId, action, host)
          .success(function(response){
            var message = interpolate(context.success, [aggregate.name]);

            if(newData[action].length-1 === index){
              scope.refresh();
              toastService.add('success', gettext(message));
              scope.broadcastRefresh();
            }
          });
        };

        for(var i=0,len=newData.remove_host.length; i<len; i++){
          sendMethod(aggregateId, 'remove_host', newData.remove_host[i], i);
        }

        for(var i=0,len=newData.add_host.length; i<len; i++){
          sendMethod(aggregateId, 'add_host', newData.add_host[i], i);
        }
        scope.clearSelected();
      };

    }

    return action;
  }])

  // Get hosts
  .factory('hz.dashboard.admin.aggregates.HostsAction', [
    'horizon.openstack-service-api.nova',
    function(novaAPI){
      function action(scope) {
        var self = this,
            aggregateMethod;

        aggregateMethod = {
          add: function(data, index){
            scope.selectedHosts.push(data);
            //scope.hosts.splice(index, 1);
            scope.hosts.remove(data);
          },

          remove: function(data, index){
            scope.hosts.push(data);
            //scope.selectedHosts.splice(index, 1);
            scope.selectedHosts.remove(data);
          }
        };

        self.getHosts = function(){
          return novaAPI.getHypervisors('All');
        };

        self.setHostsData = function(action, data, index){
          aggregateMethod[action](data, index);
        };
      }

      return action;
    }
  ]);

})();
