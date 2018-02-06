import router from 'huawei-router-api/browser';
const {RouterControllerError} = router;
import {Utils} from '@/chrome/core';

/**
 * Gets the url of router page from chrome.storage
 * @return {Promise<string>}
 */
export function getRouterUrl() {
  return Utils.getStorage('routerUrl').then((items) => {
    if ('routerUrl' in items) {
      return items.routerUrl;
    } else {
      return Promise.reject(new RouterControllerError(
        'router_url_not_set', 'No router url set in storage'));
    }
  });
}

/**
 * @typedef LoginDetails
 * @property {string} username
 * @property {string} password
 */

/**
 * Gets the username and password from storage
 * @return {Promise<LoginDetails>}
 */
export function getLoginDetails() {
  return Utils.getStorage(['username', 'password']).then((items) => {
    if ('username' in items && 'password' in items) {
      return {
        username: items.username,
        password: items.password,
      };
    } else {
      // TODO: Make this error more detailed and not use 'Error' object
      return Promise.reject(new Error(
        'username or password is not set in storage'));
    }
  });
}
