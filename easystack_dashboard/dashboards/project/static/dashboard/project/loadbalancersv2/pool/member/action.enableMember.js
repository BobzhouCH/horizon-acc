
(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc enalbeAction
   * @ngService
   *
   * @Description
   * Brings up the enable/disable member confirmation modal dialog.
   * On submit, enable members.
   * On cancel, do nothing.
   */
  .factory('enableMemberAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, smodal, toastService) {

    var context = {
      title: gettext('Enable Member'),
      message: gettext('The amount of members these will be enalbed is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Enable Member'),
      success: gettext('Enable members: %s.'),
      error: gettext('Unable to enable members %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // enable a single member object
      self.singleEnable = function(member) {
        self.confirmEnable([member.id], [member.instance_name]);
      };

      // enable selected member objects
      // action requires the member to select rows
      self.batchEnable = function(table) {
        self.$table = table;
        var members = [], instance_names = [];
        angular.forEach(self.$table.$scope.selected, function(row) {
            if (row.checked){
              row.item.name = row.item.instance_name;
              members.push(row.item);
              instance_names.push('"'+ row.item.instance_name +'"');
            }
        });
        self.confirmEnable(members, instance_names);
      };

      // brings up the confirmation dialog
      self.confirmEnable = function(members, instance_names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [instance_names.length]),
          submit: context.submit,
          name: members,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(members);
        });
      };

      // on success, enable the members from the model
      // need to also remove deleted members from selected list
      self.submit = function(members) {
        for(var i = 0; i < members.length; i++){
          self.enableMember(members[i]);
        }

        if(self.$table){
            self.$table.resetSelected();
        }
      };

      self.clean = function(member) {
        return {
          admin_state_up: "true"
        };
      };

      self.enableMember = function(member) {
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