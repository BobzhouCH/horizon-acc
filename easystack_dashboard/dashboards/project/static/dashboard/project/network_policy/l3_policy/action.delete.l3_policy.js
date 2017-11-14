(function() {
  'use strict';

  angular.module('hz.dashboard.project.networks')

  .factory('l3PolicyDeleteAction', [
    'horizon.framework.widgets.modal.service',
    'horizon.framework.widgets.toast.service',
    'horizon.openstack-service-api.gbp',
  function(smodal, toastService, gbpAPI) {

    var context = {
      title: gettext('Delete L3 Policy'),
      message: gettext('The amount of L3 policy these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete'),
      success: gettext('Deleted L3 Policy: %s.'),
      error: gettext('Deleted L3 Policy: %s.')
    };

    function action(scope) {

      var self = this;

      self.singleDelete = function(deleteData) {
        self.confirmDelete([deleteData.id], [deleteData.name]);
      };

      self.batchDelete = function() {
        var deleteDatas = [],
            names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              deleteDatas.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDelete(deleteDatas, names);
      };

      self.confirmDelete = function(deleteDatas, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: deleteDatas,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(deleteDatas);
        });
      };

      self.submit = function(deleteDatas) {
        for(var n = 0; n < deleteDatas.length; n++){
          self.deleteing(deleteDatas[n]);
        }
        scope.$table.resetSelected();
      };

      self.deleteing = function(deleteData) {
        gbpAPI.deleteL3Policy(deleteData.id)
          .success(function() {
            var message = interpolate(context.success, [deleteData.name]);
            toastService.add('success', message);

            scope.$table.resetSelected();
            scope.$root.$broadcast('l3policyRefresh');
          });
      };
    }

    return action;

  }]);

})();
