'use strict';
import {
  RouterControllerError,
  RouterApiError,
  XhrError,
  getRouterApiErrorName,
} from './error';
import * as routerUtils from './utils';

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
 * @return {Promise<Document>}
 */
export function getXml(xhrOptions) {
  xhrOptions = Object.assign({
    mimeType: 'application/xml',
  }, xhrOptions);
  return xhrRequest(xhrOptions).then((xhr) => {
    if (xhr.responseXML instanceof Document) {
      return xhr.responseXML;
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
 * @param {string} routerUrl
 * @param {object} data
 * @param {string} data.url The url to get ajax data from
 *                          e.g 'response' would  expect a <response> tag
 * @return {Promise}
 */
// TODO: Simplify JSDoc
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
  return getXml({url: parsedUrl.origin + '/' + data.url}).then((xml) => {
    const ret = xml2object(xml);
    return processXmlResponse(ret, data.responseMustBeOk);
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
// TODO: Simplify JSDoc
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
  return routerUtils.sendPageMessage(data).then((xml) => {
    let ret = parseXmlString(xml);
    return processXmlResponse(ret, data.responseMustBeOk);
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
  return routerUtils.sendPageMessage(data).then((xml) => {
    let ret = parseXmlString(xml);
    return processXmlResponse(ret, data.responseMustBeOk);
  });
}
