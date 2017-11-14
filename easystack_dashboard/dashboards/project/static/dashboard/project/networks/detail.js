(function() {
  "use strict";

  angular.module('hz.dashboard.project.networks')
    .controller('SubnetDetailCtrl', SubnetDetailCtrl);

  SubnetDetailCtrl.$inject = ['$location',
    'horizon.openstack-service-api.neutron'];

  function SubnetDetailCtrl($location, neutronAPI) {

    var ctrl = this;
    ctrl.title = {
      "Overview":"Overview",
      "Subnet": "Subnet"
    };
    ctrl.label = {
      "ID": "ID",
      "Name": "Name",
      "Network_ID": "Network ID",
      "IP_version": "IP version",
      "CIDR": "CIDR",
      "IP_allocation_pool": "IP allocation pool",
      "DHCP_Enable": "DHCP Enable",
      "Gateway_IP": "Gateway IP",
      "Additional_routes": "Additional routes",
      "DNS_name_server": "DNS name server"
    };

    var pattern = /(.*\/networks\/)(subnet-detail\/)([0-9a-f-]*)?/;
    var subnetId = $location.absUrl().match(pattern)[3];
    neutronAPI.getSubnet(subnetId).success(function(subnet) {
      ctrl.subnet = subnet;
      var allocation_pool = '';
      for(var i=0; i<subnet.allocation_pools.length; i++){
          allocation_pool += subnet.allocation_pools[i].start + " - " + subnet.allocation_pools[i].end + ' \n ';
      }
      if(!subnet.gateway_ip)
        subnet.gateway_ip='-';
      ctrl.subnet.allocation_pools = allocation_pool;
    });

  }

})();
