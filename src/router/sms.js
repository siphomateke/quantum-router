'use strict';
import moment from 'moment';
import ajax from './ajax';

/**
 * @enum {string}
 */
export let types = {
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
export let boxTypes = {
  INBOX: 1,
  SENT: 2,
  DRAFT: 3,
};

export default {
  types: types,
  boxTypes: boxTypes,
  _arrayMatch(message, regExpMatch, mapFunc) {
    let data = message.match(regExpMatch);
    if (data) {
      return data.map(mapFunc);
    } else {
      return [];
    }
  },
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
  },
  _getExpiryDate(message) {
    return this._arrayMatch(
      message, /(\d+)-(\d+)-(\d+) (\d{2}):(\d{2}):(\d{2})/g, (date) => {
        return moment(date);
      });
  },
  _getMoney(message) {
    return this._arrayMatch(
      message, /(\d*)(\.*)(\d*)( *)kwacha/gi, (element) => {
        return parseFloat(element.replace(/( *)kwacha/i, ''));
      });
  },

  _getPercent(message) {
    return this._arrayMatch(message, /\d+%/gi, (element) => {
      return parseFloat(element.replace(/%/, ''));
    });
  },

  /**
   *
   * @param {object} info
   * @param {string} message
   * @return {types}
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
      return types.RECHARGE;
    }
    if (info.data.length > 0) {
      if (info.expires.length > 0) {
        return types.DATA;
      }
      if (ml.search(/\d+%/) > 0) {
        return types.DATA_PERCENT;
      }
    }
    if (ml.includes('activated') && ml.includes('bundle')) {
      return types.ACTIVATED;
    }
    if (ml.includes('depleted') && ml.includes('bundle')) {
      return types.DEPLETED;
    }
    return types.AD;
  },
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
  },

  // Separate

  /**
   * @typedef SmsConfig
   * @property {number} cbsenable
   * @property {number} cdma_enabled
   * @property {number} enable
   * @property {number} getcontactenable
   * @property {number} import_enabled
   * @property {number} localmax
   * @property {number} maxphone
   * @property {number} pagesize
   * @property {number} session_sms_enabled
   * @property {number} sms_center_enabled
   * @property {number} sms_priority_enabled
   * @property {number} sms_validity_enabled
   * @property {number} smscharlang
   * @property {number} smscharmap
   * @property {number} smsfulltype
   * @property {number} url_enabled
   * @property {number} validity
   */

  /**
   * Get's SMS configuration
   * @return {Promise<SmsConfig>}
   */
  getSmsConfig() {
    return ajax.getAjaxDataDirect({
      url: 'config/sms/config.xml',
    });
  },

  /**
   * @typedef SmsCount
   * @property {number} LocalUnread
   * @property {number} LocalInbox
   * @property {number} LocalOutbox
   * @property {number} LocalDraft
   * @property {number} LocalDeleted
   * @property {number} SimUnread
   * @property {number} SimInbox
   * @property {number} SimOutbox
   * @property {number} SimDraft
   * @property {number} LocalMax
   * @property {number} SimMax
   * @property {number} SimUsed
   * @property {number} NewMsg
   */

  /**
   * Gets the number of read and unread messages
   * @return {Promise<SmsCount>}
   */
  async getSmsCount() {
    return ajax.getAjaxDataDirect({url: 'api/sms/sms-count'});
  },

  /**
   * @typedef Message
   * @property {number} Smstat Whether the message is read or not
   * @property {number} Index
   * @property {string|number} Phone The phone number from which the SMS was sent
   * @property {string} Content The actual content of the SMS
   * @property {string} Date The date the SMS was received
   * @property {*} Sca
   * @property {number} SaveType
   * @property {number} Priority
   * @property {number} SmsType
   */

  // TODO: Fix SmsBoxTypes JSDoc
  /**
   * @typedef SmsListOptions
   * @property {number} [page=1]
   * @property {number} [perPage=20]
   * @property {SmsBoxTypes} [boxType=1] Which box to retreive. Can be Inbox(1), sent(2) or draft(3)
   * @property {('desc'|'asc')} [sortOrder=desc]
  */

  /**
   * Get's the list of SMSs from the router
   * @param {SmsListOptions} options Options
   * @return {Promise<Message[]>}
   */
  getSmsList(options) {
    options = Object.assign({
      page: 1,
      perPage: 20,
      boxType: 1,
      sortOrder: 'desc',
    }, options);
    return ajax.saveAjaxData({
      url: 'api/sms/sms-list',
      request: {
        PageIndex: options.page,
        ReadCount: options.perPage,
        BoxType: options.boxType,
        SortType: 0,
        Ascending: options.sortOrder === 'desc' ? 0 : 1,
        UnreadPreferred: 0,
      },
    }).then((_data) => {
      if (_data.Count > 0) {
        return _data.Messages.Message;
      } else {
        return [];
      }
    });
  },

  /**
   *
   * @param {FullSmsListOptions} options
   * @param {Message[]} list
   * @return {Message[]}
   */
  _filterSmsList(options, list) {
    let filteredList = [];
    for (let message of list) {
      if (options.minDate) {
        if (Date.parse(message.Date) > options.minDate) {
          filteredList.push(message);
        }
      } else {
        filteredList.push(message);
      }
    }
    return filteredList;
  },

  /**
   *
   * @param {FullSmsListOptions} options
   * @param {SmsListOptions} smsListOptions
   * @param {number} perPage
   * @param {number} total
   * @param {number} [page=1]
   * @param {Message[]} list
   * @return {Promise<Message[]>}
   */
  _getFullSmsListRecursive(
    options, smsListOptions, perPage, total, page=1, list) {
    smsListOptions.perPage = perPage;
    smsListOptions.page = page;
    return this.getSmsList(smsListOptions).then((currentList) => {
      page++;
      let filteredList = this._filterSmsList(options, currentList);
      // Add all messages to list
      if (!list) {
        list = filteredList;
      } else {
        list = list.concat(filteredList);
      }
      // If we have not reached the end of the messages
      if (((page - 1) * perPage) < total) {
        return this._getFullSmsListRecursive(
          options, smsListOptions, perPage, total, page, list);
      } else {
        return list;
      }
    });
  },

  /**
   * @typedef FullSmsListOptions
   * @property {number} total
   * @property {number} [minDate]
   */

  /**
   *
   * @param {FullSmsListOptions} options
   * @param {SmsListOptions} [smsListOptions]
   * @return {Promise<Message[]>}
   */
  getFullSmsList(options, smsListOptions={}) {
    smsListOptions = Object.assign({
      sortOrder: 'desc',
    }, smsListOptions);

    options = Object.assign({
      total: 0,
    }, options);

    if (options.total > 0) {
      return this.getSmsConfig().then((smsConfig) => {
        return this._getFullSmsListRecursive(
          options, smsListOptions, smsConfig.pagesize, options.total
        ).then((list) => {
          return list;
        });
      });
    } else {
      return Promise.resolve([]);
    }
  },

  /**
   *
   * @param {number} idx The index of the SMS
   * @return {Promise<Boolean>}
   */
  setSmsAsRead(idx) {
    return ajax.saveAjaxData({
      url: 'api/sms/set-read',
      request: {
        Index: idx,
      },
      responseMustBeOk: true,
    });
  },

  createSmsRequest(options) {
    options = Object.assign({
      smsIndex: -1,
      numbers: [],
      content: '',
    }, options);

    return {
      Index: options.smsIndex,
      Phones: {
        Phone: options.numbers,
      },
      Sca: '',
      Content: options.content,
      Length: options.content.length,
      // TODO: Add different text modes
      // SMS_TEXT_MODE_UCS2 = 0
      // SMS_TEXT_MODE_7BIT = 1
      // SMS_TEXT_MODE_8BIT = 2
      Reserved: 1,
      Date: moment(Date.now()).format('Y-M-D H:mm:ss'),
    };
  },

  /**
   * @typedef SaveSmsOptions
   * @property {number} smsIndex The index of the SMS. Only used for sending drafts
   * @property {string[]} numbers An array of numbers to send the sms to
   * @property {string} content The SMS body
   */

  /**
   * Sends an sms or saves a draft
   * @param {SaveSmsOptions} options
   * @return {Promise<boolean>}
   */
  saveSms(options) {
    return ajax.saveAjaxData({
      url: 'api/sms/save-sms',
      request: this.createSmsRequest(options),
      responseMustBeOk: true,
    });
  },

  /**
   * @typedef SmsSendStatus
   * @property {string} TotalCount
   * @property {string} CurIndex
   * @property {string} Phone
   * @property {string} SucPhone
   * @property {string} FailPhone
   */

  /**
   * @return {Promise<SmsSendStatus>}
   */
  getSmsSendStatus() {
    return ajax.getAjaxDataDirect({
      url: 'api/sms/send-status',
    });
  },

  /**
   * @typedef SendSmsOptions
   * @property {string[]} numbers An array of numbers to send the sms to
   * @property {string} content The SMS body
   */

  /**
   * @param {SendSmsOptions} options
   * @return {Promise<SmsSendStatus>}
   */
  sendSms(options) {
    return ajax.saveAjaxData({
      url: 'api/sms/send-sms',
      request: this.createSmsRequest(options),
    }).then(() => {
      return this.getSmsSendStatus();
    });
  },

  /**
   * Delete's all messages with the given indices
   * @param {number[]} indices An array of indices of messages
   * @return {Promise<any>}
   */
  deleteSms(indices) {
    let request = indices.map((i) => {
      return {Index: i};
    });
    return ajax.saveAjaxData({
      url: 'api/sms/delete-sms',
      request: request,
      responseMustBeOk: true,
    });
  },
};
