/**
 * Copyright 2015 IBM Corp.
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


  .controller('volumeTypeFormCtrl', [
  '$scope', '$modalInstance', 'volumetype', 'context',
  function(scope, modalInstance, volumetype, context) {

    var action 	= {
      submit: function() { modalInstance.close(scope.volumetype); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };

    function init(){
      scope.context = context;
      scope.volumetype = volumetype;
      scope.action 	= action;
    }

    init();

  }])
  .controller('qosSpecFormCtrl', [
  '$scope', '$modalInstance', 'qosspec', 'context',
  function(scope, modalInstance, qosspec, context) {

    var action 	= {
      submit: function() { modalInstance.close(scope.qosspec); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };

    function init(){
      scope.context = context;
      scope.qosspec = qosspec;
      scope.action 	= action;
    }

    init();

  }])
  .controller('qosSpecAssociatedFormCtrl', [
  '$scope', '$modalInstance', 'horizon.openstack-service-api.cinder', 'volumeType', 'context',
  function(scope, modalInstance, cinderAPI, volumeType, context) {

    var action 	= {
      submit: function() { modalInstance.close({'volumeType': scope.volumeType, 'assctQosSepc': scope.assctQosSepc}); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };
    var getQosSpecs = function (){
      cinderAPI.getQosSpecs().then(
        function success(response){
          scope.qosspecs = response.data.items;
          scope.qosspecs.unshift({'id': '0', name: gettext('None (removes spec)')});
          scope.assctQosSepc = scope.qosspecs[0] ;
        },
        function failed(response){

        }
      );
    };
    scope.changeQosSpec = function (qosspec){
      scope.assctQosSepc = qosspec;
    };
    function init(){
      scope.context = context;
      scope.context.title = interpolate(context.title, [volumeType.name]);
      scope.qosspecs = [];

      scope.volumeType = volumeType;
      scope.action 	= action;
      getQosSpecs();
    }

    init();

  }])
  .controller('extraSpecFormCtrl', [
  '$scope', '$modalInstance', 'horizon.openstack-service-api.cinder', 'volumeType', 'context',
  function(scope, modalInstance, cinderAPI, volumeType, context) {

    var action = {
      submit: function() { modalInstance.close({'volumeType': scope.volumeType, 'extraSpec': scope.extraspec}); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };
    scope.preextraspecs = [{'id': 'volume_backend_name','name': gettext('volume_backend_name')}];

    angular.forEach(volumeType.extraspecs, function(row, value){
      if(row.id === 'volume_backend_name'){
        scope.preextraspecs[0].state = true;
      }
    });

    /*scope.helpUrl = 'add-extra-spec-help/';
    scope.helpTxt = "<h4>HP 3par</h4>"+ "<p>hp3par:cpg</p>"         + "<p>hp3par:snap_cpg</p>"     + "<p>hp3par:provisioning</p>";*/
    function init(){
      scope.context = context;
      scope.context.title = interpolate(context.title, [volumeType.name]);
      scope.qosspecs = [];
      scope.extraspectype = 'pre';
      scope.volumeType = volumeType;
      scope.action = action;
      scope.extraspec = {};
      //scope.extraspec['extraspeckey'] = scope.preextraspecs[0];
    }

    init();

  }])
  .controller('extraSpecEditFormCtrl', [
  '$scope', '$modalInstance', 'horizon.openstack-service-api.cinder', 'volumeType', 'context',
  function(scope, modalInstance, cinderAPI, volumeType, context) {

    var action = {
      submit: function() { modalInstance.close({'volumeType': scope.volumeType, 'extraSpec': scope.extraspec}); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };
    function init(){
      scope.context = context;
      scope.context.title = interpolate(context.title, [volumeType.vol_type_name]);
      scope.volumeType = volumeType;
      scope.action 	= action;
      scope.extraspec = {};
      scope.extraspec['extraspeckey'] = scope.volumeType.id;
      scope.extraspec['extraspecvalue'] = scope.volumeType.value;
    }

    init();

  }])
  .controller('extraSpecQosFormCtrl', [
  '$scope', '$modalInstance', 'horizon.openstack-service-api.cinder', 'volumeType', 'context',
  function(scope, modalInstance, cinderAPI, volumeType, context) {

    var action 	= {
      submit: function() { modalInstance.close({'volumeType': scope.volumeType, 'extraSpec': scope.extraspec}); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };
    scope.preextraspecs = [
        {'id': 'total_bytes_sec','name': 'total_bytes_sec'},
        {'id': 'read_bytes_sec','name': 'read_bytes_sec'},
        {'id': 'write_bytes_sec','name': 'write_bytes_sec'},
        {'id': 'total_iops_sec','name': 'total_iops_sec'},
        {'id': 'read_iops_sec','name': 'read_iops_sec'},
        {'id': 'write_iops_sec','name': 'write_iops_sec'}];

    for(var i=0; i<scope.preextraspecs.length; i++){
      for(var k=0; k<volumeType.extraspecs.length; k++){
        if(scope.preextraspecs[i].id === volumeType.extraspecs[k].id){
          scope.preextraspecs[i].state = true;
        }
      }
    };

    /*scope.helpUrl = 'add-extra-spec-help/';
    scope.helpTxt = "<h4>HP 3par</h4>"+ "<p>hp3par:cpg</p>"         + "<p>hp3par:snap_cpg</p>"     + "<p>hp3par:provisioning</p>";*/
    function init(){
      scope.context = context;
      scope.context.title = interpolate(context.title, [volumeType.name]);
      scope.qosspecs = [];
      scope.extraspectype = 'pre';
      scope.volumeType = volumeType;
      scope.action = action;
      scope.extraspec = {};
      //scope.extraspec['extraspeckey'] = scope.preextraspecs[0];
    }

    init();

  }])
  .controller('extraSpecQosEditFormCtrl', [
  '$scope', '$modalInstance', 'horizon.openstack-service-api.cinder', 'volumeType', 'context',
  function(scope, modalInstance, cinderAPI, volumeType, context) {

    var action 	= {
      submit: function() { modalInstance.close({'volumeType': scope.volumeType, 'extraSpec': scope.extraspec}); },
      cancel: function() { modalInstance.dismiss('cancel'); }
    };
    function init(){
      scope.context = context;
      scope.context.title = interpolate(context.title, [volumeType.vol_type_name]);
      scope.volumeType = volumeType;
      scope.action 	= action;
      scope.extraspec = {};
      scope.extraspec['extraspeckey'] = scope.volumeType.id;
      scope.extraspec['extraspecvalue'] = scope.volumeType.value;
    }

    init();

  }]);

})();
