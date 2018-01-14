'use strict';
import {RouterControllerError} from './error';
import * as ajax from './ajax';
import {Utils} from '@/chrome/core';
import * as routerUtils from './utils';

export function getLoginState() {
  return ajax.getAjaxDataDirect({url: 'api/user/state-login'});
}

export function isLoggedIn() {
  return getLoginState().then((ret) => {
    if (parseInt(ret.State) === 0) {
      return true;
    } else {
      return false;
    }
  });
}

function getPage(url) {
  return ajax.request({
    url: url, responseType: 'document',
  }).then((xhr) => {
    return xhr.response;
  });
}

/**
 * Gets a verification token required for making admin requests and logging in
 * @return {Promise<string[]>}
 */
function getRequestVerificationToken() {
  return routerUtils.getRouterUrl().then((url) => {
    return getPage(url+'/'+'html/home.html').then((doc) => {
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
}

export function login() {
  return Utils.getStorage(['username', 'password']).then((items) => {
    return routerUtils.sendPageMessage({
      type: 'command',
      command: 'login',
      credentials: {
        username: items.username,
        password: items.password,
      },
    }).then((pageResponse) => {
      if (pageResponse.type === 'xml') {
        let xmlObject = ajax.parseXmlString(pageResponse.xml);
        return ajax.processXmlResponse(xmlObject);
      } else if (pageResponse.type === 'error') {
        return Promise.reject(new RouterControllerError(pageResponse.error));
      }
    });
  });
}
