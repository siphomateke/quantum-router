class Router {
  getTab(callback) {
    chrome.runtime.sendMessage({
      from: 'app',
      type: 'get',
      get: 'tab'
    }, callback);
  }

  sendTabMessage(data, callback) {
    this.getTab((tab) => {
      chrome.tabs.sendMessage(tab.id, data, callback);
    });
  }

  _sendPageMessage(data, callback) {
    this.sendTabMessage({
      command: 'pageMessage',
      data: data
    }, callback);
  }

  _xmlAjax(params) {
    var request = new XMLHttpRequest();
    request.open('GET', params.url, true);
    request.setRequestHeader('Accept', 'application/xml');
    request.overrideMimeType('application/xml');

    function getXHR(self) {
      return {
        status: self.status,
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

  getAjaxDataDirect(url, callback) {
    this.getTab((tab) => {
      var parsedUrl = new URL(tab.url);
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
    });
  }

  getAjaxData(data, callback) {
    data.type = 'command';
    data.command = 'getAjaxData';
    this._sendPageMessage(data, callback);
  }

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
    this.getAjaxDataDirect('api/sms/sms-count', (ret) => {
      callback(ret);
    });
  }
}

export let router = new Router();
