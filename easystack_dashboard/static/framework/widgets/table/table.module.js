(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name horizon.framework.widgets.table
   * @description
   *
   * # horizon.framework.widgets.table
   *
   * The `horizon.framework.widgets.table` provides support for user interactions and checkbox
   * selection in tables.
   *
   * Requires {@link https://github.com/lorenzofox3/Smart-Table `Smart-Table`}
   * module and jQuery (for table drawer slide animation in IE9) to be installed.
   *
   * | Directives                                                        |
   * |-------------------------------------------------------------------|
   * | {@link horizon.framework.widgets.table.directive:hzTable `hzTable`}               |
   * | {@link horizon.framework.widgets.table.directive:hzSelect `hzSelect`}             |
   * | {@link horizon.framework.widgets.table.directive:hzSelectAll `hzSelectAll`}       |
   * | {@link horizon.framework.widgets.table.directive:hzSelectPage `hzSelectPage`}       |
   * | {@link horizon.framework.widgets.table.directive:hzExpandDetail `hzExpandDetail`} |
   *
   */
  var app = angular.module('horizon.framework.widgets.table', [ 'smart-table', 'lrDragNDrop' ]);

  /**
   * @ngdoc parameters
   * @name horizon.framework.widgets.table.constant:expandSettings
   * @param {string} expandIconClasses Icon classes to be used for expand icon
   * @param {number} duration The slide down animation duration/speed
   */
  app.constant('horizon.framework.widgets.table.expandSettings', {
    expandIconClasses: 'fa-chevron-right fa-chevron-down',
    duration: 100
  });

  /**
   * @ngdoc directive
   * @name horizon.framework.widgets.table.directive:hzTable
   * @element table st-table='rowCollection'
   * @description
   * The `hzTable` directive extends the Smart-Table module to provide
   * support for saving the checkbox selection state of each row in the
   * table. A default sort key can be specified to sort the table
   * initially by this key. To reverse, add default-sort-reverse='true'
   * as well.
   *
   * Required: Use `st-table` attribute to pass in the displayed
   * row collection and `st-safe-src` attribute to pass in the
   * safe row collection.
   *
   * @restrict A
   * @scope true
   * @example
   *
   * ```
   * <table st-table='displayedCollection' st-safe-src='rowCollection'
   *   hz-table default-sort="email">
   *  <thead>
   *    <tr>
   *      <th>
   *        <input type='checkbox' hz-select-all='displayedCollection'/>
   *      </th>
   *      <th>Name</th>
   *    </tr>
   *  </thead>
   *  <tbody>
   *    <tr ng-repeat="row in displayedCollection">
   *      <td>
   *        <input type='checkbox' hz-select='row'
   *          ng-model='selected[row.id].checked'/>
   *      </td>
   *      <td>Foo</td>
   *    </tr>
   *  </tbody>
   * </table>
   * ```
   *
   */
  app.directive('hzTable', function() {
    return {
      restrict: 'A',
      require: 'stTable',
      scope: true,
      controller: function($scope, $element) {
        var self = this;
        self.$scope = $scope;

        this.resetSelected = function() {
          $scope.selected = {};
          $scope.numSelected = 0;
          $scope.selectedData = {
            aData: [] // edit data temporarily
          };
          $scope.disabled = true;
          $scope.allowed = true;

          $scope.$broadcast('hzTable:rowReset');
        };

        $scope.specialReset = this.resetSelected;

        // return true if the row is selected
        this.isSelected = function(row) {
          var id = row.id || row;
          var rowState = $scope.selected[id];
          return angular.isDefined(rowState) && rowState.checked;
        };

        // update the state 'disabled'
        this.updateDisabledState = function() {
          $scope.disabled = ($scope.selectedData.aData.length !== 1);
        };

        // set the row selection state
        this.select = function(row, checkedState, broadcast) {
          $scope.selected[row.id] = {
            checked: checkedState,
            item: row
          };

          if (checkedState) {
            $scope.selectedData.aData.push(row); // add selected row data
            $scope.numSelected++;
            self.updateDisabledState();

          }
          else {
            delete $scope.selected[row.id];
            $scope.selectedData.aData.removeId(row.id);
            $scope.numSelected--;
            self.updateDisabledState();
          }

          if (broadcast) {
            // should only walk down scope tree that has
            // matching event bindings
            var rowObj = {row: row, checked: checkedState};
            $scope.$broadcast('hzTable:rowSelected', rowObj);
          }
          return true;
        }; // end of select

        this.selectRow = function(row) {
          // do nothing if the current state is checked
          if (self.isSelected(row)) {
            return false;
          }
          return self.select(row, true, true);
        };

        this.unselectRow = function(row) {
          // do nothing if the current state is unchecked
          if (!self.isSelected(row)) {
            return false;
          }
          return self.select(row, false, true);
        };

        this.allSelected = function() {
          return $scope.selectedData.aData;
        };

        this.numSelected = function() {
          return $scope.numSelected;
        };

        this.init = function() {
          self.resetSelected();
          $scope.$table = this;
        };

        this.init();
      },
      link: function(scope, element, attrs, stTableCtrl) {
        if (attrs.defaultSort) {
          var reverse = attrs.defaultSortReverse === 'true';
          stTableCtrl.sortBy(attrs.defaultSort, reverse);
        }
        // NOTE(lzm): to get the current page rows in smart table,
        // this is for select-page.(need to be improved)
        if (attrs.stTable) {
          scope.$table.currentPageRows = function() {
            return scope[attrs.stTable];
          };
        }
      }
    };
  });

  /**
   * @ngdoc directive
   * @name horizon.framework.widgets.table.directive:hzSelect
   * @element input type='checkbox'
   * @description
   * The `hzSelect` directive updates the checkbox selection state of
   * the specified row in the table. Assign this as an attribute to a
   * checkbox input element, passing in the row.
   *
   * @restrict A
   * @scope
   * @example
   *
   * ```
   * <tr ng-repeat="row in displayedCollection">
   *   <td>
   *     <input type='checkbox' hz-select='row'/>
   *   </td>
   * </tr>
   * ```
   *
   */
  app.directive('hzSelect', [ function() {
    return {
      restrict: 'A',
      require: '^hzTable',
      scope: {
        row: '=hzSelect',
        group: '@hzCheckboxGroup',
        broadcastName: '@hzSelectBroadcastName'
      },
      link: function (scope, element, attrs, hzTableCtrl) {
        // select checkbox event handler
        function clickHandler() {
          scope.$apply(function() {
            scope.$evalAsync(function() {
              var checked = element.prop('checked');
              // update data
              hzTableCtrl.select(scope.row, checked, true);
            });
          });
        }
        element.click(clickHandler);

        // update selection
        var eventName = 'hzTable:selectPage:' + (scope.broadcastName || scope.group);
        scope.$on(eventName, function(event, state) {
          if(state.checked) {
            hzTableCtrl.selectRow(scope.row);
          }
          else {
            hzTableCtrl.unselectRow(scope.row);
          }
        });

        // register group
        var eventName = 'hzTable:registerGroup:' + (scope.broadcastName || scope.group);
        var eventData = {row: scope.row};
        scope.$root.$broadcast(eventName, eventData);
      }
    };
  }]);

  /**
   * @ngdoc directive
   * @name horizon.framework.widgets.table.directive:hzSelectAll
   * @element input type='checkbox'
   * @description
   * The `hzSelectAll` directive updates the checkbox selection state of
   * every row in the table. Assign this as an attribute to a checkbox
   * input element, passing in the displayed row collection data.
   *
   * Required: Use `st-table` attribute to pass in the displayed
   * row collection and `st-safe-src` attribute to pass in the
   * safe row collection.
   *
   * Define a `ng-model` attribute on the individual row checkboxes
   * so that they will be updated when the select all checkbox is
   * clicked. The `hzTable` controller provides a `selected` object
   * which stores the checked state of the row.
   *
   * @restrict A
   * @scope
   * @example
   *
   * ```
   * <thead>
   *   <th>
   *     <input type='checkbox' hz-select-all='displayedCollection'/>
   *   </th>
   * </thead>
   * <tbody>
   * <tr ng-repeat="row in displayedCollection">
   *   <td>
   *     <input type='checkbox' hz-select='row'
   *       ng-model='selected[row.id].checked'/>
   *   </td>
   * </tr>
   * </tbody>
   * ```
   *
   */
  app.directive('hzSelectAll', [ function() {
    return {
      restrict: 'A',
      require: [ '^hzTable', '^stTable' ],
      scope: {
        rows: '=hzSelectAll'
      },
      link: function(scope, element, attrs, ctrls) {
        var hzTableCtrl = ctrls[0];
        var stTableCtrl = ctrls[1];

        // select or unselect all
        function clickHandler() {
          scope.$apply(function() {
            scope.$evalAsync(function() {
              var checkedState = element.prop('checked');
              angular.forEach(scope.rows, function(row) {
                var selected = hzTableCtrl.isSelected(row);
                if (selected !== checkedState) {
                  hzTableCtrl.select(row, checkedState);
                }
              });
            });
          });
        }

        // update the select all checkbox when table
        // state changes (sort, filter, paginate)
        function updateSelectAll() {
          var visibleRows = scope.rows;
          if (!visibleRows){
            var numVisibleRows = 0;
            var checkedCnt = 0;
          }
          else{
            var numVisibleRows = visibleRows.length;
            var checkedCnt = visibleRows.filter(hzTableCtrl.isSelected).length;
          }

          if(numVisibleRows == 0){
              element.prop('checked', false);
          }else{
              element.prop('checked', numVisibleRows > 0 && numVisibleRows == checkedCnt);
          }
        }

        // listen the checkbox event
        element.click(clickHandler);

        // watch the table state for changes
        // on sort, filter and pagination
        scope.$watch(
          function() {
            return stTableCtrl.tableState();
          },
          updateSelectAll,
          true
        );

        // watch the row length for add/removed rows
        scope.$watch('rows.length', updateSelectAll);

        // watch for row selection
        scope.$on('hzTable:rowSelected', updateSelectAll);
        scope.$on('hzTable:rowReset', updateSelectAll);
      }
    };
  }]);

  /**
   * @ngdoc directive
   * @name horizon.framework.widgets.table.directive:hzSelectPage
   * @element input type='checkbox'
   * @description
   * The `hzSelectPage` directive updates the checkbox selection state of
   * every row of the current page in the table. Assign this as an attribute to a checkbox
   * input element, passing in the displayed row
   *
   * @restrict A
   * @scope
   * @example
   *
   * ```
   * <thead>
   *   <th>
   *     <input type='checkbox' hz-select-page hz-checkbox-group='group1'/>
   *   </th>
   * </thead>
   * <tbody>
   * <tr ng-repeat="row in displayedCollection">
   *   <td>
   *     <input type='checkbox' hz-select='row'
   *       ng-model='selected[row.id].checked'
   *       hz-checkbox-group='group1'/>
   *   </td>
   * </tr>
   * </tbody>
   * ```
   *
   */
  app.directive('hzSelectPage', [ function() {
    return {
      restrict: 'A',
      require: ['^hzTable', '^stTable'],
      scope: {
        group: '@hzSelectPage',
        broadcastName: '@hzSelectBroadcastName'
      },
      link: function(scope, element, attrs, ctrls) {
        var hzTableCtrl = ctrls[0];
        var stTableCtrl = ctrls[1];

        function reset() {
          scope.rows = [];
          updateSelectPage();
        }

        function updateRows() {
          var currentPageRows = hzTableCtrl.currentPageRows();//new Set()
          scope.rows = scope.rows.intersection(currentPageRows);
          updateSelectPage();
        }

        // select-page checkbox event handler
        function clickHandler() {
          scope.$apply(function() {
            scope.$evalAsync(function() {
              var checked = element.prop('checked');
              var eventName = 'hzTable:selectPage:' + (scope.broadcastName || scope.group);
              var eventData = {checked: checked};
              scope.$root.$broadcast(eventName, eventData);
            });
          });
        }

        // update the state of select-page checkbox
        function updateSelectPage() {
          var totalCount = 0;
          var checkedCount = 0;
          if(hzTableCtrl && hzTableCtrl.hasOwnProperty('currentPageRows')){
            if(hzTableCtrl.currentPageRows()){
              totalCount = scope.rows.length || hzTableCtrl.currentPageRows().length;
              checkedCount = scope.rows.filter(hzTableCtrl.isSelected).length || hzTableCtrl.currentPageRows().filter(hzTableCtrl.isSelected).length;
            }
          }else{
            totalCount = scope.rows.length ;
            checkedCount = scope.rows.filter(hzTableCtrl.isSelected).length;
          }
          //console.log("updateSelectPage", totalCount, checkedCount);
          var checked = (totalCount > 0 && totalCount == checkedCount);
          element.prop('checked', checked);
        }

        reset();

        // listen the checkbox event
        element.click(clickHandler);

        // on register group
        var eventName = 'hzTable:registerGroup:' + (scope.broadcastName || scope.group) ;
        scope.$on(eventName, function(event, data) {
          // this will be executed after @reset()
          // -- such as when moving to next page
          scope.$evalAsync(function() {
            scope.rows.add(data.row);
            updateSelectPage();
          });
        });

        /*// watch the table state(page,search,sort)
        scope.$watch(
          function() {
            //return hzTableCtrl.currentPageRows();
            // TODO(lzm): the $watch will ignore the keys startwith '$',
            // this is a bug(of angular) to be fixed!
            var watchObject = angular.copy(stTableCtrl.tableState());
            var searchObj = (watchObject.search.predicateObject);
            if(searchObj){
              searchObj._$ = searchObj.$;
              watchObject.search.predicateObject = searchObj;
            }
            return watchObject;
          },
          function(current, old) {
            updateRows();
          },
          true
        );*/

        // watch the change of currentPageRows
        scope.$watch(
          function() {
            return hzTableCtrl.currentPageRows();
          },
          function(current, old) {
            if(current !== old) {
              updateRows();
            }
          }
        );

        // watch for row selection
        scope.$on('hzTable:rowSelected', updateSelectPage);
        scope.$on('hzTable:rowReset', updateSelectPage);
      }
    };
  }]);

  /**
   * @ngdoc directive
   * @name horizon.framework.widgets.table.directive:hzExpandDetail
   * @element i class='fa fa-chevron-right'
   * @param {number} duration The duration for drawer slide animation
   * @description
   * The `hzExpandDetail` directive toggles the detailed drawer of the row.
   * The animation is implemented using jQuery's slideDown() and slideUp().
   * Assign this as an attribute to an icon that should trigger the toggle,
   * passing in the two class names of the icon. If no class names are
   * specified, the default 'fa-chevron-right fa-chevron-down' is used. A
   * duration for the slide animation can be specified as well (default: 400).
   * The detail drawer row and cell also needs to be implemented and include
   * the classes 'detail-row' and 'detail', respectively.
   *
   * @restrict A
   * @scope icons: '@hzExpandDetail', duration: '@'
   * @example
   *
   * ```
   * <tr>
   *  <td>
   *    <i class='fa fa-chevron-right'
   *       hz-expand-detail='fa-chevron-right fa-chevron-down'
   *       duration='200'></i>
   *  </td>
   * </tr>
   * <tr class='detail-row'>
   *  <td class='detail'></td>
   * </tr>
   * ```
   *
   */
  app.directive('hzExpandDetail', ['horizon.framework.widgets.table.expandSettings',
    function(settings) {
      return {
        restrict: 'A',
        scope: {
          icons: '@hzExpandDetail',
          duration: '@'
        },
        link: function(scope, element) {
          element.on('click', function() {
            var iconClasses = scope.icons || settings.expandIconClasses;
            element.toggleClass(iconClasses);

            var summaryRow = element.closest('tr');
            var detailCell = summaryRow.next('tr').find('.detail');
            var duration = scope.duration ? parseInt(scope.duration) : settings.duration;

            if (summaryRow.hasClass('expanded')) {
              var options = {
                duration: duration,
                complete: function() {
                  // Hide the row after the slide animation finishes
                  summaryRow.toggleClass('expanded');
                }
              };

              detailCell.find('.detail-expanded').slideUp(options);
            } else {
              summaryRow.toggleClass('expanded');

              if (detailCell.find('.detail-expanded').length === 0) {
                // Slide down animation doesn't work on table cells
                // so a <div> wrapper needs to be added
                detailCell.wrapInner('<div class="detail-expanded"></div>');
              }

              detailCell.find('.detail-expanded').slideDown(duration);
            }
          });
        }
      };
    }]);

})();
