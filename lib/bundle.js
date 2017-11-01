(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ajax"] = factory();
	else
		root["ajax"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * AJAX module
 */
module.exports = function () {
  'use strict';

  /**
   * Function for checking is it FormData object to send.
   *
   * @param {Object} object to check
   * @return boolean
   */

  var isFormData = function isFormData(object) {
    return object instanceof FormData;
  };

  /**
   * Call AJAX request function
   *
   * @param {Object} data
   * @param {String} data.type          'GET' or 'POST' request type
   * @param {String} data.url           request url
   * @param {String} data.data          data to send
   * @param {Function} data.before      call this function before request
   * @param {Function} data.progress    callback function for progress
   * @param {Function} data.success     success function
   * @param {Function} data.error       error function
   * @param {Function} data.atfer       call this function after request
   */
  var call = function call(data) {
    if (!data || !data.url) return;

    var XMLHTTP = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP'),
        progressCallback = data.progress || null,
        successFunction = data.success || function () {},
        errorFunction = data.error || function () {},
        beforeFunction = data.before || null,
        afterFunction = data.after || null;

    data.async = true;
    data.type = data.type || 'GET';
    data.data = data.data || '';
    data['content-type'] = data['content-type'] || 'application/json; charset=utf-8';

    if (data.type === 'GET' && data.data) {
      data.url = /\?/.test(data.url) ? data.url + '&' + data.data : data.url + '?' + data.data;
    }

    if (data.withCredentials) {
      XMLHTTP.withCredentials = true;
    }

    if (beforeFunction && typeof beforeFunction === 'function') {
      beforeFunction();
    }

    XMLHTTP.open(data.type, data.url, data.async);

    /**
     * If data is not FormData then create FormData
     */
    if (!isFormData(data.data)) {
      var requestData = new FormData();

      for (var key in data.data) {
        requestData.append(key, data.data[key]);
      }

      data.data = requestData;
    }

    /**
     * Add progress listener
     */
    if (progressCallback && typeof progressCallback === 'function') {
      XMLHTTP.upload.addEventListener('progress', function (e) {
        var percentage = parseInt(e.loaded / e.total * 100);

        progressCallback(percentage);
      }, false);
    }

    XMLHTTP.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    XMLHTTP.onreadystatechange = function () {
      /**
       * XMLHTTP.readyState
       * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
       *
       * 0    UNSENT              Client has been created. open() not called yet.
       * 1    OPENED              open() has been called.
       * 2    HEADERS_RECEIVED    send() has been called, and headers and status are available.
       * 3    LOADING             Downloading; responseText holds partial data.
       * 4    DONE                The operation is complete.
       */
      if (XMLHTTP.readyState === 4) {
        var responseText = XMLHTTP.responseText;

        try {
          responseText = JSON.parse(responseText);
        } catch (e) {
          // Oh well, but whatever...
        }

        if (XMLHTTP.status === 200) {
          successFunction(responseText);
        } else {
          errorFunction(responseText);
        }

        if (afterFunction && typeof afterFunction === 'function') {
          afterFunction();
        }
      }
    };

    XMLHTTP.send(data.data);
  };

  return {
    call: call
  };
}();

/***/ })
/******/ ]);
});
//# sourceMappingURL=bundle.js.map