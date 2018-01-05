class _UssdUtils {
  /**
   * Get's USSD options from a message string.
   * E.g
   * 1. WhatsApp pack
   * 2. Facebook pack
   * 3. Nightly bundle
   * @param {string} message
   * @return {string[]}
   */
  _getOptions(message) {
    let foundOptions = message.match(/(^.|\n.)+\. (.+)/gi);
    let options = {};
    if (foundOptions) {
      foundOptions.map((element) => {
        let regExp = /((^.|\n.)+)\. /;
        let match = regExp.exec(element);
        let key = match[1].replace(/\n/, '');
        options[key] = element.replace(/(^.|\n.)+\. /i, '');
      });
    }
    return options;
  }
  parse(message) {
    let options = this._getOptions(message);
    let content = message;
    if (options) {
      content = content.replace(/(^.|\n.)+\.((.|\n)+)/i, '');
    }
    return {
      content: content,
      options: options,
    };
  }
}

export default new _UssdUtils();
