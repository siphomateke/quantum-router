import router from 'huawei-router-api/browser';
import moment from 'moment';

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

  static fromSms(sms) {
    const parsed = router.sms.parse(sms.Content);

    let progress = null;
    if ('percent' in parsed
    && parsed.percent.length > 0
    && parsed.type === router.sms.types.DATA_PERCENT) {
      progress = parsed.percent[0] / 100;
    }

    let message = '';
    switch (parsed.type) {
    case router.sms.types.AD:
      message = '[[ ADVERTISEMENT  ]]';
      break;
    case router.sms.types.DATA:
      message = 'You have '
      + parsed.data[0].amount + parsed.data[0].unit
      + ' valid until ' + moment(parsed.expires[0]).format('Y-M-D HH:mm:ss');
      break;
    default:
      message = sms.Content;
    }

    return new Notification({
      title: 'SMS from '+sms.Phone,
      message: message,
      date: Date.parse(sms.Date),
      read: parseInt(sms.Smstat) === 1,
      progress: progress,
      metadata: parsed,
    });
  }
}
