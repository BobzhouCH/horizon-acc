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
   * @ngDoc editTicketStatusAction
   * @ngService
   *
   * @Description
   * Brings up the edit ticket status modal dialog.
   * On submit, edit instance and display a success message.
   * On cancel, do nothing.
   */
  .factory('associateQosSpecAction', ['horizon.openstack-service-api.cinder',
                                  '$modal',
                                  'backDrop',
                                  'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      mode: 'edit',
      title: gettext('Associate QoS Spec To : %s'),
      submit: gettext('Save'),
      success: gettext('QoS Spec %s has been associated successfully.')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'associate-qos-spec-form',
        controller: 'qosSpecAssociatedFormCtrl',
        backdrop: backDrop,
        resolve: {
          volumeType: function(){ return null; },
          context: function(){ return context; }
        },
        windowClass: 'QosSpecAssociateContent'
      };

      // open up the edit form
      self.open = function($table) {
        var clone = angular.copy(scope.selectedData.aData[0]);
        option.resolve.volumeType = function(){ return clone; };
        modal.open(option).result.then(function(model){
          self.submit(model);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(model) {

        var obj = {
            "vol_type_id": model.volumeType.id,
            "new_qos_spec_id": model.assctQosSepc.id
        };

        if(model.volumeType.associated_qos_spec_id){
          obj['old_qos_spec_id'] = model.volumeType.associated_qos_spec_id;
        }
        return obj;
      };

      // submit this action to api
      // and update ticket object on success
      self.submit = function(model) {
        var cleanedModel = self.clean(model);
        cinderAPI.associatedWithQosSpecs(cleanedModel)
          .success(function(response) {
            var message = interpolate(context.success, [model.assctQosSepc.name]);
            toastService.add('success', gettext(message));
            if(model.assctQosSepc.id !=='0'){
              scope.selectedData.aData[0].associated_qos_spec = model.assctQosSepc.name;
            }else{
              scope.selectedData.aData[0].associated_qos_spec = '';
            }
            scope.$table.resetSelected();
          });
      };
    }

    return action;
  }])
  .factory('editVolumeTypeAction',
       ['horizon.openstack-service-api.cinder',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, modal, backDrop, toastService) {

    var context = {
      title: gettext('Edit Volume Type'),
      submit: gettext('Save'),
      success: gettext('Successfully updated volume type: %s.')
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
      self.open = function(data) {
        option.resolve.volumetype = function(){ return scope.selectedData.aData[0] };
        modal.open(option).result.then(function(model){
          self.submit(model);
        });
      };

      // edit form modifies name, and description
      // send only what is required
      self.clean = function(volumeType) {
        return {
          vol_type_id: volumeType.id,
          name: volumeType.name,
          vol_type_description: volumeType.description?volumeType.description:'',
          is_public: volumeType.is_public?'True':'False'
        };
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var volumeType = self.clean(model);
        cinderAPI.updateVolumeType(volumeType)
          .success(function(data) {
            var message = interpolate(context.success, [volumeType.name]);
            toastService.add('success', message);
            scope.refresh();
          });
      };
    }

    return action;
  }])
  .factory('extraSpecsEditAction',
       ['horizon.openstack-service-api.cinder',
        '$rootScope',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, rootScope, modal, backDrop, toastService) {

    var context = {
      title: gettext('Edit Extra Spec Of Volume Type: %s'),
      submit: gettext('Edit'),
      success: gettext('Successfully edit Extra Spec: %s.'),
      mode: 'edit'
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'add-extra-spec-qos-form',
        controller: 'extraSpecQosEditFormCtrl',
        backdrop: backDrop,
        resolve: {
          volumeType: function(){ return {id:scope.actionitem.id ,name:scope.actionitem.name}; },
          context: function(){ return context; }
        },
        windowClass: 'qosSpecContent'
      };

      // open up the edit form
      self.open = function(volumeType) {
        volumeType[0]['vol_type_id'] = eval(option.resolve.volumeType())['id'];
        volumeType[0]['vol_type_name'] = eval(option.resolve.volumeType())['name'];
        option.resolve.volumeType = function(){ return volumeType[0]; };
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
            vol_type_id: extraSpec.volumeType.vol_type_id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var extraSpec = self.clean(model);
        cinderAPI.editExtraSpecOfVolType(extraSpec)
          .success(function(data) {
            var message = interpolate(context.success, [extraSpec.extraSpecKey]),
                editDetailData = {};

            editDetailData.id = extraSpec.extraSpecKey;
            editDetailData.key = extraSpec.extraSpecKey;
            editDetailData.value = extraSpec.extraSpecValue;

            for(var i=0,len=scope.detailDataSrc.length; i<len; i++){
              if(scope.detailDataSrc[i].id === editDetailData.id){
                angular.extend(scope.detailDataSrc[i], editDetailData);
              }
            };

            toastService.add('success', message);
          });
      };
    }

    return action;
  }])
   .factory('extraSpecsQosEditAction',
       ['horizon.openstack-service-api.cinder',
        '$rootScope',
        '$modal',
        'backDrop',
        'horizon.framework.widgets.toast.service',
  function(cinderAPI, rootScope, modal, backDrop, toastService) {

    var context = {
      title: gettext('Edit Extra Spec Of Volume Type: %s'),
      submit: gettext('Edit'),
      success: gettext('Successfully edit Extra Spec: %s.'),
      mode: 'edit'
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'add-extra-spec-qos-form',
        controller: 'extraSpecQosEditFormCtrl',
        backdrop: backDrop,
        resolve: {
          volumeType: function(){ return {id:scope.actionitem.id ,name:scope.actionitem.name}; },
          context: function(){ return context; }
        },
        windowClass: 'qosSpecContent'
      };

      // open up the edit form
      self.open = function(volumeType) {
        volumeType[0]['vol_type_id'] = eval(option.resolve.volumeType())['id'];
        volumeType[0]['vol_type_name'] = eval(option.resolve.volumeType())['name'];
        option.resolve.volumeType = function(){ return volumeType[0]; };
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
            vol_type_id: extraSpec.volumeType.vol_type_id,
            extraSpecKey: extraSpec.extraSpec.extraspeckey,
            extraSpecValue: extraSpec.extraSpec.extraspecvalue
          };
        }
      };

      // submit this action to api
      // and update snapshot object on success
      self.submit = function(model) {
        var extraSpec = self.clean(model);
        cinderAPI.editExtraSpecOfQosSpec(extraSpec)
          .success(function(data) {
            var message = interpolate(context.success, [extraSpec.extraSpecKey]),
                editDetailData = {};

            editDetailData.id = extraSpec.extraSpecKey;
            editDetailData.key = extraSpec.extraSpecKey;
            editDetailData.value = extraSpec.extraSpecValue;

            for(var i=0,len=scope.detailDataSrc.length; i<len; i++){
              if(scope.detailDataSrc[i].id === editDetailData.id){
                angular.extend(scope.detailDataSrc[i], editDetailData);
              }
            };

            toastService.add('success', message);
          });
      };
    }

    return action;
  }]);

})();
