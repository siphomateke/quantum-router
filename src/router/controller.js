'use strict';
import {Utils} from '@/chrome/core';
import {RouterControllerError, RouterApiError} from './error';
import XhrUtils from './xhr';
import {SmsBoxTypes} from './sms';
import moment from 'moment';

/* global chrome */

/* const errors = [
  'xhr_error',
  'xhr_invalid_xml',
  'xhr_invalid_status',
  'xml_type_invalid',
  'xml_response_not_ok',
  'tabs_not_found',
  'chrome_runtime_message_error',
  'chrome_tabs_message_error',
  'router_url_not_set',
  'chrome_storage_error',
  'invalid_router_url',
  'xhr_timeout',
  'ussd_timeout',
  'ussd_release_fail',
];*/

/**
 * Controls access to the router
 */
class _RouterController {
  constructor() {
    this.apiErrorCodes = {
      100002: 'ERROR_SYSTEM_NO_SUPPORT',
      100003: 'ERROR_SYSTEM_NO_RIGHTS',
      100004: 'ERROR_SYSTEM_BUSY',
      108001: 'ERROR_LOGIN_USERNAME_WRONG',
      108002: 'ERROR_LOGIN_PASSWORD_WRONG',
      108003: 'ERROR_LOGIN_ALREADY_LOGIN',
      108006: 'ERROR_LOGIN_USERNAME_PWD_WRONG',
      108007: 'ERROR_LOGIN_USERNAME_PWD_ORERRUN',
      120001: 'ERROR_VOICE_BUSY',
      125001: 'ERROR_WRONG_TOKEN',
      125002: 'ERROR_WRONG_SESSION',
      125003: 'ERROR_WRONG_SESSION_TOKEN',
      111019: 'ERROR_USSD_PROCESSING',
      111020: 'ERROR_USSD_TIMEOUT',
      113018: 'SMS_SYSTEM_BUSY',
      113053: 'SMS_NOT_ENOUGH_SPACE',
    };
  }

