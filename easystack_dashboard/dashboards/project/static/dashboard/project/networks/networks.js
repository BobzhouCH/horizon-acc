/**
 *
 * networks module
 * @ngdoc hz.dashboard.project.networks
 * @ngModule
 *
 * @description
 * Provides all of the services and widgets required
 * to support and display the identity users panel.
 * All the alarm functions are dependent on this file.
 */

(function(){
'use strict';
/**
 *  Create hz.dashboard.project.networks module.
*/

angular.module('hz.dashboard.project.networks', [])

  .constant('horizon.dashboard.network.Path', (window.WEBROOT || '') + 'project/networks/')

  // Create DNS
  .factory('dnsCreateAction', ['$modal','backDrop','horizon.dashboard.network.Path',
    function(modal, backdrop, path) {

      var context = {
        mode: 'createDns',
        title: gettext('Create DNS'),
        submit:  gettext('Create'),
        success: gettext('Subnet %s was successfully created.')
      };

      function action(scope) {

        var self = this;
        var option = {
          templateUrl: path + 'sub-form',
          controller: 'enterFormCtrl',
          windowClass: 'dnsListContent',
          backdrop: backdrop,
          resolve: {
            data: function(){ return {}; },
            context: function(){ return context; }
          }
        };

        self.open = function(){
          modal.open(option).result.then(self.submit);
        };

        self.assembleValue = function(dnsValue){
          var dns = dnsValue.dns_0 + '.' + dnsValue.dns_1 + '.' + dnsValue.dns_2 + '.' + dnsValue.dns_3;
          return dns;
        };

        self.submit = function(dnsValue) {
          var newDns = self.assembleValue(dnsValue);
          scope.network.dns_nameservers.push(newDns);
        };
      }

      return action;
  }])

  // Create Host Route
  .factory('hostRouteCreateAction', ['$modal','backDrop','horizon.dashboard.network.Path',
    function(modal, backdrop, path) {

      var context = {
        mode: 'createHostRoute',
        title: gettext('Create Host Route'),
        submit:  gettext('Create'),
        success: gettext('Subnet %s was successfully created.')
      };

      function action(scope) {

        var self = this;
        var option = {
          templateUrl: path + 'sub-form',
          controller: 'enterFormCtrl',
          windowClass: 'dnsListContent',
          backdrop: backdrop,
          resolve: {
            data: function(){ return {}; },
            context: function(){ return context; }
          }
        };

        self.assembleValue = function(value){
          var segmentLeap = {
            destination :  (value.segment_0 + '.' + value.segment_1 + '.' + value.segment_2 + '.' + value.segment_3 + '/' + value.segment_4),
            nexthop     :     (value.leap_0 + '.' + value.leap_1 + '.' + value.leap_2 + '.' + value.leap_3)
          };
          return segmentLeap;
        };

        self.open = function(){
          modal.open(option).result.then(self.submit);
        };

        self.submit = function(hostRouteValue) {
          var newHostRoute = self.assembleValue(hostRouteValue);
          scope.network.host_routes.push(newHostRoute);
        };
      }

      return action;
  }])

  // Create address pool
  .factory('addressPoolCreateAction', ['$modal','backDrop','horizon.dashboard.network.Path',
    function(modal, backdrop, path) {

      var context = {
        mode: 'createAddressPool',
        title: gettext('Create Address Pool'),
        submit:  gettext('Create'),
        success: gettext('Subnet %s was successfully created.')
      };

      function action(scope) {

        var self = this;
        var option = {
          templateUrl: path + 'sub-form',
          controller: 'enterFormCtrl',
          windowClass: 'addressPoolListContent',
          backdrop: backdrop,
          resolve: {
            context: function(){ return context; }
          }
        };

        self.open = function(){
          option.resolve.data = function(){ return { cidr: scope.network.cidr }; };
          modal.open(option).result.then(self.submit);
        };

        self.assembleValue = function(addressPoolValue){
          var pool = {
                start: (addressPoolValue.pool_0 + '.' + addressPoolValue.pool_1 + '.' + addressPoolValue.pool_2 + '.' + addressPoolValue.pool_3),
                end: (addressPoolValue.pool_4 + '.' + addressPoolValue.pool_5 + '.' + addressPoolValue.pool_6 + '.' + addressPoolValue.pool_7)
              };
          return pool;
        };

        self.submit = function(addressPoolValue) {
          var newAddressPoolValue = self.assembleValue(addressPoolValue);
          scope.network.allocation_pools.push(newAddressPoolValue);
        };
      }

      return action;
  }])

  // select list data
  .directive('selectList', function() {
    var directive = {
      restrict: 'AE',
      scope: {
        selectList: '=?'
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs) {

      // selected remove elements
      element.delegate('li[tag=true]','click',function(){
        var ibtn = $(this).attr('ibtn');
        if(!ibtn){
          $(this).attr('ibtn','true');
          $(this).addClass('active');
        }
        else{
          $(this).removeAttr('ibtn');
          $(this).removeClass('active');
        }
      });

      // remove selected elements
      element.find('.js-remove').on('click',function(){
        var aLi = element.find('li');
        for(var i=aLi.length; i>=0; i--){
          var iList = aLi.eq(i);
          if(iList.attr('tag') && iList.attr('ibtn')=='true'){
            scope.selectList.splice(iList.attr('data-index'),1);
          }
        }
      });
    }
  })

  // enter check
  .directive('enterCheck', ['$timeout',function($timeout) {
    var directive = {
      restrict: 'AE',
      scope: {
        enterCheck: '=',
        isAddressPoll: '@?'
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      var aInput;

      $timeout(
        function(){
            aInput  = element.find('input');
            // add attr
            for(var i=0; i<aInput.length; i++){
              aInput.eq(i).attr('index', i);
            }
        }
      );

      // Focus
      function selectFocus(index){
        $timeout(function(){
          aInput[index].focus();
        });
      }

      // is number
      function isNumber(enterVal){
        var reg     = /^[0-9]{1,3}$/,
            result  = reg.test(enterVal);

        return result;
      }

      // enter filter
      function enterFilter(enterVal, iNum, index){
        var isNum         = isNumber(enterVal),
            aInputLength  = aInput.length;

        if(isNum && (enterVal.length >= iNum.length) && enterVal <= iNum){

          index++;

          if(index >= aInputLength-1){
            index = aInputLength-1;
          }

          selectFocus(index);
        }
      }

      // Init focus
      if(scope.isAddressPoll !== 'true'){
        selectFocus(0);
      }

      // value enter
      element.delegate('input','keyup',function(){
        var tag       = $(this).attr('tag'),
            _this     = $(this),
            iNum      = 0,
            enterVal  = $(this).val(),
            index     = parseInt(_this.attr('index'));

        if(tag !== 'segment'){
          iNum = '255';
        }else{
          iNum = '32';
        };

        $timeout(function(){
          enterFilter(enterVal, iNum, index);
        });
      });
    }
  }])

  // Address pool check
  .directive('addressPollCheck', function() {
    var directive = {
      restrict: 'A',
      scope: false,
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      var data        = scope[attrs.addressPollCheck],
          addressPool = data['cidr'].split('.');

      // full ip
      function fullIP(address){
        if(address){
          data['pool_0'] = addressPool[0];
          data['pool_1'] = addressPool[1];

          data['pool_4'] = addressPool[0];
          data['pool_5'] = addressPool[1];

          data['address_1'] = true;
          data['address_2'] = true;
          data['address_3'] = true;
          data['address_4'] = true;
        }else{
          data['pool_0'] = addressPool[0];
          data['pool_4'] = addressPool[0];

          data['address_1'] = true;
          data['address_3'] = true;
        }
     }

     // Ip segment
     if(addressPool[0] == 192){
       fullIP(true);
     }
     if(addressPool[0] == 172){
       fullIP(true);
     }
     if(addressPool[0] == 10){
       fullIP(false);
     }
    }
  });

})();