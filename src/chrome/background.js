'use strict';
/* global browser*/

// Set default settings
browser.storage.sync.get({
  routerUrl: 'http://192.168.1.1',
  username: '',
  password: '',
}).then(data => {
  browser.storage.sync.set(data);
});

browser.browserAction.onClicked.addListener(() => {
  // TODO: Show error message if tab can not be opened
  browser.tabs.create({url: browser.extension.getURL('../index.html')});
});
