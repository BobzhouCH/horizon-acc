/*
 *    (c) Copyright 2015 Rackspace US, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('hz.dashboard.admin.volume_types')
     .directive('detailTable', [ 'extraSpecsAddAction', 'extraSpecsEditAction', 'extraSpecsDeleteAction',
  function DetailTable(extraSpecsAddAction, extraSpecsEditAction, extraSpecsDeleteAction) {
    return {
      restrict: 'E',
      scope: {'detailDataSrc':'=',
              'detailContext':'=',
              'detailRow':    '='
             },
      /*template: '<table id="extra-specs-list" class="table table-bordered table-hover" hz-table ng-cloak hopes-table-drag st-table="idetaiData" st-safe-src="detailData">'+
                '  <thead>'+
                '    <tr>'+
                '      <th colspan="100">'+
                '        <div class="table_actions clearfix">'+
                '          <action-list class="btn-addon">'+
                '            <action'+
                '              action-classes="\'btn btn-default btn-sm\'"'+
                '              callback="actions.addExtraSpecs.open" item="volumetype">'+
                '              <i class="icon icon-add"></i>'+
                '              <span id="create-extra-spec-in-volumetype">{$ detailContext.detailHead.add $}</span>'+
                '            </action>'+
                '          </action-list>'+
                '          <action-list>'+
                '            <action'+
                '              action-classes="\'btn btn-action btn-primary\'"'+
                '              disabled="numSelected !== 1"'+
                '              callback="actions.editExtraSpecs.open" item="$table">'+
                '              <i class="icon icon-edit"></i>'+
                '              <span id="edit-extra-spec-in-volumetype">{$ detailContext.detailHead.edit $}</span>'+
                '            </action>'+
                '          </action-list>'+
                '          <action-list>'+
                '              <action'+
                '                action-classes="\'btn btn-action btn-danger\'"'+
                '                disabled="numSelected === 0"'+
                '                callback="actions.deleteExtraSpecs.batchDelete"'+
                '                item="$table">'+
                '                <i class="icon icon-delete"></i>'+
                '                <span id="delete-extra-spec-in-volumetype">{$ detailContext.detailHead.deleteBtn $}</span>'+
                '              </action>'+
                '          </action-list>'+
                '        </div>'+
                '      </th>'+
                '    </tr>'+
                '    <tr>'+
                '      <th  class="select-col" eagle-eye="select_col">'+
                '          <input type="checkbox" hz-select-page="detailData"/>'+
                '      </th>'+
                '      <th>{$ ::detailNeck.name $}{$ eselected $}</th>'+
                '      <th>{$ ::detailNeck.value $}</th>'+
                '    </tr>'+
                '  </thead>'+
                '  <tbody>'+
                '    <tr ng-if="!detailData.length">'+
                '      <td colspan="100">{% trans "No Data" %}</td>'+
                '    </tr>'+
                '    <tr ng-repeat="extraspec in idetaiData">'+
                '      <td  class="select-col" eagle-eye="select_col">'+
                '          <input type="checkbox"'+
                '          hz-select="extraspec"'+
                '          ng-model="eselected[extraspec.key].checked"'+
                '          hz-checkbox-group="detailData"/>'+
                '      </td>'+
                '      <td>{$ extraspec.key $}</td>'+
                '      <td>{$ extraspec.value $}</td>'+
                '    </tr>'+
                '  </tbody>'+
                '  <tfoot ng-if="detailData.length > 10">'+
                '    <tr>'+
                '      <td colspan="100" eagle-eye="data_page">'+
                '        <div st-pagination="" st-items-by-page="10" st-displayed-pages="10"></div>'+
                '      </td>'+
                '    </tr>'+
                '  </tfoot>'+
                '</table>',*/
      templateUrl: 'extra-spec-detail-table/',
      link: function link(scope, element, attrs, ngModel) {
        scope.idetailData = [];
        scope.detailData = scope.detailDataSrc;

        scope.context = scope.detailContext;
        scope.actions = {
           addExtraSpecs: new extraSpecsAddAction(scope),
           editExtraSpecs: new extraSpecsEditAction(scope),
           deleteExtraSpecs: new extraSpecsDeleteAction(scope)
        };
        scope.actionitem = scope.detailRow;
      }
    };
  }])
   .directive('detailTableQos', [ 'extraSpecsQosAddAction', 'extraSpecsQosEditAction', 'extraSpecsQosDeleteAction',
  function DetailTable(extraSpecsAddAction, extraSpecsEditAction, extraSpecsDeleteAction) {
    return {
      restrict: 'E',
      scope: {'detailDataSrc':'=',
              'detailContext':'=',
              'detailRow':    '='
             },
      templateUrl: 'extra-spec-detail-qos-table/',
      link: function link(scope, element, attrs, ngModel) {
        scope.idetailDataQos = [];
        scope.detailDataQos = scope.detailDataSrc;

        scope.context = scope.detailContext;
        scope.actions = {
           addExtraSpecs: new extraSpecsAddAction(scope),
           editExtraSpecs: new extraSpecsEditAction(scope),
           deleteExtraSpecs: new extraSpecsDeleteAction(scope)
        };
        scope.actionitem = scope.detailRow;
      }
    };
  }])
  ;
})();
