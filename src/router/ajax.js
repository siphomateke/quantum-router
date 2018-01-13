'use strict';
import {
  RouterControllerError,
  RouterApiError,
  XhrError,
  apiErrorCodes,
} from './error';
import * as routerUtils from './utils';

export function request(options) {
  options = Object.assign({
    mimeType: null,
    responseType: null,
  }, options);
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', options.url, true);
    if (options.responseType) {
      xhr.responseType = options.responseType;
    }
    if (options.mimeType) {
      xhr.setRequestHeader('Accept', options.mimeType);
      xhr.overrideMimeType(options.mimeType);
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
    xhr.send();
  });
}

export function getXml(url) {
  return request({url: url, mimeType: 'application/xml'}).then((xhr) => {
    if (xhr.responseXML instanceof Document) {
      return xhr.responseXML;
    } else {
      Promise.reject(new XhrError('xhr_invalid_xml',
        'Expected XML to be instance of Document. Got: ' + xhr.responseXML));
    }
  });
}

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

export function xml2object(xml) {
  let obj = {};
  obj.type = xml.documentElement.tagName;
  obj.data = _recursiveXml2Object(xml.documentElement);
  return obj;
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

function _getRouterApiErrorName(code) {
  return apiErrorCodes[code];
}

/**
 *
 * @param {*} ret
 * @param {boolean} responseMustBeOk
 * @return {Promise<any>}
 */
export function _processXmlResponse(ret, responseMustBeOk=false) {
  return new Promise((resolve, reject) => {
    if (ret.type !== 'error') {
      if (responseMustBeOk) {
        if (_isAjaxReturnOk(ret.data)) {
          resolve(ret.data);
        } else {
          return Promise.reject(new RouterControllerError(
            'xml_response_not_ok', ret));
        }
      } else {
        resolve(ret.data);
      }
    } else {
      let errorName = _getRouterApiErrorName(ret.data.code);
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
function _getAjaxDataDirect(routerUrl, data) {
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
  return getXml(parsedUrl.origin + '/' + data.url).then((xml) => {
    const ret = xml2object(xml);
    return _processXmlResponse(ret, data.responseMustBeOk);
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
export function getAjaxDataDirect(data, routerUrl='') {
  if (!routerUrl) {
    return routerUtils.getRouterUrl().then((_routerUrl) => {
      return _getAjaxDataDirect(_routerUrl, data);
    });
  } else {
    return _getAjaxDataDirect(routerUrl, data);
  }
}

/**
 *
 * @param {object} data
 * @param {string} data.url The url to get ajax data from
 * @param {boolean} [data.responseMustBeOk]
 * @return {Promise}
 */
export function getAjaxData(data) {
  data.type = 'command';
  data.command = 'getAjaxData';
  return routerUtils._sendPageMessage(data).then((xml) => {
    let ret = parseXmlString(xml);
    return _processXmlResponse(ret, data.responseMustBeOk);
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
export function saveAjaxData(data) {
  data.type = 'command';
  data.command = 'saveAjaxData';
  return routerUtils._sendPageMessage(data).then((xml) => {
    let ret = parseXmlString(xml);
    return _processXmlResponse(ret, data.responseMustBeOk);
  });
}

/**
 * Checks if an ajax return is valid by checking if the response is 'ok'
 * @private
 * @param   {object}  ret The AJAX return
 * @return {boolean} if the response is ok
 */
export function _isAjaxReturnOk(ret) {
  return ret.toLowerCase() === 'ok';
}
