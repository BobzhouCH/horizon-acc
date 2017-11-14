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
   * @ngdoc imageformCtrl
   * @ng-controller
   *
   * @description
   * This controller is use for the create and edit image form.
   * Refer to angular-bootstrap $modalInstance for further reading.
   */
  .controller('imageFormCtrl', [
    '$scope', '$rootScope', '$modalInstance', 'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.cinder',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.usersettings',
    'horizon.openstack-service-api.keystone',
    'image', 'context',
  function(scope, rootScope, modalInstance, glanceAPI, cinderAPI, billingAPI, usersettingAPI, keystoneAPI, image, context) {
    var self = this;

    var dropdown = {};
    var action = {
      submit: function() { modalInstance.close(image); },
      cancel: function() { modalInstance.dismiss('cancel'); },
      upload: function() { self.upload(); }
    };

    // get image formats
    if (context.mode === 'create'){
      glanceAPI.listImageFormats().success(function(response) {
        if(response.items.length > 0) {
          dropdown.formats = response.items;
        }
        else
          dropdown.formats = [{name: 'Raw', description: 'Raw'}];
          image.disk_format = dropdown.formats[1].name;
      });

      scope.$on('getready', function(ev, data) {
        image.image_file = data;
      });
    }
    //get volume type
    else if (context.mode === 'image2volume'){
      image.size /= 1024 * 1024 * 1024;
      if (image.size <= 1){
        image.size = 1;
      }
      else{
        image.size = Math.ceil(image.size);
      }

      var minSize = Math.max(image.min_disk, image.size);
      if (image.size < minSize) {
        image.size = minSize;
      }
      var maxSize = 1000;
      image.sizeConfig = { max: maxSize, min: minSize, ctrl: true, unit: 'GB' };

      cinderAPI.getVolumeTypes().success(function(response) {
        dropdown.types = response.items;
      });

      var gigabytes_available, gigabytes_quota;
      keystoneAPI.getCurrentUserSession()
      .success(function(response) {
        usersettingAPI.getComponentQuota(response.project_id, {only_quota: false, component_name: 'cinder'})
        .success(function(data){
          for (var i = 0; i < data.items.length; i++){
            if (data.items[i].name == 'gigabytes'){
              gigabytes_available = data.items[i].usage.available;
              gigabytes_quota = data.items[i].usage.quota;
              break;
            }
          }
          scope.$watch('image.size', function(newv, oldv) {
            if (oldv != newv) {
              scope.quota_exceeded = false;
              if (image.size > gigabytes_available && image.size <= gigabytes_quota){
                scope.quota_exceeded = true;
              }
            }
          });
        });
      });
    }

    this.imageSourceType = function(obj){
      if(obj == 'file'){
          scope.srcTypesChange = true;
      }if(obj == 'url'){
          scope.srcTypesChange = false;
      }
    };

    this.upload = function() {
      /*var imageFile = document.getElementById('image_file');
      if(imageFile.value == '') {
        glanceAPI.toast('error', 'Please select a File');
        return;
      }*/

      image.status = 'uploading';
      document.form.submit();

      var timer = setInterval(pullResult, 1000*3);

      function pullResult(){
        var uploadFrame = document.getElementById('uploadFrame').contentWindow;
        var result = uploadFrame.document.body.innerText || uploadFrame.document.body.textContent;
        if(!result)
          return;
        try{
          var newImage = JSON.parse(result);
          modalInstance.close(newImage);
        }catch(e){
          glanceAPI.toast('error', result);
          modalInstance.dismiss('cancel');
        }
        clearInterval(timer);
      }// end of pullResult
    };// end of upload

    scope.dropdown = dropdown;
    scope.context = context;
    scope.image = image;
    scope.action = action;
    scope.imageSourceType = this.imageSourceType;

    if (rootScope.rootblock.billing_need) {
      scope.showBilling = true;
      if (rootScope.rootblock.active_fixing) {
        billingAPI.getPriceItems('volume').success(function(data) {
          var unitPrice = data.items[0].fee;
          scope.price = Number(unitPrice);
        });
        billingAPI.getBalance().success(function(data) {
          if (data <= 0) {
            scope.showNoBalance = true;
          }
        });
      } else {
        scope.noFixing = true;
      }
    }
  }])

  // img detail controller
  .controller('imgDetailForm',[
    '$scope', '$modalInstance', 'horizon.openstack-service-api.glance', 'detail', 'context','ctrl',
    function(scope, modalInstance, glanceAPI, detail, context,ctrl) {
      var w = 644;
      var action = {
          submit: function() { modalInstance.close(detail); },
          cancel: function() {
            $('.detailContent').stop();
            $('.detailContent').animate({
              right: -(w + 40)
            }, 400, function() {
              modalInstance.dismiss('cancel');
            });
          }
      };
      glanceAPI.getImage(detail.img_id).success(function(data) {
          scope.image = data;
      });
      var h = $(window).height();
        scope.$watch('scope.image', function(newValue,oldValue){
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
      scope.label = context;
      scope.ctrl = ctrl;
      scope.action = action;
    }
  ])
  .directive('fileUpload', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        element[0].onchange = function() {
          var reader = new FileReader();
          reader.onload = function() {
            scope.$emit('getready', this.result);
          };
          reader.readAsDataURL(this.files[0]);
        };
      }
    };
  });
})();

