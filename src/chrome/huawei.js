import {
  Reactor,
  TabTracker,
  Module
} from './universal.js';

class HuaweiModule extends Module {
  constructor() {
    super('HuaweiModule');
    this.tabTracker = new TabTracker({
      'urlPatterns': chrome.runtime.getManifest().content_scripts[0].matches
    });

    this.events = new Reactor();
    this.events.registerEvent('onPageReady');

    this.tabTracker.events.addEventListener('onTabLoad', (tab) => {
      console.log('Tab loaded: ');
      console.log(tab);
    });

    this.tabTracker.events.addEventListener('onTabUnload', (tab) => {
      console.log('Tab unloaded: ' + tab);
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.from == 'huaweiContent') {
        if (request.type == 'ready') {
          this.events.dispatchEvent('onPageReady', request);
        }
      }
    });
  }

  /** Gets a single tab from the list of injected tabs */
  getTab() {
    if (this.tabTracker.numTabs == 1) {
      return this.tabTracker.tabs[Object.keys(this.tabTracker.tabs)[0]];
    } else {
      return false;
    }
  }

  /**
   * Sends a chrome message to all WhatsApp tabs
   * @param {object} data The message data
   */
  sendTabMessage(data, callback) {
    if (this.tabTracker.numTabs == 1) {
      // Calls the default module sendTabMessage
      super.sendTabMessage(this.getTab().id, data, callback);
    } else if (this.tabTracker.numTabs > 1) {
      console.log('Error: More than one WhatsApp tab found!');
      for (var key in this.tabTracker.tabs) {
        let tab = this.tabTracker.tabs[key];
        super.sendTabMessage(tab.id, data, callback);
      }
    } else {
      console.log('Error: No WhatsApp tabs found!');
    }
  }

  _sendPageMessage(_data, callback) {
    var data = {
      command: 'pageMessage',
      data: _data
    }
    this.sendTabMessage(data, callback);
  }

  _xmlAjax(params) {
    var request = new XMLHttpRequest();
    request.open('GET', params.url, true);
    request.setRequestHeader('Accept', 'application/xml');
    request.overrideMimeType('application/xml');

    function getXHR(self) {
      return {
        responseType: self.responseType,
        response: self.response,
        responseText: self.responseText,
        responseXML: self.responseXML
      };
    }

    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        params.success(getXHR(this));
      } else {
        // We reached our target server, but it returned an error
        params.error(getXHR(this));
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      params.error(getXHR(this));
    };

    request.send();
  }

  _recursiveXml2Object(xml) {
    if (xml.children.length > 0) {
      var _obj = {};
      Array.prototype.forEach.call(xml.children, function(el) {
        var _childObj = (el.children.length > 0) ? _recursiveXml2Object(el) : el.textContent;
        var siblings = Array.prototype.filter.call(el.parentNode.children, function(child) {
          return child !== el;
        });
        // If there is more than one of these elements, then it's an array
        if (siblings.length > 0 && siblings[0].tagName == el.tagName) {
          if (_obj[el.tagName] == null) {
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
    var obj = {};
    obj.type = xml.documentElement.tagName;
    obj.data = this._recursiveXml2Object(xml.documentElement);
    return obj;
  }

  getRouterData(url, callback) {
    var parsedUrl = new URL(this.getTab().url);
    var origin = parsedUrl.origin;
    this._xmlAjax({
      url: origin + '/' + url,
      success: (xhr) => {
        var data = xhr.responseXML;
        var ret = this._xml2object(data);
        if (typeof callback !== 'undefined') {
            callback(ret);
        }
      }
    });
  }

  getAjaxData(data, callback) {
    data.type = 'command';
    data.command = 'getAjaxData';
    this._sendPageMessage(data, callback);
  }

  /**
   * @callback HuaweiModule~ajaxCallback
   * @param {object} ret The ajax return data
   */

  /**
   * Sends an ajax command to the router
   * @param {object}   data     The data to send
   * @param {{HuaweiModule~ajaxCallback}} callback Function called when a response is received
   */
  saveAjaxData(data, callback) {
    data.type = 'command';
    data.command = 'saveAjaxData';
    this._sendPageMessage(data, callback);
  }

  /**
   * Checks if an ajax return is valid by checking if the response is 'ok'
   * @private
   * @param   {object}  ret The AJAX return
   * @returns {boolean} if the response is ok
   */
  _isAjaxReturnOk(ret) {
    return ret.response.toLowerCase() == 'ok';
  }

  /**
   * Sends a USSD command to the router
   * @param {string}   command  the command to send
   * @param {function} callback function called when a response is received
   */
  sendUssdCommand(command, callback) {
    this.saveAjaxData({
      url: 'api/ussd/send',
      request: {
        content: command,
        codeType: 'CodeType',
        timeout: ''
      },
      options: {
        enc: true
      }
    }, (ret) => {
      if (this._isAjaxReturnOk(ret)) {
        this.getAjaxData({
          url: 'api/ussd/get'
        }, (ret2) => {
          callback(ret2);
        });
      } else {
        callback(ret);
      }
    });
  }

  getSmsCount(callback) {
    this.getRouterData('api/sms/sms-count', (ret) => {
      callback(ret);
    });
  }
}

export let huawei = new HuaweiModule();
