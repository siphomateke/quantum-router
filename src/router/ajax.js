'use strict';
import {
  RouterControllerError,
  RouterApiError,
  XhrError,
  getRouterApiErrorName,
} from './error';
import * as routerUtils from './utils';
import jxon from 'jxon';
import * as config from './config';
import NodeRSA from 'node-rsa';
import {Queue} from '@/chrome/core';

/**
 * @typedef xhrRequestOptions
 * @property {string} url
 * @property {string} [mimeType]
 * @property {string} [responseType]
 * @property {string} [method]
 * @property {object} [data]
 * @property {Object.<string, string>} [requestHeaders]
 */

/**
 *
 * @param {xhrRequestOptions} options
 * @return {Promise<XMLHttpRequest>}
 */
export function xhrRequest(options) {
  options = Object.assign({
    mimeType: null,
    responseType: null,
    method: 'GET',
    data: null,
    requestHeaders: null,
  }, options);
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(options.method, options.url, true);
    if (options.responseType) {
      xhr.responseType = options.responseType;
    }
    if (options.mimeType) {
      xhr.setRequestHeader('Accept', options.mimeType);
      xhr.overrideMimeType(options.mimeType);
    }
    if (options.requestHeaders) {
      for (let header in options.requestHeaders) {
        if (Object.prototype.hasOwnProperty.call(options.requestHeaders, header)) {
          xhr.setRequestHeader(header, options.requestHeaders[header]);
        }
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 400) {
        resolve(xhr);
      } else {
        reject(new XhrError('xhr_invalid_status', 'XHR status invalid; '+xhr.statusText));
      }
    };
    xhr.ontimeout = () => {
      reject(new XhrError('xhr_timeout', 'XHR timed out'));
    };
    xhr.onerror = (e) => {
      reject(new XhrError('xhr_error', 'Unknown XHR error.'));
    };
    xhr.send(options.data);
  });
}

/**
 *
 * @param {xhrRequestOptions} xhrOptions
 * @return {Promise<XMLHttpRequest>}
 */
export function xhrRequestXml(xhrOptions) {
  xhrOptions = Object.assign({
    mimeType: 'application/xml',
  }, xhrOptions);
  return xhrRequest(xhrOptions).then((xhr) => {
    if (xhr.responseXML instanceof Document) {
      return xhr;
    } else {
      Promise.reject(new XhrError('xhr_invalid_xml',
        'Expected XML to be instance of Document. Got: ' + xhr.responseXML));
    }
  });
}

/**
 *
 * @param {Element} xml
 * @return {object}
 */
function _recursiveXml2Object(xml) {
  if (xml.children.length > 0) {
    let obj = {};
    Array.prototype.forEach.call(xml.children, (el) => {
      let childObj = (el.children.length > 0) ? _recursiveXml2Object(el) : el.textContent;
      let siblings = Array.prototype.filter.call(el.parentNode.children, function(child) {
        return child !== el;
      });
      // If there is more than one of these elements, then it's an array
      if (siblings.length > 0 && siblings[0].tagName == el.tagName) {
        if (!(el.tagName in obj)) {
          obj[el.tagName] = [];
        }
        obj[el.tagName].push(childObj);
        // Otherwise just store it normally
      } else {
        obj[el.tagName] = childObj;
      }
    });
    return obj;
  } else {
    return xml.textContent;
  }
}

/**
 *
 * @param {Document} xml
 * @return {object}
 */
export function xml2object(xml) {
  let obj = {};
  obj.type = xml.documentElement.tagName;
  obj.data = _recursiveXml2Object(xml.documentElement);
  return obj;
}

/**
 *
 * @param {Document} xml
 * @param {boolean} responseMustBeOk
 * @return {Promise<any>}
 */
export function getProcessedXml(xml, responseMustBeOk) {
  const ret = xml2object(xml);
  return processXmlResponse(ret, responseMustBeOk);
}

/**
 * Converts an xml string to an object
 * @param {string} xml
 * @return {object}
 */
export function parseXmlString(xml) {
  let xmlDocument = new DOMParser().parseFromString(xml, 'application/xml');
  return xml2object(xmlDocument);
}

