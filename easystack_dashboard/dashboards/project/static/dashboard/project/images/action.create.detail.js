/**
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

   angular.module('hz.dashboard.project.images')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('createDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
  function(keystoneAPI, modal, backdrop) {

    var context = {
      "mode": 'create',
      "title": 				gettext('Detail'),
      "launch": 			gettext("Launch"),
      "create_volume": 		gettext("Create Volume"),
      "edit": 				gettext("Edit"),
      "delete_image": 		gettext("Delete Image"),
      "detail_overview": 	gettext("Detail Overview"),
      "owner": 				gettext("Owner"),
      "status": 			gettext("Status"),
      "base_os": 			gettext("Base OS"),
      "size": 				gettext("Size"),
      "min_disk": 			gettext("Min. Disk"),
      "min_ram": 			gettext("Min. RAM"),
      "disk_format": 		gettext("Disk Format"),
      "container_format": 	gettext("Container Format"),
      "public": 			gettext("Public"),
      "protected": 			gettext("Protected"),
      "checksum": 			gettext("Checksum"),
      "created": 			gettext("Created Time"),
      "updated": 			gettext("Updated Time"),
      "id": 				gettext("ID"),
      "instances": 			gettext("Instances"),
      "metadata": 			gettext("Metadata"),
      "no_description": 	gettext("(No Description)"),
      "custom_properties": 	gettext("Custom Properties"),
      "kernel_id": 			gettext("Kernel ID"),
      "ramdisk_id": 		gettext("Ramdisk ID"),
      "architecture": 		gettext("Architecture"),
      "properties": 		gettext("Basic Properties")
    };

    var ctrl = {
          'active': gettext("Active"),
          'saving': gettext("Saving"),
          'queued': gettext("Queued"),
          'pending_delete': gettext("Pending Delete"),
          'killed': gettext("Killed"),
          'deleted': gettext("Deleted")
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'image-detail',
        controller: 'imgDetailForm',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(img_id){
        option.resolve.detail = function(){ return { "img_id": img_id }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/images/image-detail/';
        modal.open(option);
      };

    }

    return action;
  }]);

})();