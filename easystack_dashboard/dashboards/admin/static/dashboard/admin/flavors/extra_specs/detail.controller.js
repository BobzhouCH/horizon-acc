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
/**
 ** Author : liufeng24@lenovo.com
 ** Module : extra_specs
 ** Data   : 2016-12-26
 **/

(function() {
  'use strict';

   angular.module('hz.dashboard.admin.flavors')

   .controller('detailExtraSpecFormController',
    ['$scope', '$rootScope',
    '$modalInstance','$timeout','detail', 'context',
    'horizon.framework.widgets.toast.service',
    'horizon.openstack-service-api.nova',
    'createExtraAction',
    'deleteExtraAction',
    function (
      scope, rootScope, modalInstance, $timeout, detail, context,
      toastService, novaAPI, createExtraAction, deleteExtraAction) {
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
        name:  gettext('MY Name'),
        key:   gettext('Key'),
        value: gettext('Value'),
      },
    };

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

    this.hasSelected = function(extra) {
      var selected = scope.selected[extra.id];
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
      scope.extraspecs= [];
      scope.iextraspecs = [];
      scope.iextraspecsState = false;

      scope.disableDelete = true;
      scope.disableCreate = true;
      scope.disableDisableFlavor = true;
      scope.disableEnableFlavor = true;
      scope.disableEditListener = true;
      self.clearSelected();
      toastService.clearAll();
    };


    this.initScope = function() {
      scope.clearSelected = self.clearSelected;
      scope.allowMenus = self.allowMenus;

      scope.actions = {
        refresh: self.refresh,
	    create: new createExtraAction(scope),
        deleted: new deleteExtraAction(scope),
      };
    };

    scope.flavor = detail.flavor;

    this.init = function(){
      self.initScope();
      self.refresh();
      self.startUpdateStatus(10000);

      // TODO: no call 
      scope.checkEnableBtn = function($table){
        if ($table.$scope.numSelected == 0) {
          return true;
        }
        var selected = $table.$scope.selected;
        if (scope.extraspecs) {
          for (var i = 0; i < scope.extraspecs.length; i++) {
            var extra = scope.extraspecs[i];
            if (selected[extra.id] && selected[extra.id].checked) {
		alert(666);
                return true;
            }
          }
        }
      }

      // TODO: no call 
      scope.checkDisableBtn = function($table){
        if ($table.$scope.numSelected == 0) {
          return true;
        }
        var selected = $table.$scope.selected;
        var num = [];
        if (scope.extraspecs) {
          for (var i = 0; i < scope.extraspecs.length; i++) {
            var extra = scope.extraspecs[i];
            if (selected[extra.id] && selected[extra.id].checked) {
              num.push(extra);
              return true;
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
      function check(){
	novaAPI.getFlavor(detail.flavor.id, true, true)
          .success(function(response) {
        	for(var i = 0; i < scope.extraspecs.length; i++){
		    var extra = scope.extraspecs[i];
		    if(response.extras[extra.key] !== undefined){
			var newExtra = {};
			newExtra.id = extra.id;
			newExtra.key = extra.key;
			newExtra.value = response.extras[extra.key];
		        angular.extend(extra, newExtra);
			if (self.hasSelected(extra)) {
			   self.allowMenus(scope.selectedData.aData);
			}
		    } 
		    else {
			scope.extraspecs.removeId(extra.id);
			self.removeSelected(extra.id);
		    }
        	}
	});
      }
      setInterval(check, interval);
    };


    this.refresh = function(){
      scope.disableCreate = false;
      self.reset();
        novaAPI.getFlavor(detail.flavor.id, true, true)
          .success(function(response) {
            scope.flavor = response;
            scope.flavor.is_public = response['os-flavor-access:is_public'];
            scope.flavor.swap = detail.flavor.swap;
            var array = [];
            var id = 0;
             for (var key in response.extras) {
               array.push({'id': id++, 'key': key,'value': response.extras[key]})
             }
            scope.extraspecs = array;
            scope.iextraspecsState = true;
        });
    };

    scope.canOperation = true;
    if (detail.flavor != null && detail.flavor != {} && detail.flavor.id != "") {
        novaAPI.getServers({ all_tenants: 'True' })
          .success(function (response) {
              angular.forEach(response.items, function (instance) {
                if (instance.flavor.id == detail.flavor.id) {
                    scope.canOperation = false;
                }
              });
          });
    }

    this.allowDelete = function(extra){
      scope.disableDelete = false;
    };

    this.allowCreate = function(extra){
      scope.disableCreate = false;
    };

    this.allowMenus = function(extra) {
      self.allowDelete(extra);
      self.allowCreate(extraspec);
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
