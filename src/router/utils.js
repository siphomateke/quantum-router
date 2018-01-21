'use strict';
import {RouterControllerError} from './error';
import {Utils} from '@/chrome/core';
import * as ajax from './ajax';
/* global chrome */

export function sendRuntimeMessage(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(data, (r) => {
      if (!chrome.runtime.lastError) {
        resolve(r);
      } else {
        reject(new RouterControllerError(
          'chrome_runtime_message_error', chrome.runtime.lastError));
      }
    });
  });
}

export function getTab() {
  return sendRuntimeMessage({
    from: 'app',
    type: 'get',
    get: 'tab',
  }).then((tab) => {
    if (tab) {
      return tab;
    } else {
      return Promise.reject(new RouterControllerError(
        'tabs_not_found', 'No matched tabs open'));
    }
  });
}

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
 *
 * @param {number} id The id of the tab to send a message to
 * @param {object} data Data to send to the tab
 * @return {Promise}
 */
function _sendTabMessage(id, data) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(id, data, (r) => {
      if (!chrome.runtime.lastError) {
        resolve(r);
      } else {
        reject(new RouterControllerError(
          'chrome_tabs_message_error',
          'tabId: '+id+', msg: '+chrome.runtime.lastError.message));
      }
    });
  });
}

/**
 * Sends a message to the router's interface tab
 * @param {object} data
 * @return {Promise}
 */
export function sendTabMessage(data) {
  return getTab().then((tab) => {
    data.from = 'RouterController';
    return _sendTabMessage(tab.id, data);
  });
}

export function sendPageMessage(data) {
  return sendTabMessage({
    command: 'pageMessage',
    data: data,
  });
}

/**
 * Sends a request for the router's global config
 * to determine if there is a connection
 * @param {string} [routerUrl='']
 * @return {Promise}
 */
export function ping(routerUrl='') {
  if (routerUrl) {
    return ajax.getAjaxData({
      url: 'config/global/config.xml',
    }, routerUrl);
  } else {
    return ajax.getAjaxData({url: 'config/global/config.xml'});
  }
}

/**
 * @typedef TrafficStatistics
 * @property {number} CurrentConnectTime
 * @property {number} CurrentDownload
 * @property {number} CurrentDownloadRate
 * @property {number} CurrentUpload
 * @property {number} CurrentUploadRate
 *
 * @property {number} TotalConnectTime
 * @property {number} TotalDownload
 * @property {number} TotalUpload
 * @property {number} TotalDownload
 * @property {number} showtraffic
 */

/**
 * @return {Promise<TrafficStatistics>}
 */
export function getTrafficStatistics() {
  return ajax.getAjaxData({
    url: 'api/monitoring/traffic-statistics',
  });
}