/**
 * Checks if an ajax return is valid by checking if the response is 'ok'
 * @private
 * @param   {object}  ret The AJAX return
 * @return {boolean} if the response is ok
 */
export function isAjaxReturnOk(ret) {
  return ret.toLowerCase() === 'ok';
}

/**
 *
 * @param {*} ret
 * @param {boolean} responseMustBeOk
 * @return {Promise<any>}
 */
export function processXmlResponse(ret, responseMustBeOk=false) {
  return new Promise((resolve, reject) => {
    if (ret.type !== 'error') {
      if (responseMustBeOk) {
        if (isAjaxReturnOk(ret.data)) {
          resolve(ret.data);
        } else {
          return Promise.reject(new RouterControllerError(
            'xml_response_not_ok', ret));
        }
      } else {
        resolve(ret.data);
      }
    } else {
      let errorName = getRouterApiErrorName(ret.data.code);
      let message = errorName ? errorName : ret.data.code;
      message += ((ret.data.message) ? ' : ' + ret.data.message : '');
      reject(new RouterApiError(message));
    }
  });
}

/**
 * @typedef GetAjaxDataOptions
 * @property {string} url The url to get ajax data from
 * @property {boolean} [responseMustBeOk]
 * @property {string} [routerUrl] The url of the router. E.g. http://192.168.8.1
 */

/**
 * @param {string} routerUrl
 * @param {GetAjaxDataOptions} options
 * @return {Promise<any>}
 */
function _getAjaxDataDirect(routerUrl, options) {
  let parsedUrl = routerUtils.parseRouterUrl(routerUrl);
  return getTokens().then((tokens) => {
    let headers = {};
    if (tokens.length > 0) {
      headers['__RequestVerificationToken'] = tokens[0];
    }
    return xhrRequestXml({
      url: parsedUrl.origin + '/' + options.url,
      requestHeaders: headers,
    }).then((xhr) => {
      return getProcessedXml(xhr.responseXML, options.responseMustBeOk);
    });
  });
}

/**
 *
 * @param {GetAjaxDataOptions} options
 * @param {boolean} [direct=true]
 * @return {Promise<any>}
 */
export function getAjaxData(options, direct=true) {
  if (direct) {
    if (options.routerUrl) {
      return _getAjaxDataDirect(options.routerUrl, options);
    } else {
    return routerUtils.getRouterUrl().then((routerUrl) => {
      return _getAjaxDataDirect(routerUrl, options);
    });
    }
  } else {
    let message = {
      type: 'command',
      command: 'getAjaxData',
      url: options.url,
    };
    return routerUtils.sendPageMessage(message).then((xml) => {
      let ret = parseXmlString(xml);
      return processXmlResponse(ret, options.responseMustBeOk);
    });
  }
}

/**
 * Gets a page
 * @param {string} url
 * @return {Promise<Document>}
 */
function getPage(url) {
  return xhrRequest({
    url: url, responseType: 'document',
  }).then((xhr) => {
    return xhr.response;
  });
}

// TODO: Improve token storage
export let tokens = null;

/**
 * Gets verification tokens required for making admin requests and logging in
 * @return {Promise<string[]>}
 */
function getRequestVerificationTokens() {
  return routerUtils.getRouterUrl().then((_url) => {
    let url = routerUtils.parseRouterUrl(_url);
    return getPage(url.origin+'/'+'html/home.html').then((doc) => {
      let meta = doc.querySelectorAll('meta[name=csrf_token]');
      let requestVerificationTokens;
      if (meta.length > 0) {
        requestVerificationTokens = [];
        for (let i=0; i < meta.length; i++) {
          requestVerificationTokens.push(meta[i].content);
        }
        return requestVerificationTokens;
      } else {
        return getAjaxData({
          url: 'api/webserver/token',
        }).then((data) => {
          return [data.token];
        });
      }
    });
  });
}

export function refreshTokens() {
  return getRequestVerificationTokens().then((_tokens) => {
    tokens = _tokens;
  });
}

/**
 *
 * @return {Promise<string[]>}
 */
export function getTokens() {
  return new Promise((resolve, reject) => {
    // TODO: Determine why removing resolve breaks this
    if (tokens) {
      resolve(tokens);
    } else {
      return refreshTokens().then(() => {
        resolve(tokens);
      }).catch((e) => {
        reject(e);
      });
    }
  });
}

