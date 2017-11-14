
(function() {
  'use strict';

  angular.module('hz.dashboard.project.overview')

  /**
   * @ngdoc projectOverviewCtrl
   * @ngController
   *
   * @description
   * Controller for the project overview.
   */

  .controller('projectOverviewCtrl', [
    '$scope', 'horizon.openstack-service-api.policy', 'horizon.openstack-service-api.usersettings', 'horizon.openstack-service-api.keystone',
    'setData','horizon.openstack-service-api.ceilometer', 'horizon.openstack-service-api.chakra', 'horizon.openstack-service-api.billing', 
    'horizon.framework.widgets.toast.service', '$rootScope',
    function(
      scope, PolicyService, usersettingAPI, keystoneAPI, SetData, ceilometerAPI, chakraAPI, billingAPI, toastService, rootScope) {
          scope.context = {
          header: {
            projectInformation: gettext('Project Information'),
            tenantId: gettext('Resource Quota Usage'),
            name: gettext('User Name'),
            email: gettext('Email'),
            id: gettext('User ID'),
            enabled: gettext('Enabled'),
            action: gettext('Action')
          },
          error: {
            api: gettext('Unable to retrieve users'),
            priviledge: gettext('Insufficient privilege level to view user information.')
          }
     };

      scope.rolei18n = {
         'Administrator': gettext("Administrator"),
          'Member': gettext("Member")
      };

        scope.users = {};
        scope.quotaData = [];
        scope.iQuotaData = {};
        var setData = new SetData(scope);

    // on load, if overview has permission
    // fetch table data and populate it
    this.init = function(){
        PolicyService.check({ rules: [] }).success(function(response) {
          if (response.allowed){
            keystoneAPI.getCurrentUserSession()
              .success(function(response) {
                scope.users = response;
                scope.users.current_role = 'Member';
                keystoneAPI.isPublicRegion().success(function(data){
                  scope.is_public_region = data;
                });
                var index;
                for(index = 0; index < scope.users.roles.length; index++){
                  if(scope.users.roles[index].name == 'admin')
                  {
                    scope.users.current_role = 'Administrator';
                  }
                }
                usersettingAPI.getProjectQuota(response.project_id, {only_quota: false})
                  .success(function(data){
                    scope.quotaData = data.items;
                    setData.setVal();
                  });
                keystoneAPI.getCloudAdmin().success(function(response){
                  if (response) {
                    scope.local_billing_need = false;
                  } else {
                    if (scope.users.user_domain_id === 'default') {
                      scope.local_billing_need = false;
                    } else {
                      billingAPI.getEnableBilling().success(function(data){
                        scope.billing_enable = scope.local_billing_need = data;
                        if (scope.billing_enable) {
                          chakraAPI.getAccount().success(function(data) {
                            if (data.items) {
                              scope.balance = data.items[0].balance;
                              billingAPI.getCurrent(scope.users.project_id).success(function(data) {
                                var sum=0;
                                for (var i = 0; i < data.items.length; i++) {
                                  sum += data.items[i].sum;
                                }
                                scope.consumption = sum*24;
                              });
                            } else {
                              var message = "Your user has no billing account";
                              toastService.add('info', gettext(message));
                            }
                          });
                        }
                      });
                    }
                  }
                });
              });
          } else if (horizon) {
            horizon.alert('info', scope.context.error.priviledge);
          }
        });
    };

    this.init();

  }])
  .controller('projectOverviewActivitie', [
    '$scope',
    '$timeout',
    'horizon.openstack-service-api.policy',
    'horizon.openstack-service-api.ceilometer',
    'horizon.openstack-service-api.keystone',
    function(
      scope,
      timeout,
      PolicyService,
      ceilometerAPI,
      keystoneAPI) {

        scope.context = {
              error: {
                api: gettext('Unable to retrieve users'),
                priviledge: gettext('Insufficient privilege level to view Activitie information.')
              }
         };
        //Need to fullfill all the situation.
        scope.operationlogi18n = {
            'Create Instance': gettext('Create Instance'),
            'Delete Instance': gettext('Delete Instance'),
            'Pause Instance': gettext('Pause Instance'),
            'Unpause Instance': gettext('Unpause Instance'),
            'Shutdown Instance': gettext('Shutdown Instance'),
            'Start Instance': gettext('Start Instance'),
            'Reboot Instance': gettext('Reboot Instance'),
            'Suspend Instance': gettext('Suspend Instance'),
            'Unsuspend Instance': gettext('Unsuspend Instance'),
            'Resume Instance': gettext('Resume Instance'),
            'PowerOff Instance': gettext('PowerOff Instance'),
            'PowerOn Instance': gettext('PowerOn Instance'),
            'Resize Instance': gettext('Resize Instance'),
            'Create Snapshot': gettext('Create Snapshot'),
            'Delete Snapshot': gettext('Delete Snapshot'),
            'Create Volume': gettext('Create Volume'),
            'Delete Volume': gettext('Delete Volume'),
            'instance': gettext('Instance'),
            'Create Instance Snapshot': gettext('Create Instance Snapshot'),
            'image': gettext('Image'),
            'Delete Image': gettext('Delete Image'),
            'Upload Image': gettext('Upload Image'),
            'Create Image': gettext('Create Image'),
            'Delete Instance Snapshot': gettext('Delete Instance Snapshot'),
            'volume': gettext('Volume'),
            'router': gettext('Router'),
            'ip.floating': gettext('Floating IP'),
            'snapshot': gettext('Volume Snapshot'),
            'Update Router': gettext('Update Router'),
            'Create Router': gettext('Create Router'),
            'Delete Router': gettext('Delete Router'),
            'Resize Volume': gettext('Resize Volume'),
            'Allocate Floating IP': gettext('Allocate Floating IP'),
            'Delete Floating IP': gettext('Delete Floating IP'),
            'network': gettext('Network'),
            'Create Network': gettext('Create Network'),
            'Update Network': gettext('Update Network'),
            'Delete Network': gettext('Delete Network'),
            'Create Subnet': gettext('Create Subnet'),
            'Delete Subnet': gettext('Delete Subnet'),
            'Update Subnet': gettext('Update Subnet'),
            'subnet': gettext('subnet'),
            'Rebuild Instance': gettext('Rebuild Instance'),
            'Attach Volume': gettext('Attach Volume'),
            'Detach Volume': gettext('Detach Volume'),
            'Create Security_group': gettext('Create Security Group'),
            'Delete Security_group': gettext('Delete Security Group'),
            'Update Security_group': gettext('Update Security Group'),
            'Create Security_group_rule': gettext('Create Security Group Rule'),
            'Delete Security_group_rule': gettext('Delete Security Group Rule'),
            'Update Security_group_rule': gettext('Update Security Group Rule'),
            'security_group': gettext('Security Group'),
            'security_group_rule': gettext('Security Group Rule')
          };
        scope.Activities = [];
        scope.splitArrStr = function(arr){
            return arr.split(' ');
        };
        scope.AutomaticAllocation = function(str){
          if(str.indexOf('Create Instance') >= 0){
            return 'create-instance-icon.png';
          }
          else if(str.indexOf('Attach') >= 0){
            return 'attach-icon.png';
          }
          else if(str.indexOf('Detach') >= 0){
            return 'detach-icon.png';
          }
          else if(str.indexOf('Resize') >= 0){
            return 'resize-icon.png';
          }
          else if(str.indexOf('Update') >= 0){
            return 'update-icon.png';
          }
          else if(str.indexOf('Upload') >= 0){
            return 'upload-icon.png';
          }
          else if(str.indexOf('Delete') >= 0){
            return 'remove-icon.png';
          }
          else if(str.indexOf('Create') >= 0){
            return 'create-icon.png';
          }
          else{
            return 'close-icon.png';
          }
        };

        // Get operation box height
        function getOperationListHeight(){
          var box = $('#recent-list'),
              height = box.innerHeight() + 20;

          $('#action-line').css('height', height);
        }

        this.init = function(){
            //Need to align with backend, now is getting more data to avoid update event affection.
            scope.showLoadingActivities = true;
            keystoneAPI.getCurrentUserSession().success(function(response) {
                keystoneAPI.isPublicRegion().success(function(data){
                    var is_public_region = data;
                    if(is_public_region){
                      return;
                    }
                    ceilometerAPI.getOverviewActivities().success(function(response){
                      if(response.items.length>0){
                        for(var i = 0; i < response.items.length; i++){
                          scope.Activities.push(response.items[i]);
                        }
                        timeout(function(){
                          getOperationListHeight();
                        });
                      }
                      scope.showLoadingActivities = false;
                    });
                });
            });
            $(window).resize(function(){
              getOperationListHeight();
            });
        };

       this.init();

  }])
    .controller('projectOverviewInstanceStatesController',
    ['$scope', 'horizon.openstack-service-api.overview',
        function (scope, overviewAPI) {
            overviewAPI.getInstanceStates()
            .then(function (data) {
                scope.instanceStates = data;
            });
        }]);

})();
