'use strict';
/* global chrome*/

/**
 * Current errors are xhr_error, tabs_not_found
 */
class RouterControllerError {
  constructor(code, message) {
    this.code = code;
    this.error = new Error(message);
  }
}

/**
 * Controls access to the router
 */
class _RouterController {
  sendRuntimeMessage(data) {
    // TODO: Handle chrome message sending errors
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(data, (r) => resolve(r));
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
        return Promise.reject(new RouterControllerError('tabs_not_found','No matched tabs open'));
      }
    });
  }

  _sendTabMessage(id, data) {
    // TODO: Handle chrome message sending errors
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(id, data, (r) => resolve(r));
    });
  }

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
          resolve(xhr.responseXML);
        } else {
          reject(new RouterControllerError('xhr_error',xhr.statusText));
        }
      };
      xhr.onerror = () => {
        reject(new RouterControllerError('xhr_error', xhr.statusText));
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
          if (_obj[el.tagName] === null) {
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

  getAjaxDataDirect(url) {
    return this.getTab().then((tab) => {
      const parsedUrl = new URL(tab.url);
      return this._xmlAjax(parsedUrl.origin + '/' + url).then((xml) => {
        // TODO: Make sure xml is type document
        return this._xml2object(xml).then((ret) => {
          if ('returnType' in data) {
            if (ret.type === data.returnType) {
              return ret[data.returnType];
            } else {
              return Promise.reject(new RouterControllerError('xml_type_invalid',
              'Returned xml data does not contain <'+data.returnType+'> instead it contains: '+ret.type));
            }
          } else {
            return ret;
          }
        });
      });
    });
  }

  getAjaxData(data) {
    data.type = 'command';
    data.command = 'getAjaxData';
    // TODO: data.type
    return this._sendPageMessage(data).then((ret) => {
      if ('returnType' in data) {
        if (ret.type === data.returnType) {
          return ret[data.returnType];
        } else {
          return Promise.reject(new RouterControllerError('xml_type_invalid',
          'Returned xml data does not contain <'+data.returnType+'> instead it contains: '+ret.type));
        }
      } else {
        return ret;
      }
    });
  }

  saveAjaxData(data) {
    data.type = 'command';
    data.command = 'saveAjaxData';
    // TODO: data.type
    return this._sendPageMessage(data).then((ret) => {
      if ('returnType' in data) {
        if (ret.type === data.returnType) {
          return ret[data.returnType];
        } else {
          return Promise.reject(new RouterControllerError('xml_type_invalid',
          'Returned xml data does not contain <'+data.returnType+'> instead it contains: '+ret.type));
        }
      } else {
        return ret;
      }
    });
  }

  /**
   * Checks if an ajax return is valid by checking if the response is 'ok'
   * @private
   * @param   {object}  ret The AJAX return
   * @return {boolean} if the response is ok
   */
  _isAjaxReturnOk(ret) {
    return ret.response.toLowerCase() === 'ok';
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
      returnType: 'response',
    }).then((ret) => {
      if (this._isAjaxReturnOk(ret)) {
        // TODO: Handle getAjaxData fail
        return this.getAjaxData({
          url: 'api/ussd/get',
        });
      } else {
        Promise.reject(new RouterControllerError('xml_not_ok',ret));
      }
    });
  }

  /**
   * Gets the number of read and unread messages
   * @return {Promise}
   */
  async getSmsCount() {
    return this.getAjaxDataDirect({url:'api/sms/sms-count', returnType: 'response'});
  }

  /**
   * Get's the list of SMSs from the router
   * @param {Object} options Options
   * @return {Promise}
   */
  getSmsList(options) {
    options = Object.assign({
      page: 1,
      perPage: 20,
      boxType: 1,
      sortOrder: 'desc',
    }, options);
    /*
    SMS_BOXTYPE_INBOX = 1
    SMS_BOXTYPE_SENT = 2
    SMS_BOXTYPE_DRAFT = 3
    */
    // TODO: Handle saveAjaxData fail
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
      returnType: 'response',
    });
  }
}

export let RouterController = new _RouterController();
