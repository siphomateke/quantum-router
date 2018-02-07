'use strict';
/* global chrome */

export class Notifier {
  /**
   * @private
   * @param {object} data The notification data
   */
  static _notify(data) {
    data.type = 'basic';
    data.iconUrl = chrome.runtime.getManifest().icons['128'];
    data.title = 'Quantum Router';
    data.isClickable = false;
    chrome.notifications.create('', data);
  }

  /**
   * Creates a chrome notification
   * @param {string} msg  The notification message
   * @param {('error'|'normal')} [type=normal] The type of notification.
   */
  static notify(msg, type = 'normal') {
    if (type == 'error') {
      this._notify({
        'message': 'Error: ' + msg,
      });
    } else {
      this._notify({
        'message': msg,
      });
    }
  }
}

export class Utils {
  static getStorage(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, function(items) {
        if (!chrome.runtime.lastError) {
          resolve(items);
        } else {
          reject(new Error(chrome.runtime.lastError));
        }
      });
    });
  }

  static openOptionsPage() {
    return new Promise((resolve, reject) => {
      chrome.runtime.openOptionsPage(() => {
        if (!chrome.runtime.lastError) {
          resolve();
        } else {
          reject(new Error(chrome.runtime.lastError));
        }
      });
    });
  }
}
