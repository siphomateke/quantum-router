export default class i18n {
  static getMessage(key, ...args) {
    return chrome.i18n.getMessage(key, args);
  }
}
