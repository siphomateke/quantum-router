export class Notification {
  /**
   * @typedef NotificationOptions
   * @property {string} title
   * @property {string} message
   * @property {('basic'|'sms')} [type='basic']
   */

  /**
   *
   * @param {NotificationOptions} options
   */
  constructor(options) {
    this.read = false;
    this.title = options.title;
    this.message = options.message;
  }

  /**
   * Converts the notification to a JSON object
   * @return {object}
   */
  toJSON() {
    return {
      read: false,
      title: this.title,
      message: this.message,
    };
  }
}
