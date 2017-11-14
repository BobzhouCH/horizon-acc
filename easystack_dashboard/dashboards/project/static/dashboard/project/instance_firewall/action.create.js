(function() {
  'use strict';

  angular.module('hz.dashboard.project.instance_firewall')

  .factory('SecurityCreateAction',
       ['horizon.openstack-service-api.security-group',
        'horizon.openstack-service-api.usersettings',
        'horizon.openstack-service-api.keystone',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(securityAPI, usersettingAPI, keystoneAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'create',
      title: gettext('Create Security Group'),
      submit:  gettext('Create'),
      success: gettext('Security Group %s was successfully created.')
    };

    function action(scope) {

      var self = this;
      var option = {
        templateUrl: 'form/',
        controller: 'SecurityFormCtrl',
        backdrop:		backDrop,
        windowClass: 'RowContent',
        resolve: {
          security: function(){ return {}; },
          context: function(){ return context; }
        }
      };

      self.open = function(){
        modal.open(option).result.then(self.submit);
      };

      self.submit = function(newSecurity) {
        if (!newSecurity.desc){
            newSecurity.desc = ''
        }
        securityAPI.createSecurityGroup(newSecurity)
          .success(function(response) {
            scope.instance_firewalls.unshift(response);
            var message = interpolate(context.success, [newSecurity.name]);
            toastService.add('success', message);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();