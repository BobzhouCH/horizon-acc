
(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete member confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('deleteMemberAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, smodal, toastService) {

    var context = {
      title: gettext('Delete Member'),
      message: gettext('The amount of members these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Member'),
      success: gettext('Deleted members: %s.'),
      error: gettext('Unable to delete members %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single volume object
      self.singleDelete = function(member) {
        self.confirmDelete([member.id], [member.instance_name]);
      };

      // delete selected member objects
      // action requires the member to select rows
      self.batchDelete = function(table) {
        self.$table = table;
        var members = [], instance_names = [];
        angular.forEach(self.$table.$scope.selected, function(row) {
            if (row.checked){
              row.item.name = row.item.instance_name;
              members.push(row.item);
              instance_names.push('"'+ row.item.instance_name +'"');
            }
        });
        self.confirmDelete(members, instance_names);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(members, instance_names) {
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

      // on success, remove the members from the model
      // need to also remove deleted members from selected list
      self.submit = function(members) {
        for(var i = 0; i < members.length; i++){
          self.deleteMember(members[i]);
        }
        if(self.$table){
          self.$table.resetSelected();
        }
      };

      self.deleteMember = function(member) {
        lbaasv2API.deleteMember(scope.pool.id, member.id)
          .success(function() {
            var message = interpolate(context.success, [member.instance_name]);
            toastService.add('success', message);
            scope.updateMember(member);
            scope.clearSelected();
          })
      }
    }

    return action;

  }]);

})();