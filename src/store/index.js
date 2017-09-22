import Vue from 'vue';
import Vuex from 'vuex';

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
    mode(state, mode) {
      state.mode = mode;
    },
    settings(state, payload) {
      state.settings[payload.domain] = payload.data;
    },
  },
});
