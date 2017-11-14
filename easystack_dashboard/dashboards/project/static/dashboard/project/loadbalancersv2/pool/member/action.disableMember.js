
(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc disalbeAction
   * @ngService
   *
   * @Description
   * Brings up the disable load balancer member confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('disableMemberAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, smodal, toastService) {

    var context = {
      title: gettext('Disable Member'),
      message: gettext('The amount of members these will be Disalbed is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Disable Member'),
      success: gettext('Disable members: %s.'),
      error: gettext('Unable to disable members %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // enable a single member object
      self.singleDisable = function(member) {
        self.confirmDisable([member.id], [member.instance_name]);
      };

      // Disable selected member objects
      // action requires the member to select rows
      self.batchDisable = function(table) {
        self.$table = table;
        var members = [], names = [];
        angular.forEach(self.$table.$scope.selected, function(row) {
            if (row.checked){
              row.item.name = row.item.instance_name;
              members.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDisable(members, names);
      };

      // brings up the confirmation dialog
      self.confirmDisable = function(members, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: members,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(members);
        });
      };

      // on success, Disable the members from the model
      // need to also remove deleted members from selected list
      self.submit = function(members) {
        for(var i = 0; i < members.length; i++){
          self.disableMember(members[i]);
        }
      };

      self.clean = function(member) {
        return {
          admin_state_up: "false"
        };
      };

      self.disableMember = function(member) {
        var cleanedMember = self.clean(member);
        lbaasv2API.editMember(scope.pool.id, member.id, cleanedMember)
          .success(function() {
            var message = interpolate(context.success, [member.instance_name]);
            toastService.add('success', message);
            scope.updateMember(member);
            scope.$table.resetSelected();
          })
      }
    }

    return action;

  }]);

})();