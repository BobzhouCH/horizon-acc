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

    angular.module('hz.dashboard.project.loadbalancersv2')

   .controller('detailFormController',
    ['$scope', '$rootScope',
    '$modalInstance','$timeout','detail', 'context',
    'horizon.framework.widgets.toast.service',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.lbaasv2', 'createListenersAction',
    'editListenersAction', 'deleteListenerAction','enableListenerAction','disableListenerAction',
    function (
      scope, rootScope, modalInstance, $timeout, detail, context,
      toastService, usersettingAPI, keystoneAPI, loadbalanceAPI, createListenersAction, editListenersAction,
      deleteListenerAction, enableListenerAction, disableListenerAction) {
    var self = this;

    var w = 888;
    var action = {
      submit: function() {
        modalInstance.close(detail);
      },
      cancel: function() {
        $('.detailContent').stop();
        $('.detailContent').animate({
        right: -(w + 40)
      }, 400, function() {
            modalInstance.dismiss('cancel');
         });
      }
    };

    scope.context = {
      header: {
        name: gettext('Name'),
        protocol: gettext('Protocol'),
        port_number: gettext('Port Number'),
        max_connection: gettext('Max Connection'),
        default_pool: gettext('Default Pool'),
        enable: gettext('Enable Status'),
        status: gettext('Status'),
      },
      actions: {
        create: gettext('Create Listener'),
        edit: gettext('Edit'),
        enable: gettext('Enable'),
        disable: gettext('Disable'),
        dissociate_Resource_Pool: gettext('Disssociate Resource Pool'),
        deleted: gettext('Delete')
      },
    };

    scope.operatingStatus = {
      'ONLINE': gettext('Online'),
      'OFFLINE': gettext('Offline'),
      'DEGRADED': gettext('Degraded'),
      'ERROR': gettext('Error')
    };

    scope.enableStatus ={
      'true' : gettext('Enabled'),
      'false' : gettext('Disabled')
    }

    scope.provisioningStatus = {
      'ACTIVE': gettext('Active'),
      'PENDING_CREATE': gettext('Pending Create'),
      'PENDING_UPDATE': gettext('Pending Update'),
      'PENDING_DELETE': gettext('Pending Delete'),
      'ERROR': gettext('Error')
    };

    scope.label = context.label;
    scope.title = context.title;
    scope.action = action;
    scope.detail = detail;

    this.clearSelected = function(){
      scope.checked = {};
      scope.selected = {};
      scope.numSelected = 0;
      if(scope.selectedData)
        scope.selectedData.aData = [];
    };

    this.hasSelected = function(listener) {
      var selected = scope.selected[listener.id];
      if (selected)
        return selected.checked;
      return false;
    };

    this.removeSelected = function(id) {
      var selected = scope.selected[id];
      if (selected) {
        selected.checked = false;
        delete scope.selected[id];
        scope.checked[id] = false;
        scope.selectedData.aData.removeId(id);
        //scope.numSelected--;
      }
    };

    this.reset = function(){
      scope.listeners = [];
      scope.ilisteners = [];
      scope.ilistenersState = false;

      scope.disableDelete = true;
      scope.disableCreate = true;
      scope.disableDisableListener = true;
      scope.disableEnableListener = true;
      scope.disableDissciatePool = true;
      scope.disableEditListener = true;
      self.clearSelected();
      toastService.clearAll();
    };

    this.initScope = function() {
      scope.clearSelected = self.clearSelected;
      scope.allowMenus = self.allowMenus;
      scope.updatelistener = self.updatelistener;

      scope.actions = {
        refresh: self.refresh,
        create: new createListenersAction(scope),
        deleted: new deleteListenerAction(scope),
        edit: new editListenersAction(scope),
        enableListener: new enableListenerAction(scope),
        diableListener: new disableListenerAction(scope),
      };
    };

    scope.loadbalancer = detail.loadbalancer

    this.init = function(){
      self.initScope();
      self.refresh();
      self.startUpdateStatus(10000);

      scope.checkEnableBtn = function($table){
        if ($table.$scope.numSelected == 0) {
          return true;
        }
        var selected = $table.$scope.selected;
        if (scope.listeners) {
          for (var i = 0; i < scope.listeners.length; i++) {
            var listener = scope.listeners[i];
            if (selected[listener.id] && selected[listener.id].checked) {
              if (listener.admin_state_up === true) {
                return true;
              }
            }
          }
        }
      }

      scope.checkDisableBtn = function($table){
        if ($table.$scope.numSelected == 0) {
          return true;
        }
        var selected = $table.$scope.selected;
        var num = [];
        if (scope.listeners) {
          for (var i = 0; i < scope.listeners.length; i++) {
            var listener = scope.listeners[i];
            if (selected[listener.id] && selected[listener.id].checked) {
              num.push(listener);
              if (listener.admin_state_up === false) {
                return true;
              }
            }
          }
        }
      }

      scope.$watch('numSelected', function(current, old) {
        if (current != old)
          self.allowMenus(scope.selectedData.aData);
      });
    };

    this.startUpdateStatus = function(interval){
      var statusList = ['PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE' ];

      function check(){
        for(var i = 0; i < scope.listeners.length; i++){
          var listener = scope.listeners[i];
          if(statusList.contains(listener.provisioning_status)){
            self.updatelistener(listener);
          }
        }
      }
      setInterval(check, interval);
    };

    this.updatelistener = function(listener) {
      loadbalanceAPI.refreshListener(listener.id, true)
        .success(function(response) {
          // update the volume
          angular.extend(listener, response.listener);
          // update the menus
          if (self.hasSelected(listener)) {
            self.allowMenus(scope.selectedData.aData);
          }
        })
        .error(function(response, status) {
          if(status == 404) {
            scope.listeners.removeId(listener.id);
            self.removeSelected(listener.id);
          }
        });
    };


    this.refresh = function(){
      scope.disableCreate = false;
      self.reset();
        loadbalanceAPI.getListeners(detail.loadbalancer.id)
          .success(function(response) {
            scope.listeners = response.items;
            scope.ilistenersState = true;
            keystoneAPI.getCurrentUserSession()
              .success(function(response) {
                usersettingAPI.getComponentQuota(response.project_id, {only_quota: true, component_name: 'neutron'})
                  .success(function(data){
                    for (var i = 0; i < data.items.length; i++){
                      if (data.items[i].name === 'listeners'){
                        scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                        break;
                      }
                    }
                  });
              });
          });
    };

    this.allowDelete = function(listener){
      scope.disableDelete = false;
    };

    this.allowCreate = function(listener){
      scope.disableCreate = false;
    };

    this.allowEditListener = function(listener){
      scope.disableEditListener = false;
    };

    this.allowDissciatePool = function(listener){
      scope.disableDissciatePool = false
    }

    this.allowMenus = function(listener) {
      self.allowDelete(listener);
      self.allowEditListener(listener);

      self.allowCreate(listener);
      self.allowDissciatePool(listener);
    };

    var h = $(window).height();
      $timeout(function(){
        $('.detailContent').css({
          height: h,
          width: w,
          right: -w
        });
        $('.tab-content').css({
          height: h-62
        });
        $('.detailContent').stop();
        $('.detailContent').animate({
          right: 0
        },400)
          .css('overflow', 'visible');
      });

      $(window).resize(function() {
        var w2 = 888;
        var h2 = $(window).height();
        $('.detailContent').css({
          width: w2,
          height: h2
        });
        $('.tab-content').css({
          height: h2-62
        });
     });

    this.init();

  }])

})();
