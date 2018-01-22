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

export class TabTools {
  /**
   * @param {chrome.tabs.CreateProperties} createProperties
   * @return {Promise}
   */
  static new(createProperties) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create(createProperties, (tab) => {
        if (!chrome.runtime.lastError) {
          resolve(tab);
        } else {
          reject(new Error(chrome.runtime.lastError.message));
        }
      });
    });
  }
  /**
   * @param {object} tab The tab to close
   */
  static close(tab) {
    chrome.tabs.remove(tab.id);
  }

  /**
   * Executes callback function on the active tab in current window
   * @param {function} callback Function to call when the tab is found.
   *                            The tab is passed as an argument to this callback
   */
  static onActive(callback) {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      let activetab = tabs[0];
      callback(activetab);
    });
  }

  static closeActive() {
    TabTools.onActive(TabTools.close);
  }

  /**
   * @param {string} url
   * @param {function} callback
   * @param {boolean} [multiple=false]
   */
  static getByUrl(url, callback, multiple = false) {
    chrome.tabs.query({
      url: url,
    },
    (tabs) => {
      if (multiple) {
        callback(tabs);
      } else {
        callback(tabs[0]);
      }
    });
  }

  /**
   * @param {object}   tab         The tab to check
   * @param {string}   urlPattern  The url pattern
   * @param {function} callback    Function to be called when the query is complete.
   *                               Whether the tab matches or not is passed to this callback
   */
  static tabMatchesUrl(tab, urlPattern, callback) {
    TabTools.getByUrl(urlPattern, (queryTabs) => {
      let foundMatch = false;
      for (let queryTab of queryTabs) {
        if (tab.id == queryTab.id) {
          callback(true);
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) {
        callback(false);
      }
    }, true);
  }
}

/**
 * Used to track tabs specified in the manifest.
 * Sends events like onTabLoad and onTabUnload
 */
export class TabTracker {
  /**
   * @typedef TabTrackerOptions
   * @property {string[]} urlPatterns The url patterns of the tabs to be tracked
   * @property {number[]} tabIds      The IDs of the tabs to be tracked
   */
  /**
   * @param {TabTrackerOptions} options
   */
  constructor(options) {
    this.tabs = {};

    this.urlPatterns = [];
    this.tabIds = [];

    if (typeof options.urlPatterns !== 'undefined') this.urlPatterns = options.urlPatterns;
    if (typeof options.tabIds !== 'undefined') this.tabIds = options.tabIds;

    this.events = new Reactor();
    this.events.registerEvent('onTabLoad');
    this.events.registerEvent('onTabUnload');

    chrome.runtime.onMessage.addListener((request, sender) => {
      // Check if this is one of the tabs we should be tracking
      this._queryTrackTab(sender.tab, (isTrackTab) => {
        if (isTrackTab && request.from == 'contentScript' && request.type == 'loadEvent') {
          if (request.loadState == 'load') {
            this.addTab(sender.tab);
          } else if (request.loadState == 'unload') {
            this.removeTab(sender.tab.id);
          }
        }
      });
    });

    chrome.tabs.onRemoved.addListener((tabId, removed) => {
      if (tabId in this.tabs) {
        this.removeTab(tabId);
      }
    });
  }

  /**
   * Used by _queryTrackTab to iteratively check if a tab matches the list of contentScript urls
   * @param {object} tab
   * @param {number} index
   * @param {boolean} isTrackTab
   * @param {function} callback
   * @private
   */
  _queryTrackTabLoop(tab, index, isTrackTab, callback) {
    if (index < this.urlPatterns.length) {
      let url = this.urlPatterns[index];
      TabTools.tabMatchesUrl(tab, url, (matches) => {
        if (matches) {
          callback(true);
        } else {
          this._queryTrackTabLoop(tab, index + 1, matches, callback);
        }
      });
    } else {
      callback(isTrackTab);
    }
  }

  /**
   * Checks if a tab is one that we wish to track
   * @private
   * @param {object}   tab      The tab to query
   * @param {function} callback Function called when query is complete.
   *                            Whether this is a tab we wish to track is passed to this callback as an argument
   */
  _queryTrackTab(tab, callback) {
    if (typeof tab !== 'undefined' && typeof tab.url !== 'undefined' && this.urlPatterns.length > 0) {
      this._queryTrackTabLoop(tab, 0, false, callback);
    } else if (typeof tab !== 'undefined' && typeof tab.id !== 'undefined' && this.tabIds.length > 0) {
      for (let id of this.tabIds) {
        if (tab.id == id) {
          callback(true);
          break;
        }
      }
      callback(false);
    } else {
      callback(false);
    }
  }

  /** Returns the number of tracks being tracked */
  get numTabs() {
    return Object.keys(this.tabs).length;
  }

  /**
   * Adds a new tab to track and fires the onTabLoad event
   * @param {object} tab The tab to track
   */
  addTab(tab) {
    this.tabs[tab.id] = tab;
    this.events.dispatchEvent('onTabLoad', this.tabs[tab.id]);
  }

  /**
   * Removes a tab being tracked and fires the onTabUnloadEvent
   * @param {number} tabId The id of the tab to remove
   */
  removeTab(tabId) {
    delete this.tabs[tabId];
    this.events.dispatchEvent('onTabUnload', tabId);
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
