'use strict';

const utils = require('./utils');

/**
 * @typedef {object} requestParams
 * @property {string} url
 * @property {string} [type]
 * @property {string|null} [method]
 * @property {object|FormData|null} [data]
 * @property {object} [headers]
 * @property {function|null} [progress]
 */

/**
 * AJAX module
 */
module.exports = (() => {
  /**
   * @type {{urlencoded: string, form: string, json: string}}
   */
  const contentType = {
    urlencoded: 'application/x-www-form-urlencoded',
    form: 'multipart/form-data',
    json: 'application/json'
  };

  /**
   * @public
   * Main request function with all configurable params
   *
   * @param {requestParams} params
   * @return {Promise<object|string>}
   */
  const request = (params) => {
    return new Promise((resolve, reject) => {
      /**
       * Validate request params
       */
      params = validate(params);

      /**
       * Create a new request object
       *
       * @type {XMLHttpRequest}
       */
      let XMLHTTP = window.XMLHttpRequest ? new window.XMLHttpRequest () : new window.ActiveXObject('Microsoft.XMLHTTP');

      /**
       * Prepare ajax request
       */
      XMLHTTP.open(params.method, params.url);

      /**
       * Add default X-Requested-With header to identify ajax-request on the backend-side
       */
      XMLHTTP.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      /**
       * Add custom headers
       */
      for (let headerName in params.headers) {
        const headerValue = params.headers[headerName];

        XMLHTTP.setRequestHeader(headerName, headerValue);
      }

      /**
       * Add progress listener
       */
      XMLHTTP.upload.addEventListener('progress', event => {
        const percentage = parseInt(event.loaded / event.total * 100);

        // console.log('uploaded percentage', percentage);

        console.log(percentage, event.loaded, event.total);

        // params.progress(percentage, event.loaded, event.total);
      }, false);

      /** Download progress */
      XMLHTTP.addEventListener('progress', event => {
        const percentage = parseInt(event.loaded / event.total * 100);

        // console.log('downloaded percentage', percentage);

        console.log(percentage, event.loaded, event.total);

        // params.progress(percentage, event.loaded, event.total);
      }, false);

      /**
       * Change state listener
       */
      XMLHTTP.onreadystatechange = () => {
        /**
         * XMLHTTP.readyState
         * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
         *
         * 0    UNSENT              Client has been created. open() not called yet.
         * 1    OPENED              open() has been called.
         * 2    HEADERS_RECEIVED    send() has been called, and headers and status are available.
         * 3    LOADING             Downloading; responseText holds partial params.
         * 4    DONE                The operation is complete.
         */
        if (XMLHTTP.readyState === 4) {
          /**
           * Get a response string
           *
           * @type {string}
           */
          let response = XMLHTTP.response;

          /**
           * Try to parse response as a JSON
           */
          try {
            response = JSON.parse(response);
          } catch (e) {}

          /**
           * Check for a response code
           */
          if (XMLHTTP.status === 200) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      };

      /**
       * Send a request
       */
      XMLHTTP.send(params.data);
    });
  };

  /**
   * @public
   * Send a GET request
   *
   * @param {requestParams} params
   * @return {Promise<Object|string>}
   */
  const get = (params) => {
    params = validate(params);

    /**
     * @type {string}
     */
    const covertedData = convertData(params.data, contentType.urlencoded);

    /**
     * Add converted data to url
     * @type {string}
     */
    params.url = /\?/.test(params.url) ? params.url + '&' + covertedData : params.url + '?' + covertedData;

    return request({
      url: params.url,
      method: 'GET',
      headers: params.headers,
    });
  };

  /**
   * @public
   * Send a POST request
   *
   * @param {requestParams} params
   * @return {Promise<Object|string>}
   */
  const post = (params) => {
    params = validate(params);

    /**
     * Get type of data to be converted
     * @type {string}
     */
    const dataType = getContentType(params);

    /**
     * @type {string|FormData|any}
     */
    const covertedData = convertData(params.data, dataType);

    /**
     * We no need to add custom this header for FormData
     * It will be generated automatically
     */
    if (dataType !== ajax.contentType.form) {
      params.headers['content-type'] = dataType;
    }

    return request({
      url: params.url,
      method: 'POST',
      data: covertedData,
      headers: params.headers,
    });
  };

  /**
   * @private
   * Check params for validness and set default params if they are missing
   *
   * @todo this function
   *
   * @param {requestParams} params
   */
  const validate = (params) => {
    if (!params.url || typeof params.url !== 'string') {
      throw new Error('Url is missing');
    }

    params.method = params.method || 'GET';

    params.headers = params.headers || {};


    if (params.progress && typeof params.progress !== 'function') {
      throw new Error('`progress` must be a function or null');
    }

    params.progress = params.progress || (() => {});

    return params;
  };

  /**
   * @private
   * Get type from request params
   *
   * @param {requestParams} params
   * @return {string}
   */
  const getContentType = (params = {}) => {
    return params.type || contentType.urlencoded;
  };

  /**
   * @private
   * Convert data according passed content-type
   *
   * @param {object|FormData|HTMLElement} data
   * @param {string} type - content type value {@see contentType}
   * @return {string|FormData|any}
   */
  const convertData = (data = {}, type) => {
    switch (type) {
      case contentType.urlencoded:
        return utils.urlEncode(data);
      case contentType.json:
        return utils.jsonEncode(data);
      case contentType.form:
        return utils.formEncode(data);
      default:
        return data;
    }
  };

  return {
    /** Provide available content types for POST requests*/
    contentType,

    /** Main ajax function */
    request,

    /** GET request */
    get,
    /** POST request */
    post
  };
})();


