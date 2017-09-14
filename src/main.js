/* global chrome*/
import Vue from 'vue';
import App from './App';
import router from './router';
import Vuex from 'vuex';
import Buefy from 'buefy';

window.addEventListener('unload', () => {
  chrome.runtime.sendMessage({
    from: 'app',
    type: 'loadEvent',
    loadState: 'unload',
  });
});

Vue.config.productionTip = false;

Vue.use(Vuex);
const store = new Vuex.Store({

});
Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: (h) => h(App),
});
