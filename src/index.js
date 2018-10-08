'use strict';

require('./polyfills');

/**
 * Helpers functions
 * @type {module.Utils}
 */
const utils = require('./utils');

/**
 * @typedef {object} requestParams
 * @property {string} url
 * @property {string} [type]
 * @property {string|null} [method]
 * @property {object|FormData|null} [data]
 * @property {object} [headers]
 * @property {function|null} [progress]
 * @property {number} [ratio=90]
 * @property {string} [accept=null]
 * @property {boolean} [multiple=false]
 * @property {string} [fieldName='files']
 * @property {HTMLElement} [form]
 */

/**
 * AJAX module
 */
module.exports = (() => {
  /**
   * List of available values for 'Content-Type' header for POST requests
   */
  const contentType = {
    URLENCODED: 'application/x-www-form-urlencoded; charset=utf-8',
    FORM: 'multipart/form-data',
    JSON: 'application/json; charset=utf-8'
  };

  /**
   * @public
   * Main request function with all configurable params
   *
   * @param {requestParams} params
   * @return {Promise<object|string>}
   */
  const request = function request(params) {
    return new Promise((resolve, reject) => {
      /**
       * Check passed params object
       * @type {requestParams}
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
      Object.keys(params.headers).forEach(headerName => {
        const headerValue = params.headers[headerName];

        XMLHTTP.setRequestHeader(headerName, headerValue);
      });

      /**
       * A max number of percentages to be used to uploading
       * The rest — for response downloading
       *
       * @example percentageForUploading = 80
       * Progress bar will be filled for 80% when all data has been sent
       * For server response we have 20% of bar
       *
       * [############ 80% ############    20%   ]
       *             upload             download
       *
       * @type {number}
       */
      const percentageForUploading = params.ratio;

      /**
       * Add progress listener
       */
      XMLHTTP.upload.addEventListener('progress', event => {
        const percentage = Math.round(event.loaded / event.total * 100);

        /**
         * Recalculate percentage according progress bar ratio
         * @type {number}
         */
        const recountedPercentage = Math.ceil(percentage * percentageForUploading / 100);

        params.progress(recountedPercentage);
      }, false);

      /**
       * Download progress
       */
      XMLHTTP.addEventListener('progress', event => {
        const percentage = Math.round(event.loaded / event.total * 100);

        /**
         * Recalculate percentage according progress bar ratio
         * @type {number}
         */
        const recountedPercentage = Math.ceil(percentage * (100 - percentageForUploading) / 100) + percentageForUploading;

        params.progress(recountedPercentage);
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
  const get = function get(params) {
    /**
     * Check passed params object
     * @type {requestParams}
     */
    params = validate(params);

    /**
     * Set up method
     * @type {string}
     */
    params.method = 'GET';

    /**
     * @type {string}
     */
    const covertedData = convertData(params.data, contentType.URLENCODED);

    /**
     * Remove this field because data will be stored in URL
     */
    delete params.data;

    /**
     * Add converted data to url
     * @type {string}
     */
    params.url = /\?/.test(params.url) ? params.url + '&' + covertedData : params.url + '?' + covertedData;

    return request(params);
  };

  /**
   * @public
   * Send a POST request
   *
   * @param {requestParams} params
   * @return {Promise<Object|string>}
   */
  const post = function post(params) {
    /**
     * Check passed params object
     * @type {requestParams}
     */
    params = validate(params);

    /**
     * Set up method
     * @type {string}
     */
    params.method = 'POST';

    /**
     * Get type of data to be converted
     * @type {string}
     */
    let dataType = getContentType(params);

    /**
     * If passed data is a form element or form data then change dataType
     */
    if (utils.isFormData(params.data) || utils.isFormElement(params.data)) {
      dataType = contentType.FORM;
    }

    /**
     * Convert data object according content type
     * @type {object|FormData}
     */
    params.data = convertData(params.data, dataType);

    /**
     * We no need to add custom this header for FormData
     * It will be generated automatically
     */
    if (dataType !== ajax.contentType.FORM) {
      params.headers['content-type'] = dataType;
    }

    return request(params);
  };

  /**
   * @public
   * Upload user-chosen files via POST request
   *
   * @param {requestParams} params
   * @return {Promise<object|string>}
   */
  const transport = function transport(params) {
    /**
     * Check passed params object
     * @type {requestParams}
     */
    params = validate(params);

    return utils.transport(params)
      .then(formData => {
        /**
         * Append additional data
         */
        if (params.data) {
          Object.keys(params.data).forEach(key => {
            const value = params.data[key];

            formData.append(key, value);
          });
        }

        /**
         * Save formData composed object to data field
         * @type {FormData}
         */
        params.data = formData;

        /**
         * Set content type
         * @type {string}
         */
        params.type = contentType.FORM;

        /**
         * Send POST request
         */
        return post(params);
      })
  };

  /**
   * @private
   * Check params for validness and set default params if they are missing
   *
   * @param {requestParams} params
   * @return {requestParams}
   */
  const validate = function validate(params) {
    if (!params.url || typeof params.url !== 'string') {
      throw new Error('Url must be a non-empty string');
    }

    /**
     * Check 'method'
     * @type {string|string}
     */
    if (params.method && typeof params.method !== 'string') {
      throw new Error('`method` must be a string or null');
    }

    params.method = params.method || 'GET';

    /**
     * Check 'headers'
     */
    if (params.headers && typeof params.headers !== 'object') {
      throw new Error('`headers` must be an object or null');
    }

    params.headers = params.headers || {};

    /**
     * Check 'type'
     */
    if (params.type && (typeof params.type !== 'string' || !Object.values(contentType).includes(params.type))) {
      throw new Error('`type` must be taken from module\'s «contentType» library');
    }

    /**
     * Check 'progress'
     */
    if (params.progress && typeof params.progress !== 'function') {
      throw new Error('`progress` must be a function or null');
    }

    params.progress = params.progress || ((percentage) => {});

    /**
     * Check 'ratio'
     */
    if (params.ratio && typeof params.ratio !== 'number') {
      throw new Error('`ratio` must be a number');
    }

    if (params.ratio < 0 || params.ratio > 100) {
      throw new Error('`ratio` must be in a 0-100 interval');
    }

    params.ratio = params.ratio || 90;

    /**
     * Check 'accept'
     */
    if (params.accept && typeof params.accept !== 'string') {
      throw new Error('`accept` must be a string with a list of allowed mime-types');
    }

    params.accept = params.accept || '*/*';

    /**
     * Check 'multiple'
     */
    if (params.multiple && typeof params.multiple !== 'boolean') {
      throw new Error('`multiple` must be a true or false');
    }

    params.multiple = params.multiple || false;

    /**
     * Check 'fieldName'
     */
    if (params.fieldName && typeof params.fieldName !== 'string') {
      throw new Error('`fieldName` must be a string');
    }

    params.fieldName = params.fieldName || 'files';

    /**
     * Return validated params
     */
    return params;
  };

  /**
   * @private
   * Get type from request params
   *
   * @param {requestParams} params
   * @return {string}
   */
  const getContentType = function getContentType(params = {}) {
    return params.type || contentType.JSON;
  };

  /**
   * @private
   * Convert data according passed content-type
   *
   * @param {object|FormData|HTMLElement} data
   * @param {string} type - content type value {@see contentType}
   * @return {string|FormData|*}
   */
  const convertData = function convertData(data = {}, type) {
    switch (type) {
      case contentType.URLENCODED:
        return utils.urlEncode(data);
      case contentType.JSON:
        return utils.jsonEncode(data);
      case contentType.FORM:
        return utils.formEncode(data);
      default:
        return data;
    }
  };

  return {
    /** Provide available content types for POST requests */
    contentType,

    /** Main ajax function */
    request,

    /** GET request */
    get,
    /** POST request */
    post,

    /** Upload user-chosen files via POST request */
    transport
  };
})();