export function updateTokens(newTokens) {
  tokens = newTokens;
}

/**
 *
 * @param {object} obj
 * @return {string}
 */
export function objectToXml(obj) {
  return '<?xml version="1.0" encoding="UTF-8"?>'+jxon.jsToString(obj);
}

function doRSAEncrypt(str) {
  if (str === '') {
    return '';
  }
  return config.getPublicEncryptionKey().then((publicKey) => {
    let key = new NodeRSA();
    key.importKey({
      n: new Buffer(publicKey.n),
      e: parseInt(publicKey.e, 16),
    }, 'components-public');
    let output = key.encrypt(str, 'hex');
    return output;
  });
}

let ajaxQueue = new Queue();

/**
 * @typedef SaveAjaxDataOptions
 * @property {string} url The url to get ajax data from
 * @property {object} request The POST data to be sent as xml
 * @property {boolean} [responseMustBeOk]
 * @property {boolean} [enc] Whether the request should be encrypted
 * @property {boolean} [enp]
 */

/**
 *
 * @param {SaveAjaxDataOptions} options
 * @return {Promise<any>}
 */
// TODO: Simplify this by splitting up
function _saveAjaxDataDirect(options) {
  return new Promise((resolve, reject) => {
    ajaxQueue.add(() => {
      return routerUtils.getRouterUrl().then((routerUrl) => {
        let parsedUrl = routerUtils.parseRouterUrl(routerUrl);
        return getTokens().then((tokens) => {
        // get copy of tokens to work with
          tokens = tokens.slice();
          return config.getModuleSwitch().then((moduleSwitch) => {
            let xmlString = objectToXml({request: options.request});

            let headers = {};

            // TODO: Fix encryption
            if (options.enc && moduleSwitch.encrypt_enabled) {
              headers['encrypt_transmit'] = 'encrypt_transmit';
              xmlString = doRSAEncrypt(xmlString);
            }

            // TODO: Add 'part_encrypt_transmit' header using data.enpstring

            if (tokens.length > 0) {
              headers['__RequestVerificationToken'] = tokens[0];
              tokens.splice(0, 1);
              updateTokens(tokens);
            }

            return xhrRequestXml({
              url: parsedUrl.origin + '/' + options.url,
              method: 'POST',
              data: xmlString,
              requestHeaders: headers,
            }).then((xhr) => {
              return getProcessedXml(xhr.responseXML, options.responseMustBeOk).then((ret) => {
                if (options.url === 'api/user/login' && tokens.length > 0) {
                // login success, empty token list
                  tokens = [];
                  updateTokens(tokens);
                }
                return ret;
              }).finally((ret) => {
              // get new tokens
                let token = xhr.getResponseHeader('__requestverificationtoken');
                let token1 = xhr.getResponseHeader('__requestverificationtokenone');
                let token2 = xhr.getResponseHeader('__requestverificationtokentwo');
                if (token1) {
                  tokens.push(token1);
                  if (token2) {
                    tokens.push(token2);
                  }
                } else if (token) {
                  tokens.push(token);
                } else {
                  return Promise.reject(
                    new RouterControllerError('ajax_no_tokens', 'Can not get response token'));
                }
                updateTokens(tokens);
                return ret;
              });
            });
          });
        });
      }).then((ret) => {
        resolve(ret);
      }).catch((err) => {
        reject(err);
      });
    });
  });
}

/**
 *
 * @param {SaveAjaxDataOptions} options
 * @return {Promise}
 */
function _saveAjaxDataPage(options) {
  let message = {
    type: 'command',
    command: 'saveAjaxData',
    url: options.url,
    request: options.request,
    options: {enc: options.enc, enp: options.enp},
  };
  return routerUtils.sendPageMessage(message).then((xml) => {
    let ret = parseXmlString(xml);
    return processXmlResponse(ret, options.responseMustBeOk);
  });
}

/**
 *
 * @param {SaveAjaxDataOptions} options
 * @param {boolean} [direct=true]
 * @return {Promise}
 */
export function saveAjaxData(options, direct=true) {
  if (direct) {
    return _saveAjaxDataDirect(options);
  } else {
    return _saveAjaxDataPage(options);
  }
}
