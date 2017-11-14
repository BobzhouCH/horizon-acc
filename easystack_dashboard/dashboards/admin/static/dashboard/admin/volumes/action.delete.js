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

(function() {
  'use strict';

  angular.module('hz.dashboard.project.volumes')

    /**
     * @ngDoc deleteAction
     * @ngService
     *
     * @Description
     * Brings up the delete volume confirmation modal dialog.
     * On submit, delete selected volumes.
     * On cancel, do nothing.
     */
    .factory('adminDeleteVolumeAction',
        ['horizon.openstack-service-api.cinder',
        'horizon.framework.widgets.modal.service',
        'horizon.framework.widgets.toast.service',
        function(cinderAPI, smodal, toastService) {

          var context = {
            title: gettext('Delete Volume'),
            message: gettext('The amount of volumes these will be deleted is : %s'),
            tips: gettext('Please confirm your selection. This action cannot be undone.'),
            submit: gettext('Delete Volume'),
            success: gettext('Deleted volumes: %s.'),
            error: gettext('Unable to delete volumes %s: %s.')
          };

          function action(scope) {

            /*jshint validthis: true */
            var self = this;

            // delete a single volume object
            self.singleDelete = function(volume) {
              self.confirmDelete([volume.id], [volume.name]);
            };

            // delete selected volume objects
            // action requires the volume to select rows
            self.batchDelete = function() {
              var volumes = [], names = [];
              angular.forEach(scope.selected, function(row) {
                if (row.checked){
                  volumes.push(row.item);
                  names.push('"'+ row.item.name +'"');
                }
              });
              self.confirmDelete(volumes, names);
            };

            // brings up the confirmation dialog
            self.confirmDelete = function(volumes, names) {
              var options = {
                title: context.title,
                tips: context.tips,
                body: interpolate(context.message, [names.length]),
                submit: context.submit,
                name: volumes,
                imgOwner: 'volume'
              };
              smodal.modal(options).result.then(function(){
                self.submit(volumes);
              });
            };

            // on success, remove the volumes from the model
            // need to also remove deleted volumes from selected list
            self.submit = function(volumes) {
              for(var i = 0; i < volumes.length; i++){
                self.deleteVolume(volumes[i]);
              }
            };

            self.deleteVolume = function(volume) {
              cinderAPI.deleteVolume(volume.id)
                .success(function() {
                  var message = interpolate(context.success, [volume.name]);
                  toastService.add('success', message);
                  scope.updateVolume(volume);
                  scope.clearSelected();
                })
              .error(function(response) {
                if(response.indexOf('dependent snapshots')>=0){
                  response = gettext('Volume still has one or more snapshots')
                }
                else if(response.indexOf('Volume status must be available or error')>=0){
                  response = gettext('Volume is still in-use, not in available or error status')
                }
                var message = interpolate(context.error, [volume.name, response]);
                toastService.add('error', message);
              });
            }
          }

          return action;

        }]);

})();
