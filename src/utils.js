/**
 *
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

        dataParts.push(`${key}=${value}`);
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
    if (data instanceof Object) {
      let requestData = new FormData();

      for (let key in data) {
        const value = data[key];

        requestData.append(key, value);
      }

      console.log('data', data);
      console.log('requestData', requestData);

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
};
