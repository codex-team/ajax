/**
 * JS implementation of PHP's http_build_query()
 * @see https://github.com/vladzadvorny/http-build-query
 * @type {httpBuildQuery}
 */
const httpBuildQuery = require('http-build-query');

/**
 * Helpers functions
 */
module.exports = class Utils {
  /**
   * Encode data object to urlencoded string
   * {name: 'taly', id: 2} -> "name=taly&id=2"
   *
   * @param {object} data
   * @return {string}
   */
  static urlEncode(data) {
    return httpBuildQuery(data);
  }

  /**
   * Encode data to JSON string
   *
   * @param {*} data
   * @return {string}
   */
  static jsonEncode(data) {
    return JSON.stringify(data);
  }

  /**
   * Encode data to FormData object
   *
   * @param {object|FormData|HTMLElement} data
   * @return {FormData}
   */
  static formEncode(data) {
    /**
     * If data is a FormData object
     */
    if (this.isFormData(data)) {
      return data;
    }

    /**
     * If data is a FORM element
     */
    if (this.isFormElement(data)) {
      return new FormData(data);
    }

    /**
     * If data is just an object
     */
    if (this.isObject(data)) {
      let requestData = new FormData();

      Object.keys(data).forEach(key => {
        const value = data[key];

        requestData.append(key, value);
      });

      return requestData;
    }

    /**
     * Otherwise throw an error
     */
    throw new Error('`data` must be an instance of Object, FormData or <FORM> HTMLElement');
  }

  /**
   * Check if variable is an Object
   *
   * @param {*} obj
   * @return {boolean}
   */
  static isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  /**
   * Check if variable is an instance of FormData
   *
   * @param {*} obj
   * @return {boolean}
   */
  static isFormData(obj) {
    return obj instanceof FormData;
  };

  /**
   * Check if variable is a HTMLFormElement
   *
   * @param {*} obj
   * @return {boolean}
   */
  static isFormElement(obj) {
    return obj instanceof HTMLFormElement;
  }

  /**
   * @typedef {object} transportParams
   * @property {string} accept
   * @property {boolean} multiple
   * @property {string} fieldName
   * @property {function} beforeSend
   */

  /**
   * Create an ephemeral input file field and return FormData object with files
   *
   * @param {transportParams} config
   * @return {Promise<FormData>}
   */
  static transport(config) {
    return new Promise((resolve, reject) => {
      /**
       * Create a new INPUT element
       * @type {HTMLElement}
       */
      let inputElement = document.createElement('INPUT');

      /**
       * Set a 'FILE' type for this input element
       * @type {string}
       */
      inputElement.type = 'file';

      if (config.multiple) {
        inputElement.setAttribute('multiple', 'multiple');
      }

      if (config.accept) {
        inputElement.setAttribute('accept', config.accept);
      }

      /**
       * Add onchange listener for «choose file» pop-up
       */
      inputElement.addEventListener('change', (event) => {
        /**
         * Get files from input field
         */
        const files = event.target.files;

        /**
         * Create a FormData object
         * @type {FormData}
         */
        let formData = new FormData();

        /**
         * Append files to FormData
         */
        for (let i = 0; i < files.length; i++) {
          formData.append(config.fieldName, files[i], files[i].name);
        }

        /**
         * Fire beforeSend callback on changed files field
         */
        config.beforeSend(files);

        /**
         * Return ready to be uploaded FormData object
         */
        resolve(formData);
      }, false);

      /**
       * Fire click event on «input file» field
       */
      inputElement.click();
    });
  };

  /**
   * Parse string of headers
   *
   * From
   *   "cache-control: public, max-age=14400
   *   content-type: application/json; charset=utf-8
   *   ..."
   *
   * To
   *   {
   *     cache-control: "public, max-age=14400",
   *     content-type: "application/json; charset=utf-8",
   *     ...
   *   }
   *
   * @param {string} headersString
   * @return {object}
   */
  static parseHeaders(headersString) {
    /**
     * Convert the header string into an array of individual headers
     * Split by line breaks
     */
    let headersArray = headersString.trim().split(/[\r\n]+/);

    /**
     * Create a map of header names to values
     */
    let headerMap = {};

    headersArray.forEach(function (line) {
      /**
       * Split header string by ": "
       * @type {string[]}
       */
      const parts = line.split(': ');

      /**
       * Get the first chunk of splitted string from array
       * @type {string | undefined}
       */
      const header = parts.shift();

      /**
       * Join all chunks left in an array by separator
       * @type {string}
       */
      const value = parts.join(': ');

      if (header) {
        headerMap[header] = value;
      }
    });

    return headerMap;
  }
};
