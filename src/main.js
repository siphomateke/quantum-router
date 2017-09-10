/* global chrome*/
import Vue from 'vue';
import App from './App';
import router from './router';

window.addEventListener('unload', () => {
  chrome.runtime.sendMessage({
    from: 'app',
    type: 'loadEvent',
    loadState: 'unload',
  });
});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: (h) => h(App),
});
