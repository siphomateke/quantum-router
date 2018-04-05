export const types = {
  SET: 'SET',
};

export default {
  namespaced: true,
  actions: {
    set({commit}, payload) {
      commit(types.SET, payload);
    },
  },
  mutations: {
    [types.SET](state, payload) {
      state[payload.domain] = payload.data;
    },
  },
};
