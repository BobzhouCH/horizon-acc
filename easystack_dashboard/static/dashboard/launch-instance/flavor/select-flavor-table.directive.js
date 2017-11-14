/*
 *    (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('hz.dashboard.launch-instance')
    .directive('selectFlavorTable', selectFlavorTable)
    .directive('slideSelectFlavor', slideSelectFlavor);

  selectFlavorTable.$inject = [
    'dashboardBasePath',
    'horizon.framework.widgets.transfer-table.helpText',
    'horizon.framework.widgets.charts.donutChartSettings'
  ];
  
  slideSelectFlavor.$inject = [
    'dashboardBasePath',
    'launchInstanceModel'
  ];
  

  /**
   * @ngdoc directive
   * @name hz.dashboard.launch-instance:selectFlavorTable
   * @scope true
   * @element
   * @param {boolean} isAvailableTable If true, the table is used as the
   *    "available" portion of the transfer table.
   * @param {object} items An array of flavor "facade" objects that include the data
   *    needed by each column, as well as chart data for each flavor.
   * @param {object} displayed-items Same as items, but filtered by the directives smart
   *    table to only show relevant items when search is used
   *
   * The transfer table provides a constant containing default labels when no
   * items are available. That constant is injected here.
   *
   * See flavor.html for detailed usage example.
   *
   * @example
   * '''
   * <select-flavor-table
   *    is-available-table="true"
   *    items="selectFlavorCtrl.availableFlavorFacades"
   *    displayed-items="selectFlavorCtrl.displayedAvailableFlavorFacades">
   * </select-flavor-table>
   * '''
   */
  function selectFlavorTable(path, transferTableHelpText, donutChartSettings) {

    var directive = {
      restrict: 'E',
      link: link,
      require: '^transferTable',
      scope: {
        items:              '=',
        displayedItems:     '=',
        isAvailableTable:   '=?',
        metadataDefs:       '='
      },
      templateUrl: path + 'launch-instance/flavor/select-flavor-table.html'
    };

    return directive;

    //////////

    function link(scope, element, attrs, transferTableController) {
      /*
       * Unfortunately, the transferTableController does not remove items from the data
       * when they are moved from the available to the allocated. Instead it simply
       * adds that id to its "allocatedIds" array. Tables used within the
       * transfer table directive (like this one) are required to have internal
       * knowledge about the allocatedIds and use it to determine which items
       * are currently visible.
       *
       * Also, the transferTableController item click function is different for
       * allocated items vs available items.
       *
       * Finally, the transferTableController provides default text to show when
       * the tables are empty,
       *
       * Contain all of this "parent" knowledge within "isAvailableTable"
       */

      if (scope.isAvailableTable) {
        /*
         * This table used in "available" portion of a transfer table
         */
        scope.showSearchBar = true;
        // Hide items that have been allocated
        scope.showItemFunc = function (item) {
          return !transferTableController.allocatedIds[item.id];
        };
        scope.itemClickAction = transferTableController.allocate;
        scope.noneAvailableText = transferTableHelpText.noneAvailText;
        scope.rowExpandText = transferTableHelpText.expandDetailsText;
        scope.itemButtonClasses = "fa fa-plus";

        scope.tooltipModel = transferTableController.tooltipModel;
      } else {
        // This table used in "allocated" portion of transfer table
        scope.showSearchBar = false;
        // Always show items
        scope.showItemFunc = function () { return true; };
        scope.itemClickAction = transferTableController.deallocate;
        scope.noneAvailableText = transferTableHelpText.noneAllocText;
        scope.itemButtonClasses = "fa fa-minus";
      }

      // Labels for select flavor table
      scope.quotaImpactLabel = gettext("Impact on your quota");
      scope.nameLabel = gettext("Name");
      scope.vcpusLabel = gettext("VCPUs");
      scope.ramLabel = gettext("RAM");
      scope.totalDiskLabel = gettext("Total Disk");
      scope.rootDiskLabel = gettext("Root Disk");
      scope.ephemeralDiskLabel = gettext("Ephemeral Disk");
      scope.isPublicLabel = gettext("Public");
      scope.chartSettings = donutChartSettings;
    } // end of link
  } // end of function

  // launch instance drag select flavor
  function slideSelectFlavor(path){
    var directive = {
      restrict:   'EA',
      link:       link,
      require:     '^getAllFlavorValue',
      scope: {
        items:     '=',
        trModel:   '=',
        lenovoFlavorStepConfig: '=',
        lenovoFlavorVolumeConfig: '=',
        imageName: '=',
      },
      templateUrl:   path + 'launch-instance/flavor/setFlavor.html'
    };

    return directive;

    function link(scope, element, attrs, transferTableController){

      var cpu      = [1, 2, 4, 8, 16, 32],
          ram      = [512, 1, 2, 4, 8, 16, 32, 64, 96],
          disk     = [20, 40, 60, 80, 100, 200, 500],
          ram_step    = scope.lenovoFlavorStepConfig.length > 0
            ? scope.lenovoFlavorStepConfig
            : [[0,1,0], [0,4,1], [2,5,2], [3,6,3], [4,6,4], [4,8,4]],
          aCustomBtn  = element.find('.js-instances-flavo-btn'),
          eleLeft     = 0,
          startRamLineLeft = 0,
          endtRamLineLeft  = 0,
          cpuIndex     = 0,
          ramIndex     = 0,
          diskIndex    = 0,
          cpuIndexArr  = [],
          ramIndexArr  = [],
          diskIndexArr = [],
          ii = 0,
          cpuLineLeft  = 0,
          ramLineLeft  = 0,
          diskLineLeft = 0,

          customRect  = element.find('.js-instances-flavo-rect-bg'),
          cpuLine     = element.find('.js-cpu-line'),
          ramLine     = element.find('.js-ram-line'),
          diskLine    = element.find('.js-disk-line');

      scope.cpu_index   = 0;
      scope.ram_index   = 0;
      scope.disk_index  = 0;

      //取数值最小值
      Array.min = function(array){
        return Math.min.apply(Math,array);
      };

      var watcher = scope.$watch(function() {return element.find('.js-instances-flavo-btn').eq(0).offset().left}, function(newVal, oldVal) {
        if (newVal !== oldVal && newVal > 0) {
          diskLine    = element.find('.js-disk-line');
          element.find('.js-instances-flavo-btn').eq(0).triggerHandler('mousedown');
          $(document).triggerHandler('mouseup');
          watcher(); // dismiss here
        }
      });

      if (scope.lenovoFlavorVolumeConfig && (scope.lenovoFlavorVolumeConfig.LINUX || scope.lenovoFlavorVolumeConfig.WINDOWS)) {
        scope.$watch(function() {return scope.imageName}, function(newVal, oldVal) {
          if (newVal && newVal !== oldVal) {
            if (newVal.toLowerCase().indexOf('linux') >= 0 && newVal.toLowerCase().indexOf('windows') >= 0) {
              disk = [20, 40, 60, 80, 100, 200, 500];
              scope.diskRangeMode='none';
              return; //contain both, do nothing
            } else if (newVal.toLowerCase().indexOf('linux') >= 0) {
              disk = scope.lenovoFlavorVolumeConfig.LINUX;
              scope.diskRangeMode='linux';
            } else if (newVal.toLowerCase().indexOf('windows') >= 0) {
              disk = scope.lenovoFlavorVolumeConfig.WINDOWS;
              scope.diskRangeMode='windows';
            } else {
              disk = [20, 40, 60, 80, 100, 200, 500];
              scope.diskRangeMode='none';
            }
          }
        });
      }

      scope.$watch(function(){ return scope.trModel.available; }, function(newVal, oldVal){
        //var selectData = setSelectedData(newVal, { cpu: 1, ram: 512, disk: 20 });
        //transferTableController.allocate(selectData);
        var initData = {
          cpu: 1,
          ram: ram[ram_step[0][0]],
          disk: 20
        };
        transferTableController.allocate(setSelectedData(scope.trModel, initData));
      },true);

    function init(data){
      scope.cpu_index  = $.inArray(data.cpu, cpu);
      scope.ram_index  = $.inArray(data.ram, ram);
      scope.disk_index = $.inArray(data.disk, disk);

      var cpuLeft      = cpuLine.eq(scope.cpu_index).offset().left - eleLeft;
      var ramLeft      = ramLine.eq(scope.ram_index).offset().left - eleLeft;
      var diskLeft     = diskLine.eq(scope.disk_index).offset().left - eleLeft;

          cpuLineLeft   = cpuLeft <= 0 ? 36 : cpuLeft;
          ramLineLeft   = ramLeft <= 0 ? 57 : ramLeft;
          diskLineLeft  = diskLeft <= 0 ? 39 : diskLeft;

        //cpuLineLeft   = cpuLine.eq(scope.cpu_index).offset().left - eleLeft;
        //ramLineLeft   = ramLine.eq(scope.ram_index).offset().left - eleLeft;
        //diskLineLeft   = diskLine.eq(scope.disk_index).offset().left - eleLeft;

       var startLeft       = ramLine.eq(ram_step[scope.cpu_index][0]).offset().left - eleLeft;
       var endLeft         = ramLine.eq(ram_step[scope.cpu_index][1]).offset().left - eleLeft;

           startRamLineLeft   = startLeft <= 0 ? 55 : startLeft;
           endtRamLineLeft    = endLeft <= 0 ? 155 : endLeft;

        //startRamLineLeft  = ramLine.eq(ram_step[scope.cpu_index][0]).offset().left - eleLeft;
        //endtRamLineLeft    = ramLine.eq(ram_step[scope.cpu_index][1]).offset().left - eleLeft;

        customRect.eq(1).css({
          width: endtRamLineLeft - startRamLineLeft,
          left: startRamLineLeft
        });

        aCustomBtn.eq(0).stop();
        aCustomBtn.eq(1).stop();
        aCustomBtn.eq(2).stop();
        aCustomBtn.eq(0).animate({
          left: cpuLineLeft - 7
        },300);
        aCustomBtn.eq(1).animate({
          left: ramLineLeft - 7
        },300);
        aCustomBtn.eq(2).animate({
          left: diskLineLeft - 7
        },300);
    }

    element.find('.js-instances-flavo-rect-bg').bind('click', function(event){
      var _this   = $(this),
          left    = event.pageX;
          eleLeft = element.find('.instances-flavo-rect').offset().left;

          setIndex(_this,left);
      var selectVal = { cpu: cpu[scope.cpu_index], ram: ram[ii], disk: disk[scope.disk_index]};
      scope.$watch(function(){ return scope.trModel; }, function(newVal, oldVal){
        var selectData = setSelectedData(newVal, selectVal);
            transferTableController.allocate(selectData);
      });
    });

    element.find('.js-instances-flavo-btn').bind('mousedown', function(event){
        var _this  = $(this),  L,
            disX  = event.screenX - _this.offset().left;

        eleLeft  = element.find('.instances-flavo-rect').offset().left;

        $(document).bind('mousemove', mousemove);
        $(document).bind('mouseup', mouseup);

        function mousemove(event){
          L  = event.screenX - eleLeft - disX;

          if(L <= _this.parent().find('.js-instances-flavo-rect-bg').eq(0).offset().left-eleLeft){
            L = _this.parent().find('.js-instances-flavo-rect-bg').eq(0).offset().left-eleLeft;
          }
          if(L >= _this.parent().find('.js-instances-flavo-rect-bg').eq(0).offset().left-eleLeft+_this.parent().find('.js-instances-flavo-rect-bg').eq(0).width()){
            L =  _this.parent().find('.js-instances-flavo-rect-bg').eq(0).offset().left-eleLeft+_this.parent().find('.js-instances-flavo-rect-bg').eq(0).width();
          }
          _this.css({ left: L });
        }

        function mouseup(event){
          setIndex(_this,_this.offset().left);

          var selectVal = { cpu: cpu[scope.cpu_index], ram: ram[ii], disk: disk[scope.disk_index]};
          /*scope.$watch(function(){ return scope.trModel; }, function(newVal, oldVal){
            var selectData = setSelectedData(newVal, selectVal);
            transferTableController.allocate(selectData);
          });*/
          var selectData = setSelectedData(scope.trModel, selectVal);
          transferTableController.allocate(selectData);

          $(document).unbind('mousemove', mousemove);
          $(document).unbind('mouseup', mouseup);
        }
        return false;
      });

    function setIndex(_this,left){
      // index value
      if(_this.attr('index') === '0'){
        cpuIndexArr = [];
        for(var i=0,len=cpuLine.length; i<len; i++){
          cpuIndexArr.push(Math.abs(left - cpuLine.eq(i).offset().left));
        }
        scope.cpu_index = $.inArray(Array.min(cpuIndexArr), cpuIndexArr);
        ii = ram_step[scope.cpu_index][2];
      }
      if(_this.attr('index') === '1'){
        ramIndexArr = [];
        for(var i=0,len=ramLine.length; i<len; i++){
          ramIndexArr.push(Math.abs(left - ramLine.eq(i).offset().left));
        }
        scope.ram_index = $.inArray(Array.min(ramIndexArr), ramIndexArr);
        ii = scope.ram_index;
      }
      if(_this.attr('index') === '2'){
        diskIndexArr = [];
        for(var k=0,len=diskLine.length; k<len; k++){
          diskIndexArr.push(Math.abs(left - diskLine.eq(k).offset().left));
        }
        scope.disk_index = $.inArray(Array.min(diskIndexArr), diskIndexArr);
      }

      init({ cpu: cpu[scope.cpu_index], ram: ram[ii], disk: disk[scope.disk_index] });
    }

    // set selected data
    function setSelectedData(data, val){
      var jsonVal = {}, arrRam = [];
      for(var i=0,len=data['available'].length; i<len; i++){
        var rm = data['available'][i].ram === 512 ? 512 : data['available'][i].ram/1024;
        arrRam.push(rm);

        if(val['cpu'] == parseInt(data['available'][i].vcpus) && val['ram'] == parseInt(arrRam[i]) && val['disk'] == parseInt(data['available'][i].totalDisk)){
          jsonVal = data['available'][i];
        }
      }
      return jsonVal;
    }
    }
  }

})();
