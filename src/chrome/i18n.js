export default class i18n {
  static getMessage(key) {
    return chrome.i18n.getMessage(key);
  }
}
