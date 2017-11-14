webpackJsonp([0,1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);

	__webpack_require__(13);

	__webpack_require__(41);

	__webpack_require__(42);

	/**
	 * Created by kanchen on 07/12/2016.
	 * bootstrap app 
	 * 
	 */
	__webpack_require__(60);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(2);

	var req = __webpack_require__(8); /**
	                                                                          * import all  xx.services.js files
	                                                                          * path:../services
	                                                                          */

	req.keys().forEach(req);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _appInitService = __webpack_require__(3);

	var _appInitService2 = _interopRequireDefault(_appInitService);

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	angular.module(_initConfig2.default.name).service('AppInitService', _appInitService2.default);

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * initialize the app 
	 * you can write some init functions in the service 
	 * all components will wait for the done function 
	 * then invoke the component's functions 
	 */

	// const Promise = require('bluebird');

	var AppInitService = function () {
	    function AppInitService(config, InitService, $q, $http, $rootScope) {
	        _classCallCheck(this, AppInitService);

	        this.config = config;
	        this.InitService = InitService;
	        this.$q = $q;
	        this.$rootScope = $rootScope;
	    }

	    /**
	     * init the app
	     */


	    _createClass(AppInitService, [{
	        key: 'init',
	        value: function init() {
	            var _this = this;

	            this.$rootScope.$on('$routeChangeSuccess', function ($event, current) {
	                _this.$rootScope.currentPage = current.name;
	                _this.$rootScope.currentPageTrackingName = current.trackingName;
	            });

	            // this.addPromise(this.initUser());

	            // this.addPromise(this.test());

	            this.$q.all(promises).then(function (data) {
	                console.log(data);
	            });
	        }
	    }, {
	        key: 'initUser',
	        value: function initUser() {
	            return this.InitService.initUserInfo(this.config.user);
	        }
	    }, {
	        key: 'test',
	        value: function test() {
	            return new Promise(function (resolve, reject) {
	                setTimeout(function () {
	                    console.log('AppInitService test function end after 6s');
	                    resolve();
	                }, 3000);
	            });
	        }

	        /**
	         * @param {object} add a promise object to the array
	         * @return {promises} return the promise array
	         */

	    }, {
	        key: 'addPromise',
	        value: function addPromise(promise) {
	            return promises.push(promise);
	        }

	        /**
	         * wait for all promise or async event go over
	         * @return {promise}
	         */

	    }, {
	        key: 'done',
	        value: function done() {
	            return this.$q.all(promises);
	        }
	    }]);

	    return AppInitService;
	}();

	/**
	 * private property
	 * since es6 don't support static property
	 * only support static function
	 */


	var promises = [];

	module.exports = AppInitService;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var config = null;
	var env = ('local').trim();
	// console.log('>>>',env);
	if (env === 'local') {
	    config = __webpack_require__(5);
	} else if (env === 'qa') {
	    config = __webpack_require__(6);
	} else {
	    config = __webpack_require__(7);
	}

	// console.log(config);

	module.exports = config;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var config = {
	    name: 'horizon.app',
	    debug: true,
	    // host: 'http://localhost:3000'
	    host: ''
	};

	module.exports = config;

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	var config = {
	    name: 'horizon.app',
	    debug: false,
	    host: ""
	};

	module.exports = config;

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	var config = {
	    name: 'horizon.app',
	    debug: false,
	    host: ""
	};

	module.exports = config;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./ceph/ceph_filter.services.js": 9,
		"./ceph/host.services.js": 10,
		"./ceph/pool.services.js": 12
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 8;


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Created by root on 17-3-21.
	 */

	function formatUnit() {
	    return function (num) {
	        if (num >= 1024 * 1024 * 1024 * 1024) {
	            //bytes format to TB
	            return (num / (1024 * 1024 * 1024 * 1024)).toFixed(1) + 'TB';
	        } else if (num >= 1024 * 1024 * 1024) {
	            //bytes format to GB
	            return (num / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
	        } else if (num >= 1024 * 1024) {
	            //bytes format to MB
	            return (num / (1024 * 1024)).toFixed(1) + 'MB';
	        } else if (num >= 1024) {
	            //bytes format to KB
	            return (num / 1024).toFixed(1) + ' KB';
	        } else if (num < 1024) {
	            //show bytes
	            return num.toFixed(1) + ' Bytes';
	        }
	    };
	}

	angular.module('hz.dashboard.lenovo.network_switches').filter('formatUnit', formatUnit);

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base$httpService = __webpack_require__(11);

	var _base$httpService2 = _interopRequireDefault(_base$httpService);

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var HostService = function (_Base$httpService) {
	    _inherits(HostService, _Base$httpService);

	    function HostService() {
	        _classCallCheck(this, HostService);

	        return _possibleConstructorReturn(this, (HostService.__proto__ || Object.getPrototypeOf(HostService)).apply(this, arguments));
	    }

	    _createClass(HostService, [{
	        key: 'getCluster',


	        // testPost(url, params) {
	        //     return this.post(url, params);
	        // }

	        // testGet(url, params) {
	        //     return this.get(url, params);
	        // }

	        value: function getCluster(url, params) {
	            return this.get(url, params);
	        }
	    }, {
	        key: 'getHostList',
	        value: function getHostList(url, params) {
	            return this.get(url + '?cluster_id=' + params.cluster_id + '&marker=' + params.marker + '&pagesize=' + params.pagesize);
	        }
	    }, {
	        key: 'getServerOsdList',
	        value: function getServerOsdList(url, params) {
	            return this.get(url, params);
	        }
	    }, {
	        key: 'getServerDiskList',
	        value: function getServerDiskList(url, params) {
	            return this.get(url, params);
	        }
	    }]);

	    return HostService;
	}(_base$httpService2.default);

	angular.module(_initConfig2.default.name).service('hostService', HostService);

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Base$httpService = function () {
	    function Base$httpService($http, apiService) {
	        _classCallCheck(this, Base$httpService);

	        this.$http = $http;
	        this.apiService = apiService;
	    }

	    // post(url, params) {
	    //     return this.apiService.post({
	    //         url: url,
	    //         params: params,
	    //         method:'POST'
	    //     })
	    // }

	    _createClass(Base$httpService, [{
	        key: 'get',
	        value: function get(url, params) {
	            return this.apiService.get(url);
	        }
	    }]);

	    return Base$httpService;
	}();

	Base$httpService.$inject = ['$http', 'horizon.framework.util.http.service'];

	module.exports = Base$httpService;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base$httpService = __webpack_require__(11);

	var _base$httpService2 = _interopRequireDefault(_base$httpService);

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by root on 17-3-21.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

	var PoolService = function (_Base$httpService) {
	    _inherits(PoolService, _Base$httpService);

	    function PoolService() {
	        _classCallCheck(this, PoolService);

	        return _possibleConstructorReturn(this, (PoolService.__proto__ || Object.getPrototypeOf(PoolService)).apply(this, arguments));
	    }

	    _createClass(PoolService, [{
	        key: 'getCluster',
	        value: function getCluster(url, params) {
	            return this.get(url, params);
	        }
	    }, {
	        key: 'getPoolList',
	        value: function getPoolList(params) {
	            return this.get(_initConfig2.default.host + "/api/storage/clusters/" + params.cluster_id + "/pools");
	        }
	    }]);

	    return PoolService;
	}(_base$httpService2.default);

	angular.module(_initConfig2.default.name).service('poolService', PoolService);

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * import all  xx.component.js files
	 * path:../services
	 */
	// import '../common/components/modules.js';

	var req = __webpack_require__(14);
	req.keys().forEach(req);

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./ceph/host/host.component.js": 15,
		"./ceph/pool/pool.component.js": 26,
		"./home/home.component.js": 34
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 14;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(16);

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	var _baseComponent = __webpack_require__(20);

	var _baseComponent2 = _interopRequireDefault(_baseComponent);

	__webpack_require__(21);

	__webpack_require__(22);

	__webpack_require__(24);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var HostController = function HostController() {
	    _classCallCheck(this, HostController);
	};

	var HostPage = function (_BaseComponent) {
	    _inherits(HostPage, _BaseComponent);

	    function HostPage() {
	        _classCallCheck(this, HostPage);

	        var _this = _possibleConstructorReturn(this, (HostPage.__proto__ || Object.getPrototypeOf(HostPage)).call(this));

	        _this.controller = __webpack_require__(21);
	        // this.controllerAs = 'vm'
	        _this.template = __webpack_require__(25);
	        return _this;
	    }

	    return HostPage;
	}(_baseComponent2.default);

	angular.module(_initConfig2.default.name).directive('cephMHost', function () {
	    return new HostPage();
	});

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(17);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(19)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../../node_modules/.0.26.2@css-loader/index.js!../../../../node_modules/.1.3.2@postcss-loader/index.js!../../../../node_modules/.4.1.1@sass-loader/index.js!./host.scss", function() {
				var newContent = require("!!../../../../node_modules/.0.26.2@css-loader/index.js!../../../../node_modules/.1.3.2@postcss-loader/index.js!../../../../node_modules/.4.1.1@sass-loader/index.js!./host.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(18)();
	// imports


	// module
	exports.push([module.id, ".popover {\n  max-width: 400px; }\n", ""]);

	// exports


/***/ },
/* 18 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var BaseComponent = function BaseComponent() {
	    _classCallCheck(this, BaseComponent);

	    this.bindToController = true;
	    this.controllerAs = 'vm';
	    this.restrict = 'E';
	};

	module.exports = BaseComponent;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var HostTableController = function () {
	    function HostTableController(scope, action, hostService, toastService) {
	        _classCallCheck(this, HostTableController);

	        _initialiseProps.call(this);

	        this.action = action;
	        this.hostService = hostService;
	        this.toastService = toastService;
	        this.init(scope);

	        scope.showPagination = function () {
	            // get $$childHead first and then iterate that scope's $$nextSiblings
	            var parentScope = angular.element('#hosts_pagination').scope();

	            for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
	                if (cs.pages && cs.pages.length > 1) {
	                    return true;
	                }
	            }
	            return false;
	        };
	    }
	    //inject you want to dependencies ,and add them to constructor as pramaters above
	    //note:the order need match


	    _createClass(HostTableController, [{
	        key: 'getClusterInfo',


	        /**
	         * query cluster id
	         */
	        value: function getClusterInfo() {
	            return this.hostService.getCluster(_initConfig2.default.host + "/api/storage/clusters/");
	        }

	        /**
	         * query hostlist
	         * @param {Object} params cluster_id,page offset,current page numbers
	         */

	    }, {
	        key: 'getHostList',
	        value: function getHostList(scope, params) {
	            var self = this;
	            self.hostService.getHostList(_initConfig2.default.host + "/api/storage/servers", params).success(function (result) {
	                // angular.element('#hosts_all_checkbox').scope().specialReset();
	                scope.hosts = result.data;
	                scope.hostState = true;
	            }).error(function (err) {
	                toastService.add('error', gettext('Unable to get ceph Hosts info.'));
	                // console.log(err);
	            });
	        }

	        /**
	         * init page data
	         */

	    }, {
	        key: 'initData',
	        value: function initData(scope) {
	            var self = this;
	            self.getClusterInfo().success(function (result) {
	                result && result.data && result.data.length > 0 && self.getHostList(scope, { cluster_id: result.data[0].id, marker: 0, pagesize: 999 });
	            }).error(function (err) {
	                toastService.add('error', gettext('Unable to get ceph cluster info'));
	                // console.log(err);
	            });
	        }
	    }, {
	        key: 'init',
	        value: function init(scope) {
	            var self = this;
	            scope.isAdding = false;
	            scope.isEditting = false;
	            scope.isDeleting = false;

	            self.setPageConfig(scope);
	            self.bindAction(scope);
	            self.initData(scope);
	        }
	    }, {
	        key: 'bindAction',
	        value: function bindAction(scope) {
	            var self = this;

	            scope.actions = {
	                refresh: self.initData.bind(this, scope),
	                modal: new self.action(scope)
	            };
	        }
	    }, {
	        key: 'setPageConfig',
	        value: function setPageConfig(scope) {
	            var self = this;
	            scope.context = {
	                header: {
	                    serverName: gettext('Host Name'),
	                    publicIp: gettext('Public IP'),
	                    clusterIp: gettext('Cluster IP'),
	                    role: gettext('Role'),
	                    Status: gettext('Status'),
	                    nodata: gettext('No DATA')
	                },
	                action: {
	                    // create: gettext('Add Switch'),
	                    // edit: gettext('Edit'),
	                    // delete: gettext('Delete Switches')
	                },
	                error: {
	                    api: gettext('Unable to retrieve imagess'),
	                    priviledge: gettext('Insufficient privilege level to view user information.')
	                }
	            };

	            scope.filterFacets = [{
	                label: gettext('Server Name'),
	                name: 'servername',
	                singleton: true
	            }, {
	                label: gettext('Public IP'),
	                name: 'publicip',
	                singleton: true
	            }, {
	                label: gettext('Cluster IP'),
	                name: 'clusterip',
	                singleton: true
	            }, {
	                label: gettext('Role'),
	                name: 'hw_type',
	                singleton: true
	            }, {
	                label: gettext('Status'),
	                name: 'status',
	                singleton: true
	            }];
	        }
	    }]);

	    return HostTableController;
	}();

	HostTableController.$inject = ['$scope', 'ceph.host.action', 'hostService', 'horizon.framework.widgets.toast.service'];

	var _initialiseProps = function _initialiseProps() {
	    this.reset = function (scope) {
	        var self = this;
	        scope.ihosts = [];
	        scope.hosts = [];
	        scope.hostState = false;

	        scope.host = [];
	        scope.nodes = [];

	        //scope.checked = {};
	        //scope.selected = {};
	        if (scope.selectedData) {
	            scope.selectedData.aData = [];
	        }
	    };
	};

	module.exports = HostTableController;
	// angular.module(config.name)
	//     .controller('HostTableController', HostTableController);

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('hz.dashboard.lenovo.network_switches').service('ceph.host.action', ['$modal', 'horizon.dashboard.lenovo.network_switches.Path', 'horizon.openstack-service-api.switch', 'horizon.framework.widgets.toast.service', function (modal, path, switchAPI, toastService) {

	        var context = {};

	        //   context.title = {
	        //       "Overview": gettext("Overview"),
	        //       "Subnets": gettext("Subnets"),
	        //       "Info": gettext("Info")
	        //   };
	        //   context.label = {
	        //       "ID": gettext("ID"),
	        //       "Name": gettext("Name"),
	        //       "Project_ID": gettext("Project ID"),
	        //       "Status": gettext("Status"),
	        //       "Shared": gettext("Shared"),
	        //       "External_Network": gettext("External Network"),
	        //       "Provider_Network": gettext("Provider Network")
	        //   };

	        function action(scope) {
	            /*jshint validthis: true */
	            var self = this;
	            self.controllerScope = scope;

	            var openDetailOption = {
	                template: __webpack_require__(23),
	                controller: 'ceph.host.detail.controller',
	                //backdrop: false,
	                windowClass: 'detailContent',
	                resolve: {
	                    hostData: function hostData() {}
	                }
	            };

	            self.openDetail = function (hostData) {
	                openDetailOption.resolve.hostData = function () {
	                    return hostData;
	                };
	                modal.open(openDetailOption);
	            };

	            var createSwitchOption = {
	                templateUrl: path + 'switch/create/',
	                controller: 'lenovoNetworkSwitchesCreateSwitchController',
	                windowClass: 'neutronListContent',
	                resolve: {}
	            };

	            self.createSwitch = function () {
	                modal.open(createSwitchOption).result.then(self.submitCreateSwitch);
	            };

	            self.submitCreateSwitch = function (newSwitch) {
	                //console.log(newSwitch);
	                switchAPI.createSwitch(newSwitch).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully add a new switch!'));
	                    } else {
	                        toastService.add('error', gettext('Add new switch failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isAdding = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Add new switch failed.') + ' ' + data);
	                });

	                self.controllerScope.isAdding = true;
	                toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var editSwitchOption = {
	                templateUrl: path + 'switch/edit/',
	                controller: 'lenovoNetworkSwitchesEditSwitchController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {}
	                }
	            };

	            self.editSwitch = function (selectedSwitch) {
	                if (selectedSwitch || selectedSwitch.length > 0) {
	                    editSwitchOption.resolve.switchData = function () {
	                        return selectedSwitch[0];
	                    };
	                    modal.open(editSwitchOption).result.then(self.submitEditSwitch);
	                }
	            };

	            self.submitEditSwitch = function (switchEditData) {
	                //console.log(switchEditData);
	                switchAPI.editSwitch(switchEditData.switch_id, switchEditData.pmswitch_id, { username: switchEditData.username, password: switchEditData.password }).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully edit a new switch!'));
	                    } else {
	                        toastService.add('error', gettext('Edit switch failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isEditting = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Edit switch failed.') + ' ' + data);
	                });

	                self.controllerScope.isEditting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var deleteSwitchOption = {
	                templateUrl: path + 'switch/delete/',
	                controller: 'lenovoNetworkSwitchesDeleteSwitchController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchIds: function switchIds() {},
	                    switchNames: function switchNames() {}
	                }
	            };

	            self.deleteSwitch = function (switches) {
	                if (switches) {
	                    var switchIds = [];
	                    var switchNames = [];
	                    angular.forEach(switches, function (row) {
	                        switchIds.push({
	                            switch_id: row.uuid,
	                            pmswitch_id: row.pmswitch_id
	                        });
	                        switchNames.push(row.hostname);
	                    });
	                    deleteSwitchOption.resolve.switchIds = function () {
	                        return switchIds;
	                    };
	                    deleteSwitchOption.resolve.switchNames = function () {
	                        return switchNames.join(',');
	                    };
	                    modal.open(deleteSwitchOption).result.then(self.submitDeleteSwitch);
	                }
	            };

	            self.submitDeleteSwitch = function (switchIds) {
	                //console.log(switchIds);
	                var hasError = false;
	                var doneCount = 0;

	                angular.forEach(switchIds, function (switchId) {
	                    switchAPI.deleteSwitch(switchId.switch_id, switchId.pmswitch_id).success(function (data) {
	                        if (data && data.status && data.status == 'success') {} else {
	                            hasError = true;
	                            toastService.add('error', gettext('Delete switch failed.') + ' ' + data.msg);
	                        }

	                        doneCount++;
	                        if (doneCount = switchIds.length) {
	                            if (!hasError) {
	                                toastService.add('success', gettext('Successfully delete switches!'));
	                            }

	                            self.controllerScope.isDeleting = false;
	                            self.controllerScope.actions.refresh();
	                        }
	                    }).error(function (data) {
	                        hasError = true;
	                        toastService.add('error', gettext('Delete switch failed.') + ' ' + data);

	                        doneCount++;
	                        if (doneCount = switchIds.length) {
	                            if (!hasError) {
	                                toastService.add('success', gettext('Successfully delete switches!'));
	                            }

	                            self.controllerScope.isDeleting = false;
	                            self.controllerScope.actions.refresh();
	                        }
	                    });
	                });

	                self.controllerScope.isDeleting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var createDetailSwitchOption = {
	                templateUrl: path + 'detail/create/',
	                controller: 'lenovoNetworkSwitchesCreateDetailController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {}
	                }
	            };

	            self.createDetailSwitch = function (switchData) {
	                createDetailSwitchOption.resolve.switchData = function () {
	                    return switchData;
	                };
	                modal.open(createDetailSwitchOption).result.then(self.submitCreateDetailSwitch);
	            };

	            self.submitCreateDetailSwitch = function (newNode) {
	                //console.log(newNode);
	                var submitNodeData = {
	                    port_mapping: {}
	                };

	                submitNodeData["port_mapping"][newNode.nodename] = newNode.port;

	                switchAPI.createNode(newNode.switch_id, newNode.pmswitch_id, submitNodeData).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully add a new port-mapping!'));
	                    } else {
	                        toastService.add('error', gettext('Add port-mapping failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isAdding = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Add port-mapping failed.') + ' ' + data);
	                });

	                self.controllerScope.isAdding = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var editDetailSwitchOption = {
	                templateUrl: path + 'detail/edit/',
	                controller: 'lenovoNetworkSwitchesEditDetailController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {},
	                    nodeData: function nodeData() {}
	                }
	            };

	            self.editDetailSwitch = function (data) {
	                editDetailSwitchOption.resolve.switchData = function () {
	                    return data[0];
	                };
	                editDetailSwitchOption.resolve.nodeData = function () {
	                    if (data[1] || data[1].length > 0) {
	                        return data[1][0];
	                    }
	                };
	                modal.open(editDetailSwitchOption).result.then(self.submitEditDetailSwitch);
	            };

	            self.submitEditDetailSwitch = function (updateNode) {
	                //console.log(updateNode);
	                var submitNodeData = {
	                    port_mapping: {}
	                };

	                submitNodeData["port_mapping"][updateNode.nodename] = updateNode.port;

	                switchAPI.editNode(updateNode.switch_id, updateNode.pmswitch_id, submitNodeData).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully edit a new port-mapping!'));
	                    } else {
	                        toastService.add('error', gettext('Edit port-mapping failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isEditting = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Edit port-mapping failed.') + ' ' + data);
	                });

	                self.controllerScope.isEditting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var deleteDetailSwitchOption = {
	                templateUrl: path + 'detail/delete/',
	                controller: 'lenovoNetworkSwitchesDeleteDetailController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {},
	                    nodeNames: function nodeNames() {},
	                    nodeIds: function nodeIds() {}
	                }
	            };

	            self.deleteDetailSwitch = function (data) {
	                if (data[1] || data[1].length > 0) {
	                    var ids = [];
	                    angular.forEach(data[1], function (row) {
	                        ids.push(row.nodename);
	                    });

	                    deleteDetailSwitchOption.resolve.switchData = function () {
	                        return data[0];
	                    };
	                    deleteDetailSwitchOption.resolve.nodeNames = function () {
	                        return ids.join(',');
	                    };
	                    deleteDetailSwitchOption.resolve.nodeIds = function () {
	                        return ids;
	                    };
	                    modal.open(deleteDetailSwitchOption).result.then(self.submitDeleteDetailSwitch);
	                }
	            };

	            self.submitDeleteDetailSwitch = function (deleteData) {
	                //console.log(deleteData);
	                switchAPI.deleteNode(deleteData.switchData.uuid, deleteData.switchData.pmswitch_id, deleteData.nodes).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully delete port-mapping!'));
	                    } else {
	                        toastService.add('error', gettext('Delete port-mapping failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isDeleting = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Delete port-mapping failed.') + ' ' + data);
	                });

	                self.controllerScope.isDeleting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };
	        }

	        return action;
	    }]);
	})();

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = "<style>\n    .networkSwitchesDetailSpecialStyle > * {\n        margin-top: 10px;\n    }\n</style>\n<div class=\"detail-page\">\n    <div class=\"fl detail-left-icon\" ng-click=\"action.cancel()\"></div>\n    <div class=\"detail-page-con\">\n        <tabset justified=\"true\" class=\"def-tabs\">\n            <tab id=\"switch_deail\" heading='{$ ::context.header.detail $}'>\n                <div class=\"tab-pane-content\">\n                    <table class=\"table table-bordered table-hover table-unique\">\n                        <thead>\n                        <tr>\n                            <th colspan=\"100\">\n                                <span class=\"detail-title\">{$ ::context.header.title $}</span>\n                            </th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr>\n                            <td>{$ ::context.header.servername $}</td>\n                            <td>{$ inHostData.servername $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.publicip $}</td>\n                            <td>{$ inHostData.publicip $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.clusterip $}</td>\n                            <td>{$ inHostData.clusterip $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.role $}</td>\n                            <td>{$ inHostData.mons[0]?\"MON\":\"\" + inHostData.mons[0]&&inHostData.osds[0]?\"/\":\"\" + inHostData.osds[0]?\"OSD\":\"\" $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.status $}</td>\n                            <td>{$ inHostData.status == 1 ? 'Up' :'Down' $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.cpuUtilization $}</td>\n                            <td>{$ inHostData.cpuUsage $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.memoryUtilization $}</td>\n                            <td>{$ inHostData.ramUsage $}</td>\n                        </tr>\n                        <!--<tr>\n                            <td>{$ ::context.header.memory $}</td>\n                            <td>{$ switchData.memory $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.osType $}</td>\n                            <td>{$ switchData.os_type| uppercase $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.osVersion $}</td>\n                            <td>{$ switchData.osVer $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.sshPort $}</td>\n                            <td>{$ switchData.ssh_port $}</td>\n                        </tr>\n                        <tr>\n                            <td>{$ ::context.header.restPort $}</td>\n                            <td>{$ switchData.rest_tcp_port $}</td>\n                        </tr>-->\n                        </tbody>\n                    </table>\n                </div>\n            </tab>\n            <tab id=\"node_list\" heading='{$ ::context.header.osd $}'>\n                <div class=\"tab-content\" style=\"border:0;\">\n                    <div class=\"tab-pane-content\">\n                        <hz-magic-search-context id=\"givemefive\" filter-facets=\"filterFacets\">\n                            <table id=\"nodelist\" hz-table ng-cloak hopes-table-drag\n                                   st-table=\"inodes\"\n                                   st-safe-src=\"nodes\"\n                                   disabled=\"disabled\"\n                                   st-magic-search\n                                   class=\"table table-bordered table-hover\">\n                                <thead>\n                                <tr id=\"givemefive2\">\n                                    <th colspan=\"100\" class=\"bare\">\n                                        <div class=\"table_actions clearfix\">\n                                            <action-list class=\"btn-addon\">\n                                                <action action-classes=\"'btn btn-default btn-sm'\"\n                                                        callback=\"actions.refresh\"\n                                                        disabled=\"isAdding || isEditting || isDeleting\">\n                                                    <i class=\"icon icon-refresh\"></i>\n                                                    <span id=\"refresh\"></span>\n                                                </action>\n                                            </action-list>\n                                            <!--<action-list>-->\n                                            <!--<action action-classes=\"'btn btn-primary btn-action'\"-->\n                                            <!--callback=\"actions.modal.createDetailSwitch\" item=\"switchData\"-->\n                                            <!--disabled=\"isAdding || isEditting || isDeleting\">-->\n                                            <!--<i class=\"icon icon-add\"></i>-->\n                                            <!--<span id=\"create-node\">{$ ::context.action.create $}</span>-->\n                                            <!--</action>-->\n                                            <!--</action-list>-->\n                                            <!--<action-list>-->\n                                            <!--<action action-classes=\"'btn btn-action btn-primary'\"-->\n                                            <!--disabled=\"numSelected !== 1 || isAdding || isEditting || isDeleting\"-->\n                                            <!--callback=\"actions.modal.editDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n                                            <!--<i class=\"icon icon-edit\"></i>-->\n                                            <!--<span id=\"edit-node\">{$ ::context.action.edit $}</span>-->\n                                            <!--</action>-->\n                                            <!--</action-list>-->\n                                            <!--<action-list>-->\n                                            <!--<action action-classes=\"'btn btn-action btn-danger'\"-->\n                                            <!--disabled=\"numSelected === 0 || isAdding || isEditting || isDeleting\"-->\n                                            <!--callback=\"actions.modal.deleteDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n                                            <!--<i class=\"icon icon-delete\"></i>-->\n                                            <!--<span id=\"delete-node\">{$ ::context.action.delete $}</span>-->\n                                            </action>\n                                            </action-list>\n                                            <div class=\"fr search-bar\">\n                                                <hz-magic-search-bar id=\"search\"></hz-magic-search-bar>\n                                            </div>\n                                        </div>\n                                    </th>\n                                </tr>\n                                <tr eagle-eye=\"table_heads\">\n                                    <th class=\"select-col\" eagle-eye=\"select_col\">\n                                        <input id=\"nodes_all_checkbox\" type=\"checkbox\" hz-select-page=\"nodes\"\n                                               ng-disabled=\"isAdding || isEditting || isDeleting\"/>\n                                    </th>\n                                    <th><span st-sort=\"osd.osdName\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.osdName $}</span>\n                                    </th>\n                                    <th><span st-sort=\"osd.osdStatus\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.osdStatus $}</span></th>\n                                    <th><span st-sort=\"osd.used\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.osdUsedCapacity $}</span></th>\n                                    <th><span st-sort=\"osd.avail\" eagle-eye=\"data_col\">{$ ::context.header.osdAvailableCapacity $}</span>\n                                    </th>\n                                    <th><span st-sort=\"osd.activetime\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.osdActiveTime $}</span></th>\n                                    <th><span st-sort=\"osd.updated_at\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.osdUpdatedTime $}</span></th>\n                                </tr>\n                                </thead>\n                                <tbody>\n                                <tr ng-if=\"!nodeState\">\n                                    <td colspan=\"100\" class=\"Loading-bar\"><img class=\"load-detail\"\n                                                                               src=\"/static/bootstrap/img/loading.gif\"\n                                                                               alt=\"\"/></td>\n                                </tr>\n                                <tr ng-if=\"!inodes.length && nodeState\">\n                                    <td colspan=\"100\" eagle-eye=\"empty_table\">{$ ::context.header.nodata $}</td>\n                                </tr>\n                                <tr ng-repeat=\"node in inodes\" ng-class=\"{'st-selected': checked[node.id]}\">\n                                    <td class=\"select-col\" eagle-eye=\"select_col\">\n                                        <input type=\"checkbox\"\n                                               hz-select=\"node\"\n                                               ng-model=\"selected[node.id].checked\"\n                                               hz-checkbox-group=\"nodes\"\n                                               ng-disabled=\"isAdding || isEditting || isDeleting\"/>\n                                    </td>\n                                    <td eagle-eye=\"data_col\">{$ node.osd.osdName $}</td>\n                                    <td eagle-eye=\"data_col\">{$ node.osd.osdStatus $}</td>\n                                    <td eagle-eye=\"data_col\">{$ node.osd.used | formatUnit $}</td>\n                                    <td eagle-eye=\"data_col\">{$ node.osd.avail | formatUnit $}</td>\n                                    <td eagle-eye=\"data_col\">{$ node.osd.activetime $}</td>\n                                    <td eagle-eye=\"data_col\">{$ node.osd.updated_at $}</td>\n                                </tr>\n                                <tr ng-if=\"isAdding\">\n                                    <td colspan=\"100\" class=\"Loading-bar\">\n                                        {$ ::context.header.adding $}<img class=\"load-detail\"\n                                                                          src=\"/static/bootstrap/img/loading.gif\"\n                                                                          alt=\"\"/>\n                                    </td>\n                                </tr>\n                                <tr ng-if=\"isEditting\">\n                                    <td colspan=\"100\" class=\"Loading-bar\">\n                                        {$ ::context.header.editting $}<img class=\"load-detail\"\n                                                                            src=\"/static/bootstrap/img/loading.gif\"\n                                                                            alt=\"\"/>\n                                    </td>\n                                </tr>\n                                <tr ng-if=\"isDeleting\">\n                                    <td colspan=\"100\" class=\"Loading-bar\">\n                                        {$ ::context.header.deleting $}<img class=\"load-detail\"\n                                                                            src=\"/static/bootstrap/img/loading.gif\"\n                                                                            alt=\"\"/>\n                                    </td>\n                                </tr>\n                                </tbody>\n                                <tfoot ng-if=\"nodes.length > 10\">\n                                <tr>\n                                    <td colspan=\"100\" eagle-eye=\"data_page\">\n                                        <table-footer></table-footer>\n                                    </td>\n                                </tr>\n                                </tfoot>\n                                <!--<tfoot id=\"nodes_pagination\" ng-show=\"showPagination()\">\n                                    <tr>\n                                        <td colspan=\"100\" class=\"text-center\">\n                                            <style>\n                                                .pagination {\n                                                    display: inline-block;\n                                                }\n                                            </style>\n                                            <div st-pagination=\"\" st-items-by-page=\"10\" st-displayed-pages=\"20\" ></div>\n                                        </td>\n                                    </tr>\n                                </tfoot>-->\n                            </table>\n                        </hz-magic-search-context>\n                    </div>\n                </div>\n            </tab>\n\n            <tab id=\"\" heading='{$ ::context.header.disk $}'>\n                <div class=\"tab-content\" style=\"border:0;\">\n                    <div class=\"tab-pane-content\">\n                        <hz-magic-search-context id=\"\" filter-facets=\"diskfilterFacets\">\n                            <table id=\"disklist\" hz-table ng-cloak hopes-table-drag\n                                   st-table=\"idisks\"\n                                   st-safe-src=\"disks\"\n                                   disabled=\"disabled\"\n                                   st-magic-search\n                                   class=\"table table-bordered table-hover\">\n                                <thead>\n                                <tr id=\"givemefive\">\n                                    <th colspan=\"100\" class=\"bare\">\n                                        <div class=\"table_actions clearfix\">\n                                            <action-list class=\"btn-addon\">\n                                                <action action-classes=\"'btn btn-default btn-sm'\"\n                                                        callback=\"actions.refresh\"\n                                                        disabled=\"isAdding || isEditting || isDeleting\">\n                                                    <i class=\"icon icon-refresh\"></i>\n                                                    <span id=\"refresh2\"></span>\n                                                </action>\n                                            </action-list>\n                                            <!--<action-list>-->\n                                            <!--<action action-classes=\"'btn btn-primary btn-action'\"-->\n                                            <!--callback=\"actions.modal.createDetailSwitch\" item=\"switchData\"-->\n                                            <!--disabled=\"isAdding || isEditting || isDeleting\">-->\n                                            <!--<i class=\"icon icon-add\"></i>-->\n                                            <!--<span id=\"create-disk\">{$ ::context.action.create $}</span>-->\n                                            <!--</action>-->\n                                            <!--</action-list>-->\n                                            <!--<action-list>-->\n                                            <!--<action action-classes=\"'btn btn-action btn-primary'\"-->\n                                            <!--disabled=\"numSelected !== 1 || isAdding || isEditting || isDeleting\"-->\n                                            <!--callback=\"actions.modal.editDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n                                            <!--<i class=\"icon icon-edit\"></i>-->\n                                            <!--<span id=\"edit-disk\">{$ ::context.action.edit $}</span>-->\n                                            <!--</action>-->\n                                            <!--</action-list>-->\n                                            <!--<action-list>-->\n                                            <!--<action action-classes=\"'btn btn-action btn-danger'\"-->\n                                            <!--disabled=\"numSelected === 0 || isAdding || isEditting || isDeleting\"-->\n                                            <!--callback=\"actions.modal.deleteDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n                                            <!--<i class=\"icon icon-delete\"></i>-->\n                                            <!--<span id=\"delete-disk\">{$ ::context.action.delete $}</span>-->\n                                            <!--</action>-->\n                                            <!--</action-list>-->\n                                            <div class=\"fr search-bar\">\n                                                <hz-magic-search-bar id=\"search\"></hz-magic-search-bar>\n                                            </div>\n                                        </div>\n                                    </th>\n                                </tr>\n                                <tr eagle-eye=\"table_heads\">\n                                    <th class=\"select-col\" eagle-eye=\"select_col\">\n                                        <input id=\"disks_all_checkbox\" type=\"checkbox\" hz-select-page=\"disks\"\n                                               ng-disabled=\"isAdding || isEditting || isDeleting\"/>\n                                    </th>\n                                    <th><span st-sort=\"disk.devid\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.diskID $}</span>\n                                    </th>\n                                    <th><span st-sort=\"disk.path\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.diskPath $}</span></th>\n                                    <th><span st-sort=\"disk.total\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.diskCapacity $}</span></th>\n                                    <th><span st-sort=\"disk.osdName\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.diskOSDName $}</span></th>\n                                    <th><span st-sort=\"disk.updated_at\"\n                                              eagle-eye=\"data_col\">{$ ::context.header.diskUpdatedTime $}</span></th>\n                                </tr>\n                                </thead>\n                                <tbody>\n                                <tr ng-if=\"!diskState\">\n                                    <td colspan=\"100\" class=\"Loading-bar\"><img class=\"load-detail\"\n                                                                               src=\"/static/bootstrap/img/loading.gif\"\n                                                                               alt=\"\"/></td>\n                                </tr>\n                                <tr ng-if=\"!idisks.length && diskState\">\n                                    <td colspan=\"100\" eagle-eye=\"empty_table\">{$ ::context.header.nodata $}</td>\n                                </tr>\n                                <tr ng-repeat=\"disk in idisks\" ng-class=\"{'st-selected': checked[disk.id]}\">\n                                    <td class=\"select-col\" eagle-eye=\"select_col\">\n                                        <input type=\"checkbox\"\n                                               hz-select=\"disk\"\n                                               ng-model=\"selected[disk.id].checked\"\n                                               hz-checkbox-group=\"disks\"\n                                               ng-disabled=\"isAdding || isEditting || isDeleting\"/>\n                                    </td>\n                                    <td eagle-eye=\"data_col\">{$ disk.disk.devid $}</td>\n                                    <td eagle-eye=\"data_col\">{$ disk.disk.path $}</td>\n                                    <td eagle-eye=\"data_col\">\n                                        {$ disk.disk.used | formatUnit $} /\n                                        <span class=\"unit\">{$ disk.disk.total | formatUnit$}</span>\n                                    <td eagle-eye=\"data_col\">{$ disk.disk.osdName $}</td>\n                                    <td eagle-eye=\"data_col\">{$ disk.disk.updated_at $}</td>\n                                </tr>\n                                <tr ng-if=\"isAdding\">\n                                    <td colspan=\"100\" class=\"Loading-bar\">\n                                        {$ ::context.header.adding $}<img class=\"load-detail\"\n                                                                          src=\"/static/bootstrap/img/loading.gif\"\n                                                                          alt=\"\"/>\n                                    </td>\n                                </tr>\n                                <tr ng-if=\"isEditting\">\n                                    <td colspan=\"100\" class=\"Loading-bar\">\n                                        {$ ::context.header.editting $}<img class=\"load-detail\"\n                                                                            src=\"/static/bootstrap/img/loading.gif\"\n                                                                            alt=\"\"/>\n                                    </td>\n                                </tr>\n                                <tr ng-if=\"isDeleting\">\n                                    <td colspan=\"100\" class=\"Loading-bar\">\n                                        {$ ::context.header.deleting $}<img class=\"load-detail\"\n                                                                            src=\"/static/bootstrap/img/loading.gif\"\n                                                                            alt=\"\"/>\n                                    </td>\n                                </tr>\n                                </tbody>\n                                <tfoot ng-if=\"disks.length > 10\">\n                                <tr>\n                                    <td colspan=\"100\" eagle-eye=\"data_page\">\n                                        <table-footer></table-footer>\n                                    </td>\n                                </tr>\n                                </tfoot>\n                                <!--<tfoot id=\"disks_pagination\" ng-show=\"showPagination()\">\n                                    <tr>\n                                        <td colspan=\"100\" class=\"text-center\">\n                                            <style>\n                                                .pagination {\n                                                    display: inline-block;\n                                                }\n                                            </style>\n                                            <div st-pagination=\"\" st-items-by-page=\"10\" st-displayed-pages=\"20\" ></div>\n                                        </td>\n                                    </tr>\n                                </tfoot>-->\n                            </table>\n                        </hz-magic-search-context>\n                    </div>\n                </div>\n            </tab>\n        </tabset>\n    </div>\n</div>";

/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var cephHostDetailController = function () {
	    cephHostDetailController.$inject = ["scope", "modalInstance", "hostService", "inHostData", "modalAction", "toastService"];
	    function cephHostDetailController(scope, modalInstance, hostService, inHostData, modalAction, toastService) {
	        _classCallCheck(this, cephHostDetailController);

	        var self = this;

	        self.hostService = hostService;
	        self.inHostData = inHostData;
	        this.toastService = toastService;

	        var h = $(window).height();
	        var w = Math.max(350, $(window).width() / 8 * 4);

	        scope.action = {
	            submit: function submit() {
	                modalInstance.close();
	            },
	            cancel: function cancel() {
	                $('.detailContent').stop();
	                $('.detailContent').animate({
	                    right: -(w + 40)
	                }, 400, function () {
	                    modalInstance.dismiss('cancel');
	                });
	            }
	        };
	        scope.context = {
	            header: {
	                title: gettext('General Information'),
	                servername: gettext('Server Name'),
	                publicip: gettext('Public IP'),
	                clusterip: gettext('Cluster IP'),
	                role: gettext('Role'),
	                status: gettext('Status'),
	                cpuUtilization: gettext('CPU Utilization'),
	                memoryUtilization: gettext('Memory Utilization'),
	                nodata: gettext('No DATA'),
	                osd: gettext('OSDs'),
	                disk: gettext('Disks'),
	                detail: gettext('Detail'),

	                osdName: gettext('Name'),
	                osdStatus: gettext('Status'),
	                osdUsedCapacity: gettext('Used Capacity'),
	                osdAvailableCapacity: gettext('Available Capacity'),
	                osdActiveTime: gettext('Active Time'),
	                osdUpdatedTime: gettext('Updated Time'),

	                diskID: gettext('Device ID'),
	                diskPath: gettext('Disk Path'),
	                diskCapacity: gettext('Disk Capacity'),
	                diskOSDName: gettext('OSD Name'),
	                diskUpdatedTime: gettext('Updatetime'),

	                adding: gettext('Adding...'),
	                editting: gettext('Editting...'),
	                deleting: gettext('Deleting...')
	            },
	            action: {
	                create: gettext('Add Port Mapping'),
	                edit: gettext('Edit'),
	                delete: gettext('Delete Port Mapping')
	            }
	        };
	        scope.actions = {
	            refresh: this.refresh.bind(this, scope),
	            modal: new modalAction(scope)
	        };
	        scope.filterFacets = [{
	            label: gettext('Name'),
	            name: 'osd.osdName',
	            singleton: true
	        }, {
	            label: gettext('Status'),
	            name: 'osd.Status',
	            singleton: true
	        }, {
	            label: gettext('Used Capacity'),
	            name: 'osd.used',
	            singleton: true
	        }, {
	            label: gettext('Available Capacity'),
	            name: 'osd.avail',
	            singleton: true
	        }, {
	            label: gettext('Active Name'),
	            name: 'osd.activetime',
	            singleton: true
	        }, {
	            label: gettext('Modified Name'),
	            name: 'osd.updated_at',
	            singleton: true
	        }];
	        scope.diskfilterFacets = [{
	            label: gettext('Device ID'),
	            name: 'disk.devid',
	            singleton: true
	        }, {
	            label: gettext('Disk Path'),
	            name: 'disk.path',
	            singleton: true
	        }, {
	            label: gettext('Disk Capacity'),
	            name: 'disk.total',
	            singleton: true
	        }, {
	            label: gettext('OSD Name'),
	            name: 'disk.osdid',
	            singleton: true
	        }, {
	            label: gettext('Updatetime'),
	            name: 'disk.updated_at',
	            singleton: true
	        }];

	        scope.$watch('scope.switchData', function () {
	            $('.detailContent').css({
	                height: h,
	                width: w,
	                right: -w
	            });
	            $('.detailContent .tab-content').css({
	                height: h - 62
	            });
	            $('.detailContent').stop();
	            $('.detailContent').animate({
	                right: 0
	            }, 400).css('overflow', 'visible');
	        });

	        self.init(scope);
	    }

	    _createClass(cephHostDetailController, [{
	        key: 'init',
	        value: function init(scope) {
	            var self = this;
	            self.refresh(scope);

	            scope.isAdding = false;
	            scope.isEditting = false;
	            scope.isDeleting = false;

	            scope.inHostData = self.inHostData;
	        }
	    }, {
	        key: 'reset',
	        value: function reset(scope) {
	            scope.inodes = [];
	            scope.nodes = [];
	            scope.nodeState = false;

	            scope.idisks = [];
	            scope.disks = [];
	            scope.diskState = false;

	            scope.switchData = {};
	            scope.switchHostname = "";

	            if (scope.selectedData) {
	                scope.selectedData.aData = [];
	            }
	        }
	    }, {
	        key: 'refresh',
	        value: function refresh(scope) {
	            var self = this;
	            self.reset(scope);
	            // switchAPI.getSwitch(inSwitchData.uuid, inSwitchData.pmswitch_id)
	            //     .success(function (data) {
	            //         scope.switchData = data;
	            //         scope.switchHostname = inSwitchData.hostname;

	            //         ////////////////////mock/////////////////////////////////
	            //         //if (!scope.switchData.rest_tcp_port) {
	            //         //    scope.switchData.rest_tcp_port = '443';
	            //         //}
	            //         ////////////////////mock/////////////////////////////////
	            //     });

	            self.hostService.getServerOsdList('/api/storage/clusters/' + self.inHostData.clusterid + '/servers/' + self.inHostData.id + '/osds/').success(function (response) {

	                //scope.$broadcast('hzTable:rowReset');
	                angular.element('#nodes_all_checkbox').scope().specialReset();

	                var temp_count_id = 0;
	                angular.forEach(response.data, function (value, key) {
	                    temp_count_id++;
	                    scope.nodes.push({ id: temp_count_id, osd: value });
	                    //scope.nodes.push({ nodename: key, port: value });
	                });

	                scope.nodeState = true;
	                self.hostService.getServerDiskList('/api/storage/clusters/' + self.inHostData.clusterid + '/servers/' + self.inHostData.id + '/disks/').success(function (response) {

	                    //scope.$broadcast('hzTable:rowReset');
	                    angular.element('#disks_all_checkbox').scope().specialReset();

	                    var temp_count_id = 0;
	                    var osdNameTemp;
	                    // response.data=[{osdid:4},{osdid:5},{osdid:6}]
	                    angular.forEach(response.data, function (value, key) {
	                        temp_count_id++;
	                        osdNameTemp = scope.nodes.filter(function (item) {
	                            return item.osd.osdId == value.osdid;
	                        });
	                        // console.log(scope.nodes)
	                        // console.log(osdNameTemp)
	                        value = Object.assign({}, value, { osdName: osdNameTemp[0].osd.osdName });
	                        scope.disks.push({ id: temp_count_id, disk: value });
	                        //scope.nodes.push({ nodename: key, port: value });
	                    });

	                    scope.diskState = true;
	                    //angular.element('#nodes_all_checkbox').prop('checked', false);
	                }.bind(this)).error(function (err) {
	                    toastService.add('error', gettext('Unable to get ceph Disks info'));
	                }.bind(this));
	                //angular.element('#nodes_all_checkbox').prop('checked', false);
	            }.bind(this)).error(function (err) {
	                toastService.add('error', gettext('Unable to get ceph Osds info'));
	            });
	        }
	    }, {
	        key: 'showPagination',
	        value: function showPagination(scope) {
	            // get $$childHead first and then iterate that scope's $$nextSiblings
	            var parentScope = angular.element('#nodes_pagination').scope();

	            for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
	                if (cs.pages && cs.pages.length > 1) {
	                    return true;
	                }
	            }
	            return false;
	        }
	    }]);

	    return cephHostDetailController;
	}();

	cephHostDetailController.$inject = ['$scope', '$modalInstance', 'hostService', 'hostData', 'lenovoNetworkSwitchesAction', 'horizon.framework.widgets.toast.service'];

	;

	angular.module('hz.dashboard.lenovo.network_switches').controller('ceph.host.detail.controller', cephHostDetailController);

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = "<hz-magic-search-context filter-facets=\"filterFacets\">\n    <table id=\"network_hosts_list\" hz-table ng-cloak hopes-table-drag\n           st-table=\"ihosts\"\n           st-safe-src=\"hosts\"\n           ng-init=\"userID = '{{ request.user.id }}'\"\n           disabled=\"disabled\"\n           st-magic-search\n           class=\"table table-bordered table-hover\">\n        <thead>\n        <tr>\n            <th colspan=\"100\" class=\"bare\">\n                <div class=\"table_actions clearfix\">\n                    <action-list class=\"btn-addon\">\n                        <action action-classes=\"'btn btn-default btn-sm'\"\n                                callback=\"actions.refresh\"\n                                disabled=\"isAdding || isEditting || isDeleting\">\n                            <i class=\"icon icon-refresh\"></i>\n                            <span id=\"refresh\"></span>\n                        </action>\n                    </action-list>\n                    <!--<action-list>\n                        <action action-classes=\"'btn btn-primary btn-action'\"\n                                callback=\"actions.modal.createSwitch\"\n                                disabled=\"isAdding || isEditting || isDeleting\">\n                            <i class=\"icon icon-add\"></i>\n                            <span id=\"create-switch\">{$ ::context.action.create $}</span>\n                        </action>\n                    </action-list>\n                    <action-list>\n                        <action action-classes=\"'btn btn-action btn-primary'\"\n                                disabled=\"numSelected !== 1 || isAdding || isEditting || isDeleting\"\n                                callback=\"actions.modal.editSwitch\" item=\"selectedData.aData\">\n                            <i class=\"icon icon-edit\"></i>\n                            <span id=\"edit-switch\">{$ ::context.action.edit $}</span>\n                        </action>\n                    </action-list>\n                    <action-list>\n                        <action action-classes=\"'btn btn-action btn-danger'\"\n                                disabled=\"numSelected === 0 || isAdding || isEditting || isDeleting\"\n                                callback=\"actions.modal.deleteSwitch\" item=\"selectedData.aData\">\n                            <i class=\"icon icon-delete\"></i>\n                            <span id=\"delete-switch\">{$ ::context.action.delete $}</span>\n                        </action>\n                    </action-list>-->\n                    <div class=\"fr search-bar\">\n                        <hz-magic-search-bar id=\"search\"></hz-magic-search-bar>\n                    </div>\n                </div>\n            </th>\n        </tr>\n        <tr eagle-eye=\"table_heads\">\n            <!--<th class=\"select-col\" eagle-eye=\"select_col\">-->\n                <!--<input id=\"hosts_all_checkbox\" type=\"checkbox\" hz-select-page=\"hosts\"-->\n                       <!--ng-disabled=\"isAdding || isEditting || isDeleting\"/>-->\n            <!--</th>-->\n            <th><span st-sort=\"servername\" eagle-eye=\"data_col\">{$ ::context.header.serverName $}</span></th>\n            <th><span st-sort=\"publicip\" eagle-eye=\"data_col\">{$ ::context.header.publicIp $}</span></th>\n            <th><span st-sort=\"clusterip\" eagle-eye=\"data_col\">{$ ::context.header.clusterIp $}</span></th>\n            <th><span st-sort=\"cpuUsage\" eagle-eye=\"data_col\">{$ ::context.header.role $}</span></th>\n            <th><span st-sort=\"status\" eagle-eye=\"data_col\">{$ ::context.header.Status $}</span></th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr ng-if=\"!hostState\">\n            <td colspan=\"100\" class=\"Loading-bar\"><img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\"\n                                                       alt=\"\"/></td>\n        </tr>\n        <tr ng-if=\"!ihosts.length && hostState\">\n            <td colspan=\"100\" eagle-eye=\"empty_table\">{$ ::context.header.nodata $}</td>\n        </tr>\n        <tr ng-repeat=\"host in ihosts\" ng-class=\"{'st-selected': checked[host.id]}\">\n            <!--<td class=\"select-col\" eagle-eye=\"select_col\">-->\n                <!--<input type=\"checkbox\"-->\n                       <!--hz-select=\"host\"-->\n                       <!--ng-model=\"selected[host.id].checked\"-->\n                       <!--hz-checkbox-group=\"hosts\"-->\n                       <!--ng-disabled=\"isAdding || isEditting || isDeleting\"/>-->\n            <!--</td>-->\n            <!--<td eagle-eye=\"data_col\">\n                <a ng-click=\"actions.modal.openDetail(host)\" href=\"javascript:;\">\n                    {$ host.ip $}\n                </a>\n            </td>-->\n            <td eagle-eye=\"data_col\">\n                <a ng-click=\"actions.\n                    modal.openDetail(host)\" href=\"javascript:;\">\n                    {$ host.servername $}\n                </a>\n            </td>\n            <td eagle-eye=\"data_col\">{$ host.publicip $}</td>\n            <td eagle-eye=\"data_col\">{$ host.clusterip $}</td>\n            <td eagle-eye=\"data_col\">{$ host.mons[0]?\"MON\":\"\" + host.mons[0]&&host.osds[0]?\"/\":\"\" + host.osds[0]?\"OSD\":\"\" $}</td>\n            <td eagle-eye=\"data_col\">{$ host.status == 1 ? 'Up' :'Down' $}</td>\n        </tr>\n        <!--<tr ng-if=\"isAdding\">\n            <td colspan=\"100\" class=\"Loading-bar\">\n                {$ ::context.header.adding $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />\n            </td>\n        </tr>\n        <tr ng-if=\"isEditting\">\n            <td colspan=\"100\" class=\"Loading-bar\">\n                {$ ::context.header.editting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />\n            </td>\n        </tr>\n        <tr ng-if=\"isDeleting\">\n            <td colspan=\"100\" class=\"Loading-bar\">\n                {$ ::context.header.deleting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />\n            </td>\n        </tr>-->\n        </tbody>\n        <tfoot ng-if=\"hosts.length > 10\">\n        <tr>\n            <td colspan=\"100\" eagle-eye=\"data_page\">\n                <table-footer></table-footer>\n            </td>\n        </tr>\n        </tfoot>\n    </table>\n</hz-magic-search-context>";

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(27);

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	var _baseComponent = __webpack_require__(20);

	var _baseComponent2 = _interopRequireDefault(_baseComponent);

	__webpack_require__(29);

	__webpack_require__(30);

	__webpack_require__(32);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PoolController = function PoolController() {
	    _classCallCheck(this, PoolController);
	};

	var PoolPage = function (_BaseComponent) {
	    _inherits(PoolPage, _BaseComponent);

	    function PoolPage() {
	        _classCallCheck(this, PoolPage);

	        var _this = _possibleConstructorReturn(this, (PoolPage.__proto__ || Object.getPrototypeOf(PoolPage)).call(this));

	        _this.controller = __webpack_require__(29);
	        // this.controller = PoolController;
	        // this.controllerAs = 'vm'
	        _this.template = __webpack_require__(33);
	        return _this;
	    }

	    return PoolPage;
	}(_baseComponent2.default);

	angular.module(_initConfig2.default.name).directive('cephMPool', function () {
	    return new PoolPage();
	});

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(28);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(19)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../../node_modules/.0.26.2@css-loader/index.js!../../../../node_modules/.1.3.2@postcss-loader/index.js!../../../../node_modules/.4.1.1@sass-loader/index.js!./pool.scss", function() {
				var newContent = require("!!../../../../node_modules/.0.26.2@css-loader/index.js!../../../../node_modules/.1.3.2@postcss-loader/index.js!../../../../node_modules/.4.1.1@sass-loader/index.js!./pool.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(18)();
	// imports


	// module
	exports.push([module.id, "", ""]);

	// exports


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PoolTableController = function () {
	    function PoolTableController(scope, action, poolService, toastService) {
	        _classCallCheck(this, PoolTableController);

	        this.action = action;
	        this.poolService = poolService;
	        this.toastService = toastService;

	        this.init(scope);

	        scope.showPagination = function () {
	            // get $$childHead first and then iterate that scope's $$nextSiblings
	            var parentScope = angular.element('#switches_pagination').scope();

	            for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
	                if (cs.pages && cs.pages.length > 1) {
	                    return true;
	                }
	            }
	            return false;
	        };
	    }
	    //inject you want to dependencies ,and add them to constructor as pramaters above
	    //note:the order need match


	    _createClass(PoolTableController, [{
	        key: 'bindClusterId',
	        value: function bindClusterId(scope) {
	            if (scope.pools) {
	                scope.pools.forEach(function (pool) {
	                    pool['cluster_id'] = scope.cluster_id;
	                });
	            }
	        }

	        /**
	         * query cluster id
	         */

	    }, {
	        key: 'getClusterInfo',
	        value: function getClusterInfo() {
	            return this.poolService.getCluster(_initConfig2.default.host + "/api/storage/clusters/");
	        }

	        /**
	         * init page data
	         */

	    }, {
	        key: 'initData',
	        value: function initData(scope) {
	            var _this = this;

	            var self = this;
	            self.getClusterInfo().success(function (result) {

	                if (result && result.data && result.data.length > 0) {
	                    scope.cluster_id = result.data[0].id;
	                    _this.poolService.getPoolList({ cluster_id: scope.cluster_id, marker: 0, pagesize: 999 }).then(function (result) {
	                        // angular.element('#pools_all_checkbox').scope().specialReset();
	                        scope.pools = result.data.data;
	                        scope.poolState = true;
	                        _this.bindClusterId(scope);
	                    }, function (error) {
	                        toastService.add('error', gettext('Unable to get ceph Pools info'));
	                    });
	                }
	            }).error(function (err) {
	                toastService.add('error', gettext('Unable to get ceph cluster info'));
	            });
	        }
	    }, {
	        key: 'reset',
	        value: function reset(scope) {
	            var self = this;
	            scope.ipools = [];
	            scope.pools = [];
	            scope.poolState = false;

	            scope.switch = [];
	            scope.nodes = [];

	            //scope.checked = {};
	            //scope.selected = {};
	            if (scope.selectedData) {
	                scope.selectedData.aData = [];
	            }
	        }
	    }, {
	        key: 'init',
	        value: function init(scope) {
	            var self = this;
	            scope.isAdding = false;
	            scope.isEditting = false;
	            scope.isDeleting = false;

	            scope.ipools = [];
	            scope.pools = [];
	            scope.poolState = false;

	            self.setPageConfig(scope);
	            self.bindAction(scope);
	            self.initData(scope);
	        }
	    }, {
	        key: 'bindAction',
	        value: function bindAction(scope) {
	            var self = this;

	            scope.actions = {
	                refresh: self.initData.bind(this, scope),
	                modal: new self.action(scope)
	            };
	        }
	    }, {
	        key: 'setPageConfig',
	        value: function setPageConfig(scope) {
	            var self = this;
	            scope.context = {
	                header: {
	                    serverName: gettext('Pool Name'),
	                    Status: gettext('Status'),
	                    PGNumber: gettext('PG Number'),
	                    repliSize: gettext('Replication Factor'),
	                    createTime: gettext('Create Time'),
	                    updateTime: gettext('Update Time'),

	                    nodata: gettext('No DATA'),

	                    adding: gettext('Adding...'),
	                    editting: gettext('Editting...'),
	                    deleting: gettext('Deleting...')
	                },
	                action: {
	                    // create: gettext('Add Switch'),
	                    // edit: gettext('Edit'),
	                    // delete: gettext('Delete Switches')
	                },
	                error: {
	                    api: gettext('Unable to retrieve imagess'),
	                    priviledge: gettext('Insufficient privilege level to view user information.')
	                }
	            };

	            scope.filterFacets = [{
	                label: gettext('Pool Name'),
	                name: 'name',
	                singleton: true
	            }, {
	                label: gettext('PG Number'),
	                name: 'pg_num',
	                singleton: true
	            }, {
	                label: gettext('Replica Size'),
	                name: 'size',
	                singleton: true
	            }];
	        }
	    }]);

	    return PoolTableController;
	}();

	PoolTableController.$inject = ['$scope', 'ceph.pool.action', 'poolService', 'horizon.framework.widgets.toast.service'];


	module.exports = PoolTableController;
	// angular.module(config.name)
	//     .controller('PoolTableController', PoolTableController);

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('hz.dashboard.lenovo.network_switches').service('ceph.pool.action', ['$modal', 'horizon.dashboard.lenovo.network_switches.Path', 'horizon.openstack-service-api.switch', 'horizon.framework.widgets.toast.service', function (modal, path, switchAPI, toastService) {

	        var context = {};

	        //   context.title = {
	        //       "Overview": gettext("Overview"),
	        //       "Subnets": gettext("Subnets"),
	        //       "Info": gettext("Info")
	        //   };
	        //   context.label = {
	        //       "ID": gettext("ID"),
	        //       "Name": gettext("Name"),
	        //       "Project_ID": gettext("Project ID"),
	        //       "Status": gettext("Status"),
	        //       "Shared": gettext("Shared"),
	        //       "External_Network": gettext("External Network"),
	        //       "Provider_Network": gettext("Provider Network")
	        //   };

	        function action(scope) {
	            /*jshint validthis: true */
	            var self = this;
	            self.controllerScope = scope;

	            var openDetailOption = {
	                template: __webpack_require__(31),
	                controller: 'cephPoolDetailController',
	                //backdrop: false,
	                windowClass: 'detailContent',
	                resolve: {
	                    switchData: function switchData() {}
	                }
	            };

	            self.openDetail = function (switchData) {
	                openDetailOption.resolve.switchData = function () {
	                    return switchData;
	                };
	                modal.open(openDetailOption);
	            };

	            var createSwitchOption = {
	                templateUrl: path + 'switch/create/',
	                controller: 'lenovoNetworkSwitchesCreateSwitchController',
	                windowClass: 'neutronListContent',
	                resolve: {}
	            };

	            self.createSwitch = function () {
	                modal.open(createSwitchOption).result.then(self.submitCreateSwitch);
	            };

	            self.submitCreateSwitch = function (newSwitch) {
	                //console.log(newSwitch);
	                switchAPI.createSwitch(newSwitch).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully add a new switch!'));
	                    } else {
	                        toastService.add('error', gettext('Add new switch failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isAdding = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Add new switch failed.') + ' ' + data);
	                });

	                self.controllerScope.isAdding = true;
	                toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var editSwitchOption = {
	                templateUrl: path + 'switch/edit/',
	                controller: 'lenovoNetworkSwitchesEditSwitchController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {}
	                }
	            };

	            self.editSwitch = function (selectedSwitch) {
	                if (selectedSwitch || selectedSwitch.length > 0) {
	                    editSwitchOption.resolve.switchData = function () {
	                        return selectedSwitch[0];
	                    };
	                    modal.open(editSwitchOption).result.then(self.submitEditSwitch);
	                }
	            };

	            self.submitEditSwitch = function (switchEditData) {
	                //console.log(switchEditData);
	                switchAPI.editSwitch(switchEditData.switch_id, switchEditData.pmswitch_id, { username: switchEditData.username, password: switchEditData.password }).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully edit a new switch!'));
	                    } else {
	                        toastService.add('error', gettext('Edit switch failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isEditting = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Edit switch failed.') + ' ' + data);
	                });

	                self.controllerScope.isEditting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var deleteSwitchOption = {
	                templateUrl: path + 'switch/delete/',
	                controller: 'lenovoNetworkSwitchesDeleteSwitchController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchIds: function switchIds() {},
	                    switchNames: function switchNames() {}
	                }
	            };

	            self.deleteSwitch = function (switches) {
	                if (switches) {
	                    var switchIds = [];
	                    var switchNames = [];
	                    angular.forEach(switches, function (row) {
	                        switchIds.push({
	                            switch_id: row.uuid,
	                            pmswitch_id: row.pmswitch_id
	                        });
	                        switchNames.push(row.hostname);
	                    });
	                    deleteSwitchOption.resolve.switchIds = function () {
	                        return switchIds;
	                    };
	                    deleteSwitchOption.resolve.switchNames = function () {
	                        return switchNames.join(',');
	                    };
	                    modal.open(deleteSwitchOption).result.then(self.submitDeleteSwitch);
	                }
	            };

	            self.submitDeleteSwitch = function (switchIds) {
	                //console.log(switchIds);
	                var hasError = false;
	                var doneCount = 0;

	                angular.forEach(switchIds, function (switchId) {
	                    switchAPI.deleteSwitch(switchId.switch_id, switchId.pmswitch_id).success(function (data) {
	                        if (data && data.status && data.status == 'success') {} else {
	                            hasError = true;
	                            toastService.add('error', gettext('Delete switch failed.') + ' ' + data.msg);
	                        }

	                        doneCount++;
	                        if (doneCount = switchIds.length) {
	                            if (!hasError) {
	                                toastService.add('success', gettext('Successfully delete switches!'));
	                            }

	                            self.controllerScope.isDeleting = false;
	                            self.controllerScope.actions.refresh();
	                        }
	                    }).error(function (data) {
	                        hasError = true;
	                        toastService.add('error', gettext('Delete switch failed.') + ' ' + data);

	                        doneCount++;
	                        if (doneCount = switchIds.length) {
	                            if (!hasError) {
	                                toastService.add('success', gettext('Successfully delete switches!'));
	                            }

	                            self.controllerScope.isDeleting = false;
	                            self.controllerScope.actions.refresh();
	                        }
	                    });
	                });

	                self.controllerScope.isDeleting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var createDetailSwitchOption = {
	                templateUrl: path + 'detail/create/',
	                controller: 'lenovoNetworkSwitchesCreateDetailController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {}
	                }
	            };

	            self.createDetailSwitch = function (switchData) {
	                createDetailSwitchOption.resolve.switchData = function () {
	                    return switchData;
	                };
	                modal.open(createDetailSwitchOption).result.then(self.submitCreateDetailSwitch);
	            };

	            self.submitCreateDetailSwitch = function (newNode) {
	                //console.log(newNode);
	                var submitNodeData = {
	                    port_mapping: {}
	                };

	                submitNodeData["port_mapping"][newNode.nodename] = newNode.port;

	                switchAPI.createNode(newNode.switch_id, newNode.pmswitch_id, submitNodeData).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully add a new port-mapping!'));
	                    } else {
	                        toastService.add('error', gettext('Add port-mapping failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isAdding = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Add port-mapping failed.') + ' ' + data);
	                });

	                self.controllerScope.isAdding = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var editDetailSwitchOption = {
	                templateUrl: path + 'detail/edit/',
	                controller: 'lenovoNetworkSwitchesEditDetailController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {},
	                    nodeData: function nodeData() {}
	                }
	            };

	            self.editDetailSwitch = function (data) {
	                editDetailSwitchOption.resolve.switchData = function () {
	                    return data[0];
	                };
	                editDetailSwitchOption.resolve.nodeData = function () {
	                    if (data[1] || data[1].length > 0) {
	                        return data[1][0];
	                    }
	                };
	                modal.open(editDetailSwitchOption).result.then(self.submitEditDetailSwitch);
	            };

	            self.submitEditDetailSwitch = function (updateNode) {
	                //console.log(updateNode);
	                var submitNodeData = {
	                    port_mapping: {}
	                };

	                submitNodeData["port_mapping"][updateNode.nodename] = updateNode.port;

	                switchAPI.editNode(updateNode.switch_id, updateNode.pmswitch_id, submitNodeData).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully edit a new port-mapping!'));
	                    } else {
	                        toastService.add('error', gettext('Edit port-mapping failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isEditting = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Edit port-mapping failed.') + ' ' + data);
	                });

	                self.controllerScope.isEditting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };

	            var deleteDetailSwitchOption = {
	                templateUrl: path + 'detail/delete/',
	                controller: 'lenovoNetworkSwitchesDeleteDetailController',
	                windowClass: 'neutronListContent',
	                resolve: {
	                    switchData: function switchData() {},
	                    nodeNames: function nodeNames() {},
	                    nodeIds: function nodeIds() {}
	                }
	            };

	            self.deleteDetailSwitch = function (data) {
	                if (data[1] || data[1].length > 0) {
	                    var ids = [];
	                    angular.forEach(data[1], function (row) {
	                        ids.push(row.nodename);
	                    });

	                    deleteDetailSwitchOption.resolve.switchData = function () {
	                        return data[0];
	                    };
	                    deleteDetailSwitchOption.resolve.nodeNames = function () {
	                        return ids.join(',');
	                    };
	                    deleteDetailSwitchOption.resolve.nodeIds = function () {
	                        return ids;
	                    };
	                    modal.open(deleteDetailSwitchOption).result.then(self.submitDeleteDetailSwitch);
	                }
	            };

	            self.submitDeleteDetailSwitch = function (deleteData) {
	                //console.log(deleteData);
	                switchAPI.deleteNode(deleteData.switchData.uuid, deleteData.switchData.pmswitch_id, deleteData.nodes).success(function (data) {
	                    if (data && data.status && data.status == 'success') {
	                        toastService.add('success', gettext('Successfully delete port-mapping!'));
	                    } else {
	                        toastService.add('error', gettext('Delete port-mapping failed.') + ' ' + data.msg);
	                    }

	                    self.controllerScope.isDeleting = false;
	                    self.controllerScope.actions.refresh();
	                }).error(function (data) {
	                    toastService.add('error', gettext('Delete port-mapping failed.') + ' ' + data);
	                });

	                self.controllerScope.isDeleting = true;
	                //toastService.add('info', gettext('Processing... Please wait a moment'));
	            };
	        }

	        return action;
	    }]);
	})();

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = "<style>\n    .networkSwitchesDetailSpecialStyle > * {\n        margin-top: 10px;\n    }\n</style>\n<div class=\"detail-page\">\n    <div class=\"fl detail-left-icon\" ng-click=\"action.cancel()\"></div>\n    <div class=\"detail-page-con\">\n        <tabset justified=\"true\" class=\"def-tabs\">\n            <tab id=\"tab-network-connection\" heading=\"RBDs\">\n                <div class=\"tab-pane-content\">\n                    <hz-magic-search-context filter-facets=\"filterFacets\">\n                        <table id=\"rbd-detail-list\" hz-table ng-cloak hopes-table-drag\n                               st-table=\"irbds\"\n                               st-safe-src=\"rbds\"\n                               disabled=\"disabled\"\n                               st-magic-search\n                               class=\"table table-bordered table-hover\">\n                            <thead>\n                            <tr>\n                                <th colspan=\"100\" class=\"bare table-th-unline\">\n\n                                    <div class=\"table_actions clearfix\">\n                                        <action-list class=\"btn-addon\">\n                                            <action action-classes=\"'btn btn-default btn-sm'\"\n                                                    callback=\"actions.refresh\"\n                                                    disabled=\"isAdding || isEditting || isDeleting\">\n                                                <i class=\"icon icon-refresh\"></i>\n                                                <span id=\"refresh\"></span>\n                                            </action>\n                                        </action-list>\n\n                                        <!--<action-list class=\"btn-addon\">-->\n                                        <!--<action-->\n                                        <!--action-classes=\"'btn btn-primary btn-action'\"-->\n                                        <!--callback=\"actions.create.open\" item=\"sunnetId\">-->\n                                        <!--<i class=\"icon icon-add\"></i>-->\n                                        <!--<span id=\"network-create\">{$ :: ctrl.create $}</span>-->\n                                        <!--</action>-->\n                                        <!--</action-list>-->\n                                        <!--<action-list class=\"btn-addon\">-->\n                                        <!--<action-->\n                                        <!--action-classes=\"'btn btn-action btn-danger'\"-->\n                                        <!--disabled=\"numSelected === 0\"-->\n                                        <!--callback=\"actions.deleted.batchDelete\">-->\n                                        <!--<i class=\"icon icon-delete\"></i>-->\n                                        <!--<span id=\"network-delete\">{$ ctrl.delete $}</span>-->\n                                        <!--</action>-->\n                                        <!--</action-list>-->\n\n                                        <!--<action-list dropdown>-->\n                                        <!--<button id=\"network-more\" type=\"button\" class=\"btn btn-primary btn-action\" dropdown-toggle>-->\n                                        <!--<i class=\"icon icon-more\"></i>-->\n                                        <!--<span>{% trans \"More\" %}</span>-->\n                                        <!--</button>-->\n                                        <!--<menu>-->\n                                        <!--<action-->\n                                        <!--button-type=\"menu-item\"-->\n                                        <!--disabled=\"disabled\"-->\n                                        <!--callback=\"actions.edit.open\" item=\"selectedData.aData\">-->\n                                        <!--<span id=\"network-edit\">{$ :: ctrl.edit $}</span>-->\n                                        <!--</action>-->\n                                        <!--</menu>-->\n                                        <!--</action-list>-->\n\n\n                                        <div class=\"fr search-bar\">\n                                            <hz-magic-search-bar id=\"search\"></hz-magic-search-bar>\n                                        </div>\n\n                                    </div>\n                                </th>\n                            </tr>\n                            <tr eagle-eye=\"table_heads\">\n                                <th class=\"select-col\" eagle-eye=\"select_col\">\n                                    <input id=\"rbds_all_checkbox\" type=\"checkbox\" hz-select-page=\"rbds\"\n                                           ng-disabled=\"isAdding || isEditting || isDeleting\"/>\n                                </th>\n                                <th st-sort=\"name\" eagle-eye=\"data_col\">{$ ::context.header.imageName $}</th>\n                                <th st-sort=\"capacity\" eagle-eye=\"data_col\">{$ ::context.header.size $}</th>\n                                <th st-sort=\"usedsize\" eagle-eye=\"data_col\">{$ ::context.header.objectCount $}</th>\n                                <th st-sort=\"createtime\" eagle-eye=\"data_col\">{$ ::context.header.createTime $}</th>\n                                <th st-sort=\"modifytime\" eagle-eye=\"data_col\">{$ ::context.header.modifyTime $}</th>\n                            </tr>\n                            </thead>\n\n                            <tbody>\n                            <tr ng-if=\"!rbdState\">\n                                <td colspan=\"100\" class=\"Loading-bar\"><img class=\"load-detail\"\n                                                                           src=\"/static/bootstrap/img/loading.gif\"\n                                                                           alt=\"\"/></td>\n                            </tr>\n                            <tr ng-if=\"!rbds.length && rbdState\">\n                                <td colspan=\"100\" eagle-eye=\"empty_table\">{$ ::context.header.nodata $}</td>\n                            </tr>\n                            <tr ng-repeat=\"rbd in irbds\" ng-class=\"{'st-selected': checked[rbd.id]}\">\n                                <td class=\"select-col\" eagle-eye=\"select_col\">\n                                    <input type=\"checkbox\"\n                                           hz-select=\"rbd\"\n                                           ng-model=\"selected[rbd.id].checked\"\n                                           hz-checkbox-group=\"rbds\"\n                                           ng-disabled=\"isAdding || isEditting || isDeleting\"/>\n                                </td>\n\n                                <td eagle-eye=\"data_col\" title=\"{$ rbd.name $}\">{$ rbd.name $}</td>\n                                <td eagle-eye=\"data_col\">\n                                    {$ rbd.usedsize | formatUnit $} /\n                                    <span class=\"unit\">{$ rbd.capacity | formatUnit$}</span>\n                                </td>\n                                <td eagle-eye=\"data_col\">{$ rbd.objects $}</td>\n                                <td eagle-eye=\"data_col\">{$ rbd.created_at $}</td>\n                                <td eagle-eye=\"data_col\">{$ rbd.updated_at $}</td>\n                            </tr>\n                            </tbody>\n\n                            <tfoot ng-if=\"safeSubnets.length > 10\">\n                            <tr>\n                                <td colspan=\"100\" eagle-eye=\"data_page\">\n                                    <table-footer></table-footer>\n                                </td>\n                            </tr>\n                            </tfoot>\n                        </table>\n                    </hz-magic-search-context>\n                </div>\n            </tab>\n\n\n            <!--<tab id=\"switch_deail\" heading='{% trans \"Detail\" %}'>-->\n            <!--<div class=\"tab-pane-content\">-->\n            <!--<table class=\"table table-bordered table-hover table-unique\">-->\n            <!--<thead>-->\n            <!--<tr>-->\n            <!--<th colspan=\"100\">-->\n            <!--<span class=\"detail-title\">{$ ::context.header.title $}</span>-->\n            <!--</th>-->\n            <!--</tr>-->\n            <!--</thead>-->\n            <!--<tbody>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.servername $}</td>-->\n            <!--<td>{$ switchHostname $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.publicip $}</td>-->\n            <!--<td>{$ switchData.ip $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.clusterip $}</td>-->\n            <!--<td>{$ switchData.username $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.role $}</td>-->\n            <!--<td>{$ switchData.protocol $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.status $}</td>-->\n            <!--<td>{$ switchData.mac $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.cpuUtilization $}</td>-->\n            <!--<td>{$ switchData.serialNum $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.memoryUtilization $}</td>-->\n            <!--<td>{$ switchData.cpu $}</td>-->\n            <!--</tr>-->\n            <!--&lt;!&ndash;<tr>-->\n            <!--<td>{$ ::context.header.memory $}</td>-->\n            <!--<td>{$ switchData.memory $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.osType $}</td>-->\n            <!--<td>{$ switchData.os_type| uppercase $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.osVersion $}</td>-->\n            <!--<td>{$ switchData.osVer $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.sshPort $}</td>-->\n            <!--<td>{$ switchData.ssh_port $}</td>-->\n            <!--</tr>-->\n            <!--<tr>-->\n            <!--<td>{$ ::context.header.restPort $}</td>-->\n            <!--<td>{$ switchData.rest_tcp_port $}</td>-->\n            <!--</tr>&ndash;&gt;-->\n            <!--</tbody>-->\n            <!--</table>-->\n            <!--</div>-->\n            <!--</tab>-->\n            <!--<tab id=\"node_list\" heading='{% trans \"OSDs\" %}'>-->\n            <!--<div class=\"tab-content\" style=\"border:0;\">-->\n            <!--<div class=\"tab-pane-content\">-->\n            <!--<hz-magic-search-context id=\"givemefive\" filter-facets=\"filterFacets\">-->\n            <!--<table id=\"nodelist\" hz-table ng-cloak hopes-table-drag-->\n            <!--st-table=\"inodes\"-->\n            <!--st-safe-src=\"nodes\"-->\n            <!--disabled=\"disabled\"-->\n            <!--st-magic-search-->\n            <!--class=\"table table-bordered table-hover\">-->\n            <!--<thead>-->\n            <!--<tr id=\"givemefive2\">-->\n            <!--<th colspan=\"100\" class=\"bare\">-->\n            <!--<div class=\"table_actions clearfix\">-->\n            <!--<action-list class=\"btn-addon\">-->\n            <!--<action action-classes=\"'btn btn-default btn-sm'\"-->\n            <!--callback=\"actions.refresh\"-->\n            <!--disabled=\"isAdding || isEditting || isDeleting\">-->\n            <!--<i class=\"icon icon-refresh\"></i>-->\n            <!--<span id=\"refresh\"></span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<action-list>-->\n            <!--<action action-classes=\"'btn btn-primary btn-action'\"-->\n            <!--callback=\"actions.modal.createDetailSwitch\" item=\"switchData\"-->\n            <!--disabled=\"isAdding || isEditting || isDeleting\">-->\n            <!--<i class=\"icon icon-add\"></i>-->\n            <!--<span id=\"create-node\">{$ ::context.action.create $}</span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<action-list>-->\n            <!--<action action-classes=\"'btn btn-action btn-primary'\"-->\n            <!--disabled=\"numSelected !== 1 || isAdding || isEditting || isDeleting\"-->\n            <!--callback=\"actions.modal.editDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n            <!--<i class=\"icon icon-edit\"></i>-->\n            <!--<span id=\"edit-node\">{$ ::context.action.edit $}</span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<action-list>-->\n            <!--<action action-classes=\"'btn btn-action btn-danger'\"-->\n            <!--disabled=\"numSelected === 0 || isAdding || isEditting || isDeleting\"-->\n            <!--callback=\"actions.modal.deleteDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n            <!--<i class=\"icon icon-delete\"></i>-->\n            <!--<span id=\"delete-node\">{$ ::context.action.delete $}</span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<div class=\"fr search-bar\">-->\n            <!--<hz-magic-search-bar id=\"search\"></hz-magic-search-bar>-->\n            <!--</div>-->\n            <!--</div>-->\n            <!--</th>-->\n            <!--</tr>-->\n            <!--<tr eagle-eye=\"table_heads\">-->\n            <!--<th class=\"select-col\" eagle-eye=\"select_col\">-->\n            <!--<input id=\"nodes_all_checkbox\" type=\"checkbox\" hz-select-page=\"nodes\" ng-disabled=\"isAdding || isEditting || isDeleting\" />-->\n            <!--</th>-->\n            <!--<th><span st-sort=\"node\" eagle-eye=\"data_col\">{$ ::context.header.osdName $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdStatus $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdUsedCapacity $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdAvailableCapacity $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdActiveTime $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdUpdatedTime $}</span></th>-->\n            <!--</tr>-->\n            <!--</thead>-->\n            <!--<tbody>-->\n            <!--<tr ng-repeat=\"node in inodes\" ng-class=\"{'st-selected': checked[node.id]}\">-->\n            <!--<td class=\"select-col\" eagle-eye=\"select_col\">-->\n            <!--<input type=\"checkbox\"-->\n            <!--hz-select=\"node\"-->\n            <!--ng-model=\"selected[node.id].checked\"-->\n            <!--hz-checkbox-group=\"nodes\"-->\n            <!--ng-disabled=\"isAdding || isEditting || isDeleting\" />-->\n            <!--</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.osd.osdName $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.osd.osdStatus $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--</tr>-->\n            <!--<tr ng-if=\"isAdding\">-->\n            <!--<td colspan=\"100\" class=\"Loading-bar\">-->\n            <!--{$ ::context.header.adding $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--<tr ng-if=\"isEditting\">-->\n            <!--<td colspan=\"100\" class=\"Loading-bar\">-->\n            <!--{$ ::context.header.editting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--<tr ng-if=\"isDeleting\">-->\n            <!--<td colspan=\"100\" class=\"Loading-bar\">-->\n            <!--{$ ::context.header.deleting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--</tbody>-->\n            <!--<tfoot ng-if=\"nodes.length > 10\">-->\n            <!--<tr>-->\n            <!--<td colspan=\"100\" eagle-eye=\"data_page\">-->\n            <!--<table-footer></table-footer>-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--</tfoot>-->\n            <!--&lt;!&ndash;<tfoot id=\"nodes_pagination\" ng-show=\"showPagination()\">-->\n            <!--<tr>-->\n            <!--<td colspan=\"100\" class=\"text-center\">-->\n            <!--<style>-->\n            <!--.pagination {-->\n            <!--display: inline-block;-->\n            <!--}-->\n            <!--</style>-->\n            <!--<div st-pagination=\"\" st-items-by-page=\"10\" st-displayed-pages=\"20\" ></div>-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--</tfoot>&ndash;&gt;-->\n            <!--</table>-->\n            <!--</hz-magic-search-context>-->\n            <!--</div>-->\n            <!--</div>-->\n            <!--</tab>-->\n\n            <!--<tab id=\"\" heading='{% trans \"\"Disks %}'>-->\n            <!--<div class=\"tab-content\" style=\"border:0;\">-->\n            <!--<div class=\"tab-pane-content\">-->\n            <!--<hz-magic-search-context id=\"\" filter-facets=\"diskfilterFacets\">-->\n            <!--<table id=\"nodelist\" hz-table ng-cloak hopes-table-drag-->\n            <!--st-table=\"inodes\"-->\n            <!--st-safe-src=\"nodes\"-->\n            <!--disabled=\"disabled\"-->\n            <!--st-magic-search-->\n            <!--class=\"table table-bordered table-hover\">-->\n            <!--<thead>-->\n            <!--<tr id=\"givemefive2\">-->\n            <!--<th colspan=\"100\" class=\"bare\">-->\n            <!--<div class=\"table_actions clearfix\">-->\n            <!--<action-list class=\"btn-addon\">-->\n            <!--<action action-classes=\"'btn btn-default btn-sm'\"-->\n            <!--callback=\"actions.refresh\"-->\n            <!--disabled=\"isAdding || isEditting || isDeleting\">-->\n            <!--<i class=\"icon icon-refresh\"></i>-->\n            <!--<span id=\"refresh\"></span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<action-list>-->\n            <!--<action action-classes=\"'btn btn-primary btn-action'\"-->\n            <!--callback=\"actions.modal.createDetailSwitch\" item=\"switchData\"-->\n            <!--disabled=\"isAdding || isEditting || isDeleting\">-->\n            <!--<i class=\"icon icon-add\"></i>-->\n            <!--<span id=\"create-node\">{$ ::context.action.create $}</span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<action-list>-->\n            <!--<action action-classes=\"'btn btn-action btn-primary'\"-->\n            <!--disabled=\"numSelected !== 1 || isAdding || isEditting || isDeleting\"-->\n            <!--callback=\"actions.modal.editDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n            <!--<i class=\"icon icon-edit\"></i>-->\n            <!--<span id=\"edit-node\">{$ ::context.action.edit $}</span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<action-list>-->\n            <!--<action action-classes=\"'btn btn-action btn-danger'\"-->\n            <!--disabled=\"numSelected === 0 || isAdding || isEditting || isDeleting\"-->\n            <!--callback=\"actions.modal.deleteDetailSwitch\" item=\"[switchData, selectedData.aData]\">-->\n            <!--<i class=\"icon icon-delete\"></i>-->\n            <!--<span id=\"delete-node\">{$ ::context.action.delete $}</span>-->\n            <!--</action>-->\n            <!--</action-list>-->\n            <!--<div class=\"fr search-bar\">-->\n            <!--<hz-magic-search-bar id=\"search\"></hz-magic-search-bar>-->\n            <!--</div>-->\n            <!--</div>-->\n            <!--</th>-->\n            <!--</tr>-->\n            <!--<tr eagle-eye=\"table_heads\">-->\n            <!--<th class=\"select-col\" eagle-eye=\"select_col\">-->\n            <!--<input id=\"nodes_all_checkbox\" type=\"checkbox\" hz-select-page=\"nodes\" ng-disabled=\"isAdding || isEditting || isDeleting\" />-->\n            <!--</th>-->\n            <!--<th><span st-sort=\"node\" eagle-eye=\"data_col\">{$ ::context.header.osdName $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdStatus $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdUsedCapacity $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdAvailableCapacity $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdActiveTime $}</span></th>-->\n            <!--<th><span st-sort=\"port\" eagle-eye=\"data_col\">{$ ::context.header.osdUpdatedTime $}</span></th>-->\n            <!--</tr>-->\n            <!--</thead>-->\n            <!--<tbody>-->\n            <!--<tr ng-repeat=\"node in inodes\" ng-class=\"{'st-selected': checked[node.id]}\">-->\n            <!--<td class=\"select-col\" eagle-eye=\"select_col\">-->\n            <!--<input type=\"checkbox\"-->\n            <!--hz-select=\"node\"-->\n            <!--ng-model=\"selected[node.id].checked\"-->\n            <!--hz-checkbox-group=\"nodes\"-->\n            <!--ng-disabled=\"isAdding || isEditting || isDeleting\" />-->\n            <!--</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.osd.osdName $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.osd.osdStatus $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--<td eagle-eye=\"data_col\">{$ node.port $}</td>-->\n            <!--</tr>-->\n            <!--<tr ng-if=\"isAdding\">-->\n            <!--<td colspan=\"100\" class=\"Loading-bar\">-->\n            <!--{$ ::context.header.adding $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--<tr ng-if=\"isEditting\">-->\n            <!--<td colspan=\"100\" class=\"Loading-bar\">-->\n            <!--{$ ::context.header.editting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--<tr ng-if=\"isDeleting\">-->\n            <!--<td colspan=\"100\" class=\"Loading-bar\">-->\n            <!--{$ ::context.header.deleting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--</tbody>-->\n            <!--<tfoot ng-if=\"nodes.length > 10\">-->\n            <!--<tr>-->\n            <!--<td colspan=\"100\" eagle-eye=\"data_page\">-->\n            <!--<table-footer></table-footer>-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--</tfoot>-->\n            <!--&lt;!&ndash;<tfoot id=\"nodes_pagination\" ng-show=\"showPagination()\">-->\n            <!--<tr>-->\n            <!--<td colspan=\"100\" class=\"text-center\">-->\n            <!--<style>-->\n            <!--.pagination {-->\n            <!--display: inline-block;-->\n            <!--}-->\n            <!--</style>-->\n            <!--<div st-pagination=\"\" st-items-by-page=\"10\" st-displayed-pages=\"20\" ></div>-->\n            <!--</td>-->\n            <!--</tr>-->\n            <!--</tfoot>&ndash;&gt;-->\n            <!--</table>-->\n            <!--</hz-magic-search-context>-->\n            <!--</div>-->\n            <!--</div>-->\n            <!--</tab>-->\n        </tabset>\n    </div>\n</div>";

/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var cephPoolDetailController = function () {
	    cephPoolDetailController.$inject = ["scope", "modalInstance", "poolService", "inSwitchData", "modalAction", "toastService"];
	    function cephPoolDetailController(scope, modalInstance, poolService, inSwitchData, modalAction, toastService) {
	        _classCallCheck(this, cephPoolDetailController);

	        var self = this;

	        self.poolService = poolService;
	        self.inSwitchData = inSwitchData;
	        this.toastService = toastService;

	        var h = $(window).height();
	        var w = Math.max(350, $(window).width() / 8 * 4);

	        scope.action = {
	            submit: function submit() {
	                modalInstance.close();
	            },
	            cancel: function cancel() {
	                $('.detailContent').stop();
	                $('.detailContent').animate({
	                    right: -(w + 40)
	                }, 400, function () {
	                    modalInstance.dismiss('cancel');
	                });
	            }
	        };

	        scope.context = {
	            header: {
	                imageName: gettext('Name'),
	                size: gettext('Size'),
	                objectCount: gettext('Object Count'),
	                createTime: gettext('Create Time'),
	                modifyTime: gettext('ModifyTime'),
	                nodata: gettext('No DATA'),

	                adding: gettext('Adding...'),
	                editting: gettext('Editting...'),
	                deleting: gettext('Deleting...')
	            },
	            action: {
	                create: gettext('Add Port Mapping'),
	                edit: gettext('Edit'),
	                delete: gettext('Delete Port Mapping')
	            }
	        };
	        scope.actions = {
	            refresh: this.refresh.bind(self, scope),
	            modal: new modalAction(scope)
	        };
	        scope.filterFacets = [{
	            label: gettext('ImageName'),
	            name: 'name',
	            singleton: true
	        }, {
	            label: gettext('Size'),
	            name: 'capacity',
	            singleton: true
	        }, {
	            label: gettext('Object Count'),
	            name: 'objects',
	            singleton: true
	        }];

	        scope.showPagination = function () {
	            // get $$childHead first and then iterate that scope's $$nextSiblings
	            var parentScope = angular.element('#nodes_pagination').scope();

	            for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
	                if (cs.pages && cs.pages.length > 1) {
	                    return true;
	                }
	            }
	            return false;
	        };

	        scope.$watch('scope.switchData', function () {
	            $('.detailContent').css({
	                height: h,
	                width: w,
	                right: -w
	            });
	            $('.detailContent .tab-content').css({
	                height: h - 62
	            });
	            $('.detailContent').stop();
	            $('.detailContent').animate({
	                right: 0
	            }, 400).css('overflow', 'visible');
	        });
	        self.init(scope);
	    }

	    _createClass(cephPoolDetailController, [{
	        key: 'init',
	        value: function init(scope) {
	            var self = this;

	            scope.irbds = [];
	            scope.rbds = [];
	            scope.rbdState = false;

	            if (scope.selectedData) {
	                scope.selectedData.aData = [];
	            }

	            self.refresh(scope);
	            scope.isAdding = false;
	            scope.isEditting = false;
	            scope.isDeleting = false;
	        }
	    }, {
	        key: 'reset',
	        value: function reset(scope) {

	            if (scope.selectedData) {
	                scope.selectedData.aData = [];
	            }
	        }
	    }, {
	        key: 'refresh',
	        value: function refresh(scope) {
	            var self = this;
	            self.reset(scope);

	            if (scope.selectedData) {
	                scope.selectedData.aData = [];
	            }
	            // switchAPI.getSwitch(inSwitchData.uuid, inSwitchData.pmswitch_id)
	            //     .success(function (data) {
	            //         scope.switchData = data;
	            //         scope.switchHostname = inSwitchData.hostname;
	            //         ////////////////////mock/////////////////////////////////
	            //         //if (!scope.switchData.rest_tcp_port) {
	            //         //    scope.switchData.rest_tcp_port = '443';
	            //         //}
	            //         ////////////////////mock/////////////////////////////////
	            //     });
	            self.poolService.get('/api/storage/clusters/' + self.inSwitchData.cluster_id + '/pools/' + self.inSwitchData.id + '/rbds').success(function (response) {
	                //scope.$broadcast('hzTable:rowReset');
	                // var specificScope = angular.element('#nodes_all_checkbox').scope();
	                // var temp_count_id = 0;
	                // angular.forEach(response.data, function (value, key) {
	                //     temp_count_id++;
	                //     scope.nodes.push({ id: temp_count_id, osd: value });
	                //     //scope.nodes.push({ nodename: key, port: value });
	                // });
	                //
	                angular.element('#rbds_all_checkbox').scope().specialReset();
	                scope.rbds = response.data;
	                scope.rbdState = true;
	            }).error(function (err) {
	                toastService.add('error', gettext('Unable to get ceph Rbds info'));
	            });
	        }
	    }, {
	        key: 'bindAction',
	        value: function bindAction(scope) {
	            var self = this;

	            scope.actions = {
	                refresh: self.refresh.bind(this, scope),
	                modal: new self.action(scope)
	            };
	        }
	    }]);

	    return cephPoolDetailController;
	}();

	cephPoolDetailController.$inject = ['$scope', '$modalInstance', 'poolService', 'switchData', 'lenovoNetworkSwitchesAction', 'horizon.framework.widgets.toast.service'];

	;

	angular.module('hz.dashboard.lenovo.network_switches').controller('cephPoolDetailController', cephPoolDetailController);

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = "<hz-magic-search-context filter-facets=\"filterFacets\">\n    <table id=\"ceph_pools_list\" hz-table ng-cloak hopes-table-drag\n           st-table=\"ipools\"\n           st-safe-src=\"pools\"\n           ng-init=\"userID = '{{ request.user.id }}'\"\n           disabled=\"disabled\"\n           st-magic-search\n           class=\"table table-bordered table-hover\">\n        <thead>\n        <tr>\n            <th colspan=\"100\" class=\"bare\">\n                <div class=\"table_actions clearfix\">\n                    <action-list class=\"btn-addon\">\n                        <action action-classes=\"'btn btn-default btn-sm'\"\n                                callback=\"actions.refresh\"\n                                disabled=\"isAdding || isEditting || isDeleting\">\n                            <i class=\"icon icon-refresh\"></i>\n                            <span id=\"refresh\"></span>\n                        </action>\n                    </action-list>\n                    <!--<action-list>\n                        <action action-classes=\"'btn btn-primary btn-action'\"\n                                callback=\"actions.modal.createSwitch\"\n                                disabled=\"isAdding || isEditting || isDeleting\">\n                            <i class=\"icon icon-add\"></i>\n                            <span id=\"create-switch\">{$ ::context.action.create $}</span>\n                        </action>\n                    </action-list>\n                    <action-list>\n                        <action action-classes=\"'btn btn-action btn-primary'\"\n                                disabled=\"numSelected !== 1 || isAdding || isEditting || isDeleting\"\n                                callback=\"actions.modal.editSwitch\" item=\"selectedData.aData\">\n                            <i class=\"icon icon-edit\"></i>\n                            <span id=\"edit-switch\">{$ ::context.action.edit $}</span>\n                        </action>\n                    </action-list>\n                    <action-list>\n                        <action action-classes=\"'btn btn-action btn-danger'\"\n                                disabled=\"numSelected === 0 || isAdding || isEditting || isDeleting\"\n                                callback=\"actions.modal.deleteSwitch\" item=\"selectedData.aData\">\n                            <i class=\"icon icon-delete\"></i>\n                            <span id=\"delete-switch\">{$ ::context.action.delete $}</span>\n                        </action>\n                    </action-list>-->\n                    <div class=\"fr search-bar\">\n                        <hz-magic-search-bar id=\"search\"></hz-magic-search-bar>\n                    </div>\n                </div>\n            </th>\n        </tr>\n        <tr eagle-eye=\"table_heads\">\n            <!--<th class=\"select-col\" eagle-eye=\"select_col\">-->\n                <!--<input id=\"pools_all_checkbox\" type=\"checkbox\" hz-select-page=\"pools\"-->\n                       <!--ng-disabled=\"isAdding || isEditting || isDeleting\"/>-->\n            <!--</th>-->\n            <th><span st-sort=\"name\" eagle-eye=\"data_col\">{$ ::context.header.serverName $}</span></th>\n            <!--<th><span st-sort=\"deduplication\" eagle-eye=\"data_col\">{$ ::context.header.Status $}</span></th>-->\n            <th><span st-sort=\"pg_num\" eagle-eye=\"data_col\">{$ ::context.header.PGNumber $}</span></th>\n            <th><span st-sort=\"size\" eagle-eye=\"data_col\">{$ ::context.header.repliSize $}</span></th>\n            <th><span st-sort=\"createTime\" eagle-eye=\"data_col\">{$ ::context.header.createTime $}</span></th>\n            <th><span st-sort=\"updateTime\" eagle-eye=\"data_col\">{$ ::context.header.updateTime $}</span></th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr ng-if=\"!poolState\">\n            <td colspan=\"100\" class=\"Loading-bar\"><img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\"\n                                                       alt=\"\"/></td>\n        </tr>\n        <tr ng-if=\"!ipools.length && poolState\">\n            <td colspan=\"100\" eagle-eye=\"empty_table\">{$ ::context.header.nodata $}</td>\n        </tr>\n        <tr ng-repeat=\"pool in ipools\" ng-class=\"{'st-selected': checked[pool.id]}\">\n            <!--<td class=\"select-col\" eagle-eye=\"select_col\">-->\n                <!--<input type=\"checkbox\"-->\n                       <!--hz-select=\"pool\"-->\n                       <!--ng-model=\"selected[pool.id].checked\"-->\n                       <!--hz-checkbox-group=\"pools\"-->\n                       <!--ng-disabled=\"isAdding || isEditting || isDeleting\"/>-->\n            <!--</td>-->\n            <!--<td eagle-eye=\"data_col\">\n                <a ng-click=\"actions.modal.openDetail(switch)\" href=\"javascript:;\">\n                    {$ switch.ip $}\n                </a>\n            </td>-->\n            <td eagle-eye=\"data_col\">\n                <a ng-click=\"actions.modal.openDetail(pool)\" href=\"javascript:;\">\n                    {$ pool.name $}\n                </a>\n            </td>\n            <!--<td eagle-eye=\"data_col\">{$ pool.status $}</td>-->\n            <td eagle-eye=\"data_col\">{$ pool.pg_num $}</td>\n            <td eagle-eye=\"data_col\">{$ pool.size $}</td>\n            <td eagle-eye=\"data_col\">{$ pool.created_at $}</td>\n            <td eagle-eye=\"data_col\">{$ pool.updated_at $}</td>\n        </tr>\n        <!--<tr ng-if=\"isAdding\">\n            <td colspan=\"100\" class=\"Loading-bar\">\n                {$ ::context.header.adding $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />\n            </td>\n        </tr>\n        <tr ng-if=\"isEditting\">\n            <td colspan=\"100\" class=\"Loading-bar\">\n                {$ ::context.header.editting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />\n            </td>\n        </tr>\n        <tr ng-if=\"isDeleting\">\n            <td colspan=\"100\" class=\"Loading-bar\">\n                {$ ::context.header.deleting $}<img class=\"load-detail\" src=\"/static/bootstrap/img/loading.gif\" alt=\"\" />\n            </td>\n        </tr>-->\n        </tbody>\n        <tfoot ng-if=\"pools.length > 10\">\n        <tr>\n            <td colspan=\"100\" eagle-eye=\"data_page\">\n                <table-footer></table-footer>\n            </td>\n        </tr>\n        </tfoot>\n    </table>\n</hz-magic-search-context>";

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	// import angular from 'angular';


	__webpack_require__(35);

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	var _baseController = __webpack_require__(37);

	var _baseController2 = _interopRequireDefault(_baseController);

	var _baseComponent = __webpack_require__(20);

	var _baseComponent2 = _interopRequireDefault(_baseComponent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*@ngInject*/
	var HomeController = function () {
	    HomeController.$inject = ["$rootScope", "$q"];
	    function HomeController($rootScope, $q) {
	        _classCallCheck(this, HomeController);

	        //you need inject the AppInitService to Parent class(BaseController) 
	        //so that BaseController can get the AppInitService
	        // super(AppInitService, $rootScope);
	        // this.HomeService = HomeService;
	        // this.AppInitService = AppInitService;
	        this.$rootScope = $rootScope;
	        this.$q = $q;
	        this.pageName = 'home';
	    }

	    /**
	     * @returns {promise} you must return a promise object 
	     * so that BaseComponent can async execute other code
	     * note:you must use `resolve or reject` makes sure the 
	     * BaseController can execute then function
	     */


	    _createClass(HomeController, [{
	        key: 'initialize',
	        value: function initialize() {
	            var self = this;
	            return new Promise(function (resolve, reject) {
	                console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^home controller initPage');
	                // self.HomeService.testSend().then((data) => {
	                //     console.log(data)
	                // })
	                resolve();
	            });
	        }

	        /**
	         * bindView function will invoke after initialize
	         */

	    }, {
	        key: 'bindView',
	        value: function bindView() {
	            console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%home bindaction');
	        }

	        /**
	         * bindAction is the highest priority invoke
	         * bindView will invoke in BaseController constructor
	         * so it invokes priority most highly
	         * in summary,the invoke order is :
	         *     --> bindAction
	         *          --> initialize
	         *              --> bindView
	         */

	    }, {
	        key: 'bindAction',
	        value: function bindAction() {
	            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> home bindAction");
	            return {};
	        }
	    }, {
	        key: 'change',
	        value: function change() {
	            this.status = !this.status;
	        }
	    }]);

	    return HomeController;
	}();

	var HomePage = function (_BaseComponent) {
	    _inherits(HomePage, _BaseComponent);

	    function HomePage() {
	        _classCallCheck(this, HomePage);

	        var _this = _possibleConstructorReturn(this, (HomePage.__proto__ || Object.getPrototypeOf(HomePage)).call(this));

	        _this.controller = HomeController;
	        _this.template = __webpack_require__(40);
	        return _this;
	    }

	    return HomePage;
	}(_baseComponent2.default);

	var homePage = new HomePage();

	angular.module(_initConfig2.default.name).directive('home', function () {
	    return new HomePage();
	});

	// angular.module(config.name).directive('home', function() {
	//     return {
	//         restrict: 'E',
	//         template: '<div>Hi there</div>',
	//         replace: true
	//     };
	// });

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(36);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(19)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/.0.26.2@css-loader/index.js!../../../node_modules/.1.3.2@postcss-loader/index.js!../../../node_modules/.4.1.1@sass-loader/index.js!./home.scss", function() {
				var newContent = require("!!../../../node_modules/.0.26.2@css-loader/index.js!../../../node_modules/.1.3.2@postcss-loader/index.js!../../../node_modules/.4.1.1@sass-loader/index.js!./home.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(18)();
	// imports


	// module
	exports.push([module.id, "#home-page h1 {\n  background: green; }\n\n#home-page p {\n  background: red; }\n\n#home-page .test {\n  background: red; }\n", ""]);

	// exports


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // import BootstrapService from './services/bootstrap.service.js'


	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var NprogressService = __webpack_require__(38);

	var BaseController = function () {
	    function BaseController(AppInitService, $rootScope, config) {
	        _classCallCheck(this, BaseController);

	        this.$rootScope = $rootScope;
	        this.actions = this.bindAction();
	        var self = this;

	        AppInitService.done().then(function () {
	            console.log('***************************app init service end');

	            //if the class has extended then invoke child initPage
	            self.pageInit().then(function () {
	                self.$rootScope.$apply(function () {
	                    self.bindView();
	                });
	            });

	            if (_initConfig2.default.debug == true) {
	                window['vm'] = self;
	                window['rootScope'] = $rootScope;
	            }
	        });
	    }

	    _createClass(BaseController, [{
	        key: 'initialize',
	        value: function initialize() {
	            var self = this;
	            return new Promise(function (resolve) {
	                resolve();
	            });
	        }
	    }, {
	        key: 'bindView',
	        value: function bindView() {
	            console.log('>>>>>>>>>>>>>>>>>>>>>home bindaction');
	        }
	    }, {
	        key: 'bindAction',
	        value: function bindAction() {}
	    }, {
	        key: 'pageInit',
	        value: function pageInit() {
	            var self = this;
	            return new Promise(function (resolve) {
	                NprogressService.start();
	                self.initialize().then(function () {
	                    console.log('base finished initialize');

	                    NprogressService.done();
	                    resolve();
	                });
	            });
	        }
	    }]);

	    return BaseController;
	}();

	module.exports = BaseController;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var NProgress = __webpack_require__(39);
	var np = void 0;

	var NprogressService = function () {
	    function NprogressService() {
	        _classCallCheck(this, NprogressService);
	    }

	    _createClass(NprogressService, [{
	        key: "start",
	        value: function start() {
	            if ("undefined" != typeof NProgress) {
	                NProgress.start();
	            }
	        }
	    }, {
	        key: "done",
	        value: function done() {
	            if ("undefined" != typeof NProgress) {
	                setTimeout(function () {
	                    return NProgress.done();
	                }, 1000);
	            }
	        }
	    }]);

	    return NprogressService;
	}();

	np = new NprogressService();

	module.exports = np;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
	 * @license MIT */

	;(function(root, factory) {

	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    module.exports = factory();
	  } else {
	    root.NProgress = factory();
	  }

	})(this, function() {
	  var NProgress = {};

	  NProgress.version = '0.2.0';

	  var Settings = NProgress.settings = {
	    minimum: 0.08,
	    easing: 'ease',
	    positionUsing: '',
	    speed: 200,
	    trickle: true,
	    trickleRate: 0.02,
	    trickleSpeed: 800,
	    showSpinner: true,
	    barSelector: '[role="bar"]',
	    spinnerSelector: '[role="spinner"]',
	    parent: 'body',
	    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
	  };

	  /**
	   * Updates configuration.
	   *
	   *     NProgress.configure({
	   *       minimum: 0.1
	   *     });
	   */
	  NProgress.configure = function(options) {
	    var key, value;
	    for (key in options) {
	      value = options[key];
	      if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
	    }

	    return this;
	  };

	  /**
	   * Last number.
	   */

	  NProgress.status = null;

	  /**
	   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
	   *
	   *     NProgress.set(0.4);
	   *     NProgress.set(1.0);
	   */

	  NProgress.set = function(n) {
	    var started = NProgress.isStarted();

	    n = clamp(n, Settings.minimum, 1);
	    NProgress.status = (n === 1 ? null : n);

	    var progress = NProgress.render(!started),
	        bar      = progress.querySelector(Settings.barSelector),
	        speed    = Settings.speed,
	        ease     = Settings.easing;

	    progress.offsetWidth; /* Repaint */

	    queue(function(next) {
	      // Set positionUsing if it hasn't already been set
	      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

	      // Add transition
	      css(bar, barPositionCSS(n, speed, ease));

	      if (n === 1) {
	        // Fade out
	        css(progress, { 
	          transition: 'none', 
	          opacity: 1 
	        });
	        progress.offsetWidth; /* Repaint */

	        setTimeout(function() {
	          css(progress, { 
	            transition: 'all ' + speed + 'ms linear', 
	            opacity: 0 
	          });
	          setTimeout(function() {
	            NProgress.remove();
	            next();
	          }, speed);
	        }, speed);
	      } else {
	        setTimeout(next, speed);
	      }
	    });

	    return this;
	  };

	  NProgress.isStarted = function() {
	    return typeof NProgress.status === 'number';
	  };

	  /**
	   * Shows the progress bar.
	   * This is the same as setting the status to 0%, except that it doesn't go backwards.
	   *
	   *     NProgress.start();
	   *
	   */
	  NProgress.start = function() {
	    if (!NProgress.status) NProgress.set(0);

	    var work = function() {
	      setTimeout(function() {
	        if (!NProgress.status) return;
	        NProgress.trickle();
	        work();
	      }, Settings.trickleSpeed);
	    };

	    if (Settings.trickle) work();

	    return this;
	  };

	  /**
	   * Hides the progress bar.
	   * This is the *sort of* the same as setting the status to 100%, with the
	   * difference being `done()` makes some placebo effect of some realistic motion.
	   *
	   *     NProgress.done();
	   *
	   * If `true` is passed, it will show the progress bar even if its hidden.
	   *
	   *     NProgress.done(true);
	   */

	  NProgress.done = function(force) {
	    if (!force && !NProgress.status) return this;

	    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
	  };

	  /**
	   * Increments by a random amount.
	   */

	  NProgress.inc = function(amount) {
	    var n = NProgress.status;

	    if (!n) {
	      return NProgress.start();
	    } else {
	      if (typeof amount !== 'number') {
	        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
	      }

	      n = clamp(n + amount, 0, 0.994);
	      return NProgress.set(n);
	    }
	  };

	  NProgress.trickle = function() {
	    return NProgress.inc(Math.random() * Settings.trickleRate);
	  };

	  /**
	   * Waits for all supplied jQuery promises and
	   * increases the progress as the promises resolve.
	   *
	   * @param $promise jQUery Promise
	   */
	  (function() {
	    var initial = 0, current = 0;

	    NProgress.promise = function($promise) {
	      if (!$promise || $promise.state() === "resolved") {
	        return this;
	      }

	      if (current === 0) {
	        NProgress.start();
	      }

	      initial++;
	      current++;

	      $promise.always(function() {
	        current--;
	        if (current === 0) {
	            initial = 0;
	            NProgress.done();
	        } else {
	            NProgress.set((initial - current) / initial);
	        }
	      });

	      return this;
	    };

	  })();

	  /**
	   * (Internal) renders the progress bar markup based on the `template`
	   * setting.
	   */

	  NProgress.render = function(fromStart) {
	    if (NProgress.isRendered()) return document.getElementById('nprogress');

	    addClass(document.documentElement, 'nprogress-busy');
	    
	    var progress = document.createElement('div');
	    progress.id = 'nprogress';
	    progress.innerHTML = Settings.template;

	    var bar      = progress.querySelector(Settings.barSelector),
	        perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
	        parent   = document.querySelector(Settings.parent),
	        spinner;
	    
	    css(bar, {
	      transition: 'all 0 linear',
	      transform: 'translate3d(' + perc + '%,0,0)'
	    });

	    if (!Settings.showSpinner) {
	      spinner = progress.querySelector(Settings.spinnerSelector);
	      spinner && removeElement(spinner);
	    }

	    if (parent != document.body) {
	      addClass(parent, 'nprogress-custom-parent');
	    }

	    parent.appendChild(progress);
	    return progress;
	  };

	  /**
	   * Removes the element. Opposite of render().
	   */

	  NProgress.remove = function() {
	    removeClass(document.documentElement, 'nprogress-busy');
	    removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent');
	    var progress = document.getElementById('nprogress');
	    progress && removeElement(progress);
	  };

	  /**
	   * Checks if the progress bar is rendered.
	   */

	  NProgress.isRendered = function() {
	    return !!document.getElementById('nprogress');
	  };

	  /**
	   * Determine which positioning CSS rule to use.
	   */

	  NProgress.getPositioningCSS = function() {
	    // Sniff on document.body.style
	    var bodyStyle = document.body.style;

	    // Sniff prefixes
	    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
	                       ('MozTransform' in bodyStyle) ? 'Moz' :
	                       ('msTransform' in bodyStyle) ? 'ms' :
	                       ('OTransform' in bodyStyle) ? 'O' : '';

	    if (vendorPrefix + 'Perspective' in bodyStyle) {
	      // Modern browsers with 3D support, e.g. Webkit, IE10
	      return 'translate3d';
	    } else if (vendorPrefix + 'Transform' in bodyStyle) {
	      // Browsers without 3D support, e.g. IE9
	      return 'translate';
	    } else {
	      // Browsers without translate() support, e.g. IE7-8
	      return 'margin';
	    }
	  };

	  /**
	   * Helpers
	   */

	  function clamp(n, min, max) {
	    if (n < min) return min;
	    if (n > max) return max;
	    return n;
	  }

	  /**
	   * (Internal) converts a percentage (`0..1`) to a bar translateX
	   * percentage (`-100%..0%`).
	   */

	  function toBarPerc(n) {
	    return (-1 + n) * 100;
	  }


	  /**
	   * (Internal) returns the correct CSS for changing the bar's
	   * position given an n percentage, and speed and ease from Settings
	   */

	  function barPositionCSS(n, speed, ease) {
	    var barCSS;

	    if (Settings.positionUsing === 'translate3d') {
	      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
	    } else if (Settings.positionUsing === 'translate') {
	      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
	    } else {
	      barCSS = { 'margin-left': toBarPerc(n)+'%' };
	    }

	    barCSS.transition = 'all '+speed+'ms '+ease;

	    return barCSS;
	  }

	  /**
	   * (Internal) Queues a function to be executed.
	   */

	  var queue = (function() {
	    var pending = [];
	    
	    function next() {
	      var fn = pending.shift();
	      if (fn) {
	        fn(next);
	      }
	    }

	    return function(fn) {
	      pending.push(fn);
	      if (pending.length == 1) next();
	    };
	  })();

	  /**
	   * (Internal) Applies css properties to an element, similar to the jQuery 
	   * css method.
	   *
	   * While this helper does assist with vendor prefixed property names, it 
	   * does not perform any manipulation of values prior to setting styles.
	   */

	  var css = (function() {
	    var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
	        cssProps    = {};

	    function camelCase(string) {
	      return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
	        return letter.toUpperCase();
	      });
	    }

	    function getVendorProp(name) {
	      var style = document.body.style;
	      if (name in style) return name;

	      var i = cssPrefixes.length,
	          capName = name.charAt(0).toUpperCase() + name.slice(1),
	          vendorName;
	      while (i--) {
	        vendorName = cssPrefixes[i] + capName;
	        if (vendorName in style) return vendorName;
	      }

	      return name;
	    }

	    function getStyleProp(name) {
	      name = camelCase(name);
	      return cssProps[name] || (cssProps[name] = getVendorProp(name));
	    }

	    function applyCss(element, prop, value) {
	      prop = getStyleProp(prop);
	      element.style[prop] = value;
	    }

	    return function(element, properties) {
	      var args = arguments,
	          prop, 
	          value;

	      if (args.length == 2) {
	        for (prop in properties) {
	          value = properties[prop];
	          if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
	        }
	      } else {
	        applyCss(element, args[1], args[2]);
	      }
	    }
	  })();

	  /**
	   * (Internal) Determines if an element or space separated list of class names contains a class name.
	   */

	  function hasClass(element, name) {
	    var list = typeof element == 'string' ? element : classList(element);
	    return list.indexOf(' ' + name + ' ') >= 0;
	  }

	  /**
	   * (Internal) Adds a class to an element.
	   */

	  function addClass(element, name) {
	    var oldList = classList(element),
	        newList = oldList + name;

	    if (hasClass(oldList, name)) return; 

	    // Trim the opening space.
	    element.className = newList.substring(1);
	  }

	  /**
	   * (Internal) Removes a class from an element.
	   */

	  function removeClass(element, name) {
	    var oldList = classList(element),
	        newList;

	    if (!hasClass(element, name)) return;

	    // Replace the class name.
	    newList = oldList.replace(' ' + name + ' ', ' ');

	    // Trim the opening and closing spaces.
	    element.className = newList.substring(1, newList.length - 1);
	  }

	  /**
	   * (Internal) Gets a space separated list of the class names on the element. 
	   * The list is wrapped with a single space on each end to facilitate finding 
	   * matches within the list.
	   */

	  function classList(element) {
	    return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
	  }

	  /**
	   * (Internal) Removes an element from the DOM.
	   */

	  function removeElement(element) {
	    element && element.parentNode && element.parentNode.removeChild(element);
	  }

	  return NProgress;
	});



/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = "<!--<div ng-controller=\"CollapseDemoCtrl\">\n    <p>Resize window to less than 768 pixels to display mobile menu toggle button.</p>\n    <nav class=\"navbar navbar-default\" role=\"navigation\">\n        <div class=\"navbar-header\">\n            <button type=\"button\" class=\"navbar-toggle\" ng-click=\"isNavCollapsed = !isNavCollapsed\">\n\t\t\t\t<span class=\"sr-only\">Toggle navigation</span>\n\t\t\t\t<span class=\"icon-bar\"></span>\n\t\t\t\t<span class=\"icon-bar\"></span>\n\t\t\t\t<span class=\"icon-bar\"></span>\n\t\t\t</button>\n            <a class=\"navbar-brand\" href=\"#\">A menu</a>\n        </div>\n        <div class=\"collapse navbar-collapse\" uib-collapse=\"isNavCollapsed\">\n            <ul class=\"nav navbar-nav\">\n                <li><a href=\"#\">Link 1</a></li>\n                <li><a href=\"#\">Link 2</a></li>\n            </ul>\n        </div>\n    </nav>\n    <hr>\n    <button type=\"button\" class=\"btn btn-default\" ng-click=\"isCollapsed = !isCollapsed\">Toggle collapse Vertically</button>\n    <hr>\n    <div uib-collapse=\"isCollapsed\">\n        <div class=\"well well-lg\">Some content</div>\n    </div>\n\n    <button type=\"button\" class=\"btn btn-default\" ng-click=\"isCollapsedHorizontal = !isCollapsedHorizontal\">Toggle collapse Horizontally</button>\n    <hr>\n    <div class=\"horizontal-collapse\" uib-collapse=\"isCollapsedHorizontal\" horizontal>\n        <div class=\"well well-lg\">Some content</div>\n    </div>\n</div>-->\n\n<div>\n    home page\n    <!--<button ng-click=\"vm.change()\">change</button>-->\n    <!--<about ng-if=\"!vm.status\"></about>\n    <nav ng-if=\"vm.status\"></nav>-->\n    =========================={$ vm.pageName $}\n</div>";

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _initConfig = __webpack_require__(4);

	var _initConfig2 = _interopRequireDefault(_initConfig);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (!window.cephConfig) {
	    window.cephConfig = _initConfig2.default;
	}

	var app = angular.module(_initConfig2.default.name).constant('cephConfig', _initConfig2.default);

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var req = __webpack_require__(43);
	req.keys().forEach(req);

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./circle-progress.js": 44,
		"./framework/widgets/magicSearchExt.js": 45,
		"./framework/widgets/toast/storage.toast.directive.js": 46,
		"./framework/widgets/toast/storage.toast.factory.js": 47,
		"./horizon.storage.ceph.js": 48,
		"./horizon.storage.cluster.js": 49,
		"./horizon.storage.formCtrl.js": 50,
		"./horizon.storage.group.js": 51,
		"./horizon.storage.iSCSI-volume.js": 52,
		"./horizon.storage.iSCSI.js": 53,
		"./horizon.storage.pool-rbd.js": 54,
		"./horizon.storage.pool.js": 55,
		"./horizon.storage.service.js": 56,
		"./horizon.storage_topbar.js": 57,
		"./horizon.storagemgmt.js": 58,
		"./horizon.zabbix_load.service.js": 59
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 43;


/***/ },
/* 44 */
/***/ function(module, exports) {

	'use strict';

	/*
	jquery-circle-progress - jQuery Plugin to draw animated circular progress bars

	URL: http://kottenator.github.io/jquery-circle-progress/
	Author: Rostyslav Bryzgunov <kottenator@gmail.com>
	Version: 1.1.2
	License: MIT
	*/
	(function ($) {
	    function CircleProgress(config) {
	        this.init(config);
	    }

	    CircleProgress.prototype = {
	        //----------------------------------------------- public options -----------------------------------------------
	        /**
	         * This is the only required option. It should be from 0.0 to 1.0
	         * @type {number}
	         */
	        value: 0.0,

	        emptyvalue: 0.0,

	        /**
	         * Size of the circle / canvas in pixels
	         * @type {number}
	         */
	        size: 100.0,

	        /**
	         * Initial angle for 0.0 value in radians
	         * @type {number}
	         */
	        startAngle: -Math.PI,

	        /**
	         * Width of the arc. By default it's auto-calculated as 1/14 of size, but you may set it explicitly in pixels
	         * @type {number|string}
	         */
	        thickness: 'auto',

	        /**
	         * Fill of the arc. You may set it to:
	         *   - solid color:
	         *     - { color: '#3aeabb' }
	         *     - { color: 'rgba(255, 255, 255, .3)' }
	         *   - linear gradient (left to right):
	         *     - { gradient: ['#3aeabb', '#fdd250'], gradientAngle: Math.PI / 4 }
	         *     - { gradient: ['red', 'green', 'blue'], gradientDirection: [x0, y0, x1, y1] }
	         *   - image:
	         *     - { image: 'http://i.imgur.com/pT0i89v.png' }
	         *     - { image: imageObject }
	         *     - { color: 'lime', image: 'http://i.imgur.com/pT0i89v.png' } - color displayed until the image is loaded
	         */
	        fill: {
	            gradient: ['#3aeabb', '#fdd250']
	        },

	        bgfill: {
	            gradient: ['#3aeabb', '#fdd250']
	        },

	        /**
	         * Color of the "empty" arc. Only a color fill supported by now
	         * @type {string}
	         */
	        emptyFill: 'rgba(0, 0, 0, .1)',

	        /**
	         * Animation config (see jQuery animations: http://api.jquery.com/animate/)
	         */
	        animation: {
	            duration: 1200,
	            easing: 'circleProgressEasing'
	        },

	        /**
	         * Default animation starts at 0.0 and ends at specified `value`. Let's call this direct animation.
	         * If you want to make reversed animation then you should set `animationStartValue` to 1.0.
	         * Also you may specify any other value from 0.0 to 1.0
	         * @type {number}
	         */
	        animationStartValue: 0.0,

	        /**
	         * Reverse animation and arc draw
	         * @type {boolean}
	         */
	        reverse: false,

	        /**
	         * Arc line cap ('butt' (default), 'round' and 'square')
	         * Read more: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.lineCap
	         * @type {string}
	         */
	        lineCap: 'butt',

	        //-------------------------------------- protected properties and methods --------------------------------------
	        /**
	         * @protected
	         */
	        constructor: CircleProgress,

	        /**
	         * Container element. Should be passed into constructor config
	         * @protected
	         * @type {jQuery}
	         */
	        el: null,

	        /**
	         * Canvas element. Automatically generated and prepended to the {@link CircleProgress.el container}
	         * @protected
	         * @type {HTMLCanvasElement}
	         */
	        canvas: null,

	        /**
	         * 2D-context of the {@link CircleProgress.canvas canvas}
	         * @protected
	         * @type {CanvasRenderingContext2D}
	         */
	        ctx: null,

	        /**
	         * Radius of the outer circle. Automatically calculated as {@link CircleProgress.size} / 2
	         * @protected
	         * @type {number}
	         */
	        radius: 0.0,

	        /**
	         * Fill of the main arc. Automatically calculated, depending on {@link CircleProgress.fill} option
	         * @protected
	         * @type {string|CanvasGradient|CanvasPattern}
	         */
	        arcFill: null,

	        /**
	         * Last rendered frame value
	         * @protected
	         * @type {number}
	         */
	        lastFrameValue: 0.0,

	        /**
	         * Init/re-init the widget
	         * @param {object} config Config
	         */
	        init: function init(config) {
	            $.extend(this, config);
	            this.radius = this.size / 2;
	            this.initWidget();
	            this.initFill();
	            this.draw();
	        },

	        /**
	         * @protected
	         */
	        initWidget: function initWidget() {
	            var canvas = this.canvas = this.canvas || $('<canvas>').prependTo(this.el)[0];
	            canvas.width = this.size;
	            canvas.height = this.size;
	            this.ctx = canvas.getContext('2d');
	        },

	        /**
	         * This method sets {@link CircleProgress.arcFill}
	         * It could do this async (on image load)
	         * @protected
	         */
	        initFill: function initFill() {
	            var self = this,
	                fill = this.fill,
	                bgfill = this.bgfill,
	                ctx = this.ctx,
	                size = this.size;

	            if (!fill) throw Error("The fill is not specified!");

	            if (!bgfill) {
	                throw Error("The bgfill is not specified!");
	            }

	            if (bgfill.color) this.emptyFill = bgfill.color;

	            if (bgfill.gradient) {
	                var gr = bgfill.gradient;

	                if (gr.length == 1) {
	                    this.emptyFill = gr[0];
	                } else if (gr.length > 1) {
	                    var ga = bgfill.gradientAngle || 0,
	                        // gradient direction angle; 0 by default
	                    gd = bgfill.gradientDirection || [size / 2 * (1 - Math.cos(ga)), // x0
	                    size / 2 * (1 + Math.sin(ga)), // y0
	                    size / 2 * (1 + Math.cos(ga)), // x1
	                    size / 2 * (1 - Math.sin(ga)) // y1
	                    ];

	                    var lg = ctx.createLinearGradient.apply(ctx, gd);

	                    for (var i = 0; i < gr.length; i++) {
	                        var color = gr[i],
	                            pos = i / (gr.length - 1);

	                        if ($.isArray(color)) {
	                            pos = color[1];
	                            color = color[0];
	                        }

	                        lg.addColorStop(pos, color);
	                    }

	                    this.emptyFill = lg;
	                }
	            }

	            if (fill.color) this.arcFill = fill.color;

	            if (fill.gradient) {
	                var gr = fill.gradient;

	                if (gr.length == 1) {
	                    this.arcFill = gr[0];
	                } else if (gr.length > 1) {
	                    var ga = fill.gradientAngle || 0,
	                        // gradient direction angle; 0 by default
	                    gd = fill.gradientDirection || [size / 2 * (1 - Math.cos(ga)), // x0
	                    size / 2 * (1 + Math.sin(ga)), // y0
	                    size / 2 * (1 + Math.cos(ga)), // x1
	                    size / 2 * (1 - Math.sin(ga)) // y1
	                    ];

	                    var lg = ctx.createLinearGradient.apply(ctx, gd);

	                    for (var i = 0; i < gr.length; i++) {
	                        var color = gr[i],
	                            pos = i / (gr.length - 1);

	                        if ($.isArray(color)) {
	                            pos = color[1];
	                            color = color[0];
	                        }

	                        lg.addColorStop(pos, color);
	                    }

	                    this.arcFill = lg;
	                }
	            }

	            if (fill.image) {
	                var img;

	                if (fill.image instanceof Image) {
	                    img = fill.image;
	                } else {
	                    img = new Image();
	                    img.src = fill.image;
	                }

	                if (img.complete) setImageFill();else img.onload = setImageFill;
	            }

	            function setImageFill() {
	                var bg = $('<canvas>')[0];
	                bg.width = self.size;
	                bg.height = self.size;
	                bg.getContext('2d').drawImage(img, 0, 0, size, size);
	                self.arcFill = self.ctx.createPattern(bg, 'no-repeat');
	                self.drawFrame(self.lastFrameValue);
	            }
	        },

	        draw: function draw() {
	            if (this.animation) this.drawAnimated(this.value);else this.drawFrame(this.value, this.emptyvalue);
	        },

	        /**
	         * @protected
	         * @param {number} v Frame value
	         */
	        drawFrame: function drawFrame(v, emptyv) {
	            this.lastFrameValue = v;
	            this.ctx.clearRect(0, 0, this.size, this.size);
	            this.drawEmptyArc(emptyv);
	            this.drawArc(v);
	        },

	        /**
	         * @protected
	         * @param {number} v Frame value
	         */
	        drawArc: function drawArc(v) {
	            var ctx = this.ctx,
	                r = this.radius,
	                t = this.getThickness(),
	                a = this.startAngle;

	            ctx.save();
	            ctx.beginPath();

	            if (!this.reverse) {
	                ctx.arc(r, r, r - t / 2, a, a + Math.PI * 2 * v);
	            } else {
	                ctx.arc(r, r, r - t / 2, a - Math.PI * 2 * v, a);
	            }

	            ctx.lineWidth = t;
	            ctx.lineCap = this.lineCap;
	            ctx.strokeStyle = this.arcFill;
	            ctx.stroke();
	            ctx.restore();
	        },

	        /**
	         * @protected
	         * @param {number} v Frame value
	         */
	        drawEmptyArc: function drawEmptyArc(v) {
	            var ctx = this.ctx,
	                r = this.radius,
	                t = this.getThickness(),
	                a = this.startAngle;

	            if (v < 1) {
	                ctx.save();
	                ctx.beginPath();

	                if (v <= 0) {
	                    ctx.arc(r, r, r - t / 2, 0, Math.PI * 2);
	                } else {
	                    if (!this.reverse) {
	                        ctx.arc(r, r, r - t / 2, a, a + Math.PI * 2 * v);
	                    } else {
	                        ctx.arc(r, r, r - t / 2, a - Math.PI * 2 * v, a);
	                    }
	                }

	                ctx.lineWidth = t;
	                ctx.strokeStyle = this.emptyFill;
	                ctx.lineCap = this.lineCap;
	                ctx.stroke();
	                ctx.restore();
	            }
	        },

	        /**
	         * @protected
	         * @param {number} v Value
	         */
	        drawAnimated: function drawAnimated(v) {
	            var self = this,
	                el = this.el;

	            el.trigger('circle-animation-start');

	            $(this.canvas).stop(true, true).css({ animationProgress: 0 }).animate({ animationProgress: 1 }, $.extend({}, this.animation, {
	                step: function step(animationProgress) {
	                    var stepValue = self.animationStartValue * (1 - animationProgress) + v * animationProgress;
	                    self.drawFrame(stepValue, self.emptyvalue);
	                    el.trigger('circle-animation-progress', [animationProgress, stepValue]);
	                },
	                complete: function complete() {
	                    el.trigger('circle-animation-end');
	                }
	            }));
	        },

	        /**
	         * @protected
	         * @returns {number}
	         */
	        getThickness: function getThickness() {
	            return $.isNumeric(this.thickness) ? this.thickness : this.size / 14;
	        }
	    };

	    //-------------------------------------------- Initiating jQuery plugin --------------------------------------------
	    $.circleProgress = {
	        // Default options (you may override them)
	        defaults: CircleProgress.prototype
	    };

	    // ease-in-out-cubic
	    $.easing.circleProgressEasing = function (x, t, b, c, d) {
	        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
	        return c / 2 * ((t -= 2) * t * t + 2) + b;
	    };

	    /**
	     * Draw animated circular progress bar.
	     *
	     * Appends <canvas> to the element or updates already appended one.
	     *
	     * If animated, throws 3 events:
	     *
	     *   - circle-animation-start(jqEvent)
	     *   - circle-animation-progress(jqEvent, animationProgress, stepValue) - multiple event;
	     *                                                                        animationProgress: from 0.0 to 1.0;
	     *                                                                        stepValue: from 0.0 to value
	     *   - circle-animation-end(jqEvent)
	     *
	     * @param config Example: { value: 0.75, size: 50, animation: false };
	     *                you may set any of public options;
	     *                `animation` may be set to false;
	     *                you may also use .circleProgress('widget') to get the canvas
	     */
	    $.fn.circleProgress = function (config) {
	        var dataName = 'circle-progress';

	        if (config == 'widget') {
	            var data = this.data(dataName);
	            return data && data.canvas;
	        }

	        return this.each(function () {
	            var el = $(this),
	                instance = el.data(dataName),
	                cfg = $.isPlainObject(config) ? config : {};

	            if (instance) {
	                instance.init(cfg);
	            } else {
	                cfg.el = el;
	                instance = new CircleProgress(cfg);
	                el.data(dataName, instance);
	            }
	        });
	    };
	})(jQuery);

/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.framework.widgets.magic-search').directive('hzMagicPagination', hzMagicPaginationContext);

	    function hzMagicPaginationContext() {
	        var directive = {
	            link: link,
	            restrict: 'A',
	            scope: {
	                show: "="
	            }
	        };
	        return directive;

	        function link(scope, element, attrs) {
	            //console.log(element);
	            var parentScope = angular.element(element[0]).scope();
	            var parentScope2 = angular.element('#nodes_pagination').scope();

	            for (var cs = parentScope.$$childHead; cs; cs = cs.$$nextSibling) {
	                if (cs.pages && cs.pages.length > 1) {
	                    show = true;
	                    return;
	                }
	            }
	            show = false;
	        }
	    }
	})();

/***/ },
/* 46 */
/***/ function(module, exports) {

	'use strict';

	/*
	 * Copyright 2015 IBM Corp.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	(function () {
	  'use strict';

	  /**
	    * @ngdoc directive
	    * @name horizon.framework.widgets.toast.directive:toast
	    *
	    * @description
	    * The `toast` directive allows you to place the toasts wherever you
	    * want in your layout. Currently styling is pulled from Bootstrap alerts.
	    *
	    * @restrict EA
	    * @scope true
	    *
	    */

	  angular.module('horizon.framework.widgets.toast').directive('toastStorage', toast);

	  toast.$inject = ['horizon.framework.widgets.toast.serviceStorage', 'horizon.framework.widgets.basePath'];

	  function toast(toastService, path) {
	    var directive = {
	      restrict: 'EA',
	      templateUrl: path + 'toast/toast-storage.html',
	      scope: {},
	      link: link
	    };

	    return directive;

	    function link(scope) {
	      scope.toast = toastService;
	    }
	  }
	})();

/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';

	/*
	 * Copyright 2015 IBM Corp.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	(function () {
	  'use strict';

	  /**
	    * @ngdoc service
	    * @name toastService
	    *
	    * @description
	    * This service can be used to display user messages, toasts, in Horizon.
	    * To create a new toast, inject the 'horizon.framework.widgets.toast.service'
	    * module into your current module. Then, use the service methods.
	    *
	    * For example to add a 'success' message:
	    *     toastService.add('success', 'User successfully created.');
	    *
	    * All actions (add, clearAll, etc.) taken on the data are automatically
	    * sync-ed with the HTML.
	    */

	  angular.module('horizon.framework.widgets.toast').factory('horizon.framework.widgets.toast.serviceStorage', ['$timeout', toastService]);

	  function toastService($timeout) {
	    var toasts = [];
	    var service = {
	      types: {},
	      add: add,
	      get: get,
	      cancel: cancel,
	      clearAll: clearAll,
	      clearErrors: clearErrors,
	      clearSuccesses: clearSuccesses
	    };

	    /**
	      * There are 5 types of toasts, which are based off Bootstrap alerts.
	      */
	    service.types = {
	      danger: gettext('Danger'),
	      warning: gettext('Warning'),
	      info: gettext('Info'),
	      success: gettext('Success'),
	      error: gettext('Error')
	    };

	    return service;

	    ///////////////////////

	    /**
	      * Helper method used to remove all the toasts matching the 'type'
	      * passed in.
	      */
	    function clear(type) {
	      for (var i = 0; i < toasts.length; i++) {
	        if (toasts[i].type === type) {
	          toasts.splice(i, 1);
	          break;
	        }
	      }
	    }

	    /**
	     * Remove a single toast.
	     */
	    function cancel(index) {
	      toasts.splice(index, 1);
	    }

	    /**
	      * Create a toast object and push it to the toasts array.
	     */
	    function add(type, msg, array) {
	      var toast = {
	        type: type === 'error' ? 'danger' : type,
	        /* jshint validthis:true */
	        typeMsg: this.types[type],
	        msg: msg,
	        msgArray: array,
	        cancel: cancel
	      };
	      toasts.push(toast);
	      $timeout(function () {
	        clear(type);
	      }, 5000);
	    }

	    /**
	     * Return all toasts.
	     */
	    function get() {
	      return toasts;
	    }

	    /**
	     * Remove all toasts.
	     */
	    function clearAll() {
	      toasts = [];
	    }

	    /**
	     * Remove all toasts of type 'danger.'
	     */
	    function clearErrors() {
	      clear('danger');
	    }

	    /**
	     * Remove all toasts of type 'success.'
	     */
	    function clearSuccesses() {
	      clear('success');
	    }
	  }
	})();

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('folderActionCtrl', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', '$modalInstance', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, $modalInstance) {

	        storageAPI.getFolders().success(function (res) {
	            $scope.folderList = res.data;
	        });

	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }])
	    //folderManagementCtrl
	    .controller('usrManagementCtrl', ['$scope', '$http', '$rootScope', '$modal', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $rootScope, $modal, $modalInstance) {
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        //open folderDelete modal
	        $rootScope.folderDelete = function (size, _id, _name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'folderDelete.html',
	                controller: 'folderDeleteCtrl',
	                size: size,
	                resolve: {
	                    id: function id() {
	                        return _id;
	                    },
	                    name: function name() {
	                        return _name;
	                    }
	                },
	                windowClass: 'folder-remove-modal'
	            });
	        };
	    }])
	    //folderEditCtrl
	    .controller('folderEditCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshFolders', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', 'duplication', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshFolders, toastService, id, name, duplication) {

	        $scope.foldername = name;
	        $scope.folderpgnum = pg_num;
	        $scope.folderDupSize = duplication;
	        $scope.folder_id = id;
	        $scope.folderId = id;

	        $scope.folderModify = function (folderName, folderPgnum, folderDup) {
	            var data = {
	                storage_group_id: 0,
	                name: folderName,
	                pg_num: folderPgnum,
	                size: folderDup
	            };
	            //put folder api
	            storageAPI.folderAction.edit(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful edit folder:  ') + data.name);
	                    refreshFolders.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed edit folder:  ') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };

	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        // cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	        //click li
	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-border");
	            $(".body-left-nav li").eq(index).addClass("li-border");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //folderAddCtrl
	    .controller('folderAddCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshFolders', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshFolders, toastService) {
	        $scope.newfolder = {
	            name: '',
	            size: ''
	        };
	        // add folder action start
	        $scope.addFolderOk = function () {
	            var data = {
	                name: $scope.newfolder.name,
	                size: $scope.newfolder.size,
	                storage_group_id: 0
	            };
	            storageAPI.folderAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful create folder:') + data.name);
	                    refreshFolders.refresh();
	                    $scope.folderList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed create folder:') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };

	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.is_show = true;
	        //next
	        $scope.next = function () {
	            $scope.is_show = false;
	        };
	        //prev
	        $scope.prev = function () {
	            $scope.is_show = true;
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	        // next and prev click
	        var $document = $(document);
	        $document.on("click", ".btn-list button.next", function () {
	            $(".btn-list button").css({ 'width': '90px' });
	            $(".btn-list button.cancel").css({ 'margin': '0 20px' });
	        });
	        $document.on("click", ".btn-list button.prev", function () {
	            $(".btn-list button").css({ 'width': '120px' });
	            $(".btn-list button.next").css({ 'margin': '0' });
	        });
	        //click next prev
	        $document.on("click", ".btn-list button", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(".body-content .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //folderDeleteCtrl
	    .controller('folderDeleteCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshFolders', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshFolders, toastService, id, name) {
	        $scope.folder_id = id;
	        $scope.removefolderName = name;
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        $scope.removefolderOk = function () {
	            //delete folder api
	            var data = {
	                folder_id: id
	            };
	            storageAPI.folderAction.delete(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful delete folder:') + name);
	                    refreshFolders.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed delete folder:') + name);
	                }
	            });
	            $modalInstance.close();
	        };
	    }]).service('refreshFolders', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.getFolders().success(function (res) {
	                $rootScope.folderList = res.data;
	            });
	        };
	    }]);
	})();

/***/ },
/* 49 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('clusterActionCtrl', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', '$modalInstance', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, $modalInstance) {

	        storageAPI.getClusters().success(function (res) {
	            $scope.clusterList = res.data;
	        });

	        $scope.add_new_cluster = function () {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'add_host_cluster.html',
	                controller: 'clusterAddCtrl',
	                windowClass: 'clusterName-management-modal'
	            });
	        };

	        $scope.close = function () {
	            $modalInstance.close();
	        };

	        $scope.putedit = function (_id, name, _addr) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'clusterPutVal.html',
	                controller: 'clusterEditCtrl',
	                resolve: {
	                    id: function id() {
	                        return _id;
	                    },
	                    name: function (_name) {
	                        function name() {
	                            return _name.apply(this, arguments);
	                        }

	                        name.toString = function () {
	                            return _name.toString();
	                        };

	                        return name;
	                    }(function () {
	                        return name;
	                    }),
	                    addr: function addr() {
	                        return _addr;
	                    }
	                },
	                windowClass: 'clusterName-management-modal'

	            });
	        };

	        $scope.remove = function (_id2, name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'clusterRemove.html',
	                controller: 'clusterDeleteCtrl',
	                resolve: {
	                    id: function id() {
	                        return _id2;
	                    },
	                    name: function (_name2) {
	                        function name() {
	                            return _name2.apply(this, arguments);
	                        }

	                        name.toString = function () {
	                            return _name2.toString();
	                        };

	                        return name;
	                    }(function () {
	                        return name;
	                    })
	                },
	                windowClass: 'clusterName-management-modal'
	            });
	        };
	    }]).controller('clusterAddCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshClusters', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshClusters) {
	        $scope.addCluster = {
	            name: '',
	            addr: '',
	            ntp_ip: '',
	            zabbix_ip: ''
	        };
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.AddClusterAction = function (e) {
	            $(e.target).addClass('disabled');
	            var cluster_id = $rootScope.clusterId;

	            var data = {
	                'name': $scope.addCluster.name,
	                'addr': $scope.addCluster.addr
	                //'ntp_ip': $scope.addCluster.ntpIp,
	                //'zabbix_ip': $scope.addCluster.zabbixIp
	            };

	            storageAPI.clusterAction.create(data).success(function (res) {
	                $modalInstance.close();
	                if (res.success == true) {
	                    $rootScope.toastService('success', gettext('Successful create cluster:') + data.name);
	                    refreshClusters.refresh();
	                } else {
	                    $rootScope.toastService('error', gettext('Failed create cluster:') + name);
	                }
	            });
	        };
	    }]).controller('clusterEditCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshClusters', 'id', 'name', 'addr', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshClusters, id, name, addr) {
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.clusterName = name;
	        $scope.clusterAddr = addr;
	        $scope.editOk = function (name, address) {
	            var data = {
	                name: name,
	                addr: address,
	                cluster_id: id
	            };
	            //put cluster api
	            storageAPI.clusterAction.edit(data).success(function (res) {
	                $modalInstance.close();
	                if (res.success == true) {
	                    $rootScope.toastService('success', gettext('Successful edit cluster:') + name);
	                    refreshClusters.refresh();
	                } else {
	                    $rootScope.toastService('error', gettext('Failed edit cluster:') + name);
	                }
	            });
	        };
	    }]).controller('clusterDeleteCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshClusters', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshClusters, id, name) {
	        $scope.removeClusterName = name;
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.removeOk = function (e) {
	            $(e.target).addClass('disabled');
	            //delete cluster api
	            var data = {
	                cluster_id: id
	            };
	            storageAPI.clusterAction.delete(data).success(function (res) {
	                $modalInstance.close();
	                if (res.success == true) {
	                    $rootScope.selectedCluster = null;
	                    $rootScope.toastService('success', gettext('Successful delete cluster:') + name);
	                    refreshClusters.refresh();
	                } else {
	                    $rootScope.toastService('error', gettext('Failed delete cluster:') + name);
	                }
	            });
	        };
	    }]).service('refreshClusters', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.getClusters().success(function (res) {
	                $rootScope.clusterList = res.data;
	                if (res.data.length == 0) {
	                    $rootScope.nocluster = true;
	                }
	            });
	        };
	    }]);
	})();

/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('clusterManageCtrl', ['$scope', '$modalInstance', 'horizon.storage.service', function (scope, modalInstance, storageAPI) {

	        storageAPI.getClusters().success(function (response) {
	            if (response.success == true) {
	                scope.clusters = response.data;
	            } else {
	                $rootScope.toastService('error', gettext('Unable to retrieve Clusters.'));
	            }
	        });
	    }]).controller('lineCtrl', ['$scope', '$modalInstance', 'horizon.storage.service', '$rootScope', function (scope, modalInstance, storageService, $rootScope) {
	        var self = this;
	        var cluster_id = $rootScope.clusterId;
	        var type_name = 'cluster_io';
	        var time_span = storageService.timeFormat(0);
	        var config = {
	            'time_from': time_span.startTime,
	            'time_till': time_span.endTime
	        };
	        scope.time_menulist = [{
	            'typeIndex': 0,
	            'text': gettext('Current')
	        }, {
	            'typeIndex': 1,
	            'text': gettext('Last week')
	        }];

	        this.showIohistory = function (cluster_id, type_name, config) {
	            storageService.getioHistory(cluster_id, type_name, config).success(function (response) {
	                if (response.success == true) {
	                    var data = response.data;
	                    var seriesiopsOpArray = [];
	                    var seriesiopsReadArray = [];
	                    var seriesiopsWriteArray = [];
	                    var xAxis = [];
	                    var sort_by_key = function sort_by_key(array, key) {
	                        return array.sort(function (a, b) {
	                            var x = a[key];
	                            var y = b[key];
	                            return x < y ? -1 : x > y ? 1 : 0;
	                        });
	                    };
	                    if (data.iopsOp && data.iopsOp.length > 0) {
	                        data.iopsOp = sort_by_key(data.iopsOp, 'time');
	                        for (var i = 0; i < data.iopsOp.length; i++) {
	                            seriesiopsOpArray.push(data.iopsOp[i].value);
	                            xAxis.push(data.iopsOp[i].time);
	                        }
	                    }
	                    if (data.iopsRead && data.iopsRead.length > 0) {
	                        data.iopsRead = sort_by_key(data.iopsRead, 'time');
	                        for (var i = 0; i < data.iopsRead.length; i++) {
	                            seriesiopsReadArray.push(data.iopsRead[i].value);
	                        }
	                    }
	                    if (data.iopsWrite && data.iopsWrite.length > 0) {
	                        data.iopsWrite = sort_by_key(data.iopsWrite, 'time');
	                        for (var i = 0; i < data.iopsWrite.length; i++) {
	                            seriesiopsWriteArray.push(data.iopsWrite[i].value);
	                        }
	                    }
	                    var legend = [{
	                        name: 'iops Operation',
	                        textStyle: { color: 'lightskyblue' }
	                    }, {
	                        name: 'Read Byte/s',
	                        textStyle: { color: 'd24c4b' }
	                    }, {
	                        name: 'Write Byte/s',
	                        textStyle: { color: 'ced7a3' }
	                    }];
	                    self.line_option(xAxis, '', legend, '', seriesiopsOpArray, seriesiopsReadArray, seriesiopsWriteArray);
	                } else {
	                    $rootScope.toastService('error', gettext('Unable to retrieve IO history.'));
	                }
	            });
	        };
	        self.showIohistory(cluster_id, type_name, config);
	        this.line_option = function (xAxis, yData, legend, title, seriesiopsOpArray, seriesiopsReadArray, seriesiopsWriteArray) {
	            var option = {
	                tooltip: {
	                    show: true,
	                    trigger: 'axis'
	                },
	                backgroundColor: "",
	                title: {
	                    text: title ? title : ''
	                },
	                legend: {
	                    data: legend ? legend : []
	                },
	                grid: {
	                    top: '15%',
	                    bottom: '5%',
	                    left: '9%',
	                    right: '0%',
	                    containLabel: false
	                },

	                xAxis: [{
	                    boundaryGap: false,
	                    data: xAxis ? xAxis : ['line'],
	                    axisLabel: {
	                        show: true,
	                        interval: 'auto',
	                        formatter: '{value}',
	                        textStyle: {
	                            color: '#888',
	                            fontFamily: 'verdana',
	                            fontSize: 10,
	                            fontStyle: 'normal',
	                            fontWeight: 'bold'
	                        }
	                    },
	                    axisLine: {
	                        show: true,
	                        lineStyle: {
	                            color: '#888',
	                            type: 'solid',
	                            width: 2
	                        }
	                    }
	                }],

	                yAxis: [{
	                    type: 'value',
	                    data: yData ? yData : [],
	                    show: true,
	                    axisLabel: {
	                        formatter: '{value}',
	                        textStyle: {
	                            color: '#888',
	                            fontFamily: 'verdana',
	                            fontSize: 10,
	                            fontStyle: 'normal',
	                            fontWeight: 'bold'
	                        }
	                    },
	                    splitArea: {
	                        show: true,
	                        areaStyle: {
	                            color: ['#f3f3f3', '#fff']
	                        }
	                    },
	                    splitLine: {
	                        show: false
	                    },
	                    axisLine: {
	                        show: true,
	                        lineStyle: {
	                            color: '#888',
	                            type: 'solid',
	                            width: 2
	                        }
	                    }
	                }],

	                series: [{
	                    name: 'Read Byte/s',
	                    type: 'line',
	                    stack: '',
	                    symbol: 'none',
	                    itemStyle: {
	                        normal: {
	                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                offset: 1, color: '#652b76'
	                            }, {
	                                offset: 0, color: '#d24c4b'
	                            }], false)
	                        }
	                    },
	                    areaStyle: { normal: {} },
	                    data: seriesiopsReadArray
	                }, {
	                    name: 'iops Operation',
	                    type: 'line',
	                    stack: '',
	                    symbol: 'none',
	                    itemStyle: {
	                        normal: {
	                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                offset: 1, color: '#0b84dc'
	                            }, {
	                                offset: 0, color: 'lightskyblue'
	                            }], false)
	                        }
	                    },
	                    areaStyle: { normal: {} },
	                    data: seriesiopsOpArray
	                }, {
	                    name: 'Write Byte/s',
	                    type: 'line',
	                    stack: '',
	                    symbol: 'none',
	                    color: '#ced7a3',
	                    itemStyle: {
	                        normal: {
	                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                offset: 1, color: '#f4ffbf'
	                            }, {
	                                offset: 0, color: '#ced7a3'
	                            }], false)
	                        }
	                    },
	                    areaStyle: { normal: {} },
	                    data: seriesiopsWriteArray
	                }]

	            };
	            var myChart = echarts.init(document.getElementById('iohistory_line'));
	            $(window).on('resize', function () {
	                myChart.resize();
	            });
	            myChart.setOption(option);
	        };
	        scope.switchTimespan = function ($event, typeindex) {
	            $($event.target).parents('.dropdown-menu').siblings('.dropdown-toggle').children('.currentTime').html($($event.target).text());
	            var time_span = storageService.timeFormat(typeindex);
	            var config = {
	                'time_from': time_span.startTime,
	                'time_till': time_span.endTime
	            };
	            self.showIohistory(cluster_id, type_name, config);
	        };
	    }]).controller('zabbixSettingFormCtrl', ['$scope', '$modal', '$modalInstance', 'horizon.storage.service', '$rootScope', 'horizon.framework.widgets.toast.serviceStorage', 'zabbixLoad', function (scope, modal, modalInstance, storageService, $rootScope, toastService, zabbixLoad) {
	        var self = this;
	        var cluster_id = $rootScope.clusterId;
	        scope.close = function () {
	            modalInstance.close();
	        };
	        storageService.getclusterConf(cluster_id).success(function (response) {
	            if (response.success == true) {
	                scope.zabbix = response.data;
	            } else {
	                toastService.add('error', gettext('Unable to retrieve Cluster config.'));
	            }
	        });

	        scope.upDateClusterConf = function () {
	            modalInstance.dismiss('cancel');
	            var config = {
	                'zabbix_server_ip': scope.zabbix.zabbix_server_ip,
	                'ntp_server_ip': scope.zabbix.ntp_server_ip,
	                'max_mon_count': scope.zabbix.max_mon_count,
	                'max_mdx_count': scope.zabbix.max_mdx_count,
	                'zabbix_user': scope.zabbix.zabbix_user,
	                'zabbix_password': scope.zabbix.zabbix_password
	            };
	            var cluster_id = $rootScope.clusterId;
	            storageService.updateclusterConf(cluster_id, config).success(function (response) {
	                if (response.success == true) {
	                    scope.zabbix = response.data;
	                    toastService.add('success', gettext('Update Cluster config Success!'));
	                    zabbixLoad.zabbix_get(cluster_id, $rootScope);
	                } else {
	                    toastService.add('error', gettext('Update Cluster config Failed!'));
	                }
	            });
	        };

	        scope.deleteFile = function () {
	            modalInstance.dismiss('deleteFile');
	            modal.open({
	                templateUrl: 'delconfig.html',
	                controller: 'WindowCloseCtrl',
	                windowClass: 'config-del-modal'
	            });
	        };

	        scope.AddProfiles = function () {
	            modalInstance.dismiss('AddProfiles');
	            modal.open({
	                templateUrl: 'AddProfile.html',
	                controller: 'WindowCloseCtrl',
	                windowClass: 'Profile-pul-modal'
	            });
	        };

	        scope.editFile = function () {
	            modalInstance.dismiss('editFile');
	            modal.open({
	                templateUrl: 'modifyconfig.html',
	                controller: 'editFileCtrl',
	                windowClass: 'Profile-edit-modal'
	            });
	        };

	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-border");
	            $(".body-left-nav li").eq(index).addClass("li-border");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }]).controller('clusterInfoWarn', ['$scope', '$rootScope', '$modalInstance', 'msg', function ($scope, $rootScope, $modalInstance, msg) {
	        $scope.errorMsg = msg;
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }]).controller('serverManageCtrl', ['$scope', '$rootScope', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', 'clusterListService', 'data', function ($scope, $rootScope, $modalInstance, storageAPI, toastService, clusterListService, data) {
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.removeServerData = data;
	        $scope.removeServerAction = function (data) {
	            storageAPI.serverAction.delete(data).success(function (res) {
	                $scope.close();
	                if (res.success == true) {
	                    $.each($rootScope.servers, function (i) {
	                        if (data.server_id == $(this).attr('id')) {
	                            $rootScope.servers.splice($.inArray($rootScope.servers[i], $rootScope.servers), 1);
	                        }
	                    });
	                    toastService.add('success', gettext('Successful remove server:') + data.name);
	                } else {
	                    toastService.add('error', gettext('Failed remove server:') + data.name);
	                }
	            });
	        };
	    }]).controller('windowCloseCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }]).controller('modalActionCtrl', ['$scope', '$rootScope', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', 'server', function ($scope, $rootScope, $modalInstance, storageAPI, toastService, server) {
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.server = server;
	        $scope.monAction = {
	            add: function add(id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    server_id: id
	                };
	                storageAPI.serverSetting.addMon(data).success(function (res) {
	                    if (res.success == true) {
	                        toastService.add('success', gettext('Success add mon.'));
	                    } else {
	                        toastService.add('error', gettext('Failed add mon.'));
	                    }
	                });
	            },
	            delete: function _delete(id, mon_id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    server_id: id,
	                    mon_id: mon_id
	                };
	                storageAPI.serverSetting.deleteMon(data).success(function (res) {
	                    if (res.success == true) {
	                        storageAPI.serverSetting.listMons(data).success(function (response) {
	                            if (response.success == true) {
	                                $rootScope.monsList = response.data;
	                            }
	                        });
	                        toastService.add('success', gettext('Success delete mon.'));
	                    }
	                });
	            },
	            start: function start(id, mon_id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    server_id: id,
	                    mon_id: mon_id
	                };
	                storageAPI.serverSetting.startMon(data).success(function (res) {
	                    if (res.success == true) {
	                        toastService.add('success', gettext('Success start mon.'));
	                    }
	                });
	            },
	            stop: function stop(id, mon_id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    server_id: id,
	                    mon_id: mon_id
	                };
	                storageAPI.serverSetting.stopMon(data).success(function (res) {
	                    if (res.success == true) {
	                        toastService.add('success', gettext('Success stop mon.'));
	                    }
	                });
	            }
	        };
	        $scope.mdsAction = {
	            add: function add(id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    server_id: id
	                };
	                storageAPI.serverSetting.addMDS(data).success(function (res) {
	                    if (res.success == true) {
	                        toastService.add('success', gettext('Success add mds.'));
	                    }
	                });
	            },
	            delete: function _delete(id, mds_id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    mds_id: mds_id
	                };
	                storageAPI.serverSetting.deleteMDS(data).success(function (res) {
	                    if (res.success == true) {
	                        toastService.add('success', gettext('Success delete mds.'));
	                    }
	                });
	            },
	            start: function start(id, mds_id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    server_id: id,
	                    mds_id: mds_id
	                };
	                storageAPI.serverSetting.startMds(data).success(function (res) {
	                    if (res.success == true) {
	                        toastService.add('success', gettext('Success start mds.'));
	                    }
	                });
	            },
	            stop: function stop(id, mds_id) {
	                var data = {
	                    cluster_id: $rootScope.clusterId,
	                    server_id: id,
	                    mds_id: mds_id
	                };
	                storageAPI.serverSetting.stopMds(data).success(function (res) {
	                    if (res.success == true) {
	                        toastService.add('success', gettext('Success stop mds.'));
	                    }
	                });
	            }
	        };
	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-border");
	            $(".body-left-nav li").eq(index).addClass("li-border");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }]).controller('MonMdsSettingCtrl', ['$scope', '$rootScope', 'horizon.storage.service', function ($scope, $rootScope, storageAPI) {
	        var cluster_id = $rootScope.clusterId;
	        storageAPI.getclusterConf(cluster_id).success(function (response) {
	            if (response.success == true) {
	                $scope.maxMons = response.data.max_mon_count ? response.data.max_mon_count : 3;
	                $scope.maxMdses = response.data.max_mdx_count ? response.data.max_mdx_count : 3;
	            } else {
	                $rootScope.toastService('error', gettext('Unable to retrieve Clusters.'));
	            }
	        });

	        var data = {
	            cluster_id: cluster_id
	        };

	        storageAPI.serverSetting.listMons(data).success(function (response) {
	            if (response.success == true) {
	                $rootScope.monsList = response.data;
	            } else {
	                $rootScope.toastService('error', gettext('Unable to retrieve mons.'));
	            }
	        });

	        storageAPI.serverSetting.listMDS(data).success(function (response) {
	            if (response.success == true) {
	                $rootScope.mdsesList = response.data;
	            } else {
	                $rootScope.toastService('error', gettext('Unable to retrieve mdses.'));
	            }
	        });
	    }]).controller('editFileCtrl', ["$scope", "$modalInstance", function ($scope, $modalInstance) {
	        $scope.closeWindow = function () {
	            $modalInstance.close();
	        };
	    }]).controller('addOsdCtrl', ['$scope', '$rootScope', '$modalInstance', 'horizon.storage.service', 'server', function ($scope, $rootScope, $modalInstance, storageAPI, server) {

	        $scope.close = function () {
	            $modalInstance.close();
	        };

	        var data = {
	            cluster_id: $rootScope.clusterId,
	            server_id: server.id
	        };

	        $scope.disksIdArray = [];
	        $scope.availDisks = [];
	        $scope.serverId = server;

	        storageAPI.osd.getAvailDisks(data).success(function (res) {
	            $scope.sort = 'name';
	            $scope.sortSelect = gettext('name');
	            $scope.desc = false;
	            $scope.availDisks = res.data;
	        });

	        $scope.osdAdd = function (server_id, disks_id) {
	            $scope.close();
	            var data = {
	                'disks': disks_id
	            };
	            storageAPI.osd.add(server.id, data).success(function (res) {
	                if (res.success == true) {
	                    $rootScope.toastService('success', gettext('Successful add osd.'));
	                    $rootScope.servers_refresh.osdsListGet(server);
	                } else {
	                    $rootScope.toastService('error', gettext('Failed add osd.'));
	                    //$rootScope.servers_refresh.osdsListGet(server);
	                }
	            });
	        };

	        var ssdHasExist = false;

	        $scope.changeAvailDisks = function (e, type) {
	            var $elem = $(e.target);
	            var disk = $elem.attr('id');
	            if (ssdHasExist == true) {
	                if ($elem.hasClass('ok-select')) {
	                    //delete
	                    $elem.removeClass('ok-select');
	                    $scope.disksIdArray.splice($.inArray(disk, $scope.disksIdArray), 1);
	                    if (type == 0) {
	                        ssdHasExist = false;
	                    }
	                } else {
	                    //add
	                    if (type == 0) {
	                        return;
	                    }
	                    $elem.addClass('ok-select');
	                    $scope.disksIdArray.push(disk);
	                }
	            } else {
	                ssdHasExist = true;
	                if ($elem.hasClass('ok-select')) {
	                    //delete
	                    $elem.removeClass('ok-select');
	                    $scope.disksIdArray.splice($.inArray(disk, $scope.disksIdArray), 1);
	                } else {
	                    //add
	                    $elem.addClass('ok-select');
	                    $scope.disksIdArray.push(disk);
	                }
	            }

	            /*if ($elem.hasClass('ok-select')) {//delete
	                    $elem.removeClass('ok-select');
	                    $scope.disksIdArray.splice($.inArray(disk, $scope.disksIdArray, 1))
	                } else {//add
	                    $elem.addClass('ok-select');
	                    $scope.disksIdArray.push(disk);
	                }
	            */
	        };

	        $scope.sortDisks = function (type) {
	            $scope.desc = !$scope.desc;
	            $scope.sortSelect = gettext(type);
	        };
	    }]).controller('noHostDownAction', ['$scope', '$rootScope', '$modalInstance', 'type', function ($scope, $rootScope, $modalInstance, type) {
	        console.log('type---' + type);
	        $scope.actionType = type;
	        $scope.close = function () {
	            $modalInstance.close();
	        };

	        $scope.action = function () {
	            $scope.close();
	            if (type == 'expand') {
	                $rootScope.expandAction();
	            } else {
	                $rootScope.deployAction();
	            }
	        };
	    }]);
	})();

/***/ },
/* 51 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('groupActionCtrl', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', '$modalInstance', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, $modalInstance) {

	        storageAPI.getGroups().success(function (res) {
	            $scope.groupList = res.data;
	        });

	        //open groupManagement   modal
	        $scope.groupManagement = function () {
	            // $modalInstance.close();
	            $modal.open({
	                templateUrl: 'groupManagement.html',
	                controller: 'groupManagementCtrl',
	                windowClass: 'public-management-modal'
	            });
	        };
	        //open  addGroup   modal
	        $scope.addGroup = function () {
	            // $modalInstance.close();
	            $modal.open({
	                templateUrl: 'addGroup.html',
	                controller: 'groupAddCtrl',
	                windowClass: 'public-modal'
	            });
	        };
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }])
	    //groupManagementCtrl
	    .controller('groupManagementCtrl', ['$scope', '$http', '$rootScope', '$modal', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $rootScope, $modal, $modalInstance) {
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        //open groupDelete modal
	        $rootScope.groupDelete = function (size, _id, _name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'groupDelete.html',
	                controller: 'groupDeleteCtrl',
	                size: size,
	                resolve: {
	                    id: function id() {
	                        return _id;
	                    },
	                    name: function name() {
	                        return _name;
	                    }
	                },
	                windowClass: 'group-remove-modal'
	            });
	        };
	    }])
	    //groupEditCtrl
	    .controller('groupEditCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshGroups', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', 'duplication', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshGroups, toastService, id, name, duplication) {

	        $scope.groupname = name;
	        $scope.grouppgnum = pg_num;
	        $scope.groupDupSize = duplication;
	        $scope.group_id = id;
	        $scope.groupId = id;

	        $scope.groupModify = function (groupName, groupPgnum, groupDup) {
	            var data = {
	                storage_group_id: 0,
	                name: groupName,
	                pg_num: groupPgnum,
	                size: groupDup
	            };
	            //put group api
	            storageAPI.groupAction.edit(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful edit group:  ') + data.name);
	                    refreshGroups.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed edit group:  ') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };

	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        // cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	        //click li
	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-border");
	            $(".body-left-nav li").eq(index).addClass("li-border");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //groupAddCtrl
	    .controller('groupAddCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshGroups', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshGroups, toastService) {
	        $scope.newgroup = {
	            name: '',
	            size: ''
	        };
	        // add group action start
	        $scope.AddgroupAction = function () {
	            var data = {
	                name: $scope.newgroup.name,
	                size: $scope.newgroup.size,
	                storage_group_id: 0
	            };
	            storageAPI.groupAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful create group:') + data.name);
	                    refreshGroups.refresh();
	                    $scope.groupList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed create group:') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };

	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.is_show = true;
	        //next
	        $scope.next = function () {
	            $scope.is_show = false;
	        };
	        //prev
	        $scope.prev = function () {
	            $scope.is_show = true;
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	        // next and prev click
	        var $document = $(document);
	        $document.on("click", ".btn-list button.next", function () {
	            $(".btn-list button").css({ 'width': '90px' });
	            $(".btn-list button.cancel").css({ 'margin': '0 20px' });
	        });
	        $document.on("click", ".btn-list button.prev", function () {
	            $(".btn-list button").css({ 'width': '120px' });
	            $(".btn-list button.next").css({ 'margin': '0' });
	        });
	        //click next prev
	        $document.on("click", ".btn-list button", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(".body-content .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //groupDeleteCtrl
	    .controller('groupDeleteCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshGroups', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshGroups, toastService, id, name) {
	        $scope.group_id = id;
	        $scope.removegroupName = name;
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        $scope.removegroupOk = function () {
	            //delete group api
	            var data = {
	                group_id: id
	            };
	            storageAPI.groupAction.delete(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful delete group:') + name);
	                    refreshGroups.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed delete group:') + name);
	                }
	            });
	            $modalInstance.close();
	        };
	    }]).service('refreshGroups', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.getGroups().success(function (res) {
	                $rootScope.groupList = res.data;
	            });
	        };
	    }]);
	})();

/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app')
	    //volumeActionCtrl
	    .controller('volumeActionCtrl ', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', '$modalInstance', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, $modalInstance) {
	        //get volumeList
	        storageAPI.get_volumes().success(function (res) {
	            $scope.volumeList = res.data;
	        });
	        //get volumeSnapshotList
	        storageAPI.get_snapshots().success(function (res) {
	            $scope.data = res.data;
	        });
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }])
	    //volumeAddCtrl
	    .controller('volumeAddCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshVolumes', 'horizon.framework.widgets.toast.service', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshVolumes, toastService, iSCSIName) {
	        $scope.iSCSIName = iSCSIName;
	        $scope.addVolume = {
	            name: '',
	            capacity: '',
	            object_size: ''
	        };
	        $scope.selected = {
	            Size: ''
	        };
	        $scope.selectObj = {
	            "TB": 1024 * 1024 * 1024 * 1024,
	            "GB": 1024 * 1024 * 1024,
	            "MB": 1024 * 1024,
	            "KB": 1024
	        };
	        //add volume start
	        $scope.addVolumeOk = function () {
	            var data = {
	                name: $scope.addVolume.name,
	                capacity: $scope.addVolume.capacity * $scope.selected.Size
	            };
	            storageAPI.volumeAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful create volume:') + data.name);
	                    refreshVolumes.refresh();
	                    $scope.volumeList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed create volume:') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };

	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.is_show = true;
	        //next
	        $scope.next = function () {
	            $scope.is_show = false;
	        };
	        //prev
	        $scope.prev = function () {
	            $scope.is_show = true;
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };

	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	        $document.on("click", ".btn-list button.next", function () {
	            $(".btn-list button").css({ 'width': '90px' });
	            $(".btn-list button.cancel").css({ 'margin': '0 20px' });
	        });
	        $document.on("click", ".btn-list button.prev", function () {
	            $(".btn-list button").css({ 'width': '120px' });
	            $(".btn-list button.next").css({ 'margin': '0' });
	        });
	        $document.on("click", ".btn-list button", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(".body-content .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //volumeExportCtrl
	    .controller('volumeSnapshotCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshVolumes', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshVolumes) {
	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	        $document.on("click", ".btn-list button.next", function () {
	            $(".btn-list button").css({ 'width': '90px' });
	            $(".btn-list button.cancel").css({ 'margin': '0 20px' });
	        });
	        $document.on("click", ".btn-list button.prev", function () {
	            $(".btn-list button").css({ 'width': '120px' });
	            $(".btn-list button.next").css({ 'margin': '0' });
	        });
	        $document.on("click", ".btn-list button", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(".body-content .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //volumeDeleteCtrl
	    .controller('volumeDeleteCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshVolumes', 'horizon.framework.widgets.toast.service', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshVolumes, toastService, id, name) {
	        $scope.volume_id = id;
	        $scope.deleteVolumeName = name;
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        $scope.deleteVolumeOk = function () {
	            //delete volume api
	            var data = {
	                volume_id: id
	            };
	            storageAPI.volumeAction.delete(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful delete volume:') + name);
	                    refreshVolumes.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed delete volume:') + name);
	                }
	            });
	            $modalInstance.close();
	        };
	    }]).service('refreshVolumes', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.get_volumes().success(function (res) {
	                $rootScope.volumeList = res.data;
	            });
	        };
	    }]);
	})();

/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('iSCSIActionCtrl ', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', '$modalInstance', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, $modalInstance) {
	        //get iSCSIs list
	        storageAPI.get_iSCSIs().success(function (res) {
	            $scope.iSCSIList = res.data;
	        });
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }])
	    //iSCSIManagementCtrl
	    .controller('iSCSIManagementCtrl', ['$scope', '$http', '$rootScope', '$modal', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.service', function ($scope, $http, $rootScope, $modal, $modalInstance) {

	        $scope.close = function () {
	            $modalInstance.close();
	        };

	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        //open iSCSIDelete modal
	        $scope.iSCSIDelete = function (_id, _name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'iSCSIDelete.html',
	                controller: 'iSCSIDeleteCtrl',
	                resolve: {
	                    id: function id() {
	                        return _id;
	                    },
	                    name: function name() {
	                        return _name;
	                    }
	                },
	                windowClass: 'public-management-modal'
	            });
	        };
	    }])
	    //iSCSIEditCtrl
	    .controller('iSCSIEditCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshISCSI', 'horizon.framework.widgets.toast.service', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshISCSI, toastService, id, name) {
	        $scope.iSCSIName = name;
	        $scope.iSCSI_id = id;
	        $scope.iSCSIId = id;
	        $scope.editISCSIOk = function (iSCSIName) {
	            var data = {
	                name: iSCSIName
	            };
	            //edit iSCSI api
	            storageAPI.iSCSIAction.edit(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful edit iSCSI:') + data.name);
	                    refreshISCSI.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed edit iSCSI:') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        // cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	    }])
	    //iSCSIAddCtrl
	    .controller('iSCSIAddCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshISCSI', 'horizon.framework.widgets.toast.service', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshISCSI, toastService) {
	        $scope.addiSCSI = {
	            name: ''
	        };
	        // add iSCSI action start
	        $scope.addTargetOk = function () {
	            var data = {
	                name: $scope.addiSCSI.name
	            };
	            storageAPI.iSCSIAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful create iSCSI:') + data.name);
	                    refreshISCSI.refresh();
	                    $scope.iSCSIList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed create iSCSI:') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        // cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	    }])
	    //iSCSIDeleteCtrl
	    .controller('iSCSIDeleteCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshISCSI', 'horizon.framework.widgets.toast.service', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshISCSI, toastService, id, name) {
	        $scope.iSCSI_id = id;
	        $scope.deleteiSCSIName = name;
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        $scope.deleteISCSIOk = function () {
	            //delete iSCSI api
	            var data = {
	                iSCSI_id: id
	            };
	            storageAPI.iSCSIAction.delete(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful delete iSCSI:') + name);
	                    refreshISCSI.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed delete iSCSI:') + name);
	                }
	            });
	            $modalInstance.close();
	        };
	    }]).service('refreshISCSI', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.get_iSCSIs().success(function (res) {
	                $rootScope.iSCSIList = res.data;
	            });
	        };
	    }]);
	})();

/***/ },
/* 54 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app')
	    //rbdActionCtrl
	    .controller('rbdActionCtrl ', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', '$modalInstance', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, $modalInstance) {
	        //get rbdList
	        storageAPI.get_rbds().success(function (res) {
	            $scope.rbdList = res.data;
	        });
	        //get rbdSnapshotList
	        storageAPI.get_snapshots().success(function (res) {
	            $scope.data = res.data;
	        });
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }])
	    //rbdManagementCtrl
	    .controller('rbdManagementCtrl', ['$scope', '$http', '$rootScope', '$modal', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $rootScope, $modal, $modalInstance) {
	        $scope.close = function () {
	            $modalInstance.close();
	        };

	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        //open rbdDelete modal
	        $rootScope.rbdDelete = function (_id, name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'rbdDelete.html',
	                controller: 'rbdDeleteCtrl',
	                resolve: {
	                    id: function id() {
	                        return _id;
	                    },
	                    name: function (_name) {
	                        function name() {
	                            return _name.apply(this, arguments);
	                        }

	                        name.toString = function () {
	                            return _name.toString();
	                        };

	                        return name;
	                    }(function () {
	                        return name;
	                    })
	                },
	                windowClass: 'public-management-modal'
	            });
	        };
	    }])
	    //rbdAddCtrl
	    .controller('rbdAddCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshRbds', 'horizon.framework.widgets.toast.serviceStorage', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshRbds, toastService, poolNames) {
	        $scope.poolNames = poolNames;
	        $scope.addNewRbd = {
	            name: '',
	            capacity: '',
	            object_size: ''
	        };
	        $scope.selected = {
	            Size: ''
	        };
	        $scope.selectObj = {
	            "TB": 1024 * 1024 * 1024 * 1024,
	            "GB": 1024 * 1024 * 1024,
	            "MB": 1024 * 1024,
	            "KB": 1024
	        };
	        //add rbd start
	        $scope.AddRbdAction = function () {
	            //add rbd api
	            var data = {
	                name: $scope.addNewRbd.name,
	                capacity: $scope.addNewRbd.capacity * $scope.selected.Size,
	                object_size: $scope.addNewRbd.object_size
	            };
	            storageAPI.rbdAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful create rbd:') + data.name);
	                    refreshRbds.refresh();
	                    $scope.rbdList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed create rbd:') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.is_show = true;
	        //next
	        $scope.next = function () {
	            $scope.is_show = false;
	        };
	        //prev
	        $scope.prev = function () {
	            $scope.is_show = true;
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };

	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	        $document.on("click", ".btn-list button.next", function () {
	            $(".btn-list button").css({ 'width': '90px' });
	            $(".btn-list button.cancel").css({ 'margin': '0 20px' });
	        });
	        $document.on("click", ".btn-list button.prev", function () {
	            $(".btn-list button").css({ 'width': '120px' });
	            $(".btn-list button.next").css({ 'margin': '0' });
	        });

	        $document.on("click", ".btn-list button", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(".body-content .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //rbdExportCtrl
	    .controller('rbdExportCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshRbds', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshRbds) {

	        $scope.rbdExportAction = function () {
	            $modalInstance.close();
	        };
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.is_show = true;
	        //next
	        $scope.next = function () {
	            $scope.is_show = false;
	        };
	        //prev
	        $scope.prev = function () {
	            $scope.is_show = true;
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };

	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	        $document.on("click", ".btn-list button.next", function () {
	            $(".btn-list button").css({ 'width': '90px' });
	            $(".btn-list button.cancel").css({ 'margin': '0 20px' });
	        });
	        $document.on("click", ".btn-list button.prev", function () {
	            $(".btn-list button").css({ 'width': '120px' });
	            $(".btn-list button.next").css({ 'margin': '0' });
	        });

	        $document.on("click", ".btn-list button", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(".body-content .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //rbdEditCtrl
	    .controller('rbdEditCtrl', ['$scope', '$http', '$rootScope', '$modal', '$modalInstance', 'horizon.storage.service', 'refreshRbds', 'refreshRbdSnapshots', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', 'capacity', 'usedsize', function ($scope, $http, $rootScope, $modal, $modalInstance, storageAPI, refreshRbds, refreshRbdSnapshots, toastService, id, name, capacity, usedsize) {
	        $scope.activities = [{ id: 0, value: "TB", size: 1 }, { id: 1, value: "GB", size: 1 }, { id: 2, value: "MB", size: 1 }, { id: 3, value: "kB", size: 1 }];
	        $scope.selectedSite = '4';

	        var num = capacity;
	        var initCapacity = 0;
	        var selectedSite = 3;
	        if (num >= 1024 * 1024 * 1024 * 1024) {
	            //bytes format to TB
	            initCapacity = (num / (1024 * 1024 * 1024 * 1024)).toFixed(1);
	            selectedSite = 0;
	        } else if (num >= 1024 * 1024 * 1024) {
	            //bytes format to GB
	            initCapacity = (num / (1024 * 1024 * 1024)).toFixed(1);
	            selectedSite = 1;
	        } else if (num >= 1024 * 1024) {
	            //bytes format to MB
	            initCapacity = (num / (1024 * 1024)).toFixed(1);
	            selectedSite = 2;
	        } else if (num >= 1024 || num < 1024) {
	            //bytes format to KB
	            initCapacity = (num / 1024).toFixed(1);
	            selectedSite = 3;
	        }

	        $scope.selectedSite = $scope.activities[selectedSite].id;

	        $scope.rbdName = name;
	        $scope.rbdCapacity = initCapacity;
	        $scope.rbdUsedSize = usedsize;
	        $scope.rbd_id = id;
	        $rootScope.rbdId = id;
	        $scope.rbdModify = function (rbdNames, rbdCapacities, unit) {
	            var formatToBytes = [1024 * 1024 * 1024 * 1024, 1024 * 1024 * 1024, 1024 * 1024, 1024]; //[TB,GB,MB,KB]
	            var capacityBytes = rbdCapacities * formatToBytes[unit];
	            var data = {
	                id: id,
	                name: rbdNames ? rbdNames : name,
	                capacity: capacityBytes,
	                object_size: 0
	            };
	            //edit rbd api
	            storageAPI.rbdAction.edit(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful edit rbd:') + name);
	                    refreshRbds.refresh();
	                    $scope.rbdList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed edit rbd:') + name);
	                }
	            });
	            $modalInstance.close();
	        };
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        //close cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-border");
	            $(".body-left-nav li").eq(index).addClass("li-border");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	        var cluster_id = $rootScope.clusterId;
	        var pool_id = $rootScope.poolId;
	        var rbd_id = $rootScope.rbdId;
	        //get rbdSnapshotList api
	        $http({
	            url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/pools/' + pool_id + '/rbds/' + rbd_id + '/snapshots',
	            type: 'GET'
	        }).success(function (data) {
	            if (data.success == true) {
	                $scope.data = data.data;
	                $rootScope.pageSize = 3;
	                $scope.pages = Math.ceil($scope.data.length / $scope.pageSize);
	                $scope.newPages = $scope.pages > 3 ? 3 : $scope.pages;
	                $scope.pageList = [];
	                $scope.selPage = 1;
	                $scope.setData = function () {
	                    $scope.rbdSnapshotList = $scope.data.slice($scope.pageSize * ($scope.selPage - 1), $scope.selPage * $scope.pageSize);
	                };
	                $scope.rbdSnapshotList = $scope.data.slice(0, $scope.pageSize);
	                $scope.snapshotId = $scope.data.slice(0, $scope.pageSize).id;
	                for (var i = 0; i < $scope.newPages; i++) {
	                    $scope.pageList.push(i + 1);
	                }
	                $scope.selectPage = function (page) {
	                    if (page < 1 || page > $scope.pages) return;
	                    if (page > 2) {
	                        var newPageList = [];
	                        for (var i = page - 3; i < (page + 2 > $scope.pages ? $scope.pages : page + 2); i++) {
	                            newPageList.push(i + 1);
	                        }
	                        $rootScope.pageList = newPageList;
	                    }
	                    $scope.selPage = page;
	                    $scope.setData();
	                    $scope.isActivePage(page);
	                };
	                $scope.isActivePage = function (page) {
	                    return $scope.selPage == page;
	                };
	                $scope.Previous = function () {
	                    $scope.selectPage($scope.selPage - 1);
	                };
	                $scope.Nexts = function () {
	                    $scope.selectPage($scope.selPage + 1);
	                };
	            }
	        });
	        //open createSnapshot modal
	        $scope.createSnapshot = function (size) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'createSnapshot.html',
	                controller: 'createSnapshotCtrl',
	                size: size,
	                windowClass: 'snapshot-public-modal'
	            });
	        };
	        //open editSnapshot modal
	        $scope.editSnapshot = function (size, _id2, name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'editSnapshot.html',
	                controller: 'editSnapshotCtrl',
	                size: size,
	                resolve: {
	                    id: function id() {
	                        return _id2;
	                    },
	                    name: function (_name2) {
	                        function name() {
	                            return _name2.apply(this, arguments);
	                        }

	                        name.toString = function () {
	                            return _name2.toString();
	                        };

	                        return name;
	                    }(function () {
	                        return name;
	                    })
	                },
	                windowClass: 'snapshot-public-modal'
	            });
	        };
	        //open deleteSnapshot modal
	        $scope.deleteSnapshot = function (size, _id3, name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'deleteSnapshot.html',
	                controller: 'deleteSnapshotCtrl',
	                size: size,
	                resolve: {
	                    id: function id() {
	                        return _id3;
	                    },
	                    name: function (_name3) {
	                        function name() {
	                            return _name3.apply(this, arguments);
	                        }

	                        name.toString = function () {
	                            return _name3.toString();
	                        };

	                        return name;
	                    }(function () {
	                        return name;
	                    })
	                },
	                windowClass: 'snapshot-public-modal'
	            });
	        };
	    }])
	    //createSnapshotCtrl
	    .controller('createSnapshotCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', 'refreshRbdSnapshots', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshRbdSnapshots, toastService) {
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.addSnap = {
	            name: ''
	        };
	        $scope.createSnapshotOk = function () {
	            var data = {
	                'name': $scope.addSnap.name
	            };
	            storageAPI.rbdSnapshotsAction.create(data).success(function (res) {
	                $modalInstance.close();
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful create Snapshot:') + name);
	                    refreshRbdSnapshots.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed create Snapshot:') + name);
	                }
	            });
	        };
	    }])
	    //editSnapshotCtrl
	    .controller('editSnapshotCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', 'refreshRbdSnapshots', 'id', 'name', 'rbdCapacity', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshRbdSnapshots, toastService) {
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	        //edit rbdSnapshots
	        $scope.editSnapshotOk = function () {
	            var cluster_id = $rootScope.clusterId;
	            var pool_id = $rootScope.poolId;
	            var rbd_id = $rootScope.rbdId;
	            //add rbd api
	            var url = $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/pools/' + pool_id + '/rbds/' + rbd_id + '/snapshots';
	            var data = {
	                name: 'Snapshot-1'
	            };
	            storageAPI.rbdSnapshotsAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful edit rbdSnapshots:') + name);
	                    refreshRbdSnapshots.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed edit rbdSnapshots:') + name);
	                }
	            });
	        };
	    }]).controller('deleteSnapshotCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', 'refreshRbdSnapshots', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshRbdSnapshots, toastService, id, name) {

	        $scope.deleteSnapshotName = name;
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.deleteSnapshotOk = function () {
	            //delete deleteSnapshot api
	            var data = {
	                snapshot_id: id,
	                name: name
	            };
	            storageAPI.rbdSnapshotsAction.delete(data).success(function (res) {
	                $modalInstance.close();
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful delete Snapshot:') + name);
	                    refreshRbdSnapshots.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed delete Snapshot:') + name);
	                }
	            });
	        };
	    }])
	    //rbdDeleteCtrl
	    .controller('rbdDeleteCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshRbds', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshRbds, toastService, id, name) {
	        $scope.rbd_id = id;
	        $scope.removeRbdName = name;
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        $scope.removeRbdOk = function () {
	            //delete rbd api
	            var data = {
	                rbd_id: id
	            };
	            storageAPI.rbdAction.delete(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful delete rbd:') + name);
	                    refreshRbds.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed delete rbd:') + name);
	                    refreshRbds.refresh();
	                }
	            });
	            $modalInstance.close();
	        };
	    }]).service('refreshRbds', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.get_rbds().success(function (res) {
	                $rootScope.rbdList = res.data;
	            });
	        };
	    }]).service('refreshRbdSnapshots', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.get_snapshots().success(function (res) {
	                $rootScope.data = res.data;
	            });
	        };
	    }]);
	})();

/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('poolActionCtrl ', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', '$modalInstance', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, $modalInstance) {
	        //get pools list
	        storageAPI.get_pools().success(function (res) {
	            $scope.poolList = res.data;
	        });
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	    }])
	    //poolManagementCtrl
	    .controller('poolManagementCtrl', ['$scope', '$http', '$rootScope', '$modal', '$modalInstance', 'horizon.storage.service', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $rootScope, $modal, $modalInstance) {

	        $scope.close = function () {
	            $modalInstance.close();
	        };

	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        //open poolDelete modal
	        $rootScope.poolDelete = function (_id, _name) {
	            $modalInstance.close();
	            $modal.open({
	                templateUrl: 'poolDelete.html',
	                controller: 'poolDeleteCtrl',
	                resolve: {
	                    id: function id() {
	                        return _id;
	                    },
	                    name: function name() {
	                        return _name;
	                    }
	                },
	                windowClass: 'public-management-modal'
	            });
	        };
	    }])
	    //poolEditCtrl
	    .controller('poolEditCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshPools', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', 'pg_num', 'dedup_rate', 'deduplication', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshPools, toastService, id, name, pg_num, dedup_rate, deduplication) {
	        //close modal
	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.poolName = name;
	        $scope.poolPgNum = pg_num;
	        $scope.poolDedupSize = dedup_rate;
	        $scope.duplicationStatus = deduplication;
	        $scope.dup = function () {
	            if ($scope.duplicationStatus = !deduplication) {
	                $scope.duplicationStatus = "True";
	            } else {
	                $scope.duplicationStatus = "False";
	            }
	        };
	        $scope.poolId = id;
	        //editPoolOk start
	        $scope.editPoolOk = function (name, pgNumber, dedupSize) {
	            var data = {
	                storage_group_id: 0,
	                name: name,
	                pg_num: pgNumber,
	                dedup_rate: dedupSize,
	                deduplication: $scope.duplicationStatus ? $scope.duplicationStatus : 'True',
	                pool_id: id
	            };
	            //put pool api
	            storageAPI.poolAction.edit(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful edit pool:  ') + data.name);
	                    refreshPools.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed edit pool:  ') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };
	        // cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };

	        var $document = $(document);
	        $document.on("click", ".body-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-border");
	            $(".body-left-nav li").eq(index).addClass("li-border");
	            $(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //poolAddCtrl
	    .controller('poolAddCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshPools', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshPools, toastService) {
	        $scope.newPool = {
	            name: '',
	            pg_num: '',
	            size: ''
	        };
	        // add pool action start
	        $scope.AddPoolAction = function () {
	            var data = {
	                name: $scope.newPool.name,
	                pg_num: $scope.newPool.pg_num,
	                size: $scope.newPool.size,
	                storage_group_id: 0
	            };
	            storageAPI.poolAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful create pool:') + data.name);
	                    refreshPools.refresh();
	                    $scope.poolList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed create pool:') + data.name);
	                }
	            });
	            $modalInstance.close();
	        };

	        $scope.close = function () {
	            $modalInstance.close();
	        };
	        $scope.is_show = true;
	        //next
	        $scope.next = function () {
	            $scope.is_show = false;
	        };
	        //prev
	        $scope.prev = function () {
	            $scope.is_show = true;
	        };
	        //cancel modal
	        $scope.cancel = function () {
	            $modalInstance.dismiss('cancel');
	        };
	        // next and prev click
	        var $document = $(document);
	        $document.on("click", ".btn-list button.next", function () {
	            $(".btn-list button").css({ 'width': '90px' });
	            $(".btn-list button.cancel").css({ 'margin': '0 20px' });
	        });
	        $document.on("click", ".btn-list button.prev", function () {
	            $(".btn-list button").css({ 'width': '120px' });
	            $(".btn-list button.next").css({ 'margin': '0' });
	        });

	        $document.on("click", ".btn-list button", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -291;
	            $(".body-left .body-left-nav li").removeClass("li-click");
	            $(".body-left-nav li").eq(index).addClass("li-click");
	            $(".body-content .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });
	    }])
	    //poolDeleteCtrl
	    .controller('poolDeleteCtrl', ['$scope', '$http', '$rootScope', '$modalInstance', 'horizon.storage.service', 'refreshPools', 'horizon.framework.widgets.toast.serviceStorage', 'id', 'name', function ($scope, $http, $rootScope, $modalInstance, storageAPI, refreshPools, toastService, id, name) {
	        $scope.pool_id = id;
	        $scope.removePoolName = name;
	        $scope.yes = 'yes';
	        $scope.save = function () {
	            if ($scope.form.$valid) {
	                $scope.test = 'Input correct';
	            } else if ($scope.form.$valid) {
	                $scope.test = 'Input error please re-enter!';
	            } else {
	                $scope.test = 'Please re-enter yes!';
	            }
	        };
	        $scope.cancel = function () {
	            $modalInstance.close();
	        };
	        $scope.removePoolOk = function () {
	            //delete pool api
	            var data = {
	                pool_id: id
	            };
	            storageAPI.poolAction.delete(data).success(function (res) {
	                if (res.success == true) {
	                    toastService.add('success', gettext('Successful delete pool:') + name);
	                    refreshPools.refresh();
	                } else {
	                    toastService.add('error', gettext('Failed delete pool:') + name);
	                }
	            });
	            $modalInstance.close();
	        };
	    }]).service('refreshPools', ['$rootScope', 'horizon.storage.service', function ($rootScope, storageAPI) {
	        this.refresh = function () {
	            storageAPI.get_pools().success(function (res) {
	                $rootScope.poolList = res.data;
	            });
	        };
	    }]);
	})();

/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Copyright 2015 EasyStack Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may
	 * not use this file except in compliance with the License. You may obtain
	 * a copy of the License at
	 *
	 *    http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
	 * License for the specific language governing permissions and limitations
	 * under the License.
	 */
	(function () {
	    'use strict';

	    storageAPI.$inject = ["$http", "$rootScope", "$filter"];
	    angular;
	    angular.module('horizon.app').service('horizon.storage.service', storageAPI);
	    /**
	     * @ngdoc service
	     * @name horizon.storage.service
	     * @description Provides access to Storage storageAPI.
	     */
	    function storageAPI($http, $rootScope, $filter) {

	        var webroot = window.WEBROOT;
	        if (webroot.charAt(webroot.length - 1) == '/') {
	            webroot = webroot.substring(0, webroot.length - 1);
	        }
	        $rootScope.static_url = webroot || '';
	        // Storage
	        this.getClusters = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve Clusters.'));
	            });
	        };
	        //getFolders
	        this.getGroups = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/groups', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve Groups.'));
	            });
	        };
	        //get pools
	        this.get_pools = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve pools.'));
	            });
	        };
	        //get rbds
	        this.get_rbds = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId + '/rbds', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve rbdList.'));
	            });
	        };
	        //get_rbdSnapshots
	        this.get_snapshots = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId + '/rbds/' + $rootScope.rbdId + '/snapshots', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve rbdSnapshot.'));
	            });
	        };
	        //get iSCSIs
	        this.get_iSCSIs = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve iSCSIs.'));
	            });
	        };
	        //get volumes
	        this.get_volumes = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs/' + $rootScope.iSCSIId + '/volumes', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve volumeList.'));
	            });
	        };
	        //getFolders
	        this.getFolders = function (params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/folders', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve Folders.'));
	            });
	        };

	        this.getioHistory = function (cluster_id, type_name, params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/iohistory/' + cluster_id + '/' + type_name, config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve IO History.'));
	            });
	        };

	        this.timeFormat = function (type) {
	            if (type == 0) {
	                //current
	                var timestamp = Number(new Date().getTime()) - 3600000;
	            } else if (type == 1) {
	                //last week
	                var timestamp = Number(new Date().getTime()) - 3600000 * 24 * 7;
	            } else if (type == 2) {
	                //last month, init every month has 30 days
	                var timestamp = Number(new Date().getTime()) - 3600000 * 24 * 30;
	            } else if (type == 3) {
	                //last year
	                var timestamp = Number(new Date().getTime()) - 3600000 * 24 * 365;
	            }

	            var end_timestamp = new Date().getTime();
	            var start_timestamp = new Date(timestamp);
	            var start = $filter("date")(start_timestamp, "yyyy-MM-dd HH:mm:ss");
	            var end = $filter("date")(end_timestamp, "yyyy-MM-dd HH:mm:ss");

	            return { startTime: start, endTime: end };
	        };

	        this.network = {
	            list: function list(params) {
	                var cluster_id = params.clusterId;
	                var server_id = params.serverId;
	                return $http.get($rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/servers/' + server_id + '/networks').error(function () {
	                    $rootScope.toastService('error', gettext('Unable to retrieve networks.'));
	                });
	            },
	            history: function history(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.get($rootScope.static_url + 'api/storage/networkhistory/' + params.serverId + '/' + 'net', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to retrieve network info.'));
	                });
	            },
	            option: function option(title, subTitle, legend, timeData, series) {
	                var option = {
	                    title: {
	                        text: title ? title : '',
	                        subtext: subTitle ? subTitle : ''
	                    },
	                    legend: {
	                        data: legend
	                    },
	                    tooltip: {
	                        trigger: 'axis'
	                    },
	                    grid: {
	                        top: '15%',
	                        bottom: '5%',
	                        left: '9%',
	                        right: '0%',
	                        containLabel: false
	                    },
	                    xAxis: [{
	                        type: 'category',
	                        boundaryGap: false,
	                        data: timeData,
	                        axisLabel: {
	                            textStyle: {
	                                align: 'center'
	                            }
	                        }
	                    }],
	                    yAxis: [{
	                        type: 'value',
	                        axisLabel: {
	                            formatter: ''
	                        }
	                    }],
	                    series: series ? series : []
	                };
	                return option;
	            },
	            cpu_ram_option: function cpu_ram_option(title, legend, timeData, series, grid) {
	                var gridInit = {
	                    top: '23%',
	                    bottom: '1%',
	                    left: '0%',
	                    right: '0%',
	                    containLabel: false
	                };
	                var option = {
	                    title: {
	                        text: title ? title : ''
	                    },
	                    legend: {
	                        data: legend
	                    },
	                    tooltip: {
	                        trigger: 'axis'
	                    },
	                    grid: grid ? grid : gridInit,
	                    xAxis: [{
	                        type: 'category',
	                        boundaryGap: false,
	                        data: timeData
	                    }],
	                    yAxis: [{
	                        type: 'value',
	                        axisLabel: {
	                            formatter: ''
	                        }
	                    }],
	                    series: series ? series : []
	                };
	                return option;
	            }
	        };

	        this.io = {
	            list: function list(params) {
	                var cluster_id = params.clusterId;
	                var server_id = params.serverId;
	                return $http.get($rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/servers/' + server_id + '/osds_capacity/').error(function () {
	                    $rootScope.toastService('error', gettext('Unable to retrieve io list.'));
	                });
	            }
	        };

	        this.osd = {
	            start: function start(server_id, osd_id, params) {
	                var config = params ? { 'params': params } : {};
	                return $http.patch($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/servers/' + server_id + '/osds/' + osd_id + '/osdStart', config).error(function () {
	                    $rootScope.toastService('error', gettext('Osd start failed!'));
	                });
	            },
	            stop: function stop(server_id, osd_id, params) {
	                var config = params ? { 'params': params } : {};
	                return $http.patch($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/servers/' + server_id + '/osds/' + osd_id + '/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Osd stop failed!'));
	                });
	            },
	            add: function add(server_id, params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/servers/' + server_id + '/osds/', config).error(function () {
	                    $rootScope.toastService('error', gettext('Osd add failed!'));
	                });
	            },
	            list: function list(server_id, params) {
	                var config = params ? params : {};
	                return $http.get($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/servers/' + server_id + '/osds/', config);
	            },
	            getAvailDisks: function getAvailDisks(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.get($rootScope.static_url + 'api/storage/availdisks', config);
	            }
	        };

	        this.getclusterConf = function (cluster_id, params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/cluster_conf/' + cluster_id, config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve cluster Config.'));
	            });
	        };

	        this.updateclusterConf = function (cluster_id, params) {
	            return $http.patch($rootScope.static_url + 'api/storage/cluster_conf/' + cluster_id, params).error(function () {
	                $rootScope.toastService('error', gettext('Update Cluster config Failed!'));
	            });
	        };

	        this.clusterAction = {
	            shutDown: function shutDown() {
	                var self = this;
	                return $http.patch($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/stop').error(function () {
	                    $rootScope.toastService('error', gettext('Unable to stop cluster: ') + $rootScope.clusterId);
	                });
	            },
	            start: function start() {
	                return $http.patch($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/start').error(function () {
	                    $rootScope.toastService('error', gettext('Unable to start cluster: ') + $rootScope.clusterId);
	                });
	            },
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create cluster:') + params.name);
	                });
	            },
	            edit: function edit(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/clusters', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to edit cluster:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete cluster:') + params.name);
	                });
	            }
	        };

	        this.deploy = function () {
	            return $http.patch($rootScope.static_url + 'api/storage/deploy/cluster/' + $rootScope.clusterId).error(function () {
	                $rootScope.toastService('error', gettext('Deploy task failed!'));
	            });
	        };

	        this.expand = function () {
	            return $http.patch($rootScope.static_url + 'api/storage/expand/cluster/' + $rootScope.clusterId).error(function () {
	                $rootScope.toastService('error', gettext('Expand task failed!'));
	            });
	        };

	        this.getServerDown = function (cluster_id, params) {
	            var config = params ? { 'params': params } : {};
	            return $http.get($rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/hostDown', config).error(function () {
	                $rootScope.toastService('error', gettext('Unable to retrieve hosts status.'));
	            });
	        };

	        this.serverAction = {
	            restart: function restart(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/servers', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to restart server:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/servers', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to remove server:') + params.name);
	                });
	            }
	        };

	        this.serverSetting = {
	            addMDS: function addMDS(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/mds/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create MDS.'));
	                });
	            },
	            deleteMDS: function deleteMDS(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mds/action', config).error(function () {
	                    toastService.add('success', gettext('Success add Mon.'));
	                    $rootScope.toastService('error', gettext('Unable to delete MDS.'));
	                });
	            },
	            addMon: function addMon(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/mons/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create Mon.'));
	                });
	            },
	            deleteMon: function deleteMon(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mons/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete Mon.'));
	                });
	            }
	        };

	        //group action start
	        this.groupAction = {
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/groups', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create group:') + params.name);
	                });
	            },
	            edit: function edit(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/groups/' + $rootScope.groupId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to edit group:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/groups/' + $rootScope.groupId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete group:') + params.name);
	                });
	            }
	        };
	        //pool action start
	        this.poolAction = {
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create pool:') + params.name);
	                });
	            },
	            edit: function edit(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to edit pool:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + params.pool_id, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete pool:') + params.name);
	                });
	            }
	        };
	        //rbd action start
	        this.rbdAction = {
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId + '/rbds', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create rbd:') + params.name);
	                });
	            },
	            edit: function edit(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId + '/rbds/' + params.id, config).error(function () {
	                    //$rootScope.rbdId
	                    $rootScope.toastService('error', gettext('Unable to edit rbd:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId + '/rbds/' + params.rbd_id, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete rbd:') + params.name);
	                });
	            }
	        };
	        //rbdSnapshotsAction start
	        this.rbdSnapshotsAction = {
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId + '/rbds/' + $rootScope.rbdId + '/snapshots', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create rbdSnapshot:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/pools/' + $rootScope.poolId + '/rbds/' + $rootScope.rbdId + '/snapshots', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete rbdSnapshot:') + params.name);
	                });
	            }
	        };
	        //iSCSI action start
	        this.iSCSIAction = {
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create iSCSI:') + params.name);
	                });
	            },
	            edit: function edit(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs/' + $rootScope.iSCSIId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to edit iSCSI:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs/' + $rootScope.iSCSIId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete iSCSI:') + params.name);
	                });
	            }
	        };
	        //volume action start
	        this.volumeAction = {
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs/' + $rootScope.iSCSIId + '/volumes', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create volume:') + params.name);
	                });
	            },
	            edit: function edit(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs/' + $rootScope.iSCSIId + '/volumes/' + params.id, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to edit volume:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/iSCSIs/' + $rootScope.iSCSIId + '/volumes/' + $rootScope.volumeId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete volume:') + params.name);
	                });
	            }
	        };
	        //folder action start
	        this.folderAction = {
	            create: function create(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/folders', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create folder:') + params.name);
	                });
	            },
	            edit: function edit(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/folders/' + $rootScope.folderId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to edit folder:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/folders/' + $rootScope.folderId, config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete folder:') + params.name);
	                });
	            }
	        };

	        this.deploy = function () {
	            return $http.patch($rootScope.static_url + 'api/storage/deploy/cluster/' + $rootScope.clusterId).error(function () {
	                $rootScope.toastService('error', gettext('Deploy task failed!'));
	            });
	        };

	        this.expand = function () {
	            return $http.patch($rootScope.static_url + 'api/storage/expand/cluster/' + $rootScope.clusterId).error(function () {
	                $rootScope.toastService('error', gettext('Expand task failed!'));
	            });
	        };

	        this.serverAction = {
	            restart: function restart(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/servers', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to restart server:') + params.name);
	                });
	            },
	            delete: function _delete(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.delete($rootScope.static_url + 'api/storage/servers', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to remove server:') + params.name);
	                });
	            }
	        };

	        this.serverSetting = {
	            listMDS: function listMDS(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.get($rootScope.static_url + 'api/storage/mds/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to retrieve mdses.'));
	                });
	            },
	            addMDS: function addMDS(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/mds/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create mds.'));
	                });
	            },
	            deleteMDS: function deleteMDS(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mds/action', config).error(function () {
	                    toastService.add('success', gettext('Success add Mon.'));
	                    $rootScope.toastService('error', gettext('Unable to delete mds.'));
	                });
	            },
	            startMDS: function startMDS(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mds/start', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to start mon.'));
	                });
	            },
	            stopMDS: function stopMDS(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mds/stop', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to stop mon.'));
	                });
	            },
	            listMons: function listMons(params) {
	                var config = params ? { 'params': params } : {};
	                return $http.get($rootScope.static_url + 'api/storage/mons/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to retrieve mdses.'));
	                });
	            },
	            addMon: function addMon(params) {
	                var config = params ? params : {};
	                return $http.post($rootScope.static_url + 'api/storage/mons/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to create mon.'));
	                });
	            },
	            deleteMon: function deleteMon(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mons/action', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to delete mon.'));
	                });
	            },
	            startMon: function startMon(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mon/start', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to start mon.'));
	                });
	            },
	            stopMon: function stopMon(params) {
	                var config = params ? params : {};
	                return $http.put($rootScope.static_url + 'api/storage/mon/stop', config).error(function () {
	                    $rootScope.toastService('error', gettext('Unable to stop mon.'));
	                });
	            }
	        };
	    }
	})();

/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('StTopBarCtrl', ['$scope', '$http', '$modal', '$rootScope', '$interval', 'horizon.storage.service', 'clusterListService', 'horizon.framework.widgets.toast.serviceStorage', function ($scope, $http, $modal, $rootScope, $interval, storageAPI, toastService, clusterListService) {

	        // $rootScope.timerArray = [];
	        //var addserverTimer = [];

	        /*$scope.top_menu_list = [
	            {
	                'type': 'addhost',
	                'text': gettext('Add Host')
	            },
	            */ /*{
	                 'type': 'warning',
	                 'text': gettext('Warning')
	               },
	               {
	                 'type': 'eventLog',
	                 'text': gettext('Event Log')
	               },*/ /*
	                    {
	                    'type': 'config',
	                    'text': gettext('Config')
	                    },
	                    {
	                    'type': 'deploy',
	                    'text': gettext('Deploy')
	                    },
	                    {
	                    'type': 'expand',
	                    'text': gettext('Expand')
	                    },
	                    {
	                    'type': 'start',
	                    'text': gettext('Start')
	                    },
	                    {
	                    'type': 'shutdown',
	                    'text': gettext('Shutdown')
	                    }
	                    ]*/

	        var $document = $(document);
	        $document.on("click", ".modal-zabbix .modal-left-nav li", function () {
	            var $this = $(this);
	            var index = $this.index();
	            var l = index * -330;
	            $this.siblings('li').removeClass("li-border");
	            $this.parent().children('li').eq(index).addClass("li-border");
	            $this.parents('.body-left').next('.body-right').find(" .content-box:eq(0)").stop().animate({ "margin-top": l }, 500);
	        });

	        $scope.ClustersManage = function () {
	            $modal.open({
	                templateUrl: 'clusterManage.html',
	                controller: 'clusterActionCtrl',
	                windowClass: 'cluster-management-modal'
	            });
	        };

	        $scope.AddHost = function () {
	            $modal.open({
	                templateUrl: 'addHost.html',
	                controller: 'windowCloseCtrl',
	                windowClass: 'clusterName-management-modal'
	            });
	        };
	        // $scope.zabbixSetting = function () {
	        //     $modal.open({
	        //         templateUrl: 'zabbixSetting.html',
	        //         controller: 'zabbixSettingFormCtrl',
	        //         windowClass: 'public-modal'
	        //     });
	        // };

	        $rootScope.deployAction = function () {
	            storageAPI.deploy().success(function (data) {
	                if (data.success == true) {
	                    $rootScope.toastService('warning', gettext('Deploy task start!'));
	                    console.log('deploy api response body---' + data);
	                    var job_id = data.data.id;
	                    creatServerResult(job_id);
	                }
	            });
	        };

	        $rootScope.expandAction = function () {
	            storageAPI.expand().success(function (data) {
	                if (data.success == true) {
	                    $rootScope.toastService('warning', gettext('Expand task start!'));
	                    console.log('expand api response body---' + data);
	                    var job_id = data.data.id;
	                    creatServerResult(job_id);
	                }
	            });
	        };

	        $scope.menuList = function (type) {
	            if (type == 'addhost') {
	                //menu -> Add Host
	                $scope.AddHost();
	            } else if (type == 'deploy') {
	                //menu -> deploy\
	                var cluster_id = $rootScope.clusterId;
	                storageAPI.getServerDown(cluster_id).success(function (data) {
	                    if (data.success == true) {
	                        if (data.data.count == 0) {
	                            //0:down   1:up  response:{"data": {"count": 0}, "success": true}
	                            $rootScope.deployAction();
	                        } else {
	                            $modal.open({
	                                templateUrl: 'hostDownConfirm.html',
	                                controller: 'noHostDownAction',
	                                windowClass: 'public-management-modal',
	                                resolve: {
	                                    type: function type() {
	                                        return 'deploy';
	                                    }
	                                }
	                            });
	                        }
	                    } else {
	                        $rootScope.toastService('error', gettext('Unable to depoly.'));
	                    }
	                });
	            } else if (type == 'expand') {
	                //menu -> expand
	                var cluster_id = $rootScope.clusterId;
	                storageAPI.getServerDown(cluster_id).success(function (data) {
	                    if (data.success == true) {
	                        if (data.data.count == 0) {
	                            //0:down   1:up  response:{"data": {"count": 0}, "success": true}
	                            $rootScope.expandAction();
	                        } else {
	                            $modal.open({
	                                templateUrl: 'hostDownConfirm.html',
	                                controller: 'noHostDownAction',
	                                windowClass: 'public-management-modal',
	                                resolve: {
	                                    type: function type() {
	                                        return 'expand';
	                                    }
	                                }
	                            });
	                        }
	                    } else {
	                        $rootScope.toastService('error', gettext('Unable to depoly.'));
	                    }
	                });
	            } else if (type == 'config') {
	                $scope.zabbixSetting();
	            } else if (type == 'start') {
	                storageAPI.clusterAction.start().success(function (res) {
	                    clusterListService.cluster_get($scope);
	                });
	            } else if (type == 'shutdown') {
	                storageAPI.clusterAction.shutDown().success(function (res) {
	                    clusterListService.cluster_get($scope);
	                });
	            }
	        };

	        $scope.changeClusterFreshInfo = function () {
	            $rootScope.changeClusterFreshInfo($rootScope.clusterId, $scope);
	        };

	        $scope.AddHostAction = function (e) {
	            $(e.target).addClass('disabled');
	            var cluster_id = $rootScope.clusterId;
	            var url = $rootScope.static_url + 'api/storage/add_server';

	            $http.post(url, {
	                'servername': $scope.addServer.name,
	                'publicip': $scope.addServer.publicIp,
	                'clusterip': $scope.addServer.externalIp,
	                'username': $scope.addServer.userName,
	                'passwd': $scope.addServer.pass,
	                'cluster_id': cluster_id
	            }).success(function (data) {
	                $scope.close();
	                if (data.success == true) {
	                    var job_id = data.data.id;
	                    $rootScope.clusterInfoAndHostsListRefresh(cluster_id, $scope);
	                    console.log('add server api response body---' + JSON.stringify(data));
	                    $rootScope.toastService('success', gettext('Add server task start:') + $scope.addServer.name);
	                    creatServerResult(job_id);
	                    //$rootScope.timerArray.push({'id': job_id, 'timer': 'addserverTimer'+job_id});
	                } else {
	                    $rootScope.toastService('error', gettext('Add server task failed:') + $scope.addServer.name);
	                }
	            }).error(function () {
	                $scope.close();
	                $rootScope.toastService('error', gettext('Job created failed!'));
	            });
	        };

	        /*var clearTimer = function (job_id) {
	            var timerArray = $rootScope.timerArray
	            console.log("timerArray---"+JSON.stringify(timerArray))
	            for (var i = 0; i < timerArray.length; i++) {
	                if (timerArray[i].id == '111' || timerArray[i].id == '222' ) {
	                    //$interval.cancel('addserverTimer'+job_id);
	                    $scope.$on('$destroy',function(){
	                       $interval.cancel(addserverTimer);
	                   })
	                    $rootScope.timerArray.splice($.inArray($rootScope.timerArray[i], $rootScope.timerArray), 1)
	                }
	            }
	        }*/

	        var creatServerResult = function creatServerResult(job_id) {
	            $http({
	                url: $rootScope.static_url + 'api/storage/job_search',
	                method: 'GET',
	                params: { 'job_id': job_id }
	            }).success(function (data) {
	                if (data.success == true) {
	                    console.log('job_search response body---' + data);
	                    var result = data.data;
	                    var state = result.state; //'QUEUED': 0, 'RUNNING': 1, 'SUCCESS': 2, 'FAILURE': 3, 'REVERTED': 4,'NEED_REVERT': 5, 'CANCELD': 6
	                    var type = result.type; //"add_host_job", "cluster_deploy_job", "cluster_expand_job"
	                    var name = result.properties.name;
	                    var msg = '';
	                    if (state == 2 || state == 3 || state == 4 || state == 5 || state == 6) {
	                        //clearTimer(job_id);
	                        if (state == 2) {
	                            if (type == 'host_add_job') {
	                                msg = 'Succeed add host:' + name;
	                                $scope.changeClusterFreshInfo();
	                            } else if (type == 'cluster_deploy_job') {
	                                msg = 'Succeed deploy:' + name;
	                            } else if (type == 'cluster_expand_job') {
	                                msg = 'Succeed expand:' + name;
	                            }
	                            $rootScope.toastService('success', msg);
	                        } else {
	                            if (type == 'host_add_job') {
	                                msg = 'Failed add host:' + name;
	                                $scope.changeClusterFreshInfo();
	                            } else if (type == 'cluster_deploy_job') {
	                                msg = 'Failed deploy:' + name;
	                            } else if (type == 'cluster_expand_job') {
	                                msg = 'Failed expand:' + name;
	                            }
	                            $rootScope.toastService('error', msg);
	                        }
	                        $scope.changeClusterFreshInfo();
	                    } else {
	                        setTimeout(function () {
	                            creatServerResult(job_id);
	                        }, 10000);
	                    }
	                } else {
	                    $rootScope.toastService('error', gettext('Operation failed!'));
	                }
	            }).error(function () {
	                $rootScope.toastService('error', gettext('Operation failed!'));
	            });
	        };

	        $scope.state = {
	            zh_active: false,
	            en_active: false,
	            select_lang: 'English',
	            zh_text: 'Chinese',
	            en_text: 'English'
	        };
	    }]).controller('languageCtrl', ['$scope', 'language', function ($scope, language) {
	        language.getLanguage($scope);
	        $scope.setLanguage = function (lang) {
	            language.setLanguage($scope, lang);
	        };
	    }]).service('language', ["$http", "$rootScope", function ($http, $rootScope) {

	        this.getLanguage = function (scope) {
	            $http({
	                url: $rootScope.static_url + 'api/language',
	                type: 'GET'
	            }).success(function (data) {
	                if (data == 'zh-cn') {
	                    scope.state.zh_active = true;
	                    scope.state.select_lang = scope.state.zh_text;
	                } else {
	                    scope.state.en_active = true;
	                    scope.state.select_lang = scope.state.en_text;
	                }
	            }).error(function (data) {
	                $rootScope.toastService('error', gettext('Unable to get the language.'));
	            });
	        };
	        this.setLanguage = function (scope, lang) {
	            $http.post($rootScope.static_url + 'api/language/', { 'lang': lang }).success(function (data) {
	                window.location.reload();
	                scope.state.zh_active = false;
	                scope.state.en_active = false;
	                if (lang == 'zh-cn') {
	                    scope.state.zh_active = true;
	                } else {
	                    scope.state.en_active = true;
	                }
	            }).error(function (data) {
	                $rootScope.toastService('error', gettext('Unable to set the language.'));
	            });
	        };
	    }]);
	})();

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    angular.module('horizon.app').controller('StorageCtrl', ['$scope', '$http', '$modal', '$rootScope', 'clusterListService', '$interval', '$filter', 'horizon.storage.service', 'groupListService', 'poolListService', 'iSCSIListService', 'folderListService', 'horizon.framework.widgets.toast.serviceStorage', 'cephConfig', function ($scope, $http, $modal, $rootScope, clusterListService, $interval, $filter, storageAPI, groupListService, poolListService, iSCSIListService, folderListService, toastService, cephConfig) {

	        var index = window.location.pathname.substr(1).indexOf("/");
	        // var static_url = window.location.origin + window.location.pathname.substr(0, index + 2);
	        $rootScope.static_url = window.WEBROOT;
	        $scope.add_cluster_height = $(window).height() - 40 + 'px';

	        $scope.cluster = {
	            name: '',
	            addr: ''
	        };

	        $rootScope.toastService = function (type, msg, msgArray) {
	            toastService.add(type, msg, msgArray);
	        };

	        $scope.setOption = storageAPI.network.option;
	        $scope.setCpuRamOption = storageAPI.network.cpu_ram_option;

	        $scope.timeFormat = function (type) {
	            //if now exist, return now time
	            if (type == 0) {
	                //current
	                var timestamp = Number(new Date().getTime()) - 3600000;
	            } else if (type == 1) {
	                //last week
	                var timestamp = Number(new Date().getTime()) - 3600000 * 24 * 7;
	            } else if (type == 2) {
	                //last month, init every month has 30 days
	                var timestamp = Number(new Date().getTime()) - 3600000 * 24 * 30;
	            } else if (type == 3) {
	                //last year
	                var timestamp = Number(new Date().getTime()) - 3600000 * 24 * 365;
	            }

	            var end_timestamp = new Date().getTime();
	            var start_timestamp = new Date(timestamp);
	            var start = $filter("date")(start_timestamp, "yyyy-MM-dd HH:mm:ss");
	            var end = $filter("date")(end_timestamp, "yyyy-MM-dd HH:mm:ss");

	            return { startTime: start, endTime: end };
	        };

	        $scope.HadNoClusterToAdd = function () {
	            $scope.addClusters = true;
	            $rootScope.nocluster = true;
	        };

	        $scope.AddCluster = function () {
	            $scope.addClusters = true;
	            //add cluster api
	            var data = {
	                'name': $scope.cluster.name,
	                'addr': $scope.cluster.addr
	            };
	            storageAPI.clusterAction.create(data).success(function (res) {
	                if (res.success == true) {
	                    $rootScope.nocluster = false;
	                    toastService.add('success', gettext('Successful create cluster:') + $scope.cluster.name);
	                    $rootScope.clusterList.push(res.data);
	                } else {
	                    toastService.add('error', gettext('Failed create cluster:') + $scope.cluster.name);
	                }
	            });
	        };

	        $scope.clusterInfoWarn = function (status, _msg) {
	            if (status != 0 || status != '0') {
	                $modal.open({
	                    templateUrl: 'clusterInfoWarn.html',
	                    controller: 'clusterInfoWarn',
	                    resolve: {
	                        msg: function msg() {
	                            return _msg;
	                        }
	                    },
	                    windowClass: 'cluster-info-warn-modal'
	                });
	            }
	        };

	        $scope.changeCluster = function (version, clusterId, selectedCluster) {
	            $scope.version = version ? version : 'No version';
	            $rootScope.clusterId = clusterId;
	            $rootScope.selectedCluster = selectedCluster;
	            $(this).parent().hide();
	            $('#tab_views ul li:eq(0) a').tab('show');
	            clusterListService.changeClusterFreshInfo(clusterId, $scope);
	        };

	        $scope.hostBodyTab = function (e) {
	            $scope.editShow = true;
	            e.preventDefault();
	            if (!$(e.target).hasClass('myTab')) {
	                if (e.target.tagName == 'A') {
	                    // click a
	                    $(e.target).tab('show');
	                } else {
	                    //click span angle
	                    $(e.target).siblings('a').tab('show');
	                }
	            }
	            if ($(e.target).parents('.host-body').find('.osd-remove-box').size()) $(e.target).parents('.host-body').find('.osd-remove-box').addClass('hidden');
	        };

	        $rootScope.servers_refresh = {
	            osdsListGet: function osdsListGet(server) {
	                $scope.serverTab.serviceList(server);
	            }
	        };

	        $scope.serverTab = {
	            networkList: function networkList(server) {
	                var params = {
	                    clusterId: $rootScope.clusterId,
	                    serverId: server.id
	                };
	                storageAPI.network.list(params).success(function (data) {
	                    var result = data;
	                    if (result.success == true) {
	                        server.networks = result.data;
	                        if (result.data.length > 0) {
	                            $scope.networkSelect(server, result.data[0]);
	                        }
	                    } else {
	                        toastService.add('error', gettext('Unable to retrieve networks.'));
	                    }
	                });
	            },
	            networkScale: function networkScale(_server_id, _server_name, _net_name) {
	                $modal.open({
	                    templateUrl: 'historyChart.html',
	                    controller: 'networkScaleCtrl',
	                    resolve: {
	                        server_id: function server_id() {
	                            return _server_id;
	                        },
	                        server_name: function server_name() {
	                            return _server_name;
	                        },
	                        net_name: function net_name() {
	                            return _net_name;
	                        }
	                    },
	                    windowClass: 'network-scale-modal'
	                });
	            },
	            serviceList: function serviceList(server) {

	                storageAPI.osd.list(server.id).success(function (res) {
	                    if (res.success == true) {
	                        server.osdsList = res.data;
	                        // server.osdsList.concat(server.mons);
	                        // console.log(server.osdsList);
	                        for (var i = 0; i < $rootScope.servers.length; i++) {
	                            if (server.id == $rootScope.servers[i].id) {
	                                $rootScope.servers[i].osdsList = res.data;
	                            }
	                        }
	                    } else {
	                        server.osdsList = [];
	                    }
	                }).error(function () {
	                    server.osdsList = [];
	                });
	            },
	            IOList: function IOList(server) {
	                var params = {
	                    clusterId: $rootScope.clusterId,
	                    serverId: server.id
	                };
	                storageAPI.io.list(params).success(function (res) {
	                    if (res.success == true) {
	                        server.IO = res.data;
	                    } else {
	                        toastService.add('error', gettext('Unable to retrieve io list.'));
	                    }
	                });
	            }
	        };

	        $scope.serverAction = {
	            restart: function restart(id, name) {
	                var data = {
	                    name: name,
	                    server_id: id,
	                    cluster_id: $rootScope.clusterId
	                };
	                storageAPI.serverAction.restart(data).success(function () {
	                    toastService.add('success', gettext('Successful restart server:') + name);
	                });
	            },
	            remove: function remove(id, name) {
	                var _data = {
	                    name: name,
	                    server_id: id,
	                    cluster_id: $rootScope.clusterId
	                };
	                $modal.open({
	                    templateUrl: 'serverRemove.html',
	                    controller: 'serverManageCtrl',
	                    resolve: {
	                        data: function data() {
	                            return angular.copy(_data);
	                        }
	                    },
	                    windowClass: 'public-management-modal'
	                });
	            }
	        };

	        $scope.networkSelect = function (server, net) {
	            server.netInterface_init = net;
	            var serverId = server.id;
	            var time_span = $scope.timeFormat(0);
	            var config = {
	                'time_from': time_span.startTime,
	                'time_till': time_span.endTime,
	                'name': net.name,
	                'serverId': serverId
	            };
	            storageAPI.network.history(config).success(function (res) {
	                if (res.success == true) {
	                    var data = res.data;
	                    var seriesInArray = [];
	                    var seriesOutArray = [];
	                    var dataInArray = data.in;
	                    var dataOutArray = data.out;
	                    var timeData = [];
	                    if (dataInArray && dataInArray.length > 0) {
	                        for (var i = 0; i < dataInArray.length; i++) {
	                            seriesInArray.push(dataInArray[i].value);
	                            timeData.push(dataInArray[i].time);
	                        }
	                    }
	                    if (dataOutArray && dataOutArray.length > 0) {
	                        for (var i = 0; i < dataOutArray.length; i++) {
	                            seriesOutArray.push(dataOutArray[i].value);
	                        }
	                    }
	                    $scope.network_line_option(serverId, '', [], timeData, seriesInArray, seriesOutArray);
	                } else {
	                    toastService.add('error', gettext('Unable to retrieve network info.'));
	                }
	            });
	        };

	        $scope.network_line_option = function (server, title, legend, timeData, seriesDataIn, seriesDataOut) {
	            //title-str , legend-array , xData-array, series-array
	            var option = {
	                tooltip: {
	                    trigger: 'axis'
	                },
	                // backgroundColor:'white',
	                // backgroundColor: "url(" + window.STATIC_URL + "dashboard/img/storage_img/lines_bg.png)",
	                title: {
	                    text: title ? title : ''
	                },
	                legend: {
	                    data: legend ? legend : []
	                },
	                grid: {
	                    left: '-3%',
	                    right: '-3%',
	                    bottom: '-8%'
	                    //containLabel: true
	                },
	                xAxis: [{
	                    type: 'category',
	                    boundaryGap: false,
	                    data: timeData
	                    //show: false
	                }],
	                yAxis: [{
	                    type: 'value',
	                    axisLabel: {
	                        formatter: ''
	                    }
	                    //show: false
	                }],
	                series: [{
	                    name: 'In',
	                    type: 'line',
	                    stack: '',
	                    symbol: 'none',
	                    itemStyle: {
	                        normal: {
	                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                offset: 1,
	                                color: '#0b84dc'
	                            }, {
	                                offset: 0,
	                                color: 'lightskyblue'
	                            }], false)
	                        }
	                    },
	                    areaStyle: { normal: {} },
	                    data: seriesDataIn
	                }, {
	                    name: 'Out',
	                    type: 'line',
	                    stack: '',
	                    symbol: 'none',
	                    itemStyle: {
	                        normal: {
	                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                offset: 1,
	                                color: '#652b76'
	                            }, {
	                                offset: 0,
	                                color: '#d24c4b'
	                            }], false)
	                        }
	                    },
	                    areaStyle: { normal: {} },
	                    data: seriesDataOut
	                }]
	            };
	            var box_id = 'network-graph-' + server;
	            var myChart = echarts.init(document.getElementById(box_id));
	            $(window).on('resize', function () {
	                myChart.resize();
	            });
	            myChart.setOption(option);
	        };
	        clusterListService.cluster_get($scope);

	        $scope.get_iohistory = function () {
	            $modal.open({
	                templateUrl: 'ioHistory.html',
	                controller: 'lineCtrl',
	                windowClass: 'query-iohistory-modal'
	            });
	        };

	        $scope.zabbixSetting = function () {
	            $modal.open({
	                templateUrl: 'zabbixSetting.html',
	                controller: 'zabbixSettingFormCtrl',
	                // windowClass: 'public-modal',
	                windowClass: 'modal'
	            });
	        };

	        $scope.osdAction = {
	            changeStatus: function changeStatus(e, osd, status) {
	                var $div = $(e.target).parent();
	                if ($div.hasClass('up')) {
	                    $div.removeClass('up');
	                } else if ($div.hasClass('down')) {
	                    $div.removeClass('down');
	                }

	                osd.osdStatus = status;
	                $div.addClass(status);
	            },
	            start: function start(e, server_id, osd) {
	                var self = this;
	                var config = {};
	                var osd_id = osd.osdId;
	                storageAPI.osd.start(server_id, osd_id, config).success(function (res) {
	                    if (res.success == true) {
	                        self.changeStatus(e, osd, res.data.status);
	                        toastService.add('success', gettext('Success start osd.'));
	                    }
	                });
	            },
	            stop: function stop(e, server_id, osd) {
	                var self = this;
	                var config = {};
	                var osd_id = osd.osdId;
	                storageAPI.osd.stop(server_id, osd_id, config).success(function (res) {
	                    if (res.success == true) {
	                        self.changeStatus(e, osd, res.data.status);
	                        toastService.add('success', gettext('Success stop osd.'));
	                    }
	                });
	            },
	            add: function add(_server) {
	                $modal.open({
	                    templateUrl: 'addOsd.html',
	                    controller: 'addOsdCtrl',
	                    resolve: {
	                        server: function server() {
	                            return angular.copy(_server);
	                        }
	                    },
	                    windowClass: 'add-osd-modal'
	                });
	            }
	        };
	        $scope.hostSettings = {
	            management: function management(_server2) {
	                $modal.open({
	                    templateUrl: 'hostSettings.html',
	                    controller: 'modalActionCtrl',
	                    resolve: {
	                        server: function server() {
	                            return _server2;
	                        }
	                    },
	                    windowClass: 'public-modal'
	                });
	            }
	        };

	        //my js start
	        //groupListService js start
	        groupListService.group_get($scope);
	        $scope.editShow = false;
	        $scope.pageTo = function () {
	            $scope.editShow = true;
	        };
	        $scope.addGroup = function () {
	            $("#groupModify").addClass("show");
	            $("#groupAdd").addClass("hide");
	        };
	        $scope.groupAddCancel = function () {
	            $("#groupModify").removeClass("show");
	            $("#groupAdd").removeClass("hide");
	        };
	        //groupListService js end
	        //poolListService js start
	        poolListService.pool_get($scope);
	        $scope.pool = {
	            name: '',
	            pgNum: '',
	            dup: ''
	        };
	        //change pool
	        $scope.changePools = function (poolNames, dedupRate, duplicate, pgNum, crushSize, rq, wq, poolId) {
	            $scope.poolNames = poolNames;
	            $scope.dedupRate = dedupRate ? dedupRate : 'No dedupRate';
	            $scope.duplicate = duplicate ? duplicate : 'No duplicate';
	            $scope.pgNum = pgNum ? pgNum : 'No pgNum';
	            $scope.crushSize = crushSize ? crushSize : 'No crushSize';
	            //$scope.rq = rq;
	            //$scope.wq = wq;
	            $scope.poolId = poolId;
	            $(this).parent().hide();
	            poolListService.changePoolFreshRbd(poolId, $scope);
	        };
	        //open poolManagement modal
	        $scope.poolManage = function (size, _id, _name) {
	            $modal.open({
	                templateUrl: 'poolManagement.html',
	                controller: 'poolManagementCtrl',
	                size: size,
	                resolve: {
	                    id: function id() {
	                        return _id;
	                    },
	                    name: function name() {
	                        return _name;
	                    }
	                },
	                windowClass: 'management-list-modal'
	            });
	        };
	        //open poolConfig modal
	        $scope.poolConfig = function (_id2, _name2, _pg_num, _dedup_rate, _deduplication) {
	            $modal.open({
	                templateUrl: 'poolConfig.html',
	                controller: 'poolEditCtrl',
	                windowClass: 'public-modal',
	                resolve: {
	                    id: function id() {
	                        return _id2;
	                    },
	                    name: function name() {
	                        return _name2;
	                    },
	                    pg_num: function pg_num() {
	                        return _pg_num;
	                    },
	                    deduplication: function deduplication() {
	                        return _deduplication;
	                    },
	                    dedup_rate: function dedup_rate() {
	                        return _dedup_rate;
	                    }
	                }
	            });
	        };
	        //open add_Pool modal
	        $scope.add_Pool = function () {
	            $modal.open({
	                templateUrl: 'addPool.html',
	                controller: 'poolAddCtrl',
	                windowClass: 'public-modal'
	            });
	        };
	        //open addRbd modal
	        $scope.addRbd = function (_name3) {
	            $modal.open({
	                templateUrl: 'addRbd.html',
	                controller: 'rbdAddCtrl',
	                resolve: {
	                    name: function name() {
	                        return _name3;
	                    }
	                },

	                windowClass: 'public-modal'
	            });
	        };
	        //open export  modal
	        $scope.export = function () {
	            $modal.open({
	                templateUrl: 'export.html',
	                controller: 'rbdExportCtrl',

	                windowClass: 'public-modal'
	            });
	        };
	        //open rbdConfig modal
	        $scope.rbdConfig = function (_id3, _name4, _capacity, _usedsize) {
	            $modal.open({
	                templateUrl: 'rbdConfig.html',
	                controller: 'rbdEditCtrl',
	                resolve: {
	                    id: function id() {
	                        return _id3;
	                    },
	                    name: function name() {
	                        return _name4;
	                    },
	                    capacity: function capacity() {
	                        return _capacity;
	                    },
	                    usedsize: function usedsize() {
	                        return _usedsize;
	                    }
	                },
	                windowClass: 'public-modal'
	            });
	            //var cluster_id = $rootScope.clusterId;
	            //var pool_id = $rootScope.poolId;
	            //var rbd_id=id;
	            $rootScope.rbdId = _id3;
	            /*$http({
	                //url:window.STATIC_URL+'horizon/'+'json/tab_pool_rbd.json?', poolList[0].id
	                url:$rootScope.static_url + 'api/storage/clusters/'+cluster_id+'/pools/'+pool_id+'/rbds',
	                type: 'GET'
	            }).success(function (data) {
	                if (data.success == true) {
	                    var rbdList=data.data;
	                    if (rbdList.length > 0) {
	                        $rootScope.rbdList = rbdList;
	                        $scope.rbdId=rbdList[0].id;
	                        $rootScope.rbdId = rbdList[0].id;
	                    }else {
	                        toastService.add('error', gettext('Get rbdList failed!'))
	                    }
	                }
	            });*/
	        };
	        //open rbdManagement modal
	        $scope.rbdManagement = function (size) {
	            $modal.open({
	                templateUrl: 'rbdManagement.html',
	                controller: 'rbdManagementCtrl',
	                size: size,
	                windowClass: 'management-list-modal'
	            });
	        };
	        //poolListService end
	        //iSCSIListService start
	        iSCSIListService.iSCSI_get($scope);
	        //change iSCSI
	        $scope.changeISCSIs = function (iSCSINames, iSCSIId) {
	            $scope.iSCSINames = iSCSINames;
	            $rootScope.iSCSIId = iSCSIId;
	            $(this).parent().hide();
	            iSCSIListService.changeISCSIFreshVolume(iSCSIId, $scope);
	        };
	        //open iSCSIManagement modal
	        $scope.iSCSIManagement = function () {
	            $modal.open({
	                templateUrl: 'iSCSIManagement.html',
	                controller: 'iSCSIManagementCtrl',
	                windowClass: 'public-management-modal'
	            });
	        };
	        //open targetSettings modal
	        $scope.targetSettings = function (_id4, _name5) {
	            $modal.open({
	                templateUrl: 'targetSettings.html',
	                controller: 'iSCSIEditCtrl',
	                windowClass: 'public-management-modal',
	                resolve: {
	                    id: function id() {
	                        return _id4;
	                    },
	                    name: function name() {
	                        return _name5;
	                    }
	                }
	            });
	        };
	        //open addTarget modal
	        $scope.addTarget = function (_name6) {
	            $modal.open({
	                templateUrl: 'addTarget.html',
	                controller: 'iSCSIAddCtrl',
	                resolve: {
	                    name: function name() {
	                        return _name6;
	                    }
	                },

	                windowClass: 'public-management-modal'
	            });
	        };
	        //open addTarget modal
	        $scope.addVolume = function (_name7) {
	            $modal.open({
	                templateUrl: 'addVolume.html',
	                controller: 'volumeAddCtrl',
	                resolve: {
	                    name: function name() {
	                        return _name7;
	                    }
	                },

	                windowClass: 'public-modal'
	            });
	        };
	        //open volumeDelete modal
	        $scope.volumeDelete = function (_id5, _name8) {
	            $modal.open({
	                templateUrl: 'volumeDelete.html',
	                controller: 'volumeDeleteCtrl',
	                resolve: {
	                    id: function id() {
	                        return _id5;
	                    },
	                    name: function name() {
	                        return _name8;
	                    }
	                },
	                windowClass: 'public-management-modal'
	            });
	        };
	        //iSCSIListService end
	        // folderListService js start
	        folderListService.folder_get($scope);
	        //open usrManagement   modal
	        $scope.usrManagement = function () {
	            // $modalInstance.close();
	            $modal.open({
	                templateUrl: 'usrManagement.html',
	                controller: 'usrManagementCtrl',
	                windowClass: 'public-management-modal'
	            });
	        };
	        //open  addNewFolder   modal
	        $scope.addNewFolder = function () {
	            // $modalInstance.close();
	            $modal.open({
	                templateUrl: 'addNewFolder.html',
	                controller: 'folderAddCtrl',
	                windowClass: 'public-modal'
	            });
	        };

	        // folderListService js end
	    }]).service('clusterListService', ['$http', 'horizon.framework.util.http.service', '$interval', '$rootScope', 'zabbixLoad', function ($http, apiService, $interval, $rootScope, zabbixLoad) {
	        var storageMgmt = {
	            timer: false,
	            host_array: [],
	            page_size: 3,
	            initNum: 1,
	            marker: '',
	            lazy_load_new: true,
	            get_cluster_info: function get_cluster_info(clusterId, $scope, refresh) {
	                var self = this;
	                apiService.get('/api/storage/cluster/' + clusterId).success(function (data) {
	                    var result = data;
	                    if (result.success == true) {
	                        var data = data.data;
	                        if (data) {
	                            data.bandwunit = 'M';
	                            if (data.bandwidth >= 1024) {
	                                data.bandwidth = (parseInt(data.bandwidth) / 1024).toFixed(2);
	                                data.bandwunit = 'G';
	                            }
	                            data.status_style = '';
	                            data.status_message = 'Warning';
	                            if (data.status == 0) {
	                                data.status_style = 'health';
	                                data.status_message = 'Health';
	                            }
	                            if (data.status == 2) {
	                                data.status_style = 'error';
	                                data.status_message = 'Error';
	                            }

	                            data.rawUsedforchart = data.rawTotal > 0 ? data.rawUsed / data.rawTotal * 0.9 >= 1 ? 0.9 : data.rawUsed / data.rawTotal * 0.9 : 0;
	                            data.dataUsedforchart = data.dataTotal > 0 ? data.dataUsed / data.dataTotal * 0.9 >= 1 ? 0.9 : data.dataUsed / data.dataTotal * 0.9 : 0;
	                            data.rawUsedpercent = (data.rawTotal > 0 ? (data.rawUsed / data.rawTotal * 100).toFixed(2) : 0) + '%';
	                            data.dataUsedpercent = (data.dataTotal > 0 ? (data.dataUsed / data.dataTotal * 100).toFixed(2) : 0) + '%';
	                            data.rawUsed = data.rawTotal / (1024 * 1024 * 1024 * 1024) >= 1 ? (data.rawUsed / (1024 * 1024 * 1024 * 1024)).toFixed(2) : (data.rawUsed / (1024 * 1024 * 1024)).toFixed(2);
	                            data.dataUsed = data.dataTotal / (1024 * 1024 * 1024 * 1024) >= 1 ? (data.dataUsed / (1024 * 1024 * 1024 * 1024)).toFixed(2) : (data.dataUsed / (1024 * 1024 * 1024)).toFixed(2);

	                            $rootScope.clusterInfo = data;

	                            var data_circles = {
	                                size: 142,
	                                value: data.dataUsedforchart,
	                                thickness: 8,
	                                lineCap: 'round',
	                                fill: { gradient: ['#3680c8', '#3E8DDD'] },
	                                bgfill: { color: '#D9D8D6' },
	                                emptyvalue: .9,
	                                startAngle: Math.PI / 4 * 2
	                            };
	                            var raw_circles = {
	                                size: 190,
	                                value: data.rawUsedforchart,
	                                thickness: 8,
	                                lineCap: 'round',
	                                fill: { gradient: ['#CB548F', '#E2231A'] },
	                                bgfill: { color: '#D9D8D6' },
	                                emptyvalue: .9,
	                                startAngle: Math.PI / 4 * 2
	                            };
	                            angular.element('#data-view').circleProgress(data_circles);
	                            angular.element('#raw-view').circleProgress(raw_circles);

	                            self.marker = '';
	                            self.host_array = [];

	                            if (refresh && refresh == true) {
	                                var serversTotal = data.serversTotal;
	                                self.page_size = serversTotal >= 3 ? serversTotal : 3;
	                            } else {
	                                self.page_size = 3;
	                                self.host_get_lazy($rootScope.clusterId);
	                            }

	                            self.get_host_info($rootScope.clusterId);

	                            //self.get_cluster_info($rootScope.clusterId, $scope);
	                        }
	                    } else {
	                        $rootScope.toastService('error', gettext('Get cluster info failed!'));
	                        //horizon.alert('error', gettext('get cluster info failed!'));
	                    }
	                }).error(function () {
	                    $rootScope.toastService('error', gettext('Get cluster info failed!'));
	                    //horizon.alert('error', gettext('get cluster info failed!'));
	                });
	            },
	            get_host_info: function get_host_info(clusterId, num) {
	                var self = this;

	                $http({
	                    url: $rootScope.static_url + 'api/storage/clusters/' + clusterId + '/pools',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var poolList = data.data;
	                        if (poolList.length > 0) {

	                            poolList.forEach(function (x) {
	                                if (x['name'] == 'compute') {
	                                    $rootScope.replica = x.size;
	                                }
	                            });
	                        }
	                    }
	                });
	                $http({
	                    url: $rootScope.static_url + 'api/storage/servers',
	                    //url:window.STATIC_URL+'horizon/'+'json/servers' + self.marker + '.json?',
	                    type: 'GET',
	                    params: { 'cluster_id': $rootScope.clusterId, 'marker': self.marker, 'pagesize': self.page_size }
	                }).success(function (data) {
	                    var result = data;
	                    if (result.success == true) {
	                        if (result.data && result.data.length > 0) {
	                            for (var i = 0; i < result.data.length; i++) {
	                                var flag = false;
	                                for (var j = 0; j < self.host_array.length; j++) {
	                                    if (result.data[i].id == self.host_array[j].id) {
	                                        flag = true;
	                                    }
	                                }
	                                if (flag == false) {
	                                    self.host_array.push(result.data[i]);
	                                }
	                                $rootScope.servers_refresh.osdsListGet(result.data[i]);
	                            }

	                            if (num && num != '') {
	                                self.initNum++;
	                                self.lazy_load_new = true;
	                            }

	                            self.marker = result.data[result.data.length - 1].id;
	                        }
	                        $rootScope.servers = self.host_array;
	                    }
	                }).error(function () {});
	            },
	            host_get_lazy: function host_get_lazy(id) {
	                var range = 250;
	                var self = this;

	                var totalheight = 0;

	                var serverTotalNum = $rootScope.clusterInfo.serversTotal;
	                var pagesize = self.page_size;
	                var maxnum = Math.ceil(serverTotalNum / pagesize);
	                if (parseFloat(serverTotalNum) > parseFloat(pagesize)) {
	                    // $(document).css('height', parseFloat(window.screen.height) + parseFloat(range))
	                    document.body.style.height = parseFloat(window.screen.height) + parseFloat(range) + 'px';
	                }

	                // setTimeout(function(){
	                //     $("#tab_views").css('margin-bottom',40)
	                // },0)

	                $(window).scroll(function () {
	                    var srollPos = $(window).scrollTop();
	                    totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
	                    if ($(document).height() - range <= totalheight && self.initNum != maxnum) {
	                        if (self.lazy_load_new == true) {
	                            self.lazy_load_new = false;
	                            self.get_host_info(id, self.initNum);
	                        }
	                    }
	                });
	            }
	        };

	        this.changeClusterFreshInfo = function (id, $scope) {
	            storageMgmt.get_cluster_info(id, $scope);
	        };

	        $rootScope.clusterInfoAndHostsListRefresh = function (id, $scope) {
	            setTimeout(function () {
	                storageMgmt.get_cluster_info(id, $scope, true);
	            }, 1000);
	        };

	        $rootScope.changeClusterFreshInfo = function (id, $scope) {
	            storageMgmt.get_cluster_info(id, $scope);
	            storageMgmt.marker = '';
	        };

	        this.cluster_get = function ($scope) {
	            var self = this;
	            //get cluster list
	            $rootScope.zabbixState = { 'zabbixLoading': true };
	            apiService.get('/api/storage/clusters/').success(function (data) {
	                if (data.success == true) {
	                    var clusterList = data.data;
	                    if (clusterList.length > 0) {

	                        zabbixLoad.zabbix_get(clusterList[0].id, $rootScope).then(function () {
	                            $rootScope.nocluster = false;
	                            $rootScope.clusterList = clusterList;
	                            $scope.clusterId = clusterList[0].id;
	                            $rootScope.clusterId = clusterList[0].id;
	                            $rootScope.selectedCluster = clusterList[0];
	                            $scope.version = clusterList[0].version ? clusterList[0].version : 'No version';

	                            storageMgmt.get_cluster_info(clusterList[0].id, $scope);
	                        });

	                        //set timer to get cluster info and host list
	                        /*storageMgmt.timer = setInterval(function(){
	                            storageMgmt.get_cluster_info($rootScope.clusterId ? $rootScope.clusterId :clusterList[0].id, $scope);
	                        },10000);*/
	                    } else {
	                        $rootScope.nocluster = true;
	                        $rootScope.clusterList = [];
	                    }
	                }
	            });
	        };

	        // this.zabbix_get = function(clusterId, $scope) {
	        //     //get zabbix enable status
	        //     $scope.zabbixLoading = true;
	        //     return $http({
	        //         //url:window.STATIC_URL+'horizon/'+'json/clusters.json?',
	        //         url: $rootScope.static_url + 'api/storage/zabbix/status/' + clusterId,
	        //         type: 'GET'
	        //     }).success(function(data) {
	        //         if (data.success == true) {
	        //             let zabbixEnable = data.data;
	        //             $scope.zabbixEnable = zabbixEnable.status == 1 ? true :false;
	        //
	        //             //set timer to get cluster info and host list
	        //             /*storageMgmt.timer = setInterval(function(){
	        //                 storageMgmt.get_cluster_info($rootScope.clusterId ? $rootScope.clusterId :clusterList[0].id, $scope);
	        //             },10000);*/
	        //         } else {
	        //             $scope.zabbixEnable = false;
	        //         }
	        //         $scope.zabbixLoading = false;
	        //
	        //     });
	        // }
	    }]).directive('serverBatch', ["$modal", "$http", "$rootScope", function ($modal, $http, $rootScope) {
	        return {
	            restrict: "C",
	            link: function link(scope, elem, attrs) {
	                //scope.operation = true
	                var server_id = attrs.id;
	                var deleteOsdFlag = 0;
	                var msgArray = [];
	                var osds_id_delete = [];
	                var osds_name_delete = [];
	                scope.osdDelete = function (osd_id) {
	                    var data = {
	                        cluster_id: $rootScope.clusterId,
	                        server_id: server_id,
	                        osd_id: osd_id
	                    };

	                    $http.delete($rootScope.static_url + 'api/storage/clusters/' + $rootScope.clusterId + '/servers/' + server_id + '/osds/' + osd_id + '/action', data).success(function (data) {
	                        if (data.success == true) {
	                            $.each($('.osd-box .osd-click-enable'), function () {
	                                if ($(this).attr('id') == osd_id) {
	                                    $(this).parents('.osd-box').remove();
	                                }
	                            });
	                            deleteOsdFlag++;
	                            msgArray.push(osd_id);
	                            if (deleteOsdFlag == osds_id_delete.length) {
	                                var msg = gettext('Success to remove following OSDs:');
	                                $rootScope.toastService('success', msg, msgArray);
	                                deleteOsdFlag = 0;
	                                msgArray = [];
	                                $('.glyphicon-refresh').remove();
	                            }
	                        } else {
	                            deleteOsdFlag++;
	                            var str = data.result ? data.result : 'can not be removed';
	                            msgArray.push(osd_id + ':' + str);
	                            if (deleteOsdFlag == osds_id_delete.length) {
	                                var msg = gettext('Unable to remove following OSDs:');
	                                $rootScope.toastService('error', msg, msgArray);
	                                deleteOsdFlag = 0;
	                                msgArray = [];
	                                $('.glyphicon-refresh').remove();
	                            }
	                        }
	                    }).error(function () {
	                        deleteOsdFlag++;
	                        var str = data.result ? data.result : 'can not be removed';
	                        msgArray.push(osd_id + ':' + str);
	                        if (deleteOsdFlag == osds_id_delete.length) {
	                            var msg = gettext('Unable to remove following OSDs:');
	                            $rootScope.toastService('error', msg, msgArray);
	                            deleteOsdFlag = 0;
	                            msgArray = [];
	                        }
	                    });
	                };

	                $(elem).find('.server-batch-btn').click(function () {
	                    var $self = $(elem);

	                    $self.find('.server-service-box').addClass('hidden');

	                    var $all_osd_box = $('.right-list').find('.osd-click-enable');
	                    $('.osd-remove-box').addClass('hidden');
	                    $all_osd_box.removeClass('osd-remove-selected').off('click').children('.glyphicon-ok').remove();
	                    $all_osd_box.children('.osd-action').show();

	                    $self.find('.myTab li:eq(1) a').trigger('click');

	                    //$self.hide();
	                    $self.find('.osd-remove-box').removeClass('hidden');
	                    var $osd_box = $self.find('.osd-click-enable');
	                    $osd_box.children('.osd-action').hide();
	                    osds_name_delete = [], osds_id_delete = [];
	                    $self.find('.osd-remove-selected-box').html('');
	                    $osd_box.off('click').on('click', function () {
	                        if (!$(this).children().hasClass('glyphicon-ok')) {
	                            osds_name_delete.push($(this).attr('name'));
	                            osds_id_delete.push($(this).attr('id'));
	                            $(this).addClass('osd-remove-selected').append('<span class="glyphicon glyphicon-ok"></span>');
	                        } else {
	                            osds_name_delete.splice($.inArray($(this).attr('name'), osds_name_delete), 1);
	                            osds_id_delete.splice($.inArray($(this).attr('id'), osds_id_delete), 1);
	                            $(this).removeClass('osd-remove-selected').children('.glyphicon-ok').remove();
	                        }

	                        var html = '';
	                        $.each(osds_name_delete, function (i) {
	                            html += '<div>' + osds_name_delete[i] + '</div>';
	                        });

	                        $self.find('.osd-remove-selected-box').html(html);
	                    });
	                });
	                $(elem).find('.server-remove-btn').click(function () {
	                    var serverName = attrs.name;
	                    var serveId = attrs.id;
	                    var $self = $(this);

	                    $modal.open({
	                        templateUrl: 'deleteOsd.html',
	                        //controller: 'ModalInstanceCtrl',
	                        controller: ["$scope", "$modalInstance", function controller($scope, $modalInstance) {
	                            $scope.modalClose = function () {
	                                $modalInstance.dismiss('cancel');
	                            };
	                            $scope.data = {
	                                server: serverName,
	                                osds_delete: osds_name_delete.join(' ')
	                            };
	                            $scope.deleteOsd = function () {
	                                $self.parent().addClass('hidden');
	                                $self.parent().siblings('.server-service-box').removeClass('hidden');
	                                var $osd_box = $('.right-list').find('.osd-click-enable');
	                                $osd_box.off('click').removeClass('osd-remove-selected').children('.glyphicon-ok').addClass('glyphicon-refresh');
	                                //.children('.glyphicon-ok').remove();

	                                $osd_box.children('.osd-action').show();
	                                $scope.modalClose();

	                                //delete osds
	                                var osdsIdArray = osds_id_delete;

	                                for (var i = 0; i < osdsIdArray.length; i++) {
	                                    scope.osdDelete(osdsIdArray[i]);
	                                }

	                                //scope.modalClose();
	                            };
	                        }],
	                        windowClass: 'delete-osd-modal'
	                    });

	                    /*$self.addClass('hidden')
	                     $self.prev().show();
	                     var $osd_box = $self.parents('.left-option').next('.right-list').find('.osd-click-enable');
	                     $osd_box.children('.glyphicon-ok').remove();
	                     $osd_box.off('click')*/

	                    /*if ($(this).next().hasClass('sub-menu') === false) {
	                     return;
	                     }
	                     console.log("click");*/
	                });
	            }
	        };
	    }]).filter('formatUnit', function () {
	        return function (num) {
	            if (num >= 1024 * 1024 * 1024 * 1024) {
	                //bytes format to TB
	                return (num / (1024 * 1024 * 1024 * 1024)).toFixed(1) + 'TB';
	            } else if (num >= 1024 * 1024 * 1024) {
	                //bytes format to GB
	                return (num / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
	            } else if (num >= 1024 * 1024) {
	                //bytes format to MB
	                return (num / (1024 * 1024)).toFixed(1) + 'MB';
	            } else if (num >= 1024) {
	                //bytes format to KB
	                return (num / 1024).toFixed(1) + ' KB';
	            } else if (num < 1024) {
	                //show bytes
	                return num.toFixed(1) + ' Bytes';
	            }
	        };
	    }).filter('filterDiskType', function () {
	        return function (type) {
	            if (type == 0) {
	                return 'SSD';
	            } else if (type == 1) {
	                return 'SATA';
	            } else if (type == 2) {
	                return 'SAS';
	            } else if (type == 3) {
	                return 'VIRTO';
	            }
	        };
	    }).filter('formatNum', function () {
	        return function (num) {
	            if (num >= 1024 * 1024 * 1024 * 1024) {
	                //bytes format to TB
	                return (num / (1024 * 1024 * 1024 * 1024)).toFixed(2);
	            } else {
	                //bytes format to GB
	                return (num / (1024 * 1024 * 1024)).toFixed(2);
	            }
	        };
	    }).filter('formatUnits', function () {
	        return function (num) {
	            if (num >= 1024 * 1024 * 1024 * 1024) {
	                //bytes format to TB
	                return 'TB';
	            } else {
	                //bytes format to GB
	                return 'GB';
	            }
	        };
	    }).directive('osdList', ["$http", "$rootScope", function ($http, $rootScope) {
	        return {
	            restrict: 'E',
	            link: function link(scope, elem, attr) {
	                var server_id = attr.server;
	                var cluster_id = $rootScope.clusterId;
	                $http({
	                    //url: window.STATIC_URL + 'horizon/' + 'json/osds' +server_id + '.json?',
	                    url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/servers/' + server_id + '/osds/',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        scope.osdsList = data.data;
	                    } else {
	                        scope.osdsList = {};
	                    }
	                });
	            }
	        };
	    }]).directive('hoverGetDisks', ["$http", "$rootScope", function ($http, $rootScope) {
	        return {
	            restrict: 'A',
	            scope: true,
	            controller: ["$scope", function controller($scope) {

	                $scope.changeDisk = function (server_id, item_type, item_name, osd_id) {
	                    $scope.diskSelected = item_name;
	                    $http({
	                        url: $rootScope.static_url + 'api/storage/history/servers/' + server_id + '/item/' + item_type, //get disk iops
	                        type: 'GET',
	                        params: { 'time_from': $scope.timeFormat(0).startTime, 'time_till': $scope.timeFormat(0).endTime, 'item_name': item_name }
	                    }).success(function (data) {
	                        if (data.success == true) {
	                            var res = data.data;
	                            var legend = [];
	                            var timeData = [];
	                            var iopsWaitData = [];
	                            var iopsUtilData = [];
	                            if (res.iopsWait && res.iopsWait.length > 0) {
	                                $.each(res.iopsWait, function (i) {
	                                    timeData.push(res.iopsWait[i].time);
	                                    iopsWaitData.push(res.iopsWait[i].value);
	                                });
	                            }
	                            if (res.iopsUtil && res.iopsUtil.length > 0) {
	                                $.each(res.iopsUtil, function (i) {
	                                    iopsUtilData.push(res.iopsUtil[i].value);
	                                });
	                            }
	                            var series = [{
	                                name: 'IO Await(ms)',
	                                type: 'line',
	                                stack: '',
	                                symbol: 'none',
	                                itemStyle: {
	                                    normal: {
	                                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                            offset: 1,
	                                            color: '#0b84dc'
	                                        }, {
	                                            offset: 0,
	                                            color: 'lightskyblue'
	                                        }], false)
	                                    }
	                                },
	                                areaStyle: { normal: {} },
	                                data: iopsWaitData
	                            }, {
	                                name: 'Utilization (%)',
	                                type: 'line',
	                                stack: '',
	                                symbol: 'none',
	                                itemStyle: {
	                                    normal: {
	                                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                            offset: 1,
	                                            color: '#652b76'
	                                        }, {
	                                            offset: 0,
	                                            color: '#d24c4b'
	                                        }], false)
	                                    }
	                                },
	                                areaStyle: { normal: {} },
	                                data: iopsUtilData
	                            }];
	                            var grid = {
	                                top: '3%',
	                                bottom: '1%',
	                                left: '0%',
	                                right: '0%',
	                                containLabel: false
	                            };
	                            var option = $scope.setCpuRamOption('', legend, timeData, series, grid);
	                            var myChart = echarts.init(document.getElementById('iops-graph-' + server_id + '-' + osd_id));
	                            myChart.setOption(option);
	                        }
	                    });
	                };
	            }],
	            link: function link(scope, elem, attrs) {
	                var cluster_id = $rootScope.clusterId;
	                var server_id = attrs.server;
	                var osd_id = attrs.osd;

	                $http({
	                    //url: window.STATIC_URL + 'horizon/' + 'json/osds' +server_id + '.json?',
	                    url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/servers/' + server_id + '/osds/' + osd_id + '/disks/',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        if (data.data && data.data.length > 0) {
	                            scope.diskSelected = data.data[0].diskName;
	                            $.each(data.data, function (i) {
	                                data.data[i].diskUsedCapacity = Number(data.data[i].diskUsed) / Number(data.data[i].diskTotal) * 100;
	                            });
	                            scope.disksList = data.data;
	                            scope.changeDisk(server_id, 'disk_io', data.data[0].diskName, osd_id);
	                        } else {
	                            scope.disksList = [];
	                        }
	                    }
	                });
	                $(elem).on('mouseover', function () {
	                    $(elem).find('.io-pop').removeClass('hide');
	                });
	                $(elem).on('mouseleave', function () {
	                    $(elem).find('.io-pop').addClass('hide');
	                });
	            }
	        };
	    }]).directive('hoverCpu', ["$http", "$rootScope", "$modal", function ($http, $rootScope, $modal) {
	        return {
	            restrict: 'A',
	            scope: true,
	            link: function link(scope, elem, attrs) {
	                var attrs = eval("(" + attrs.hoverCpu + ")");
	                var server_id = attrs.server;
	                var type = attrs.type;
	                var cluster_id = $rootScope.clusterId;

	                /*function timeFormat(timestamp){
	                    var year=timestamp.getYear();
	                    var month=timestamp.getMonth()+1;
	                    var date=timestamp.getDate();
	                    var hour=timestamp.getHours();
	                    var minute=timestamp.getMinutes();
	                    var second=timestamp.getSeconds();
	                    return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
	                }*/

	                var title = '',
	                    legend = [],
	                    timeData = [],
	                    series = [];
	                var graph_id = 'cpu-chart-' + server_id;

	                $http({
	                    //url: window.STATIC_URL + 'horizon/' + 'json/cpuHistory.json',
	                    url: $rootScope.static_url + 'api/storage/history/servers/' + server_id + '/item/' + type,
	                    type: 'GET',
	                    params: { 'time_from': scope.timeFormat(0).startTime, 'time_till': scope.timeFormat(0).endTime, 'item_name': '' }
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var data = data.data;
	                        timeData = [];
	                        if (type == 'cpu') {
	                            title = 'CPU';
	                            legend = ['system', 'idle', 'user'];
	                            var systemYData = [];
	                            var idleYData = [];
	                            var userYData = [];
	                            if (data.system && data.system.length > 0) {
	                                $.each(data.system, function (i) {
	                                    timeData.push(data.system[i].time);
	                                    systemYData.push(data.system[i].value);
	                                });
	                            }
	                            if (data.idle && data.idle.length > 0) {
	                                $.each(data.idle, function (i) {
	                                    idleYData.push(data.idle[i].value);
	                                });
	                            }
	                            if (data.user && data.user.length > 0) {
	                                $.each(data.user, function (i) {
	                                    userYData.push(data.user[i].value);
	                                });
	                            }
	                            graph_id = 'cpu-chart-' + server_id;
	                            series = [{
	                                name: 'system',
	                                type: 'line',
	                                stack: '',
	                                symbol: 'none',
	                                itemStyle: {
	                                    normal: {
	                                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                            offset: 1,
	                                            color: '#0b84dc'
	                                        }, {
	                                            offset: 0,
	                                            color: 'lightskyblue'
	                                        }], false)
	                                    }
	                                },
	                                areaStyle: { normal: {} },
	                                data: systemYData
	                            }, {
	                                name: 'idle',
	                                type: 'line',
	                                stack: '',
	                                symbol: 'none',
	                                itemStyle: {
	                                    normal: {
	                                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                            offset: 1,
	                                            color: '#652b76'
	                                        }, {
	                                            offset: 0,
	                                            color: '#d24c4b'
	                                        }], false)
	                                    }
	                                },
	                                areaStyle: { normal: {} },
	                                data: idleYData
	                            }, {
	                                name: 'user',
	                                type: 'line',
	                                stack: '',
	                                symbol: 'none',
	                                itemStyle: {
	                                    normal: {
	                                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                            offset: 1,
	                                            color: 'orange'
	                                        }, {
	                                            offset: 0,
	                                            color: '#d24c4b'
	                                        }], false)
	                                    }
	                                },
	                                areaStyle: { normal: {} },
	                                data: userYData
	                            }];
	                        } else {
	                            title = 'Memory';
	                            legend = ['available', 'total'];
	                            var availableYData = [];
	                            var totalYData = [];
	                            if (data.available && data.available.length > 0) {
	                                $.each(data.available, function (i) {
	                                    timeData.push(data.available[i].time);
	                                    availableYData.push(data.available[i].value);
	                                });
	                            }
	                            if (data.total && data.total.length > 0) {
	                                $.each(data.total, function (i) {
	                                    totalYData.push(data.total[i].value);
	                                });
	                            }

	                            graph_id = 'ram-chart-' + server_id;

	                            series = [{
	                                name: 'available',
	                                type: 'line',
	                                stack: '',
	                                symbol: 'none',
	                                itemStyle: {
	                                    normal: {
	                                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                            offset: 1,
	                                            color: '#0b84dc'
	                                        }, {
	                                            offset: 0,
	                                            color: 'lightskyblue'
	                                        }], false)
	                                    }
	                                },
	                                areaStyle: { normal: {} },
	                                data: availableYData
	                            }, {
	                                name: 'total',
	                                type: 'line',
	                                stack: '',
	                                symbol: 'none',
	                                itemStyle: {
	                                    normal: {
	                                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                                            offset: 1,
	                                            color: '#652b76'
	                                        }, {
	                                            offset: 0,
	                                            color: '#d24c4b'
	                                        }], false)
	                                    }
	                                },
	                                areaStyle: { normal: {} },
	                                data: totalYData
	                            }];
	                        }
	                        var option = scope.setCpuRamOption(title, legend, timeData, series);
	                        var myChart = echarts.init(document.getElementById(graph_id));
	                        myChart.setOption(option);
	                    }
	                });

	                $(elem).on('mouseover', function () {
	                    $(elem).find('.cpu-ram-pop').removeClass('hide');
	                });

	                $(elem).on('mouseleave', function () {
	                    $(elem).find('.cpu-ram-pop').addClass('hide');
	                });

	                /* $(elem).on('mouseover',function(){
	                     $http({
	                         url: window.STATIC_URL + 'horizon/' + 'json/cpuHistory.json',
	                         //url: $rootScope.static_url + 'api/storage/history/servers/' + server_id + '/item/cpu/type/realtime',
	                         type: 'GET'
	                     }).success(function (data) {
	                         if (data.success == true) {
	                             */
	                /*$modal.open({
	                                                    templateUrl: 'historyChart.html',
	                                                    controller: function ($scope, $modalInstance) {
	                                                        $scope.modalClose = function () {
	                                                            $modalInstance.dismiss('cancel');
	                                                        };
	                                                        $(elem).on('mouseleave',function(){
	                                                            $scope.modalClose();
	                                                        })
	                                                    },
	                                                    windowClass: 'cpu-iohistory-modal'
	                                                });*/
	                /*
	                                            } else {
	                                             }
	                                        })
	                                    })*/
	            }
	        };
	    }]).controller('networkScaleCtrl', ['$http', '$scope', '$rootScope', 'horizon.storage.service', 'server_id', 'server_name', 'net_name', function ($http, $scope, $rootScope, storageAPI, server_id, server_name, net_name) {
	        var self = this;
	        var cluster_id = $rootScope.clusterId;
	        var type_name = 'network_history';
	        var legend = ['In', 'Out'];
	        var title = server_name;
	        var subtext = net_name;
	        var seriesDataIn = [0, 0, 0, 0, 0],
	            seriesDataOut = [0, 0, 0, 0, 0],
	            timeData = [];
	        var time_span = storageAPI.timeFormat(0);

	        var config = {
	            'time_from': time_span.startTime,
	            'time_till': time_span.endTime,
	            'name': net_name,
	            'serverId': server_id
	        };

	        var series = [{
	            name: 'In',
	            type: 'line',
	            itemStyle: {
	                normal: {
	                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                        offset: 1,
	                        color: '#0b84dc'
	                    }, {
	                        offset: 0,
	                        color: 'lightskyblue'
	                    }], false)
	                }
	            },
	            areaStyle: { normal: {} },
	            data: seriesDataIn
	        }, {
	            name: 'Out',
	            type: 'line',
	            itemStyle: {
	                normal: {
	                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                        offset: 1,
	                        color: '#652b76'
	                    }, {
	                        offset: 0,
	                        color: '#d24c4b'
	                    }], false)
	                }
	            },
	            areaStyle: { normal: {} },
	            data: seriesDataOut
	        }];

	        var drawChart = function drawChart(res) {
	            if (res.success == true) {
	                seriesDataIn = [], seriesDataOut = [], timeData = [];
	                if (res.data.in && res.data.in.length > 0) {
	                    $.each(res.data.in, function (i) {
	                        seriesDataIn.push(res.data.in[i].value);
	                        timeData.push(res.data.in[i].time);
	                    });
	                }

	                if (res.data.out && res.data.out.length > 0) {
	                    $.each(res.data.out, function (i) {
	                        seriesDataOut.push(res.data.out[i].value);
	                    });
	                }

	                series[0].data = seriesDataIn;
	                series[1].data = seriesDataOut;
	                var option = storageAPI.network.option(title, subtext, legend, timeData, series);
	                var myChart = echarts.init(document.getElementById('history_chart'));
	                myChart.setOption(option);
	            }
	        };

	        $scope.networkSwitchTime = function (e, item, index) {
	            $scope.networkTime = item;
	            var time_span = storageAPI.timeFormat(index);
	            config.time_from = time_span.startTime;
	            config.time_till = time_span.endTime;

	            storageAPI.network.history(config).success(function (res) {
	                drawChart(res);
	            });
	        };

	        $scope.time_menulist = [{
	            'typeIndex': 0,
	            'text': gettext('Current')
	        }, {
	            'typeIndex': 1,
	            'text': gettext('Last week')
	        }];

	        storageAPI.network.history(config).success(function (res) {
	            drawChart(res);
	        });
	    }])
	    // groupListService
	    .service('groupListService', ["$http", "$interval", "$rootScope", function ($http, $interval, $rootScope) {
	        //get groupList
	        this.group_get = function ($scope) {
	            $scope.getGroups = function () {
	                $rootScope.editShow = true;
	                //get unGroupDataList
	                $http({
	                    url: window.STATIC_URL + 'easystack_dashboard/js/storage/json/ungroupData.json',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var unGroupDataList = data.data;
	                        console.log(unGroupDataList);
	                        if (unGroupDataList.length > 0) {
	                            $rootScope.unGroupDataList = unGroupDataList;
	                            $scope.unGroupDataListId = unGroupDataList[0].id;
	                            $rootScope.unGroupDataListId = unGroupDataList[0].id;
	                            $scope.unGroupDataListName = unGroupDataList[0].hostName;
	                        }
	                    }
	                });

	                //get groupDataList
	                $http({
	                    url: window.STATIC_URL + 'easystack_dashboard/js/storage/json/groupData.json',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var groupDataList = data.data;
	                        console.log(groupDataList);
	                        if (groupDataList.length > 0) {
	                            $rootScope.groupDataList = groupDataList;
	                            $scope.groupDataListId = groupDataList[0].id;
	                            $rootScope.groupDataListId = groupDataList[0].id;
	                            $scope.groupDataListName = groupDataList[0].groupName;
	                        }
	                    }
	                });
	            };
	        };
	    }])
	    //get pool
	    .service('poolListService', ["$http", "$interval", "$rootScope", function ($http, $interval, $rootScope) {
	        var storageManageRbd = {
	            get_pool_rbd: function get_pool_rbd(id, $scope) {
	                var cluster_id = $scope.clusterId;
	                var pool_id = $scope.poolId;
	                var rbd_id = $scope.rbdId;
	                $http({
	                    url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/pools/' + pool_id + '/rbds',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var rbdList = data.data;
	                        if (rbdList.length > 0) {
	                            //$scope.rbdList = rbdList;
	                            $rootScope.rbdList = rbdList;
	                            $scope.rbdId = rbdList[0].id;
	                            $rootScope.rbdId = rbdList[0].id;
	                            $scope.rbdName = rbdList[0].name ? rbdList[0].name : 'No Rbd';
	                            $scope.rbdCapacity = rbdList[0].capacity ? rbdList[0].capacity : 'No Capacity';
	                            $scope.rbdUsedSize = rbdList[0].usedsize ? rbdList[0].usedsize : 'No usedsize';
	                        } else {
	                            $rootScope.rbdList = [];
	                        }
	                    }
	                });
	            }
	        };

	        this.changePoolFreshRbd = function (id, $scope) {
	            storageManageRbd.get_pool_rbd(id, $scope);
	        };
	        //get pool
	        this.pool_get = function ($scope) {
	            //get poolList
	            $scope.getPools = function () {
	                var cluster_id = $rootScope.clusterId;
	                $http({
	                    url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/pools',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var poolList = data.data;
	                        if (poolList.length > 0) {
	                            $rootScope.poolList = poolList;
	                            $scope.poolId = poolList[0].id;
	                            $rootScope.poolId = poolList[0].id;
	                            $scope.poolNames = poolList[0].name;
	                            $scope.pgNum = poolList[0].pg_num ? poolList[0].pg_num : 'No pg_num';
	                            $scope.duplicate = poolList[0].deduplication ? poolList[0].deduplication : 'No deduplication';
	                            $scope.crushSize = poolList[0].size ? poolList[0].size : 'No size';
	                            $scope.dedupRate = poolList[0].dedup_rate ? poolList[0].dedup_rate : 'No dedup_rate';
	                            $scope.rq = poolList[0].rq;
	                            $scope.wq = poolList[0].wq;
	                            storageManageRbd.get_pool_rbd(poolList[0].id, $scope);
	                        } else if (poolList.length < 0) {
	                            $rootScope.poolList = [];
	                            $rootScope.rbdList = [];
	                            $scope.poolNames = '';
	                            $scope.pgNum = '';
	                            $scope.duplicate = '';
	                            $scope.crushSize = '';
	                        } else {
	                            $rootScope.poolList = [];
	                            $rootScope.rbdList = [];
	                            $scope.poolNames = '';
	                            $scope.pgNum = '';
	                            $scope.duplicate = '';
	                            $scope.crushSize = '';
	                        }
	                    }
	                });
	            };
	        };
	    }])
	    //get iSCSI
	    .service('iSCSIListService', ["$http", "$interval", "$rootScope", function ($http, $interval, $rootScope) {
	        var storageManageVolume = {
	            get_iSCSI_volume: function get_iSCSI_volume(id, $scope) {
	                var cluster_id = $rootScope.clusterId;
	                var iSCSI_id = $rootScope.iSCSIId;
	                var volume_id = $rootScope.volumeId;
	                $http({
	                    //url:window.STATIC_URL+'easystack_dashboard/js/storage/json/volume.json',
	                    url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/iSCSIs/' + iSCSI_id + '/volumes',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var volumeList = data.data;
	                        if (volumeList.length > 0) {
	                            $scope.volumeList = volumeList;
	                            $rootScope.volumeList = volumeList;
	                            $scope.volumeId = volumeList[0].id;
	                            $rootScope.volumeId = volumeList[0].id;
	                            $scope.volumeName = volumeList[0].name;
	                            $scope.volumeCapacity = volumeList[0].capacity ? volumeList[0].capacity : 'No Capacity';
	                        }
	                    }
	                });
	            }
	        };

	        this.changeISCSIFreshVolume = function (id, $scope) {
	            storageManageVolume.get_iSCSI_volume(id, $scope);
	        };
	        //get iSCSI
	        this.iSCSI_get = function ($scope) {
	            //get iSCSIList
	            $scope.getiSCSI = function () {
	                var cluster_id = $rootScope.clusterId;
	                $http({
	                    //url:window.STATIC_URL+'easystack_dashboard/js/storage/json/iSCSI.json',
	                    url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/iSCSIs',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var iSCSIList = data.data;
	                        if (iSCSIList.length > 0) {
	                            $rootScope.iSCSIList = iSCSIList;
	                            $scope.iSCSIId = iSCSIList[0].id;
	                            $rootScope.iSCSIId = iSCSIList[0].id;
	                            $scope.iSCSINames = iSCSIList[0].name;
	                            storageManageVolume.get_iSCSI_volume(iSCSIList[0].id, $scope);
	                        }
	                    }
	                });
	            };
	        };
	    }])
	    // folderListService
	    .service('folderListService', ["$http", "$interval", "$rootScope", function ($http, $interval, $rootScope) {
	        //get groupList
	        this.folder_get = function ($scope) {
	            $scope.getFolder = function () {
	                var cluster_id = $rootScope.clusterId;
	                $http({
	                    url: $rootScope.static_url + 'api/storage/clusters/' + cluster_id + '/folders',
	                    //url:window.STATIC_URL+'easystack_dashboard/js/storage/json/folder.json',
	                    type: 'GET'
	                }).success(function (data) {
	                    if (data.success == true) {
	                        var folderList = data.data;
	                        console.log(folderList);
	                        if (folderList.length > 0) {
	                            $rootScope.folderList = folderList;
	                            $scope.folderId = folderList[0].id;
	                            $rootScope.folderId = folderList[0].id;
	                            $scope.folderName = folderList[0].name;
	                        }
	                    }
	                });
	            };
	        };
	    }])
	    //for host adding and deploying ui
	    .directive('deployCircle', ["$http", "$rootScope", function ($http, $rootScope) {
	        var serverStateLoad = function serverStateLoad(id) {
	            var c = document.getElementById(id),
	                ctx = c.getContext('2d'),
	                cw = c.width = 300,
	                ch = c.height = 250,
	                rand = function rand(a, b) {
	                return Math.random() * (b - a + 1) + a;
	            },
	                dToR = function dToR(degrees) {
	                return degrees * (Math.PI / 30);
	            },
	                circle = {
	                x: cw / 2 + 5,
	                y: ch / 2 + 22,
	                radius: 70,
	                speed: 2,
	                rotation: 0,
	                angleStart: 270,
	                angleEnd: 90,
	                hue: 220,
	                thickness: 8,
	                blur: 25
	            },
	                particles = [],
	                particleMax = 100,
	                updateCircle = function updateCircle() {
	                if (circle.rotation < 360) {
	                    circle.rotation += circle.speed;
	                } else {
	                    circle.rotation = 0;
	                }
	            },
	                renderCircle = function renderCircle() {
	                ctx.save();
	                ctx.translate(circle.x, circle.y);
	                ctx.rotate(dToR(circle.rotation));
	                ctx.beginPath();
	                ctx.arc(0, 0, circle.radius, dToR(circle.angleStart), dToR(circle.angleEnd), true);
	                ctx.lineWidth = circle.thickness;
	                ctx.strokeStyle = gradient1;
	                ctx.stroke();
	                ctx.restore();
	            },
	                renderCircleBorder = function renderCircleBorder() {
	                ctx.save();
	                ctx.translate(circle.x, circle.y);
	                ctx.rotate(dToR(circle.rotation));
	                ctx.beginPath();
	                ctx.arc(0, 0, circle.radius + circle.thickness / 2, dToR(circle.angleStart), dToR(circle.angleEnd), true);
	                ctx.lineWidth = 2;
	                ctx.stroke();
	                ctx.restore();
	            },
	                renderCircleFlare = function renderCircleFlare() {
	                ctx.save();
	                ctx.translate(circle.x, circle.y);
	                ctx.rotate(dToR(circle.rotation + 165));
	                ctx.scale(1.5, 1);
	                ctx.beginPath();
	                ctx.arc(0, circle.radius, 25, 0, Math.PI * 2, false);
	                ctx.closePath();
	                var gradient4 = ctx.createRadialGradient(0, circle.radius, 0, 0, circle.radius, 25);
	                gradient4.addColorStop(0, 'hsla(30, 100%, 50%, .2)');
	                gradient4.addColorStop(1, 'hsla(30, 100%, 50%, 0)');
	                ctx.fillStyle = gradient4;
	                ctx.fill();
	                ctx.restore();
	            },
	                updateParticles = function updateParticles() {
	                var i = particles.length;
	                while (i--) {
	                    var p = particles[i];
	                    p.vx += (rand(0, 100) - 50) / 750;
	                    p.vy += (rand(0, 100) - 50) / 750;
	                    p.x += p.vx;
	                    p.y += p.vy;
	                    p.alpha -= .01;

	                    if (p.alpha < .02) {
	                        particles.splice(i, 1);
	                    }
	                }
	            },
	                clear = function clear() {
	                ctx.globalCompositeOperation = 'destination-out';
	                ctx.fillStyle = 'rgba(0, 0, 0, .1)';
	                ctx.fillRect(0, 0, cw, ch);
	                ctx.globalCompositeOperation = 'lighter';
	            },
	                loop = function loop() {
	                clear();
	                updateCircle();
	                renderCircle();
	                renderCircleBorder();
	                renderCircleFlare();
	                updateParticles();
	            };

	            /* Set Constant Properties */
	            ctx.shadowBlur = circle.blur;
	            ctx.shadowColor = 'hsla(' + circle.hue + ', 80%, 60%, 1)';
	            ctx.lineCap = 'round';

	            var gradient1 = ctx.createLinearGradient(0, -circle.radius, 0, circle.radius);
	            gradient1.addColorStop(0, 'hsla(' + circle.hue + ', 60%, 50%, .25)');
	            gradient1.addColorStop(1, 'hsla(' + circle.hue + ', 60%, 50%, 0)');

	            /* Loop It, Loop It Good */
	            setInterval(loop, 16);
	        };
	        return {
	            restrict: 'C',
	            link: function link(scope, elem, attrs) {
	                var server_id = attrs.id;
	                var raw_circles = {
	                    size: 100,
	                    value: 0.2,
	                    thickness: 3,
	                    lineCap: 'round',
	                    fill: { gradient: ['#367ec4', '#53c9d4'] },
	                    bgfill: { color: '#27272c' },
	                    emptyvalue: .5,
	                    startAngle: Math.PI / 4 * 2,
	                    animationStartValue: 0.0,
	                    animation: {
	                        duration: 1200,
	                        easing: 'circleProgressEasing'
	                    }
	                };
	                setTimeout(function () {
	                    serverStateLoad(server_id);
	                }, 10);
	            }
	        };
	    }]);
	})();

/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Created by root on 17-3-29.
	 */
	(function () {
	    'use strict';

	    /**
	    * @ngdoc service
	    * @name horizon.storage.service
	    * @description Provides access to Storage storageAPI.
	    */

	    // angular

	    angular.module('horizon.app').service('zabbixLoad', ['$rootScope', '$http', function ($rootScope, $http) {
	        // $rootScope.zabbixState = {'zabbixLoading':'','zabbixEnable':''}
	        this.zabbix_get = function (clusterId, $rootScope) {
	            //get zabbix enable status
	            $rootScope.zabbixState.zabbixLoading = true;
	            return $http({
	                //url:window.STATIC_URL+'horizon/'+'json/clusters.json?',
	                url: $rootScope.static_url + 'api/storage/zabbix/status/' + clusterId,
	                type: 'GET'
	            }).success(function (data) {
	                if (data.success == true) {
	                    var zabbixEnable = data.data;
	                    $rootScope.zabbixState.zabbixEnable = zabbixEnable.status == 1 ? true : false;

	                    //set timer to get cluster info and host list
	                    /*storageMgmt.timer = setInterval(function(){
	                     storageMgmt.get_cluster_info($rootScope.clusterId ? $rootScope.clusterId :clusterList[0].id, $scope);
	                     },10000);*/
	                } else {
	                    $rootScope.zabbixState.zabbixEnable = false;
	                }
	                $rootScope.zabbixState.zabbixLoading = false;
	            });
	        };
	    }]);
	})();

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(61);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(19)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/.0.26.2@css-loader/index.js!../../../node_modules/.1.3.2@postcss-loader/index.js!../../../node_modules/.4.1.1@sass-loader/index.js!./horizon_storage.scss", function() {
				var newContent = require("!!../../../node_modules/.0.26.2@css-loader/index.js!../../../node_modules/.1.3.2@postcss-loader/index.js!../../../node_modules/.4.1.1@sass-loader/index.js!./horizon_storage.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(18)();
	// imports


	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/* Bootstrap variables overrides */\n/* This file contains any custom SCSS mixins that can be shared */\n/* For more information on the benefits of Sass mixins and the @mixin syntax,\n * check out http://www.sass-lang.com/guide#topic-6\n */\n/*!\n * Bootstrap v3.3.7 (http://getbootstrap.com)\n * Copyright 2011-2016 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */\n/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */\nhtml {\n  font-family: sans-serif;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%; }\n\nbody {\n  margin: 0; }\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block; }\n\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n  vertical-align: baseline; }\n\naudio:not([controls]) {\n  display: none;\n  height: 0; }\n\n[hidden],\ntemplate {\n  display: none; }\n\na {\n  background-color: transparent; }\n\na:active,\na:hover {\n  outline: 0; }\n\nabbr[title] {\n  border-bottom: 1px dotted; }\n\nb,\nstrong {\n  font-weight: bold; }\n\ndfn {\n  font-style: italic; }\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0; }\n\nmark {\n  background: #ff0;\n  color: #000; }\n\nsmall {\n  font-size: 80%; }\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsup {\n  top: -0.5em; }\n\nsub {\n  bottom: -0.25em; }\n\nimg {\n  border: 0; }\n\nsvg:not(:root) {\n  overflow: hidden; }\n\nfigure {\n  margin: 1em 40px; }\n\nhr {\n  box-sizing: content-box;\n  height: 0; }\n\npre {\n  overflow: auto; }\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em; }\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  color: inherit;\n  font: inherit;\n  margin: 0; }\n\nbutton {\n  overflow: visible; }\n\nbutton,\nselect {\n  text-transform: none; }\n\nbutton,\nhtml input[type=\"button\"],\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n  -webkit-appearance: button;\n  cursor: pointer; }\n\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default; }\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  border: 0;\n  padding: 0; }\n\ninput {\n  line-height: normal; }\n\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  box-sizing: border-box;\n  padding: 0; }\n\ninput[type=\"number\"]::-webkit-inner-spin-button,\ninput[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto; }\n\ninput[type=\"search\"] {\n  -webkit-appearance: textfield;\n  box-sizing: content-box; }\n\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em; }\n\nlegend {\n  border: 0;\n  padding: 0; }\n\ntextarea {\n  overflow: auto; }\n\noptgroup {\n  font-weight: bold; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0; }\n\ntd,\nth {\n  padding: 0; }\n\n/*! Source: https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css */\n@media print {\n  *,\n  *:before,\n  *:after {\n    background: transparent !important;\n    color: #000 !important;\n    box-shadow: none !important;\n    text-shadow: none !important; }\n  a,\n  a:visited {\n    text-decoration: underline; }\n  a[href]:after {\n    content: \" (\" attr(href) \")\"; }\n  abbr[title]:after {\n    content: \" (\" attr(title) \")\"; }\n  a[href^=\"#\"]:after,\n  a[href^=\"javascript:\"]:after {\n    content: \"\"; }\n  pre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid; }\n  thead {\n    display: table-header-group; }\n  tr,\n  img {\n    page-break-inside: avoid; }\n  img {\n    max-width: 100% !important; }\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3; }\n  h2,\n  h3 {\n    page-break-after: avoid; }\n  .navbar {\n    display: none; }\n  .btn > .caret,\n  .dropup > .btn > .caret {\n    border-top-color: #000 !important; }\n  .label {\n    border: 1px solid #000; }\n  .table {\n    border-collapse: collapse !important; }\n    .table td,\n    .table th {\n      background-color: #fff !important; }\n  .table-bordered th,\n  .table-bordered td {\n    border: 1px solid #ddd !important; } }\n\n* {\n  box-sizing: border-box; }\n\n*:before,\n*:after {\n  box-sizing: border-box; }\n\nhtml {\n  font-size: 10px;\n  -webkit-tap-highlight-color: transparent; }\n\nbody {\n  font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 12px;\n  line-height: 1.42857;\n  color: #666666;\n  background-color: #fff; }\n\ninput,\nbutton,\nselect,\ntextarea {\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit; }\n\na {\n  color: #3399ff;\n  text-decoration: none; }\n  a:hover, a:focus {\n    color: #0073e6;\n    text-decoration: underline; }\n  a:focus {\n    outline: 5px auto -webkit-focus-ring-color;\n    outline-offset: -2px; }\n\nfigure {\n  margin: 0; }\n\nimg {\n  vertical-align: middle; }\n\n.img-responsive {\n  display: block;\n  max-width: 100%;\n  height: auto; }\n\n.img-rounded {\n  border-radius: 6px; }\n\n.img-thumbnail {\n  padding: 4px;\n  line-height: 1.42857;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 2px;\n  -webkit-transition: all 0.2s ease-in-out;\n  transition: all 0.2s ease-in-out;\n  display: inline-block;\n  max-width: 100%;\n  height: auto; }\n\n.img-circle {\n  border-radius: 50%; }\n\nhr {\n  margin-top: 17px;\n  margin-bottom: 17px;\n  border: 0;\n  border-top: 1px solid #eeeeee; }\n\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: -1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0; }\n\n.sr-only-focusable:active, .sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto; }\n\n[role=\"button\"] {\n  cursor: pointer; }\n\nh1, h2, h3, h4, h5, h6,\n.h1, .h2, .h3, .h4, .h5, .h6 {\n  font-family: inherit;\n  font-weight: 500;\n  line-height: 1.1;\n  color: inherit; }\n  h1 small,\n  h1 .small, h2 small,\n  h2 .small, h3 small,\n  h3 .small, h4 small,\n  h4 .small, h5 small,\n  h5 .small, h6 small,\n  h6 .small,\n  .h1 small,\n  .h1 .small, .h2 small,\n  .h2 .small, .h3 small,\n  .h3 .small, .h4 small,\n  .h4 .small, .h5 small,\n  .h5 .small, .h6 small,\n  .h6 .small {\n    font-weight: normal;\n    line-height: 1;\n    color: #CCC; }\n\nh1, .h1,\nh2, .h2,\nh3, .h3 {\n  margin-top: 17px;\n  margin-bottom: 8.5px; }\n  h1 small,\n  h1 .small, .h1 small,\n  .h1 .small,\n  h2 small,\n  h2 .small, .h2 small,\n  .h2 .small,\n  h3 small,\n  h3 .small, .h3 small,\n  .h3 .small {\n    font-size: 65%; }\n\nh4, .h4,\nh5, .h5,\nh6, .h6 {\n  margin-top: 8.5px;\n  margin-bottom: 8.5px; }\n  h4 small,\n  h4 .small, .h4 small,\n  .h4 .small,\n  h5 small,\n  h5 .small, .h5 small,\n  .h5 .small,\n  h6 small,\n  h6 .small, .h6 small,\n  .h6 .small {\n    font-size: 75%; }\n\nh1, .h1 {\n  font-size: 18px; }\n\nh2, .h2 {\n  font-size: 18px; }\n\nh3, .h3 {\n  font-size: 15px; }\n\nh4, .h4 {\n  font-size: 14px; }\n\nh5, .h5 {\n  font-size: 12px; }\n\nh6, .h6 {\n  font-size: 11px; }\n\np {\n  margin: 0 0 8.5px; }\n\n.lead {\n  margin-bottom: 17px;\n  font-size: 13px;\n  font-weight: 300;\n  line-height: 1.4; }\n  @media (min-width: 768px) {\n    .lead {\n      font-size: 18px; } }\n\nsmall,\n.small {\n  font-size: 116%; }\n\nmark,\n.mark {\n  background-color: #fcf8e3;\n  padding: .2em; }\n\n.text-left {\n  text-align: left; }\n\n.text-right {\n  text-align: right; }\n\n.text-center {\n  text-align: center; }\n\n.text-justify {\n  text-align: justify; }\n\n.text-nowrap {\n  white-space: nowrap; }\n\n.text-lowercase {\n  text-transform: lowercase; }\n\n.text-uppercase, .initialism {\n  text-transform: uppercase; }\n\n.text-capitalize {\n  text-transform: capitalize; }\n\n.text-muted {\n  color: #CCC; }\n\n.text-success {\n  color: #3c763d; }\n\na.text-success:hover,\na.text-success:focus {\n  color: #2b542c; }\n\n.text-info {\n  color: #3c6e9f; }\n\na.text-info:hover,\na.text-info:focus {\n  color: #2e547a; }\n\n.text-warning {\n  color: #8a6d3b; }\n\na.text-warning:hover,\na.text-warning:focus {\n  color: #66512c; }\n\n.text-danger {\n  color: #e36159; }\n\na.text-danger:hover,\na.text-danger:focus {\n  color: #dc372d; }\n\n.bg-primary {\n  color: #fff; }\n\n.bg-success {\n  background-color: #dff0d8; }\n\na.bg-success:hover,\na.bg-success:focus {\n  background-color: #c1e2b3; }\n\n.bg-info {\n  background-color: #d9edf7; }\n\na.bg-info:hover,\na.bg-info:focus {\n  background-color: #afd9ee; }\n\n.bg-warning {\n  background-color: #fcf8e3; }\n\na.bg-warning:hover,\na.bg-warning:focus {\n  background-color: #f7ecb5; }\n\n.bg-danger {\n  background-color: #f2dede; }\n\na.bg-danger:hover,\na.bg-danger:focus {\n  background-color: #e4b9b9; }\n\n.page-header {\n  padding-bottom: 7.5px;\n  margin: 34px 0 17px;\n  border-bottom: 1px solid #eeeeee; }\n\nul,\nol {\n  margin-top: 0;\n  margin-bottom: 8.5px; }\n  ul ul,\n  ul ol,\n  ol ul,\n  ol ol {\n    margin-bottom: 0; }\n\n.list-unstyled {\n  padding-left: 0;\n  list-style: none; }\n\n.list-inline {\n  padding-left: 0;\n  list-style: none;\n  margin-left: -5px; }\n  .list-inline > li {\n    display: inline-block;\n    padding-left: 5px;\n    padding-right: 5px; }\n\ndl {\n  margin-top: 0;\n  margin-bottom: 17px; }\n\ndt,\ndd {\n  line-height: 1.42857; }\n\ndt {\n  font-weight: bold; }\n\ndd {\n  margin-left: 0; }\n\n.dl-horizontal dd:before, .dl-horizontal dd:after {\n  content: \" \";\n  display: table; }\n\n.dl-horizontal dd:after {\n  clear: both; }\n\n@media (min-width: 768px) {\n  .dl-horizontal dt {\n    float: left;\n    width: 160px;\n    clear: left;\n    text-align: right;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap; }\n  .dl-horizontal dd {\n    margin-left: 180px; } }\n\nabbr[title],\nabbr[data-original-title] {\n  cursor: help;\n  border-bottom: 1px dotted #CCC; }\n\n.initialism {\n  font-size: 90%; }\n\nblockquote {\n  padding: 8.5px 17px;\n  margin: 0 0 17px;\n  font-size: 15px;\n  border-left: 5px solid #eeeeee; }\n  blockquote p:last-child,\n  blockquote ul:last-child,\n  blockquote ol:last-child {\n    margin-bottom: 0; }\n  blockquote footer,\n  blockquote small,\n  blockquote .small {\n    display: block;\n    font-size: 80%;\n    line-height: 1.42857;\n    color: #CCC; }\n    blockquote footer:before,\n    blockquote small:before,\n    blockquote .small:before {\n      content: '\\2014   \\A0'; }\n\n.blockquote-reverse,\nblockquote.pull-right {\n  padding-right: 15px;\n  padding-left: 0;\n  border-right: 5px solid #eeeeee;\n  border-left: 0;\n  text-align: right; }\n  .blockquote-reverse footer:before,\n  .blockquote-reverse small:before,\n  .blockquote-reverse .small:before,\n  blockquote.pull-right footer:before,\n  blockquote.pull-right small:before,\n  blockquote.pull-right .small:before {\n    content: ''; }\n  .blockquote-reverse footer:after,\n  .blockquote-reverse small:after,\n  .blockquote-reverse .small:after,\n  blockquote.pull-right footer:after,\n  blockquote.pull-right small:after,\n  blockquote.pull-right .small:after {\n    content: '\\A0   \\2014'; }\n\naddress {\n  margin-bottom: 17px;\n  font-style: normal;\n  line-height: 1.42857; }\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: Menlo, Monaco, Consolas, \"Courier New\", monospace; }\n\ncode {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #c7254e;\n  background-color: #f9f2f4;\n  border-radius: 2px; }\n\nkbd {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #666;\n  background-color: #ccc;\n  border-radius: 4px;\n  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25); }\n  kbd kbd {\n    padding: 0;\n    font-size: 100%;\n    font-weight: bold;\n    box-shadow: none; }\n\npre {\n  display: block;\n  padding: 8px;\n  margin: 0 0 8.5px;\n  font-size: 11px;\n  line-height: 1.42857;\n  word-break: break-all;\n  word-wrap: break-word;\n  color: #fff;\n  background-color: #333;\n  border: 1px solid #333;\n  border-radius: 2px; }\n  pre code {\n    padding: 0;\n    font-size: inherit;\n    color: inherit;\n    white-space: pre-wrap;\n    background-color: transparent;\n    border-radius: 0; }\n\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll; }\n\n.container {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px; }\n  .container:before, .container:after {\n    content: \" \";\n    display: table; }\n  .container:after {\n    clear: both; }\n  @media (min-width: 768px) {\n    .container {\n      width: 750px; } }\n  @media (min-width: 992px) {\n    .container {\n      width: 970px; } }\n  @media (min-width: 1200px) {\n    .container {\n      width: 1170px; } }\n\n.container-fluid {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px; }\n  .container-fluid:before, .container-fluid:after {\n    content: \" \";\n    display: table; }\n  .container-fluid:after {\n    clear: both; }\n\n.row {\n  margin-left: -15px;\n  margin-right: -15px; }\n  .row:before, .row:after {\n    content: \" \";\n    display: table; }\n  .row:after {\n    clear: both; }\n\n.col-xs-1, .col-sm-1, .col-md-1, .col-lg-1, .col-xs-2, .col-sm-2, .col-md-2, .col-lg-2, .col-xs-3, .col-sm-3, .col-md-3, .col-lg-3, .col-xs-4, .col-sm-4, .col-md-4, .col-lg-4, .col-xs-5, .col-sm-5, .col-md-5, .col-lg-5, .col-xs-6, .col-sm-6, .col-md-6, .col-lg-6, .col-xs-7, .col-sm-7, .col-md-7, .col-lg-7, .col-xs-8, .col-sm-8, .col-md-8, .col-lg-8, .col-xs-9, .col-sm-9, .col-md-9, .col-lg-9, .col-xs-10, .col-sm-10, .col-md-10, .col-lg-10, .col-xs-11, .col-sm-11, .col-md-11, .col-lg-11, .col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {\n  position: relative;\n  min-height: 1px;\n  padding-left: 15px;\n  padding-right: 15px; }\n\n.col-xs-1, .col-xs-2, .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-6, .col-xs-7, .col-xs-8, .col-xs-9, .col-xs-10, .col-xs-11, .col-xs-12 {\n  float: left; }\n\n.col-xs-1 {\n  width: 8.33333%; }\n\n.col-xs-2 {\n  width: 16.66667%; }\n\n.col-xs-3 {\n  width: 25%; }\n\n.col-xs-4 {\n  width: 33.33333%; }\n\n.col-xs-5 {\n  width: 41.66667%; }\n\n.col-xs-6 {\n  width: 50%; }\n\n.col-xs-7 {\n  width: 58.33333%; }\n\n.col-xs-8 {\n  width: 66.66667%; }\n\n.col-xs-9 {\n  width: 75%; }\n\n.col-xs-10 {\n  width: 83.33333%; }\n\n.col-xs-11 {\n  width: 91.66667%; }\n\n.col-xs-12 {\n  width: 100%; }\n\n.col-xs-pull-0 {\n  right: auto; }\n\n.col-xs-pull-1 {\n  right: 8.33333%; }\n\n.col-xs-pull-2 {\n  right: 16.66667%; }\n\n.col-xs-pull-3 {\n  right: 25%; }\n\n.col-xs-pull-4 {\n  right: 33.33333%; }\n\n.col-xs-pull-5 {\n  right: 41.66667%; }\n\n.col-xs-pull-6 {\n  right: 50%; }\n\n.col-xs-pull-7 {\n  right: 58.33333%; }\n\n.col-xs-pull-8 {\n  right: 66.66667%; }\n\n.col-xs-pull-9 {\n  right: 75%; }\n\n.col-xs-pull-10 {\n  right: 83.33333%; }\n\n.col-xs-pull-11 {\n  right: 91.66667%; }\n\n.col-xs-pull-12 {\n  right: 100%; }\n\n.col-xs-push-0 {\n  left: auto; }\n\n.col-xs-push-1 {\n  left: 8.33333%; }\n\n.col-xs-push-2 {\n  left: 16.66667%; }\n\n.col-xs-push-3 {\n  left: 25%; }\n\n.col-xs-push-4 {\n  left: 33.33333%; }\n\n.col-xs-push-5 {\n  left: 41.66667%; }\n\n.col-xs-push-6 {\n  left: 50%; }\n\n.col-xs-push-7 {\n  left: 58.33333%; }\n\n.col-xs-push-8 {\n  left: 66.66667%; }\n\n.col-xs-push-9 {\n  left: 75%; }\n\n.col-xs-push-10 {\n  left: 83.33333%; }\n\n.col-xs-push-11 {\n  left: 91.66667%; }\n\n.col-xs-push-12 {\n  left: 100%; }\n\n.col-xs-offset-0 {\n  margin-left: 0%; }\n\n.col-xs-offset-1 {\n  margin-left: 8.33333%; }\n\n.col-xs-offset-2 {\n  margin-left: 16.66667%; }\n\n.col-xs-offset-3 {\n  margin-left: 25%; }\n\n.col-xs-offset-4 {\n  margin-left: 33.33333%; }\n\n.col-xs-offset-5 {\n  margin-left: 41.66667%; }\n\n.col-xs-offset-6 {\n  margin-left: 50%; }\n\n.col-xs-offset-7 {\n  margin-left: 58.33333%; }\n\n.col-xs-offset-8 {\n  margin-left: 66.66667%; }\n\n.col-xs-offset-9 {\n  margin-left: 75%; }\n\n.col-xs-offset-10 {\n  margin-left: 83.33333%; }\n\n.col-xs-offset-11 {\n  margin-left: 91.66667%; }\n\n.col-xs-offset-12 {\n  margin-left: 100%; }\n\n@media (min-width: 768px) {\n  .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {\n    float: left; }\n  .col-sm-1 {\n    width: 8.33333%; }\n  .col-sm-2 {\n    width: 16.66667%; }\n  .col-sm-3 {\n    width: 25%; }\n  .col-sm-4 {\n    width: 33.33333%; }\n  .col-sm-5 {\n    width: 41.66667%; }\n  .col-sm-6 {\n    width: 50%; }\n  .col-sm-7 {\n    width: 58.33333%; }\n  .col-sm-8 {\n    width: 66.66667%; }\n  .col-sm-9 {\n    width: 75%; }\n  .col-sm-10 {\n    width: 83.33333%; }\n  .col-sm-11 {\n    width: 91.66667%; }\n  .col-sm-12 {\n    width: 100%; }\n  .col-sm-pull-0 {\n    right: auto; }\n  .col-sm-pull-1 {\n    right: 8.33333%; }\n  .col-sm-pull-2 {\n    right: 16.66667%; }\n  .col-sm-pull-3 {\n    right: 25%; }\n  .col-sm-pull-4 {\n    right: 33.33333%; }\n  .col-sm-pull-5 {\n    right: 41.66667%; }\n  .col-sm-pull-6 {\n    right: 50%; }\n  .col-sm-pull-7 {\n    right: 58.33333%; }\n  .col-sm-pull-8 {\n    right: 66.66667%; }\n  .col-sm-pull-9 {\n    right: 75%; }\n  .col-sm-pull-10 {\n    right: 83.33333%; }\n  .col-sm-pull-11 {\n    right: 91.66667%; }\n  .col-sm-pull-12 {\n    right: 100%; }\n  .col-sm-push-0 {\n    left: auto; }\n  .col-sm-push-1 {\n    left: 8.33333%; }\n  .col-sm-push-2 {\n    left: 16.66667%; }\n  .col-sm-push-3 {\n    left: 25%; }\n  .col-sm-push-4 {\n    left: 33.33333%; }\n  .col-sm-push-5 {\n    left: 41.66667%; }\n  .col-sm-push-6 {\n    left: 50%; }\n  .col-sm-push-7 {\n    left: 58.33333%; }\n  .col-sm-push-8 {\n    left: 66.66667%; }\n  .col-sm-push-9 {\n    left: 75%; }\n  .col-sm-push-10 {\n    left: 83.33333%; }\n  .col-sm-push-11 {\n    left: 91.66667%; }\n  .col-sm-push-12 {\n    left: 100%; }\n  .col-sm-offset-0 {\n    margin-left: 0%; }\n  .col-sm-offset-1 {\n    margin-left: 8.33333%; }\n  .col-sm-offset-2 {\n    margin-left: 16.66667%; }\n  .col-sm-offset-3 {\n    margin-left: 25%; }\n  .col-sm-offset-4 {\n    margin-left: 33.33333%; }\n  .col-sm-offset-5 {\n    margin-left: 41.66667%; }\n  .col-sm-offset-6 {\n    margin-left: 50%; }\n  .col-sm-offset-7 {\n    margin-left: 58.33333%; }\n  .col-sm-offset-8 {\n    margin-left: 66.66667%; }\n  .col-sm-offset-9 {\n    margin-left: 75%; }\n  .col-sm-offset-10 {\n    margin-left: 83.33333%; }\n  .col-sm-offset-11 {\n    margin-left: 91.66667%; }\n  .col-sm-offset-12 {\n    margin-left: 100%; } }\n\n@media (min-width: 992px) {\n  .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12 {\n    float: left; }\n  .col-md-1 {\n    width: 8.33333%; }\n  .col-md-2 {\n    width: 16.66667%; }\n  .col-md-3 {\n    width: 25%; }\n  .col-md-4 {\n    width: 33.33333%; }\n  .col-md-5 {\n    width: 41.66667%; }\n  .col-md-6 {\n    width: 50%; }\n  .col-md-7 {\n    width: 58.33333%; }\n  .col-md-8 {\n    width: 66.66667%; }\n  .col-md-9 {\n    width: 75%; }\n  .col-md-10 {\n    width: 83.33333%; }\n  .col-md-11 {\n    width: 91.66667%; }\n  .col-md-12 {\n    width: 100%; }\n  .col-md-pull-0 {\n    right: auto; }\n  .col-md-pull-1 {\n    right: 8.33333%; }\n  .col-md-pull-2 {\n    right: 16.66667%; }\n  .col-md-pull-3 {\n    right: 25%; }\n  .col-md-pull-4 {\n    right: 33.33333%; }\n  .col-md-pull-5 {\n    right: 41.66667%; }\n  .col-md-pull-6 {\n    right: 50%; }\n  .col-md-pull-7 {\n    right: 58.33333%; }\n  .col-md-pull-8 {\n    right: 66.66667%; }\n  .col-md-pull-9 {\n    right: 75%; }\n  .col-md-pull-10 {\n    right: 83.33333%; }\n  .col-md-pull-11 {\n    right: 91.66667%; }\n  .col-md-pull-12 {\n    right: 100%; }\n  .col-md-push-0 {\n    left: auto; }\n  .col-md-push-1 {\n    left: 8.33333%; }\n  .col-md-push-2 {\n    left: 16.66667%; }\n  .col-md-push-3 {\n    left: 25%; }\n  .col-md-push-4 {\n    left: 33.33333%; }\n  .col-md-push-5 {\n    left: 41.66667%; }\n  .col-md-push-6 {\n    left: 50%; }\n  .col-md-push-7 {\n    left: 58.33333%; }\n  .col-md-push-8 {\n    left: 66.66667%; }\n  .col-md-push-9 {\n    left: 75%; }\n  .col-md-push-10 {\n    left: 83.33333%; }\n  .col-md-push-11 {\n    left: 91.66667%; }\n  .col-md-push-12 {\n    left: 100%; }\n  .col-md-offset-0 {\n    margin-left: 0%; }\n  .col-md-offset-1 {\n    margin-left: 8.33333%; }\n  .col-md-offset-2 {\n    margin-left: 16.66667%; }\n  .col-md-offset-3 {\n    margin-left: 25%; }\n  .col-md-offset-4 {\n    margin-left: 33.33333%; }\n  .col-md-offset-5 {\n    margin-left: 41.66667%; }\n  .col-md-offset-6 {\n    margin-left: 50%; }\n  .col-md-offset-7 {\n    margin-left: 58.33333%; }\n  .col-md-offset-8 {\n    margin-left: 66.66667%; }\n  .col-md-offset-9 {\n    margin-left: 75%; }\n  .col-md-offset-10 {\n    margin-left: 83.33333%; }\n  .col-md-offset-11 {\n    margin-left: 91.66667%; }\n  .col-md-offset-12 {\n    margin-left: 100%; } }\n\n@media (min-width: 1200px) {\n  .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12 {\n    float: left; }\n  .col-lg-1 {\n    width: 8.33333%; }\n  .col-lg-2 {\n    width: 16.66667%; }\n  .col-lg-3 {\n    width: 25%; }\n  .col-lg-4 {\n    width: 33.33333%; }\n  .col-lg-5 {\n    width: 41.66667%; }\n  .col-lg-6 {\n    width: 50%; }\n  .col-lg-7 {\n    width: 58.33333%; }\n  .col-lg-8 {\n    width: 66.66667%; }\n  .col-lg-9 {\n    width: 75%; }\n  .col-lg-10 {\n    width: 83.33333%; }\n  .col-lg-11 {\n    width: 91.66667%; }\n  .col-lg-12 {\n    width: 100%; }\n  .col-lg-pull-0 {\n    right: auto; }\n  .col-lg-pull-1 {\n    right: 8.33333%; }\n  .col-lg-pull-2 {\n    right: 16.66667%; }\n  .col-lg-pull-3 {\n    right: 25%; }\n  .col-lg-pull-4 {\n    right: 33.33333%; }\n  .col-lg-pull-5 {\n    right: 41.66667%; }\n  .col-lg-pull-6 {\n    right: 50%; }\n  .col-lg-pull-7 {\n    right: 58.33333%; }\n  .col-lg-pull-8 {\n    right: 66.66667%; }\n  .col-lg-pull-9 {\n    right: 75%; }\n  .col-lg-pull-10 {\n    right: 83.33333%; }\n  .col-lg-pull-11 {\n    right: 91.66667%; }\n  .col-lg-pull-12 {\n    right: 100%; }\n  .col-lg-push-0 {\n    left: auto; }\n  .col-lg-push-1 {\n    left: 8.33333%; }\n  .col-lg-push-2 {\n    left: 16.66667%; }\n  .col-lg-push-3 {\n    left: 25%; }\n  .col-lg-push-4 {\n    left: 33.33333%; }\n  .col-lg-push-5 {\n    left: 41.66667%; }\n  .col-lg-push-6 {\n    left: 50%; }\n  .col-lg-push-7 {\n    left: 58.33333%; }\n  .col-lg-push-8 {\n    left: 66.66667%; }\n  .col-lg-push-9 {\n    left: 75%; }\n  .col-lg-push-10 {\n    left: 83.33333%; }\n  .col-lg-push-11 {\n    left: 91.66667%; }\n  .col-lg-push-12 {\n    left: 100%; }\n  .col-lg-offset-0 {\n    margin-left: 0%; }\n  .col-lg-offset-1 {\n    margin-left: 8.33333%; }\n  .col-lg-offset-2 {\n    margin-left: 16.66667%; }\n  .col-lg-offset-3 {\n    margin-left: 25%; }\n  .col-lg-offset-4 {\n    margin-left: 33.33333%; }\n  .col-lg-offset-5 {\n    margin-left: 41.66667%; }\n  .col-lg-offset-6 {\n    margin-left: 50%; }\n  .col-lg-offset-7 {\n    margin-left: 58.33333%; }\n  .col-lg-offset-8 {\n    margin-left: 66.66667%; }\n  .col-lg-offset-9 {\n    margin-left: 75%; }\n  .col-lg-offset-10 {\n    margin-left: 83.33333%; }\n  .col-lg-offset-11 {\n    margin-left: 91.66667%; }\n  .col-lg-offset-12 {\n    margin-left: 100%; } }\n\ntable {\n  background-color: #fff; }\n\ncaption {\n  padding-top: 8px;\n  padding-bottom: 8px;\n  color: #CCC;\n  text-align: left; }\n\nth {\n  text-align: left; }\n\n.table {\n  width: 100%;\n  max-width: 100%;\n  margin-bottom: 17px; }\n  .table > thead > tr > th,\n  .table > thead > tr > td,\n  .table > tbody > tr > th,\n  .table > tbody > tr > td,\n  .table > tfoot > tr > th,\n  .table > tfoot > tr > td {\n    padding: 8px;\n    line-height: 1.42857;\n    vertical-align: top;\n    border-top: 1px solid #e1e5e8; }\n  .table > thead > tr > th {\n    vertical-align: bottom;\n    border-bottom: 2px solid #e1e5e8; }\n  .table > caption + thead > tr:first-child > th,\n  .table > caption + thead > tr:first-child > td,\n  .table > colgroup + thead > tr:first-child > th,\n  .table > colgroup + thead > tr:first-child > td,\n  .table > thead:first-child > tr:first-child > th,\n  .table > thead:first-child > tr:first-child > td {\n    border-top: 0; }\n  .table > tbody + tbody {\n    border-top: 2px solid #e1e5e8; }\n  .table .table {\n    background-color: #fff; }\n\n.table-condensed > thead > tr > th,\n.table-condensed > thead > tr > td,\n.table-condensed > tbody > tr > th,\n.table-condensed > tbody > tr > td,\n.table-condensed > tfoot > tr > th,\n.table-condensed > tfoot > tr > td {\n  padding: 5px; }\n\n.table-bordered > thead > tr > th,\n.table-bordered > thead > tr > td,\n.table-bordered > tbody > tr > th,\n.table-bordered > tbody > tr > td,\n.table-bordered > tfoot > tr > th,\n.table-bordered > tfoot > tr > td {\n  border: 1px solid #e1e5e8; }\n\n.table-bordered > thead > tr > th,\n.table-bordered > thead > tr > td {\n  border-bottom-width: 2px; }\n\n.table-striped > tbody > tr:nth-of-type(odd) {\n  background-color: #f9f9f9; }\n\n.table-hover > tbody > tr:hover {\n  background-color: #e7f6f3; }\n\ntable col[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-column; }\n\ntable td[class*=\"col-\"],\ntable th[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-cell; }\n\n.table > thead > tr > td.active,\n.table > thead > tr > th.active,\n.table > thead > tr.active > td,\n.table > thead > tr.active > th,\n.table > tbody > tr > td.active,\n.table > tbody > tr > th.active,\n.table > tbody > tr.active > td,\n.table > tbody > tr.active > th,\n.table > tfoot > tr > td.active,\n.table > tfoot > tr > th.active,\n.table > tfoot > tr.active > td,\n.table > tfoot > tr.active > th {\n  background-color: #e7f6f3; }\n\n.table-hover > tbody > tr > td.active:hover,\n.table-hover > tbody > tr > th.active:hover,\n.table-hover > tbody > tr.active:hover > td,\n.table-hover > tbody > tr:hover > .active,\n.table-hover > tbody > tr.active:hover > th {\n  background-color: #d4efea; }\n\n.table > thead > tr > td.success,\n.table > thead > tr > th.success,\n.table > thead > tr.success > td,\n.table > thead > tr.success > th,\n.table > tbody > tr > td.success,\n.table > tbody > tr > th.success,\n.table > tbody > tr.success > td,\n.table > tbody > tr.success > th,\n.table > tfoot > tr > td.success,\n.table > tfoot > tr > th.success,\n.table > tfoot > tr.success > td,\n.table > tfoot > tr.success > th {\n  background-color: #dff0d8; }\n\n.table-hover > tbody > tr > td.success:hover,\n.table-hover > tbody > tr > th.success:hover,\n.table-hover > tbody > tr.success:hover > td,\n.table-hover > tbody > tr:hover > .success,\n.table-hover > tbody > tr.success:hover > th {\n  background-color: #d0e9c6; }\n\n.table > thead > tr > td.info,\n.table > thead > tr > th.info,\n.table > thead > tr.info > td,\n.table > thead > tr.info > th,\n.table > tbody > tr > td.info,\n.table > tbody > tr > th.info,\n.table > tbody > tr.info > td,\n.table > tbody > tr.info > th,\n.table > tfoot > tr > td.info,\n.table > tfoot > tr > th.info,\n.table > tfoot > tr.info > td,\n.table > tfoot > tr.info > th {\n  background-color: #d9edf7; }\n\n.table-hover > tbody > tr > td.info:hover,\n.table-hover > tbody > tr > th.info:hover,\n.table-hover > tbody > tr.info:hover > td,\n.table-hover > tbody > tr:hover > .info,\n.table-hover > tbody > tr.info:hover > th {\n  background-color: #c4e3f3; }\n\n.table > thead > tr > td.warning,\n.table > thead > tr > th.warning,\n.table > thead > tr.warning > td,\n.table > thead > tr.warning > th,\n.table > tbody > tr > td.warning,\n.table > tbody > tr > th.warning,\n.table > tbody > tr.warning > td,\n.table > tbody > tr.warning > th,\n.table > tfoot > tr > td.warning,\n.table > tfoot > tr > th.warning,\n.table > tfoot > tr.warning > td,\n.table > tfoot > tr.warning > th {\n  background-color: #fcf8e3; }\n\n.table-hover > tbody > tr > td.warning:hover,\n.table-hover > tbody > tr > th.warning:hover,\n.table-hover > tbody > tr.warning:hover > td,\n.table-hover > tbody > tr:hover > .warning,\n.table-hover > tbody > tr.warning:hover > th {\n  background-color: #faf2cc; }\n\n.table > thead > tr > td.danger,\n.table > thead > tr > th.danger,\n.table > thead > tr.danger > td,\n.table > thead > tr.danger > th,\n.table > tbody > tr > td.danger,\n.table > tbody > tr > th.danger,\n.table > tbody > tr.danger > td,\n.table > tbody > tr.danger > th,\n.table > tfoot > tr > td.danger,\n.table > tfoot > tr > th.danger,\n.table > tfoot > tr.danger > td,\n.table > tfoot > tr.danger > th {\n  background-color: #f2dede; }\n\n.table-hover > tbody > tr > td.danger:hover,\n.table-hover > tbody > tr > th.danger:hover,\n.table-hover > tbody > tr.danger:hover > td,\n.table-hover > tbody > tr:hover > .danger,\n.table-hover > tbody > tr.danger:hover > th {\n  background-color: #ebcccc; }\n\n.table-responsive {\n  overflow-x: auto;\n  min-height: 0.01%; }\n  @media screen and (max-width: 767px) {\n    .table-responsive {\n      width: 100%;\n      margin-bottom: 12.75px;\n      overflow-y: hidden;\n      -ms-overflow-style: -ms-autohiding-scrollbar;\n      border: 1px solid #e1e5e8; }\n      .table-responsive > .table {\n        margin-bottom: 0; }\n        .table-responsive > .table > thead > tr > th,\n        .table-responsive > .table > thead > tr > td,\n        .table-responsive > .table > tbody > tr > th,\n        .table-responsive > .table > tbody > tr > td,\n        .table-responsive > .table > tfoot > tr > th,\n        .table-responsive > .table > tfoot > tr > td {\n          white-space: nowrap; }\n      .table-responsive > .table-bordered {\n        border: 0; }\n        .table-responsive > .table-bordered > thead > tr > th:first-child,\n        .table-responsive > .table-bordered > thead > tr > td:first-child,\n        .table-responsive > .table-bordered > tbody > tr > th:first-child,\n        .table-responsive > .table-bordered > tbody > tr > td:first-child,\n        .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n        .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n          border-left: 0; }\n        .table-responsive > .table-bordered > thead > tr > th:last-child,\n        .table-responsive > .table-bordered > thead > tr > td:last-child,\n        .table-responsive > .table-bordered > tbody > tr > th:last-child,\n        .table-responsive > .table-bordered > tbody > tr > td:last-child,\n        .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n        .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n          border-right: 0; }\n        .table-responsive > .table-bordered > tbody > tr:last-child > th,\n        .table-responsive > .table-bordered > tbody > tr:last-child > td,\n        .table-responsive > .table-bordered > tfoot > tr:last-child > th,\n        .table-responsive > .table-bordered > tfoot > tr:last-child > td {\n          border-bottom: 0; } }\n\nfieldset {\n  padding: 0;\n  margin: 0;\n  border: 0;\n  min-width: 0; }\n\nlegend {\n  display: block;\n  width: 100%;\n  padding: 0;\n  margin-bottom: 17px;\n  font-size: 18px;\n  line-height: inherit;\n  color: #666666;\n  border: 0;\n  border-bottom: 1px solid #e5e5e5; }\n\nlabel {\n  display: inline-block;\n  max-width: 100%;\n  margin-bottom: 5px;\n  font-weight: bold; }\n\ninput[type=\"search\"] {\n  box-sizing: border-box; }\n\ninput[type=\"radio\"],\ninput[type=\"checkbox\"] {\n  margin: 4px 0 0;\n  margin-top: 1px \\9;\n  line-height: normal; }\n\ninput[type=\"file\"] {\n  display: block; }\n\ninput[type=\"range\"] {\n  display: block;\n  width: 100%; }\n\nselect[multiple],\nselect[size] {\n  height: auto; }\n\ninput[type=\"file\"]:focus,\ninput[type=\"radio\"]:focus,\ninput[type=\"checkbox\"]:focus {\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px; }\n\noutput {\n  display: block;\n  padding-top: 7px;\n  font-size: 12px;\n  line-height: 1.42857;\n  color: #555555; }\n\n.form-control {\n  display: block;\n  width: 100%;\n  height: 31px;\n  padding: 6px 12px;\n  font-size: 12px;\n  line-height: 1.42857;\n  color: #555555;\n  background-color: #fff;\n  background-image: none;\n  border: 1px solid #ccc;\n  border-radius: 2px;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }\n  .form-control:focus {\n    border-color: #3399ff;\n    outline: 0;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(51, 153, 255, 0.6); }\n  .form-control::-moz-placeholder {\n    color: #CCC;\n    opacity: 1; }\n  .form-control:-ms-input-placeholder {\n    color: #CCC; }\n  .form-control::-webkit-input-placeholder {\n    color: #CCC; }\n  .form-control::-ms-expand {\n    border: 0;\n    background-color: transparent; }\n  .form-control[disabled], .form-control[readonly],\n  fieldset[disabled] .form-control {\n    background-color: #eeeeee;\n    opacity: 1; }\n  .form-control[disabled],\n  fieldset[disabled] .form-control {\n    cursor: not-allowed; }\n\ntextarea.form-control {\n  height: auto; }\n\ninput[type=\"search\"] {\n  -webkit-appearance: none; }\n\n@media screen and (-webkit-min-device-pixel-ratio: 0) {\n  input[type=\"date\"].form-control,\n  input[type=\"time\"].form-control,\n  input[type=\"datetime-local\"].form-control,\n  input[type=\"month\"].form-control {\n    line-height: 31px; }\n  input[type=\"date\"].input-sm, .input-group-sm > input[type=\"date\"].form-control,\n  .input-group-sm > input[type=\"date\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"date\"].btn,\n  .input-group-sm input[type=\"date\"],\n  input[type=\"time\"].input-sm,\n  .input-group-sm > input[type=\"time\"].form-control,\n  .input-group-sm > input[type=\"time\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"time\"].btn,\n  .input-group-sm\n  input[type=\"time\"],\n  input[type=\"datetime-local\"].input-sm,\n  .input-group-sm > input[type=\"datetime-local\"].form-control,\n  .input-group-sm > input[type=\"datetime-local\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"datetime-local\"].btn,\n  .input-group-sm\n  input[type=\"datetime-local\"],\n  input[type=\"month\"].input-sm,\n  .input-group-sm > input[type=\"month\"].form-control,\n  .input-group-sm > input[type=\"month\"].input-group-addon,\n  .input-group-sm > .input-group-btn > input[type=\"month\"].btn,\n  .input-group-sm\n  input[type=\"month\"] {\n    line-height: 33px; }\n  input[type=\"date\"].input-lg, .input-group-lg > input[type=\"date\"].form-control,\n  .input-group-lg > input[type=\"date\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"date\"].btn,\n  .input-group-lg input[type=\"date\"],\n  input[type=\"time\"].input-lg,\n  .input-group-lg > input[type=\"time\"].form-control,\n  .input-group-lg > input[type=\"time\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"time\"].btn,\n  .input-group-lg\n  input[type=\"time\"],\n  input[type=\"datetime-local\"].input-lg,\n  .input-group-lg > input[type=\"datetime-local\"].form-control,\n  .input-group-lg > input[type=\"datetime-local\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"datetime-local\"].btn,\n  .input-group-lg\n  input[type=\"datetime-local\"],\n  input[type=\"month\"].input-lg,\n  .input-group-lg > input[type=\"month\"].form-control,\n  .input-group-lg > input[type=\"month\"].input-group-addon,\n  .input-group-lg > .input-group-btn > input[type=\"month\"].btn,\n  .input-group-lg\n  input[type=\"month\"] {\n    line-height: 42px; } }\n\n.form-group {\n  margin-bottom: 15px; }\n\n.radio,\n.checkbox {\n  position: relative;\n  display: block;\n  margin-top: 10px;\n  margin-bottom: 10px; }\n  .radio label,\n  .checkbox label {\n    min-height: 17px;\n    padding-left: 20px;\n    margin-bottom: 0;\n    font-weight: normal;\n    cursor: pointer; }\n\n.radio input[type=\"radio\"],\n.radio-inline input[type=\"radio\"],\n.checkbox input[type=\"checkbox\"],\n.checkbox-inline input[type=\"checkbox\"] {\n  position: absolute;\n  margin-left: -20px;\n  margin-top: 4px \\9; }\n\n.radio + .radio,\n.checkbox + .checkbox {\n  margin-top: -5px; }\n\n.radio-inline,\n.checkbox-inline {\n  position: relative;\n  display: inline-block;\n  padding-left: 20px;\n  margin-bottom: 0;\n  vertical-align: middle;\n  font-weight: normal;\n  cursor: pointer; }\n\n.radio-inline + .radio-inline,\n.checkbox-inline + .checkbox-inline {\n  margin-top: 0;\n  margin-left: 10px; }\n\ninput[type=\"radio\"][disabled], input[type=\"radio\"].disabled,\nfieldset[disabled] input[type=\"radio\"],\ninput[type=\"checkbox\"][disabled],\ninput[type=\"checkbox\"].disabled,\nfieldset[disabled]\ninput[type=\"checkbox\"] {\n  cursor: not-allowed; }\n\n.radio-inline.disabled,\nfieldset[disabled] .radio-inline,\n.checkbox-inline.disabled,\nfieldset[disabled]\n.checkbox-inline {\n  cursor: not-allowed; }\n\n.radio.disabled label,\nfieldset[disabled] .radio label,\n.checkbox.disabled label,\nfieldset[disabled]\n.checkbox label {\n  cursor: not-allowed; }\n\n.form-control-static {\n  padding-top: 7px;\n  padding-bottom: 7px;\n  margin-bottom: 0;\n  min-height: 29px; }\n  .form-control-static.input-lg, .input-group-lg > .form-control-static.form-control,\n  .input-group-lg > .form-control-static.input-group-addon,\n  .input-group-lg > .input-group-btn > .form-control-static.btn, .form-control-static.input-sm, .input-group-sm > .form-control-static.form-control,\n  .input-group-sm > .form-control-static.input-group-addon,\n  .input-group-sm > .input-group-btn > .form-control-static.btn {\n    padding-left: 0;\n    padding-right: 0; }\n\n.input-sm, .input-group-sm > .form-control,\n.input-group-sm > .input-group-addon,\n.input-group-sm > .input-group-btn > .btn {\n  height: 33px;\n  padding: 5px 10px;\n  font-size: 14px;\n  line-height: 1.5;\n  border-radius: 4px; }\n\nselect.input-sm, .input-group-sm > select.form-control,\n.input-group-sm > select.input-group-addon,\n.input-group-sm > .input-group-btn > select.btn {\n  height: 33px;\n  line-height: 33px; }\n\ntextarea.input-sm, .input-group-sm > textarea.form-control,\n.input-group-sm > textarea.input-group-addon,\n.input-group-sm > .input-group-btn > textarea.btn,\nselect[multiple].input-sm,\n.input-group-sm > select[multiple].form-control,\n.input-group-sm > select[multiple].input-group-addon,\n.input-group-sm > .input-group-btn > select[multiple].btn {\n  height: auto; }\n\n.form-group-sm .form-control {\n  height: 33px;\n  padding: 5px 10px;\n  font-size: 14px;\n  line-height: 1.5;\n  border-radius: 4px; }\n\n.form-group-sm select.form-control {\n  height: 33px;\n  line-height: 33px; }\n\n.form-group-sm textarea.form-control,\n.form-group-sm select[multiple].form-control {\n  height: auto; }\n\n.form-group-sm .form-control-static {\n  height: 33px;\n  min-height: 31px;\n  padding: 6px 10px;\n  font-size: 14px;\n  line-height: 1.5; }\n\n.input-lg, .input-group-lg > .form-control,\n.input-group-lg > .input-group-addon,\n.input-group-lg > .input-group-btn > .btn {\n  height: 42px;\n  padding: 10px 16px;\n  font-size: 15px;\n  line-height: 1.33;\n  border-radius: 6px; }\n\nselect.input-lg, .input-group-lg > select.form-control,\n.input-group-lg > select.input-group-addon,\n.input-group-lg > .input-group-btn > select.btn {\n  height: 42px;\n  line-height: 42px; }\n\ntextarea.input-lg, .input-group-lg > textarea.form-control,\n.input-group-lg > textarea.input-group-addon,\n.input-group-lg > .input-group-btn > textarea.btn,\nselect[multiple].input-lg,\n.input-group-lg > select[multiple].form-control,\n.input-group-lg > select[multiple].input-group-addon,\n.input-group-lg > .input-group-btn > select[multiple].btn {\n  height: auto; }\n\n.form-group-lg .form-control {\n  height: 42px;\n  padding: 10px 16px;\n  font-size: 15px;\n  line-height: 1.33;\n  border-radius: 6px; }\n\n.form-group-lg select.form-control {\n  height: 42px;\n  line-height: 42px; }\n\n.form-group-lg textarea.form-control,\n.form-group-lg select[multiple].form-control {\n  height: auto; }\n\n.form-group-lg .form-control-static {\n  height: 42px;\n  min-height: 32px;\n  padding: 11px 16px;\n  font-size: 15px;\n  line-height: 1.33; }\n\n.has-feedback {\n  position: relative; }\n  .has-feedback .form-control {\n    padding-right: 38.75px; }\n\n.form-control-feedback {\n  position: absolute;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  display: block;\n  width: 31px;\n  height: 31px;\n  line-height: 31px;\n  text-align: center;\n  pointer-events: none; }\n\n.input-lg + .form-control-feedback, .input-group-lg > .form-control + .form-control-feedback,\n.input-group-lg > .input-group-addon + .form-control-feedback,\n.input-group-lg > .input-group-btn > .btn + .form-control-feedback,\n.input-group-lg + .form-control-feedback,\n.form-group-lg .form-control + .form-control-feedback {\n  width: 42px;\n  height: 42px;\n  line-height: 42px; }\n\n.input-sm + .form-control-feedback, .input-group-sm > .form-control + .form-control-feedback,\n.input-group-sm > .input-group-addon + .form-control-feedback,\n.input-group-sm > .input-group-btn > .btn + .form-control-feedback,\n.input-group-sm + .form-control-feedback,\n.form-group-sm .form-control + .form-control-feedback {\n  width: 33px;\n  height: 33px;\n  line-height: 33px; }\n\n.has-success .help-block,\n.has-success .control-label,\n.has-success .radio,\n.has-success .checkbox,\n.has-success .radio-inline,\n.has-success .checkbox-inline,\n.has-success.radio label,\n.has-success.checkbox label,\n.has-success.radio-inline label,\n.has-success.checkbox-inline label {\n  color: #3c763d; }\n\n.has-success .form-control {\n  border-color: #3c763d;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); }\n  .has-success .form-control:focus {\n    border-color: #2b542c;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #67b168; }\n\n.has-success .input-group-addon {\n  color: #3c763d;\n  border-color: #3c763d;\n  background-color: #dff0d8; }\n\n.has-success .form-control-feedback {\n  color: #3c763d; }\n\n.has-warning .help-block,\n.has-warning .control-label,\n.has-warning .radio,\n.has-warning .checkbox,\n.has-warning .radio-inline,\n.has-warning .checkbox-inline,\n.has-warning.radio label,\n.has-warning.checkbox label,\n.has-warning.radio-inline label,\n.has-warning.checkbox-inline label {\n  color: #8a6d3b; }\n\n.has-warning .form-control {\n  border-color: #8a6d3b;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); }\n  .has-warning .form-control:focus {\n    border-color: #66512c;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #c0a16b; }\n\n.has-warning .input-group-addon {\n  color: #8a6d3b;\n  border-color: #8a6d3b;\n  background-color: #fcf8e3; }\n\n.has-warning .form-control-feedback {\n  color: #8a6d3b; }\n\n.has-error .help-block,\n.has-error .control-label,\n.has-error .radio,\n.has-error .checkbox,\n.has-error .radio-inline,\n.has-error .checkbox-inline,\n.has-error.radio label,\n.has-error.checkbox label,\n.has-error.radio-inline label,\n.has-error.checkbox-inline label {\n  color: #e36159; }\n\n.has-error .form-control {\n  border-color: #e36159;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); }\n  .has-error .form-control:focus {\n    border-color: #dc372d;\n    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #f2b4b0; }\n\n.has-error .input-group-addon {\n  color: #e36159;\n  border-color: #e36159;\n  background-color: #f2dede; }\n\n.has-error .form-control-feedback {\n  color: #e36159; }\n\n.has-feedback label ~ .form-control-feedback {\n  top: 22px; }\n\n.has-feedback label.sr-only ~ .form-control-feedback {\n  top: 0; }\n\n.help-block {\n  display: block;\n  margin-top: 5px;\n  margin-bottom: 10px;\n  color: #a6a6a6; }\n\n@media (min-width: 768px) {\n  .form-inline .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle; }\n  .form-inline .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle; }\n  .form-inline .form-control-static {\n    display: inline-block; }\n  .form-inline .input-group {\n    display: inline-table;\n    vertical-align: middle; }\n    .form-inline .input-group .input-group-addon,\n    .form-inline .input-group .input-group-btn,\n    .form-inline .input-group .form-control {\n      width: auto; }\n  .form-inline .input-group > .form-control {\n    width: 100%; }\n  .form-inline .control-label {\n    margin-bottom: 0;\n    vertical-align: middle; }\n  .form-inline .radio,\n  .form-inline .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle; }\n    .form-inline .radio label,\n    .form-inline .checkbox label {\n      padding-left: 0; }\n  .form-inline .radio input[type=\"radio\"],\n  .form-inline .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0; }\n  .form-inline .has-feedback .form-control-feedback {\n    top: 0; } }\n\n.form-horizontal .radio,\n.form-horizontal .checkbox,\n.form-horizontal .radio-inline,\n.form-horizontal .checkbox-inline {\n  margin-top: 0;\n  margin-bottom: 0;\n  padding-top: 7px; }\n\n.form-horizontal .radio,\n.form-horizontal .checkbox {\n  min-height: 24px; }\n\n.form-horizontal .form-group {\n  margin-left: -15px;\n  margin-right: -15px; }\n  .form-horizontal .form-group:before, .form-horizontal .form-group:after {\n    content: \" \";\n    display: table; }\n  .form-horizontal .form-group:after {\n    clear: both; }\n\n@media (min-width: 768px) {\n  .form-horizontal .control-label {\n    text-align: right;\n    margin-bottom: 0;\n    padding-top: 7px; } }\n\n.form-horizontal .has-feedback .form-control-feedback {\n  right: 15px; }\n\n@media (min-width: 768px) {\n  .form-horizontal .form-group-lg .control-label {\n    padding-top: 11px;\n    font-size: 15px; } }\n\n@media (min-width: 768px) {\n  .form-horizontal .form-group-sm .control-label {\n    padding-top: 6px;\n    font-size: 14px; } }\n\n.fade {\n  opacity: 0;\n  -webkit-transition: opacity 0.15s linear;\n  transition: opacity 0.15s linear; }\n  .fade.in {\n    opacity: 1; }\n\n.collapse {\n  display: none; }\n  .collapse.in {\n    display: block; }\n\ntr.collapse.in {\n  display: table-row; }\n\ntbody.collapse.in {\n  display: table-row-group; }\n\n.collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  -webkit-transition-property: height, visibility;\n  transition-property: height, visibility;\n  -webkit-transition-duration: 0.35s;\n  transition-duration: 0.35s;\n  -webkit-transition-timing-function: ease;\n  transition-timing-function: ease; }\n\n.caret {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 2px;\n  vertical-align: middle;\n  border-top: 4px dashed;\n  border-top: 4px solid \\9;\n  border-right: 4px solid transparent;\n  border-left: 4px solid transparent; }\n\n.dropup,\n.dropdown {\n  position: relative; }\n\n.dropdown-toggle:focus {\n  outline: 0; }\n\n.dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 160px;\n  padding: 5px 0;\n  margin: 2px 0 0;\n  list-style: none;\n  font-size: 12px;\n  text-align: left;\n  background-color: #fff;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  border-radius: 2px;\n  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  background-clip: padding-box; }\n  .dropdown-menu.pull-right {\n    right: 0;\n    left: auto; }\n  .dropdown-menu .divider {\n    height: 1px;\n    margin: 7.5px 0;\n    overflow: hidden;\n    background-color: #e5e5e5; }\n  .dropdown-menu > li > a {\n    display: block;\n    padding: 3px 20px;\n    clear: both;\n    font-weight: normal;\n    line-height: 1.42857;\n    color: #666666;\n    white-space: nowrap; }\n\n.dropdown-menu > li > a:hover, .dropdown-menu > li > a:focus {\n  text-decoration: none;\n  color: #595959;\n  background-color: #e6f5fc; }\n\n.dropdown-menu > .active > a, .dropdown-menu > .active > a:hover, .dropdown-menu > .active > a:focus {\n  color: #fff;\n  text-decoration: none;\n  outline: 0;\n  background-color: #3399ff; }\n\n.dropdown-menu > .disabled > a, .dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus {\n  color: #CCC; }\n\n.dropdown-menu > .disabled > a:hover, .dropdown-menu > .disabled > a:focus {\n  text-decoration: none;\n  background-color: transparent;\n  background-image: none;\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);\n  cursor: not-allowed; }\n\n.open > .dropdown-menu {\n  display: block; }\n\n.open > a {\n  outline: 0; }\n\n.dropdown-menu-right {\n  left: auto;\n  right: 0; }\n\n.dropdown-menu-left {\n  left: 0;\n  right: auto; }\n\n.dropdown-header {\n  display: block;\n  padding: 3px 20px;\n  font-size: 14px;\n  line-height: 1.42857;\n  color: #CCC;\n  white-space: nowrap; }\n\n.dropdown-backdrop {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  z-index: 990; }\n\n.pull-right > .dropdown-menu {\n  right: 0;\n  left: auto; }\n\n.dropup .caret,\n.navbar-fixed-bottom .dropdown .caret {\n  border-top: 0;\n  border-bottom: 4px dashed;\n  border-bottom: 4px solid \\9;\n  content: \"\"; }\n\n.dropup .dropdown-menu,\n.navbar-fixed-bottom .dropdown .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n  margin-bottom: 2px; }\n\n@media (min-width: 768px) {\n  .navbar-right .dropdown-menu {\n    right: 0;\n    left: auto; }\n  .navbar-right .dropdown-menu-left {\n    left: 0;\n    right: auto; } }\n\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle; }\n  .btn-group > .btn,\n  .btn-group-vertical > .btn {\n    position: relative;\n    float: left; }\n    .btn-group > .btn:hover, .btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active,\n    .btn-group-vertical > .btn:hover,\n    .btn-group-vertical > .btn:focus,\n    .btn-group-vertical > .btn:active,\n    .btn-group-vertical > .btn.active {\n      z-index: 2; }\n\n.btn-group .btn + .btn,\n.btn-group .btn + .btn-group,\n.btn-group .btn-group + .btn,\n.btn-group .btn-group + .btn-group {\n  margin-left: -1px; }\n\n.btn-toolbar {\n  margin-left: -5px; }\n  .btn-toolbar:before, .btn-toolbar:after {\n    content: \" \";\n    display: table; }\n  .btn-toolbar:after {\n    clear: both; }\n  .btn-toolbar .btn,\n  .btn-toolbar .btn-group,\n  .btn-toolbar .input-group {\n    float: left; }\n  .btn-toolbar > .btn,\n  .btn-toolbar > .btn-group,\n  .btn-toolbar > .input-group {\n    margin-left: 5px; }\n\n.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0; }\n\n.btn-group > .btn:first-child {\n  margin-left: 0; }\n  .btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\n    border-bottom-right-radius: 0;\n    border-top-right-radius: 0; }\n\n.btn-group > .btn:last-child:not(:first-child),\n.btn-group > .dropdown-toggle:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0; }\n\n.btn-group > .btn-group {\n  float: left; }\n\n.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0; }\n\n.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0; }\n\n.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0; }\n\n.btn-group .dropdown-toggle:active,\n.btn-group.open .dropdown-toggle {\n  outline: 0; }\n\n.btn-group > .btn + .dropdown-toggle {\n  padding-left: 8px;\n  padding-right: 8px; }\n\n.btn-group > .btn-lg + .dropdown-toggle, .btn-group-lg.btn-group > .btn + .dropdown-toggle {\n  padding-left: 12px;\n  padding-right: 12px; }\n\n.btn-group.open .dropdown-toggle {\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); }\n  .btn-group.open .dropdown-toggle.btn-link {\n    box-shadow: none; }\n\n.btn .caret {\n  margin-left: 0; }\n\n.btn-lg .caret, .btn-group-lg > .btn .caret {\n  border-width: 5px 5px 0;\n  border-bottom-width: 0; }\n\n.dropup .btn-lg .caret, .dropup .btn-group-lg > .btn .caret {\n  border-width: 0 5px 5px; }\n\n.btn-group-vertical > .btn,\n.btn-group-vertical > .btn-group,\n.btn-group-vertical > .btn-group > .btn {\n  display: block;\n  float: none;\n  width: 100%;\n  max-width: 100%; }\n\n.btn-group-vertical > .btn-group:before, .btn-group-vertical > .btn-group:after {\n  content: \" \";\n  display: table; }\n\n.btn-group-vertical > .btn-group:after {\n  clear: both; }\n\n.btn-group-vertical > .btn-group > .btn {\n  float: none; }\n\n.btn-group-vertical > .btn + .btn,\n.btn-group-vertical > .btn + .btn-group,\n.btn-group-vertical > .btn-group + .btn,\n.btn-group-vertical > .btn-group + .btn-group {\n  margin-top: -1px;\n  margin-left: 0; }\n\n.btn-group-vertical > .btn:not(:first-child):not(:last-child) {\n  border-radius: 0; }\n\n.btn-group-vertical > .btn:first-child:not(:last-child) {\n  border-top-right-radius: 2px;\n  border-top-left-radius: 2px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0; }\n\n.btn-group-vertical > .btn:last-child:not(:first-child) {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px; }\n\n.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0; }\n\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0; }\n\n.btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.btn-group-justified {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n  border-collapse: separate; }\n  .btn-group-justified > .btn,\n  .btn-group-justified > .btn-group {\n    float: none;\n    display: table-cell;\n    width: 1%; }\n  .btn-group-justified > .btn-group .btn {\n    width: 100%; }\n  .btn-group-justified > .btn-group .dropdown-menu {\n    left: auto; }\n\n[data-toggle=\"buttons\"] > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn input[type=\"checkbox\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"checkbox\"] {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none; }\n\n.input-group {\n  position: relative;\n  display: table;\n  border-collapse: separate; }\n  .input-group[class*=\"col-\"] {\n    float: none;\n    padding-left: 0;\n    padding-right: 0; }\n  .input-group .form-control {\n    position: relative;\n    z-index: 2;\n    float: left;\n    width: 100%;\n    margin-bottom: 0; }\n    .input-group .form-control:focus {\n      z-index: 3; }\n\n.input-group-addon,\n.input-group-btn,\n.input-group .form-control {\n  display: table-cell; }\n  .input-group-addon:not(:first-child):not(:last-child),\n  .input-group-btn:not(:first-child):not(:last-child),\n  .input-group .form-control:not(:first-child):not(:last-child) {\n    border-radius: 0; }\n\n.input-group-addon,\n.input-group-btn {\n  width: 1%;\n  white-space: nowrap;\n  vertical-align: middle; }\n\n.input-group-addon {\n  padding: 6px 12px;\n  font-size: 12px;\n  font-weight: normal;\n  line-height: 1;\n  color: #555555;\n  text-align: center;\n  background-color: #eeeeee;\n  border: 1px solid #ccc;\n  border-radius: 2px; }\n  .input-group-addon.input-sm,\n  .input-group-sm > .input-group-addon,\n  .input-group-sm > .input-group-btn > .input-group-addon.btn {\n    padding: 5px 10px;\n    font-size: 14px;\n    border-radius: 4px; }\n  .input-group-addon.input-lg,\n  .input-group-lg > .input-group-addon,\n  .input-group-lg > .input-group-btn > .input-group-addon.btn {\n    padding: 10px 16px;\n    font-size: 15px;\n    border-radius: 6px; }\n  .input-group-addon input[type=\"radio\"],\n  .input-group-addon input[type=\"checkbox\"] {\n    margin-top: 0; }\n\n.input-group .form-control:first-child,\n.input-group-addon:first-child,\n.input-group-btn:first-child > .btn,\n.input-group-btn:first-child > .btn-group > .btn,\n.input-group-btn:first-child > .dropdown-toggle,\n.input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n.input-group-btn:last-child > .btn-group:not(:last-child) > .btn {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0; }\n\n.input-group-addon:first-child {\n  border-right: 0; }\n\n.input-group .form-control:last-child,\n.input-group-addon:last-child,\n.input-group-btn:last-child > .btn,\n.input-group-btn:last-child > .btn-group > .btn,\n.input-group-btn:last-child > .dropdown-toggle,\n.input-group-btn:first-child > .btn:not(:first-child),\n.input-group-btn:first-child > .btn-group:not(:first-child) > .btn {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0; }\n\n.input-group-addon:last-child {\n  border-left: 0; }\n\n.input-group-btn {\n  position: relative;\n  font-size: 0;\n  white-space: nowrap; }\n  .input-group-btn > .btn {\n    position: relative; }\n    .input-group-btn > .btn + .btn {\n      margin-left: -1px; }\n    .input-group-btn > .btn:hover, .input-group-btn > .btn:focus, .input-group-btn > .btn:active {\n      z-index: 2; }\n  .input-group-btn:first-child > .btn,\n  .input-group-btn:first-child > .btn-group {\n    margin-right: -1px; }\n  .input-group-btn:last-child > .btn,\n  .input-group-btn:last-child > .btn-group {\n    z-index: 2;\n    margin-left: -1px; }\n\n.nav {\n  margin-bottom: 0;\n  padding-left: 0;\n  list-style: none; }\n  .nav:before, .nav:after {\n    content: \" \";\n    display: table; }\n  .nav:after {\n    clear: both; }\n  .nav > li {\n    position: relative;\n    display: block; }\n    .nav > li > a {\n      position: relative;\n      display: block;\n      padding: 10px 15px; }\n      .nav > li > a:hover, .nav > li > a:focus {\n        text-decoration: none; }\n    .nav > li.disabled > a {\n      color: #CCC; }\n      .nav > li.disabled > a:hover, .nav > li.disabled > a:focus {\n        color: #CCC;\n        text-decoration: none;\n        background-color: transparent;\n        cursor: not-allowed; }\n  .nav .nav-divider {\n    height: 1px;\n    margin: 7.5px 0;\n    overflow: hidden;\n    background-color: #e5e5e5; }\n  .nav > li > a > img {\n    max-width: none; }\n\n.nav-tabs {\n  border-bottom: 1px solid #ddd; }\n  .nav-tabs > li {\n    float: left;\n    margin-bottom: -1px; }\n    .nav-tabs > li > a {\n      margin-right: 2px;\n      line-height: 1.42857;\n      border: 1px solid transparent;\n      border-radius: 2px 2px 0 0; }\n      .nav-tabs > li > a:hover {\n        border-color: #eeeeee #eeeeee #ddd; }\n    .nav-tabs > li.active > a, .nav-tabs > li.active > a:hover, .nav-tabs > li.active > a:focus {\n      color: #555555;\n      background-color: #fff;\n      border: 1px solid #ddd;\n      border-bottom-color: transparent;\n      cursor: default; }\n\n.nav-pills > li {\n  float: left; }\n  .nav-pills > li > a {\n    border-radius: 2px; }\n  .nav-pills > li + li {\n    margin-left: 2px; }\n  .nav-pills > li.active > a, .nav-pills > li.active > a:hover, .nav-pills > li.active > a:focus {\n    color: #fff;\n    background-color: #3399ff; }\n\n.nav-stacked > li {\n  float: none; }\n  .nav-stacked > li + li {\n    margin-top: 2px;\n    margin-left: 0; }\n\n.nav-justified, .nav-tabs.nav-justified {\n  width: 100%; }\n  .nav-justified > li, .nav-tabs.nav-justified > li {\n    float: none; }\n    .nav-justified > li > a, .nav-tabs.nav-justified > li > a {\n      text-align: center;\n      margin-bottom: 5px; }\n  .nav-justified > .dropdown .dropdown-menu {\n    top: auto;\n    left: auto; }\n  @media (min-width: 768px) {\n    .nav-justified > li, .nav-tabs.nav-justified > li {\n      display: table-cell;\n      width: 1%; }\n      .nav-justified > li > a, .nav-tabs.nav-justified > li > a {\n        margin-bottom: 0; } }\n\n.nav-tabs-justified, .nav-tabs.nav-justified {\n  border-bottom: 0; }\n  .nav-tabs-justified > li > a, .nav-tabs.nav-justified > li > a {\n    margin-right: 0;\n    border-radius: 2px; }\n  .nav-tabs-justified > .active > a, .nav-tabs.nav-justified > .active > a,\n  .nav-tabs-justified > .active > a:hover, .nav-tabs.nav-justified > .active > a:hover,\n  .nav-tabs-justified > .active > a:focus, .nav-tabs.nav-justified > .active > a:focus {\n    border: 1px solid #ddd; }\n  @media (min-width: 768px) {\n    .nav-tabs-justified > li > a, .nav-tabs.nav-justified > li > a {\n      border-bottom: 1px solid #ddd;\n      border-radius: 2px 2px 0 0; }\n    .nav-tabs-justified > .active > a, .nav-tabs.nav-justified > .active > a,\n    .nav-tabs-justified > .active > a:hover, .nav-tabs.nav-justified > .active > a:hover,\n    .nav-tabs-justified > .active > a:focus, .nav-tabs.nav-justified > .active > a:focus {\n      border-bottom-color: #fff; } }\n\n.tab-content > .tab-pane {\n  display: none; }\n\n.tab-content > .active {\n  display: block; }\n\n.nav-tabs .dropdown-menu {\n  margin-top: -1px;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.navbar {\n  position: relative;\n  min-height: 50px;\n  margin-bottom: 17px;\n  border: 1px solid transparent; }\n  .navbar:before, .navbar:after {\n    content: \" \";\n    display: table; }\n  .navbar:after {\n    clear: both; }\n  @media (min-width: 768px) {\n    .navbar {\n      border-radius: 2px; } }\n\n.navbar-header:before, .navbar-header:after {\n  content: \" \";\n  display: table; }\n\n.navbar-header:after {\n  clear: both; }\n\n@media (min-width: 768px) {\n  .navbar-header {\n    float: left; } }\n\n.navbar-collapse {\n  overflow-x: visible;\n  padding-right: 15px;\n  padding-left: 15px;\n  border-top: 1px solid transparent;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);\n  -webkit-overflow-scrolling: touch; }\n  .navbar-collapse:before, .navbar-collapse:after {\n    content: \" \";\n    display: table; }\n  .navbar-collapse:after {\n    clear: both; }\n  .navbar-collapse.in {\n    overflow-y: auto; }\n  @media (min-width: 768px) {\n    .navbar-collapse {\n      width: auto;\n      border-top: 0;\n      box-shadow: none; }\n      .navbar-collapse.collapse {\n        display: block !important;\n        height: auto !important;\n        padding-bottom: 0;\n        overflow: visible !important; }\n      .navbar-collapse.in {\n        overflow-y: visible; }\n      .navbar-fixed-top .navbar-collapse,\n      .navbar-static-top .navbar-collapse,\n      .navbar-fixed-bottom .navbar-collapse {\n        padding-left: 0;\n        padding-right: 0; } }\n\n.navbar-fixed-top .navbar-collapse,\n.navbar-fixed-bottom .navbar-collapse {\n  max-height: 340px; }\n  @media (max-device-width: 480px) and (orientation: landscape) {\n    .navbar-fixed-top .navbar-collapse,\n    .navbar-fixed-bottom .navbar-collapse {\n      max-height: 200px; } }\n\n.container > .navbar-header,\n.container > .navbar-collapse,\n.container-fluid > .navbar-header,\n.container-fluid > .navbar-collapse {\n  margin-right: -15px;\n  margin-left: -15px; }\n  @media (min-width: 768px) {\n    .container > .navbar-header,\n    .container > .navbar-collapse,\n    .container-fluid > .navbar-header,\n    .container-fluid > .navbar-collapse {\n      margin-right: 0;\n      margin-left: 0; } }\n\n.navbar-static-top {\n  z-index: 1000;\n  border-width: 0 0 1px; }\n  @media (min-width: 768px) {\n    .navbar-static-top {\n      border-radius: 0; } }\n\n.navbar-fixed-top,\n.navbar-fixed-bottom {\n  position: fixed;\n  right: 0;\n  left: 0;\n  z-index: 1030; }\n  @media (min-width: 768px) {\n    .navbar-fixed-top,\n    .navbar-fixed-bottom {\n      border-radius: 0; } }\n\n.navbar-fixed-top {\n  top: 0;\n  border-width: 0 0 1px; }\n\n.navbar-fixed-bottom {\n  bottom: 0;\n  margin-bottom: 0;\n  border-width: 1px 0 0; }\n\n.navbar-brand {\n  float: left;\n  padding: 16.5px 15px;\n  font-size: 15px;\n  line-height: 17px;\n  height: 50px; }\n  .navbar-brand:hover, .navbar-brand:focus {\n    text-decoration: none; }\n  .navbar-brand > img {\n    display: block; }\n  @media (min-width: 768px) {\n    .navbar > .container .navbar-brand,\n    .navbar > .container-fluid .navbar-brand {\n      margin-left: -15px; } }\n\n.navbar-toggle {\n  position: relative;\n  float: right;\n  margin-right: 15px;\n  padding: 9px 10px;\n  margin-top: 8px;\n  margin-bottom: 8px;\n  background-color: transparent;\n  background-image: none;\n  border: 1px solid transparent;\n  border-radius: 2px; }\n  .navbar-toggle:focus {\n    outline: 0; }\n  .navbar-toggle .icon-bar {\n    display: block;\n    width: 22px;\n    height: 2px;\n    border-radius: 1px; }\n  .navbar-toggle .icon-bar + .icon-bar {\n    margin-top: 4px; }\n  @media (min-width: 768px) {\n    .navbar-toggle {\n      display: none; } }\n\n.navbar-nav {\n  margin: 8.25px -15px; }\n  .navbar-nav > li > a {\n    padding-top: 10px;\n    padding-bottom: 10px;\n    line-height: 17px; }\n  @media (max-width: 767px) {\n    .navbar-nav .open .dropdown-menu {\n      position: static;\n      float: none;\n      width: auto;\n      margin-top: 0;\n      background-color: transparent;\n      border: 0;\n      box-shadow: none; }\n      .navbar-nav .open .dropdown-menu > li > a,\n      .navbar-nav .open .dropdown-menu .dropdown-header {\n        padding: 5px 15px 5px 25px; }\n      .navbar-nav .open .dropdown-menu > li > a {\n        line-height: 17px; }\n        .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-nav .open .dropdown-menu > li > a:focus {\n          background-image: none; } }\n  @media (min-width: 768px) {\n    .navbar-nav {\n      float: left;\n      margin: 0; }\n      .navbar-nav > li {\n        float: left; }\n        .navbar-nav > li > a {\n          padding-top: 16.5px;\n          padding-bottom: 16.5px; } }\n\n.navbar-form {\n  margin-left: -15px;\n  margin-right: -15px;\n  padding: 10px 15px;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1);\n  margin-top: 9.5px;\n  margin-bottom: 9.5px; }\n  @media (min-width: 768px) {\n    .navbar-form .form-group {\n      display: inline-block;\n      margin-bottom: 0;\n      vertical-align: middle; }\n    .navbar-form .form-control {\n      display: inline-block;\n      width: auto;\n      vertical-align: middle; }\n    .navbar-form .form-control-static {\n      display: inline-block; }\n    .navbar-form .input-group {\n      display: inline-table;\n      vertical-align: middle; }\n      .navbar-form .input-group .input-group-addon,\n      .navbar-form .input-group .input-group-btn,\n      .navbar-form .input-group .form-control {\n        width: auto; }\n    .navbar-form .input-group > .form-control {\n      width: 100%; }\n    .navbar-form .control-label {\n      margin-bottom: 0;\n      vertical-align: middle; }\n    .navbar-form .radio,\n    .navbar-form .checkbox {\n      display: inline-block;\n      margin-top: 0;\n      margin-bottom: 0;\n      vertical-align: middle; }\n      .navbar-form .radio label,\n      .navbar-form .checkbox label {\n        padding-left: 0; }\n    .navbar-form .radio input[type=\"radio\"],\n    .navbar-form .checkbox input[type=\"checkbox\"] {\n      position: relative;\n      margin-left: 0; }\n    .navbar-form .has-feedback .form-control-feedback {\n      top: 0; } }\n  @media (max-width: 767px) {\n    .navbar-form .form-group {\n      margin-bottom: 5px; }\n      .navbar-form .form-group:last-child {\n        margin-bottom: 0; } }\n  @media (min-width: 768px) {\n    .navbar-form {\n      width: auto;\n      border: 0;\n      margin-left: 0;\n      margin-right: 0;\n      padding-top: 0;\n      padding-bottom: 0;\n      box-shadow: none; } }\n\n.navbar-nav > li > .dropdown-menu {\n  margin-top: 0;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.navbar-fixed-bottom .navbar-nav > li > .dropdown-menu {\n  margin-bottom: 0;\n  border-top-right-radius: 2px;\n  border-top-left-radius: 2px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0; }\n\n.navbar-btn {\n  margin-top: 9.5px;\n  margin-bottom: 9.5px; }\n  .navbar-btn.btn-sm, .btn-group-sm > .navbar-btn.btn {\n    margin-top: 8.5px;\n    margin-bottom: 8.5px; }\n  .navbar-btn.btn-xs, .btn-group-xs > .navbar-btn.btn {\n    margin-top: 14px;\n    margin-bottom: 14px; }\n\n.navbar-text {\n  margin-top: 16.5px;\n  margin-bottom: 16.5px; }\n  @media (min-width: 768px) {\n    .navbar-text {\n      float: left;\n      margin-left: 15px;\n      margin-right: 15px; } }\n\n@media (min-width: 768px) {\n  .navbar-left {\n    float: left !important; }\n  .navbar-right {\n    float: right !important;\n    margin-right: -15px; }\n    .navbar-right ~ .navbar-right {\n      margin-right: 0; } }\n\n.navbar-default {\n  background-color: #f8f8f8;\n  border-color: #e7e7e7; }\n  .navbar-default .navbar-brand {\n    color: #777; }\n    .navbar-default .navbar-brand:hover, .navbar-default .navbar-brand:focus {\n      color: #5e5e5e;\n      background-color: transparent; }\n  .navbar-default .navbar-text {\n    color: #777; }\n  .navbar-default .navbar-nav > li > a {\n    color: #777; }\n    .navbar-default .navbar-nav > li > a:hover, .navbar-default .navbar-nav > li > a:focus {\n      color: #333;\n      background-color: transparent; }\n  .navbar-default .navbar-nav > .active > a, .navbar-default .navbar-nav > .active > a:hover, .navbar-default .navbar-nav > .active > a:focus {\n    color: #555;\n    background-color: #e7e7e7; }\n  .navbar-default .navbar-nav > .disabled > a, .navbar-default .navbar-nav > .disabled > a:hover, .navbar-default .navbar-nav > .disabled > a:focus {\n    color: #ccc;\n    background-color: transparent; }\n  .navbar-default .navbar-toggle {\n    border-color: #ddd; }\n    .navbar-default .navbar-toggle:hover, .navbar-default .navbar-toggle:focus {\n      background-color: #ddd; }\n    .navbar-default .navbar-toggle .icon-bar {\n      background-color: #888; }\n  .navbar-default .navbar-collapse,\n  .navbar-default .navbar-form {\n    border-color: #e7e7e7; }\n  .navbar-default .navbar-nav > .open > a, .navbar-default .navbar-nav > .open > a:hover, .navbar-default .navbar-nav > .open > a:focus {\n    background-color: #e7e7e7;\n    color: #555; }\n  @media (max-width: 767px) {\n    .navbar-default .navbar-nav .open .dropdown-menu > li > a {\n      color: #777; }\n      .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {\n        color: #333;\n        background-color: transparent; }\n    .navbar-default .navbar-nav .open .dropdown-menu > .active > a, .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover, .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus {\n      color: #555;\n      background-color: #e7e7e7; }\n    .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a, .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover, .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n      color: #ccc;\n      background-color: transparent; } }\n  .navbar-default .navbar-link {\n    color: #777; }\n    .navbar-default .navbar-link:hover {\n      color: #333; }\n  .navbar-default .btn-link {\n    color: #777; }\n    .navbar-default .btn-link:hover, .navbar-default .btn-link:focus {\n      color: #333; }\n    .navbar-default .btn-link[disabled]:hover, .navbar-default .btn-link[disabled]:focus,\n    fieldset[disabled] .navbar-default .btn-link:hover,\n    fieldset[disabled] .navbar-default .btn-link:focus {\n      color: #ccc; }\n\n.navbar-inverse {\n  background-color: #222;\n  border-color: #090909; }\n  .navbar-inverse .navbar-brand {\n    color: #CCC; }\n    .navbar-inverse .navbar-brand:hover, .navbar-inverse .navbar-brand:focus {\n      color: #fff;\n      background-color: transparent; }\n  .navbar-inverse .navbar-text {\n    color: #CCC; }\n  .navbar-inverse .navbar-nav > li > a {\n    color: #CCC; }\n    .navbar-inverse .navbar-nav > li > a:hover, .navbar-inverse .navbar-nav > li > a:focus {\n      color: #fff;\n      background-color: transparent; }\n  .navbar-inverse .navbar-nav > .active > a, .navbar-inverse .navbar-nav > .active > a:hover, .navbar-inverse .navbar-nav > .active > a:focus {\n    color: #fff;\n    background-color: #090909; }\n  .navbar-inverse .navbar-nav > .disabled > a, .navbar-inverse .navbar-nav > .disabled > a:hover, .navbar-inverse .navbar-nav > .disabled > a:focus {\n    color: #444;\n    background-color: transparent; }\n  .navbar-inverse .navbar-toggle {\n    border-color: #333; }\n    .navbar-inverse .navbar-toggle:hover, .navbar-inverse .navbar-toggle:focus {\n      background-color: #333; }\n    .navbar-inverse .navbar-toggle .icon-bar {\n      background-color: #fff; }\n  .navbar-inverse .navbar-collapse,\n  .navbar-inverse .navbar-form {\n    border-color: #101010; }\n  .navbar-inverse .navbar-nav > .open > a, .navbar-inverse .navbar-nav > .open > a:hover, .navbar-inverse .navbar-nav > .open > a:focus {\n    background-color: #090909;\n    color: #fff; }\n  @media (max-width: 767px) {\n    .navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header {\n      border-color: #090909; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu .divider {\n      background-color: #090909; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu > li > a {\n      color: #CCC; }\n      .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover, .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus {\n        color: #fff;\n        background-color: transparent; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a, .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover, .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus {\n      color: #fff;\n      background-color: #090909; }\n    .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a, .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover, .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n      color: #444;\n      background-color: transparent; } }\n  .navbar-inverse .navbar-link {\n    color: #CCC; }\n    .navbar-inverse .navbar-link:hover {\n      color: #fff; }\n  .navbar-inverse .btn-link {\n    color: #CCC; }\n    .navbar-inverse .btn-link:hover, .navbar-inverse .btn-link:focus {\n      color: #fff; }\n    .navbar-inverse .btn-link[disabled]:hover, .navbar-inverse .btn-link[disabled]:focus,\n    fieldset[disabled] .navbar-inverse .btn-link:hover,\n    fieldset[disabled] .navbar-inverse .btn-link:focus {\n      color: #444; }\n\n.breadcrumb {\n  padding: 8px 15px;\n  margin-bottom: 17px;\n  list-style: none;\n  background-color: #f5f5f5;\n  border-radius: 2px; }\n  .breadcrumb > li {\n    display: inline-block; }\n    .breadcrumb > li + li:before {\n      content: \"/\\A0\";\n      padding: 0 5px;\n      color: #ccc; }\n  .breadcrumb > .active {\n    color: #CCC; }\n\n.pagination {\n  display: inline-block;\n  padding-left: 0;\n  margin: 17px 0;\n  border-radius: 2px; }\n  .pagination > li {\n    display: inline; }\n    .pagination > li > a,\n    .pagination > li > span {\n      position: relative;\n      float: left;\n      padding: 6px 12px;\n      line-height: 1.42857;\n      text-decoration: none;\n      color: #3399ff;\n      background-color: #fff;\n      border: 1px solid #ddd;\n      margin-left: -1px; }\n    .pagination > li:first-child > a,\n    .pagination > li:first-child > span {\n      margin-left: 0;\n      border-bottom-left-radius: 2px;\n      border-top-left-radius: 2px; }\n    .pagination > li:last-child > a,\n    .pagination > li:last-child > span {\n      border-bottom-right-radius: 2px;\n      border-top-right-radius: 2px; }\n  .pagination > li > a:hover, .pagination > li > a:focus,\n  .pagination > li > span:hover,\n  .pagination > li > span:focus {\n    z-index: 2;\n    color: #0073e6;\n    background-color: #eeeeee;\n    border-color: #ddd; }\n  .pagination > .active > a, .pagination > .active > a:hover, .pagination > .active > a:focus,\n  .pagination > .active > span,\n  .pagination > .active > span:hover,\n  .pagination > .active > span:focus {\n    z-index: 3;\n    color: #fff;\n    background-color: #3399ff;\n    border-color: #3399ff;\n    cursor: default; }\n  .pagination > .disabled > span,\n  .pagination > .disabled > span:hover,\n  .pagination > .disabled > span:focus,\n  .pagination > .disabled > a,\n  .pagination > .disabled > a:hover,\n  .pagination > .disabled > a:focus {\n    color: #CCC;\n    background-color: #fff;\n    border-color: #ddd;\n    cursor: not-allowed; }\n\n.pagination-lg > li > a,\n.pagination-lg > li > span {\n  padding: 10px 16px;\n  font-size: 15px;\n  line-height: 1.33; }\n\n.pagination-lg > li:first-child > a,\n.pagination-lg > li:first-child > span {\n  border-bottom-left-radius: 6px;\n  border-top-left-radius: 6px; }\n\n.pagination-lg > li:last-child > a,\n.pagination-lg > li:last-child > span {\n  border-bottom-right-radius: 6px;\n  border-top-right-radius: 6px; }\n\n.pagination-sm > li > a,\n.pagination-sm > li > span {\n  padding: 5px 10px;\n  font-size: 14px;\n  line-height: 1.5; }\n\n.pagination-sm > li:first-child > a,\n.pagination-sm > li:first-child > span {\n  border-bottom-left-radius: 4px;\n  border-top-left-radius: 4px; }\n\n.pagination-sm > li:last-child > a,\n.pagination-sm > li:last-child > span {\n  border-bottom-right-radius: 4px;\n  border-top-right-radius: 4px; }\n\n.pager {\n  padding-left: 0;\n  margin: 17px 0;\n  list-style: none;\n  text-align: center; }\n  .pager:before, .pager:after {\n    content: \" \";\n    display: table; }\n  .pager:after {\n    clear: both; }\n  .pager li {\n    display: inline; }\n    .pager li > a,\n    .pager li > span {\n      display: inline-block;\n      padding: 5px 14px;\n      background-color: #fff;\n      border: 1px solid #ddd;\n      border-radius: 15px; }\n  .pager .next > a,\n  .pager .next > span {\n    float: right; }\n  .pager .previous > a,\n  .pager .previous > span {\n    float: left; }\n  .pager .disabled > a,\n  .pager .disabled > a:hover,\n  .pager .disabled > a:focus,\n  .pager .disabled > span {\n    color: #CCC;\n    background-color: #fff;\n    cursor: not-allowed; }\n\n.label {\n  display: inline;\n  padding: .2em .6em .3em;\n  font-size: 75%;\n  font-weight: bold;\n  line-height: 1;\n  color: #fff;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: .25em; }\n  .label:empty {\n    display: none; }\n  .btn .label {\n    position: relative;\n    top: -1px; }\n\na.label:hover, a.label:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer; }\n\n.label-default {\n  background-color: #CCC; }\n  .label-default[href]:hover, .label-default[href]:focus {\n    background-color: #b3b3b3; }\n\n.label-primary {\n  background-color: #3399ff; }\n  .label-primary[href]:hover, .label-primary[href]:focus {\n    background-color: #0080ff; }\n\n.label-success {\n  background-color: #5cb85c; }\n  .label-success[href]:hover, .label-success[href]:focus {\n    background-color: #449d44; }\n\n.label-info {\n  background-color: #c1e0f0; }\n  .label-info[href]:hover, .label-info[href]:focus {\n    background-color: #98cbe6; }\n\n.label-warning {\n  background-color: #f0ad4e; }\n  .label-warning[href]:hover, .label-warning[href]:focus {\n    background-color: #ec971f; }\n\n.label-danger {\n  background-color: #ee6b63; }\n  .label-danger[href]:hover, .label-danger[href]:focus {\n    background-color: #e93f35; }\n\n.badge {\n  display: inline-block;\n  min-width: 10px;\n  padding: 3px 7px;\n  font-size: 14px;\n  font-weight: bold;\n  color: #fff;\n  line-height: 1;\n  vertical-align: middle;\n  white-space: nowrap;\n  text-align: center;\n  background-color: #3399ff;\n  border-radius: 10px; }\n  .badge:empty {\n    display: none; }\n  .btn .badge {\n    position: relative;\n    top: -1px; }\n  .btn-xs .badge, .btn-group-xs > .btn .badge,\n  .btn-group-xs > .btn .badge {\n    top: 0;\n    padding: 1px 5px; }\n  .list-group-item.active > .badge,\n  .nav-pills > .active > a > .badge {\n    color: #3399ff;\n    background-color: #fff; }\n  .list-group-item > .badge {\n    float: right; }\n  .list-group-item > .badge + .badge {\n    margin-right: 5px; }\n  .nav-pills > li > a > .badge {\n    margin-left: 3px; }\n\na.badge:hover, a.badge:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer; }\n\n.jumbotron {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #eeeeee; }\n  .jumbotron h1,\n  .jumbotron .h1 {\n    color: inherit; }\n  .jumbotron p {\n    margin-bottom: 15px;\n    font-size: 18px;\n    font-weight: 200; }\n  .jumbotron > hr {\n    border-top-color: #d5d5d5; }\n  .container .jumbotron,\n  .container-fluid .jumbotron {\n    border-radius: 6px;\n    padding-left: 15px;\n    padding-right: 15px; }\n  .jumbotron .container {\n    max-width: 100%; }\n  @media screen and (min-width: 768px) {\n    .jumbotron {\n      padding-top: 48px;\n      padding-bottom: 48px; }\n      .container .jumbotron,\n      .container-fluid .jumbotron {\n        padding-left: 60px;\n        padding-right: 60px; }\n      .jumbotron h1,\n      .jumbotron .h1 {\n        font-size: 54px; } }\n\n.thumbnail {\n  display: block;\n  padding: 4px;\n  margin-bottom: 17px;\n  line-height: 1.42857;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 2px;\n  -webkit-transition: border 0.2s ease-in-out;\n  transition: border 0.2s ease-in-out; }\n  .thumbnail > img,\n  .thumbnail a > img {\n    display: block;\n    max-width: 100%;\n    height: auto;\n    margin-left: auto;\n    margin-right: auto; }\n  .thumbnail .caption {\n    padding: 9px;\n    color: #666666; }\n\na.thumbnail:hover,\na.thumbnail:focus,\na.thumbnail.active {\n  border-color: #3399ff; }\n\n.alert {\n  padding: 15px;\n  margin-bottom: 17px;\n  border: 1px solid transparent;\n  border-radius: 2px; }\n  .alert h4 {\n    margin-top: 0;\n    color: inherit; }\n  .alert .alert-link {\n    font-weight: bold; }\n  .alert > p,\n  .alert > ul {\n    margin-bottom: 0; }\n  .alert > p + p {\n    margin-top: 5px; }\n\n.alert-dismissable,\n.alert-dismissible {\n  padding-right: 35px; }\n  .alert-dismissable .close,\n  .alert-dismissible .close {\n    position: relative;\n    top: -2px;\n    right: -21px;\n    color: inherit; }\n\n.alert-success {\n  background-color: #dff0d8;\n  border-color: #d6e9c6;\n  color: #3c763d; }\n  .alert-success hr {\n    border-top-color: #c9e2b3; }\n  .alert-success .alert-link {\n    color: #2b542c; }\n\n.alert-info {\n  background-color: #d9edf7;\n  border-color: #bce8f1;\n  color: #3c6e9f; }\n  .alert-info hr {\n    border-top-color: #a6e1ec; }\n  .alert-info .alert-link {\n    color: #2e547a; }\n\n.alert-warning {\n  background-color: #fcf8e3;\n  border-color: #faebcc;\n  color: #8a6d3b; }\n  .alert-warning hr {\n    border-top-color: #f7e1b5; }\n  .alert-warning .alert-link {\n    color: #66512c; }\n\n.alert-danger {\n  background-color: #f2dede;\n  border-color: #ebccd1;\n  color: #e36159; }\n  .alert-danger hr {\n    border-top-color: #e4b9c0; }\n  .alert-danger .alert-link {\n    color: #dc372d; }\n\n@-webkit-keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0; }\n  to {\n    background-position: 0 0; } }\n\n@keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0; }\n  to {\n    background-position: 0 0; } }\n\n.progress {\n  overflow: hidden;\n  height: 17px;\n  margin-bottom: 17px;\n  background-color: #f5f5f5;\n  border-radius: 2px;\n  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1); }\n\n.progress-bar {\n  float: left;\n  width: 0%;\n  height: 100%;\n  font-size: 14px;\n  line-height: 17px;\n  color: #fff;\n  text-align: center;\n  background-color: #3399ff;\n  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);\n  -webkit-transition: width 0.6s ease;\n  transition: width 0.6s ease; }\n\n.progress-striped .progress-bar,\n.progress-bar-striped {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-size: 40px 40px; }\n\n.progress.active .progress-bar,\n.progress-bar.active {\n  -webkit-animation: progress-bar-stripes 2s linear infinite;\n  animation: progress-bar-stripes 2s linear infinite; }\n\n.progress-bar-success {\n  background-color: #5cb85c; }\n  .progress-striped .progress-bar-success {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.progress-bar-info {\n  background-color: #c1e0f0; }\n  .progress-striped .progress-bar-info {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.progress-bar-warning {\n  background-color: #f0ad4e; }\n  .progress-striped .progress-bar-warning {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.progress-bar-danger {\n  background-color: #ee6b63; }\n  .progress-striped .progress-bar-danger {\n    background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n    background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); }\n\n.media {\n  margin-top: 15px; }\n  .media:first-child {\n    margin-top: 0; }\n\n.media,\n.media-body {\n  zoom: 1;\n  overflow: hidden; }\n\n.media-body {\n  width: 10000px; }\n\n.media-object {\n  display: block; }\n  .media-object.img-thumbnail {\n    max-width: none; }\n\n.media-right,\n.media > .pull-right {\n  padding-left: 10px; }\n\n.media-left,\n.media > .pull-left {\n  padding-right: 10px; }\n\n.media-left,\n.media-right,\n.media-body {\n  display: table-cell;\n  vertical-align: top; }\n\n.media-middle {\n  vertical-align: middle; }\n\n.media-bottom {\n  vertical-align: bottom; }\n\n.media-heading {\n  margin-top: 0;\n  margin-bottom: 5px; }\n\n.media-list {\n  padding-left: 0;\n  list-style: none; }\n\n.list-group {\n  margin-bottom: 20px;\n  padding-left: 0; }\n\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n  margin-bottom: -1px;\n  background-color: #fff;\n  border: 1px solid #ddd; }\n  .list-group-item:first-child {\n    border-top-right-radius: 2px;\n    border-top-left-radius: 2px; }\n  .list-group-item:last-child {\n    margin-bottom: 0;\n    border-bottom-right-radius: 2px;\n    border-bottom-left-radius: 2px; }\n\na.list-group-item,\nbutton.list-group-item {\n  color: #555; }\n  a.list-group-item .list-group-item-heading,\n  button.list-group-item .list-group-item-heading {\n    color: #333; }\n  a.list-group-item:hover, a.list-group-item:focus,\n  button.list-group-item:hover,\n  button.list-group-item:focus {\n    text-decoration: none;\n    color: #555;\n    background-color: #f5f5f5; }\n\nbutton.list-group-item {\n  width: 100%;\n  text-align: left; }\n\n.list-group-item.disabled, .list-group-item.disabled:hover, .list-group-item.disabled:focus {\n  background-color: #eeeeee;\n  color: #CCC;\n  cursor: not-allowed; }\n  .list-group-item.disabled .list-group-item-heading, .list-group-item.disabled:hover .list-group-item-heading, .list-group-item.disabled:focus .list-group-item-heading {\n    color: inherit; }\n  .list-group-item.disabled .list-group-item-text, .list-group-item.disabled:hover .list-group-item-text, .list-group-item.disabled:focus .list-group-item-text {\n    color: #CCC; }\n\n.list-group-item.active, .list-group-item.active:hover, .list-group-item.active:focus {\n  z-index: 2;\n  color: #fff;\n  background-color: #3399ff;\n  border-color: #3399ff; }\n  .list-group-item.active .list-group-item-heading,\n  .list-group-item.active .list-group-item-heading > small,\n  .list-group-item.active .list-group-item-heading > .small, .list-group-item.active:hover .list-group-item-heading,\n  .list-group-item.active:hover .list-group-item-heading > small,\n  .list-group-item.active:hover .list-group-item-heading > .small, .list-group-item.active:focus .list-group-item-heading,\n  .list-group-item.active:focus .list-group-item-heading > small,\n  .list-group-item.active:focus .list-group-item-heading > .small {\n    color: inherit; }\n  .list-group-item.active .list-group-item-text, .list-group-item.active:hover .list-group-item-text, .list-group-item.active:focus .list-group-item-text {\n    color: white; }\n\n.list-group-item-success {\n  color: #3c763d;\n  background-color: #dff0d8; }\n\na.list-group-item-success,\nbutton.list-group-item-success {\n  color: #3c763d; }\n  a.list-group-item-success .list-group-item-heading,\n  button.list-group-item-success .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-success:hover, a.list-group-item-success:focus,\n  button.list-group-item-success:hover,\n  button.list-group-item-success:focus {\n    color: #3c763d;\n    background-color: #d0e9c6; }\n  a.list-group-item-success.active, a.list-group-item-success.active:hover, a.list-group-item-success.active:focus,\n  button.list-group-item-success.active,\n  button.list-group-item-success.active:hover,\n  button.list-group-item-success.active:focus {\n    color: #fff;\n    background-color: #3c763d;\n    border-color: #3c763d; }\n\n.list-group-item-info {\n  color: #3c6e9f;\n  background-color: #d9edf7; }\n\na.list-group-item-info,\nbutton.list-group-item-info {\n  color: #3c6e9f; }\n  a.list-group-item-info .list-group-item-heading,\n  button.list-group-item-info .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-info:hover, a.list-group-item-info:focus,\n  button.list-group-item-info:hover,\n  button.list-group-item-info:focus {\n    color: #3c6e9f;\n    background-color: #c4e3f3; }\n  a.list-group-item-info.active, a.list-group-item-info.active:hover, a.list-group-item-info.active:focus,\n  button.list-group-item-info.active,\n  button.list-group-item-info.active:hover,\n  button.list-group-item-info.active:focus {\n    color: #fff;\n    background-color: #3c6e9f;\n    border-color: #3c6e9f; }\n\n.list-group-item-warning {\n  color: #8a6d3b;\n  background-color: #fcf8e3; }\n\na.list-group-item-warning,\nbutton.list-group-item-warning {\n  color: #8a6d3b; }\n  a.list-group-item-warning .list-group-item-heading,\n  button.list-group-item-warning .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-warning:hover, a.list-group-item-warning:focus,\n  button.list-group-item-warning:hover,\n  button.list-group-item-warning:focus {\n    color: #8a6d3b;\n    background-color: #faf2cc; }\n  a.list-group-item-warning.active, a.list-group-item-warning.active:hover, a.list-group-item-warning.active:focus,\n  button.list-group-item-warning.active,\n  button.list-group-item-warning.active:hover,\n  button.list-group-item-warning.active:focus {\n    color: #fff;\n    background-color: #8a6d3b;\n    border-color: #8a6d3b; }\n\n.list-group-item-danger {\n  color: #e36159;\n  background-color: #f2dede; }\n\na.list-group-item-danger,\nbutton.list-group-item-danger {\n  color: #e36159; }\n  a.list-group-item-danger .list-group-item-heading,\n  button.list-group-item-danger .list-group-item-heading {\n    color: inherit; }\n  a.list-group-item-danger:hover, a.list-group-item-danger:focus,\n  button.list-group-item-danger:hover,\n  button.list-group-item-danger:focus {\n    color: #e36159;\n    background-color: #ebcccc; }\n  a.list-group-item-danger.active, a.list-group-item-danger.active:hover, a.list-group-item-danger.active:focus,\n  button.list-group-item-danger.active,\n  button.list-group-item-danger.active:hover,\n  button.list-group-item-danger.active:focus {\n    color: #fff;\n    background-color: #e36159;\n    border-color: #e36159; }\n\n.list-group-item-heading {\n  margin-top: 0;\n  margin-bottom: 5px; }\n\n.list-group-item-text {\n  margin-bottom: 0;\n  line-height: 1.3; }\n\n.panel {\n  margin-bottom: 17px;\n  background-color: #fff;\n  border: 1px solid transparent;\n  border-radius: 2px;\n  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05); }\n\n.panel-body {\n  padding: 15px; }\n  .panel-body:before, .panel-body:after {\n    content: \" \";\n    display: table; }\n  .panel-body:after {\n    clear: both; }\n\n.panel-heading {\n  padding: 10px 15px;\n  border-bottom: 1px solid transparent;\n  border-top-right-radius: 1px;\n  border-top-left-radius: 1px; }\n  .panel-heading > .dropdown .dropdown-toggle {\n    color: inherit; }\n\n.panel-title {\n  margin-top: 0;\n  margin-bottom: 0;\n  font-size: 14px;\n  color: inherit; }\n  .panel-title > a,\n  .panel-title > small,\n  .panel-title > .small,\n  .panel-title > small > a,\n  .panel-title > .small > a {\n    color: inherit; }\n\n.panel-footer {\n  padding: 10px 15px;\n  background-color: #f5f5f5;\n  border-top: 1px solid #ddd;\n  border-bottom-right-radius: 1px;\n  border-bottom-left-radius: 1px; }\n\n.panel > .list-group,\n.panel > .panel-collapse > .list-group {\n  margin-bottom: 0; }\n  .panel > .list-group .list-group-item,\n  .panel > .panel-collapse > .list-group .list-group-item {\n    border-width: 1px 0;\n    border-radius: 0; }\n  .panel > .list-group:first-child .list-group-item:first-child,\n  .panel > .panel-collapse > .list-group:first-child .list-group-item:first-child {\n    border-top: 0;\n    border-top-right-radius: 1px;\n    border-top-left-radius: 1px; }\n  .panel > .list-group:last-child .list-group-item:last-child,\n  .panel > .panel-collapse > .list-group:last-child .list-group-item:last-child {\n    border-bottom: 0;\n    border-bottom-right-radius: 1px;\n    border-bottom-left-radius: 1px; }\n\n.panel > .panel-heading + .panel-collapse > .list-group .list-group-item:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0; }\n\n.panel-heading + .list-group .list-group-item:first-child {\n  border-top-width: 0; }\n\n.list-group + .panel-footer {\n  border-top-width: 0; }\n\n.panel > .table,\n.panel > .table-responsive > .table,\n.panel > .panel-collapse > .table {\n  margin-bottom: 0; }\n  .panel > .table caption,\n  .panel > .table-responsive > .table caption,\n  .panel > .panel-collapse > .table caption {\n    padding-left: 15px;\n    padding-right: 15px; }\n\n.panel > .table:first-child,\n.panel > .table-responsive:first-child > .table:first-child {\n  border-top-right-radius: 1px;\n  border-top-left-radius: 1px; }\n  .panel > .table:first-child > thead:first-child > tr:first-child,\n  .panel > .table:first-child > tbody:first-child > tr:first-child,\n  .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child,\n  .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child {\n    border-top-left-radius: 1px;\n    border-top-right-radius: 1px; }\n    .panel > .table:first-child > thead:first-child > tr:first-child td:first-child,\n    .panel > .table:first-child > thead:first-child > tr:first-child th:first-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child th:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:first-child {\n      border-top-left-radius: 1px; }\n    .panel > .table:first-child > thead:first-child > tr:first-child td:last-child,\n    .panel > .table:first-child > thead:first-child > tr:first-child th:last-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n    .panel > .table:first-child > tbody:first-child > tr:first-child th:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n    .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:last-child {\n      border-top-right-radius: 1px; }\n\n.panel > .table:last-child,\n.panel > .table-responsive:last-child > .table:last-child {\n  border-bottom-right-radius: 1px;\n  border-bottom-left-radius: 1px; }\n  .panel > .table:last-child > tbody:last-child > tr:last-child,\n  .panel > .table:last-child > tfoot:last-child > tr:last-child,\n  .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child,\n  .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child {\n    border-bottom-left-radius: 1px;\n    border-bottom-right-radius: 1px; }\n    .panel > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n    .panel > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child th:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:first-child {\n      border-bottom-left-radius: 1px; }\n    .panel > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n    .panel > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n    .panel > .table:last-child > tfoot:last-child > tr:last-child th:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n    .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:last-child {\n      border-bottom-right-radius: 1px; }\n\n.panel > .panel-body + .table,\n.panel > .panel-body + .table-responsive,\n.panel > .table + .panel-body,\n.panel > .table-responsive + .panel-body {\n  border-top: 1px solid #e1e5e8; }\n\n.panel > .table > tbody:first-child > tr:first-child th,\n.panel > .table > tbody:first-child > tr:first-child td {\n  border-top: 0; }\n\n.panel > .table-bordered,\n.panel > .table-responsive > .table-bordered {\n  border: 0; }\n  .panel > .table-bordered > thead > tr > th:first-child,\n  .panel > .table-bordered > thead > tr > td:first-child,\n  .panel > .table-bordered > tbody > tr > th:first-child,\n  .panel > .table-bordered > tbody > tr > td:first-child,\n  .panel > .table-bordered > tfoot > tr > th:first-child,\n  .panel > .table-bordered > tfoot > tr > td:first-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > th:first-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > td:first-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > th:first-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > td:first-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n    border-left: 0; }\n  .panel > .table-bordered > thead > tr > th:last-child,\n  .panel > .table-bordered > thead > tr > td:last-child,\n  .panel > .table-bordered > tbody > tr > th:last-child,\n  .panel > .table-bordered > tbody > tr > td:last-child,\n  .panel > .table-bordered > tfoot > tr > th:last-child,\n  .panel > .table-bordered > tfoot > tr > td:last-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > th:last-child,\n  .panel > .table-responsive > .table-bordered > thead > tr > td:last-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > th:last-child,\n  .panel > .table-responsive > .table-bordered > tbody > tr > td:last-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n  .panel > .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n    border-right: 0; }\n  .panel > .table-bordered > thead > tr:first-child > td,\n  .panel > .table-bordered > thead > tr:first-child > th,\n  .panel > .table-bordered > tbody > tr:first-child > td,\n  .panel > .table-bordered > tbody > tr:first-child > th,\n  .panel > .table-responsive > .table-bordered > thead > tr:first-child > td,\n  .panel > .table-responsive > .table-bordered > thead > tr:first-child > th,\n  .panel > .table-responsive > .table-bordered > tbody > tr:first-child > td,\n  .panel > .table-responsive > .table-bordered > tbody > tr:first-child > th {\n    border-bottom: 0; }\n  .panel > .table-bordered > tbody > tr:last-child > td,\n  .panel > .table-bordered > tbody > tr:last-child > th,\n  .panel > .table-bordered > tfoot > tr:last-child > td,\n  .panel > .table-bordered > tfoot > tr:last-child > th,\n  .panel > .table-responsive > .table-bordered > tbody > tr:last-child > td,\n  .panel > .table-responsive > .table-bordered > tbody > tr:last-child > th,\n  .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > td,\n  .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > th {\n    border-bottom: 0; }\n\n.panel > .table-responsive {\n  border: 0;\n  margin-bottom: 0; }\n\n.panel-group {\n  margin-bottom: 17px; }\n  .panel-group .panel {\n    margin-bottom: 0;\n    border-radius: 2px; }\n    .panel-group .panel + .panel {\n      margin-top: 5px; }\n  .panel-group .panel-heading {\n    border-bottom: 0; }\n    .panel-group .panel-heading + .panel-collapse > .panel-body,\n    .panel-group .panel-heading + .panel-collapse > .list-group {\n      border-top: 1px solid #ddd; }\n  .panel-group .panel-footer {\n    border-top: 0; }\n    .panel-group .panel-footer + .panel-collapse .panel-body {\n      border-bottom: 1px solid #ddd; }\n\n.panel-default {\n  border-color: #ddd; }\n  .panel-default > .panel-heading {\n    color: #666666;\n    background-color: #f5f5f5;\n    border-color: #ddd; }\n    .panel-default > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #ddd; }\n    .panel-default > .panel-heading .badge {\n      color: #f5f5f5;\n      background-color: #666666; }\n  .panel-default > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #ddd; }\n\n.panel-primary {\n  border-color: #3399ff; }\n  .panel-primary > .panel-heading {\n    color: #fff;\n    background-color: #3399ff;\n    border-color: #3399ff; }\n    .panel-primary > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #3399ff; }\n    .panel-primary > .panel-heading .badge {\n      color: #3399ff;\n      background-color: #fff; }\n  .panel-primary > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #3399ff; }\n\n.panel-success {\n  border-color: #d6e9c6; }\n  .panel-success > .panel-heading {\n    color: #3c763d;\n    background-color: #dff0d8;\n    border-color: #d6e9c6; }\n    .panel-success > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #d6e9c6; }\n    .panel-success > .panel-heading .badge {\n      color: #dff0d8;\n      background-color: #3c763d; }\n  .panel-success > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #d6e9c6; }\n\n.panel-info {\n  border-color: #bce8f1; }\n  .panel-info > .panel-heading {\n    color: #3c6e9f;\n    background-color: #d9edf7;\n    border-color: #bce8f1; }\n    .panel-info > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #bce8f1; }\n    .panel-info > .panel-heading .badge {\n      color: #d9edf7;\n      background-color: #3c6e9f; }\n  .panel-info > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #bce8f1; }\n\n.panel-warning {\n  border-color: #faebcc; }\n  .panel-warning > .panel-heading {\n    color: #8a6d3b;\n    background-color: #fcf8e3;\n    border-color: #faebcc; }\n    .panel-warning > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #faebcc; }\n    .panel-warning > .panel-heading .badge {\n      color: #fcf8e3;\n      background-color: #8a6d3b; }\n  .panel-warning > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #faebcc; }\n\n.panel-danger {\n  border-color: #ebccd1; }\n  .panel-danger > .panel-heading {\n    color: #e36159;\n    background-color: #f2dede;\n    border-color: #ebccd1; }\n    .panel-danger > .panel-heading + .panel-collapse > .panel-body {\n      border-top-color: #ebccd1; }\n    .panel-danger > .panel-heading .badge {\n      color: #f2dede;\n      background-color: #e36159; }\n  .panel-danger > .panel-footer + .panel-collapse > .panel-body {\n    border-bottom-color: #ebccd1; }\n\n.embed-responsive {\n  position: relative;\n  display: block;\n  height: 0;\n  padding: 0;\n  overflow: hidden; }\n  .embed-responsive .embed-responsive-item,\n  .embed-responsive iframe,\n  .embed-responsive embed,\n  .embed-responsive object,\n  .embed-responsive video {\n    position: absolute;\n    top: 0;\n    left: 0;\n    bottom: 0;\n    height: 100%;\n    width: 100%;\n    border: 0; }\n\n.embed-responsive-16by9 {\n  padding-bottom: 56.25%; }\n\n.embed-responsive-4by3 {\n  padding-bottom: 75%; }\n\n.well {\n  min-height: 20px;\n  padding: 19px;\n  margin-bottom: 20px;\n  background-color: #f5f5f5;\n  border: 1px solid #e3e3e3;\n  border-radius: 2px;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05); }\n  .well blockquote {\n    border-color: #ddd;\n    border-color: rgba(0, 0, 0, 0.15); }\n\n.well-lg {\n  padding: 24px;\n  border-radius: 6px; }\n\n.well-sm {\n  padding: 9px;\n  border-radius: 4px; }\n\n.close {\n  float: right;\n  font-size: 18px;\n  font-weight: bold;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  opacity: 0.2;\n  filter: alpha(opacity=20); }\n  .close:hover, .close:focus {\n    color: #000;\n    text-decoration: none;\n    cursor: pointer;\n    opacity: 0.5;\n    filter: alpha(opacity=50); }\n\nbutton.close {\n  padding: 0;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none; }\n\n.modal-open {\n  overflow: hidden; }\n\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1040;\n  background-color: #000; }\n  .modal-backdrop.fade {\n    opacity: 0;\n    filter: alpha(opacity=0); }\n  .modal-backdrop.in {\n    opacity: 0.5;\n    filter: alpha(opacity=50); }\n\n.modal-header {\n  padding: 10px;\n  border-bottom: 1px solid #fff; }\n  .modal-header:before, .modal-header:after {\n    content: \" \";\n    display: table; }\n  .modal-header:after {\n    clear: both; }\n\n.modal-header .close {\n  margin-top: -2px; }\n\n.modal-title {\n  margin: 0; }\n\n.modal-body {\n  position: relative;\n  padding: 10px; }\n\n.modal-footer {\n  padding: 10px;\n  text-align: right;\n  border-top: 1px solid #fff; }\n  .modal-footer:before, .modal-footer:after {\n    content: \" \";\n    display: table; }\n  .modal-footer:after {\n    clear: both; }\n  .modal-footer .btn + .btn {\n    margin-left: 5px;\n    margin-bottom: 0; }\n  .modal-footer .btn-group .btn + .btn {\n    margin-left: -1px; }\n  .modal-footer .btn-block + .btn-block {\n    margin-left: 0; }\n\n.modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll; }\n\n@media (min-width: 768px) {\n  .modal-sm {\n    width: 300px; } }\n\n@media (min-width: 992px) {\n  .modal-lg {\n    width: 1000px; } }\n\n.tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 14px;\n  opacity: 0;\n  filter: alpha(opacity=0); }\n  .tooltip.in {\n    opacity: 0.9;\n    filter: alpha(opacity=90); }\n  .tooltip.top {\n    margin-top: -3px;\n    padding: 5px 0; }\n  .tooltip.right {\n    margin-left: 3px;\n    padding: 0 5px; }\n  .tooltip.bottom {\n    margin-top: 3px;\n    padding: 5px 0; }\n  .tooltip.left {\n    margin-left: -3px;\n    padding: 0 5px; }\n\n.tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #fff;\n  text-align: center;\n  background-color: #000;\n  border-radius: 2px; }\n\n.tooltip-arrow {\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid; }\n\n.tooltip.top .tooltip-arrow {\n  bottom: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000; }\n\n.tooltip.top-left .tooltip-arrow {\n  bottom: 0;\n  right: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000; }\n\n.tooltip.top-right .tooltip-arrow {\n  bottom: 0;\n  left: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000; }\n\n.tooltip.right .tooltip-arrow {\n  top: 50%;\n  left: 0;\n  margin-top: -5px;\n  border-width: 5px 5px 5px 0;\n  border-right-color: #000; }\n\n.tooltip.left .tooltip-arrow {\n  top: 50%;\n  right: 0;\n  margin-top: -5px;\n  border-width: 5px 0 5px 5px;\n  border-left-color: #000; }\n\n.tooltip.bottom .tooltip-arrow {\n  top: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000; }\n\n.tooltip.bottom-left .tooltip-arrow {\n  top: 0;\n  right: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000; }\n\n.tooltip.bottom-right .tooltip-arrow {\n  top: 0;\n  left: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000; }\n\n.popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: none;\n  max-width: 276px;\n  padding: 1px;\n  font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 12px;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 6px;\n  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2); }\n  .popover.top {\n    margin-top: -10px; }\n  .popover.right {\n    margin-left: 10px; }\n  .popover.bottom {\n    margin-top: 10px; }\n  .popover.left {\n    margin-left: -10px; }\n\n.popover-title {\n  margin: 0;\n  padding: 8px 14px;\n  font-size: 12px;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n  border-radius: 5px 5px 0 0; }\n\n.popover-content {\n  padding: 9px 14px; }\n\n.popover > .arrow, .popover > .arrow:after {\n  position: absolute;\n  display: block;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid; }\n\n.popover > .arrow {\n  border-width: 11px; }\n\n.popover > .arrow:after {\n  border-width: 10px;\n  content: \"\"; }\n\n.popover.top > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-bottom-width: 0;\n  border-top-color: #999999;\n  border-top-color: rgba(0, 0, 0, 0.25);\n  bottom: -11px; }\n  .popover.top > .arrow:after {\n    content: \" \";\n    bottom: 1px;\n    margin-left: -10px;\n    border-bottom-width: 0;\n    border-top-color: #fff; }\n\n.popover.right > .arrow {\n  top: 50%;\n  left: -11px;\n  margin-top: -11px;\n  border-left-width: 0;\n  border-right-color: #999999;\n  border-right-color: rgba(0, 0, 0, 0.25); }\n  .popover.right > .arrow:after {\n    content: \" \";\n    left: 1px;\n    bottom: -10px;\n    border-left-width: 0;\n    border-right-color: #fff; }\n\n.popover.bottom > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-top-width: 0;\n  border-bottom-color: #999999;\n  border-bottom-color: rgba(0, 0, 0, 0.25);\n  top: -11px; }\n  .popover.bottom > .arrow:after {\n    content: \" \";\n    top: 1px;\n    margin-left: -10px;\n    border-top-width: 0;\n    border-bottom-color: #fff; }\n\n.popover.left > .arrow {\n  top: 50%;\n  right: -11px;\n  margin-top: -11px;\n  border-right-width: 0;\n  border-left-color: #999999;\n  border-left-color: rgba(0, 0, 0, 0.25); }\n  .popover.left > .arrow:after {\n    content: \" \";\n    right: 1px;\n    border-right-width: 0;\n    border-left-color: #fff;\n    bottom: -10px; }\n\n.carousel {\n  position: relative; }\n\n.carousel-inner {\n  position: relative;\n  overflow: hidden;\n  width: 100%; }\n  .carousel-inner > .item {\n    display: none;\n    position: relative;\n    -webkit-transition: 0.6s ease-in-out left;\n    transition: 0.6s ease-in-out left; }\n    .carousel-inner > .item > img,\n    .carousel-inner > .item > a > img {\n      display: block;\n      max-width: 100%;\n      height: auto;\n      line-height: 1; }\n    @media all and (transform-3d), (-webkit-transform-3d) {\n      .carousel-inner > .item {\n        -webkit-transition: -webkit-transform 0.6s ease-in-out;\n        transition: -webkit-transform 0.6s ease-in-out;\n        transition: transform 0.6s ease-in-out;\n        transition: transform 0.6s ease-in-out, -webkit-transform 0.6s ease-in-out;\n        -webkit-backface-visibility: hidden;\n        backface-visibility: hidden;\n        -webkit-perspective: 1000px;\n        perspective: 1000px; }\n        .carousel-inner > .item.next, .carousel-inner > .item.active.right {\n          -webkit-transform: translate3d(100%, 0, 0);\n          transform: translate3d(100%, 0, 0);\n          left: 0; }\n        .carousel-inner > .item.prev, .carousel-inner > .item.active.left {\n          -webkit-transform: translate3d(-100%, 0, 0);\n          transform: translate3d(-100%, 0, 0);\n          left: 0; }\n        .carousel-inner > .item.next.left, .carousel-inner > .item.prev.right, .carousel-inner > .item.active {\n          -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n          left: 0; } }\n  .carousel-inner > .active,\n  .carousel-inner > .next,\n  .carousel-inner > .prev {\n    display: block; }\n  .carousel-inner > .active {\n    left: 0; }\n  .carousel-inner > .next,\n  .carousel-inner > .prev {\n    position: absolute;\n    top: 0;\n    width: 100%; }\n  .carousel-inner > .next {\n    left: 100%; }\n  .carousel-inner > .prev {\n    left: -100%; }\n  .carousel-inner > .next.left,\n  .carousel-inner > .prev.right {\n    left: 0; }\n  .carousel-inner > .active.left {\n    left: -100%; }\n  .carousel-inner > .active.right {\n    left: 100%; }\n\n.carousel-control {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  width: 15%;\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n  font-size: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n  background-color: transparent; }\n  .carousel-control.left {\n    background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n    background-repeat: repeat-x;\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1); }\n  .carousel-control.right {\n    left: auto;\n    right: 0;\n    background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n    background-repeat: repeat-x;\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1); }\n  .carousel-control:hover, .carousel-control:focus {\n    outline: 0;\n    color: #fff;\n    text-decoration: none;\n    opacity: 0.9;\n    filter: alpha(opacity=90); }\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next,\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .glyphicon-chevron-right {\n    position: absolute;\n    top: 50%;\n    margin-top: -10px;\n    z-index: 5;\n    display: inline-block; }\n  .carousel-control .icon-prev,\n  .carousel-control .glyphicon-chevron-left {\n    left: 50%;\n    margin-left: -10px; }\n  .carousel-control .icon-next,\n  .carousel-control .glyphicon-chevron-right {\n    right: 50%;\n    margin-right: -10px; }\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next {\n    width: 20px;\n    height: 20px;\n    line-height: 1;\n    font-family: serif; }\n  .carousel-control .icon-prev:before {\n    content: '\\2039'; }\n  .carousel-control .icon-next:before {\n    content: '\\203A'; }\n\n.carousel-indicators {\n  position: absolute;\n  bottom: 10px;\n  left: 50%;\n  z-index: 15;\n  width: 60%;\n  margin-left: -30%;\n  padding-left: 0;\n  list-style: none;\n  text-align: center; }\n  .carousel-indicators li {\n    display: inline-block;\n    width: 10px;\n    height: 10px;\n    margin: 1px;\n    text-indent: -999px;\n    border: 1px solid #fff;\n    border-radius: 10px;\n    cursor: pointer;\n    background-color: #000 \\9;\n    background-color: transparent; }\n  .carousel-indicators .active {\n    margin: 0;\n    width: 12px;\n    height: 12px;\n    background-color: #fff; }\n\n.carousel-caption {\n  position: absolute;\n  left: 15%;\n  right: 15%;\n  bottom: 20px;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); }\n  .carousel-caption .btn {\n    text-shadow: none; }\n\n@media screen and (min-width: 768px) {\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next {\n    width: 30px;\n    height: 30px;\n    margin-top: -10px;\n    font-size: 30px; }\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .icon-prev {\n    margin-left: -10px; }\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-next {\n    margin-right: -10px; }\n  .carousel-caption {\n    left: 20%;\n    right: 20%;\n    padding-bottom: 30px; }\n  .carousel-indicators {\n    bottom: 20px; } }\n\n.clearfix:before, .clearfix:after {\n  content: \" \";\n  display: table; }\n\n.clearfix:after {\n  clear: both; }\n\n.center-block {\n  display: block;\n  margin-left: auto;\n  margin-right: auto; }\n\n.pull-right {\n  float: right !important; }\n\n.pull-left {\n  float: left !important; }\n\n.hide {\n  display: none !important; }\n\n.show {\n  display: block !important; }\n\n.invisible {\n  visibility: hidden; }\n\n.text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0; }\n\n.hidden {\n  display: none !important; }\n\n.affix {\n  position: fixed; }\n\n@-ms-viewport {\n  width: device-width; }\n\n.visible-xs {\n  display: none !important; }\n\n.visible-sm {\n  display: none !important; }\n\n.visible-md {\n  display: none !important; }\n\n.visible-lg {\n  display: none !important; }\n\n.visible-xs-block,\n.visible-xs-inline,\n.visible-xs-inline-block,\n.visible-sm-block,\n.visible-sm-inline,\n.visible-sm-inline-block,\n.visible-md-block,\n.visible-md-inline,\n.visible-md-inline-block,\n.visible-lg-block,\n.visible-lg-inline,\n.visible-lg-inline-block {\n  display: none !important; }\n\n@media (max-width: 767px) {\n  .visible-xs {\n    display: block !important; }\n  table.visible-xs {\n    display: table !important; }\n  tr.visible-xs {\n    display: table-row !important; }\n  th.visible-xs,\n  td.visible-xs {\n    display: table-cell !important; } }\n\n@media (max-width: 767px) {\n  .visible-xs-block {\n    display: block !important; } }\n\n@media (max-width: 767px) {\n  .visible-xs-inline {\n    display: inline !important; } }\n\n@media (max-width: 767px) {\n  .visible-xs-inline-block {\n    display: inline-block !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm {\n    display: block !important; }\n  table.visible-sm {\n    display: table !important; }\n  tr.visible-sm {\n    display: table-row !important; }\n  th.visible-sm,\n  td.visible-sm {\n    display: table-cell !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-block {\n    display: block !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline {\n    display: inline !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline-block {\n    display: inline-block !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md {\n    display: block !important; }\n  table.visible-md {\n    display: table !important; }\n  tr.visible-md {\n    display: table-row !important; }\n  th.visible-md,\n  td.visible-md {\n    display: table-cell !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-block {\n    display: block !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline {\n    display: inline !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline-block {\n    display: inline-block !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg {\n    display: block !important; }\n  table.visible-lg {\n    display: table !important; }\n  tr.visible-lg {\n    display: table-row !important; }\n  th.visible-lg,\n  td.visible-lg {\n    display: table-cell !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg-block {\n    display: block !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg-inline {\n    display: inline !important; } }\n\n@media (min-width: 1200px) {\n  .visible-lg-inline-block {\n    display: inline-block !important; } }\n\n@media (max-width: 767px) {\n  .hidden-xs {\n    display: none !important; } }\n\n@media (min-width: 768px) and (max-width: 991px) {\n  .hidden-sm {\n    display: none !important; } }\n\n@media (min-width: 992px) and (max-width: 1199px) {\n  .hidden-md {\n    display: none !important; } }\n\n@media (min-width: 1200px) {\n  .hidden-lg {\n    display: none !important; } }\n\n.visible-print {\n  display: none !important; }\n\n@media print {\n  .visible-print {\n    display: block !important; }\n  table.visible-print {\n    display: table !important; }\n  tr.visible-print {\n    display: table-row !important; }\n  th.visible-print,\n  td.visible-print {\n    display: table-cell !important; } }\n\n.visible-print-block {\n  display: none !important; }\n  @media print {\n    .visible-print-block {\n      display: block !important; } }\n\n.visible-print-inline {\n  display: none !important; }\n  @media print {\n    .visible-print-inline {\n      display: inline !important; } }\n\n.visible-print-inline-block {\n  display: none !important; }\n  @media print {\n    .visible-print-inline-block {\n      display: inline-block !important; } }\n\n@media print {\n  .hidden-print {\n    display: none !important; } }\n\n#cluster-info {\n  margin: 16px 5px 12px 20px; }\n  #cluster-info .info-top .title {\n    font-size: 10px;\n    font-weight: bold;\n    color: #333;\n    margin: 10px 0 20px 0;\n    border-bottom: 1px #e3e3e3 solid;\n    padding-bottom: 10px;\n    line-height: 1.1; }\n  #cluster-info .info-item {\n    margin-top: 18px; }\n    #cluster-info .info-item .item-title, #cluster-info .info-item .item-rank {\n      font-size: 12px;\n      font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n      color: #939294;\n      display: block; }\n    #cluster-info .info-item .item-info {\n      font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n      font-size: 13px;\n      color: #666;\n      display: block; }\n      #cluster-info .info-item .item-info .unit {\n        font-family: \"microsoft Yahei\";\n        color: #939294;\n        font-size: 13px;\n        margin-left: 5px; }\n  #cluster-info .hosts-info {\n    margin-top: 18px; }\n    #cluster-info .hosts-info span {\n      font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n      font-size: 13px;\n      color: #666; }\n    #cluster-info .hosts-info .unit {\n      font-family: \"microsoft Yahei\";\n      color: #939294;\n      font-size: 13px; }\n  #cluster-info .info-top {\n    position: relative; }\n    #cluster-info .info-top .hosts-state {\n      position: absolute;\n      right: 0;\n      background: url(" + __webpack_require__(62) + ") left center no-repeat;\n      padding-left: 16px;\n      font-size: 12px;\n      color: #e90b10;\n      cursor: pointer; }\n    #cluster-info .info-top .hosts-state.error {\n      color: #ff0000; }\n    #cluster-info .info-top .hosts-state.health {\n      color: #47ff8d; }\n    #cluster-info .info-top .history {\n      position: absolute;\n      height: 30px;\n      line-height: 30px;\n      padding: 0 12px;\n      color: #939294;\n      border: 1px solid #5d5d68;\n      border-radius: 3px;\n      right: 0;\n      cursor: pointer; }\n    #cluster-info .info-top .zabbix_config {\n      position: absolute;\n      height: 30px;\n      line-height: 30px;\n      padding: 0 12px;\n      border-radius: 3px;\n      right: 0;\n      cursor: pointer; }\n  #cluster-info .info-left {\n    float: left;\n    width: 30%; }\n    #cluster-info .info-left .hosts {\n      height: 102px;\n      padding: 10px 20px 20px 20px;\n      background: #ffffff;\n      margin: 00px 20px 20px 0;\n      box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.2); }\n    #cluster-info .info-left .status {\n      height: 180px;\n      padding: 10px 20px 20px 20px;\n      background: #fff;\n      margin: 0px 20px 20px 0;\n      border-radius: 4px; }\n      #cluster-info .info-left .status .status-info .info-item {\n        margin-top: 18px; }\n        #cluster-info .info-left .status .status-info .info-item .item-title {\n          font-size: 12px; }\n        #cluster-info .info-left .status .status-info .info-item .item-info {\n          font-size: 14px; }\n        #cluster-info .info-left .status .status-info .info-item .item-left {\n          float: left;\n          width: 65%; }\n        #cluster-info .info-left .status .status-info .info-item .item-right {\n          float: left; }\n      #cluster-info .info-left .status .status-info .info-item.first {\n        margin-top: 16px; }\n  #cluster-info .info-middle {\n    margin: 0 30%;\n    padding: 0 6px; }\n    #cluster-info .info-middle .cluster-capacity {\n      height: 302px;\n      background: #fff;\n      margin: 10px 20px 10px 0;\n      border-radius: 4px; }\n      #cluster-info .info-middle .cluster-capacity .info-item .item-info {\n        margin: 5px 0; }\n      #cluster-info .info-middle .cluster-capacity .info-item .item-left {\n        width: 30%;\n        text-align: center; }\n      #cluster-info .info-middle .cluster-capacity .info-item .item-right {\n        width: 30%;\n        float: right;\n        text-align: center; }\n      #cluster-info .info-middle .cluster-capacity .info-item .item-middle {\n        margin: 0 30%;\n        text-align: center; }\n    #cluster-info .info-middle .view-detail {\n      margin: 20px 5%; }\n      #cluster-info .info-middle .view-detail .usage-view {\n        position: relative; }\n        #cluster-info .info-middle .view-detail .usage-view .raw-view {\n          position: absolute;\n          left: 50%;\n          margin-left: -95px; }\n        #cluster-info .info-middle .view-detail .usage-view .data-view {\n          position: absolute;\n          margin-top: 24px;\n          left: 50%;\n          margin-left: -71px; }\n        #cluster-info .info-middle .view-detail .usage-view .view-percent {\n          position: absolute;\n          bottom: 0;\n          left: 50%;\n          color: #59585e;\n          margin-left: 8px; }\n      #cluster-info .info-middle .view-detail .info-items {\n        margin-top: 20px;\n        padding-left: 70px; }\n        #cluster-info .info-middle .view-detail .info-items .info-item .item-left {\n          float: none;\n          text-align: left;\n          width: auto; }\n        #cluster-info .info-middle .view-detail .info-items .info-item {\n          position: relative; }\n          #cluster-info .info-middle .view-detail .info-items .info-item .item-title {\n            text-align: left;\n            color: #3E8DDD; }\n          #cluster-info .info-middle .view-detail .info-items .info-item .item-tip {\n            position: absolute;\n            display: block;\n            border: 3px solid #3E8DDD;\n            border-radius: 50%;\n            width: 10px;\n            height: 10px;\n            left: -25px;\n            top: 3px; }\n        #cluster-info .info-middle .view-detail .info-items .for-raw-view .item-tip {\n          border-color: #E2231A; }\n        #cluster-info .info-middle .view-detail .info-items .for-raw-view .item-left .item-title {\n          color: #E2231A; }\n  #cluster-info .info-right {\n    float: right;\n    width: 30%; }\n    #cluster-info .info-right .band {\n      padding: 10px 20px 20px 20px;\n      background: #fff;\n      margin: 0px 20px 20px 0;\n      box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.2); }\n      #cluster-info .info-right .band .info-item {\n        margin-top: 0; }\n      #cluster-info .info-right .band .info-detail .item-info {\n        font-size: 14px; }\n    #cluster-info .info-right .io {\n      height: 180px;\n      padding: 10px 20px 20px 20px;\n      background: #fff;\n      margin: 10px 20px 10px 0;\n      border-radius: 4px; }\n      #cluster-info .info-right .io .info-item .item-info {\n        font-size: 14px; }\n  #cluster-info .info-right .band, #cluster-info .info-right .io, #cluster-info .info-left .hosts, #cluster-info .info-left .status {\n    padding: 18px 16px 16px 32px; }\n\n.topbar {\n  color: #9c9c9f;\n  height: 33px;\n  padding-right: 45px; }\n  .topbar h1.brand {\n    display: inline-block;\n    width: 240px;\n    margin: 0px 26px 0 0px;\n    line-height: 1; }\n    .topbar h1.brand a {\n      background: url(" + __webpack_require__(63) + ") left center no-repeat;\n      display: block;\n      text-indent: -9999px;\n      background-size: contain;\n      height: 33px; }\n  .topbar .switcher_bar {\n    display: inline-block;\n    vertical-align: top;\n    font-size: 0px; }\n    .topbar .switcher_bar .switch_url {\n      padding-left: 45px;\n      line-height: 33px;\n      text-decoration: none;\n      display: block;\n      color: #9c9c9f;\n      font-size: 12px;\n      font-family: microsoft Yahei; }\n      .topbar .switcher_bar .switch_url .username-bg {\n        width: 20px;\n        height: 20px;\n        background: url(" + __webpack_require__(64) + ") left center no-repeat;\n        display: block;\n        float: left;\n        margin: 6px 8px 0 0; }\n      .topbar .switcher_bar .switch_url .caret {\n        color: #fff;\n        margin-left: 8px; }\n    .topbar .switcher_bar .btn.btn-topnav {\n      padding: 8px 12px;\n      font-size: 12px;\n      line-height: 1.42857;\n      border-radius: 0;\n      color: #fff;\n      background-color: #eeeeee;\n      border-color: #eeeeee; }\n      .topbar .switcher_bar .btn.btn-topnav:focus, .topbar .switcher_bar .btn.btn-topnav.focus {\n        color: #fff;\n        background-color: #d5d5d5;\n        border-color: #afafaf; }\n      .topbar .switcher_bar .btn.btn-topnav:hover {\n        color: #fff;\n        background-color: #d5d5d5;\n        border-color: #d0d0d0; }\n      .topbar .switcher_bar .btn.btn-topnav:active, .topbar .switcher_bar .btn.btn-topnav.active,\n      .open > .topbar .switcher_bar .btn.btn-topnav.dropdown-toggle {\n        color: #fff;\n        background-color: #d5d5d5;\n        border-color: #d0d0d0; }\n        .topbar .switcher_bar .btn.btn-topnav:active:hover, .topbar .switcher_bar .btn.btn-topnav:active:focus, .topbar .switcher_bar .btn.btn-topnav:active.focus, .topbar .switcher_bar .btn.btn-topnav.active:hover, .topbar .switcher_bar .btn.btn-topnav.active:focus, .topbar .switcher_bar .btn.btn-topnav.active.focus,\n        .open > .topbar .switcher_bar .btn.btn-topnav.dropdown-toggle:hover,\n        .open > .topbar .switcher_bar .btn.btn-topnav.dropdown-toggle:focus,\n        .open > .topbar .switcher_bar .btn.btn-topnav.dropdown-toggle.focus {\n          color: #fff;\n          background-color: #c3c3c3;\n          border-color: #afafaf; }\n      .topbar .switcher_bar .btn.btn-topnav:active, .topbar .switcher_bar .btn.btn-topnav.active,\n      .open > .topbar .switcher_bar .btn.btn-topnav.dropdown-toggle {\n        background-image: none; }\n      .topbar .switcher_bar .btn.btn-topnav.disabled:hover, .topbar .switcher_bar .btn.btn-topnav.disabled:focus, .topbar .switcher_bar .btn.btn-topnav.disabled.focus, .topbar .switcher_bar .btn.btn-topnav[disabled]:hover, .topbar .switcher_bar .btn.btn-topnav[disabled]:focus, .topbar .switcher_bar .btn.btn-topnav[disabled].focus,\n      fieldset[disabled] .topbar .switcher_bar .btn.btn-topnav:hover,\n      fieldset[disabled] .topbar .switcher_bar .btn.btn-topnav:focus,\n      fieldset[disabled] .topbar .switcher_bar .btn.btn-topnav.focus {\n        background-color: #eeeeee;\n        border-color: #eeeeee; }\n      .topbar .switcher_bar .btn.btn-topnav .badge {\n        color: #eeeeee;\n        background-color: #fff; }\n      .topbar .switcher_bar .btn.btn-topnav:hover, .topbar .switcher_bar .btn.btn-topnav:active {\n        box-shadow: none; }\n    .topbar .switcher_bar .dropdown-menu.topbar-dropdown-menu {\n      border-radius: 0; }\n      .topbar .switcher_bar .dropdown-menu.topbar-dropdown-menu:before, .topbar .switcher_bar .dropdown-menu.topbar-dropdown-menu:after {\n        position: absolute;\n        display: inline-block;\n        content: ''; }\n      .topbar .switcher_bar .dropdown-menu.topbar-dropdown-menu:before {\n        top: -7px;\n        left: 9px;\n        border-right: 7px solid transparent;\n        border-bottom: 7px solid #ccc;\n        border-left: 7px solid transparent;\n        border-bottom-color: rgba(0, 0, 0, 0.2); }\n      .topbar .switcher_bar .dropdown-menu.topbar-dropdown-menu:after {\n        top: -6px;\n        left: 10px;\n        border-right: 6px solid transparent;\n        border-bottom: 6px solid #ffffff;\n        border-left: 6px solid transparent; }\n      .topbar .switcher_bar .dropdown-menu.topbar-dropdown-menu.pull-right:before {\n        left: auto;\n        right: 9px; }\n      .topbar .switcher_bar .dropdown-menu.topbar-dropdown-menu.pull-right:after {\n        left: auto;\n        right: 10px; }\n    .topbar .switcher_bar .context-selection .dropdown-menu {\n      padding: 0; }\n    .topbar .switcher_bar .context-selection .context-lists {\n      display: table;\n      width: 100%; }\n      .topbar .switcher_bar .context-selection .context-lists ul {\n        display: table-cell;\n        padding: .5em 0; }\n        .topbar .switcher_bar .context-selection .context-lists ul:not(:last-child) {\n          border-right: 1px solid #CCC; }\n    .topbar .switcher_bar .context-selection .footer {\n      padding: 0.4em 1em;\n      background: whitesmoke;\n      border-top: 1px solid #CCC;\n      text-align: right; }\n    .topbar .switcher_bar .context-selection .disabled {\n      cursor: not-allowed;\n      color: #CCC; }\n\n#cluster-storage {\n  margin-top: 1px;\n  /*padding-bottom: 12px;*/ }\n  #cluster-storage .dropdown-toggle {\n    background: none;\n    border: none;\n    color: #9c9c9f;\n    width: 100%;\n    height: inherit; }\n  #cluster-storage .caret {\n    border-top: 7px solid;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    margin-left: 5px;\n    color: #000; }\n  #cluster-storage div, #cluster-storage a {\n    font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif; }\n  #cluster-storage #switch-function {\n    height: 70px;\n    color: #9c9c9f;\n    border-top: solid 1px #353538;\n    padding: 6px 40px; }\n    #cluster-storage #switch-function .vmware-name {\n      font-size: 26px;\n      color: #e7e7e7; }\n    #cluster-storage #switch-function .vmware-state {\n      font-size: 12px; }\n      #cluster-storage #switch-function .vmware-state .cluster-position {\n        margin-left: 50px; }\n    #cluster-storage #switch-function .switcher-vmware {\n      float: left;\n      width: 600px; }\n    #cluster-storage #switch-function .switcher_tab {\n      float: right;\n      padding-top: 20px; }\n      #cluster-storage #switch-function .switcher_tab a {\n        font-size: 18px;\n        margin-left: 60px;\n        color: #9c9c9f;\n        -webkit-font-smoothing: antialiased;\n        -moz-osx-font-smoothing: grayscale; }\n      #cluster-storage #switch-function .switcher_tab a.hover {\n        color: #e7e7e7; }\n      #cluster-storage #switch-function .switcher_tab a.active {\n        color: #e7e7e7; }\n  #cluster-storage #ceph-version {\n    margin-left: 25px;\n    color: #000000;\n    font-size: 12px;\n    width: 180px;\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis; }\n  #cluster-storage .dropdown-menu > li {\n    cursor: pointer; }\n    #cluster-storage .dropdown-menu > li > label {\n      font-weight: bold; }\n    #cluster-storage .dropdown-menu > li > a {\n      padding: 3px 20px; }\n    #cluster-storage .dropdown-menu > li > p {\n      padding: 3px 20px;\n      color: #333;\n      line-height: 1.5; }\n  #cluster-storage .dropdown-menu > li:hover {\n    background: #eee; }\n  #cluster-storage .top-menu {\n    height: 60px;\n    border-bottom: 1px solid #e9ecf1;\n    margin: 0px 25px 0px 20px;\n    clear: both; }\n    #cluster-storage .top-menu .cluster-list {\n      width: 310px;\n      float: left;\n      display: inline-block;\n      height: 60px;\n      padding-left: 40px; }\n      #cluster-storage .top-menu .cluster-list .dropdown-menu > li {\n        padding: 0 20px; }\n      #cluster-storage .top-menu .cluster-list .cluster-select {\n        height: 38px; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .cluster-selected {\n          font-size: 24px;\n          margin-left: 15px;\n          font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n          color: #333;\n          width: 220px;\n          text-align: left; }\n          #cluster-storage .top-menu .cluster-list .cluster-select .cluster-selected .caret {\n            position: absolute;\n            right: 25px;\n            margin-top: 15px; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .cluster-state {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          border-radius: 7px;\n          position: absolute;\n          margin: 15px 10px 0 0px; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .health {\n          background-color: #47ff8d; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .error {\n          background-color: #e60012; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .cluster-position {\n          background: url(" + __webpack_require__(65) + ") left center no-repeat;\n          padding-left: 15px;\n          min-height: 15px; }\n    #cluster-storage .top-menu .angle-right {\n      display: inline-block;\n      border-right: 25px solid transparent; }\n    #cluster-storage .top-menu > .pull-right {\n      padding-right: 0px;\n      margin-right: -5px;\n      line-height: 60px;\n      color: #9c9c9f; }\n    #cluster-storage .top-menu .pull-right button {\n      font-size: 16px;\n      color: #000;\n      background-color: #e9ecf1; }\n  #cluster-storage #tab_views {\n    background-color: #ffffff;\n    width: 100%;\n    height: auto;\n    padding: 10px 20px 15px 20px;\n    color: #333;\n    overflow-y: visible; }\n    #cluster-storage #tab_views #group-host-tab > li {\n      margin-right: -5px; }\n      #cluster-storage #tab_views #group-host-tab > li > a {\n        width: 170px; }\n    #cluster-storage #tab_views > .myTab {\n      height: 40px; }\n    #cluster-storage #tab_views .myTab {\n      border: none;\n      padding: 0; }\n      #cluster-storage #tab_views .myTab > li {\n        padding: 0; }\n      #cluster-storage #tab_views .myTab > li > a {\n        line-height: 1;\n        background-color: #e9ecf1;\n        color: #333;\n        float: left;\n        display: block;\n        border-radius: 0;\n        text-align: center;\n        border: none;\n        margin: 0;\n        font-size: 20px;\n        height: 40px; }\n        #cluster-storage #tab_views .myTab > li > a span {\n          margin-right: 5px;\n          font-size: 14px; }\n        #cluster-storage #tab_views .myTab > li > a span.glyphicon-stop {\n          -webkit-transform: scale(0.6);\n                  transform: scale(0.6); }\n      #cluster-storage #tab_views .myTab li > span {\n        display: block;\n        float: left; }\n      #cluster-storage #tab_views .myTab li:first-child > a {\n        border-top-left-radius: 3px;\n        border-bottom-left-radius: 3px; }\n      #cluster-storage #tab_views .myTab li > a:hover, #cluster-storage #tab_views .myTab li.active > a {\n        background-color: #399BE1;\n        color: #fff; }\n      #cluster-storage #tab_views .myTab li span.angle-right {\n        border-bottom: 40px solid #e9ecf1;\n        border-right: 12px solid transparent; }\n      #cluster-storage #tab_views .myTab li span.angle-left {\n        border-top: 40px solid #e9ecf1;\n        border-left: 12px solid transparent; }\n      #cluster-storage #tab_views .myTab li.active span.angle-right, #cluster-storage #tab_views .myTab li:hover span.angle-right {\n        border-bottom: 40px solid #399BE1;\n        border-right: 12px solid transparent; }\n      #cluster-storage #tab_views .myTab li.active span.angle-left, #cluster-storage #tab_views .myTab li:hover span.angle-left {\n        border-top: 40px solid #399BE1;\n        border-left: 12px solid transparent;\n        border-bottom: none;\n        border-right: none; }\n    #cluster-storage #tab_views #tab_host {\n      clear: both; }\n      #cluster-storage #tab_views #tab_host .tab-views {\n        padding: 0;\n        margin: 0 -4px; }\n      #cluster-storage #tab_views #tab_host .host-contain {\n        margin-top: 5px;\n        padding: 0 4px;\n        border-radius: 3px; }\n        #cluster-storage #tab_views #tab_host .host-contain .server-outer-border {\n          border: solid 1px #e9ecf1;\n          border-radius: 2px; }\n          #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border {\n            border: solid 0px #333336;\n            border-radius: 2px;\n            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2); }\n            #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head {\n              height: 70px;\n              /*line-height: 70px;*/\n              padding: 10px 20px 20px 20px;\n              background: #fff;\n              margin: 10px 20px 10px 0;\n              border-radius: 4px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select {\n                color: #000;\n                background-color: #e9ecf1;\n                font-size: 12px;\n                padding: 0 25px 0 15px;\n                height: 35px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select span.caret {\n                  top: 15px;\n                  border-top-width: 5px;\n                  border-left-width: 4px;\n                  border-right-width: 4px;\n                  right: 5px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select .host-name-wrap {\n                  width: 80px;\n                  display: inline-block;\n                  background-color: #e9ecf1; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select .host-name-wrap > p {\n                    color: #000;\n                    overflow: hidden;\n                    white-space: nowrap;\n                    text-overflow: ellipsis;\n                    font-size: 14px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-ram {\n                float: right; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-down-state {\n                color: #f37c90;\n                font-size: 18px;\n                float: right; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block {\n                /*margin-left: 10px;*/\n                display: inline-block;\n                cursor: pointer; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block > div, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block > div, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block > div {\n                  font-size: 12px;\n                  display: inline-block;\n                  margin-left: 2px;\n                  margin-bottom: 3px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block .progress, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block .progress, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block .progress {\n                  width: 55px;\n                  height: 3px;\n                  display: inline-block;\n                  background-color: #232328; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block .progress .progress-bar, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block .progress .progress-bar, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block .progress .progress-bar {\n                    background-color: #4791ff; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-ram-pop {\n                width: 400px;\n                height: 200px;\n                border-radius: 2px;\n                position: absolute;\n                top: -32%;\n                left: 10%;\n                display: block;\n                z-index: 9999;\n                background-color: #fff;\n                padding: 10px; }\n            #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body {\n              clear: both;\n              height: 341px;\n              background-color: #fff; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li {\n                width: 33%;\n                height: 30px;\n                line-height: 30px;\n                overflow: hidden; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li > a {\n                font-size: 14px;\n                width: 100%; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li.active > a, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li:hover {\n                border-bottom: solid 1px #c0e0f3;\n                height: 30px;\n                border-radius: 0;\n                background-color: #399BE1;\n                border-radius: 0; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .server-service-box {\n                margin: 60px 10px 0 10px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .server-service-box .state {\n                  font-size: 14px;\n                  margin-bottom: 15px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option h3 {\n                font-size: 16px;\n                color: #676769; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation {\n                margin-top: 265px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .osd-remove-tip {\n                position: absolute;\n                bottom: 50px;\n                width: 85%;\n                font-size: 16px;\n                word-wrap: break-word; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .osd-remove-tip .osd-remove-selected {\n                  color: #e7e7e7;\n                  max-height: 170px;\n                  overflow-y: auto; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .network-adapter {\n                margin-top: 228px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .network-select, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation {\n                font-size: 14px;\n                border: solid 1px #ccc;\n                border-radius: 3px;\n                height: 45px;\n                line-height: 30px;\n                text-align: center;\n                cursor: pointer; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .network-select .caret, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation .caret {\n                  top: 12px;\n                  right: 5px;\n                  color: #e7e7e7; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation button span {\n                color: #676769; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation a {\n                color: #9c9c9f;\n                font-size: 14px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .color-bright {\n                color: #666; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list {\n                padding: 6px 0 0 0; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .network-graph {\n                  border: solid 1px #ccc;\n                  height: 282px;\n                  margin: 11px 15px 0 0; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box {\n                  /*width: 58px;*/\n                  height: 58px;\n                  margin-top: 15px;\n                  padding: 0; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .osd-action {\n                    font-size: 1em;\n                    text-align: center;\n                    width: 80%;\n                    height: 40%;\n                    border-radius: 3px;\n                    border: 1px solid #fff;\n                    position: absolute;\n                    top: 45%;\n                    right: -30%;\n                    display: block;\n                    -webkit-transition: all 0.4s ease-in-out;\n                    transition: all 0.4s ease-in-out;\n                    opacity: 0;\n                    cursor: pointer; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .osd-remove-selected {\n                    background-color: #1f486a;\n                    border: solid 2px #0187f1; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .osd-remove-selected .glyphicon-ok {\n                      color: #0187f1;\n                      padding: 10px 15px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .glyphicon-refresh {\n                    color: #0187f1;\n                    padding: 10px 15px;\n                    font-size: 16px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box:hover .osd-click-enable {\n                  background-color: #ffffff;\n                  border: solid 2px #e9ecf1; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box:hover .osd-action {\n                  right: 10%;\n                  opacity: 1; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd {\n                  width: 58px;\n                  height: 58px;\n                  background-color: #fff;\n                  border: solid 1px #e9ecf1;\n                  font-size: 12px;\n                  border-radius: 2px;\n                  position: relative;\n                  padding: 3px 0 0 6px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .osd-status {\n                    width: 5px;\n                    height: 5px;\n                    border-radius: 5px;\n                    display: inline-block;\n                    margin: 1px 0px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .osd-name {\n                    -webkit-transform: scale(0.75);\n                            transform: scale(0.75);\n                    display: inline-block;\n                    position: relative;\n                    z-index: 3; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .capacity-show {\n                    -webkit-transform: scale(0.85);\n                            transform: scale(0.85);\n                    position: relative;\n                    z-index: 3;\n                    color: #babdbd; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .capacity-show .capacity-show-total {\n                      margin-left: -5px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop {\n                    font-size: 1em;\n                    text-align: center;\n                    width: 337px;\n                    border-radius: 2px;\n                    border: 1px solid #fff;\n                    position: absolute;\n                    top: -240%;\n                    left: 58px;\n                    display: block;\n                    -webkit-transition: all 0.4s ease-in-out;\n                    transition: all 0.4s ease-in-out;\n                    cursor: pointer;\n                    z-index: 9999;\n                    background-color: #fff;\n                    padding: 20px 25px;\n                    text-align: left;\n                    color: #212023; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .disk-box {\n                      margin-top: 10px;\n                      line-height: 22px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box {\n                      margin: 20px 0 0 0; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box > div {\n                        height: 30px; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box span.title {\n                        font-size: 13px;\n                        float: left; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box .disk-drop-list {\n                        float: right;\n                        border: solid 1px #7d7d7d;\n                        border-radius: 3px;\n                        padding: 2px 6px; }\n                        #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box .disk-drop-list .caret {\n                          color: #a2a2a2; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box #iops-graph {\n                        border: solid 1px #a2a2a2;\n                        height: 135px;\n                        width: 100%;\n                        clear: both; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .osd-status {\n                      width: 10px;\n                      height: 10px;\n                      border-radius: 10px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .osd-name {\n                      font-size: 22px;\n                      -webkit-transform: none;\n                              transform: none;\n                      margin-left: 5px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop span.disk-title {\n                      font-size: 16px;\n                      margin-right: 10px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop span.disk-capacity {\n                      font-size: 12px;\n                      color: #c0c0c1; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .progress {\n                      -webkit-transform: none;\n                              transform: none;\n                      width: 100%;\n                      height: 4px;\n                      border-radius: 3px;\n                      margin: 0;\n                      background-color: #dfdfdf; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .progress .progress-bar {\n                        background-color: #4791ff; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .progress {\n                  -webkit-transform: rotate(-90deg);\n                          transform: rotate(-90deg);\n                  width: 57px;\n                  height: 55px;\n                  margin: -57px 0 0 1px;\n                  border-radius: 1px;\n                  background: none;\n                  position: relative; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-shadow {\n                  position: absolute;\n                  margin-top: -2px;\n                  margin-left: 2px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .capacity-used-normal {\n                  background: #2c2d2f;\n                  background: -webkit-linear-gradient(bottom, #2f70c5 0%, #47a9cf 100%);\n                  background: linear-gradient(to top, #2f70c5 0%, #47a9cf 100%);\n                  background: -webkit-linear-gradient(top, #2f70c5 0%, #47a9cf 100%);\n                  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#2f70c5', endColorstr='#47a9cf', GradientType=0); }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .capacity-used-warn {\n                  background: #2c2d2f;\n                  background: -webkit-linear-gradient(bottom, #652b76 0%, #d24c4b 100%);\n                  background: linear-gradient(to top, #652b76 0%, #d24c4b 100%);\n                  background: -webkit-linear-gradient(top, #652b76 0%, #d24c4b 100%);\n                  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#652b76', endColorstr='#d24c4b', GradientType=0); }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .up .osd-status {\n                  background-color: #4affe9; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .down .osd-status {\n                  background-color: #ff0000; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .deploy-circle-box {\n                text-align: center; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .deploy-circle-box .pie_progress__label {\n                  margin-top: -120px;\n                  margin-left: 10px;\n                  font-size: 18px;\n                  color: #e7e7e7; }\n  #cluster-storage #add-cluster-init {\n    background: url(" + __webpack_require__(66) + ") 0 no-repeat;\n    background-size: cover;\n    text-align: center;\n    color: #fff; }\n    #cluster-storage #add-cluster-init #create-one-box {\n      padding-top: 20%; }\n      #cluster-storage #add-cluster-init #create-one-box .logo {\n        width: 250px;\n        height: 50px;\n        display: inline-block;\n        background: url(" + __webpack_require__(63) + ") left center no-repeat; }\n      #cluster-storage #add-cluster-init #create-one-box #nocluster-tips {\n        font-size: 36px;\n        color: #bdbdc6;\n        margin: 10px 0 100px 0; }\n    #cluster-storage #add-cluster-init .add-cluster-btn {\n      width: 150px;\n      height: 45px;\n      cursor: pointer;\n      color: #fff;\n      font-size: 20px;\n      background-color: #0187f1; }\n    #cluster-storage #add-cluster-init #create-clusters-box {\n      margin-top: 10%;\n      width: 480px;\n      height: 320px;\n      font-size: 18px;\n      background-color: rgba(0, 0, 0, 0.5);\n      color: #fff;\n      display: inline-block;\n      border: solid 1px #3c3d41;\n      box-shadow: 0 0 60px #000; }\n      #cluster-storage #add-cluster-init #create-clusters-box h1 {\n        font-size: 26px;\n        margin: 40px 0; }\n      #cluster-storage #add-cluster-init #create-clusters-box p {\n        line-height: 25px;\n        margin: 30px 20px; }\n        #cluster-storage #add-cluster-init #create-clusters-box p label {\n          color: #bdbdc6; }\n      #cluster-storage #add-cluster-init #create-clusters-box input {\n        margin-left: 10px;\n        background: none;\n        border: none;\n        border-bottom: solid 2px #3c3d41; }\n  #cluster-storage .tab-content {\n    border: none;\n    border-bottom: 1px #ccc solid; }\n\n#cluster-storage .dropdown-menu .btn-managemeng {\n  text-align: center;\n  color: #888; }\n\n.cluster-info-warn-modal .modal-content {\n  width: 340px;\n  height: auto;\n  padding: 10px 20px; }\n\n.cluster-info-warn-modal .close {\n  margin-top: -20px; }\n\n.add-host-modal .modal-content, .add-cluster-modal .modal-content, .edit-cluster-modal .modal-content, .del-cluster-modal .modal-content, .cluster-manage-modal .modal-content {\n  width: 340px;\n  height: auto;\n  margin-left: 25%;\n  margin-top: 54px; }\n\n.add-host-modal .edit-cluster-modal .modal-content .AddHost > span, .add-cluster-modal .edit-cluster-modal .modal-content .AddHost > span, .edit-cluster-modal .edit-cluster-modal .modal-content .AddHost > span, .del-cluster-modal .edit-cluster-modal .modal-content .AddHost > span, .cluster-manage-modal .edit-cluster-modal .modal-content .AddHost > span {\n  float: right;\n  margin-top: -40px;\n  font-size: 20px;\n  color: #ccc; }\n\n.add-cluster-modal .modal-content .AddHost .ng-pristine .Add_h3 {\n  font-size: 22px; }\n\n.AddHost {\n  padding: 10px 30px;\n  font-family: \"microsoft Yahei\"; }\n  .AddHost > span {\n    padding-left: 20px;\n    display: inline-block;\n    margin-top: 15px; }\n  .AddHost input {\n    margin-top: 10px;\n    height: 35px;\n    width: 100%;\n    padding-left: 8px; }\n  .AddHost #add-host-box, .AddHost #add-cluster-box, .AddHost #edit-cluster-box {\n    margin: 40px 0 15px 0; }\n\n.add-osd-modal .modal-content {\n  padding: 10px 20px;\n  width: 490px; }\n  .add-osd-modal .modal-content h4 {\n    font-family: MyriadPro-Regular;\n    color: #99999A; }\n  .add-osd-modal .modal-content #disks_list {\n    margin-top: 40px;\n    font-size: 18px; }\n    .add-osd-modal .modal-content #disks_list h5 {\n      color: #99999A;\n      float: left; }\n    .add-osd-modal .modal-content #disks_list .sort-filter {\n      float: right;\n      margin-bottom: 10px; }\n      .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list > span {\n        color: #99999A; }\n      .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list > a {\n        border: 1px solid #CFCFD0;\n        border-radius: 2px;\n        color: #212023;\n        display: inline-block;\n        padding: 3px 10px; }\n        .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list > a .caret {\n          color: #979797; }\n      .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list .dropdown-menu li {\n        cursor: pointer; }\n        .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list .dropdown-menu li p {\n          padding: 0 10px; }\n    .add-osd-modal .modal-content #disks_list .avail-disks-box {\n      clear: both;\n      margin-top: 10px;\n      border: 1px solid #E7E7E7;\n      border-radius: 2px; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box div:nth-child(even) {\n        background: #F9F9F9; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box div:nth-child(old) {\n        background: none; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box div {\n        height: 45px;\n        line-height: 45px;\n        padding: 0 0 0 10px; }\n        .add-osd-modal .modal-content #disks_list .avail-disks-box div .glyphicon-ok-sign {\n          color: #B9B9B9;\n          line-height: 45px; }\n        .add-osd-modal .modal-content #disks_list .avail-disks-box div .ok-select {\n          color: #7ED321; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box > div > p {\n        float: none; }\n  .add-osd-modal .modal-content .footer-right-btn .btn {\n    margin: 0; }\n\n.add-osd-modal .close {\n  margin-top: -20px; }\n\n.footer-right-btn {\n  text-align: right;\n  margin: 30px 0; }\n  .footer-right-btn .btn {\n    width: 80px;\n    margin-rigth: 30px;\n    margin-top: 15px; }\n\n.edit-cluster-modal .modal-content .AddHost .btn-cancel {\n  margin-right: 10px;\n  border: 1px solid #ccc;\n  background: #fff;\n  color: #ccc; }\n\n.edit-cluster-modal .modal-content .AddHost .btn-cancel:hover {\n  background: #0187f1;\n  color: #fff; }\n\n.del-cluster-modal .modal-content .AddHost .btn-cancel {\n  margin-right: 10px;\n  border: 1px solid #ccc;\n  background: #fff;\n  color: #ccc; }\n\n.del-cluster-modal .modal-content .AddHost .btn-cancel:hover {\n  background: #0187f1;\n  color: #fff; }\n\n.cluster-manage-modal .modal-content .footer-right-btn .closes-btn {\n  margin-right: 33px;\n  border: 1px solid #ccc;\n  background: #fff;\n  color: #ccc; }\n\n.cluster-manage-modal .modal-content .footer-right-btn .closes-btn:hover {\n  background: #0187f1;\n  color: #fff; }\n\n.AddHost > p {\n  margin: 0 0 10px;\n  margin-left: 22px;\n  font-size: 16px;\n  margin-top: 23px; }\n\n.del-cluster-modal .modal-content .AddHost .sing_log {\n  margin-left: 45%;\n  margin-top: 10px; }\n\n.edit-cluster-modal .AddHost .close, .add-cluster-modal .AddHost .close {\n  margin-right: -20px; }\n\n.edit-cluster-modal .modal-content .AddHost .ng-pristine .addhost-text {\n  display: block;\n  width: 300%;\n  font-size: 22px;\n  margin-top: 12px; }\n\n.edit-cluster-modal .modal-content .AddHost .ng-pristine #edit-cluster-box .text-name {\n  font-size: 16px;\n  margin-top: 15px; }\n\n.cluster-manage-modal .modal-content {\n  width: 560px;\n  height: auto; }\n\n.del-cluster-modal .modal-content {\n  width: 450px;\n  height: auto; }\n\n.add-host-modal .close {\n  margin-right: -20px; }\n\n.add-host-modal .footer-right-btn {\n  margin: 0; }\n  .add-host-modal .footer-right-btn input {\n    margin: 12px 0 20px 0; }\n\n.delete-osd-modal .modal-content {\n  width: 422px;\n  margin-left: 25%;\n  padding: 30px 30px 55px 30px;\n  border-radius: 2px; }\n  .delete-osd-modal .modal-content #delete_osd_box {\n    color: #999;\n    font-size: 16px; }\n    .delete-osd-modal .modal-content #delete_osd_box h3 {\n      color: #212023;\n      text-align: center;\n      margin: 0;\n      margin: 0 0 15px 0; }\n    .delete-osd-modal .modal-content #delete_osd_box .delete-osd-selected {\n      color: #212023; }\n    .delete-osd-modal .modal-content #delete_osd_box .yes {\n      width: 70px;\n      background-color: #0187f1; }\n    .delete-osd-modal .modal-content #delete_osd_box .cancel {\n      width: 70px;\n      color: #999;\n      border: solid 1px #99999a;\n      background-color: #f2f2f2;\n      margin-left: 15px; }\n\n.query-iohistory-modal .modal-dialog .modal-content, .network-scale-modal .modal-dialog .modal-content {\n  padding: 25px 30px;\n  width: 730px; }\n\n.query-iohistory-modal .modal-dialog #iohistory_line, .query-iohistory-modal .modal-dialog #history_chart, .network-scale-modal .modal-dialog #iohistory_line, .network-scale-modal .modal-dialog #history_chart {\n  height: 400px;\n  width: 650px;\n  /*margin-top: 40px;*/ }\n\n.query-iohistory-modal .modal-dialog .time_group, .network-scale-modal .modal-dialog .time_group {\n  position: absolute;\n  top: 25px;\n  right: 30px;\n  z-index: 9999;\n  text-align: right; }\n  .query-iohistory-modal .modal-dialog .time_group .title, .network-scale-modal .modal-dialog .time_group .title {\n    display: block;\n    font-size: 12px;\n    font-weight: bold; }\n  .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:focus, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:active:focus, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn.active:focus, .network-scale-modal .modal-dialog .time_group .btn-group .btn:focus, .network-scale-modal .modal-dialog .time_group .btn-group .btn:active:focus, .network-scale-modal .modal-dialog .time_group .btn-group .btn.active:focus {\n    outline: 0;\n    background-image: none;\n    box-shadow: none; }\n    .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:focus .dropdown-toggle, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:active:focus .dropdown-toggle, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn.active:focus .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group .btn:focus .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group .btn:active:focus .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group .btn.active:focus .dropdown-toggle {\n      box-shadow: none;\n      background: none; }\n  .query-iohistory-modal .modal-dialog .time_group .btn-group a, .network-scale-modal .modal-dialog .time_group .btn-group a {\n    color: #333;\n    padding-right: 0; }\n  .query-iohistory-modal .modal-dialog .time_group .btn-group.open .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group.open .dropdown-toggle {\n    box-shadow: none; }\n\n.cluster-manage-modal a {\n  color: #363f44; }\n\n.cluster-manage-modal .modal-header {\n  border: none;\n  margin-bottom: 0; }\n  .cluster-manage-modal .modal-header h3 {\n    margin-top: 10px; }\n\n.cluster-manage-modal .modal-body .add-new-cluster {\n  border: none;\n  margin-top: -20px;\n  background: none;\n  color: #000; }\n\n.cluster-manage-modal .table-bordered {\n  border: none; }\n\n.cluster-manage-modal .table > thead > tr > th {\n  border: none; }\n\n.cluster-manage-modal tbody {\n  padding: 0 30px; }\n  .cluster-manage-modal tbody tr td {\n    border: none;\n    vertical-align: middle; }\n    .cluster-manage-modal tbody tr td label, .cluster-manage-modal tbody tr td span {\n      display: block;\n      color: #888; }\n    .cluster-manage-modal tbody tr td label {\n      font-weight: bold;\n      font-size: 18px;\n      color: #000; }\n    .cluster-manage-modal tbody tr td span {\n      padding: 0 16px;\n      line-height: 1.5;\n      background: url(" + __webpack_require__(65) + ") left center no-repeat; }\n    .cluster-manage-modal tbody tr td a.map-trash, .cluster-manage-modal tbody tr td a.map-edit {\n      font-size: 20px;\n      color: #00b3ee; }\n\n.cluster-manage-modal .btn-default {\n  position: absolute;\n  right: 50px;\n  top: -16px; }\n\n.modal-body .max-num {\n  font-weight: bold; }\n\n.modal-body .mon-mds-setting {\n  /*margin-right: 30px;\n    /!*font-size: 18px;*!/\n    .deploy-mon-mds {\n      margin-top: 20px;\n      text-align: right;\n    }\n    .removeFirst {\n      color: #212023;\n    }\n    .maxTips {\n      color: #99999A;\n    }*/ }\n  .modal-body .mon-mds-setting .hostSettingList {\n    /*max-height: 180px;\n      overflow-y: auto;*/\n    overflow: hidden;\n    margin-top: 10px;\n    border: 1px solid #E7E7E7;\n    border-radius: 2px; }\n    .modal-body .mon-mds-setting .hostSettingList .col-xs-12 {\n      padding: 0; }\n    .modal-body .mon-mds-setting .hostSettingList > div {\n      height: 45px;\n      line-height: 45px; }\n    .modal-body .mon-mds-setting .hostSettingList > div:nth-child(even) {\n      background: #F9F9F9; }\n    .modal-body .mon-mds-setting .hostSettingList > div:nth-child(old) {\n      background: none; }\n\n#tab_group {\n  margin-top: 5px; }\n\n.show {\n  display: block !important; }\n\n.hide {\n  display: none !important; }\n\n.panel-group .panel-heading + .panel-collapse > .list-group, .panel-group .panel-heading + .panel-collapse > .panel-body {\n  border: none;\n  color: #fff; }\n\n#cluster-storage #accordion .panel-default {\n  border: 1px solid #3c3c46 !important;\n  background: #2a2a2d !important; }\n\n#tab_group #accordion .panel-default .panel-heading {\n  background: #3c3c46 !important;\n  color: #fff;\n  height: 40px; }\n\n#tab_group #accordion .panel-default .panel-heading .group-title {\n  margin-left: 25px;\n  font-size: 16px; }\n\n#tab_group #accordion .panel-default .panel-heading .group-title input {\n  background: none;\n  border: none;\n  outline: none; }\n\n#tab_group #accordion .panel-default .panel-heading .group-data {\n  margin-right: 45px;\n  font-size: 16px; }\n\n#tab_group #accordion .panel-default .panel-heading .caret {\n  margin-left: 0;\n  margin-top: 8px;\n  border-top: 8px solid;\n  border-right: 8px solid transparent;\n  border-left: 8px solid transparent; }\n\n#tab_group #accordion .panel-default .panel-heading .remove {\n  color: #c1c1c3;\n  cursor: pointer;\n  border: 0; }\n\n#tab_group #accordion .panel-default .panel-heading .remove .close {\n  font-size: 20px;\n  color: #fff;\n  opacity: 0; }\n\n#tab_group #accordion .panel-default .panel-heading:hover .remove .close {\n  opacity: 1; }\n\n#tab_group .groupBox .groupList-data .groupUl {\n  text-align: left;\n  background: none;\n  padding: 0; }\n\n.groupBox .groupList-data .groupUl .groupUl-li {\n  display: inline-block;\n  color: #adadad;\n  width: 135px;\n  margin: 0 15px 15px 25px; }\n\n.groupBox .groupList-data .groupUl-li .inner1, .groupBox .groupList-data .groupUl .groupUl-li .inner2 {\n  width: 130px;\n  height: 60px;\n  border: 3px solid #45474a;\n  box-sizing: border-box;\n  background: #2c2d2f; }\n\n.groupList-data .groupUl .groupUl-li .inner2 {\n  margin: 0 0 0 -6px; }\n\n.groupUl .groupUl-li .inner2 p span.osd-status {\n  display: inline-block;\n  margin: 3px 6px;\n  width: 5px;\n  height: 5px;\n  border-radius: 5px;\n  background: #fff; }\n\n.groupUl .groupUl-li .inner2 p span.host-Value {\n  display: inline-block;\n  font-size: 14px;\n  color: #bcbcbc;\n  margin-top: 5px; }\n\n.groupUl .groupUl-li .inner2 p span.osd-value {\n  font-size: 12px;\n  color: #bcbcbc;\n  margin-left: 25px; }\n\n.dragbox {\n  width: 40%;\n  margin: 0 auto;\n  border-radius: 10px;\n  text-align: center;\n  border: 2px solid #3c3c46;\n  background: #212023;\n  color: #fff;\n  margin-bottom: 10px; }\n\n.dragbox > span {\n  font-size: 30px;\n  line-height: 100px; }\n\n#tab_pool, #tab_iSCSI {\n  clear: both;\n  margin: 0 0 0 -10px;\n  padding: 0 0 0 10px; }\n\n#tab_pool .pool-top,\n#tab_iSCSI .iSCSI-top {\n  background: #e9ecf1;\n  width: 100%;\n  margin: 5px 0;\n  border: 1px solid #e9ecf1; }\n\n#tab_iSCSI .iSCSI-top {\n  height: 50px; }\n\n/*pool-top-bar iSCSI-top-bar start*/\n#tab_pool .pool-top .pool-top-bar,\n#tab_iSCSI .iSCSI-top .iSCSI-top-bar {\n  width: 100%;\n  margin-bottom: 2px; }\n\n#tab_pool .pool-top .pool-top-bar .pool-select,\n#tab_iSCSI .iSCSI-top .iSCSI-top-bar .iSCSI-select {\n  width: 160px;\n  height: 30px;\n  border: 1px solid #58586d;\n  border-radius: 2px;\n  float: left;\n  margin: 10px 25px;\n  background: none; }\n\n.pool-top .pool-top-bar .pool-select > button,\n.iSCSI-top .iSCSI-top-bar .iSCSI-select > button {\n  margin: 0;\n  background: none;\n  border: none;\n  width: 100%;\n  text-align: left;\n  color: #333; }\n  .pool-top .pool-top-bar .pool-select > button span.caret,\n  .iSCSI-top .iSCSI-top-bar .iSCSI-select > button span.caret {\n    top: 9px; }\n\n.pool-top .pool-top-bar .pool-select .caret,\n.iSCSI-top .iSCSI-top-bar .iSCSI-select .caret {\n  float: right;\n  margin-top: 5px; }\n\n.pool-top .pool-top-bar .poolList {\n  padding: 0; }\n\n.pool-top .pool-top-bar .poolList li {\n  padding: 10px 0 10px 10px;\n  cursor: pointer;\n  color: #000; }\n\n.pool-top .pool-top-bar .poolList li:hover,\n.pool-top .pool-top-bar .poolList li:focus {\n  background: #9C9C9F;\n  color: #fff; }\n\n.pool-top .pool-top-bar button,\n.iSCSI-top .iSCSI-top-bar button {\n  width: 174px;\n  height: 30px;\n  border: 1px solid #58586d;\n  border-radius: 2px;\n  float: left;\n  margin: 10px 0;\n  background: none; }\n\n.pool-top .pool-top-bar .pool_top_config_add,\n.iSCSI-top .iSCSI-top-bar .iSCSI_top_target_add {\n  float: right;\n  height: auto; }\n\n.pool-top-bar .pool_top_config_add button.config,\n.iSCSI-top .iSCSI-top-bar .iSCSI_top_target_add button.target {\n  margin-right: 12px; }\n\n.pool-top-bar .pool_top_config_add button.addPool,\n.iSCSI-top .iSCSI-top-bar .iSCSI_top_target_add button.addTarget {\n  margin-right: 30px; }\n\n/*pool-top-number start*/\n#tab_pool .pool-top .pool-top-number {\n  width: 100%;\n  height: 58px;\n  /*border-top: 1px solid #1a191c;*/\n  clear: both; }\n\n#tab_pool .pool-top .pool-top-number p {\n  margin: 3px 0 10px; }\n\n#tab_pool .pool-top .pool-top-number h4 {\n  color: #333; }\n\n#tab_pool .pool-top .pool-top-number .pool-top-number-left {\n  width: 49%;\n  height: 100%;\n  margin-left: 10px;\n  float: left; }\n\n#tab_pool .pool-top .pool-top-number .pool-top-number-right {\n  width: 50%;\n  height: 100%;\n  float: right;\n  text-align: center; }\n\n#tab_pool .pool-body,\n#tab_iSCSI .iSCSI-body {\n  border: solid 1px #e9ecf1;\n  border-radius: 2px;\n  position: relative;\n  background: #29292c;\n  clear: both; }\n\n#tab_pool .pool-body .pool_rbdHead,\n#tab_iSCSI .iSCSI-body .iSCSI_volumeHead {\n  width: 100%;\n  height: 40px;\n  border-bottom: 1px solid #e9ecf1;\n  background-color: #fff; }\n\n#tab_pool .pool-body .pool_rbdHead .pool_rbd,\n#tab_iSCSI .iSCSI-body .iSCSI_volumeHead .iSCSI_volume {\n  width: 130px;\n  height: 38px;\n  background: #e9ecf1;\n  color: #000;\n  font-size: 20px;\n  line-height: 38px;\n  text-align: center; }\n\n#tab_pool .pool-body .pool_rbdHead .pool_rbd:after,\n#tab_iSCSI .iSCSI-body .iSCSI_volumeHead .iSCSI_volume:after {\n  content: \"\";\n  border-bottom: 38px solid #e9ecf1;\n  border-right: 12px solid transparent;\n  position: absolute;\n  left: 130px;\n  top: 0;\n  z-index: 1; }\n\n#tab_pool .pool-body .pool_rbdHead .pool_add_rbd {\n  float: right;\n  margin: 0 27px; }\n\n#tab_iSCSI .iSCSI-body .iSCSI_volumeHead .iSCSI_add_volume {\n  float: right;\n  margin: 0 15px; }\n\n#tab_pool .pool-body .pool_rbdHead .pool_add_rbd .add_rbd,\n#tab_iSCSI .iSCSI-body .iSCSI_volumeHead .add_volume {\n  width: 100%;\n  height: 40px;\n  border: none;\n  border-left: solid 1px #e9ecf1;\n  background: none;\n  color: #000;\n  background-color: #e9ecf1;\n  font-size: 12px;\n  line-height: 38px;\n  text-align: center; }\n\n.pool-body .pool_rbd_list,\n.iSCSI-body .iSCSI_volume_list {\n  border-top: 1px solid #e9ecf1;\n  background-color: #fff;\n  text-align: center;\n  font-size: 14px;\n  box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.2); }\n\n.pool-body .pool_rbd_list .table,\n.iSCSI-body .iSCSI_volume_list .table {\n  border: none;\n  background: none; }\n\n.pool-body .pool_rbd_list .table tr td,\n.iSCSI-body .iSCSI_volume_list .table tr td {\n  border: 1px solid #e9ecf1;\n  height: 40px; }\n\n.iSCSI-body .iSCSI_volume_list .table .volume-status {\n  display: inline-block;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: #47ff8d; }\n\n.pool-body .pool_rbd_list .table em,\n.iSCSI-body .iSCSI_volume_list .table em {\n  color: #6596c3;\n  font-size: 16px; }\n\n.pool-body .pool_rbd_list .table button,\n.iSCSI-body .iSCSI_volume_list .table button {\n  background: #e9ecf1;\n  border: none;\n  color: #000; }\n\n.pool-body .pool_rbd_list .table button:focus,\n.iSCSI-body .iSCSI_volume_list .table button:focus {\n  border: none; }\n\n#tab_ceph {\n  clear: both;\n  margin: 0 0 0 -5px;\n  padding: 0 0 0 -5px; }\n\n.ceph-top {\n  background: #383740;\n  width: 100%;\n  height: 45px;\n  margin: 5px 0;\n  font-size: 16px;\n  border: 1px solid #1a191c; }\n\n#tab_ceph .ceph-top .ceph-top-bar .nav-tabs {\n  border: none;\n  margin-left: 20px; }\n\n#tab_ceph .ceph-top .nav-tabs > li + li:before {\n  content: '';\n  display: inline-block;\n  position: absolute;\n  top: 18px;\n  left: -5px;\n  padding: 0;\n  color: #699ccc;\n  width: 8px;\n  height: 8px;\n  border-right: 1px solid #699ccc;\n  border-bottom: 1px solid #699ccc;\n  -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg); }\n\n#tab_ceph .ceph-top .ceph-top-bar .nav-tabs > li > a {\n  color: #699ccc;\n  font-size: 16px;\n  margin-right: 2px;\n  border: 1px solid transparent;\n  border-radius: 0; }\n\n#tab_ceph .ceph-top .ceph-top-bar .nav-tabs > li > a:hover,\n#tab_ceph .ceph-top .ceph-top-bar .nav-tabs > li.active > a,\n#tab_ceph .ceph-top .ceph-top-bar .nav-tabs > li.active > a:hover,\n#tab_ceph .ceph-top .ceph-top-bar .nav-tabs > li.active > a:focus {\n  color: #fff;\n  font-size: 16px;\n  background: none;\n  border: none;\n  cursor: pointer; }\n\n#tab_ceph .ceph-top .ceph-top-bar .pull-right {\n  margin-right: 50px; }\n\n#tab_ceph .ceph-top .ceph-top-bar button {\n  width: 160px;\n  height: 30px;\n  border: 1px solid #58586d;\n  border-radius: 2px;\n  float: left;\n  margin: 7px 0 0 15px;\n  background: none; }\n\n#tab_ceph .ceph-body {\n  border: solid 1px #1a191c;\n  border-radius: 2px;\n  position: relative;\n  background: #29292c;\n  clear: both; }\n\n#tab_ceph .ceph-body .ceph-body-left {\n  background: #36353d;\n  height: 350px;\n  line-height: 350px;\n  font-size: 20px;\n  vertical-align: middle;\n  text-align: center;\n  color: #699ccc; }\n\n.folderList-box {\n  width: 220px;\n  height: 120px;\n  border-radius: 3px;\n  background: #36353d;\n  margin: 15px 8px;\n  float: left; }\n\n#tab_ceph .ceph-body .folderList .folderList-top {\n  width: 100%;\n  height: 80px; }\n\n#tab_ceph .ceph-body .folderList .folderList-top .pull-left {\n  margin: 15px 15px 0; }\n\n.folderList-box .pull-left span {\n  color: #699ccc; }\n\n.folderList .folderList-top .pull-left h5 {\n  font-size: 14px;\n  color: #fff; }\n\n#tab_ceph .ceph-body .folderList .folderList-top .pull-right {\n  margin: 28px 15px; }\n\n#tab_ceph .ceph-body .folderList .folderList-top .pull-right button {\n  width: 20px;\n  height: 20px;\n  border: none;\n  background: none;\n  font-size: 16px;\n  color: #699ccc; }\n\n.folderList .folderList-bottom {\n  border-top: 1px solid #58586d; }\n\n.folderList .folderList-bottom button {\n  width: 110px;\n  height: 38px;\n  border: none;\n  float: left;\n  background: none;\n  font-size: 22px;\n  color: #699ccc; }\n\n.folderList .folderList-bottom button:first-child {\n  border-right: 1px solid #58586d; }\n\n.share-with {\n  width: 220px;\n  height: 260px;\n  border: 1px solid #58586d;\n  background: #42424d;\n  float: left;\n  margin: 15px; }\n\n.share-with .share-with-list {\n  margin: 15px; }\n\n.share-with .share-with-list-box {\n  float: left;\n  width: 100%;\n  margin: 0 0 15px 0;\n  clear: both; }\n\n.share-with .share-with-list .share-with-list-box .pull-right span {\n  color: #fff; }\n\n.share-with .share-with-list .share-with-list-box .dropdown {\n  margin-right: -12px; }\n\n.share-with .share-with-list-box .pull-left span {\n  color: #699ccc; }\n\n.share-with .share-with-list-box h5 {\n  font-size: 16px;\n  color: #fff; }\n\n.share-with .share-with-list-box button {\n  width: 85px;\n  height: 30px;\n  border: 1px solid #58586d;\n  background: none;\n  font-size: 12px;\n  color: #a3a3a7; }\n\n.share-with .share-with-list-box button:hover {\n  color: #fff; }\n\n.share-with .share-with-list-box .addUsrList {\n  min-width: 85px;\n  text-align: center;\n  background: #fff;\n  color: #0a4b3e; }\n\n.share-with-list-box .addUsrList li {\n  margin-bottom: 5px;\n  cursor: pointer; }\n\n.share-with-list-box .share-with-status {\n  display: inline-block;\n  width: 28px;\n  height: 28px;\n  border-radius: 3px;\n  border: 1px solid;\n  text-align: center;\n  margin-left: 5px;\n  line-height: 28px; }\n\n.share-with .share-with-list-box > button {\n  width: 185px;\n  height: 35px;\n  border: 1px solid #58586d;\n  background: none;\n  font-size: 12px;\n  color: #fff; }\n\ninput::-webkit-outer-spin-button,\ninput::-webkit-inner-spin-button {\n  -webkit-appearance: none; }\n\ninput[type=\"number\"] {\n  -moz-appearance: textfield; }\n\n/*public-modal style start*/\n.public-modal .modal-content {\n  background: #FFFFFF;\n  border: 1px solid rgba(0, 0, 0, 0.24);\n  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);\n  border-radius: 2px;\n  color: #212023;\n  width: 560px;\n  margin: 0 auto; }\n\n.public-modal .modal-header {\n  padding: 0;\n  border: 0; }\n\n.public-modal .modal-header h4 {\n  font-size: 24px;\n  color: #212023;\n  margin-left: 30px; }\n\n.public-modal .modal-header h4 span {\n  display: block;\n  margin-left: 30px;\n  font-size: 12px;\n  color: #212023; }\n\n.public-modal .modal-content button {\n  background: #fff;\n  float: right;\n  border: 1px solid #0187F1;\n  border-radius: 2px;\n  font-size: 18px;\n  color: #0187F1;\n  width: 130px;\n  line-height: 40px; }\n\n.public-modal .modal-content button:hover,\n.public-modal .modal-content button:focus {\n  outline: none;\n  color: #fff;\n  box-shadow: none; }\n\n.public-modal .modal-content .modal-header .close {\n  color: #212023;\n  border: none;\n  opacity: 1;\n  font-size: 28px;\n  margin-right: 22px;\n  width: 28px;\n  height: 28px;\n  line-height: 28px; }\n\n.public-modal .public-body {\n  padding: 0;\n  height: 438px; }\n\n/*body-left style start*/\n.public-modal .public-body .body-left {\n  float: left;\n  padding: 0;\n  width: 178px;\n  height: 400px;\n  border-right: 3px solid #D5D5D5; }\n\n.public-body .body-left-nav, .modal-left-nav {\n  position: relative;\n  text-align: left;\n  padding: 0;\n  margin-left: 35px; }\n\n.public-modal .public-body .public-config-nav {\n  margin-left: 0; }\n\n.public-body .body-left-nav li, .modal-left-nav li {\n  cursor: pointer;\n  font-size: 20px;\n  color: #212023;\n  line-height: 20px;\n  list-style: none; }\n\n.public-modal .public-body .public-config-nav li {\n  padding-left: 30px;\n  line-height: 60px;\n  height: 60px; }\n\n.public-modal .public-body .public-config-nav .li-border, .modal-left-nav .li-border {\n  border-left: 3px solid #0187F1;\n  color: #0187F1;\n  padding-left: 30px;\n  line-height: 60px;\n  height: 60px; }\n\n.public-body .body-left-nav li .li-circle {\n  display: inline-block;\n  background: #ECECEC;\n  color: #212023;\n  line-height: 20px;\n  width: 12px;\n  height: 12px;\n  border-radius: 100%;\n  border: 3px solid #CBCBCB;\n  margin-right: 18px; }\n\n.public-body .body-left-nav li .li-inline {\n  height: 47px;\n  border-left: 2px dashed #979797;\n  margin: 0 0 -10px 5px; }\n\n.public-body .body-left-nav .li-click {\n  color: #0187F1; }\n\n.public-body .body-left-nav .li-click > span {\n  border: 3px solid #0187F1;\n  background: #fff; }\n\n/* body-right style start*/\n.public-body .body-right {\n  width: 380px;\n  float: right; }\n\n.public-body .body-right .body-content {\n  position: relative;\n  overflow: hidden;\n  height: 291px;\n  margin: 0 35px 0 30px; }\n\n.public-body .body-right .body-content .content-box {\n  height: 291px; }\n\n.public-body .body-content .list-group {\n  height: 35px;\n  line-height: 35px;\n  margin: 0 0 22px 0; }\n\n.public-body .body-content .form-horizontal .form-group {\n  margin-left: 0;\n  margin-right: 0; }\n\n.public-body .body-content .list-group .capacity-select {\n  width: 135px;\n  height: 32px;\n  margin-right: 45px;\n  float: right; }\n\n.public-body .body-content .zabbix_server .list-group .labfont {\n  width: 100%;\n  font-size: 14px; }\n\n.public-body .body-content label {\n  font-weight: 500;\n  display: inline-block;\n  font-size: 18px;\n  color: #212023; }\n\n.public-body .body-content input {\n  display: inline-block;\n  float: right;\n  padding-left: 5px;\n  width: 185px;\n  height: 35px;\n  border: 1px solid #CFCFD0;\n  border-radius: 2px; }\n\n.public-body .body-content .zabbix_server .list-group .labinput {\n  width: 100%;\n  height: 25px;\n  line-height: 25px;\n  margin-bottom: 5px; }\n\n.public-body .body-content input:focus {\n  outline: none;\n  border-color: #0187F1;\n  box-shadow: none; }\n\n.public-modal .public-body .body-content .content-box .list-group span .add-profiles {\n  width: 150px; }\n\n.public-body .body-content .has-feedback .form-control {\n  padding-right: 0; }\n\n.public-body .body-content .has-feedback .form-control-feedback {\n  top: 0;\n  right: 0; }\n\n.public-body .body-content .slidebox {\n  position: relative;\n  width: 40px;\n  height: 20px;\n  display: inline-block;\n  float: right;\n  margin: 7px 5px 0 0; }\n\n.public-body .body-content .slidebox input {\n  visibility: hidden; }\n\n.public-body .body-content .slidebox label {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 40px;\n  height: 20px;\n  box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.3);\n  background: #CFCFD0;\n  border: 1px solid #99999A;\n  border-radius: 2px;\n  cursor: pointer;\n  -webkit-transition: all 0.2s ease;\n  transition: all 0.2s ease; }\n\n.public-body .body-content .slidebox label:after {\n  position: absolute;\n  content: \"\";\n  top: 2px;\n  left: 0;\n  width: 20px;\n  height: 14px;\n  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);\n  -webkit-transition: all .15s ease;\n  transition: all .15s ease;\n  background: #FFFFFF;\n  border-radius: 3px; }\n\n.public-body .body-content .slidebox input[type=checkbox]:checked + label {\n  background: #0187F1;\n  border: 1px solid #0078D6;\n  border-radius: 2px; }\n\n.public-body .body-content .slidebox input[type=checkbox]:checked + label:after {\n  left: 16px; }\n\n.public-body .body-content .content-box .dup-box {\n  margin-top: 58px; }\n\n.public-body .body-content .content-box .dup-box .slidebox input[type=checkbox]:checked + label:after,\n.public-body .body-content .content-box .compression .slidebox input[type=checkbox]:checked + label:after {\n  left: 16px; }\n\n.public-body .body-content .content-box .read-box {\n  height: auto; }\n\n.public-body .body-content .content-box .read-box > span {\n  display: inline-block;\n  width: 100%;\n  line-height: 20px;\n  font-size: 18px;\n  color: #212023; }\n\n.body-content .content-box .read-box p {\n  font-size: 14px;\n  line-height: 60px;\n  color: #212023;\n  margin: 0 0 -10px; }\n\n.body-content .content-box .read-box p input {\n  width: 80px;\n  height: 35px;\n  display: inline-block;\n  margin: 13px 10px 0 0;\n  float: left;\n  font-size: 14px;\n  color: #212023;\n  padding-left: 10px; }\n\n.body-content .content-box .read-box p .read-select {\n  width: 80px;\n  height: 34px;\n  float: left;\n  padding-left: 10px;\n  margin: 13px 10px 0 0;\n  background: #FFFFFF;\n  border: 1px solid #CFCFD0;\n  border-radius: 2px;\n  font-size: 14px;\n  color: #212023; }\n\n.public-body .content-box .search-box {\n  float: left;\n  position: relative;\n  width: 150px;\n  height: 35px;\n  line-height: 35px; }\n\n.public-modal .body-right .content-box .search-box > input {\n  float: left;\n  width: 150px;\n  height: 35px;\n  line-height: 35px; }\n\n.public-body .content-box .search-box a {\n  position: absolute;\n  right: 5px;\n  font-size: 16px;\n  line-height: 35px;\n  color: #0187F1; }\n\n.public-body .content-box .create-snapshot {\n  width: 150px;\n  height: 35px;\n  float: right; }\n\n.public-body .content-box .usrPublicBox {\n  width: 110px;\n  height: 35px; }\n\n.public-body .content-box .create-snapshot button,\n.public-body .content-box .usrPublicBox button {\n  height: 35px;\n  width: 100%;\n  line-height: 35px;\n  font-size: 16px;\n  color: #212023;\n  border: 1px solid #CFCFD0; }\n\n.public-body .content-box .create-snapshot button:hover,\n.public-body .content-box .usrPublicBox button:hover {\n  border: 1px solid #0187F1;\n  color: #0187F1; }\n\n.usrList .list-group-item {\n  height: 60px;\n  line-height: 60px;\n  padding: 0; }\n\n.usrList .list-group-item .usrListName {\n  margin-left: 18px;\n  font-size: 18px;\n  color: #212023; }\n\n.usrList .list-group-item .pull-right {\n  margin-right: 22px; }\n\n.usrList .list-group-item .pull-right .usrList-status {\n  display: inline-block;\n  width: 28px;\n  height: 28px;\n  background: #0187F1;\n  font-size: 18px;\n  line-height: 28px;\n  text-align: center;\n  color: #fff;\n  border-radius: 2px;\n  margin: 0 0 0 5px; }\n\n.public-body .content-box .table-list .table {\n  border: 1px solid #E7E7E7;\n  border-radius: 2px; }\n\n.public-body .content-box .table-list .table tr {\n  border: 1px solid #E7E7E7;\n  border-radius: 2px;\n  height: 60px;\n  vertical-align: middle; }\n\n.public-body .content-box .table-list .table tr td {\n  border: none; }\n\n.public-body .content-box .table-list .table span {\n  display: block; }\n\n.public-body .content-box .table-list .table span.table-list-title {\n  font-size: 18px;\n  color: #212023; }\n\n.public-body .content-box .table-list .table span.table-list-time {\n  font-size: 12px;\n  color: #9B9B9B; }\n\n.public-body .content-box .table-list .table button {\n  text-align: center;\n  border: none;\n  width: 50px;\n  margin: 0 0 0 -40px; }\n\n.public-body .content-box .table-list .table button:hover,\n.public-body .content-box .table-list .table button:focus {\n  color: #0187F1; }\n\n.public-body .content-box .pagination {\n  margin: 0; }\n\n.public-body .content-box .pagination li {\n  display: inline-block;\n  margin: 0 5px; }\n\n.public-body .content-box .pagination li > a {\n  padding: 6px 10px;\n  text-decoration: none;\n  font-size: 18px;\n  color: #9B9B9B;\n  border: none; }\n\n.public-body .content-box .pagination li > a:hover {\n  z-index: 2;\n  color: #0187F1;\n  background: none;\n  cursor: pointer; }\n\n.public-body .content-box .pagination > .active > a,\n.public-body .content-box .pagination > .active > a:hover,\n.public-body .content-box .pagination > .active > a:focus {\n  z-index: 2;\n  color: #0187F1;\n  background: none;\n  cursor: pointer; }\n\n.public-body .content-box .advance-box {\n  margin-bottom: 50px; }\n\n.public-body .content-box .advance-box p {\n  font-size: 18px;\n  color: #212023; }\n\n.public-body .content-box .advance-box .current-select {\n  width: 185px;\n  height: 35px;\n  font-size: 18px;\n  padding-left: 5px; }\n\n.public-body .content-box .advance-box button {\n  width: 85px;\n  height: 35px;\n  line-height: 20px;\n  border: 1px solid #cfcfd0;\n  color: #212023; }\n\n.public-body .content-box .advance-box button:hover {\n  border: 1px solid #0187F1;\n  color: #0187F1; }\n\n.public-body .content-box .advance-box .progress {\n  height: 5px;\n  margin-top: 12px; }\n\n.public-modal .public-body .content-box .addInitiators span {\n  height: 35px;\n  font-size: 18px;\n  line-height: 35px; }\n\n.public-modal .public-body .content-box .addInitiators span:last-child {\n  float: right;\n  width: 110px; }\n\n.public-modal .public-body .content-box .addInitiators span button {\n  width: 110px;\n  height: 35px;\n  line-height: 35px;\n  border: 1px solid #CFCFD0;\n  color: #212023;\n  border-radius: 2px; }\n\n.public-modal .public-body .content-box .addInitiators span button:hover {\n  color: #0187F1;\n  border: 1px solid #0187F1; }\n\n.Initiators_list .list-item {\n  margin-bottom: 20px;\n  height: 35px; }\n\n.Initiators_list .list-item input {\n  width: 180px;\n  height: 35px;\n  margin: 0;\n  float: left; }\n\n.Initiators_list .list-item select {\n  width: 110px;\n  height: 35px;\n  float: right;\n  margin-right: 0; }\n\n.public-body .content-box .public-current-select {\n  width: 185px;\n  height: 35px;\n  float: right;\n  border: 1px solid #CFCFD0;\n  border-radius: 1px; }\n\n.public-body .content-box .capacity span {\n  width: 185px;\n  float: right; }\n\n.public-body .content-box .capacity span input {\n  width: 110px;\n  float: left;\n  margin: 0; }\n\n.public-body .content-box .capacity span select {\n  float: right;\n  width: 55px;\n  height: 35px;\n  border: 1px solid #CFCFD0;\n  border-radius: 1px; }\n\n/*btn-list style start*/\n.public-body .btn-list {\n  margin: 65px 35px 0 30px; }\n\n.public-body .btn-list button {\n  width: 120px;\n  line-height: 40px;\n  border: 1px solid #0078D6;\n  border-radius: 2px; }\n\n.public-body .btn-list button:hover,\n.public-body .btn-list button:focus {\n  background: #0187F1;\n  color: #fff; }\n\n.public-body .btn-list .prev,\n.public-body .btn-list .cancel {\n  float: left; }\n\n.public-body .btn-list .next {\n  margin-left: 20px;\n  background: #0187F1;\n  color: #fff; }\n\n.public-body .btn-list .btn-ok {\n  color: #fff;\n  background: #07A4FF; }\n\n.public-body .btn-list .cancel:hover,\n.public-body .btn-list .cancel:focus {\n  background: rgba(8, 164, 255, 0.2);\n  border: 1px solid #0187F1;\n  border-radius: 2px; }\n\n/*public-management-modal style start */\n.public-management-modal .modal-content {\n  width: 490px;\n  margin: 0 auto; }\n\n.public-management-modal .modal-content .modal-body button:hover,\n.public-management-modal .modal-content .modal-body button:focus {\n  color: #0187F1;\n  border: none;\n  background: none; }\n\n/*public-management-modal modal-header style start */\n.public-management-modal .modal-header {\n  border: none;\n  margin: 35px 30px;\n  padding: 0; }\n\n.public-management-modal .modal-header h4 {\n  font-size: 24px;\n  color: #212023;\n  margin: 0; }\n\n.public-management-modal .modal-header .close {\n  color: #212023;\n  border: none;\n  opacity: 1;\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n  line-height: 28px; }\n\n.public-management-modal .modal-header .sing-log {\n  height: 45px;\n  width: 45px;\n  font-size: 50px;\n  color: #212023;\n  margin: 0 auto; }\n\n/*public-management-modal modal-body style start */\n.public-management-modal .modal-body {\n  border: none;\n  padding: 0 30px;\n  margin: 0; }\n\n.public-management-modal .modal-body p {\n  color: #212023;\n  font-size: 18px;\n  word-break: break-all; }\n\n.public-management-modal .modal-content .modal-body .list-group {\n  margin: 25px 0; }\n\n.public-management-modal .modal-body .list-group input {\n  width: 100%;\n  height: 40px;\n  padding-left: 5px;\n  border: 1px solid #CFCFD0;\n  border-radius: 3px;\n  box-shadow: none; }\n\n.public-management-modal .managementPublicBody .list-group label {\n  font-size: 18px;\n  color: #212023;\n  font-weight: 500;\n  line-height: 40px; }\n\n.public-management-modal .managementPublicBody .list-group input {\n  width: 70%;\n  float: right; }\n\n.public-management-modal .modal-content .modal-body .list-group input:focus {\n  outline: none;\n  border-color: #0187F1;\n  box-shadow: none; }\n\n/*public-management-modal modal-footer style start */\n.public-management-modal .modal-footer {\n  border: none;\n  margin: 35px 30px;\n  padding: 0; }\n\n.public-management-modal .modal-footer button {\n  width: 110px;\n  padding: 0;\n  line-height: 40px;\n  border: 1px solid #0078D6;\n  border-radius: 2px;\n  font-size: 18px;\n  color: #0187F1;\n  background: #fff;\n  margin-left: 20px; }\n\n.public-management-modal .modal-footer .manageFooterCancel {\n  width: 100%;\n  margin: 0; }\n\n/*public-management-modal style end */\n.public-management-modal .usrManageHeader {\n  padding: 0;\n  margin: 35px 0 65px 0; }\n\n.public-management-modal .usrManageBody {\n  border: none;\n  padding: 0 40px;\n  height: 340px;\n  margin: 0; }\n\n.public-management-modal .modal-body .body-content .list-group .usrListName {\n  font-size: 18px;\n  color: #212023;\n  line-height: 28px; }\n\n.public-management-modal .modal-body .body-content .list-group .usrList-status {\n  display: inline-block;\n  background: #0187F1;\n  text-align: center;\n  border-radius: 2px;\n  width: 28px;\n  height: 28px;\n  line-height: 28px;\n  margin-left: 12px; }\n\n.public-management-modal .pool-list {\n  padding: 0;\n  color: #212023; }\n\n.public-management-modal .pool-list .table {\n  margin-bottom: 0; }\n\n.public-management-modal .pool-list .table th,\n.public-management-modal .pool-list .table td {\n  line-height: 30px;\n  text-align: center; }\n\n.public-management-modal .pool-list .table td button,\n.public-management-modal .pool-list .table td button:hover,\n.public-management-modal .pool-list .table td button:focus {\n  color: #0187F1;\n  border: none;\n  background: none; }\n\n.public-management-modal .userMangeFooter {\n  margin: 0 30px 45px;\n  border: none; }\n\n.public-management-modal .public-remove-footer {\n  margin: 0 30px 45px; }\n\n.public-management-modal .userMangeFooter button {\n  margin-left: 20px;\n  float: right; }\n\n.public-management-modal .modal-footer button.btn-ok,\n.management-list-modal .modal-footer button.btn-ok {\n  color: #fff;\n  background: #07A4FF; }\n\n.public-management-modal .modal-footer button:hover,\n.public-management-modal .modal-footer button:focus,\n.management-list-modal .modal-footer button:hover,\n.management-list-modal .modal-footer button:focus {\n  background: #0187F1;\n  border: 1px solid #0078D6;\n  color: #fff; }\n\n.public-management-modal .modal-footer button.cancel:hover,\n.public-management-modal .modal-footer button.cancel:focus {\n  background: rgba(8, 164, 255, 0.2);\n  border: 1px solid #0187F1;\n  border-radius: 2px; }\n\n/*management-list-modal style start*/\n.management-list-modal .modal-header {\n  border-bottom: none; }\n\n.management-list-modal .modal-header h4 {\n  font-size: 24px;\n  color: #212023;\n  margin-left: 30px; }\n\n.management-list-modal .modal-header .close {\n  color: #212023;\n  border: none;\n  opacity: 1;\n  font-size: 28px;\n  margin-right: 15px;\n  width: 28px;\n  height: 28px;\n  line-height: 28px; }\n\n.management-list-modal .pool-list {\n  padding: 0;\n  color: #212023; }\n\n.management-list-modal .pool-list .table {\n  margin-bottom: 0; }\n\n.management-list-modal .pool-list .table th,\n.management-list-modal .pool-list .table td {\n  line-height: 30px;\n  text-align: center; }\n\n.management-list-modal .pool-list .table td button,\n.management-list-modal .pool-list .table td button:hover,\n.management-list-modal .pool-list .table td button:focus {\n  color: #0187F1;\n  border: none;\n  background: none; }\n\n.management-list-modal .modal-footer {\n  margin: 30px 0; }\n\n.management-list-modal .modal-footer button {\n  width: 130px;\n  line-height: 40px;\n  border: 1px solid #0078D6;\n  border-radius: 2px;\n  font-size: 18px;\n  color: #0187F1;\n  background: #fff;\n  margin-left: 10px; }\n\n.management-list-modal .modal-footer .cancel:hover,\n.management-list-modal .modal-footer .cancel:focus {\n  background: rgba(8, 164, 255, 0.2);\n  border: 1px solid #0187F1;\n  border-radius: 2px; }\n\n/*add mon modal style start*/\n.list-group .monStatusAndActive span {\n  font-size: 18px;\n  margin-right: 30px;\n  color: #212023; }\n\n.list-group .monStatusAndActive span:last-child {\n  color: #EF233C; }\n\n.list-group .monStatusAndActive span em,\n.mdsList .list-group-item .pull-left span em {\n  display: inline-block;\n  width: 5px;\n  height: 5px;\n  background: #EF233C;\n  border-radius: 5px;\n  vertical-align: middle; }\n\n.public-modal .modal-content .list-group .bootMon-btn,\n.public-modal .modal-content .list-group .removeMon-btn {\n  float: left;\n  width: 150px;\n  height: 35px;\n  line-height: 35px;\n  border: 1px solid #CFCFD0;\n  font-size: 18px;\n  color: rgba(32, 32, 35, 0.26);\n  border-radius: 2px; }\n\n.public-modal .modal-content .list-group .removeMon-btn {\n  color: #212023; }\n\n.public-modal .modal-content .list-group .deploy {\n  width: 85px;\n  height: 35px;\n  line-height: 35px;\n  font-size: 18px;\n  color: #212023;\n  border: 1px solid #CFCFD0;\n  border-radius: 2px; }\n\n.public-modal .modal-content .mdsText {\n  height: auto; }\n\n.public-modal .modal-content .mdsText p {\n  font-size: 16px;\n  color: #212023;\n  line-height: 20px; }\n\n.public-modal .modal-content .mdsText p:first-child {\n  height: 35px; }\n\n.public-modal .modal-content .mdsText p:last-child {\n  color: #99999A; }\n\n.public-modal .modal-content .mdsList {\n  height: auto;\n  margin-bottom: 0; }\n\n.public-modal .modal-content .mdsList .list-group-item {\n  height: 40px;\n  line-height: 20px; }\n\n.mdsList .list-group-item .pull-left span {\n  font-size: 12px;\n  color: #1FE3CB;\n  text-align: center;\n  display: inline-block;\n  width: 55px;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis; }\n\n.mdsList .list-group-item .pull-left span:nth-child(3) {\n  color: #1FE3CB;\n  margin-left: 5px; }\n\n.mdsList .list-group-item .pull-left span em {\n  background: #1FE3CB; }\n\n.public-modal .modal-content .mdsList .list-group-item .pull-right button {\n  border: none;\n  color: #0187F1;\n  font-size: 12px;\n  width: 0;\n  margin-right: 10px;\n  line-height: 20px; }\n\n/*Add New OSD modal style start*/\n/*-----clusterManage modal style start ------*/\n/*addCluster modal style start*/\n.cluster-management-modal .modal-content {\n  width: 560px;\n  margin: 0 auto;\n  border-radius: 5px; }\n\n.cluster-management-modal .modal-header {\n  margin: 35px;\n  padding: 0;\n  border: none; }\n\n.cluster-management-modal .modal-header .cluster-close {\n  position: absolute;\n  right: 10px;\n  top: 10px;\n  color: #212023;\n  border: none;\n  opacity: 1;\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n  line-height: 28px; }\n\n.cluster-management-modal .modal-header .clusterManage-title {\n  margin: 0;\n  color: #212023;\n  font-size: 24px;\n  height: 35px;\n  line-height: 35px; }\n\n.cluster-management-modal .modal-content .modal-header .addCluster {\n  background: none;\n  color: #212023;\n  border: none;\n  float: right; }\n\n.cluster-management-modal .modal-body {\n  margin: 0 35px 35px;\n  padding: 0; }\n\n.cluster-management-modal .clusterList .list-group-item {\n  height: 60px;\n  margin: 10px 0;\n  border: none;\n  padding: 10px 0; }\n\n.cluster-management-modal .clusterList .list-group-item .pull-left span {\n  display: block;\n  font-size: 18px;\n  color: #212023; }\n\n.cluster-management-modal .clusterList .list-group-item .pull-left span b {\n  color: #0187F1;\n  margin-right: 10px; }\n\n.cluster-management-modal .clusterList .list-group-item .pull-left span:last-child {\n  color: #99999A;\n  font-size: 14px;\n  margin: 5px 0; }\n\n.cluster-management-modal .clusterList .list-group-item .pull-right button {\n  margin-left: 20px;\n  background: none;\n  color: #0187F1;\n  font-size: 24px;\n  border: none;\n  line-height: 40px; }\n\n.cluster-management-modal .modal-footer {\n  border: none;\n  padding: 0;\n  margin: 0 35px 35px; }\n\n.cluster-management-modal .modal-content .modal-footer .cancel {\n  width: 110px;\n  padding: 0;\n  line-height: 40px;\n  border: 1px solid #0078D6;\n  border-radius: 2px;\n  font-size: 18px;\n  color: #0187F1;\n  background: #fff; }\n\n.cluster-management-modal .modal-footer .cancel:hover {\n  background: rgba(8, 164, 255, 0.2);\n  color: #fff; }\n\n/*clusterName-management-modal style start*/\n.clusterName-management-modal .modal-content {\n  width: 385px;\n  margin: 0 auto;\n  border-radius: 5px; }\n\n.clusterName-management-modal .modal-content .modal-body button:hover,\n.clusterName-management-modal .modal-content .modal-body button:focus {\n  color: #0187F1;\n  border: none;\n  background: none; }\n\n.clusterName-management-modal .modal-header {\n  border: none;\n  margin: 35px 30px;\n  padding: 0; }\n\n.clusterName-management-modal .modal-header h4 {\n  font-size: 20px;\n  color: #212023;\n  margin: 0; }\n\n.clusterName-management-modal .modal-header .close {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  color: #212023;\n  border: none;\n  opacity: 1;\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n  line-height: 28px; }\n\n.clusterName-management-modal .modal-header .sing-log {\n  height: 45px;\n  width: 45px;\n  font-size: 50px;\n  color: #212023;\n  margin: 0 auto; }\n\n/* modal-body style start */\n.clusterName-management-modal .modal-body {\n  border: none;\n  padding: 0 30px;\n  margin: 0; }\n\n.clusterName-management-modal .modal-body p {\n  color: #212023;\n  font-size: 18px;\n  word-break: break-all; }\n\n.clusterName-management-modal .modal-content .modal-body .list-group {\n  margin: 25px 0; }\n\n.clusterName-management-modal .modal-body .list-group input {\n  width: 100%;\n  height: 40px;\n  padding-left: 5px;\n  border: 1px solid #CFCFD0;\n  border-radius: 3px;\n  box-shadow: none; }\n\n.clusterName-management-modal .managementPublicBody .list-group label {\n  font-size: 18px;\n  color: #212023;\n  font-weight: 500;\n  line-height: 40px; }\n\n.clusterName-management-modal .modal-content .modal-body .list-group input:focus {\n  outline: none;\n  border-color: #0187F1;\n  box-shadow: none; }\n\n.clusterName-management-modal .modal-content .modal-footer {\n  border: none;\n  margin: 0 30px 15px;\n  padding: 20px 0;\n  text-align: right; }\n\n.clusterName-management-modal .modal-content .modal-footer button {\n  width: 110px;\n  padding: 0;\n  line-height: 40px;\n  border: 1px solid #0078D6;\n  border-radius: 2px;\n  font-size: 18px;\n  color: #0187F1;\n  background: #fff;\n  margin-left: 20px; }\n\n.clusterName-management-modal .modal-footer .cancel:hover {\n  background: rgba(8, 164, 255, 0.2);\n  color: #fff; }\n\n.clusterName-management-modal .modal-content .modal-footer .btn-ok {\n  color: #fff;\n  background: #0187F1; }\n\n.public-body .body-content .zabbix_server .list-group {\n  height: 40px;\n  line-height: 20px;\n  margin-bottom: 15px; }\n\n.modal-zabbix .body-right .body-content {\n  height: 330px; }\n\n.modal-zabbix .btn-list {\n  margin: 25px 35px 0 30px; }\n\n#cluster-storage {\n  margin-top: 1px;\n  /*padding-bottom: 12px;*/ }\n  #cluster-storage .dropdown-toggle {\n    background: none;\n    border: none;\n    color: #9c9c9f;\n    width: 100%;\n    height: inherit; }\n  #cluster-storage .caret {\n    border-top: 7px solid;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    margin-left: 5px;\n    color: #000; }\n  #cluster-storage div, #cluster-storage a {\n    font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif; }\n  #cluster-storage #switch-function {\n    height: 70px;\n    color: #9c9c9f;\n    border-top: solid 1px #353538;\n    padding: 6px 40px; }\n    #cluster-storage #switch-function .vmware-name {\n      font-size: 26px;\n      color: #e7e7e7; }\n    #cluster-storage #switch-function .vmware-state {\n      font-size: 12px; }\n      #cluster-storage #switch-function .vmware-state .cluster-position {\n        margin-left: 50px; }\n    #cluster-storage #switch-function .switcher-vmware {\n      float: left;\n      width: 600px; }\n    #cluster-storage #switch-function .switcher_tab {\n      float: right;\n      padding-top: 20px; }\n      #cluster-storage #switch-function .switcher_tab a {\n        font-size: 18px;\n        margin-left: 60px;\n        color: #9c9c9f;\n        -webkit-font-smoothing: antialiased;\n        -moz-osx-font-smoothing: grayscale; }\n      #cluster-storage #switch-function .switcher_tab a.hover {\n        color: #e7e7e7; }\n      #cluster-storage #switch-function .switcher_tab a.active {\n        color: #e7e7e7; }\n  #cluster-storage #ceph-version {\n    margin-left: 25px;\n    color: #000000;\n    font-size: 12px;\n    width: 180px;\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis; }\n  #cluster-storage .dropdown-menu > li {\n    cursor: pointer; }\n    #cluster-storage .dropdown-menu > li > label {\n      font-weight: bold; }\n    #cluster-storage .dropdown-menu > li > a {\n      padding: 3px 20px; }\n    #cluster-storage .dropdown-menu > li > p {\n      padding: 3px 20px;\n      color: #333;\n      line-height: 1.5; }\n  #cluster-storage .dropdown-menu > li:hover {\n    background: #eee; }\n  #cluster-storage .top-menu {\n    height: 60px;\n    border-bottom: 1px solid #e9ecf1;\n    margin: 0px 25px 0px 20px;\n    clear: both; }\n    #cluster-storage .top-menu .cluster-list {\n      width: 310px;\n      float: left;\n      display: inline-block;\n      height: 60px;\n      padding-left: 40px; }\n      #cluster-storage .top-menu .cluster-list .dropdown-menu > li {\n        padding: 0 20px; }\n      #cluster-storage .top-menu .cluster-list .cluster-select {\n        height: 38px; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .cluster-selected {\n          font-size: 24px;\n          margin-left: 15px;\n          font-family: \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n          color: #333;\n          width: 220px;\n          text-align: left; }\n          #cluster-storage .top-menu .cluster-list .cluster-select .cluster-selected .caret {\n            position: absolute;\n            right: 25px;\n            margin-top: 15px; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .cluster-state {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          border-radius: 7px;\n          position: absolute;\n          margin: 15px 10px 0 0px; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .health {\n          background-color: #47ff8d; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .error {\n          background-color: #e60012; }\n        #cluster-storage .top-menu .cluster-list .cluster-select .cluster-position {\n          background: url(" + __webpack_require__(65) + ") left center no-repeat;\n          padding-left: 15px;\n          min-height: 15px; }\n    #cluster-storage .top-menu .angle-right {\n      display: inline-block;\n      border-right: 25px solid transparent; }\n    #cluster-storage .top-menu > .pull-right {\n      padding-right: 0px;\n      margin-right: -5px;\n      line-height: 60px;\n      color: #9c9c9f; }\n    #cluster-storage .top-menu .pull-right button {\n      font-size: 16px;\n      color: #000;\n      background-color: #e9ecf1; }\n  #cluster-storage #tab_views {\n    background-color: #ffffff;\n    width: 100%;\n    height: auto;\n    padding: 10px 20px 15px 20px;\n    color: #333;\n    overflow-y: visible; }\n    #cluster-storage #tab_views #group-host-tab > li {\n      margin-right: -5px; }\n      #cluster-storage #tab_views #group-host-tab > li > a {\n        width: 170px; }\n    #cluster-storage #tab_views > .myTab {\n      height: 40px; }\n    #cluster-storage #tab_views .myTab {\n      border: none;\n      padding: 0; }\n      #cluster-storage #tab_views .myTab > li {\n        padding: 0; }\n      #cluster-storage #tab_views .myTab > li > a {\n        line-height: 1;\n        background-color: #e9ecf1;\n        color: #333;\n        float: left;\n        display: block;\n        border-radius: 0;\n        text-align: center;\n        border: none;\n        margin: 0;\n        font-size: 20px;\n        height: 40px; }\n        #cluster-storage #tab_views .myTab > li > a span {\n          margin-right: 5px;\n          font-size: 14px; }\n        #cluster-storage #tab_views .myTab > li > a span.glyphicon-stop {\n          -webkit-transform: scale(0.6);\n                  transform: scale(0.6); }\n      #cluster-storage #tab_views .myTab li > span {\n        display: block;\n        float: left; }\n      #cluster-storage #tab_views .myTab li:first-child > a {\n        border-top-left-radius: 3px;\n        border-bottom-left-radius: 3px; }\n      #cluster-storage #tab_views .myTab li > a:hover, #cluster-storage #tab_views .myTab li.active > a {\n        background-color: #399BE1;\n        color: #fff; }\n      #cluster-storage #tab_views .myTab li span.angle-right {\n        border-bottom: 40px solid #e9ecf1;\n        border-right: 12px solid transparent; }\n      #cluster-storage #tab_views .myTab li span.angle-left {\n        border-top: 40px solid #e9ecf1;\n        border-left: 12px solid transparent; }\n      #cluster-storage #tab_views .myTab li.active span.angle-right, #cluster-storage #tab_views .myTab li:hover span.angle-right {\n        border-bottom: 40px solid #399BE1;\n        border-right: 12px solid transparent; }\n      #cluster-storage #tab_views .myTab li.active span.angle-left, #cluster-storage #tab_views .myTab li:hover span.angle-left {\n        border-top: 40px solid #399BE1;\n        border-left: 12px solid transparent;\n        border-bottom: none;\n        border-right: none; }\n    #cluster-storage #tab_views #tab_host {\n      clear: both; }\n      #cluster-storage #tab_views #tab_host .tab-views {\n        padding: 0;\n        margin: 0 -4px; }\n      #cluster-storage #tab_views #tab_host .host-contain {\n        margin-top: 5px;\n        padding: 0 4px;\n        border-radius: 3px; }\n        #cluster-storage #tab_views #tab_host .host-contain .server-outer-border {\n          border: solid 1px #e9ecf1;\n          border-radius: 2px; }\n          #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border {\n            border: solid 0px #333336;\n            border-radius: 2px;\n            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2); }\n            #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head {\n              height: 70px;\n              /*line-height: 70px;*/\n              padding: 10px 20px 20px 20px;\n              background: #fff;\n              margin: 10px 20px 10px 0;\n              border-radius: 4px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select {\n                color: #000;\n                background-color: #e9ecf1;\n                font-size: 12px;\n                padding: 0 25px 0 15px;\n                height: 35px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select span.caret {\n                  top: 15px;\n                  border-top-width: 5px;\n                  border-left-width: 4px;\n                  border-right-width: 4px;\n                  right: 5px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select .host-name-wrap {\n                  width: 80px;\n                  display: inline-block;\n                  background-color: #e9ecf1; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-select .host-name-wrap > p {\n                    color: #000;\n                    overflow: hidden;\n                    white-space: nowrap;\n                    text-overflow: ellipsis;\n                    font-size: 14px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-ram {\n                float: right; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-down-state {\n                color: #f37c90;\n                font-size: 18px;\n                float: right; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block {\n                /*margin-left: 10px;*/\n                display: inline-block;\n                cursor: pointer; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block > div, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block > div, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block > div {\n                  font-size: 12px;\n                  display: inline-block;\n                  margin-left: 2px;\n                  margin-bottom: 3px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block .progress, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block .progress, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block .progress {\n                  width: 55px;\n                  height: 3px;\n                  display: inline-block;\n                  background-color: #232328; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .host-block .progress .progress-bar, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-block .progress .progress-bar, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .ram-block .progress .progress-bar {\n                    background-color: #4791ff; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-head .cpu-ram-pop {\n                width: 400px;\n                height: 200px;\n                border-radius: 2px;\n                position: absolute;\n                top: -32%;\n                left: 10%;\n                display: block;\n                z-index: 9999;\n                background-color: #fff;\n                padding: 10px; }\n            #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body {\n              clear: both;\n              height: 341px;\n              background-color: #fff; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li {\n                width: 33%;\n                height: 30px;\n                line-height: 30px;\n                overflow: hidden; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li > a {\n                font-size: 14px;\n                width: 100%; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li.active > a, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .myTab li:hover {\n                border-bottom: solid 1px #c0e0f3;\n                height: 30px;\n                border-radius: 0;\n                background-color: #399BE1;\n                border-radius: 0; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .server-service-box {\n                margin: 60px 10px 0 10px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .server-service-box .state {\n                  font-size: 14px;\n                  margin-bottom: 15px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option h3 {\n                font-size: 16px;\n                color: #676769; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation {\n                margin-top: 265px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .osd-remove-tip {\n                position: absolute;\n                bottom: 50px;\n                width: 85%;\n                font-size: 16px;\n                word-wrap: break-word; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .osd-remove-tip .osd-remove-selected {\n                  color: #e7e7e7;\n                  max-height: 170px;\n                  overflow-y: auto; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .network-adapter {\n                margin-top: 228px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .network-select, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation {\n                font-size: 14px;\n                border: solid 1px #ccc;\n                border-radius: 3px;\n                height: 45px;\n                line-height: 30px;\n                text-align: center;\n                cursor: pointer; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .network-select .caret, #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation .caret {\n                  top: 12px;\n                  right: 5px;\n                  color: #e7e7e7; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation button span {\n                color: #676769; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .batch-operation a {\n                color: #9c9c9f;\n                font-size: 14px; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .left-option .color-bright {\n                color: #666; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list {\n                padding: 6px 0 0 0; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .network-graph {\n                  border: solid 1px #ccc;\n                  height: 282px;\n                  margin: 11px 15px 0 0; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box {\n                  /*width: 58px;*/\n                  height: 58px;\n                  margin-top: 15px;\n                  padding: 0; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .osd-action {\n                    font-size: 1em;\n                    text-align: center;\n                    width: 80%;\n                    height: 40%;\n                    border-radius: 3px;\n                    border: 1px solid #fff;\n                    position: absolute;\n                    top: 45%;\n                    right: -30%;\n                    display: block;\n                    -webkit-transition: all 0.4s ease-in-out;\n                    transition: all 0.4s ease-in-out;\n                    opacity: 0;\n                    cursor: pointer; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .osd-remove-selected {\n                    background-color: #1f486a;\n                    border: solid 2px #0187f1; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .osd-remove-selected .glyphicon-ok {\n                      color: #0187f1;\n                      padding: 10px 15px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box .glyphicon-refresh {\n                    color: #0187f1;\n                    padding: 10px 15px;\n                    font-size: 16px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box:hover .osd-click-enable {\n                  background-color: #ffffff;\n                  border: solid 2px #e9ecf1; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-box:hover .osd-action {\n                  right: 10%;\n                  opacity: 1; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd {\n                  width: 58px;\n                  height: 58px;\n                  background-color: #fff;\n                  border: solid 1px #e9ecf1;\n                  font-size: 12px;\n                  border-radius: 2px;\n                  position: relative;\n                  padding: 3px 0 0 6px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .osd-status {\n                    width: 5px;\n                    height: 5px;\n                    border-radius: 5px;\n                    display: inline-block;\n                    margin: 1px 0px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .osd-name {\n                    -webkit-transform: scale(0.75);\n                            transform: scale(0.75);\n                    display: inline-block;\n                    position: relative;\n                    z-index: 3; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .capacity-show {\n                    -webkit-transform: scale(0.85);\n                            transform: scale(0.85);\n                    position: relative;\n                    z-index: 3;\n                    color: #babdbd; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .capacity-show .capacity-show-total {\n                      margin-left: -5px; }\n                  #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop {\n                    font-size: 1em;\n                    text-align: center;\n                    width: 337px;\n                    border-radius: 2px;\n                    border: 1px solid #fff;\n                    position: absolute;\n                    top: -240%;\n                    left: 58px;\n                    display: block;\n                    -webkit-transition: all 0.4s ease-in-out;\n                    transition: all 0.4s ease-in-out;\n                    cursor: pointer;\n                    z-index: 9999;\n                    background-color: #fff;\n                    padding: 20px 25px;\n                    text-align: left;\n                    color: #212023; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .disk-box {\n                      margin-top: 10px;\n                      line-height: 22px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box {\n                      margin: 20px 0 0 0; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box > div {\n                        height: 30px; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box span.title {\n                        font-size: 13px;\n                        float: left; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box .disk-drop-list {\n                        float: right;\n                        border: solid 1px #7d7d7d;\n                        border-radius: 3px;\n                        padding: 2px 6px; }\n                        #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box .disk-drop-list .caret {\n                          color: #a2a2a2; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .iops-box #iops-graph {\n                        border: solid 1px #a2a2a2;\n                        height: 135px;\n                        width: 100%;\n                        clear: both; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .osd-status {\n                      width: 10px;\n                      height: 10px;\n                      border-radius: 10px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .osd-name {\n                      font-size: 22px;\n                      -webkit-transform: none;\n                              transform: none;\n                      margin-left: 5px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop span.disk-title {\n                      font-size: 16px;\n                      margin-right: 10px; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop span.disk-capacity {\n                      font-size: 12px;\n                      color: #c0c0c1; }\n                    #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .progress {\n                      -webkit-transform: none;\n                              transform: none;\n                      width: 100%;\n                      height: 4px;\n                      border-radius: 3px;\n                      margin: 0;\n                      background-color: #dfdfdf; }\n                      #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd .io-pop .progress .progress-bar {\n                        background-color: #4791ff; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .progress {\n                  -webkit-transform: rotate(-90deg);\n                          transform: rotate(-90deg);\n                  width: 57px;\n                  height: 55px;\n                  margin: -57px 0 0 1px;\n                  border-radius: 1px;\n                  background: none;\n                  position: relative; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .osd-shadow {\n                  position: absolute;\n                  margin-top: -2px;\n                  margin-left: 2px; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .capacity-used-normal {\n                  background: #2c2d2f;\n                  background: -webkit-linear-gradient(bottom, #2f70c5 0%, #47a9cf 100%);\n                  background: linear-gradient(to top, #2f70c5 0%, #47a9cf 100%);\n                  background: -webkit-linear-gradient(top, #2f70c5 0%, #47a9cf 100%);\n                  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#2f70c5', endColorstr='#47a9cf', GradientType=0); }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .capacity-used-warn {\n                  background: #2c2d2f;\n                  background: -webkit-linear-gradient(bottom, #652b76 0%, #d24c4b 100%);\n                  background: linear-gradient(to top, #652b76 0%, #d24c4b 100%);\n                  background: -webkit-linear-gradient(top, #652b76 0%, #d24c4b 100%);\n                  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#652b76', endColorstr='#d24c4b', GradientType=0); }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .up .osd-status {\n                  background-color: #4affe9; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .right-list .down .osd-status {\n                  background-color: #ff0000; }\n              #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .deploy-circle-box {\n                text-align: center; }\n                #cluster-storage #tab_views #tab_host .host-contain .server-outer-border .server-inner-border .host-body .deploy-circle-box .pie_progress__label {\n                  margin-top: -120px;\n                  margin-left: 10px;\n                  font-size: 18px;\n                  color: #e7e7e7; }\n  #cluster-storage #add-cluster-init {\n    background: url(" + __webpack_require__(66) + ") 0 no-repeat;\n    background-size: cover;\n    text-align: center;\n    color: #fff; }\n    #cluster-storage #add-cluster-init #create-one-box {\n      padding-top: 20%; }\n      #cluster-storage #add-cluster-init #create-one-box .logo {\n        width: 250px;\n        height: 50px;\n        display: inline-block;\n        background: url(" + __webpack_require__(63) + ") left center no-repeat; }\n      #cluster-storage #add-cluster-init #create-one-box #nocluster-tips {\n        font-size: 36px;\n        color: #bdbdc6;\n        margin: 10px 0 100px 0; }\n    #cluster-storage #add-cluster-init .add-cluster-btn {\n      width: 150px;\n      height: 45px;\n      cursor: pointer;\n      color: #fff;\n      font-size: 20px;\n      background-color: #0187f1; }\n    #cluster-storage #add-cluster-init #create-clusters-box {\n      margin-top: 10%;\n      width: 480px;\n      height: 320px;\n      font-size: 18px;\n      background-color: rgba(0, 0, 0, 0.5);\n      color: #fff;\n      display: inline-block;\n      border: solid 1px #3c3d41;\n      box-shadow: 0 0 60px #000; }\n      #cluster-storage #add-cluster-init #create-clusters-box h1 {\n        font-size: 26px;\n        margin: 40px 0; }\n      #cluster-storage #add-cluster-init #create-clusters-box p {\n        line-height: 25px;\n        margin: 30px 20px; }\n        #cluster-storage #add-cluster-init #create-clusters-box p label {\n          color: #bdbdc6; }\n      #cluster-storage #add-cluster-init #create-clusters-box input {\n        margin-left: 10px;\n        background: none;\n        border: none;\n        border-bottom: solid 2px #3c3d41; }\n  #cluster-storage .tab-content {\n    border: none;\n    border-bottom: 1px #ccc solid; }\n\n#cluster-storage .dropdown-menu .btn-managemeng {\n  text-align: center;\n  color: #888; }\n\n.cluster-info-warn-modal .modal-content {\n  width: 340px;\n  height: auto;\n  padding: 10px 20px; }\n\n.cluster-info-warn-modal .close {\n  margin-top: -20px; }\n\n.add-host-modal .modal-content, .add-cluster-modal .modal-content, .edit-cluster-modal .modal-content, .del-cluster-modal .modal-content, .cluster-manage-modal .modal-content {\n  width: 340px;\n  height: auto;\n  margin-left: 25%;\n  margin-top: 54px; }\n\n.add-host-modal .edit-cluster-modal .modal-content .AddHost > span, .add-cluster-modal .edit-cluster-modal .modal-content .AddHost > span, .edit-cluster-modal .edit-cluster-modal .modal-content .AddHost > span, .del-cluster-modal .edit-cluster-modal .modal-content .AddHost > span, .cluster-manage-modal .edit-cluster-modal .modal-content .AddHost > span {\n  float: right;\n  margin-top: -40px;\n  font-size: 20px;\n  color: #ccc; }\n\n.add-cluster-modal .modal-content .AddHost .ng-pristine .Add_h3 {\n  font-size: 22px; }\n\n.AddHost {\n  padding: 10px 30px;\n  font-family: \"microsoft Yahei\"; }\n  .AddHost > span {\n    padding-left: 20px;\n    display: inline-block;\n    margin-top: 15px; }\n  .AddHost input {\n    margin-top: 10px;\n    height: 35px;\n    width: 100%;\n    padding-left: 8px; }\n  .AddHost #add-host-box, .AddHost #add-cluster-box, .AddHost #edit-cluster-box {\n    margin: 40px 0 15px 0; }\n\n.add-osd-modal .modal-content {\n  padding: 10px 20px;\n  width: 490px; }\n  .add-osd-modal .modal-content h4 {\n    font-family: MyriadPro-Regular;\n    color: #99999A; }\n  .add-osd-modal .modal-content #disks_list {\n    margin-top: 40px;\n    font-size: 18px; }\n    .add-osd-modal .modal-content #disks_list h5 {\n      color: #99999A;\n      float: left; }\n    .add-osd-modal .modal-content #disks_list .sort-filter {\n      float: right;\n      margin-bottom: 10px; }\n      .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list > span {\n        color: #99999A; }\n      .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list > a {\n        border: 1px solid #CFCFD0;\n        border-radius: 2px;\n        color: #212023;\n        display: inline-block;\n        padding: 3px 10px; }\n        .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list > a .caret {\n          color: #979797; }\n      .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list .dropdown-menu li {\n        cursor: pointer; }\n        .add-osd-modal .modal-content #disks_list .sort-filter .disk-drop-list .dropdown-menu li p {\n          padding: 0 10px; }\n    .add-osd-modal .modal-content #disks_list .avail-disks-box {\n      clear: both;\n      margin-top: 10px;\n      border: 1px solid #E7E7E7;\n      border-radius: 2px; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box div:nth-child(even) {\n        background: #F9F9F9; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box div:nth-child(old) {\n        background: none; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box div {\n        height: 45px;\n        line-height: 45px;\n        padding: 0 0 0 10px; }\n        .add-osd-modal .modal-content #disks_list .avail-disks-box div .glyphicon-ok-sign {\n          color: #B9B9B9;\n          line-height: 45px; }\n        .add-osd-modal .modal-content #disks_list .avail-disks-box div .ok-select {\n          color: #7ED321; }\n      .add-osd-modal .modal-content #disks_list .avail-disks-box > div > p {\n        float: none; }\n  .add-osd-modal .modal-content .footer-right-btn .btn {\n    margin: 0; }\n\n.add-osd-modal .close {\n  margin-top: -20px; }\n\n.footer-right-btn {\n  text-align: right;\n  margin: 30px 0; }\n  .footer-right-btn .btn {\n    width: 80px;\n    margin-rigth: 30px;\n    margin-top: 15px; }\n\n.edit-cluster-modal .modal-content .AddHost .btn-cancel {\n  margin-right: 10px;\n  border: 1px solid #ccc;\n  background: #fff;\n  color: #ccc; }\n\n.edit-cluster-modal .modal-content .AddHost .btn-cancel:hover {\n  background: #0187f1;\n  color: #fff; }\n\n.del-cluster-modal .modal-content .AddHost .btn-cancel {\n  margin-right: 10px;\n  border: 1px solid #ccc;\n  background: #fff;\n  color: #ccc; }\n\n.del-cluster-modal .modal-content .AddHost .btn-cancel:hover {\n  background: #0187f1;\n  color: #fff; }\n\n.cluster-manage-modal .modal-content .footer-right-btn .closes-btn {\n  margin-right: 33px;\n  border: 1px solid #ccc;\n  background: #fff;\n  color: #ccc; }\n\n.cluster-manage-modal .modal-content .footer-right-btn .closes-btn:hover {\n  background: #0187f1;\n  color: #fff; }\n\n.AddHost > p {\n  margin: 0 0 10px;\n  margin-left: 22px;\n  font-size: 16px;\n  margin-top: 23px; }\n\n.del-cluster-modal .modal-content .AddHost .sing_log {\n  margin-left: 45%;\n  margin-top: 10px; }\n\n.edit-cluster-modal .AddHost .close, .add-cluster-modal .AddHost .close {\n  margin-right: -20px; }\n\n.edit-cluster-modal .modal-content .AddHost .ng-pristine .addhost-text {\n  display: block;\n  width: 300%;\n  font-size: 22px;\n  margin-top: 12px; }\n\n.edit-cluster-modal .modal-content .AddHost .ng-pristine #edit-cluster-box .text-name {\n  font-size: 16px;\n  margin-top: 15px; }\n\n.cluster-manage-modal .modal-content {\n  width: 560px;\n  height: auto; }\n\n.del-cluster-modal .modal-content {\n  width: 450px;\n  height: auto; }\n\n.add-host-modal .close {\n  margin-right: -20px; }\n\n.add-host-modal .footer-right-btn {\n  margin: 0; }\n  .add-host-modal .footer-right-btn input {\n    margin: 12px 0 20px 0; }\n\n.delete-osd-modal .modal-content {\n  width: 422px;\n  margin-left: 25%;\n  padding: 30px 30px 55px 30px;\n  border-radius: 2px; }\n  .delete-osd-modal .modal-content #delete_osd_box {\n    color: #999;\n    font-size: 16px; }\n    .delete-osd-modal .modal-content #delete_osd_box h3 {\n      color: #212023;\n      text-align: center;\n      margin: 0;\n      margin: 0 0 15px 0; }\n    .delete-osd-modal .modal-content #delete_osd_box .delete-osd-selected {\n      color: #212023; }\n    .delete-osd-modal .modal-content #delete_osd_box .yes {\n      width: 70px;\n      background-color: #0187f1; }\n    .delete-osd-modal .modal-content #delete_osd_box .cancel {\n      width: 70px;\n      color: #999;\n      border: solid 1px #99999a;\n      background-color: #f2f2f2;\n      margin-left: 15px; }\n\n.query-iohistory-modal .modal-dialog .modal-content, .network-scale-modal .modal-dialog .modal-content {\n  padding: 25px 30px;\n  width: 730px; }\n\n.query-iohistory-modal .modal-dialog #iohistory_line, .query-iohistory-modal .modal-dialog #history_chart, .network-scale-modal .modal-dialog #iohistory_line, .network-scale-modal .modal-dialog #history_chart {\n  height: 400px;\n  width: 650px;\n  /*margin-top: 40px;*/ }\n\n.query-iohistory-modal .modal-dialog .time_group, .network-scale-modal .modal-dialog .time_group {\n  position: absolute;\n  top: 25px;\n  right: 30px;\n  z-index: 9999;\n  text-align: right; }\n  .query-iohistory-modal .modal-dialog .time_group .title, .network-scale-modal .modal-dialog .time_group .title {\n    display: block;\n    font-size: 12px;\n    font-weight: bold; }\n  .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:focus, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:active:focus, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn.active:focus, .network-scale-modal .modal-dialog .time_group .btn-group .btn:focus, .network-scale-modal .modal-dialog .time_group .btn-group .btn:active:focus, .network-scale-modal .modal-dialog .time_group .btn-group .btn.active:focus {\n    outline: 0;\n    background-image: none;\n    box-shadow: none; }\n    .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:focus .dropdown-toggle, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn:active:focus .dropdown-toggle, .query-iohistory-modal .modal-dialog .time_group .btn-group .btn.active:focus .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group .btn:focus .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group .btn:active:focus .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group .btn.active:focus .dropdown-toggle {\n      box-shadow: none;\n      background: none; }\n  .query-iohistory-modal .modal-dialog .time_group .btn-group a, .network-scale-modal .modal-dialog .time_group .btn-group a {\n    color: #333;\n    padding-right: 0; }\n  .query-iohistory-modal .modal-dialog .time_group .btn-group.open .dropdown-toggle, .network-scale-modal .modal-dialog .time_group .btn-group.open .dropdown-toggle {\n    box-shadow: none; }\n\n.cluster-manage-modal a {\n  color: #363f44; }\n\n.cluster-manage-modal .modal-header {\n  border: none;\n  margin-bottom: 0; }\n  .cluster-manage-modal .modal-header h3 {\n    margin-top: 10px; }\n\n.cluster-manage-modal .modal-body .add-new-cluster {\n  border: none;\n  margin-top: -20px;\n  background: none;\n  color: #000; }\n\n.cluster-manage-modal .table-bordered {\n  border: none; }\n\n.cluster-manage-modal .table > thead > tr > th {\n  border: none; }\n\n.cluster-manage-modal tbody {\n  padding: 0 30px; }\n  .cluster-manage-modal tbody tr td {\n    border: none;\n    vertical-align: middle; }\n    .cluster-manage-modal tbody tr td label, .cluster-manage-modal tbody tr td span {\n      display: block;\n      color: #888; }\n    .cluster-manage-modal tbody tr td label {\n      font-weight: bold;\n      font-size: 18px;\n      color: #000; }\n    .cluster-manage-modal tbody tr td span {\n      padding: 0 16px;\n      line-height: 1.5;\n      background: url(" + __webpack_require__(65) + ") left center no-repeat; }\n    .cluster-manage-modal tbody tr td a.map-trash, .cluster-manage-modal tbody tr td a.map-edit {\n      font-size: 20px;\n      color: #00b3ee; }\n\n.cluster-manage-modal .btn-default {\n  position: absolute;\n  right: 50px;\n  top: -16px; }\n\n.modal-body .max-num {\n  font-weight: bold; }\n\n.modal-body .mon-mds-setting {\n  /*margin-right: 30px;\n    /!*font-size: 18px;*!/\n    .deploy-mon-mds {\n      margin-top: 20px;\n      text-align: right;\n    }\n    .removeFirst {\n      color: #212023;\n    }\n    .maxTips {\n      color: #99999A;\n    }*/ }\n  .modal-body .mon-mds-setting .hostSettingList {\n    /*max-height: 180px;\n      overflow-y: auto;*/\n    overflow: hidden;\n    margin-top: 10px;\n    border: 1px solid #E7E7E7;\n    border-radius: 2px; }\n    .modal-body .mon-mds-setting .hostSettingList .col-xs-12 {\n      padding: 0; }\n    .modal-body .mon-mds-setting .hostSettingList > div {\n      height: 45px;\n      line-height: 45px; }\n    .modal-body .mon-mds-setting .hostSettingList > div:nth-child(even) {\n      background: #F9F9F9; }\n    .modal-body .mon-mds-setting .hostSettingList > div:nth-child(old) {\n      background: none; }\n\n/* new clearfix */\n.clearfix:after {\n  visibility: hidden;\n  display: block;\n  font-size: 0;\n  content: \" \";\n  clear: both;\n  height: 0; }\n\n* html .clearfix {\n  zoom: 1; }\n\n*:first-child + html .clearfix {\n  zoom: 1; }\n\nhtml {\n  background-color: #fff; }\n\n*:focus {\n  outline: 0 !important; }\n\n.h1,\n.h2,\n.h3,\n.h4,\n.h5,\n.h6 {\n  margin: 0; }\n\nlabel {\n  font-weight: normal; }\n\n#main_content {\n  position: relative; }\n\n.model_loading,\n.main_content_loading {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  z-index: 88;\n  background-image: url(" + __webpack_require__(67) + ");\n  background-repeat: no-repeat;\n  background-position: 50% 35%;\n  background-color: rgba(0, 0, 0, 0.4); }\n\n.model_loading {\n  display: none; }\n\n.map {\n  height: 500px; }\n\n.messages {\n  position: fixed;\n  z-index: 9999;\n  top: 96px;\n  right: 20px; }\n  .messages .alert.alert-danger strong {\n    color: #ff0000; }\n  .messages .alert.alert-success strong {\n    color: #6cbe2f; }\n  .messages .alert.alert-info strong {\n    color: #00abff; }\n  .messages .alert.alert-warning strong {\n    color: #fb8f1b; }\n  .messages .alert a.close:hover {\n    color: #fff;\n    opacity: 1; }\n\n.alert .alert-actions {\n  margin-top: -23px;\n  margin-right: -23px; }\n\n#thinkstack_admin_list {\n  background: rgba(0, 0, 0, 0.8);\n  border-radius: 0;\n  margin-top: 4px;\n  box-shadow: 0 6px 12px #9e9e9e; }\n\n#thinkstack_admin_list li > a {\n  color: #fff;\n  font-size: 16px; }\n\n#thinkstack_admin_list li > a:hover {\n  background: #272a2f;\n  color: #fff; }\n\n#thinkstack_admin_list.dropdown-menu.topbar-dropdown-menu:after {\n  border-bottom: 6px solid rgba(0, 0, 0, 0.8); }\n\n.clearfix:after {\n  clear: both;\n  display: block;\n  visibility: hidden;\n  content: \"\";\n  height: 0; }\n", ""]);

	// exports


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "718e618d55875666ca3be892b2021039.png";

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "bd69c7a1c514ae6ed25c9a198af601b6.png";

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "a98551c6e1354eaebd7ee31e0c9f20ef.png";

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fe4c633e88b1d3f4810c7621c9412ff7.png";

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "90a0ba95f671e17a14084afe7f0ae2e0.png";

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "281dc7c818f99f900afb1426f6613c61.gif";

/***/ }
]);
//# sourceMappingURL=bundle.js.map