import Vue from 'vue';
import Vuex from 'vuex';
import settings from '@/store/modules/settings.js';
import notifications from '@/store/modules/notifications.js';
import sms from '@/store/modules/sms.js';
import * as types from '@/store/mutation_types.js';

export const modes = {
  OFFLINE: 0,
  BASIC: 1,
  ADMIN: 2,
};

const modeNames = {};

modeNames[modes.OFFLINE] = 'offline';
modeNames[modes.BASIC] = 'basic';
modeNames[modes.ADMIN] = 'admin';

Vue.use(Vuex);
export default new Vuex.Store({
  modules: {
    settings,
    notifications,
    sms,
  },
  state: {
    mode: modes.OFFLINE,
  },
  getters: {
    mode: state => state.mode,
    modeName: state => modeNames[state.mode],
    adminMode: state => state.mode === modes.ADMIN,
  },
  mutations: {
    [types.MODE](state, mode) {
      state.mode = mode;
    },
  },
});
