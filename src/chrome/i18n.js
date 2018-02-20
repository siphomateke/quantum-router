export default class i18n {
  static getMessage(key, ...args) {
    return browser.i18n.getMessage(key, ...args);
  }
}
