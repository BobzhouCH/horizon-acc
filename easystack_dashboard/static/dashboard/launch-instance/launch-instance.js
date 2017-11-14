(function () {
  'use strict';

  var module = angular.module('hz.dashboard.launch-instance', [ 'ngSanitize' ]);

  module.factory('launchInstanceWorkflow', [
    'dashboardBasePath',
    'hz.dashboard.workflow.factory',

    function (path, dashboardWorkflow) {

      return dashboardWorkflow({
        title: gettext('Create Instance'),
        steps: [
          {
            title: gettext('Select Boot Source'),
            templateUrl: path + 'launch-instance/source/source.html',
            helpUrl: path + 'launch-instance/source/source.help.html',
            formName: 'launchInstanceSourceForm'
          },
          {
            title: gettext('Flavor'),
            templateUrl: path + 'launch-instance/flavor/flavor.html',
            helpUrl: path + 'launch-instance/flavor/flavor.help.html',
            formName: 'launchInstanceFlavorForm'
          },
          {
            title: gettext('Networks'),
            templateUrl: path + 'launch-instance/network/network.html',
            helpUrl: path + 'launch-instance/network/network.help.html',
            formName: 'launchInstanceNetworkForm',
            requiredServiceTypes: ['network']
          },
          {
            id: 'ports',
            title: gettext('Network Ports'),
            templateUrl: path + 'launch-instance/networkports/ports.html',
            helpUrl: path + 'launch-instance/networkports/ports.help.html',
            formName: 'launchInstanceNetworkPortForm',
            requiredServiceTypes: ['network']
          },
          {
            title: gettext('Security Groups'),
            templateUrl: path + 'launch-instance/security-groups/security-groups.html',
            helpUrl: path + 'launch-instance/security-groups/security-groups.help.html',
            formName: 'launchInstanceAccessAndSecurityForm'
          },
          {
            title: gettext('Key and Keypair'),
            templateUrl: path + 'launch-instance/keypair/keypair.html',
            helpUrl: path + 'launch-instance/keypair/keypair.help.html',
            formName: 'launchInstanceKeypairForm'
          },
          {
            title: gettext('Customization Script'),
            templateUrl: path + 'launch-instance/configuration/configuration.html',
            helpUrl: path + 'launch-instance/configuration/configuration.help.html',
            formName: 'launchInstanceConfigurationForm'
          },
          {
            title: gettext('Server Groups'),
            templateUrl: path + 'launch-instance/server-groups/server-groups.html',
            helpUrl: path + 'launch-instance/server-groups/server-groups.help.html',
            formName: 'launchInstanceServerGroupForm'
          },
         
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
  module.constant('launchInstanceWizardModalSpec', {
    backdrop: 'static',
    controller: 'ModalContainerCtrl',
    template: '<wizard ng-controller="LaunchInstanceWizardCtrl"></wizard>',
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

  module.controller('LaunchInstanceWizardCtrl', [
    '$scope',
    '$rootScope',
    'launchInstanceModel',
    'launchInstanceWorkflow',
    'horizon.openstack-service-api.billing',
    'horizon.openstack-service-api.settings',
    'horizon.framework.widgets.wizard.events',
    LaunchInstanceWizardCtrl
  ]);

  module.controller('LaunchInstanceModalCtrl', [
    '$scope',
    '$modal',
    '$window',
    'launchInstanceWizardModalSpec',
    'horizon.framework.widgets.wizard.events',
    LaunchInstanceModalCtrl
  ]);

  function LaunchInstanceWizardCtrl($scope, rootScope,
    launchInstanceModel, launchInstanceWorkflow, billingAPI, settingsAPI,wizardEvents)
  {
    var instanceBilling = null;
    $scope.instance_billing = [];
    $scope.instancePrice = 0;
    $scope.workflow = launchInstanceWorkflow;
    $scope.model = launchInstanceModel;
    $scope.model.initialize(true);
    $scope.model.launchContext = $scope.launchContext
    $scope.submit = $scope.model.createInstance;
    $scope.enableSetNicIP = false;

    var promise = settingsAPI.getSetting('ENABLE_SET_NIC_IP', false);
    promise.then(function (response) {
      $scope.enableSetNicIP = response;
    });
    $scope.$on(
      wizardEvents.AFTER_SUBMIT,
      function (){
        rootScope.$broadcast(wizardEvents.AFTER_SUBMIT);
      }
    );

    $scope.billingi18n = {
      info: {
        no_enough_balance: gettext('No Enough Balance'),
        no_active_fixing: gettext('No Active Fixing'),
        yuan: gettext('Yuan'),
        rmb_per_month: gettext('Yuan/Month'),
        hour: gettext('Hour'),
        month: gettext('Month'),
        year: gettext('Year'),
        billing_type: gettext('Billing Type')
      }
    };

    if (rootScope.rootblock.billing_need) {
    	$scope.showBilling = true;
        if (rootScope.rootblock.active_fixing) {

                   //to judge pre-paid is on or not
          settingsAPI.getSetting('PREBILLING',false).then(

            function success(data){
              $scope.preBilling = data;
            }

          );

          $scope.payment_type = [
            {unit:'H',unitLabel:gettext('By Hour')},
            {unit:'M',unitLabel:gettext('By Month')},
            {unit:'Y',unitLabel:gettext('By Year')}
          ];

          $scope.unitSelect = $scope.payment_type[0];

          $scope.changePayment = function (payment){
            $scope.unitSelect = payment;
            if($scope.unitSelect && $scope.unitSelect.unit === 'M'){
       	      $scope.instancePrice = $scope.instancePriceModel['fee_month'];
       	    }else if($scope.unitSelect && $scope.unitSelect.unit === 'Y'){
       	      $scope.instancePrice = $scope.instancePriceModel['fee_year'];
       	    }else{
       	      $scope.instancePrice = $scope.instancePriceModel['fee_hour'];
       	    }
          };

          $scope.instance_billing = launchInstanceModel.billingFlavorItems;
          instanceBilling = $scope.instance_billing;

          $scope.$watch('model.newInstanceSpec', function(newVal, oldVal){
               for(var i=0,len=instanceBilling.length; i<len; i++){
                  if($scope.model.newInstanceSpec.flavor &&  eval('('+instanceBilling[i]['rule']+')')['flavor'] === $scope.model.newInstanceSpec.flavor.id){
                     $scope.instancePriceModel = instanceBilling[i];
                     $scope.instancePrice = $scope.instancePriceModel['fee'];
                     if($scope.unitSelect && $scope.unitSelect.unit === 'M'){
                       $scope.instancePrice = $scope.instancePriceModel['fee_month'];
                     }else if($scope.unitSelect && $scope.unitSelect.unit === 'Y'){
                       $scope.instancePrice = $scope.instancePriceModel['fee_year'];
                     }
                  }
               }
          },true);

          $scope.$watch('unitSelect.unit', function(newVal, oldVal){
               if(newVal){
                 $scope.model.newInstanceSpec.unit = newVal;
               }
          },true);


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

  function LaunchInstanceModalCtrl($scope, $modal, $window, modalSpec,wizardEvents) {
    $scope.openLaunchInstanceWizard = function (launchContext) {
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
      $scope.$on(
        wizardEvents.AFTER_SUBMIT,
        function (){
          if(launchContext.snapshot){
            handleModalClose('successUrl')();
          }
        }
      );
    };
  }

})();
