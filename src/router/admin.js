'use strict';
import {RouterControllerError} from './error';
import * as ajax from './ajax';
import {Utils} from '@/chrome/core';
import * as routerUtils from './utils';
import shajs from 'sha.js';

/**
 * @typedef StateLogin
 * @property {number} State
 * @property {string} Username
 * @property {number} password_type
 */

/**
 * @return {Promise<StateLogin>}
 */
export function getLoginState() {
  return ajax.getAjaxDataDirect({url: 'api/user/state-login'}).then((data) => {
    return {
      State: parseInt(data.State),
      Username: data.Username,
      password_type: parseInt(data.password_type),
    };
  });
}

export function isLoggedIn() {
  return getLoginState().then((ret) => {
    if (ret.State === 0) {
      return true;
    } else {
      return false;
    }
  });
}

function sha256(str) {
  return shajs('sha256').update(str).digest('hex');
}

export function loginDirect() {
  return getLoginState().then((loginState) => {
    return Utils.getStorage(['username', 'password']).then((storage) => {
      return ajax.getTokens().then((tokens) => {
        let processedPassword;
        if (tokens.length > 0 && loginState.password_type === 4) {
          processedPassword = btoa(sha256(storage.username +
             btoa(sha256(storage.password)) + tokens[0]));
        } else {
          processedPassword = btoa(storage.password);
        }
        return ajax.saveAjaxDataDirect({
          url: 'api/user/login',
          request: {
            Username: storage.username,
            Password: processedPassword,
            password_type: loginState.password_type,
          },
          responseMustBeOk: true,
          enc: false,
        });
      });
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
