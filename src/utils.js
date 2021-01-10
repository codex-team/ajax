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
   * Create an ephemeral input file field and return chosen files array
   *
   * @param {transportParams} config
   * @return {Promise<FileList>}
   */
  static selectFiles(config = {}) {
    return new Promise((resolve, reject) => {
      /**
       * Check cached INPUT element
       * If inputElement is null, create INPUT element cache
       */
      if (inputElement === null) {
        /**
         * Create a new INPUT element
         * @type {HTMLElement}
         */
        inputElement = document.createElement('INPUT');

        /**
         * Set a 'FILE' type for this input element
         * @type {string}
         */
        inputElement.type = 'file';

        /**
         * Do not show element
         */
        inputElement.style.display = 'none';

        /**
         * Append element to the body
         * Fix using module on mobile devices
         */
        document.body.appendChild(inputElement);

        /**
         * Create event handler for resolving files
         * @param {Event} event
         */
        const resolveFiles = event => {
          /**
           * Get files from input field
           */
          const files = event.target.files;

          /**
           * Return ready to be uploaded files array
           */
          resolve(files);

          /**
           * Remove event handler for preventing memory leak
           */
          inputElement.removeEventListener('change', resolveFiles);

          /**
           * Remove element from a DOM
           */
          document.body.removeChild(inputElement);

          /**
           * Remove input element
           */
          inputElement = null;
        };

        /**
         * Add onchange listener for «choose file» pop-up
         */
        inputElement.addEventListener('change', resolveFiles, false);
      }

      /**
       * Check "multiple" config
       */
      if (config.multiple) {
        /**
         * Check already to have "multiple" attribute with input element
         */
        if (!inputElement.hasAttribute('multiple')) {
          /**
           * Add "multiple" attribute to input element
           */
          inputElement.setAttribute('multiple', 'multiple');
        }
      } else {
        /**
         * Remove "multiple" attribute from input element
         */
        inputElement.removeAttribute('multiple');
      }

      /**
       * Check multiple "accept"
       */
      if (config.accept) {
        /**
         * Check already to have "accept" attribute with input element
         */
        if (!inputElement.hasAttribute('accept')) {
          /**
           * Add "accept" attribute to input element
           */
          inputElement.setAttribute('accept', config.accept);
        }
      } else {
        /**
         * Remove "multiple" attribute from input element
         */
        inputElement.removeAttribute('accept')
      }

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

/**
 * Cached input element for preventing memory leak
 * @type {HTMLInputElement}
 */
let inputElement = null;
