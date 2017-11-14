(function() {
  'use strict';

  angular.module('hz.dashboard.project.instance_firewall')

  .factory('SecurityDeleteAction',
      ['horizon.openstack-service-api.security-group',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(securityAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Security Group'),
      message: gettext('The amount of security groups these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Security Group'),
      success: gettext('Deleted Security Group: %s.'),
      error: gettext('Unable to delete security group: %s.'),
      inuse: gettext('Unable to delete in use security group: %s.')
    };

    function action(scope) {

      var self = this;

      self.batchDelete = function() {
        var secGroups = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              secGroups.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(secGroups, names);
      };

      self.confirmDelete = function(secGroups, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: secGroups,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(secGroups);
        });
      };

      self.deleteSecGroup = function(secGroup) {
        var message;
        securityAPI.deleteSecurityGroup(secGroup.id)
          .success(function(sg_id) {
            message = interpolate(context.success, [secGroup.name]);
            toastService.add('success', message);
            for (var i=0 ; i< scope.instance_firewalls.length; i++) {
              var security = scope.instance_firewalls[i];
              if (security.id === sg_id) {
                scope.instance_firewalls.splice(i, 1);
                break;
              }
            }
          })
          .error(function(message, status_code) {
            message = (status_code == 409 ) ?
              interpolate(context.inuse, [secGroup.name]) :
              interpolate(context.error, [secGroup.name]);
            toastService.add('error', message);
          });
      };

      self.submit = function(secGroups) {
        for(var n=0; n<secGroups.length; n++){
            self.deleteSecGroup(secGroups[n]);
         }
        scope.$table.resetSelected();
      };
    }

    return action;

  }]);

})();
