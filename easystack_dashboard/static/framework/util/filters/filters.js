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
   * @name horizon.framework.util.filters
   * @description
   * horizon.framework.util.filters provides common filters to be used within Horizon.
   *
   */
  angular.module('horizon.framework.util.filters', ['horizon.framework.util.i18n'])

  /**
   * @ngdoc filter
   * @name yesno
   * @description
   * Evaluates given input for standard truthiness and returns translation
   * of 'Yes' and 'No' for true/false respectively.
   */
  .filter('yesno', ['horizon.framework.util.i18n.gettext', function (gettext) {
    return function (input) {
      return (input ? gettext("Yes") : gettext("No"));
    };
  }])

  /**
   * @ngdoc filter
   * @name gb
   * @description
   * Expects numeric value and suffixes translated 'GB' with spacing.
   * Returns empty string if input is not a number or is null.
   */
  .filter('gb', function () {
    return function (input) {
      if (isNaN(input) || null === input) {
        return '';
      } else {
        return interpolate(gettext("%s GB"), [input.toString()]);
      }
    };
  })

  /**
   * @ngdoc filter
   * @name mb
   * @description
   * Expects numeric value and suffixes translated 'MB' with spacing.
   * Returns empty string if input is not a number or is null.
   */
  .filter('mb', function () {
    return function (input) {
      if (isNaN(input) || null === input) {
        return '';
      } else {
        return interpolate(gettext("%s MB"), [input.toString()]);
      }
    };
  })

  /**
   * @ngdoc filter
   * @name hours
   * @description
   * Expects numeric value and suffixes translated 'MB' with spacing.
   * Returns empty string if input is not a number or is null.
   */
  .filter('hours', function () {
    return function (input) {
      if (isNaN(input) || null === input) {
        return '';
      } else {
        return interpolate(gettext("%s Hours"), [input.toString()]);
      }
    };
  })

  /**
   * @ngdoc filter
   * @name title
   * @description
   * Capitalizes leading characters of individual words.
   */
  .filter('title', function () {
    return function (input) {
      if (typeof input !== 'string') {
        return input;
      }
      return input.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
      });
    };
  })

  /**
   * @ngdoc filter
   * @name noUnderscore
   * @description
   * Replaces all underscores with spaces.
   */
  .filter('noUnderscore', function () {
    return function (input) {
      if (typeof input !== 'string') {
        return input;
      }
      return input.replace(/_/g, ' ');
    };
  })

  /**
   * @ngdoc filter
   * @name decode
   * @description
   * Returns values based on key and given mapping.  If key doesn't exist
   * in given mapping, return key.  This is useful when translations for
   * codes are present.
   */
  .filter('decode', function () {
    return function (input, mapping) {
      if (input === undefined) {
        return;
      }
      var val = mapping[input];
      return angular.isDefined(val) ? val : input;
    };
  })

  /**
   * @ngdoc filter
   * @name bytes
   * @description
   * Returns a human-readable approximation of the input of bytes,
   * converted to a useful unit of measure.  Uses 1024-based notation.
   */
  .filter('bytes', function () {
    return function (input) {
      var kb = 1024;
      var mb = kb * 1024;
      var gb = mb * 1024;
      var tb = gb * 1024;
      if (isNaN(input) || null === input || input < 0) {
        return '';
      } else if (input >= tb) {
        return interpolate(gettext("%s TB"), [Number(input / tb).toFixed(2)]);
      } else if (input >= gb) {
        return interpolate(gettext("%s GB"), [Number(input / gb).toFixed(2)]);
      } else if (input >= mb) {
        return interpolate(gettext("%s MB"), [Number(input / mb).toFixed(2)]);
      } else if (input >= kb) {
        return interpolate(gettext("%s KB"), [Number(input / kb).toFixed(2)]);
      } else {
        return interpolate(gettext("%s bytes"), [Math.floor(input)]);
      }
    };
  })

  .filter('mbps', function(){
     return function(input){
        if (isNaN(input) || null === input || input < 0) {
              return '';
        }
        return interpolate(gettext("Bind width　limit: %s Mbps"), [Number(input / 1024).toFixed(2)]);
     }
  })

  /**
   * @ngdoc filter
   * @name itemCount
   * @description
   * Displays translated count in table footer.
   * Takes only finite numbers.
   */
  .filter('itemCount', function () {
    return function (input) {
      var isNumeric = (input !== null && isFinite(input));
      var number = isNumeric ? Math.round(input) : 0;
      var count = (number > 0) ? number : 0;
      var format = ngettext('Displaying %s item', 'Displaying %s items', count);
      return interpolate(format, [count]);
    };
  })

  /**
   * @ngdoc filter
   * @name trans
   * @description
   * Returns translated text.
   */
  .filter('trans', ['horizon.framework.util.i18n.gettext', function (gettextFunc) {
    return function (input) {
      // NOTE: uses 'gettextFunc' to avoid message collection.
      return gettextFunc(input);
    };
  }])

  /**
   * @ngdoc filter
   * @name price
   * @description
   * Returns display price with unified precision.
   */
  .filter('price', function () {
    return function (input) {
      var needFmtPricePrecision = true;
      if(needFmtPricePrecision) {
        var price = 0;
        if(input instanceof String){
          price = parseFloat(input.replace(/,/g, ''));
        }
        else {
          price = Number(input);
        }

        //@TODO(lzm): we can also config it.
        var precision = 6;
        // format float
        price = price.toFixed(precision);
        // trim suffix 0
        return Number(price);
      }
      else {
        return input;
      }
    };
  })

  /**
   * @ngdoc filter
   * @name list
   * @description
   * Returns a string from list elements.
   */
  .filter('list', function () {
    return function (input, split) {
      if (!(input instanceof Array)) {
        return input;
      }
      return input.join(split);
    };
  })

  /**
   * @ngdoc filter
   * @name keys
   * @description
   * Returns a list of keys of the object.
   */
  .filter('keys', function () {
    return function (input) {
      var keys = [];
      for(var i in input){
        keys.add(i);
      }
      return keys;
    };
    //var Map = function () {};
    //Map.prototype.keys = keys;
  })

    /**
   * @ngdoc filter
   * @name mb-gb
   * @description
   * Expects numeric value and suffixes translated 'MB' with spacing or GB.
   * Returns empty string if input is not a number or is null.
   */
  .filter('mb2gb', function () {
    return function (input) {
      var gb = 1024;

      if (isNaN(input) || null === input) {
        return '';
      } else if (input >= gb) {
        return interpolate(gettext("%s GB"), [parseFloat(Number(input / gb).toFixed(2))]);
      } else if (input === '') {
        return interpolate(gettext("0 MB"));
      } else {
        return interpolate(gettext("%s MB"), [input.toString()]);
      }
    };
  })
  /**
   * @ngdoc filter
   * @name unixToLocal
   * @description
   * transfor unix format timestamp to js Date object
   */
  .filter('utcToLocal', ['$rootScope', function (rootScope) {
    return function (input) {
      if (input) {
        input = input.replace(/T/g, ' ');
        input = input.replace(/Z/g, '');
        input = input.replace(/\+[0-9]{2}:[0-9]{2}/g, '');
        return rootScope.rootblock.utc_to_local(input);
      }
    };
  }])

  /**
   * @ngdoc filter
   * @name localToUtc
   * @description
   * transfor timestamp to utc string
   */
  .filter('unixToUtc', ['$rootScope', function (rootScope) {
    return function (input) {
      return rootScope.rootblock.unix_to_utc(input)
    };
  }])

  /**
  * @ngdoc filter
  * @name unixSecondsToUtc
  * @description
  * transfor timestamp to utc string
  */
  .filter('unixSecondsToUtc', ['$rootScope', function (rootScope) {
    return function (input) {
      return rootScope.rootblock.unix_to_utc(parseInt(input) * 1000)
    };
  }])

  /**
   * @ngdoc filter
   * @name transforToLocalTime
   * @description
   * transfor time to js Date object
   */
  .filter('transforToLocalTime', ['$rootScope', function (rootScope) {
    return function (input) {
      if (input) {
        input = input.replace(/T/g, ' ');
        input = input.replace(/Z/g, '');
        input = input.replace(/\+[0-9]{2}:[0-9]{2}/g, '');
        input = input.replace(/\.[0-9]{1,9}/g, '');
        return input;
      }
    };
  }])

    /**
   * @ngdoc filter
   * @name unixToLocal
   * @description
   * transfor timestamp to local string
   */
  .filter('unixToLocal', ['$rootScope', function (rootScope) {
    return function (input) {
      input = rootScope.rootblock.unix_to_utc(input);
      return rootScope.rootblock.utc_to_local(input);
    };
  }]);

}());
