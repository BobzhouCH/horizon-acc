/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular.module('hz.dashboard.project.ports')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete router confirmation modal dialog.
   * On submit, delete selected routers.
   * On cancel, do nothing.
   */
  .factory('deletePortAction', ['horizon.openstack-service-api.neutron', 'horizon.framework.widgets.modal.service',
          'horizon.framework.widgets.toast.service',
  function(neutronAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Interfaces'),
      message: gettext('The amount of Interfaces these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      tips_with_device_vp: gettext('%s have associated with an instance, Please unbind first, then you may operate deletion.'),
      //tips_with_device: gettext('%s have associated with a device, Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete'),
      success: gettext('Deleted Interfaces: %s.'),
      error: gettext('Deleted Interfaces: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      // delete a single router object
      self.singleDelete = function(port) {
        self.confirmDelete([port.id], [port.name]);
      };

      // delete selected router objects
      // action requires the router to select rows
      self.batchDelete = function() {
        var ports = [], names = [], names_with_device_str='';
        angular.forEach(scope.selected, function(row) {
            if (row.checked){
              ports.push(row.item);
              names.push(row.item.name);
            }
            if(row.item.device_id){
              names_with_device_str+= row.item.name +' ';
            }
        });
        self.confirmDelete(ports, names,names_with_device_str);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ports, names, names_with_device_str) {
        var tip_message = '';
        var isdisabled = false;
        if(names_with_device_str){
          tip_message = interpolate(context.tips_with_device_vp, [names_with_device_str]);
          isdisabled = true;
        }else{
          tip_message = context.tips;
        }
        var options = {
          title: context.title,
          tips: tip_message,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: ports,
          imgOwner: 'noicon',
          disabled: isdisabled
        };
        smodal.modal(options).result.then(function(){
          self.submit(ports);
        });
      };

      // on success, remove the routers from the model
      // need to also remove deleted routers from selected list
      self.submit = function(ports) {
        for(var n=0; n<ports.length; n++){
          self.deletePort(ports[n]);
        }
        scope.$table.resetSelected();
      };

      var portInfo = {};
      self.deletePort = function(port) {
        portInfo[port.id] = port.name;
        neutronAPI.deletePort(port.id, portInfo)
          .success(function() {
            var message = interpolate(context.success, [port.name]);
            toastService.add('success', message);
            scope.ports.removeId(port.id);
            delete scope.selected[port.id];
          });
      };
    }

    return action;
  }]);

})();