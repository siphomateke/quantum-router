/*global chrome*/
import { TabTools, TabTracker } from './core.js';

let appLoaded = false;

chrome.browserAction.onClicked.addListener(() => {
  if (!appLoaded) {
    TabTools.new(chrome.extension.getURL('../index.html'));
  }
});

const router = {
  tabTracker: new TabTracker({
    'urlPatterns': chrome.runtime.getManifest().content_scripts[0].matches
  }),
  ready: false
};

function notifyApp() {
  console.log('Tell app router content script loaded');
  chrome.runtime.sendMessage({
    from: 'background',
    type: 'ready'
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.from) {
  case 'routerContent': {
    if (request.type === 'ready') {
      router.ready = true;
      if (appLoaded) {
        notifyApp();
      }
    }
    break;
  } case 'app': {
    switch (request.type) {
    case 'get': {
      switch (request.get) {
      case 'numTabs':
        sendResponse(router.tabTracker.numTabs);
        break;
      case 'tab':
        if (router.tabTracker.numTabs > 0) {
          const tab = router.tabTracker.tabs[Object.keys(router.tabTracker.tabs)[0]];
          sendResponse(tab);
        } else {
          sendResponse(null);
        }
        break;
      }
      break;
    } case 'loadEvent': {
      console.log('App '+request.loadState);
      console.log(request);
      appLoaded = (request.loadState == 'load');
      if (router.ready) {
        notifyApp();
      }
      break;
    }
    }
    break;
  }
  }
});
