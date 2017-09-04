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

function _recursiveXml2Object($xml) {
    if ($xml.children().length > 0) {
        var _obj = {};
        $xml.children().each(function () {
            var _childObj = ($(this).children().length > 0) ? _recursiveXml2Object($(this)) : $(this).text();
            if ($(this).siblings().length > 0 && $(this).siblings().get(0).tagName == this.tagName) {
                if (_obj[this.tagName] == null) {
                    _obj[this.tagName] = [];
                }
                _obj[this.tagName].push(_childObj);
            } else {
                _obj[this.tagName] = _childObj;
            }
        });
        return _obj;
    } else {
        return $xml.text();
    }
}

function xml2object($xml) {
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

    getRouterData(url, callback) {
        var parsedUrl = new URL(this.getTab().url);
        var origin = parsedUrl.origin;
        $.ajax({
            url: origin + '/' + url,
            type: 'GET',
            success: function (data) {
                var xml;
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
                }
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
