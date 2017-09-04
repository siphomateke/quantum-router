import {
  Event,
  Reactor,
  TabTools,
  TabTracker,
  core,
  Module
} from './universal.js';

chrome.browserAction.onClicked.addListener(() => {
  TabTools.new(chrome.extension.getURL('../index.html'));
});

chrome.storage.sync.set({
  username: 'admin',
  password: 'mateke#2016'
}, function() {
  console.log('Settings saved');
});
