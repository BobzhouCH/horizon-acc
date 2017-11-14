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

  angular.module('hz.dashboard.project.instances')

  /**
   * @ngDoc attachAction
   * @ngService
   *
   * @Description
   * Brings up the resize instance modal dialog.
   * On submit, resize instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('ResizeInstanceAction', [
    'horizon.openstack-service-api.nova',
    '$modal', 'backDrop',
    'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, backDrop, toastService) {
    var initCpu = [1,2,4,8,16,32,64,128],
        initRam = [512,1024,2048,4096,8192,16384,32768,65536,131072],
        initDisk = [20,40,60,80,100,200,500],

        //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (a)>:<date(2016-11-16)>
        vcpusInitNum = 0,
        ramInitNum = 0,
        //end:<wujx9>:<Bugzilla – Bug 75050>:<action (a)>:<date(2016-11-16)>

        context = {
          mode: 'resize',
          title: gettext('Resize Instance'),
          submit: gettext('Resize'),
          success: gettext('Instance %s has been resized successfully.'),
          quickOption: gettext('Quick Option'),
          advancedOption: gettext('Advanced Option'),
          header: {
            name: gettext('Name'),
            vcpus: gettext('CPU'),
            ram: gettext('RAM'),
            disk: gettext('Disk'),
          }
        };

    context.loadDataFunc = function(scope) {
      initScope(scope);

      novaAPI.getFlavors()
        .success(function(response) {
          var flavors = response.items;
          scope.dropdown.flavors = flavors;
          scope.canSelectFlavors = angular.copy(flavors);
          filterFlavorsByOldDisk(scope);
          if (flavors.length > 0) {
            //scope.action.addFlavor(scope.canSelectFlavors[0]);
            // TODO(xinwei): need to add quota: { vcpus:64,ram:32768,disk:200 }
            flavorModal.init(scope);
          }
          scope.loadingCanSelectFlavors = false;
        });

      function initScope (scope) {
        scope.oldFlavor = scope.instance.flavor;
        scope.canSelectFlavors = [];
        scope.loadingCanSelectFlavors = true;
        scope.selectedFlavors = [];

        scope.isShow = false;
        //scope.initCpu = initCpu;
        //scope.initRam = initRam;
        //scope.initDisk = initDisk;

        scope.action.addFlavor = function(flavor) {
          if (flavor.disable) {
            return;
          }
          scope.canSelectFlavors.remove(flavor);
          scope.canSelectFlavors.extend(scope.selectedFlavors);
          scope.canSelectFlavors = [].extend(scope.canSelectFlavors);
          scope.selectedFlavors = [flavor];
          scope.instance.flavor = flavor.id;
        };

        scope.action.removeFlavor = function(flavor) {
          if (!scope.selectedFlavors.contains(flavor)) {
            return;
          }
          scope.selectedFlavors = [];
          scope.instance.flavor = null;
          scope.canSelectFlavors.add(flavor);
        };

        scope.action.selectedFlavor = function(flavorId) {
          if (scope.selectedFlavors.containsId(flavorId)) {
            return;
          }
          var flavor = scope.canSelectFlavors.findId(flavorId);
          if (flavor) {
            scope.action.addFlavor(flavor);
          }
        };

        /*scope.$watch('instance.flavor', function(flavor, oldFlavor) {
          if(flavor !== oldFlavor){
            scope.action.selectedFlavor(flavor);
            flavorModal.selectedFlavor(flavor);
          }
        })*/
      }

      function filterFlavorsByOldDisk (scope) {
        var disk = scope.oldFlavor.disk;
        var flavors = scope.canSelectFlavors;
        for (var i = 0; i < flavors.length; i++) {
          var flavor = flavors[i];
          flavor.disable = (flavor.disk < disk);
        }
      }
    };

    // Edit flavor
    var flavorModal = {
        rander: function(aIndex,classNames){
          for(var i=0,len=aIndex.cpu.length; i<len; i++){
            this.cpuList.find('li').eq(aIndex.cpu[i]).attr('class',classNames);
            if(aIndex.type !== 'quota'){
              this.cpuList.find('li').eq(aIndex.cpu[i]).attr('iBtn','true');
            }
            else{
              this.cpuList.find('li').eq(aIndex.cpu[i]).removeAttr('iBtn');
            }
          }

          for(var i=0,len=aIndex.ram.length; i<len; i++){
            this.ramList.find('li').eq(aIndex.ram[i]).attr('class',classNames);
            if(aIndex.type !== 'quota'){
              this.ramList.find('li').eq(aIndex.ram[i]).attr('iBtn','true');
            }
            else{
              this.ramList.find('li').eq(aIndex.ram[i]).removeAttr('iBtn');
            }
          }
          for(var i=0,len=aIndex.disk.length; i<len; i++){
            this.diskList.find('li').eq(aIndex.disk[i]).attr('class',classNames);
            if(aIndex.type !== 'quota'){
              this.diskList.find('li').eq(aIndex.disk[i]).attr('iBtn','true');
            }
            else{
              this.diskList.find('li').eq(aIndex.disk[i]).removeAttr('iBtn');
            }
          }
        },

        findFlavor: function(iFlavor){
          var selectedFlavor = [],
              arrCpu  = [],
              arrRam  = [],
              arrDisk = [];

          for(var i=0,len=this.allFlavors.length; i<len; i++){
            arrCpu.push(this.allFlavors[i].vcpus);

            if(iFlavor.vcpus == this.allFlavors[i].vcpus){
              //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-30)>
              if(this.allFlavors[i].ram >= ramInitNum){
                 arrRam.push(this.allFlavors[i].ram);
              }
              //end:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-30)>
              if(iFlavor.ram && iFlavor.ram == this.allFlavors[i].ram){
                arrDisk.push(this.allFlavors[i].disk);
                if(iFlavor.disk && (iFlavor.disk == this.allFlavors[i].disk)){
                  selectedFlavor.push(this.allFlavors[i]);
                }
              }
            }
          }

          return { selectedFlavor: selectedFlavor, arrCpu: arrCpu, arrRam: arrRam, arrDisk: arrDisk };
        },

        updateFlavor: function(selectFlavor){
          this.scopes.instance.flavor = selectFlavor.id;
          var cpuIndex = $.inArray(selectFlavor.vcpus, initCpu),
              ramIndex = $.inArray(selectFlavor.ram, initRam),
              diskIndex = $.inArray(selectFlavor.disk, initDisk);

          this.rander({ cpu:[cpuIndex], ram:[ramIndex], disk:[diskIndex] },'instance-selected');
        },

        eventSelected: function(flv){
          var newRam  = this.findFlavor(flv).arrRam.asSet();
              newRam.sort(function(a,b){ return a-b; });
          var rams;

          if(flv.ds){
            //rams  = flv.ram;
            rams  = this.dk ? this.dk : flv.ram;
          }
          else{
            rams  = flv.r ? flv.ram : newRam[0];
          }
          this.dk = rams;

          var newDisk = this.findFlavor({ vcpus: flv.vcpus, ram: rams }).arrDisk.asSet();
              newDisk.sort(function(a,b){ return a-b; });

          var disks = flv.disk ? flv.disk : (this.defDisk <= newDisk[0] ? newDisk[0] : this.defDisk);

          var flavor = this.findFlavor({ vcpus: flv.vcpus, ram: rams, disk: disks });
              flavor.arrRam = flavor.arrRam.asSet();
              flavor.arrDisk = flavor.arrDisk.asSet();

          var cpuIndex  = [],
              ramIndex  = [],
              diskIndex = [];

          cpuIndex.push($.inArray(parseInt(flv.vcpus),initCpu));

          for(var i=0,len=flavor.arrRam.length; i<len; i++){
            //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
            if(vcpusInitNum != flv.vcpus && flavor.arrRam[i] >= ramInitNum){
                ramIndex.push($.inArray(parseInt(flavor.arrRam[i]), initRam));
            }else if(vcpusInitNum == flv.vcpus && flavor.arrRam[i] > ramInitNum){
                ramIndex.push($.inArray(parseInt(flavor.arrRam[i]), initRam));
            }

            //end:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
          }
          for(var i=0,len=flavor.arrDisk.length; i<len; i++){
            if(flavor.arrDisk[i] >= this.defDisk){
              diskIndex.push($.inArray(parseInt(flavor.arrDisk[i]), initDisk));
            }
          }
          this.rander({ cpu: cpuIndex, ram: ramIndex, disk: diskIndex },'instance-yes');
          this.updateFlavor(flavor.selectedFlavor[0]);
          this.removeNotInQuota();
        },

        enableElement: function(flavor){

          var newFlavor = this.findFlavor(flavor);

          var newCpu = newFlavor.arrCpu.asSet();
          var newRam = newFlavor.arrRam.asSet();
          var newDisk = newFlavor.arrDisk.asSet();
          var cpuIndex  = [],
              ramIndex  = [],
              diskIndex = [];

          for(var i=0,len=newCpu.length; i<len; i++){

              //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
            if(newCpu[i] >= vcpusInitNum){
              cpuIndex.push($.inArray(newCpu[i], initCpu));
            }
              //end:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
          }
          for(var i=0,len=newRam.length; i<len; i++){
              //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (a)>:<date(2016-11-16)>
            if(newRam[i] >= ramInitNum){
              ramIndex.push($.inArray(newRam[i], initRam));
            }
              //end:<wujx9>:<Bugzilla – Bug 75050>:<action (a)>:<date(2016-11-16)>

          }
          for(var i=0,len=newDisk.length; i<len; i++){
            if($.inArray(newDisk[i],initDisk) > -1){
              if(newDisk[i] >= this.copyDisk){
                diskIndex.push($.inArray(newDisk[i], initDisk));
              }
            }
          }
          this.rander({ cpu: cpuIndex, ram: ramIndex, disk: diskIndex },'instance-yes');
        },

        removeNotInQuota: function(){
          var cpuIndex  = [],
              ramIndex  = [],
              diskIndex = [],
              quota     = this.quota;

          if(!quota){
            return false;
          }

          for(var i=0,len=initCpu.length; i<len; i++){
            //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
            if(initCpu[i] > quota.vcpus && initCpu[i] >= vcpusInitNum){
            //end:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
              cpuIndex.push($.inArray(initCpu[i], initCpu));
            }
          }

          for(var i=0,len=initRam.length; i<len; i++){
            //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
            if(initRam[i] > quota.ram && initRam[i] >= ramInitNum){
            //end:<wujx9>:<Bugzilla – Bug 75050>:<action (m)>:<date(2016-11-16)>
              ramIndex.push($.inArray(initRam[i], initRam));
            }
          }

          for(var i=0,len=initDisk.length; i<len; i++){
            if(initDisk[i] > quota.disk){
              diskIndex.push($.inArray(initDisk[i], initDisk));
            }
          }

          this.rander({ cpu: cpuIndex, ram: ramIndex, disk: diskIndex, type: 'quota' },'instance-wrong');
        },

        clearOthers: function(aLi){
          /*var map = {cpu: this.cpuList, ram: this.ramList, disk: this.diskList};
          var whichList = map[which];
          var aLi = whichList.find('li');*/
          for(var i=0,len=aLi.length; i<len; i++){
            if(aLi.eq(i).attr('ibtn')){
              aLi.eq(i).removeAttr('class');
              aLi.eq(i).removeAttr('ibtn');
            }
          }
        },

        clearSelf: function(aLi){
          for(var i=0,len=aLi.length; i<len; i++){
            if(aLi.eq(i).attr('ibtn')){
              aLi.eq(i).attr('class','instance-yes');
            }
          }
        },

        clearSelected: function(aLi){
          for(var i=0,len=aLi.length; i<len; i++){
            aLi.eq(i).attr('class','');
            if(aLi.eq(i).attr('class') === 'instance-selected'){
              aLi.eq(i).attr('class','instance-yes');
            }
          }
        },

        selectFlavor: function(flavor){
          this.clearSelected(this.cpuList.find('li'));
          this.clearSelected(this.ramList.find('li'));
          this.clearSelected(this.diskList.find('li'));

          this.icpu = flavor.vcpus;
          this.iram = flavor.ram;
          this.idisk = flavor.disk;

          this.enableElement(flavor);
          this.updateFlavor(flavor);
          this.removeNotInQuota();
        },

        selectedFlavor: function(flavorId){
          var flavor = this.allFlavors.findId(flavorId);
          if (flavor) {
            this.dk = flavor.ram;
          } else {
            this.dk = null;
          }

          if (flavor && !(flavor.vcpus == this.icpu &&
                          flavor.ram == this.iram &&
                          flavor.disk == this.idisk)) {
            this.selectFlavor(flavor);
          }
        },

        init: function(scope,quota){

          var _this = this,
              oldFlavor = scope.oldFlavor;
          this.icpu = oldFlavor.vcpus;
          this.iram = oldFlavor.ram;
          this.idisk = oldFlavor.disk;
          this.copyDisk = angular.copy(oldFlavor.disk);

          this.dk = null;
          this.quota = quota;

          this.scopes  = scope;
          this.allFlavors = scope.dropdown.flavors;
          this.defDisk    = this.idisk;


          //begin:<wujx9>:<Bugzilla – Bug 75050>:<action (a)>:<date(2016-11-16)>
          vcpusInitNum = this.icpu;
          ramInitNum = this.iram;
          //end:<wujx9>:<Bugzilla – Bug 75050>:<action (a)>:<date(2016-11-16)>

          this.cpuList = $('.js-cpu');
          this.ramList = $('.js-ram');
          this.diskList = $('.js-disk');

          this.selectFlavor(oldFlavor);

          this.cpuList.delegate('li[iBtn=true]','click',function(){
            _this.icpu = $(this).attr('data-f');
            var cpu_li = _this.cpuList.find('li');
            var ram_li = _this.ramList.find('li');
            var disk_li = _this.diskList.find('li');

            _this.clearSelf(cpu_li);
            _this.clearOthers(ram_li);
            _this.clearOthers(disk_li);

            _this.eventSelected({ vcpus: _this.icpu });
          });

          this.ramList.delegate('li[iBtn=true]','click',function(){
            _this.iram = $(this).attr('data-f');
            var ram_li = _this.ramList.find('li');
            var disk_li = _this.diskList.find('li');

            _this.clearSelf(ram_li);
            _this.clearOthers(disk_li);

            _this.eventSelected({ vcpus: _this.icpu, ram: _this.iram, r: true });
          });

          this.diskList.delegate('li[iBtn=true]','click',function(){
            _this.idisk = parseInt($(this).attr('data-f'));
            var disk_li = _this.diskList.find('li');

            _this.clearSelf(disk_li);

            _this.eventSelected({ vcpus: _this.icpu, ram: _this.iram, disk: _this.idisk ,ds: true });
          });
        }
     };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'resize-form',
        controller: 'instanceFormCtrl',
        backdrop: backDrop,
        resolve: {
          instance: function(){ return self.instance; },
          context: function(){ return context; }
        },
        windowClass: 'flavorsListContent'
      };

      // open up the resize form
      self.open = function(instances) {
        if (instances.length != 1)
          return;
        var instance = instances[0];
        self.instance = angular.copy(instance);
        modal.open(option).result.then(function(clone) {
          self.submit(instance, clone);
        });
      };

      self.confirm = function(instance) {
        var context = {
          action: novaAPI.confirmresizeServer,
          title: gettext('Confirm the Resize'),
          message: gettext('You will confirm the Resize of instance: %s.'),
          tips: gettext('Please confirm your action.'),
          submit: gettext('Confirm'),
          success: gettext('Confirmed the Resize of instance: %s.'),
          error: gettext('Failed to confirm the Resize instance: %s.')
        };
        //self.confirmAction(context, instance);
        scope.doAction(context, [instance], context.action);
      };

      self.revert = function(instance) {
        var context = {
          action: novaAPI.revertresizeServer,
          title: gettext('Revert the Resize'),
          message: gettext('You will revert the Resize of instance %s.'),
          tips: gettext('Please confirm your action.'),
          submit: gettext('Revert'),
          success: gettext('Reverted the Resize of instance: %s.'),
          error: gettext('Failed to revert the Resize of instance: %s.')
        };
        //self.confirmAction(context, instance);
        scope.doAction(context, [instance], context.action);
      };

      // submit this action to api
      // and update instance object on success
      self.submit = function(instance, clone) {
        function resizeServer(id) {
          return novaAPI.resizeServer(id, {flavor: clone.flavor});
        };
        scope.doAction(context, [instance], resizeServer);
      };

    }//end of action

    return action;
  }]);

})();
