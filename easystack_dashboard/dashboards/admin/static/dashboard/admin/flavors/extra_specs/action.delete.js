/**
 * Copyright 2015 IBM Corp.
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

/**
 ** Author : liufeng24@lenovo.com
 ** Module : extra_specs
 ** Data   : 2016-12-26
 **/
(function() {
  'use strict';

  angular.module('hz.dashboard.admin.flavors')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   * @Description
   * Brings up the delete volume confirmation modal dialog.
   * On submit, delete selected volumes.
   * On cancel, do nothing.
   */
  .factory('deleteExtraAction',
      ['horizon.openstack-service-api.nova',
       'horizon.framework.widgets.modal.service',
       'horizon.framework.widgets.toast.service',
  function(novaAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Extra Specs'),
      message: gettext('The amount of extra specs will be deleted is : %s.'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete extra specs'),
      success: gettext('Deleted extra specs'),
      error: gettext('Unable to delete extra specs %s: %s.')
    };


    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function(table) {
        self.$table = table;
        var extras = [], keys = [];
        angular.forEach(self.$table.$scope.selected, function(row) {
            if (row.checked){
	      var item  = row.item;
	      item["name"] = item.key
              extras.push(item);
	      keys.push('"'+ row.item.key +'"')
           }
        });

        self.confirmDelete(extras, keys);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(extras, keys) {

        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [keys.length]),
          submit: context.submit,
          name: extras,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(extras);
        });
      };

      self.submit = function(extras) {
        var removed = [];
        for(var i = 0; i < extras.length; i++){
            removed.push(extras[i].name);
        }
	    self.deleteExtraSpecs(removed);
        if(self.$table){
          self.$table.resetSelected();
        }
      };

      self.deleteExtraSpecs = function(removed) {

        var flavor = scope.flavor;
            novaAPI.editFlavorExtraSpecs(flavor.id, {}, removed)
              .success(function(response) {
                var message = interpolate(context.success);
                toastService.add('success', message);
            });
            scope.actions.refresh();
      }
    }

    return action;

  }]);

})();
