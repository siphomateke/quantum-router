/* global chrome*/
import Vue from 'vue';
import App from './App';
import router from './router';
import Vuex from 'vuex';
import Buefy from 'buefy';
import VsNotify from '@/components/vs-notify';
import store from './store';
import {modes} from '@/store';
import i18n from '@/chrome/i18n.js';

window.addEventListener('unload', () => {
  chrome.runtime.sendMessage({
    from: 'app',
    type: 'loadEvent',
    loadState: 'unload',
  });
});

Vue.config.productionTip = false;

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
  methods: {
    $i18n: function(key, ...args) {
      return i18n.getMessage(key, args);
    },
  },
  filters: {
    $i18n: function(key) {
      return i18n.getMessage(key);
    },
  },
  computed: {
    $mode() {
      return this.$store.state.mode;
    },
    $adminMode() {
      return this.$mode === modes.ADMIN;
    },
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: (h) => h(App),
});
