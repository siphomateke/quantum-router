import Vue from 'vue';
import App from './App';
import router from './vue-router';
import Vuex from 'vuex';
import Buefy from 'buefy';
import store from './store';
import {modes} from '@/store';
import i18n from '@/chrome/i18n.js';

Vue.config.productionTip = false;

Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

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
