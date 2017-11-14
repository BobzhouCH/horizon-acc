(function() {
'use strict';

angular.module('hz.dashboard.admin.server_groups')

/**
 * @ngDoc deleteAction
 * @ngService
 *
 * @Description
 * Brings up the delete user confirmation modal dialog.
 * On submit, delete selected users.
 * On cancel, do nothing.
 */

.factory('serverGroupDeleteAction',
    ['horizon.openstack-service-api.nova',
     'horizon.framework.widgets.modal.service',
     'horizon.framework.widgets.toast.service',
function(novaAPI, smodal, toastService) {

  var context = {
    title: gettext('Delete Server Group'),
    message: gettext('The amount of alarms that will be deleted is : %s'),
    tips: gettext('Please confirm your selection. This action cannot be undone.'),
    submit: gettext('Delete  Server Group'),
    success: gettext('Deleted  Server Group: %s.'),
    error: gettext('Deleted  Server Group: %s.')
  };

  function action(scope) {

    /*jshint validthis: true */
    var self = this;

    // delete a single server group object
    self.singleDelete = function(sg) {
      self.confirmDelete([sg.id], [{id: sg.id, name: sg.name}]);
    };

    // delete selected user objects
    // action requires the user to select rows
    self.batchDelete = function() {
      var ids = [], names = [];
      angular.forEach(scope.selected, function(row) {
          if (row.checked){
            ids.push(row.item.id);
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
          novaAPI.deleteServerGroup(ids[n])
            .success(function(sg_id) {
              index = ids.indexOf(sg_id);
              toastService.add('success', gettext('Success to delete server group') + ':' + names[index].name);

              for (var i = 0;  i < scope.servergroups.length; i++) {
                var severGroup = scope.servergroups[i];
                if (severGroup.id === sg_id) {
                    scope.servergroups.splice(i, 1);
                    break;
                  }
              }
            })
            .error(function() {
              toastService.add('error',  gettext('Unable to delete the server group.'));
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
