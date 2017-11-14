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

   angular.module('hz.dashboard.project.networks')

  /**
   * @ngDoc createAction
   * @ngService
   *
   * @Description
   * Brings up the create user modal dialog.
   * On submit, create a new user and display a success message.
   * On cancel, do nothing.
   */
  .factory('networkDetailAction', ['horizon.openstack-service-api.keystone', '$modal',
  function(keystoneAPI, modal) {

    var context = {
    };

    var subnet_context = {};
    subnet_context.title = {
      "Overview":gettext("Overview"),
      "Subnet": gettext("Subnet")
    };
    subnet_context.label = {
      "ID": gettext("ID"),
      "Name": gettext("Name"),
      "Network": gettext("Network"),
      "IP_version": gettext("IP version"),
      "CIDR": gettext("CIDR"),
      "IP_Pool": gettext("Allocation Pool"),
      "DHCP_Enable": gettext("DHCP Enable"),
      "Gateway_IP": gettext("Gateway IP"),
      "Host_Routes": gettext("Host_Routes"),
      "DNS_Servers": gettext("DNS Servers")
    };

    context.title = {
      "Overview": gettext("Overview"),
      "Subnets": gettext("Subnets"),
      "Info": gettext("Info")
    };
    context.label = {
      "ID": gettext("ID"),
      "Name": gettext("Name"),
      "Project_ID": gettext("Project ID"),
      "Status": gettext("Status"),
      "Shared": gettext("Shared"),
      "External_Network": gettext("External Network"),
      "Provider_Network": gettext("Provider Network")
    };

    var ctrl = {
        'active': gettext("Active"),
        'saving': gettext("Saving"),
        'queued': gettext("Queued"),
        'pending_delete': gettext("Pending Delete"),
        'killed': gettext("Killed"),
        'deleted': gettext("Deleted"),
        'create':gettext('Create Subnet'),
        'delete': gettext('Delete Subnet'),
        'edit': gettext('Edit'),
        'more': gettext('More')
    };

    function action(scope) {
      /*jshint validthis: true */
      var self = this;
      var option = {
        templateUrl: 'network-detail',
        controller: 'netDetailForm',
        //backdrop: false,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return context; },
          ctrl: function(){ return ctrl; }
        }
      };

      var optionSub = {
        templateUrl: 'subnet-detail',
        controller: 'subnetDetailForm',
        //backdrop:   false,
        windowClass: 'detailContent',
        resolve: {
          detail: function(){ return null; },
          context: function(){ return subnet_context; },
          ctrl: function(){ return ctrl; }
        }
      };

      self.open = function(net_id){
        option.resolve.detail = function(){ return { "net_id": net_id }; };
        modal.open(option);
        option.templateUrl = (window.WEBROOT || '') + 'project/networks/network-detail/';
        window.location.href="#"+net_id;
      };

      self.openSub = function(net_id){
        optionSub.resolve.detail = function(){ return { "net_id": net_id }; };
        option.templateUrl = (window.WEBROOT || '') + 'project/networks/subnet-detail/';
        modal.open(optionSub);
      };
    }

    return action;
  }]);

})();