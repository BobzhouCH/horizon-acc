/**
* Copyright 2015 EasyStack Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may
* not use self file except in compliance with the License. You may obtain
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

angular.module('hz.dashboard.project.alarms')

/**
 * @ngDoc deleteAction
 * @ngService
 *
 * @Description
 * Brings up the delete user confirmation modal dialog.
 * On submit, delete selected users.
 * On cancel, do nothing.
 */

.factory('alarmDeleteAction',
    ['horizon.openstack-service-api.ceilometer',
     'horizon.framework.widgets.modal.service',
     'horizon.framework.widgets.toast.service',
function(ceilometerAPI, smodal, toastService) {

  var context = {
    title: gettext('Delete Alarm'),
    message: gettext('The amount of alarms that will be deleted is : %s'),
    tips: gettext('Please confirm your selection. This action cannot be undone.'),
    submit: gettext('Delete alarm'),
    success: gettext('Deleted alarm: %s.'),
    error: gettext('Deleted alarm: %s.')
  };

  function action(scope) {

    /*jshint validthis: true */
    var self = this;

    // delete a single alarm object
    self.singleDelete = function(alarm) {
      self.confirmDelete([alarm.id], [alarm.name]);
    };

    // delete selected user objects
    // action requires the user to select rows
    self.batchDelete = function() {
      var ids = [], names = [];
      angular.forEach(scope.selected, function(row) {
          if (row.checked){
            ids.push(row.item.id);
            //names.push('"'+ row.item.name +'"');
            names.push({
              id: row.item.id,
              name: row.item.name
            });
          }
      });
      self.confirmDelete(ids, names);
    };

    // brings up the confirmation dialog
    self.confirmDelete = function(ids, names) {
      var options = {
        title: context.title,
        body: interpolate(context.message,[names.length]),
        tips: context.tips,
        submit: context.submit,
        name: names,
        imgOwner: 'noicon'
      };
      smodal.modal(options).result.then(function(){
        self.submit(ids, names);
      });
    };

    // on success, remove the users from the model
    // need to also remove deleted users from selected list
    self.submit = function(ids, names) {
      var index = 0;
      for(var n=0; n<ids.length; n++){
          ceilometerAPI.deleteAlarm(ids[n])
            .success(function(alarm_id) {
              index = ids.indexOf(alarm_id);
              toastService.add('success', gettext('Success to delete alarm') + ':' + names[index].name);

              for (var i = 0;  i < scope.alarms.length; i++) {
                var alarm = scope.alarms[i];
                if (alarm.id === alarm_id) {
                    scope.alarms.splice(i, 1);
                    break;
                  }
              }

              //notify alarms ring to refresh
              scope.$emit("updateAlarm");
            })
            .error(function() {
              toastService.add('error',  gettext('Unable to delete the alarm.'));
            });
      }
    scope.selectedData.aData = [];
	scope.selected = {};
	scope.numSelected = 0;
    };
  }

  return action;

}]);

})();