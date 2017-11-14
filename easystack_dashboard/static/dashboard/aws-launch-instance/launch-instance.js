
(function () {
  'use strict';

  var module = angular.module('hz.dashboard.aws-launch-instance', [ 'ngSanitize' ]);

  module.factory('AwslaunchInstanceWorkflow', [
    'dashboardBasePath',
    'hz.dashboard.workflow.factory',

    function (path, dashboardWorkflow) {

      return dashboardWorkflow({
        title: gettext('Launch Instance'),
        steps: [
          {
            title: gettext('Select Boot Source'),
            templateUrl: path + 'aws-launch-instance/source/source.html',
            helpUrl: path + 'aws-launch-instance/source/source.help.html',
            formName: 'AwslaunchInstanceSourceForm'
          },
          {
            title: gettext('Flavor'),
            templateUrl: path + 'aws-launch-instance/flavor/flavor.html',
            helpUrl: path + 'aws-launch-instance/flavor/flavor.help.html',
            formName: 'AwslaunchInstanceFlavorForm'
          }
        ],

        btnText: {
          finish: gettext('Create Instance')
        },

        btnIcon: {
          finish: 'fa fa-cloud-download'
        }
      });
    }
  ]);

  // Using bootstrap-ui modal widget
  module.constant('AwslaunchInstanceWizardModalSpec', {
    backdrop: 'static',
    controller: 'ModalContainerCtrl',
    template: '<wizard ng-controller="AwsLaunchInstanceWizardCtrl"></wizard>',
    windowClass: 'modal-dialog-wizard'
  });

  /**
   * @name bootSourceTypes
   * @description Boot source types
   */
  module.constant('bootSourceTypes', {
    IMAGE: 'image',
    INSTANCE_SNAPSHOT: 'snapshot',
    VOLUME: 'volume',
    VOLUME_SNAPSHOT: 'volume_snapshot'
  });

  /**
   * @ngdoc filter
   * @name diskFormat
   * @description
   * Expects object and returns disk_format property value.
   * Returns empty string if input is null or not an object.
   * Uniquely required for the source step implementation of transfer tables
   */
  module.filter('diskFormat', function() {
    return function(input) {
      if (input === null || !angular.isObject(input) ||
        !angular.isDefined(input.disk_format) || input.disk_format === null) {
        return '';
      } else {
        return input.disk_format.toUpperCase();
      }
    };
  });

  module.controller('AwsLaunchInstanceWizardCtrl', [
    '$scope',
    '$rootScope',
    'AwslaunchInstanceModel',
    'AwslaunchInstanceWorkflow',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.settings',
    AwsLaunchInstanceWizardCtrl
  ]);

  module.controller('AwsLaunchInstanceModalCtrl', [
    '$scope',
    '$modal',
    '$window',
    'AwslaunchInstanceWizardModalSpec',
    AwsLaunchInstanceModalCtrl
  ]);

  function AwsLaunchInstanceWizardCtrl($scope, rootScope,
    AwslaunchInstanceModel, AwslaunchInstanceWorkflow, billingAPI, settingsAPI)
  {
    var instanceBilling = null;
    $scope.instance_billing = [];
    $scope.instancePrice = 0;
    $scope.workflow = AwslaunchInstanceWorkflow;
    $scope.model = AwslaunchInstanceModel;
    $scope.model.initialize(true);
    $scope.submit = $scope.model.createInstance;
    $scope.enableSetNicIP = false;

    var promise = settingsAPI.getSetting('ENABLE_SET_NIC_IP', false);
    promise.then(function (response) {
      $scope.enableSetNicIP = response;
    });

    $scope.billingi18n = {
      info: {
        no_enough_balance: gettext('No Enough Balance'),
        no_active_fixing: gettext('No Active Fixing'),
        yuan: gettext('Yuan'),
        rmb_per_month: gettext('Yuan/Month'),
        hour: gettext('Hour'),
      }
    };

    if (rootScope.rootblock.billing_need) {
    	$scope.showBilling = true;
        if (rootScope.rootblock.active_fixing) {
		    billingAPI.getPriceItems('instance')
		      .success(function(data){
		          $scope.instance_billing = data.items;
		          instanceBilling = $scope.instance_billing; 

		          $scope.$watch('model.newInstanceSpec', function(newVal, oldVal){
			           for(var i=0,len=instanceBilling.length; i<len; i++){
			              if($scope.model.newInstanceSpec.flavor && instanceBilling[i]['rule']['flavor'] === $scope.model.newInstanceSpec.flavor.id){
			                 $scope.instancePrice = instanceBilling[i]['fee'];
			              }
			           }
				  },true); 
		      })
		      .error(function(){
		      });

		   billingAPI.getBalance().success(function(data) {
            if (data <= 0) {
              $scope.showBalance = true;
            }
          });
	   }
	   else {
          $scope.noFixing = true;
       }
	}
  }

  function AwsLaunchInstanceModalCtrl($scope, $modal, $window, modalSpec) {
    $scope.openAwsLaunchInstanceWizard = function (launchContext) {
      var localSpec = {
        resolve: {
          launchContext: function() { return launchContext; }
        }
      };

      angular.extend(localSpec, modalSpec);

      var launchInstanceModal = $modal.open(localSpec);

      var handleModalClose = function(redirectPropertyName) {
        return function() {
          var redirectPath = launchContext[redirectPropertyName];
          if (redirectPath) {
            if (redirectPath.charAt(0) === '/') {
              // delete the first char if it's /
              redirectPath = redirectPath.slice(1);
            }
            if (redirectPath.charAt(redirectPath.length-1) === '/') {
              redirectPath = redirectPath.slice(0, -1);
            }

            var pathName = $window.location.pathname;
            if (pathName !== window.WEBROOT + redirectPath
                && pathName !== window.WEBROOT + redirectPath + '/') {
                $window.location.href = window.location.origin + (window.WEBROOT || '/') + redirectPath;
            }
          }
        };
      };

      launchInstanceModal.result.then(handleModalClose('successUrl'),
                                      handleModalClose('dismissUrl'));

    };
  }

})();
