'use strict';
import {RouterControllerError} from './error';
import {Utils} from '@/chrome/core';
import ajax from './ajax';
/* global chrome */

export default {
  sendRuntimeMessage(data) {
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
  },

  getTab() {
    return this.sendRuntimeMessage({
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
  },

  /**
   * Gets the url of router page from chrome.storage
   * @return {Promise<string>}
   */
  getRouterUrl() {
    return Utils.getStorage('routerUrl').then((items) => {
      if ('routerUrl' in items) {
        return items.routerUrl;
      } else {
        return Promise.reject(new RouterControllerError(
          'router_url_not_set', 'No router url set in storage'));
      }
    });
  },

  /**
   *
   * @param {number} id The id of the tab to send a message to
   * @param {object} data Data to send to the tab
   * @return {Promise}
   */
  _sendTabMessage(id, data) {
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
  },

  /**
   * Sends a message to the router's interface tab
   * @param {object} data
   * @return {Promise}
   */
  sendTabMessage(data) {
    return this.getTab().then((tab) => {
      data.from = 'RouterController';
      return this._sendTabMessage(tab.id, data);
    });
  },

  _sendPageMessage(data) {
    return this.sendTabMessage({
      command: 'pageMessage',
      data: data,
    });
  },

  /**
   * Sends a request for the router's global config
   * to determine if there is a connection
   * @param {string} [routerUrl='']
   * @return {Promise}
   */
  ping(routerUrl='') {
    if (routerUrl) {
      return ajax.getAjaxDataDirect({
        url: 'config/global/config.xml',
      }, routerUrl);
    } else {
      return ajax.getAjaxDataDirect({url: 'config/global/config.xml'});
    }
  },

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
  getTrafficStatistics() {
    return ajax.getAjaxDataDirect({
      url: 'api/monitoring/traffic-statistics',
    });
  },
};
