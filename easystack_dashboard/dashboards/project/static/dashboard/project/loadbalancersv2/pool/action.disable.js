
(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc disalbeAction
   * @ngService
   *
   * @Description
   * Brings up the disable load balancer pool confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('poolDisableAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, smodal, toastService) {

    var context = {
      title: gettext('Disable Pool'),
      message: gettext('The amount of pools these will be Disalbed is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Disable Pool'),
      success: gettext('Disable pools: %s.'),
      error: gettext('Unable to disable pools %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // enable a single pool object
      self.singleDisable = function(pool) {
        self.confirmDisable([pool.id], [pool.name]);
      };

      // Disable selected pool objects
      // action requires the pool to select rows
      self.batchDisable = function() {
        var pools = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              pools.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmDisable(pools, names);
      };

      // brings up the confirmation dialog
      self.confirmDisable = function(pools, names) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: pools,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(pools);
        });
      };

      // on success, Disable the pools from the model
      // need to also remove deleted pools from selected list
      self.submit = function(pools) {
        for(var i = 0; i < pools.length; i++){
          self.disablePool(pools[i]);
        }
      };

      self.clean = function(pool) {
        return {
          admin_state_up: "false"
        };
      };

      self.disablePool = function(pool) {
        var cleanedPool = self.clean(pool);
        lbaasv2API.editPool(pool.id, cleanedPool)
          .success(function() {
            var message = interpolate(context.success, [pool.name]);
            toastService.add('success', message);
            scope.updatePool(pool);
            scope.$table.resetSelected();
          })
      }
    }

    return action;

  }]);

})();