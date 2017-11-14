/*
 *    (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
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
(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name horizon.framework.esutils.utils
   * @description
   * horizon.framework.esutils.utils provides common utils.
   *
   */
  angular.module('horizon.framework.esutils.utils', [])

  .factory('horizon.framework.esutils.Utils', ['$window', '$rootScope', '$filter',
    function($window, $rootScope, filter) {
      var Utils = {
        timezoneOffset: new Date().getTimezoneOffset(),

        utcToLocalDate: function(utc) {
          var date = angular.copy(utc);
          var offset = Utils.getTimezoneOffset();
          date.setTime(date.getTime() + offset * 60 * 1000);
          return date;
        },

        localToUtcDate: function(utc) {
          var date = angular.copy(utc);
          var offset = Utils.getTimezoneOffset();
          date.setTime(date.getTime() - offset * 60 * 1000);
          return date;
        },

        clearAllProps: function(obj) {
          for(var key in obj) {
            delete obj[key];
          }
        },

        bytesToGB: function(bytes) {
          if (!bytes || typeof(bytes) !== 'number') {
            return '';
          } else {
            var gb = 1024 * 1024 * 1024;
            return Number(bytes / gb).toFixed(2);
          }
        },

        bytesToGBNoPoint: function(bytes) {
          if (!bytes || typeof(bytes) !== 'number') {
            return '';
          } else {
            var gb = 1024 * 1024 * 1024;
            return Number(bytes / gb);
          }
        },

        convertUnit: function(data, unit){
        	var convertedData;
        	switch(unit){
    			case 'byte':
    				convertedData = filter('bytes')(data);
    				break;
    			case 'KB':
    				convertedData = filter('bytes')(data*1024);
    				break;
    			case 'MB':
    				convertedData = filter('bytes')(data*1024*1024);
    				break;
    			case 'GB':
    				convertedData = filter('bytes')(data*1024*1024*1024);
    				break;
    			case 'TB':
    				convertedData = filter('bytes')(data*1024*1024*1024*1024);
    				break;
        	}
        	return convertedData;
        }
      };
      return Utils;
    }]
  ); // end of factory 'horizon.framework.esutils.Utils'

  // "hello {0}".format('world') ==> "hello world"
  String.prototype.format= function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(s,i){
      return args[i];
    });
  };

  // new Date().format("yyyy-MM-dd hh:mm:ss.S") ==> 2015-08-21 16:52:04.423
  // new Date().format("yyyy-M-d h:m:s.S")      ==> 2015-8-2 8:9:4.18
  Date.prototype.format = function(fmt) {
    var o = {
      "M+": this.getMonth()+1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth()+3)/3),
      "S" : this.getMilliseconds()
    };
    if(/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
      if(new RegExp("("+ k +")").test(fmt))
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
  };

  // Array method extension
  Array.prototype.contains = function(item) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == item)
        return true;
    }
    return false;
  };

  Array.prototype.findId = function(id) {
    for(var i = 0; i < this.length; i++) {
      if(this[i].id == id)
        return this[i];
    }
    return null;
  };

  Array.prototype.containsId = function(id) {
    for(var i = 0; i < this.length; i++) {
      if(this[i].id == id)
        return true;
    }
    return false;
  };

  Array.prototype.resetIds = function(id) {
    id = id || 0;
    for(var i = 0; i < this.length; i++) {
      this[i].id = String(id++);
    }
    return this;
  };

  Array.prototype.removeAt = function(index) {
    return this.splice(index, 1);
  };

  Array.prototype.remove = function(item) {
    for(var i = 0; i < this.length; i++) {
      if(this[i] == item) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  };

  Array.prototype.removeId = function(id) {
    for(var i = 0; i < this.length; i++) {
      if(this[i].id == id) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  };

  Array.prototype.add = function(item){
    return this.push(item);
  };

  // extend the orig array (diffrent from concat which returns a copy)
  Array.prototype.extend = function(items){
    if(!(items instanceof Array)) {
      return this;
    }
    for(var i = 0; i < items.length; i++) {
      this.push(items[i]);
    }
    return this;
  };

  // remove the dup items
  Array.prototype.asSet = function(){
    var uniqueList = [];
    var map = {};
    var list = this;
    for(var i = 0; i < list.length; i++){
      var item = list[i];
      var key = hash(item);
      if(!map[key]){
        map[key] = true;
        uniqueList.push(item);
      }
    }
    return uniqueList;
  };

  // in @this and in @other
  Array.prototype.intersection = function(other){
    return this.filter(function(item){
      return other.contains(item);
    }).asSet();
  };

  // in @this but not in @other
  Array.prototype.difference = function(other){
    return this.filter(function(item){
      return !other.contains(item);
    }).asSet();
  };

  // in @this or in @other
  Array.prototype.union = function(other){
    return this.concat(other).asSet();
  };

  // return a list of @attr of every item
  // <==> Array.map(function(item){ return item[attr]; }))
  Array.prototype.attrsOfAll = function(attr) {
    var attrs = [];
    for(var i = 0; i < this.length; i++) {
      attrs.push(this[i][attr]);
    }
    return attrs;
  };

  /////////////////////////////////////////////////////////////////////
  var uid = 0;
  function nextUid() {
    return ++uid;
  }

  function hash(obj, nextUidFn) {
    var key = obj && obj.$$hashKey;

    if (key) {
      if (typeof key === 'function') {
        key = obj.$$hashKey();
      }
      return key;
    }

    var objType = typeof obj;
    if (objType == 'function' || (objType == 'object' && obj !== null)) {
      key = obj.$$hashKey = objType + ':' + (nextUidFn || nextUid)();
    } else {
      key = objType + ':' + obj;
    }

    if(!key && angular.isObject(obj)) {
      key = obj.id || angular.toJson(obj);
    }
    return key;
  }

}());
