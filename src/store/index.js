import Vue from 'vue';
import Vuex from 'vuex';
import { createSharedMutations } from 'vuex-electron';
import settings from './modules/settings';
import notifications from './modules/notifications';
import sms from './modules/sms';
import dialog from './modules/dialog';
import monitoring from './modules/monitoring';
import global, { modes, modeNames } from './global';

export { modes, modeNames };

Vue.use(Vuex);

export default Object.assign(global, {
  modules: {
    settings,
    notifications,
    sms,
    dialog,
    monitoring,
  },
  plugins: [
    createSharedMutations(),
  ],
});
