/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
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

  angular.module('hz.dashboard.admin.volume_types')

  /**
   * @ngDoc deleteAction
   * @ngService
   *
   */
  .factory('deleteVolumeTypeAction', ['horizon.openstack-service-api.cinder',
          'horizon.framework.widgets.modal.service','horizon.framework.widgets.toast.service',
  function(cinderAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete Volume Type'),
      message: gettext('The amount of volume type these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Volume Type'),
      success: gettext('Deleted Volume Type: %s.'),
      error: gettext('Error Deleted Volume Type: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

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
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, names);
        });
      };


      // on success, remove ticket from the model
      // need to also remove deleted ticket from selected list
      self.submit = function(ids, namelist) {
        for (var i = 0; i < ids.length; i++) {
          self.deleteVolumeType(ids[i], namelist[i]['name']);
        }
      };

      self.deleteVolumeType = function(id, name) {
        cinderAPI.deleteVolumeType(id)
          .success(function(result) {
            var message = interpolate(context.success, [name]);
            toastService.add('success', message);
            scope.volumetypes.removeId(id);
            scope.$table.resetSelected();
          });
      };
    };

    return action;

  }])
  .factory('deleteQosSpecAction', ['horizon.openstack-service-api.cinder',
          'horizon.framework.widgets.modal.service','horizon.framework.widgets.toast.service',
  function(cinderAPI, smodal, toastService) {

    var context = {
      title: gettext('Delete QoS Spec'),
      message: gettext('The amount of QoS Spec these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete QoS Spec'),
      success: gettext('Deleted QoS Spec: %s.'),
      error: gettext('Error Deleted QoS Spec: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

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
          tips: context.tips,
          body: interpolate(context.message, [names.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, names);
        });
      };


      // on success, remove ticket from the model
      // need to also remove deleted ticket from selected list
      self.submit = function(ids, namelist) {
        for (var i = 0; i < ids.length; i++) {
          self.deleteQosSpec(ids[i], namelist[i]['name']);
        }
      };

      self.deleteQosSpec = function(id, name) {
        cinderAPI.deleteQosSpec(id)
          .success(function(result) {
            var message = interpolate(context.success, [name]);
            toastService.add('success', message);
            scope.qosspecs.removeId(id);
            scope.$table.resetSelected();
          })
          .error(function(err) {
            var message = interpolate(context.error, [name]);
            toastService.add('error', message + err);
          });
      };
    };

    return action;

  }])
  .factory('extraSpecsDeleteAction', ['horizon.openstack-service-api.cinder','$rootScope',
          'horizon.framework.widgets.modal.service','horizon.framework.widgets.toast.service',
  function(cinderAPI, rootScope, smodal, toastService) {

    var context = {
      title: gettext('Delete Extra Spec'),
      message: gettext('The amount of Extra Spec these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Extra Spec'),
      success: gettext('Deleted Extra Spec: %s.'),
      error: gettext('Error Deleted Extra Spec: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function(item) {
        var ids = [], names = [];
        angular.forEach(item, function(row) {
              ids.push(row.id);
              names.push({
                id: row.id,
                name: row.id
              });
        });
        self.confirmDelete(ids, names, scope.actionitem);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, names, item) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [ids.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, names, item);
        });
      };


      // on success, remove ticket from the model
      // need to also remove deleted ticket from selected list
      self.submit = function(ids, namelist, item) {
        for (var i = 0; i < ids.length; i++) {
          self.deleteExtraSpec(ids[i], namelist[i]['name'], item);
        }
      };

      self.deleteExtraSpec = function(ids, name, item) {
        var model = {
          'vol_type_id': item.id,
          'extraSpecKey': ids
        };
        cinderAPI.deleteExtraSpecOfVolType(model)
          .success(function(result) {
            var message = interpolate(context.success, [name]);

            for(var k=scope.detailDataSrc.length-1; k>=0; k--){
              if(scope.detailDataSrc[k].id === ids){
                scope.detailDataSrc.splice(k, 1);
              }
            };

            toastService.add('success', message);
          })
          .error(function(err) {
            var message = interpolate(context.error, [name]);
            toastService.add('error', message + err);
          });
      };
    };

    return action;

  }])
  .factory('extraSpecsQosDeleteAction', ['horizon.openstack-service-api.cinder','$rootScope',
          'horizon.framework.widgets.modal.service','horizon.framework.widgets.toast.service',
  function(cinderAPI, rootScope, smodal, toastService) {

    var context = {
      title: gettext('Delete Extra Spec'),
      message: gettext('The amount of Extra Spec these will be deleted is : %s'),
      tips: gettext('Please confirm your selection. This action cannot be undone.'),
      submit: gettext('Delete Extra Spec'),
      success: gettext('Deleted Extra Spec: %s.'),
      error: gettext('Error Deleted Extra Spec: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;

      self.batchDelete = function(item) {
        var ids = [], names = [];
        angular.forEach(item, function(row) {
              ids.push(row.id);
              names.push({
                id: row.id,
                name: row.id
              });
        });
        self.confirmDelete(ids, names, scope.actionitem);
      };

      // brings up the confirmation dialog
      self.confirmDelete = function(ids, names, item) {
        var options = {
          title: context.title,
          tips: context.tips,
          body: interpolate(context.message, [ids.length]),
          submit: context.submit,
          name: names,
          imgOwner: 'noicon'
        };
        smodal.modal(options).result.then(function(){
          self.submit(ids, names, item);
        });
      };


      // on success, remove ticket from the model
      // need to also remove deleted ticket from selected list
      self.submit = function(ids, namelist, item) {
        for (var i = 0; i < ids.length; i++) {
          self.deleteExtraSpec(ids[i], namelist[i]['name'], item);
        }
      };

      self.deleteExtraSpec = function(ids, name, item) {
        var model = {
          'vol_type_id': item.id,
          'extraSpecKey': ids
        };
        cinderAPI.deleteExtraSpecOfQosSpec(model)
          .success(function(result) {
            var message = interpolate(context.success, [name]);

            for(var k=scope.detailDataSrc.length-1; k>=0; k--){
              if(scope.detailDataSrc[k].id === ids){
                scope.detailDataSrc.splice(k, 1);
              }
            };

            toastService.add('success', message);
          })
          .error(function(err) {
            var message = interpolate(context.error, [name]);
            toastService.add('error', message + err);
          });
      };
    };

    return action;

  }]);

})();