  sendRuntimeMessage(data) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(data, (r) => {
        if (!chrome.runtime.lastError) {
          resolve(r);
        } else {
          reject(new RouterControllerError(
            'chrome_runtime_message_error', chrome.runtime.lastError));
        }
      });
    });
  }

  getTab() {
    return this.sendRuntimeMessage({
      from: 'app',
      type: 'get',
      get: 'tab',
    }).then((tab) => {
      if (tab) {
        return tab;
      } else {
        return Promise.reject(new RouterControllerError(
          'tabs_not_found', 'No matched tabs open'));
      }
    });
  }

  /**
   * Gets the url of router page from chrome.storage
   * @return {Promise<string>}
   */
  getRouterUrl() {
    return Utils.getStorage('routerUrl').then((items) => {
      if ('routerUrl' in items) {
        return items.routerUrl;
      } else {
        return Promise.reject(new RouterControllerError(
          'router_url_not_set', 'No router url set in storage'));
      }
    });
  }

  /**
   *
   * @param {number} id The id of the tab to send a message to
   * @param {object} data Data to send to the tab
   * @return {Promise}
   */
  _sendTabMessage(id, data) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(id, data, (r) => {
        if (!chrome.runtime.lastError) {
          resolve(r);
        } else {
          reject(new RouterControllerError(
            'chrome_tabs_message_error',
            'tabId: '+id+', msg: '+chrome.runtime.lastError.message));
        }
      });
    });
  }

  /**
   * Sends a message to the router's interface tab
   * @param {object} data
   * @return {Promise}
   */
  sendTabMessage(data) {
    return this.getTab().then((tab) => {
      data.from = 'RouterController';
      return this._sendTabMessage(tab.id, data);
    });
  }

  _sendPageMessage(data) {
    return this.sendTabMessage({
      command: 'pageMessage',
      data: data,
    });
  }

  _getRouterApiErrorName(code) {
    return this.apiErrorCodes[code];
  }

  /**
   *
   * @param {*} ret
   * @param {boolean} responseMustBeOk
   * @return {Promise<any>}
   */
  _processXmlResponse(ret, responseMustBeOk=false) {
    return new Promise((resolve, reject) => {
      if (ret.type !== 'error') {
        if (responseMustBeOk) {
          if (this._isAjaxReturnOk(ret.data)) {
            resolve(ret.data);
          } else {
            return Promise.reject(new RouterControllerError(
              'xml_response_not_ok', ret));
          }
        } else {
          resolve(ret.data);
        }
      } else {
        let errorName = this._getRouterApiErrorName(ret.data.code);
        let message = errorName ? errorName : ret.data.code;
        message += ((ret.data.message) ? ' : ' + ret.data.message : '');
        reject(new RouterApiError(message));
      }
    });
  }

  /**
   * @param {string} routerUrl
   * @param {object} data
   * @param {string} data.url The url to get ajax data from
   *                          e.g 'response' would  expect a <response> tag
   * @return {Promise}
   */
  _getAjaxDataDirect(routerUrl, data) {
    let parsedUrl = null;
    try {
      parsedUrl = new URL(routerUrl);
    } catch (e) {
      if (e instanceof TypeError) {
        return Promise.reject(new RouterControllerError(
          'invalid_router_url', 'Invalid router page url: '+routerUrl));
      } else {
        throw e;
      }
    }
    return XhrUtils.getXml(parsedUrl.origin + '/' + data.url).then((xml) => {
      const ret = XhrUtils.xml2object(xml);
      return this._processXmlResponse(ret, data.responseMustBeOk);
    });
  }

  /**
   *
   * @param {object} data
   * @param {string} data.url The url to get ajax data from
   *                          e.g 'response' would  expect a <response> tag
   * @param {boolean} [data.responseMustBeOk]
   * @param {string} [routerUrl='']
   * @return {Promise<any>}
   */
  getAjaxDataDirect(data, routerUrl='') {
    if (!routerUrl) {
      return this.getRouterUrl().then((_routerUrl) => {
        return this._getAjaxDataDirect(_routerUrl, data);
      });
    } else {
      return this._getAjaxDataDirect(routerUrl, data);
    }
  }

  /**
   *
   * @param {object} data
   * @param {string} data.url The url to get ajax data from
   * @param {boolean} [data.responseMustBeOk]
   * @return {Promise}
   */
  getAjaxData(data) {
    data.type = 'command';
    data.command = 'getAjaxData';
    return this._sendPageMessage(data).then((xml) => {
      let ret = XhrUtils.parseXmlString(xml);
      return this._processXmlResponse(ret, data.responseMustBeOk);
    });
  }

  /**
   *
   * @param {object} data
   * @param {string} data.url The url to get ajax data from
   * @param {object} data.request
   * @param {boolean} [data.responseMustBeOk]
   * @return {Promise}
   */
  saveAjaxData(data) {
    data.type = 'command';
    data.command = 'saveAjaxData';
    return this._sendPageMessage(data).then((xml) => {
      let ret = XhrUtils.parseXmlString(xml);
      return this._processXmlResponse(ret, data.responseMustBeOk);
    });
  }

  /**
   * Checks if an ajax return is valid by checking if the response is 'ok'
   * @private
   * @param   {object}  ret The AJAX return
   * @return {boolean} if the response is ok
   */
  _isAjaxReturnOk(ret) {
    return ret.toLowerCase() === 'ok';
  }

  /**
   * Sends a request for the router's global config
   * to determine if there is a connection
   * @param {string} [routerUrl='']
   * @return {Promise}
   */
  ping(routerUrl='') {
    if (routerUrl) {
      return this.getAjaxDataDirect({
        url: 'config/global/config.xml',
      }, routerUrl);
    } else {
      return this.getAjaxDataDirect({url: 'config/global/config.xml'});
    }
  }

  /**
   * Releases previous USSD result. Must be called after getting a USSD result.
   * @return {Promise<boolean>}
   */
  releaseUssd() {
    return this.getAjaxDataDirect({url: 'api/ussd/release'}).then((ret) => {
      if (this._isAjaxReturnOk(ret)) {
        return true;
      } else {
        return Promise.reject(new RouterControllerError(
          'ussd_release_fail'));
      }
    });
  }

  /**
   * @typedef UssdResult
   * @property {string} content
   */

  /**
   * Get's the result of a USSD command. Waits for result
   * @return {Promise<UssdResult>}
   */
  getUssdResult() {
    return this.getAjaxDataDirect({
      url: 'api/ussd/get',
    }).catch((err) => {
      if (err instanceof RouterApiError) {
        if (err.code === 'ERROR_USSD_PROCESSING') {
          return Utils.delay(1000).then(() => {
            return this.getUssdResult();
          });
        } else if (err.code == 'ERROR_USSD_TIMEOUT') {
          this.releaseUssd();
          return Promise.reject(new RouterControllerError(
            'ussd_timeout'));
        }
      } else {
        return Promise.reject(err);
      }
    });
  }

  /**
   * Sends a USSD command to the router
   * @param {string}   command  the command to send
   * @return {Promise<UssdResult>}
   */
  async sendUssdCommand(command) {
    return this.saveAjaxData({
      url: 'api/ussd/send',
      request: {
        content: command,
        codeType: 'CodeType',
        timeout: '',
      },
      responseMustBeOk: true,
    }).then((ret) => {
      return this.getUssdResult();
    });
  }

  /**
   * @typedef UssdConfigMenuItem
   * @property {string} Name
   * @property {string} Command
   */

  /**
   * @typedef UssdConfigMenu
   * @property {UssdConfigMenuItem[]} MenuItem
   */

  /**
   * @typedef UssdConfigGeneral
   * @property {string} Action
   * @property {string} Description
   * @property {string} LimitText
   * @property {UssdConfigMenu} Menu
   * @property {string} Title
   */

  /**
   * @typedef _UssdConfig
   * @property {UssdConfigGeneral} General
   */

  /**
   * @typedef UssdConfig
   * @property {_UssdConfig} USSD
   */

  /**
   * Get's USSD configuration. Includes USSD commands.
   * @param {boolean} [postpaid=false] Whether to get the postpaid or prepaid config
   * @return {Promise<UssdConfig>}
   */
  getUssdConfig(postpaid=false) {
    let url = 'config/ussd/';
    url += postpaid ? 'postpaid' : 'prepaid';
    url += 'ussd.xml';
    return this.getAjaxDataDirect({
      url: url,
    });
  }

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
    return this.getAjaxDataDirect({
      url: 'config/sms/config.xml',
    });
  }

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
    return this.getAjaxDataDirect({url: 'api/sms/sms-count'});
  }

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
    return this.saveAjaxData({
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
  }

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
  }

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
  }

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
  }

  /**
   *
   * @param {number} idx The index of the SMS
   * @return {Promise<Boolean>}
   */
  setSmsAsRead(idx) {
    return this.saveAjaxData({
      url: 'api/sms/set-read',
      request: {
        Index: idx,
      },
      responseMustBeOk: true,
    });
  }

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
  }

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
    return this.saveAjaxData({
      url: 'api/sms/save-sms',
      request: this.createSmsRequest(options),
      responseMustBeOk: true,
    });
  }

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
    return this.getAjaxDataDirect({
      url: 'api/sms/send-status',
    });
  }

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
    return this.saveAjaxData({
      url: 'api/sms/send-sms',
      request: this.createSmsRequest(options),
    }).then(() => {
      return this.getSmsSendStatus();
    });
  }

  /**
   * Delete's all messages with the given indices
   * @param {number[]} indices An array of indices of messages
   * @return {Promise<any>}
   */
  deleteSms(indices) {
    let request = indices.map((i) => {
      return {Index: i};
    });
    return this.saveAjaxData({
      url: 'api/sms/delete-sms',
      request: request,
      responseMustBeOk: true,
    });
  }

  /**
   * @typedef TrafficStatistics
   * @property {number} CurrentConnectTime
   * @property {number} CurrentDownload
   * @property {number} CurrentDownloadRate
   * @property {number} CurrentUpload
   * @property {number} CurrentUploadRate
   *
   * @property {number} TotalConnectTime
   * @property {number} TotalDownload
   * @property {number} TotalUpload
   * @property {number} TotalDownload
   * @property {number} showtraffic
   */

  /**
   * @return {Promise<TrafficStatistics>}
   */
  getTrafficStatistics() {
    return this.getAjaxDataDirect({
      url: 'api/monitoring/traffic-statistics',
    });
  }

  getLoginState() {
    return this.getAjaxDataDirect({url: 'api/user/state-login'});
  }

  isLoggedIn() {
    return this.getLoginState().then((ret) => {
      if (parseInt(ret.State) === 0) {
        return true;
      } else {
        return false;
      }
    });
  }

  getPage(url) {
    return XhrUtils.request({
      url: url, responseType: 'document',
    }).then((xhr) => {
      return xhr.response;
    });
  }

  /**
   * Gets a verification token required for making admin requests and logging in
   * @return {Promise<string[]>}
   */
  getRequestVerificationToken() {
    return this.getRouterUrl().then((url) => {
      return this.getPage(url+'/'+'html/home.html').then((doc) => {
        let meta = doc.querySelectorAll('meta[name=csrf_token]');
        let requestVerificationToken;
        if (meta.length > 0) {
          requestVerificationToken = [];
          for (let i=0; i < meta.length; i++) {
            requestVerificationToken.push(meta[i].content);
          }
          return requestVerificationToken;
        } else {
          return this.getAjaxDataDirect({
            url: 'api/webserver/token',
          }).then((data) => {
            return [data.token];
          });
        }
      });
    });
  }

  login() {
    return Utils.getStorage(['username', 'password']).then((items) => {
      return this._sendPageMessage({
        type: 'command',
        command: 'login',
        credentials: {
          username: items.username,
          password: items.password,
        },
      }).then((pageResponse) => {
        if (pageResponse.type === 'xml') {
          let xmlObject = XhrUtils.parseXmlString(pageResponse.xml);
          return this._processXmlResponse(xmlObject);
        } else if (pageResponse.type === 'error') {
          return Promise.reject(new RouterControllerError(pageResponse.error));
        }
      });
    });
  }
}

export let RouterController = new _RouterController();

