/**
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function () {
    'use strict';

    angular.module('hz.dashboard.admin.server_groups')

    /**
     * @ngDoc createAction
     * @ngService
     *
     * @Description
     * Brings up the create user modal dialog.
     * On submit, create a new user and display a success message.
     * On cancel, do nothing.
     */
   .factory('createSGDetailAction', ['$modal', 'backDrop',
    function (modal, backdrop) {

        function action(scope) {

          var self = this;
          var option = {
            templateUrl: 'sg-detail',
            controller: 'sgDetailCtrl',
            backdrop:		backdrop,
            windowClass: 'detailContent',
            resolve: {
              detail: function(){ return null; },
            }
          };

          self.open = function(sg_id){
            option.resolve.detail = function(){ return { "sg_id": sg_id }; };
            option.templateUrl = (window.WEBROOT || '/') + 'admin/server_groups/sg-detail';
            modal.open(option);
          };

       }
       return action;
   }])

  .controller('sgDetailCtrl',  sgDetailCtrl);
  sgDetailCtrl.$inject = ['$scope', '$modalInstance', 'horizon.openstack-service-api.nova', 'detail'];
  function sgDetailCtrl(scope, modalInstance, novaAPI, detail) {

    var ctrl = this;
    var w = 644;
    var context = {
      "properties": gettext("Basic Properties"),
      "detail_overview": gettext("Detail Overview"),
      "id": gettext("Id"),
      "name": gettext("Server Group Name"),
      "policies": gettext("Policies"),
      "members": gettext("Members"),
      "metadata": gettext("Metadata"),
    };
    scope.label = context

    var formatServerGroup = function(sg){
      sg.policies = sg.policies.join(", ");
      sg.members = sg.members.join(", ");
      sg.metadata = " ";
    };

    novaAPI.getServerGroup(detail.sg_id).success(function(sg) {
        formatServerGroup(sg);
        scope.sg = sg;
    });

    var action = {
        cancel: function() {
          $('.detailContent').stop();
          $('.detailContent').animate({
            right: -(w + 40)
          }, 400, function() {
            modalInstance.dismiss('cancel');
          });
        }
    };
    scope.action = action;

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
  }

})();
