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
  let isFormData = function (object) {
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
  let call = function call(data) {
    if (!data || !data.url) return;

    let XMLHTTP = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP'),
        progressCallback = data.progress || null,
        successFunction = data.success || function () {},
        errorFunction = data.error || function () {},
        beforeFunction = data.before || null,
        afterFunction = data.after ? data.after.bind(null, data) : null;


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
      let result = beforeFunction(data);

      if (result === false) {
        return;
      }
    }

    XMLHTTP.open(data.type, data.url, data.async);

    /**
     * If data is not FormData then create FormData
     */
    if (!isFormData(data.data)) {
      let requestData = new FormData();

      for (let key in data.data) {
        requestData.append(key, data.data[key]);
      }

      data.data = requestData;
    }

    /**
     * Add progress listener
     */
    if (progressCallback && typeof progressCallback === 'function') {
      XMLHTTP.upload.addEventListener('progress', function (e) {
        let percentage = parseInt(e.loaded / e.total * 100);

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
        let responseText = XMLHTTP.responseText;

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
