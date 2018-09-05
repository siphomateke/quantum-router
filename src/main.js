import Vue from 'vue';
import App from './App';
import router from './vue-router';
import {mapState, mapGetters} from 'vuex';
import Buefy from 'buefy';
import store from './store';
import i18n from '@/platform/i18n';
import {bus} from './events.js';

Vue.config.productionTip = false;

Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

Vue.mixin({
  data: function() {
    return {
      globalBus: bus,
    };
  },
  computed: {
    ...mapState({
      $mode: state => state.mode,
    }),
    ...mapGetters({
      $adminMode: 'adminMode',
    }),
  },
  methods: {
    $i18n: i18n.getMessage,
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
