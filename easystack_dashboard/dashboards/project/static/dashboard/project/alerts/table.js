/**
*
* Alerts list
* controller, directive,service
*
* Create time 	2017-3-30
* Edit time 	2017-3-30
*
*/

(function(){
'use strict';

angular.module('hz.dashboard.project.alerts')

/**
 * alarmsListController
 * Initialization function
 */
.controller('alertsListController', [
    '$scope', '$rootScope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.ceilometer',
   'horizon.framework.widgets.toast.service', 'createAlertsDetailAction',
    function(scope, rootScope, policyAPI, ceilometerAPI, toastService, CreateDetailAction){
        var self = this;
        scope.context = {
            header: {
                name: gettext('Alarm Name'),                
                state: gettext('Current State'),
                enabled: gettext('Enabled'),                
                severity:gettext("Severity"),               
                description:gettext("Description"),
                alarm_id:gettext('Alarm ID'),
                timestamp: gettext('Timestamp')
            },
            action: {
                disable: gettext('Disable')
            },
            error: {
                api: gettext('Unable to retrieve users'),
                priviledge: gettext('Insufficient privilege level to view user information.')
            }
        };
        scope.alertstatei18n = {
            'insufficient data': gettext('Set'),
            'ok': gettext('Clear'),
            'alarm': gettext('Alarm'),
        };
        this.reset = function() {
            scope.alerts = [];
            scope.ialerts = [];
            scope.alertState = 0;
            scope.checked = {};
            scope.selected = {};
            if(scope.selectedData) {
              scope.selectedData.aData = [];
            }

            scope.histories = [];
            scope.ihistories = [];
            scope.histotyState = 0;
        };

        this.init = function(){
            self.reset();
            self.refresh();
          };
        this.refresh = function(){
            self.reset();
            ceilometerAPI.getAlerts()
                .success(function(response) {
                    for (var i=0; i<response.items.length; i++){
                        response.items[i]['create_time'] = rootScope.rootblock.utc_to_local(response.items[i].create_time);
                    }
                    scope.alerts = response.items;
                    scope.alertState = 1;
                });
                
             ceilometerAPI.getAlertsHistory()
                .success(function (response) {
                    for (var i=0; i<response.items.length; i++){
                            response.items[i]['create_time'] = rootScope.rootblock.utc_to_local(response.items[i].create_time);
                        }
                    scope.histories = response.items;
                    scope.historyState = 1;
                });
        };
        this.multipleClear = function (selectedAlerts) {
            angular.forEach(selectedAlerts, function (alert) {
                self.singleClear(alert.alarm_id, alert.state);
            })
        };

        this.singleClear = function (alarm_id, state) {
            ceilometerAPI.updateAlertState(alarm_id, state)
                .success(function (response) {
                    self.refresh();
                    toastService.add('success', gettext('The alarm ' + alarm_id + ' clear success'));
                })
        };
       this.init();

        scope.actions = {
            refresh: self.refresh,
            singleClear: self.singleClear,
            clear: self.multipleClear,
            createDetail: new CreateDetailAction(scope)
        };

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
        },{
          label: gettext('Alarm ID'),
          name: 'alarm_id',
          singleton: true
        },{
          label: gettext('Severity'),
          name: 'severity',
          singleton: true
        },{
          label: gettext('Description'),
          name: 'description',
          singleton: true
        },{
          label: gettext('Timestamp'),
          name: 'create_time',
          singleton: true
        }];

}]);

})();
