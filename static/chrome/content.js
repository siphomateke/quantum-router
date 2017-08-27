// Wrapping in a function to not leak/modify variables if the script
// was already inserted before.
(function () {
    // Check if content was loaded already
    if (window.hasRun)
        return true; // Will ultimately be passed back to executeScript
    window.hasRun = true;

    function injectCode(code) {
        var script = document.createElement('script');
        script.textContent = '(' + code + ')()';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    }

    // This function is going to be stringified, and injected in the page
    injectCode(function () {
        function sendContentMessage(data) {
            data.from = 'FROM_PAGE_MTN_QUANTUM';
            window.postMessage(data, '*');
        }
        
        function sendContentCallback(eventData, data){ 
            sendContentMessage({
                type: 'callback',
                callbackFunc: eventData.command,
                uuid: eventData.uuid,
                data: data
            });
        }

        function quantumSaveAjaxData(request, callback) {
            var xmlString = object2xml('request', request.request);
            saveAjaxData(request.url, xmlString, function ($xml) {
                var ret = xml2object($xml);
                callback(ret);
            }, request.options);
        }
        
        function quantumGetAjaxData(request, callback) {
            getAjaxData(request.url, function ($xml) {
                var ret = xml2object($xml);
                if (ret.type == 'response') {
                    callback(ret);
                } else {
                    if (ret.error.code == '111019') {
                        setTimeout(() => {
                            quantumGetAjaxData(request, callback);    
                        }, 3000);
                    } else if (ret.error.code == '111020') {
                        callback(ret);
                    }
                }
            }, request.options);
        }

        window.addEventListener('message', function (event) {
            // We only accept messages from ourselves
            if (event.source != window)
                return;

            if (event.data.from && (event.data.from == 'FROM_CONTENT_MTN_QUANTUM')) {
                console.log('Page script received: ');
                console.log(event.data);
                if (event.data.command == 'saveAjaxData') {
                    quantumSaveAjaxData(event.data, function (ret) {
                        sendContentCallback(event.data, ret);
                    });
                } else if (event.data.command == 'getAjaxData') {
                    quantumGetAjaxData(event.data, function (ret) {
                        sendContentCallback(event.data, ret);
                    });
                } else if (event.data.command == 'login') {
                    // Make sure user is logged in
                    getAjaxData('api/user/state-login', function ($xml) {
                        var ret = xml2object($xml);
                        if (ret.type == 'response') {
                            console.log(ret);
                            if (ret.response.State != '0') {
                                q_login(event.data.credentials, function () {
                                    sendContentMessage({
                                        type: 'ready'
                                    });
                                });
                            } else {
                                sendContentMessage({
                                    type: 'ready'
                                });
                            }
                        }
                    });
                }
            }
        });

        function login2(name, psd, callback) {
            var valid = validateInput(name, psd);
            if (!valid) {
                return;
            }
            if ($.isArray(g_requestVerificationToken)) {
                if (g_requestVerificationToken.length > 0) {
                    if (g_password_type == '4') {
                        psd = base64encode(SHA256(name + base64encode(SHA256(psd)) + g_requestVerificationToken[0]));
                    } else {
                        psd = base64encode(psd);
                    }
                }
            } else {
                psd = base64encode(psd);
            }
            var request = {
                Username: name,
                Password: psd,
                password_type: g_password_type
            };
            if (valid) {
                var xmlstr = object2xml('request', request);
                log.debug('xmlstr = ' + xmlstr);
                saveAjaxData('api/user/login', xmlstr, function ($xml) {
                    log.debug('api/user/login successed!');
                    var ret = xml2object($xml);
                    var error = '';
                    if (isAjaxReturnOK(ret)) {
                        $('#logout_span').text(common_logout);
                        g_main_displayingPromptStack.pop();
                    } else {
                        if (ret.type == 'error') {
                            if (ret.error.code == ERROR_LOGIN_PASSWORD_WRONG) {
                                error = system_hint_wrong_password;
                            } else if (ret.error.code == ERROR_LOGIN_ALREADY_LOGIN) {
                                error = common_user_login_repeat;
                            } else if (ret.error.code == ERROR_LOGIN_USERNAME_WRONG) {
                                error = settings_hint_user_name_not_exist;
                            } else if (ret.error.code == ERROR_LOGIN_USERNAME_PWD_WRONG) {
                                error = IDS_login_username_password_wrong;
                            } else if (ret.error.code == ERROR_LOGIN_USERNAME_PWD_ORERRUN) {
                                error = IDS_login_username_password_input_overrun;
                            }
                        }
                    }
                    ret.error = error;
                    callback(ret);
                }, {
                    enc: true
                });
            }
        }

        function q_login(credentials, successCallback) {
            login2(credentials.username, credentials.password, function (ret) {
                console.log('Logged in');
                console.log(ret);
                if (ret.response.toLowerCase() == 'ok') {
                    successCallback(ret);
                }
            });
        }
    });

    var callbacks = {};

    window.addEventListener('message', function (event) {
        // We only accept messages from ourselves
        if (event.source != window)
            return;

        if (event.data.from && (event.data.from == 'FROM_PAGE_MTN_QUANTUM')) {
            console.log('Content script received: ' + event.data.type);
            console.log(event.data);
            
            // Initiate communication with page
            if (event.data.type == 'ready') {
                chrome.runtime.sendMessage({
                    from: 'huaweiContent',
                    type: 'ready'
                });
            }
            
            if (event.data.type == 'callback' && event.data.uuid && event.data.data) {
                callbacks[event.data.uuid](event.data.data);
                delete callbacks[event.data.uuid]
            }
        }
    }, false);

    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    function sendPageMessage(data, callback) {
        data.from = 'FROM_CONTENT_MTN_QUANTUM';
        var uuid = uuidv4();
        callbacks[uuid] = callback;
        data.uuid = uuid;
        window.postMessage(data, '*');
    }

    chrome.storage.sync.get({
        username: '',
        password: ''
    }, function (items) {
        sendPageMessage({
            type: 'command',
            command: 'login',
            credentials: items
        });
    });

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(request);
            if (request.from == 'HuaweiModule') {
                if (request.command == 'pageMessage') {
                    sendPageMessage(request.data, function (callbackData) {
                        sendResponse(callbackData);
                    });
                }
            }
            // needed to call sendResposne asynchronously
            return true;
        }
    );
})();
