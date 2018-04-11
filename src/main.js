import Vue from 'vue';
import devtools from '@vue/devtools';
import App from './App';
import router from './vue-router';
import {mapState, mapGetters} from 'vuex';
import Buefy from 'buefy';
import store from './store';
import i18n from '@/browser/i18n.js';

if (process.env.NODE_ENV !== 'development') {
  devtools.connect();
}

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
    ...mapState({
      $mode: state => state.mode,
    }),
    ...mapGetters({
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
