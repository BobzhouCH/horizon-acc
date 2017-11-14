(function() {
  'use strict';

  angular.module('hz.dashboard.project.routers')

  .controller('RoutersOverviewDetailCtrl', 
		  ['$location', '$scope', 'horizon.openstack-service-api.neutron', 'ConnectAction', 'DisConnectAction',
    function(location, scope, neutronAPI, ConnectAction, DisConnectAction) {
    scope.context = {
      header: {
        networkName: gettext('Network Name'),
        subnetName: gettext('Subnet Name'),
        network_Address: gettext('Network Address'),
        gateway_IP: gettext('Gateway IP'),
        fixed_IP: gettext('Fixed IP'),
        status: gettext('Status'),
      },
      action: {
        create: gettext('Create'),
        edit: gettext('Edit'),
        deleted: gettext('Delete')
      },
      error: {
        api: gettext('Unable to retrieve RoutersOverview'),
        priviledge: gettext('Insufficient privilege level to view RoutersOverview information.')
      }
    };

    scope.routersOverview = [];
    scope.iroutersOverview = [];
    scope.checked = {};

    // Fetch the Router ID from the URL.
    var pattern = /(.*\/routers\/)(detail\/)([0-9a-f-]*)?/;
    //scope.routerId = location.absUrl().match(pattern)[3];

    scope.actions = {
    		create: new ConnectAction(scope),
    		disconnect: new DisConnectAction(scope)
	};

    this.init = function(){
	    neutronAPI.getDevicePorts(scope.routerId).success(function(data){
	    	scope.routersOverview=data.items;
	    });
    };

    this.init();


  }])
  .controller('RoutersForwardingDetailCtrl',
  ['$location', '$scope', 'horizon.openstack-service-api.neutron', 'CreateRuleAction', 'DeleteRuleAction',
    function(location, scope, neutronAPI, CreateRuleAction, DeleteRuleAction) {
      scope.context = {
        header: {
          Seq_Num: gettext('Seq Num'),
          Outside_Port: gettext('Outside Port'),
          Inside_Address: gettext('Inside Address'),
          Inside_Port: gettext('Inside Port'),
          Protocol: gettext('Protocol')
        },
        action: {
          create: gettext('Create'),
          deleted: gettext('Delete')
        },
        error: {
          api: gettext('Unable to retrieve RoutersForwarding'),
          priviledge: gettext('Insufficient privilege level to view RoutersForwarding information.')
        }
      };

      scope.routerForwarding = [];
      scope.routerForwardingData = [];
      scope.checked = {};
      scope.actions = {
        create: new CreateRuleAction(scope),
    	deleted: new DeleteRuleAction(scope)
      };

      // Fetch the Router ID from the URL.
      var pattern = /(.*\/routers\/)(detail\/)([0-9a-f-]*)?/;
      //scope.routerId = location.absUrl().match(pattern)[3];


      this.init = function(){
        neutronAPI.getRouter(scope.routerId).success(function(data){
	    	scope.routerForwardingData = data.items.portforwardings;

	    	for (var i = 0; i < scope.routerForwardingData.length; i++){
	    	  scope.routerForwardingData[i].id = i + 1;
	    	}


	    });

      };

      this.init();

    }])
  ;

})();
