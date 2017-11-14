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

   angular.module('hz.dashboard.project.routers')

  /**
   * @ngDoc routerDetailAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('routerDetailAction', ['horizon.openstack-service-api.keystone', '$modal',
  function(keystoneAPI, modal) {

    var context = {
      header: {
        networkName: gettext('Network Name'),
        subnetName: gettext('Subnet Name'),
        network_Address: gettext('Network Address'),
        gateway_IP: gettext('Gateway IP'),
        fixed_IP: gettext('Fixed IP'),
        status: gettext('Status'),

        Seq_Num: gettext('Seq Num'),
        Outside_Port: gettext('Outside Port'),
        Inside_Address: gettext('Inside Address'),
        Inside_Port: gettext('Inside Port'),
        Protocol: gettext('Protocol'),

        firewall_rule_name: gettext('Rule Name'),
        desc: gettext('Description'),
        policy: gettext('Policy'),
        action: gettext('Action'),
        protocol: gettext('Protocol'),
        src_ip: gettext('Source IP'),
        src_port: gettext('Source Port'),
        dst_ip: gettext('Destination IP'),
        dst_port: gettext('Destination Port'),
        share: gettext('Share')
      },
      action: {
        create: gettext('Create'),
        edit: gettext('Edit'),
        deleted: gettext('Delete')
      },
      error: {
        api: gettext('Unable to retrieve RoutersOverview'),
        priviledge: gettext('Insufficient privilege level to view RoutersOverview information.')
      },

      label: {
        firewall_name: gettext('Firewall Name'),
        description: gettext('Description'),
        status: gettext('Status'),
        policy_name: gettext('Policy Name')
      }
    };

    function action(scope) {

      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'routers-detail',
        controller:  'routerDetailForm',
        windowClass: 'detailContent',
        resolve: {
          routerDetail: function(){ return null; },
          context: function(){ return context; }
        }
      };

      self.open = function(router){
        option.resolve.routerDetail = function(){ return { "router": router }; };
        modal.open(option);
      };

    }

    return action;
  }]);

})();