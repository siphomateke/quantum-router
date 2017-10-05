'use strict';
/* global chrome*/

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
  'xhr_timeout'
];*/

import ExtendableError from 'es6-error';
import moment from 'moment';

export class RouterControllerError extends ExtendableError {
  constructor(code, message) {
    super(typeof message !== 'undefined' ? message : code);
    this.code = code;
  }
}

export class RouterApiError extends RouterControllerError {}

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
    };
  }

  sendRuntimeMessage(data) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(data, (r) => {
        if (!chrome.runtime.lastError) {
          resolve(r);
        } else {
          reject(new RouterControllerError('chrome_runtime_message_error', chrome.runtime.lastError));
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
        return Promise.reject(new RouterControllerError('tabs_not_found', 'No matched tabs open'));
      }
    });
  }

  getStorage(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, function(items) {
        if (!chrome.runtime.lastError) {
          resolve(items);
        } else {
          reject(new RouterControllerError('chrome_storage_error', chrome.runtime.lastError));
        }
      });
    });
  }

  /**
   * Gets the url of router page from chrome.storage
   * @return {Promise<string>}
   */
  getRouterUrl() {
    return this.getStorage('routerUrl').then((items) => {
      if ('routerUrl' in items) {
        return items.routerUrl;
      } else {
        return Promise.reject(new RouterControllerError('router_url_not_set', 'No router url set in storage'));
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
          reject(new RouterControllerError('chrome_tabs_message_error', 'tabId: '+id+', msg: '+chrome.runtime.lastError.message));
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

  _xmlAjax(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/xml');
      xhr.overrideMimeType('application/xml');
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 400) {
          if (xhr.responseXML instanceof Document) {
            resolve(xhr.responseXML);
          } else {
            reject(new RouterControllerError('xhr_invalid_xml',
              'Expected XML to be instance of Document. Got: ' + xhr.responseXML));
          }
        } else {
          reject(new RouterControllerError('xhr_invalid_status', 'XHR status invalid; '+xhr.statusText));
        }
      };
      xhr.ontimeout = () => {
        reject(new RouterControllerError('xhr_timeout', 'XHR timed out'));
      };
      xhr.onerror = (e) => {
        reject(new RouterControllerError('xhr_error', 'Unknown XHR error.'));
      };
      xhr.send();
    });
  }

  _recursiveXml2Object(xml) {
    if (xml.children.length > 0) {
      let _obj = {};
      Array.prototype.forEach.call(xml.children, (el) => {
        let _childObj = (el.children.length > 0) ? this._recursiveXml2Object(el) : el.textContent;
        let siblings = Array.prototype.filter.call(el.parentNode.children, function(child) {
          return child !== el;
        });
        // If there is more than one of these elements, then it's an array
        if (siblings.length > 0 && siblings[0].tagName == el.tagName) {
          if (!(el.tagName in _obj)) {
            _obj[el.tagName] = [];
          }
          _obj[el.tagName].push(_childObj);
          // Otherwise just store it normally
        } else {
          _obj[el.tagName] = _childObj;
        }
      });
      return _obj;
    } else {
      return xml.textContent;
    }
  }

  _xml2object(xml) {
    let obj = {};
    obj.type = xml.documentElement.tagName;
    obj.data = this._recursiveXml2Object(xml.documentElement);
    return obj;
  }

  _getRouterApiErrorName(code) {
    return this.apiErrorCodes[code];
  }

  _processXmlResponse(ret) {
    return new Promise((resolve, reject) => {
      if (ret.type !== 'error') {
        resolve(ret.data);
      } else {
        let errorName = this._getRouterApiErrorName(ret.data.code);
        let message = errorName ? errorName : ret.data.code;
        message += ((ret.data.message) ? ' : ' + ret.data.message : '');
        reject(new RouterApiError(message));
      }
    });
  }

  /**
   *
   * @param {object} data
   * @param {string} data.url The url to get ajax data from
   *                                 e.g 'response' would  expect a <response> tag
   * @return {Promise}
   */
  getAjaxDataDirect(data) {
    return this.getRouterUrl().then((url) => {
      let parsedUrl = null;
      try {
        parsedUrl = new URL(url);
      } catch (e) {
        if (e instanceof TypeError) {
          return Promise.reject(new RouterControllerError('invalid_router_url', 'Invalid router page url: '+url));
        } else {
          throw e;
        }
      }
      return this._xmlAjax(parsedUrl.origin + '/' + data.url).then((xml) => {
        const ret = this._xml2object(xml);
        return this._processXmlResponse(ret);
      });
    });
  }

  /**
   * Converts an xml string to an object
   * @param {string} xml
   * @return {object}
   */
  _parseXmlString(xml) {
    let xmlDocument = new DOMParser().parseFromString(xml, 'application/xml');
    return RouterController._xml2object(xmlDocument);
  }

  /**
   *
   * @param {object} data
   * @param {string} data.url The url to get ajax data from
   * @param {object} [data.options]
   *                                 e.g 'response' would  expect a <response> tag
   * @return {Promise}
   */
  getAjaxData(data) {
    data.type = 'command';
    data.command = 'getAjaxData';
    return this._sendPageMessage(data).then((xml) => {
      let ret = this._parseXmlString(xml);
      return this._processXmlResponse(ret);
    });
  }

  /**
   *
   * @param {object} data
   * @param {string} data.url The url to get ajax data from
   * @param {object} data.request
   * @param {object} [data.options]
   *                                   e.g 'response' would  expect a <response> tag
   * @return {Promise}
   */
  saveAjaxData(data) {
    data.type = 'command';
    data.command = 'saveAjaxData';
    return this._sendPageMessage(data).then((xml) => {
      let ret = this._parseXmlString(xml);
      return this._processXmlResponse(ret);
    });
  }

  /**
   * Checks if an ajax return is valid by checking if the response is 'ok'
   * @private
   * @param   {object}  ret The AJAX return
   * @return {boolean} if the response is ok
   */
  _isAjaxReturnOk(ret) {
    // FIXME: This probably doesn't work anymore. It should use something like ret.data
    return ret.response.toLowerCase() === 'ok';
  }

  /**
   * Sends a request for the router's global config to determine if there is a connection
   * @return {Promise}
   */
  ping() {
    return this.getAjaxDataDirect({url: 'config/global/config.xml'});
  }

  /**
   * Sends a USSD command to the router
   * @param {string}   command  the command to send
   * @return {Promise}
   */
  async sendUssdCommand(command) {
    return this.saveAjaxData({
      url: 'api/ussd/send',
      request: {
        content: command,
        codeType: 'CodeType',
        timeout: '',
      },
      options: {
        enc: true,
      },
    }).then((ret) => {
      if (this._isAjaxReturnOk(ret)) {
        return this.getAjaxData({
          url: 'api/ussd/get',
        });
      } else {
        return Promise.reject(new RouterControllerError('xml_response_not_ok', ret));
      }
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
   * @property {number} Smstat
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
   * @typedef Messages
   * @property {Message[]} Message
   */

  /**
   * @typedef SmsList
   * @property {number} Count
   * @property {Messages} Messages
   */

  /**
   * Get's the list of SMSs from the router
   * @param {object} options Options
   * @param {number} [options.page=1]
   * @param {number} [options.perPage=20]
   * @param {(1|2|3)} [options.boxType=1] Which box to retreive. Can be Inbox(1), sent(2) or draft(3)
   * @param {('desc'|'asc')} [options.sortOrder=desc]
   * @return {Promise<SmsList>}
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

  login() {
    return this.getStorage(['username', 'password']).then((items) => {
      return this._sendPageMessage({
        type: 'command',
        command: 'login',
        credentials: {
          username: items.username,
          password: items.password,
        },
      }).then((pageResponse) => {
        if (pageResponse.type === 'xml') {
          let xmlObject = this._parseXmlString(pageResponse.xml);
          return this._processXmlResponse(xmlObject);
        } else if (pageResponse.type === 'error') {
          return Promise.reject(new RouterControllerError(pageResponse.error));
        }
      });
    });
  }
}

export let RouterController = new _RouterController();

class _SmsUtils {
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
    let data = message.match(/(\d*)(\.*)(\d*)( *)mb/gi);
    if (data) {
      data = data.map((element) => {
        return {
          amount: parseFloat(element.replace(/( *)mb/i, '')),
          unit: 'MB',
        };
      });
    } else {
      data = [];
    }
    return data;
  }
  _getExpiryDate(message) {
    let dates = message.match(/(\d+)-(\d+)-(\d+) (\d{2}):(\d{2}):(\d{2})/g);
    return dates.map((date) => {
      return moment(date);
    });
  }
  parse(message) {
    return {
      data: this._getDataUsage(message),
      expires: this._getExpiryDate(message),
    };
  }
}

export let SmsUtils = new _SmsUtils();

console.log(SmsUtils.parse('You have Data 16.0MB Data Valid until 2017-09-02 00:00:00. 2017-09-02 00:00:20 Get a bundle that allows you to CALL across ALL NETWORKS. Dial *211# and get it NOW.'));
