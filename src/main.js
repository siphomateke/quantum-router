import Vue from 'vue';
import App from './App';
import router from './vue-router';
import {mapGetters} from 'vuex';
import Buefy from 'buefy';
import store from './store';
import {modes} from '@/store';
import i18n from '@/browser/i18n.js';

Vue.config.productionTip = false;

Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

const bus = new Vue();
/*
Global events

refresh:second
refresh:basic
refresh:sms(boxType)
refresh:notifications
refresh:graph

mode-change:admin
mode-change:basic
mode-change:offline
*/
Vue.mixin({
  data: function() {
    return {
      globalBus: bus,
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
    ...mapGetters({
      $mode: 'mode',
      $adminMode: 'adminMode',
    }),
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
