(function () {
  'use strict';

  angular.module('horizon.framework.util')
    .controller('billing-enable', 
    		['$rootScope', 'horizon.openstack-service-api.billing', 'horizon.openstack-service-api.keystone', '$q',
    function(rootScope, billingAPI, keystoneAPI, $q){
    	rootScope.rootblock            = {};
    	rootScope.rootblock.billing_enable = false;
    	rootScope.rootblock.active_fixing = false;
      rootScope.rootblock.billing_need = true;
    	var enableBillingPromise = billingAPI.getEnableBilling().success(function(data){
    		rootScope.rootblock.billing_enable = data;
    	});
    	var activeFixingPromise = billingAPI.getActiveFixing().success(function(data){
    		rootScope.rootblock.active_fixing = data;
    	});
      var cloudAdminPromise = keystoneAPI.getCloudAdmin().success(function(response){
        if(response){
          rootScope.rootblock.billing_need = false;
        }else{
          keystoneAPI.getCurrentUserSession().success(function(response) {
            var user = response;
            if (user.user_domain_id === 'default') {
              rootScope.rootblock.billing_need = false;
            } else {
              rootScope.rootblock.billing_need = rootScope.rootblock.billing_enable;
            }
          });
        }
      });

      rootScope.rootblock.overallBillingConfigPromise = $q.all([enableBillingPromise, activeFixingPromise, cloudAdminPromise]);

        var datetime_to_unix = function(datetime){
            var tmp_datetime = datetime.replace(/:/g,'-');
            tmp_datetime = tmp_datetime.replace(/ /g,'-');
            var arr = tmp_datetime.split("-");
            var now = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
            return parseInt(now.getTime()/1000);
        }

        var unix_to_utc = function(unix){
            var now = new Date(parseInt(unix) * 1000);
            var year = now.getUTCFullYear();
            var month = now.getUTCMonth() + 1;
            var day = now.getUTCDate();
            var hh = now.getUTCHours();
            var mm = now.getUTCMinutes();
            var ss = now.getUTCSeconds();
            var clock = year + "-";
            if(month < 10) clock += "0";
            clock += month + "-";
            if(day < 10) clock += "0";
            clock += day + " ";
            if(hh < 10) clock += "0";
            clock += hh + ":";
            if (mm < 10) clock += '0';
            clock += mm + ":";
            if (ss < 10) clock += '0';
            clock += ss;
            return(clock);
        }

        var unix_to_local = function(unix){
            var _date = new Date()
            unix -= _date.getTimezoneOffset()*60;
            var now = new Date(parseInt(unix) * 1000);
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var day = now.getDate();
            var hh = now.getHours();
            var mm = now.getMinutes();
            var ss = now.getSeconds();
            var clock = year + "-";
            if(month < 10) clock += "0";
            clock += month + "-";
            if(day < 10) clock += "0";
            clock += day + " ";
            if(hh < 10) clock += "0";
            clock += hh + ":";
            if (mm < 10) clock += '0';
            clock += mm + ":";
            if (ss < 10) clock += '0';
            clock += ss;
            return(clock);
        }

        rootScope.rootblock.local_to_utc = function(time){
            return unix_to_utc(datetime_to_unix(time));
        }

        rootScope.rootblock.utc_to_local = function(time){
            return unix_to_local(datetime_to_unix(time));
        }

        rootScope.rootblock.unix_to_utc = function(time){
            return unix_to_utc(time / 1000);
        }
    }]);
})();
