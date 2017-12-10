export class Notification {
  /**
   * @typedef NotificationData
   * @property {boolean} [read]
   * @property {string} title
   * @property {string} message
   * @property {('basic'|'sms')} [type='basic']
   * @property {number} [date]
   * @property {number} [progress]
   * @property {object} [metadata]
   */

  /**
   *
   * @param {NotificationData} data
   */
  constructor(data) {
    this.read = 'read' in data ? data.read : false;
    this.title = data.title;
    this.message = data.message;
    this.date = 'date' in data ? data.date : null;
    this.progress = data.progress;
    this.metadata = 'metadata' in data ? data.metadata : '';
    this.id = this.title + this.message + this.date + JSON.stringify(this.metadata);
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
      date: this.date,
      metadata: this.metadata,
    };
  }

  static fromJSON(json) {
    return new Notification(json);
  }
}
