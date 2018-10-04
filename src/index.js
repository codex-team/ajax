'use strict';

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
    json: 'application/json; charset=utf-8'
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
      for (let headerName in params.headers) {
        const headerValue = params.headers[headerName];

        XMLHTTP.setRequestHeader(headerName, headerValue);
      }

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
      const percentageForUploading = params.ratio || 90;

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
  const get = (params) => {
    /**
     * Check passed params object
     * @type {requestParams}
     */
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
      progress: params.progress,
      ratio: params.ratio
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
    /**
     * Check passed params object
     * @type {requestParams}
     */
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
      progress: params.progress,
      ratio: params.ratio
    });
  };

  /**
   * @public
   * Upload user-chosen files via POST request
   *
   * @param {requestParams} params
   * @return {Promise<object|string>}
   */
  const transport = (params) => {
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
          for (let key in params.data) {
            const value = params.data[key];

            formData.append(key, value);
          }
        }

        /**
         * Send POST request
         */
        return post({
          url: '/',
          type: contentType.form,
          data: formData,
          headers: params.headers,
          progress: params.progress,
          ratio: params.ratio
        });
      })
  };

  /**
   * @private
   * Check params for validness and set default params if they are missing
   *
   * @param {requestParams} params
   * @return {requestParams}
   */
  const validate = (params) => {
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
    if (params.type && typeof params.type !== 'string') {
      let wasFound = false;

      for (const type in contentType) {
        if (contentType[type] === params.type) {
          wasFound = true;
        }
      }

      if (!wasFound) {
        throw new Error('`type` must be taken from module\'s «contentType» library');
      }
    }

    /**
     * Check 'progress'
     */
    if (params.progress && typeof params.progress !== 'function') {
      throw new Error('`progress` must be a function or null');
    }

    params.progress = params.progress || (() => {});

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


