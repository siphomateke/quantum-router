import Vue from 'vue';
import Options from './Options.vue';
import Buefy from 'buefy';
import i18n from '@/chrome/i18n.js';

Vue.config.productionTip = false;

// FIXME: Buefy icons not showing
Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

Vue.mixin({
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
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(Options),
});

