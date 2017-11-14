
(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit volume modal dialog.
   * On submit, edit volume and display a success message.
   * On cancel, do nothing.
   */
  .factory('modifyWeightAction',
       ['horizon.openstack-service-api.lbaasv2',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(lbaasv2API, modal, backDrop, toastService) {

    var context = {
      mode: 'modifyWeight',
      title: gettext('Modify Weight'),
      submit: gettext('Modify'),
      success: gettext('Weight of member %s has been Modified successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'member-form/',
        controller: 'memberFormCtrl',
        windowClass: 'volumesListContent',
        backdrop: backDrop,
        resolve: {
          pool : function(){return scope.detail.pool;},
          member: function(){ return null; },
          context: function(){ return context; },
          members: null
        }
      };

      // open up the edit form
      self.open = function($table) {
        var member = angular.copy($table.$scope.selectedData.aData[0])
        var clone = angular.copy(member);
        option.resolve.member = function(){ return clone; };
        modal.open(option).result.then(function(clone){
          self.submit($table.$scope.selectedData.aData[0], clone);
        });
      };

      // modify form modifies weight
      // send only what is required
      self.clean = function(member) {
        return {
          // id: member.id,
          weight: member.weight
        };
      };

      // submit this action to api
      // and update member object on success
      self.submit = function(member, clone) {
        var cleanedMember = self.clean(clone);
        lbaasv2API.editMember(scope.pool.id, clone.id, cleanedMember)
          .success(function() {
            var message = interpolate(context.success, [clone.instance_name]);
            toastService.add('success', message);
            angular.extend(member, clone);
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }]);

})();
