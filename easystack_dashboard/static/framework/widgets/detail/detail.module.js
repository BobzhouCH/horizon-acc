/*
 *    (c) Copyright 2015 Easystack Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
	"use strict";

	angular.module("horizon.framework.widgets.detail", [])

// please leave it 
/* This will be used in future */

	// .directive('subnetRcolCheck', ['horizon.framework.widgets.basePath', function(path) {
	// 	return {
	// 		restrict: 'C',
	// 		templateUrl: path + 'detail/checkbox.html',
	// 		transclude: true,
	// 		link: function(scope, element, attrs, ctrl, transclude) {
	// 			var oInput, oLabel, html, oModel, id;
	// 			oInput = element.find('input');
	// 			id = oInput.attr('id');
	// 			oModel = oInput.attr('ng-model');
	// 			//html = '<label ng-click="' + oModel + ' = !' + oModel + '"></label>';
	// 			html = '<label></label>';
	// 			oInput.after(html);
	// 			oLabel = element.find('label');
	// 			console.log(id);
	// 			oLabel.click(function() {
	// 				//console.log(oModel);
	// 				//scope[oModel] = !scope[oModel];
	// 				scope.$apply(function() {
	// 					if (oInput.attr("checked")) {
	// 						oInput.removeAttr("checked");
	// 					} else {
	// 						oInput.attr("checked", 'true');
	// 					}
	// 				});
	// 			});
	// 		}
	// 	};
	// }])


})();