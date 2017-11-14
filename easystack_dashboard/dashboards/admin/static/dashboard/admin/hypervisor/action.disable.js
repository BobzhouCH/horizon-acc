/**
 * bo.wang@easystack.cn
 * 26th Nov. 2015
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.admin.hypervisor')


  .factory('disableComputeHost', ['horizon.openstack-service-api.nova',
                                  '$modal',
                                  'horizon.framework.widgets.toast.service',
  function(novaAPI, modal, toastService) {

    var context = {
      mode: 'disable',
      title: gettext('Disable Compute Service'),
      submit: gettext('Disable'),
      help: gettext('Notice: This host will not be available for scheduling'),
      success_disable: gettext('Compute host: %s has been disabled successfully')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      var option = {
        templateUrl: 'form',
        controller: 'computeHostFormCtrl',
        resolve: {
          service: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'RowContent'
      };

      self.open = function(html) {
        option.resolve.service = function(){
          scope.html = html;
          return html.selectedData.aData[0];
        };
        modal.open(option).result.then(function(service){
          self.submit(service);
        });
      };


      // submit this action to api
      // and update data in table
      self.submit = function(service) {
        var param = {}
        var serviceId = service.id-1;
        param['node_id'] = service.host;
        param['reason'] = service.reason;
        param['binary'] = service.binary;
        novaAPI.disableService(param).success(function(data){
          var message = interpolate(context.success_disable, [data.host]);
          toastService.add('success', message);
          service['status'] = data.status;
          scope.novaservices[serviceId].status = false;
          scope.resetSelected();
        })

      };

    }//end of action

    return action;
  }]);

})();
