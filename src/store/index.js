import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    mode: 'offline', // offline -> basic -> admin
    settings: {},
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
