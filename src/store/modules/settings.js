import * as types from '@/store/mutation_types.js';

export default {
  mutations: {
    [types.SETTINGS](state, payload) {
      state[payload.domain] = payload.data;
    },
  },
};
