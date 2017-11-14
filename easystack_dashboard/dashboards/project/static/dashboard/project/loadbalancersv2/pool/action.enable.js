
(function() {
  'use strict';

  angular.module('hz.dashboard.project.loadbalancersv2')

  /**
   * @ngDoc enalbeAction
   * @ngService
   *
   * @Description
   * Brings up the enable/disable load balancer pool confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('poolEnableAction',
      ['horizon.openstack-service-api.lbaasv2',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(lbaasv2API, smodal, toastService) {

    var context = {
      title: gettext('Enable Pool'),
      message: gettext('The amount of pools these will be enalbed is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Enable Pool'),
      success: gettext('Enable pools: %s.'),
      error: gettext('Unable to enable pools %s: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // enable a single pool object
      self.singleEnable = function(pool) {
        self.confirmEnable([pool.id], [pool.name]);
      };

      // enable selected pool objects
      // action requires the pool to select rows
      self.batchEnable = function() {
        var pools = [], names = [];
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              pools.push(row.item);
              names.push('"'+ row.item.name +'"');
            }
        });
        self.confirmEnable(pools, names);
      };

      // brings up the confirmation dialog
      self.confirmEnable = function(pools, names) {
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

      // on success, enable the pools from the model
      // need to also remove deleted pools from selected list
      self.submit = function(pools) {
        for(var i = 0; i < pools.length; i++){
          self.enablePool(pools[i]);
        }
      };

      self.clean = function(pool) {
        return {
          admin_state_up: "true"
        };
      };

      self.enablePool = function(pool) {
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