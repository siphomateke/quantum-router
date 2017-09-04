import {Event,Reactor,TabTools,TabTracker,core,Module} from './universal.js';

chrome.browserAction.onClicked.addListener(() => {
    TabTools.new(chrome.extension.getURL('../index.html'));
});

chrome.storage.sync.set({
    username: 'admin',
    password: 'mateke#2016'
}, function () {
    console.log('Settings saved');
});

var parseXml;
if (typeof window.DOMParser != "undefined") {
    parseXml = function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined" &&
       new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}

function _recursiveXml2Object(xml) {
    if (xml.children.length > 0) {
        var _obj = {};
        console.log(xml.children);
        Array.prototype.forEach.call(xml.children, function () {
            var _childObj = (this.children.length > 0) ? _recursiveXml2Object(this) : this.textContent;
            var result = Array.prototype.filter.call(this.parentNode.children, function(child){
              return child !== el;
            });
            console.log(result);
            /*if ($(this).siblings().length > 0 && $(this).siblings().get(0).tagName == this.tagName) {
                if (_obj[this.tagName] == null) {
                    _obj[this.tagName] = [];
                }
                _obj[this.tagName].push(_childObj);
            } else {
                _obj[this.tagName] = _childObj;
            }*/
        });
        return _obj;
    } else {
        return xml.textContent;
    }
}

function xml2object2($xml) {
    var obj = {};
    if ($xml.find('response').length > 0) {
        var _response = _recursiveXml2Object($xml.find('response'));
        obj.type = 'response';
        obj.response = _response;
    } else if ($xml.find('error').length > 0) {
        var _code = $xml.find('code').text();
        var _message = $xml.find('message').text();
        obj.type = 'error';
        obj.error = {
            code: _code,
            message: _message
        };
    } else if ($xml.find('config').length > 0) {
        var _config = _recursiveXml2Object($xml.find('config'));
        obj.type = 'config';
        obj.config = _config;
    } else {
        obj.type = 'unknown';
    }
    return obj;
}

function xml2object(xml) {
  console.dir(xml);
  console.dir(xml.children);
}

class HuaweiModule extends Module {
    constructor() {
        super('HuaweiModule');
        this.tabTracker = new TabTracker({'urlPatterns' : chrome.runtime.getManifest().content_scripts[0].matches});

        this.events = new Reactor();
        this.events.registerEvent('onPageReady');

        this.tabTracker.events.addEventListener('onTabLoad', (tab) => {
            console.log('Tab loaded: ');
            console.log(tab);
        });

        this.tabTracker.events.addEventListener('onTabUnload', (tab) => {
            console.log('Tab unloaded: '+tab);
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
        }
        else {
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
        }
        else {
            console.log('Error: No WhatsApp tabs found!');
        }
    }

    _sendPageMessage(_data, callback) {
        var data = {
            command : 'pageMessage',
            data: _data
        }
        this.sendTabMessage(data, callback);
    }

    xmlAjax(params) {
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

    getRouterData(url, callback) {
        var parsedUrl = new URL(this.getTab().url);
        var origin = parsedUrl.origin;
        this.xmlAjax({
            url: origin + '/' + url,
            success: function (xhr) {
              var data = xhr.responseXML;
              console.log(data);
              var ret = xml2object(data.documentElement);
              console.log(ret);
                /*var xml;
                if (typeof data === 'string') {
                    // console.log(data);
                    xml = $.parseXML(data);
                } else if ($.isXMLDoc(data)) {
                    xml = data;
                }
                // console.log(xml);
                var $xml = $(xml);
                var ret = xml2object($xml);

                var ret = xml2object($(xml));
                if (typeof callback !== 'undefined') {
                    callback(ret);
                }*/
            }
        });
    }


    getAjaxData(data, callback) {
        data.type = 'command';
        data.command = 'getAjaxData' ;
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
        data.command = 'saveAjaxData' ;
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
        this.getAjaxData({
            url: 'api/sms/sms-count'
        }, (ret) => {
            callback(ret);
        });
    }
}

var huawei = new HuaweiModule();

huawei.events.addEventListener('onPageReady', function () {
    /*huawei.sendUssdCommand('*114#', function (ret) {
        console.log(ret);
    });*/
    /*huawei.getSmsCount(function (ret) {
        console.log(ret);
    });*/
    huawei.getRouterData('api/sms/sms-count', function (ret) {
        console.log(ret);
    });

});
