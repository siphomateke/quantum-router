'use strict';
/* global chrome*/

// Set default settings
chrome.storage.sync.get({
  routerUrl: 'http://192.168.1.1',
  username: '',
  password: '',
}, data => {
  chrome.storage.sync.set(data);
});

chrome.browserAction.onClicked.addListener(() => {
  // TODO: Show error message if tab can not be opened
  chrome.tabs.create({url: chrome.extension.getURL('../index.html')});
});
