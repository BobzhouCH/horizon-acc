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
   * @ngDoc editAction
   * @ngService
   *
   * @Description
   * Brings up the edit volume snapshot modal dialog.
   * On submit, edit volume snapshot and display a success message.
   * On cancel, do nothing.
   */
  .factory('createVolumeTypeAction',
       ['horizon.openstack-service-api.cinder',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      title: gettext('Create Volume Type'),
      submit: gettext('Create'),
      success: gettext('Successfully created volume type: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'create-volumetype-form',
        controller: 'volumeTypeFormCtrl',
        backdrop: backDrop,
        resolve: {
          volumetype: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'volumeTypeContent'
      };

      // open up the edit form
      self.open = function() {
        modal.open(option).result.then(function(model){
          self.submit(model);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(volumeType) {
        return {
          name: volumeType.name,
          vol_type_description: volumeType.description?volumeType.description:'',
          is_public: volumeType.is_public?'True':'False'
        };
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var volumeType = self.clean(model);
        cinderAPI.createVolumeType(volumeType)
          .success(function(data) {
            var message = interpolate(context.success, [data.name]);
            toastService.add('success', message);
            scope.refresh();
          });
      };
    }

    return action;
  }])
  .factory('createQosSpecAction',
       ['horizon.openstack-service-api.cinder',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      title: gettext('Create QoS Spec'),
      submit: gettext('Create'),
      success: gettext('Successfully created QoS Spec: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'create-qosspec-form',
        controller: 'qosSpecFormCtrl',
        backdrop: backDrop,
        resolve: {
          qosspec: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'qosSpecContent'
      };

      // open up the edit form
      self.open = function() {
        modal.open(option).result.then(function(model){
          self.submit(model);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(qosSpec) {
        return {
          name: qosSpec.name,
          consumer: 'front-end'
        };
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var qosSpec = self.clean(model);
        cinderAPI.createQosSpec(qosSpec)
          .success(function(data) {
            var message = interpolate(context.success, [data.name]);
            toastService.add('success', message);
            scope.refresh();
          });
      };
    }

    return action;
  }])
  .factory('extraSpecsAddAction',
       ['horizon.openstack-service-api.cinder',
        '$rootScope',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, rootScope, modal, backDrop, toastService) {

    var context = {
      title: gettext('Add Extra Spec To Volume Type: %s'),
      submit: gettext('Add'),
      success: gettext('Successfully add Extra Spec: %s.'),
      mode: 'add'
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'add-extra-spec-form',
        controller: 'extraSpecFormCtrl',
        backdrop: backDrop,
        resolve: {
          volumeType: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'qosSpecContent'
      };

      // open up the edit form
      self.open = function(volumeType) {
        option.resolve.volumeType = function(){ return volumeType; };
        modal.open(option).result.then(function(model){
          self.submit(model);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(extraSpec) {

        if (typeof(extraSpec.extraSpec.extraspeckey) == 'object'){
          return {
            vol_type_id: extraSpec.volumeType.id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey.id,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }else{
          return {
            vol_type_id: extraSpec.volumeType.id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var extraSpec = self.clean(model);
        cinderAPI.addExtraSpecToVolType(extraSpec)
          .success(function(data) {
            var message = interpolate(context.success, [extraSpec.extraSpecKey]),
                addDetailData = {};

            addDetailData.id = extraSpec.extraSpecKey;
            addDetailData.key = extraSpec.extraSpecKey;
            addDetailData.value = extraSpec.extraSpecValue;
            scope.detailDataSrc.push(addDetailData);

            toastService.add('success', message);
          });
      };
    }

    return action;
  }])
  .factory('extraSpecsQosAddAction',
       ['horizon.openstack-service-api.cinder',
        '$rootScope',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, rootScope, modal, backDrop, toastService) {

    var context = {
      title: gettext('Add Extra Spec To QoS Spec: %s'),
      submit: gettext('Add'),
      success: gettext('Successfully add Extra Spec: %s.'),
      mode: 'add'
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'add-extra-spec-qos-form',
        controller: 'extraSpecQosFormCtrl',
        backdrop: backDrop,
        resolve: {
          volumeType: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'qosSpecContent'
      };

      // open up the edit form
      self.open = function(volumeType) {
        option.resolve.volumeType = function(){ return volumeType; };
        modal.open(option).result.then(function(model){
          self.submit(model);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(extraSpec) {

        if (typeof(extraSpec.extraSpec.extraspeckey) == 'object'){
          return {
            vol_type_id: extraSpec.volumeType.id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey.id,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }else{
          return {
            vol_type_id: extraSpec.volumeType.id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var extraSpec = self.clean(model);
        cinderAPI.addExtraSpecToQosSpec(extraSpec)
          .success(function(data) {
            var message = interpolate(context.success, [extraSpec.extraSpecKey]),
                addDetailData = {};

            addDetailData.id = extraSpec.extraSpecKey;
            addDetailData.key = extraSpec.extraSpecKey;
            addDetailData.value = extraSpec.extraSpecValue;
            scope.detailDataSrc.push(addDetailData);

            toastService.add('success', message);
          });
      };
    }

    return action;
  }])
  .factory('extraSpecsAddToQosAction',
       ['horizon.openstack-service-api.cinder',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      title: gettext('Add Extra Spec To QoS Spec: %s'),
      submit: gettext('Add'),
      success: gettext('Successfully add Extra Spec: %s.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'add-extra-spec-form',
        controller: 'extraSpecFormCtrl',
        backdrop: backDrop,
        resolve: {
          volumeType: function(){ return {}; },
          context: function(){ return context; }
        },
        windowClass: 'qosSpecContent'
      };

      // open up the edit form
      self.open = function(volumeType) {
        option.resolve.volumeType = function(){ return volumeType; };
        modal.open(option).result.then(function(model){
          self.submit(model);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(extraSpec) {

        if (typeof(extraSpec.extraSpec.extraspeckey) == 'object'){
          return {
            vol_type_id: extraSpec.volumeType.id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey.id,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }else{
          return {
            vol_type_id: extraSpec.volumeType.id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var extraSpec = self.clean(model);
        cinderAPI.addExtraSpecToVolType(extraSpec)
          .success(function(data) {
            var message = interpolate(context.success, [extraSpec.extraSpecKey]);
            toastService.add('success', message);
            scope.refresh();
          });
      };
    }

    return action;
  }]);

})();
