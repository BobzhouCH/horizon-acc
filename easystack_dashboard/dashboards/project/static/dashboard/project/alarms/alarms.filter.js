(function(){
	'use strict';

	angular.module('hz.dashboard.project.alarms')

		// Search resource
		.filter("searchresource",function(){
			return function(input,searchTxt){
				var aInput = [];

				if(!searchTxt){
					return input;
				}

				for(var i=0; i<input.length; i++){
					if(input[i].displayname.toLowerCase().indexOf(searchTxt.toLowerCase()) !== -1){
						aInput.push(input[i]);
					}
				}

				return aInput;
			}
		})

		// cpu_util filter
		.filter('util',function(){

			var get_meter_filter_text = function(meterName){
				var metter_filter_mapping = {
					"account": gettext("account"),
					"cpu util": gettext("cpu util"),
					"memory usage": gettext("memory usage"),
					"disk read bytes rate":  gettext("disk read bytes rate"),
					"disk write bytes rate":  gettext("disk write bytes rate"),
					"incoming bytes rate":  gettext("incoming bytes rate"),
					"outgoing bytes rate":  gettext("outgoing bytes rate"),
					"network incoming bytes rate":  gettext("incoming bytes rate"),
					"network outgoing bytes rate":  gettext("outgoing bytes rate")
				}
				return metter_filter_mapping[meterName];
       		}
			return function(input){
				if(input !== "network incoming bytes rate" && input.endsWith(" incoming bytes rate")) {
					var ip = input.split(" ")[0];
					return ip + " " + get_meter_filter_text("network incoming bytes rate")
				} else if (input !== "network outgoing bytes rate" && input.endsWith(" outgoing bytes rate")) {
					var ip = input.split(" ")[0];
					return ip + " " + get_meter_filter_text("network outgoing bytes rate")
				} else if (get_meter_filter_text(input) !== undefined){
					return get_meter_filter_text(input);
				} else {
					return input;
				}
			}
		});
})();