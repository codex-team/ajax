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
    let dataParts = [];

    if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        const value = data[key];

        dataParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
    }

    return dataParts.join('&');
  }

  /**
   * Encode data to JSON string
   *
   * @param {any} data
   * @return {string}
   */
  static jsonEncode(data) {
    return JSON.stringify(data);
  }

  /**
   * Encode data to FormData object
   *
   * @param {object|FormData|Element} data
   * @return {FormData}
   */
  static formEncode(data) {
    /**
     * If data is a FormData object
     */
    if (Utils.isFormData(data)) {
      return data;
    }

    /**
     * If data is a FORM element
     */
    if (data instanceof HTMLElement && data.tagName === 'FORM') {
      return new FormData(data);
    }

    /**
     * If data is just an object
     */
    if (data instanceof Object && Object.keys(data).length) {
      let requestData = new FormData();

      Object.keys(data).forEach(keys => {
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
   * Check if variable is an instance of FormData
   *
   * @param {any} obj
   * @return {boolean}
   */
  static isFormData(obj) {
    return obj instanceof FormData;
  };

  /**
   * @typedef {object} transportParams
   * @property {string} accept
   * @property {boolean} multiple
   * @property {string} fieldName
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
};
