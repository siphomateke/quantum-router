'use strict';
/* global chrome*/

import * as core from './content_core.js';
core.init();

// Wrapping in a function to not leak/modify variables if the script
// was already inserted before.
(function() {
  // Check if content was loaded already
  if (window.hasRun) {
    return true;
  } // Will ultimately be passed back to executeScript
  window.hasRun = true;

  function injectCode(code) {
    let script = document.createElement('script');
    script.textContent = '(' + code + ')()';
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
  }

  // This function is going to be stringified, and injected in the page
  injectCode(function() {
    function sendContentMessage(data) {
      data.from = 'FROM_PAGE_MTN_QUANTUM';
      window.postMessage(data, '*');
    }

    function sendContentCallback(eventData, data) {
      sendContentMessage({
        type: 'callback',
        callbackFunc: eventData.command,
        uuid: eventData.uuid,
        data: data,
      });
    }

    function jqueryXmltoString($xml) {
      return new XMLSerializer().serializeToString($xml[0]);
    }

    function quantumSaveAjaxData(request, callback) {
      let xmlString = object2xml('request', request.request);
      saveAjaxData(request.url, xmlString, function($xml) {
        callback(jqueryXmltoString($xml));
      }, request.options);
    }

    function quantumGetAjaxData(request, callback) {
      getAjaxData(request.url, function($xml) {
        callback(jqueryXmltoString($xml));
      }, request.options);
    }

    function login2(name, psd, successCallback, errorCallback) {
      let valid = validateInput(name, psd);
      if (!valid) {
        errorCallback('invalid_username_or_password');
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
      let request = {
        Username: name,
        Password: psd,
        password_type: g_password_type,
      };
      if (valid) {
        let xmlstr = object2xml('request', request);
        log.debug('xmlstr = ' + xmlstr);
        saveAjaxData('api/user/login', xmlstr, function($xml) {
          successCallback(jqueryXmltoString($xml));
          let ret = xml2object($xml);
          if (isAjaxReturnOK(ret)) {
            $('#logout_span').text(common_logout);
          }
        }, {
          enc: true,
        });
      }
    }

    function q_login(credentials, successCallback, errorCallback) {
      login2(credentials.username, credentials.password, successCallback, errorCallback);
    }

    window.addEventListener('message', function(event) {
      // We only accept messages from ourselves
      if (event.source != window) {
        return;
      }

      if (event.data.from && (event.data.from == 'FROM_CONTENT_MTN_QUANTUM')) {
        console.log('Page script received: ', event.data);
        if (event.data.command == 'saveAjaxData') {
          quantumSaveAjaxData(event.data, function(ret) {
            sendContentCallback(event.data, ret);
          });
        } else if (event.data.command == 'getAjaxData') {
          quantumGetAjaxData(event.data, function(ret) {
            sendContentCallback(event.data, ret);
          });
        } else if (event.data.command == 'login') {
          q_login(event.data.credentials, function(xml) {
            sendContentCallback(event.data, {
              type: 'xml',
              xml: xml,
            });
          }, function(error) {
            sendContentCallback(event.data, {
              type: 'error',
              error: error,
            });
          });
        }
      }
    });
  });

  let callbacks = {};

  window.addEventListener('message', function(event) {
    // We only accept messages from ourselves
    if (event.source != window) {
      return;
    }

    if (event.data.from && (event.data.from == 'FROM_PAGE_MTN_QUANTUM')) {
      console.log('Content script received: ', event.data);

      if (event.data.type == 'callback' && event.data.uuid && 'data' in event.data) {
        callbacks[event.data.uuid](event.data.data);
        delete callbacks[event.data.uuid];
      }
    }
  }, false);

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  function sendPageMessage(data, callback) {
    data.from = 'FROM_CONTENT_MTN_QUANTUM';
    let uuid = uuidv4();
    callbacks[uuid] = callback;
    data.uuid = uuid;
    window.postMessage(data, '*');
  }

  chrome.runtime.sendMessage({
    from: 'routerContent',
    type: 'ready',
  });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log('runtime message: ', request);
      if (request.from == 'RouterController') {
        if (request.command == 'pageMessage') {
          sendPageMessage(request.data, function(callbackData) {
            sendResponse(callbackData);
          });
        }
      }
      // needed to call sendResposne asynchronously
      return true;
    }
  );

  function ready(fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    for (let i=0; i<document.styleSheets.length; i++) {
      void(document.styleSheets.item(i).disabled=true);
    }

    let body = document.querySelector('body');
    let wrapper = document.createElement('div');
    wrapper.style['z-index'] = '1';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '0';
    wrapper.style.right = '0';
    wrapper.style.top = '0';
    wrapper.style.bottom = '0';

    let app = document.createElement('div');
    app.id = 'app';

    wrapper.appendChild(app);
    body.appendChild(wrapper);

    let content = document.querySelector('#all_content');
    content.style['z-index'] = '-100';
    content.style.display = 'none';

    let observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutationRecord) {
        mutationRecord.target.style.display = 'none';
      });
    });

    observer.observe(content, {attributes: true, attributeFilter: ['style']});
  });
})();
