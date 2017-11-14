/**
*
* Alarms list
* controller, directive,service
*
* Create time 	2015-05-10
* Edit time 	2015-06-05
*
*/

(function(){
'use strict';

angular.module('hz.dashboard.project.alarms')

/**
 * alarmsListController
 * Initialization function
 */
.controller('alarmsListController', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.ceilometer',
    'alarmCreateAction', 'alarmDeleteAction','alarmEditAction','horizon.framework.widgets.toast.service','createAlarmsDetailAction',
    function(scope, rootScope, policyAPI, ceilometerAPI, CreateAction, DeleteAction, EditAction,toastService,CreateDetailAction){
        var self = this;
        scope.context = {
            header: {
                name: gettext('Name'),
                project_id: gettext('Project Id'),
                user_id: gettext('User Id'),
                email: gettext('Email'),
                id: gettext('User ID'),
                enabled: gettext('Enabled'),
                action: gettext('Action'),
                state: gettext('State'),
                resource_name: gettext('Resource Name'),
                timestamp: gettext('Timestamp')
            },
            action: {
                edit: gettext('Edit'),
                enable: gettext('Enable'),
                disable: gettext('Disable'),
                deleted: gettext('Delete')
            },
            error: {
                api: gettext('Unable to retrieve users'),
                priviledge: gettext('Insufficient privilege level to view user information.')
            }
        };
        scope.alarmstatei18n = {
            'insufficient data': gettext('Insufficient Data'),
            'ok': gettext('Normal'),
            'alarm': gettext('Alarm'),
        };
        this.reset = function() {
            scope.alarms = [];
            scope.ialarms = [];
            scope.alarmState = 0;
            scope.selected = {};
            scope.checked = {};
            if(scope.selectedData)
          scope.selectedData.aData = [];
        };

        this.init = function(){
            scope.actions = {
            refresh: self.refresh,
            create: new CreateAction(scope),
            deleted: new DeleteAction(scope),
            edit: new EditAction(scope),
            createDetail: new CreateDetailAction(scope)
            };
            self.refresh();
          };
        this.refresh = function(){
            self.reset();
            ceilometerAPI.getAlarms()
                .success(function(response) {
                    for (var i=0; i<response.items.length; i++){
                        response.items[i]['create_time'] = rootScope.rootblock.utc_to_local(response.items[i].create_time);
                    }
                    scope.alarms = response.items;
                    scope.alarmState = 1;
                });
        };
       this.init();

        scope.filterFacets = [{
          label: gettext('Name'),
          name: 'name',
          singleton: true
        }, {
          label: gettext('State'),
          name: 'state',
          singleton: true,
          options: [
            { label: gettext('Insufficient Data'), key: 'insufficient data' },
            { label: gettext('Normal'), key: 'ok' },
            { label: gettext('Alarm'), key: 'alarm' },
          ]
        }, {
          label: gettext('Resource Name'),
          name: 'resource_name',
          singleton: true
        }, {
          label: gettext('Enabled'),
          name: 'enabled',
          singleton: true,
          options: [
            { label: gettext('true'), key: 'True' },
            { label: gettext('false'), key: 'False' }
          ]
        }, {
          label: gettext('Timestamp'),
          name: 'create_time',
          singleton: true
        }];

}]);

})();