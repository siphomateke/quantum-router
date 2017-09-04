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
      })
  });
}

function dispatchMouseEvent(target, var_args) {
  let e = document.createEvent("MouseEvents");
  e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
  target.dispatchEvent(e);
};

export function simulateClick(el) {
  let events = ['mouseover', 'mousedown', 'click', 'mouseup'];
  for (let event of events) {
    dispatchMouseEvent(el[0], event, true, true);
  }
}
