/* global browser */
browser.browserAction.onClicked.addListener(() => {
  // TODO: Show error message if tab can not be opened
  browser.tabs.create({url: browser.extension.getURL('../index.html')});
});
