/*global chrome*/
export function init() {
  chrome.runtime.sendMessage({
    from: 'contentScript',
    type: 'loadEvent',
    loadState: 'load'
  });

  window.addEventListener('unload', () => {
    chrome.runtime.sendMessage({
      from: 'contentScript',
      type: 'loadEvent',
      loadState: 'unload'
    });
  });
}

function dispatchMouseEvent(target, ..args) {
  let e = document.createEvent('MouseEvents');
  e.initEvent.apply(e, args);
  target.dispatchEvent(e);
}

export function simulateClick(el) {
  let events = ['mouseover', 'mousedown', 'click', 'mouseup'];
  for (let event of events) {
    dispatchMouseEvent(el[0], event, true, true);
  }
}
