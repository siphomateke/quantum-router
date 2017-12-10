export class Notification {
  /**
   * @typedef NotificationData
   * @property {boolean} [read]
   * @property {string} title
   * @property {string} message
   * @property {('basic'|'sms')} [type='basic']
   */

  /**
   *
   * @param {NotificationData} data
   */
  constructor(data) {
    this.read = 'read' in data ? data.read : false;
    this.title = data.title;
    this.message = data.message;
  }

  /**
   * Converts the notification to a JSON object
   * @return {object}
   */
  toJSON() {
    return {
      read: this.read,
      title: this.title,
      message: this.message,
    };
  }

  static fromJSON(json) {
    return new Notification(json);
  }
}
