import Vue from 'vue';
import Vuex from 'vuex';
import notifications from '@/store/modules/notifications.js';
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
    notifications,
  },
  state: {
    mode: modes.OFFLINE,
    settings: {},
  },
  getters: {
    modeName(state) {
      return modeNames[state.mode];
    },
  },
  mutations: {
    [types.MODE](state, mode) {
      state.mode = mode;
    },
    [types.SETTINGS](state, payload) {
      state.settings[payload.domain] = payload.data;
    },
  },
});
