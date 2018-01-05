'use strict';

export class _XhrUtils {
  request(options) {
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

  getXml(url) {
    return this.request({url: url, mimeType: 'application/xml'}).then((xhr) => {
      if (xhr.responseXML instanceof Document) {
        return xhr.responseXML;
      } else {
        Promise.reject(new XhrError('xhr_invalid_xml',
          'Expected XML to be instance of Document. Got: ' + xhr.responseXML));
      }
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
          if (!(el.tagName in _obj)) {
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

  xml2object(xml) {
    let obj = {};
    obj.type = xml.documentElement.tagName;
    obj.data = this._recursiveXml2Object(xml.documentElement);
    return obj;
  }

  /**
   * Converts an xml string to an object
   * @param {string} xml
   * @return {object}
   */
  parseXmlString(xml) {
    let xmlDocument = new DOMParser().parseFromString(xml, 'application/xml');
    return this.xml2object(xmlDocument);
  }
}

export default new _XhrUtils();
