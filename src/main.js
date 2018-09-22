import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import Buefy from 'buefy';
import i18n from '@/platform/i18n';
import App from './App.vue';
import router from './vue-router';
import store from './store';
import bus from './events';
import VirtualCollection from 'vue-virtual-collection';

Vue.config.productionTip = false;

Vue.use(Buefy, {
  defaultIconPack: 'fa',
});

Vue.use(VirtualCollection);

Vue.mixin({
  data() {
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
