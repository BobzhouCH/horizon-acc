/**
 *
 * Networks list
 * controller, directive,service
 *
 *
 */

(function(){
	'use strict';

	angular.module('hz.dashboard.project.keypairs')

		/**
		 * Keypairs ListController
		 * Initialization function
		 */
		.controller('projectKeypairsController', [
			'$scope', 'horizon.openstack-service-api.policy',
			'horizon.openstack-service-api.usersettings',
			'horizon.openstack-service-api.keystone',
			'horizon.openstack-service-api.nova',
			'createKeyPairAction', 'ImportKeyPairAction', 'deleteKeyPairAction',
			'horizon.framework.widgets.toast.service',
			function(scope, policyAPI, usersettingAPI, keystoneAPI, novaAPI,
					CreateAction, ImportAction, DeleteAction, toastService){
				var self = this;
				scope.context = {
					header: {
						name: gettext('Name'),
						fingerprint: gettext('Fingerprint'),
						public_key: gettext('Public Key'),
					},
					action: {
		},
					error: {
						api: gettext('Unable to retrieve keypairs'),
						priviledge: gettext('Insufficient privilege level to view keypairs information.')
					}
				};
				this.reset = function() {
					scope.ikeypairs = [];
					scope.keypairs = [];
					scope.checked = {};
					scope.selected = {};
					scope.ikeypairsState = false;
					if(scope.selectedData)
					  scope.selectedData.aData = [];
				};

				this.init = function(){
					scope.actions = {
					  refresh: self.refresh,
						create: new CreateAction(scope),
					   import: new ImportAction(scope),
					   deleted: new DeleteAction(scope)
					};
					self.refresh();
				  };
				this.refresh = function(){
					scope.disableCreate = false;
					self.reset();
					policyAPI.check({ rules: [['project', 'compute_extension:keypairs:index']] })
					.success(function(response) {
						if(response.allowed){
							novaAPI.getKeypairs()
							.success(function(response){
							    var responseK = response;
					                  keystoneAPI.getCurrentUserSession()
					                  .success(function(response) {
								usersettingAPI.getComponentQuota(response.project_id, {only_quota: true, component_name: 'nova'})
					                          .success(function(data){
					                                for (var i = 0; i < data.items.length; i++){
						                           if (data.items[i].name === 'key_pairs'){
						                             scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
						                             break;
						                           }
						                          }
										scope.keypairs = responseK.items;
										scope.ikeypairsState = true;
					                          });
					                     });
							});
						}
						else if(horizon){
							toastService.add('info', scope.context.error.priviledge)
						}
					});
				};

                scope.filterFacets = [{
                  label: gettext('Name'),
                  name: 'name',
                  singleton: true
                }, {
                  label: gettext('Fingerprint'),
                  name: 'fingerprint',
                  singleton: true
                }];

				this.init();

		}]);

})();