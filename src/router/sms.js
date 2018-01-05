import moment from 'moment';

/**
 * @enum {string}
 */
export let SmsTypes = {
  RECHARGE: 'RECHARGE',
  DATA: 'DATA',
  DATA_PERCENT: 'DATA_PERCENT',
  ACTIVATED: 'ACTIVATED',
  DEPLETED: 'DEPLETED',
  AD: 'AD',
};

/**
 * @enum {number}
 */
export let SmsBoxTypes = {
  INBOX: 1,
  SENT: 2,
  DRAFT: 3,
};

class _SmsUtils {
  _arrayMatch(message, regExpMatch, mapFunc) {
    let data = message.match(regExpMatch);
    if (data) {
      return data.map(mapFunc);
    } else {
      return [];
    }
  }
  /**
   * @typedef SmsDataUsage
   * @property {number} amount
   * @property {string} unit
   */
  /**
   * Get's data usage strings in the message
   * @param {string} message
   * @return {SmsDataUsage[]}
   */
  _getDataUsage(message) {
    return this._arrayMatch(message, /(\d*)(\.*)(\d*)( *)mb/gi, (element) => {
      return {
        amount: parseFloat(element.replace(/( *)mb/i, '')),
        unit: 'MB',
      };
    });
  }
  _getExpiryDate(message) {
    return this._arrayMatch(message, /(\d+)-(\d+)-(\d+) (\d{2}):(\d{2}):(\d{2})/g, (date) => {
      return moment(date);
    });
  }
  _getMoney(message) {
    return this._arrayMatch(message, /(\d*)(\.*)(\d*)( *)kwacha/gi, (element) => {
      return parseFloat(element.replace(/( *)kwacha/i, ''));
    });
  }

  _getPercent(message) {
    return this._arrayMatch(message, /\d+%/gi, (element) => {
      return parseFloat(element.replace(/%/, ''));
    });
  }

  /**
   *
   * @param {object} info
   * @param {string} message
   * @return {SmsTypes}
   */
  _getType(info, message) {
    let adPhrases = [
      'spaka',
      'bonus',
      'congratulations',
      'songs', 'tunes', 'music',
      'subscribe',
      'enjoy',
      'watch tv', 'mtn tv plus', 'mtn tv+',
      'download',
      'call across all networks',
      'youtube',
      'borrow',
      'laugh',
      'app',
      'sport',
    ];
    let count = 0;
    for (let phrase of adPhrases) {
      if (message.toLowerCase().search(phrase) > -1) {
        count++;
      }
    }
    let ml = message.toLowerCase();
    if (info.money.length >= 2 && ml.includes('recharged') && ml.includes('balance')) {
      return SmsTypes.RECHARGE;
    }
    if (info.data.length > 0) {
      if (info.expires.length > 0) {
        return SmsTypes.DATA;
      }
      if (ml.search(/\d+%/) > 0) {
        return SmsTypes.DATA_PERCENT;
      }
    }
    if (ml.includes('activated') && ml.includes('bundle')) {
      return SmsTypes.ACTIVATED;
    }
    if (ml.includes('depleted') && ml.includes('bundle')) {
      return SmsTypes.DEPLETED;
    }
    return SmsTypes.AD;
  }
  parse(message) {
    let info = {
      data: this._getDataUsage(message),
      expires: this._getExpiryDate(message),
      money: this._getMoney(message),
      percent: this._getPercent(message),
    };

    return Object.assign(info, {
      type: this._getType(info, message),
    });
  }
}

export let SmsUtils = new _SmsUtils();
