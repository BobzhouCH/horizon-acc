
(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc loadbalancersv2
   * @ngService
   *
   * @Description
   * Brings up the create volume modal dialog.
   * On submit, create a new volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('addResourcesAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       '$modal',
       '$rootScope',
       'backDrop',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, usersettingAPI, keystoneAPI, modal, rootScope, backDrop, toastService) {

    var context = {
      mode: 'add',
      title: gettext('Add Resource'),
      submit: gettext('Add'),
      success: gettext('Resource %s was successfully added.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'member-form/',
        controller: 'memberFormCtrl',
        backdrop: backDrop,
        windowClass: 'volumesListContent',
        resolve: {
          pool : function(){return scope.detail.pool;},
          member: function(){ return {}; },
          context: function(){ return context; },
          members: null
        }
      };

     // Default QOS_RULE = False
      self.open = function(members){
        option.resolve.members = function() { return members; };
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newResource) {
        var newMembers =  {'member': { 'address': newResource.address,
                            'protocol_port': newResource.protocol_port,
                            'weight': newResource.weight,
                            'subnet': newResource.subnet}};
        lbaasv2API.addMember(scope.detail.pool.id, newMembers)
          .success(function(response) {
            scope.members.push(response);
            var message = interpolate(context.success, [response.instance_name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }])
  .factory('batchAddResourcesAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.openstack-service-api.usersettings',
       'horizon.openstack-service-api.keystone',
       '$modal',
       '$rootScope',
       'backDrop',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, usersettingAPI, keystoneAPI, modal, rootScope, backDrop, toastService) {

    var context = {
      mode: 'add',
      title: gettext('Batch Add Resource'),
      submit: gettext('Add'),
      success: gettext('Resource %s was successfully added.'),
      errorMsg: gettext('Error value for port or weight.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'members-form/',
        controller: 'membersFormCtrl',
        backdrop: backDrop,
        windowClass: 'lb-batch-content',
        resolve: {
          pool : function(){return scope.detail.pool;},
          member: function(){ return {}; },
          context: function(){ return context; },
          members: null
        }
      };

     // Default QOS_RULE = False
      self.open = function(members){
        option.resolve.members = function() { return members; };
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newResources) {

        angular.forEach(newResources,function(newResource){
          var newMembers =  {'member': { 'address': newResource.address,
                            'protocol_port': newResource.protocol_port,
                            'weight': newResource.weight,
                            'subnet': newResources.subnet}};
          lbaasv2API.addMember(scope.detail.pool.id, newMembers)
            .success(function(response) {
              scope.members.push(response);
              var message = interpolate(context.success, [response.instance_name]);
              toastService.add('success', message);
              scope.$table.resetSelected();
            });
        });

      };
    }

    return action;
  }]);

})();
