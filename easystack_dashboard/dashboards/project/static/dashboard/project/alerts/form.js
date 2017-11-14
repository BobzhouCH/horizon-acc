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

  angular.module('hz.dashboard.project.alerts')

  // alert detail controller
  .controller('alertDetailForm',[
    '$scope', '$rootScope', '$modalInstance', 'horizon.openstack-service-api.glance', 'detail', 'context',
    'horizon.openstack-service-api.ceilometer',
    function(scope, rootScope, modalInstance, glanceAPI, detail, context, ceilometerAPI) {
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

      ceilometerAPI.getAlert(detail.alert_id)
          .success(function (response) {
              response.create_time = (new Date(response.timestamp)).format('yyyy-MM-dd hh:mm:ss'); 
              var threshold_rule = response.threshold_rule;
              if (threshold_rule)
              {
                 var meter_name = threshold_rule.meter_name;
                 response.meter_name  = meter_name;
              }
                 
          
              scope.alert = response;
          })

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
      scope.action = action;
      // scope.alertstatei18n = {
      //       'insufficient data': gettext('Set'),
      //       'ok': gettext('Clear'),
      //       'alarm': gettext('Alarm'),
      // };
    }
  ]);
})();

