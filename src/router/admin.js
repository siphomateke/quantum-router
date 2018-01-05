'use strict';
import {RouterControllerError} from './error';
import ajax from './ajax';
import {Utils} from '@/chrome/core';
import routerUtils from './utils';

export default {
  getLoginState() {
    return ajax.getAjaxDataDirect({url: 'api/user/state-login'});
  },

  isLoggedIn() {
    return this.getLoginState().then((ret) => {
      if (parseInt(ret.State) === 0) {
        return true;
      } else {
        return false;
      }
    });
  },

  getPage(url) {
    return ajax.request({
      url: url, responseType: 'document',
    }).then((xhr) => {
      return xhr.response;
    });
  },

  /**
   * Gets a verification token required for making admin requests and logging in
   * @return {Promise<string[]>}
   */
  getRequestVerificationToken() {
    return routerUtils.getRouterUrl().then((url) => {
      return this.getPage(url+'/'+'html/home.html').then((doc) => {
        let meta = doc.querySelectorAll('meta[name=csrf_token]');
        let requestVerificationToken;
        if (meta.length > 0) {
          requestVerificationToken = [];
          for (let i=0; i < meta.length; i++) {
            requestVerificationToken.push(meta[i].content);
          }
          return requestVerificationToken;
        } else {
          return ajax.getAjaxDataDirect({
            url: 'api/webserver/token',
          }).then((data) => {
            return [data.token];
          });
        }
      });
    });
  },

  login() {
    return Utils.getStorage(['username', 'password']).then((items) => {
      return routerUtils._sendPageMessage({
        type: 'command',
        command: 'login',
        credentials: {
          username: items.username,
          password: items.password,
        },
      }).then((pageResponse) => {
        if (pageResponse.type === 'xml') {
          let xmlObject = ajax.parseXmlString(pageResponse.xml);
          return ajax._processXmlResponse(xmlObject);
        } else if (pageResponse.type === 'error') {
          return Promise.reject(new RouterControllerError(pageResponse.error));
        }
      });
    });
  },
};
