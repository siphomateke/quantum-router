/* global chrome*/
import Vue from 'vue';
import App from './App.vue';
import Buefy from 'buefy';

Vue.config.productionTip = false;

// FIXME: Buefy icons not showing
Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

Vue.mixin({
  filters: {
    i18n: function(value) {
      return chrome.i18n.getMessage(value);
    },
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: (h) => h(App),
});

