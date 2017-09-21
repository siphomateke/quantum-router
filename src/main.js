/* global chrome*/
import Vue from 'vue';
import App from './App';
import router from './router';
import Vuex from 'vuex';
import Buefy from 'buefy';
import VsNotify from '@/components/vs-notify';

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
  state: {
    settings: {},
  },
  mutations: {
    settings(state, payload) {
      state.settings[payload.domain] = payload.data;
    },
  },
});
Vue.use(Buefy, {
  defaultIconPack: 'fa',
});
Vue.use(VsNotify);

const bus = new Vue();
Vue.mixin({
  data: function() {
    return {
      bus,
    };
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: (h) => h(App),
});
