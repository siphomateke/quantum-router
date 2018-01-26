'use strict';
/* global chrome */

/** Class to store event callbacks*/
export class Event {
  constructor(name) {
    this.name = name;
    this.callbacks = [];
  }

  /**
   * @param {function} callback The callback to add
   */
  registerCallback(callback) {
    this.callbacks.push(callback);
  }
}

/** Class to handle event registering, dispatching and eventListeners */
export class Reactor {
  constructor() {
    this.events = {};
  }

  /**
   * @param {string} eventName The new event to add
   */
  registerEvent(eventName) {
    this.events[eventName] = new Event(eventName);
  }

  /**
   * @param {string} eventName The event to trigger
   * @param {Object} eventArgs Arguments to be passed to the event callbacks
   */
  dispatchEvent(eventName, eventArgs) {
    for (let callback of this.events[eventName].callbacks) {
      callback(eventArgs);
    }
  }

  /**
   * @param {string}   eventName The event to add a callback to
   * @param {function} callback  The callback
   */
  addEventListener(eventName, callback) {
    this.events[eventName].registerCallback(callback);
  }
}

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
  /**
   * Promise version of setTimeout
   * @param {number} t
   * @return {Promise}
   */
  static delay(t) {
    return new Promise(function(resolve) {
      setTimeout(resolve, t);
    });
  }

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
}

/**
 * A promise based queue
 */
export class Queue {
  constructor() {
    this.list = [];
  }
  /**
   * Runs a particular item in the queue
   * @param {number} idx
   */
  _runItem(idx) {
    this.list[idx]().finally(() => {
      this._onComplete();
    });
  }
  /**
   * Called when a promise in the queue is complete
   */
  _onComplete() {
    // Remove the completed item from the queue
    if (this.list.length > 0) {
      this.list.splice(0, 1);
    }
    // If there are is another item in the queue, run it
    if (this.list.length > 0) {
      this._runItem(0);
    }
  }
  /**
   * Adds a new promise to the queue
   * @param {function} func A function which returns a promise
   */
  add(func) {
    this.list.push(func);
    if (this.list.length === 1) {
      this._runItem(0);
    }
  }
}
