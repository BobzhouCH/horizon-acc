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

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Show alerts detail
   */
  .factory('createAlertsDetailAction', ['horizon.openstack-service-api.keystone', '$modal', 'backDrop',
    function(keystoneAPI, modal, backdrop) {

    var context = {
      "mode": 'create',
      "title": 				gettext('Detail'),
      "detail_overview":  gettext('Alert Detail'),
      "properties": gettext('Basic Info'),
      "project_id": gettext('Project ID'),
      "alert_id": gettext('Alarm ID'),
      "alert_name": gettext('Alarm Name'),
      "severity": gettext('Severity'),
      "current_state": gettext('Current State'),
      "description": gettext('Description'),
      "timestamp": gettext('Timestamp'),
      "resource_name": gettext('Resource Name'),
      "meter_name": gettext('Meter Name')
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'alert-detail',
        controller: 'alertDetailForm',
        backdrop:		backdrop,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; }
        }
      };

      self.open = function(alert_id){
        option.resolve.detail = function(){ return { "alert_id": alert_id }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/alerts/alert-detail/';
        modal.open(option);
      };

    }

    return action;
  }]);

})();