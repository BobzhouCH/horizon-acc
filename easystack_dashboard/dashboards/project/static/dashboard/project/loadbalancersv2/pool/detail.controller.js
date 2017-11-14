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

  /**
   * @ngdoc poolformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit load balancer members form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */

    // pool detail controller
    .controller('poolDetailForm',poolDetailForm);
    poolDetailForm.$inject = [
      '$scope', '$sce', '$modalInstance', '$timeout',
       'horizon.openstack-service-api.lbaasv2',
       'horizon.openstack-service-api.nova',
       'horizon.framework.widgets.toast.service',
       'addResourcesAction',
       'batchAddResourcesAction',
       'enableMemberAction',
       'disableMemberAction',
       'modifyWeightAction',
       'deleteMemberAction',
       'detail', 'context', 'ctrl'];

    function poolDetailForm(scope, sce, modalInstance, $timeout,
                            lbaasv2API, novaAPI, toastService,
                            AddResourcesAction,
                            BatchAddResourcesAction,
                            EnableMembersAction,
                            DisableMembersAction,
                            ModifyWeightAction,
                            DeleteMemberAction,
                            detail, context, ctrl) {
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

        scope.pool = detail.pool;
        lbaasv2API.getHealthMonitor(true, detail.pool.healthmonitor_id).success(function(h_data){
          scope.pool.hm_type = h_data.type;
          scope.pool.hm_max_retries = h_data.max_retries;
          scope.pool.hm_timeout = h_data.timeout;
          scope.pool.hm_delay = h_data.delay;
        });

        this.clearSelected = function(){
          scope.checked = {};
          scope.selected = {};
          scope.numSelected = 0;
          if(scope.selectedData)
            scope.selectedData.aData = [];
        };

        this.hasSelected = function(member) {
          var selected = scope.selected[member.id];
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
          scope.members = [];
          scope.imembers = [];
          scope.imembersState = false;

          scope.disableDelete = true;
          scope.disableAdd = true;
          scope.disableModifyWeight = true;

          self.clearSelected();
          toastService.clearAll();
        };

        this.initScope = function() {
          scope.clearSelected = self.clearSelected;
          scope.allowMenus = self.allowMenus;
          scope.updateMember = self.updateMember;
          scope.detail = detail;

          scope.actions = {
            refresh: self.refresh,
            addResources: new AddResourcesAction(scope),
            batchAddResources: new BatchAddResourcesAction(scope),
            modifyWeight: new ModifyWeightAction(scope),
            enableMember: new EnableMembersAction(scope),
            disalbeMember: new DisableMembersAction(scope),
            deleteMember: new DeleteMemberAction(scope)
          };
        };

        // on load, if user has permission
        // fetch table data and populate it
        this.init = function(){
          self.initScope();
          self.refresh();
          // self.startUpdateStatus(10000);

          scope.checkEnableBtn = function($table){
            if ($table.$scope.numSelected == 0) {
              return true;
            }
            var selected = $table.$scope.selected;
            if (scope.members) {
              for (var i = 0; i < scope.members.length; i++) {
                var member = scope.members[i];
                if (selected[member.id] && selected[member.id].checked) {
                  if (member.admin_state_up === true) {
                    return true;
                  }
                }
              }
            }
          };

          scope.checkDisableBtn = function($table){
            if ($table.$scope.numSelected == 0) {
              return true;
            }
            var selected = $table.$scope.selected;
            if (scope.members) {
              for (var i = 0; i < scope.members.length; i++) {
                var member = scope.members[i];
                if (selected[member.id] && selected[member.id].checked) {
                  if (member.admin_state_up === false) {
                    return true;
                  }
                }
              }
            }
          };

          scope.$watch('numSelected', function(current, old) {
            if (current != old)
              self.allowMenus(scope.selectedData.aData);
          });
        };

        this.refresh = function(){
          scope.disableAdd = false;
          self.reset();
          // novaAPI.getServers().success(function(response) {
          //     if (response.items) {
          //       scope.instances = response.items;
          //     }
          // });
          lbaasv2API.getMembers(detail.pool.id)
            .success(function(response) {
              scope.members = response.items;
              scope.imembersState = true;
            });
        };

        this.updateMember = function(member) {
          lbaasv2API.getMember(detail.pool.id, member.id, true)
            .success(function(response) {
              // update the member
              angular.extend(member, response);
              // update the menus
              if (self.hasSelected(member)) {
                self.allowMenus(scope.selectedData.aData);
              }
            })
            .error(function(response, status) {
              if(status == 404) {
                scope.members.removeId(member.id);
                self.removeSelected(member.id);
              }
            });
        };

        this.allowDelete = function(members){
          scope.disableDelete = false;
        };

        this.allowAdd = function(members){
          scope.disableAdd = false;
        };

        this.allowModifyWeight = function(members){
          scope.ModifyWeight = false;
        };

        this.allowMenus = function(members) {
          self.allowDelete(members);
          self.allowAdd(members);
          self.allowModifyWeight(members);
        };

        this.init();

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

        scope.label = context.label;
        scope.title = context.title;
        scope.ctrl = ctrl;
        scope.action = action;
    }

})();
