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

  angular.module('hz.dashboard.project.volumes')

  /**
   * @ngdoc volumeformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit volume form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('volumeFormCtrl', [
    '$scope', '$rootScope', '$modalInstance',
    'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.nova',
    'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'horizon.openstack-service-api.settings',
    'volume', 'context', 'horizon.framework.esutils.Utils', 'qosRules',
    'horizon.openstack-service-api.settings',
    function(scope, rootScope, modalInstance,
      cinderAPI, novaAPI, glanceAPI, billingAPI, usersettingAPI, keystoneAPI, settingsAPI,
      volume, context, utils, lenovoQoS, settingsService) {

      var dropdown = {},
          action = {
            submit: function() {
              if (volume.source) {
                delete volume.source;
              }
              modalInstance.close(volume);
            },
            cancel: function() {
              modalInstance.dismiss('cancel');
            }
          };

      scope.volumeSizeChange = false;
      if (context.mode == 'extend') {
        var volumewidth = volume.size;
        scope.volumeSizeChange = true;
        scope.$watch('volume.size', function(newv, oldv) {
          if (volumewidth != newv) {
            scope.volumeSizeChange = false;
          } else {
            scope.volumeSizeChange = true;
          }
        });
        scope.volumeExpansion = { min: volume.oldSize, ctrl: true, unit: 'GB', defVal: 1 };
      }

      scope.someSelected = function (object) {
        var selected = [];
        if(object  !== undefined) {
           $.each(object, function(key, value){if (value) {selected.push(key)}});
        }
        return (selected.length > 0) ;
      }
            // get volume types
      if (context.mode === 'create'){
        cinderAPI.getVolumeTypes().success(function(response) {
          keystoneAPI.getCloudAdmin().success(function(isCloudAdmin) {
            if (!isCloudAdmin && lenovoQoS) {
              dropdown.types = response.items.filter(function(item) {
                return item.name.search('sata-double-copy') < 0;
              });
            } else {
              dropdown.types = response.items;
            }

            if (dropdown.types.length > 0) {
              volume.volume_type = dropdown.types[0].id;
            }
            volume.volume_type_list = dropdown.types;
          });
        });

        glanceAPI.getImages().success(function(response) {
            dropdown.images = response.items;
            dropdown.pure_images = [];
            dropdown.snapshot_images = [];
            for (var i=0; i<=dropdown.images.length-1; i++) {
              var image = dropdown.images[i];
              if( image.properties && ( image.properties.image_id || image.properties.image_type === 'snapshot') ) {
                dropdown.snapshot_images.push(image);
              } else {
                if(image.status === 'active'){
                  dropdown.pure_images.push(image);
                }
              }
            }
        });

        dropdown.sources = [
          {key: 'empty', value: gettext('Empty Volume')},
          {key: 'image', value: gettext('Image')},
          {key: 'snapshot', value: gettext('Instance Snapshot')},
        ];

        volume.source = 'empty';
        volume.size = 1;

        // Drag and drop the maximum value of Max,
        // min is the initial value, Ctrl is the control of the default control.
        settingsService.getSetting('MAX_VOLUME_SIZE',false).then(
          function success(data){
            scope.volumeDef = { max: data, min: 1, ctrl: true, unit: 'GB', defVal: 1 };
          }
        );

        scope.$watch('volume.source', function(newv, oldv) {
          if (oldv != newv && newv === 'empty') {
            scope.volume.size = scope.volumeDef.min = 1;
            scope.volume.image_id = undefined;
          }
        });

        scope.$watch('volume.image_id', function(newv, oldv) {
          if (oldv != newv) {
            scope.volume.size = scope.volumeDef.min = 1;
            for (var i = 0; i <= dropdown.images.length-1; i++) {
                var image = dropdown.images[i];
                if (image.id === newv) {
                  var imageSize = Math.ceil(parseFloat(utils.bytesToGB(image.size)));
                  var lowerBound = imageSize > image.min_disk ? imageSize : image.min_disk;
                    if (lowerBound >= 1) {
                        scope.volume.size = scope.volumeDef.min = lowerBound;
                    } else {
                        scope.volume.size = scope.volumeDef.min = 1;
                    }
                    break;
                }
            }
          }
        });
      }
      else if (context.mode === 'attach'){
        dropdown.instances = [];
        dropdown.instancesState = false;
        novaAPI.getServers({status: ["ACTIVE", "PAUSED", "SHUTOFF", "RESIZED"]}).success(function(response) {
          var volume_Instance = [];
          dropdown.instances = [];
          $.each(volume.attachments, function(i, attachment) {
            volume_Instance.push(attachment.server_id);
          });
          if (volume_Instance.length > 0) {
             $.each(response.items, function(i, instance) {
                if (!volume_Instance.contains(instance.id)) {
                  dropdown.instances.push(instance);
                }
             });
          }else{
             dropdown.instances = response.items;
          }
          volume.dropdownInstanceList = dropdown.instances;
          dropdown.instancesState = true;
        });
      } else if (context.mode === 'detach') {
        var attachedInstances = [];
        for (var i = 0; i < volume.attachments.length; i++) {
          var attachment = volume.attachments[i];
          attachedInstances.push({
            id: attachment.server_id,
            name: attachment.instance_name
            });
          }
          dropdown.instances = attachedInstances;
        }


      //control the tips of gigabytes quota exceeded
      var quotaJudge = {
        create: function(gigabytes_available){
          if (gigabytes_available !=-1 && (volume.size > gigabytes_available || volume.size > gigabytes_quota)){
            scope.quota_exceeded = true;
          }
        },
        extend: function(gigabytes_available){
          if (gigabytes_available != -1) {
            var newAvailable = gigabytes_available+volume.oldSize;
            if (volume.size > newAvailable) {
                scope.quota_exceeded = true;
            }
          }
        }
      },
      addQuotaValue = {
        extend: function(available){
          var available = 3000
          settingsService.getSetting('MAX_VOLUME_SIZE',false).then(
            function success(data){
              extendVolume(data);
            }
          );
          function extendVolume(maxVolumeSize){
            scope.volumeExpansion.max = available + volume.oldSize;
            if (available === -1 || scope.volumeExpansion.max > maxVolumeSize) {
              scope.volumeExpansion.max = maxVolumeSize;
            }
            scope.isExtendShow = true;
          }
        }
      };

      if (context.mode === 'create' || context.mode === 'extend'){
        var gigabytes_available, gigabytes_quota;
        keystoneAPI.getCurrentUserSession()
        .success(function(response) {
          usersettingAPI.getProjectQuota(response.project_id, {only_quota: false})
          .success(function(data){
            for (var i = 0; i < data.items.length; i++){
              if (data.items[i].name == 'gigabytes'){
                gigabytes_available = data.items[i].usage.available;
                gigabytes_quota = data.items[i].usage.quota;
                if(addQuotaValue[context.mode]){
                  addQuotaValue[context.mode](gigabytes_available);
                }
                break;
              }
            }
            scope.$watch('volume.size', function(newv, oldv) {
              if (oldv != newv) {
                scope.quota_exceeded = false;
                quotaJudge[context.mode](gigabytes_available);
              }
            });
          });
        });
      }

        scope.dropdown = dropdown;
        scope.context = context;
        scope.volume = volume;
        scope.action = action;
        scope.helpInfo = gettext("\
You can choose to create a volume directly, or from image or instance snapshot, \
when you choose image or instance snapshot as a volume source, \
volume will be bootable for creating instance.");

        // Drag and drop the maximum value of Max,
        // min is the initial value, Ctrl is the control of the default control.
        /*scope.volumeDef = {
          max: 1000,
          min: 1,
          ctrl: true,
          unit: 'GB',
          defVal: 1
        };*/

        var unitPrice;

        if (rootScope.rootblock.billing_need) {
          scope.showBilling = true;
          if (rootScope.rootblock.active_fixing) {
            // get get router price
            //query floatingip items
            billingAPI.getPriceItems('volume').success(function(data) {
              //scope.volume.size = 1;
              scope.unitPrice = data.items[0];
              scope.price = Number(scope.unitPrice['fee_hour']);
            });
            if (context.mode === 'create_snapshot') {
              billingAPI.getPriceItems('snapshot').success(function(data) {
                scope.unitPrice2 = data.items[0];
                scope.price2 = Number(scope.unitPrice2['fee_hour']);
              });
            }
            billingAPI.getBalance().success(function(data) {
              if (data <= 0) {
                scope.showBalance = true;
              }
            });

            settingsAPI.getSetting('PREBILLING',false).then(

              function success(data){
                scope.preBilling = data;
                if(data && context.mode === 'extend'){
                   billingAPI.getProductById(volume.id).success(function(data){
                     var volume = data.items ;
                     angular.forEach(scope.payment_type ,function(arr){

                       if(volume[0].unit === arr.unit){
                         scope.unitSelect = arr;
                         scope.volume.unit = volume[0].unit;
                         billingAPI.getPriceItems('volume').success(function(data) {
                           scope.unitPrice = data.items[0];
                           if(arr.unit === 'H'){
                             scope.price = scope.unitPrice['fee_hour'];
                           }else if(arr.unit === 'M'){
                             scope.price = scope.unitPrice['fee_month'];
                           }else{
                             scope.price = scope.unitPrice['fee_year'];
                           }
                         });
                       }

                     });
                   });
                }
              }

            );

            scope.payment_type = [
              {unit:'H',unitLabel:gettext('By Hour')},
              {unit:'M',unitLabel:gettext('By Month')},
              {unit:'Y',unitLabel:gettext('By Year')}
            ];

            scope.unitSelect = scope.payment_type[0];
            scope.changePayment = function (payment){
              scope.unitSelect = payment;
              if(scope.unitSelect && scope.unitSelect.unit === 'M'){
                if (context.mode === 'create_snapshot') {
                  scope.price2 = scope.unitPrice2['fee_month'];
       	          scope.volume.unit = 'M';
                }else{
                  scope.price = scope.unitPrice['fee_month'];
       	          scope.volume.unit = 'M';
                }

       	      }else if(scope.unitSelect && scope.unitSelect.unit === 'Y'){
       	        if (context.mode === 'create_snapshot') {
                  scope.price2 = scope.unitPrice2['fee_year'];
       	          scope.volume.unit = 'Y';
                }else{
                  scope.price = scope.unitPrice['fee_year'];
       	          scope.volume.unit = 'Y';
                }
       	      }else{
       	        if (context.mode === 'create_snapshot') {
                  scope.price2 = scope.unitPrice2['fee_hour'];
       	          scope.volume.unit = 'H';
                }else{
                  scope.price = scope.unitPrice['fee_hour'];
       	          scope.volume.unit = 'H';
                }
       	      }
            };
          } else {
            scope.noFixing = true;
          }
        }

      }
    ])

    // volume detail controller
    .controller('volumeDetailForm',volumeDetailForm);
    volumeDetailForm.$inject = [
      '$scope',
      '$sce',
      '$modalInstance',
      'horizon.framework.widgets.modal.service',
      '$modal',
      '$timeout',
      'horizon.openstack-service-api.cinder',
      'horizon.framework.widgets.toast.service',
      'backDrop',
      'detail',
      'context',
      'ctrl',
      '$rootScope',
      'horizon.openstack-service-api.keystone',
      'createBackupAction'];

    function volumeDetailForm(scope, sce, modalInstance, smodal, modal, $timeout, cinderAPI, toastService, backDrop, detail, context, ctrl, rootScope, keystoneAPI) {
        var w = 888, action = {
          submit: function() {
            modalInstance.close(detail);
          },
          cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
          }
        },
        vol_id = detail.volumeData.id;

        scope.volume = detail.volumeData;

        scope.backup_type_map = {
          'true': gettext('increment backup'),
          'false': gettext('full backup')
        };
        scope.splitArrStr = function(arr){
            return arr.split(' ');
        };

        // time-line delete action
        var delActionContext = {
          dTitle: gettext('Delete Volume Backups'),
          dMessage: gettext('The amount of volume backups these will be deleted is : %s'),
          dTips: gettext('Please confirm your selection. This action cannot be undone.'),
          dSubmit: gettext('Delete Volume Backup'),
          dSuccess: gettext('Deleted Volume Backup: %s.'),
          dError: gettext('Error deleted Volume Backup: %s.')
        };

        scope.onSelectVolumeBackup = function(volume) {
          var result = [];
          if (scope.volumebackups) {
            var result = [];
            var l = scope.volumebackups.length-1;
            while (l >= 0) {
              if (scope.volumebackups[l].id !== volume.id) {
                l--;
              } else {
                break;
              }
            }

            result.push(scope.volumebackups[l--]);

            while (l >= 0) {
              var item = scope.volumebackups[l];
              if (item.is_incremental) {
                result.push(item);
                l--;
              } else {
                break;
              }
            }

          }

          scope.volumebackupsTree = result.reverse();
          scope.showVolumebackupsTree = result.length>0;
        };

        scope.deleteBackup = function(backup){
          var options = {
            title: delActionContext.dTitle,
            tips: delActionContext.dTips,
            body: interpolate(delActionContext.dMessage, [1]),
            submit: delActionContext.dSubmit,
            name: backup,
            imgOwner: 'noicon'
          };
          smodal.modal(options).result.then(function(){
            scope.deletevolumeBackup(backup);
          });
        };
        scope.deletevolumeBackup = function (backup) {
          scope.showLoadingBackups = true;
          cinderAPI.deleteVolumeBackup(backup[0].id)
             .success(function () {
                var message = interpolate(delActionContext.dSuccess, [backup[0].name]);
                toastService.add('success', message);
                scope.showLoadingBackups = false;
                scope.volumebackups.removeId(backup[0].id);
              })
              .error(function (message, status_code) {
                //toastService.add('error', gettext(message.substr(0,message.indexOf('.')+1)));
                console.log(message);
                toastService.add('error', gettext('Cannot delete Volumn Backup') + ' ' + backup[0].id);
                scope.showLoadingBackups = false;
              });
        };
        // time-line create action
        var createContext = {
          mode: 'create-v',
          title: gettext('Create Volume Backup'),
          submit: gettext('Create'),
          success: gettext('Volume Backup %s was successfully created.')
        };
        scope.createBackup = function(backup){
          var option = {
            templateUrl: 'backupform/',
            controller: 'VolumeBackupFormCtrl',
            backdrop: backDrop,
            windowClass: 'volumesListContent',
            resolve: {
              backup: function(){ return angular.copy(backup[0]); },
              context: function(){ return createContext; }
            }
          };
          modal.open(option).result.then(function(backup){
            scope.createvolumeBackup(backup);
          });
        };
        scope.cleanObj = function(obj){
          if(obj['metadata']){
            delete obj['metadata'];
          }
          return obj;
        };
        scope.createvolumeBackup = function(backup){
          scope.showLoadingBackups = true;
          backup = scope.cleanObj(backup);
          cinderAPI.createVolumeBackup('create',backup)
          .success(function(response) {
            var message = interpolate(createContext.success, [backup.name]);
            toastService.add('success', message);
            scope.showLoadingBackups = false;
            response.created_at = response.created_at.replace(/T/g,' ');
            response.created_at = rootScope.rootblock.utc_to_local(response.created_at);
            scope.volumebackups.unshift(response);
          })
          .error(function(){
            scope.showLoadingBackups = false;
          });
        };
        function callDefault(){
          cinderAPI.getVolumeSnapshots({volume_id: vol_id}).success(function(data) {
            var array = [];
            array = data.items;
            for(var i=0; i<array.length; i++){
              array[i].created_at = array[i].created_at.replace(/T/g,' ');
              array[i].created_at = rootScope.rootblock.utc_to_local(array[i].created_at);
            }
            scope.volumesnapshots = array;
          });

          cinderAPI.getVolumeSnapshots({volume_id: vol_id}).success(function(data) {
            scope.snapshots = [1,2,3,4,5];
          });

          cinderAPI.getVolumeBackup(vol_id).success(function(data){
            var array = [];
            array = data.items;
            for(var i=0; i<array.length; i++){
              array[i].created_at = array[i].created_at.replace(/T/g,' ');
              array[i].created_at = rootScope.rootblock.utc_to_local(array[i].created_at);
            }
            scope.volumebackups = array;
          });
        };

        keystoneAPI.isPublicRegion()
          .success(function(data) {
            if(!data){
              callDefault();
            }
          });

        var h = $(window).height();

        $timeout(function(){
          $('.detailContent').css({
            height: h,
            width: w,
            right: -w
          });
          $('.tab-content').css({
            height: h-62
          });
          $('.detailContent').stop();
          $('.detailContent').animate({
              right: 0
          },400)
          .css('overflow', 'visible');
        });

        $(window).resize(function() {
          var w2 = 888;
          var h2 = $(window).height();
          $('.detailContent').css({
            width: w2,
            height: h2
          });
          $('.tab-content').css({
            height: h2-62
          });
        });
        scope.ivolumesnapshots = [];

        scope.volumei18n = {
          'available': gettext("Available"),
          'in-use': gettext("In use"),
          'error': gettext("Error"),
          'creating': gettext("Creating"),
          'error_extending': gettext("Error Extending"),
          'extending': gettext("Extending"),
          'attaching': gettext("Attaching"),
          'detaching': gettext("Detaching"),
          'deleting': gettext("Deleting"),
          'error_deleting': gettext("Error Deleting"),
          'backing-up': gettext("Backing Up"),
          'restoring-backup': gettext("Restoring Backup"),
          'error_restoring': gettext("Error Restoring"),
        };

        scope.attached_mode = {
          null: null,
          'ro': gettext('Read Only'),
          'rw': gettext('Read Write'),
        };

        scope.snapshotFacets = [{
          label: gettext('Name'),
          name: 'name',
          singleton: true
        }, {
          label: gettext('Description'),
          name: 'description',
          singleton: true
        }, {
          label: gettext('Status'),
          name: 'status',
          singleton: true,
          options: [
              { label: scope.volumei18n.available, key: 'Available' },
              { label: scope.volumei18n['in-use'], key: 'In use' },
              { label: scope.volumei18n.error, key: 'Error' },
              { label: scope.volumei18n.creating, key: 'Creating' },
              { label: scope.volumei18n.error_extending, key: 'Error Extending' },
              { label: scope.volumei18n.extending, key: 'Extending' },
              { label: scope.volumei18n.attaching, key: 'Attaching' },
              { label: scope.volumei18n.detaching, key: 'Detaching' },
              { label: scope.volumei18n.deleting, key: 'Deleting' },
              { label: scope.volumei18n.error_deleting, key: 'Error Deleting' },
              { label: scope.volumei18n['backing-up'], key: 'Backing Up' },
              { label: scope.volumei18n['restoring-backup'], key: 'Restoring Backup' },
              { label: scope.volumei18n.error_restoring, key: 'Error Restoring' }
          ]
        }, {
          label: gettext('Size'),
          name: 'size',
          singleton: true,
        },{
          label: gettext('Create Time'),
          name: 'created_at',
          singleton: true
        }];

        scope.backupFacets = [{
          label: gettext('Name'),
          name: 'name',
          singleton: true
        }, {
          label: gettext('Description'),
          name: 'description',
          singleton: true
        }, {
          label: gettext('Size'),
          name: 'size',
          singleton: true,
        }, {
          label: gettext('Type'),
          name: 'is_incremental',
          singleton: true,
          options: [
              { label: gettext('increment backup'), key: 'true' },
              { label: gettext('full backup'), key: 'false' },
          ]
        },{
          label: gettext('Backup Time'),
          name: 'created_at',
          singleton: true
        }];

        scope.context = context;
        scope.label = context.label;
        scope.title = context.title;
        scope.volume = detail.volumeData;
        scope.ctrl = ctrl;
        scope.action = action;
    }

})();
