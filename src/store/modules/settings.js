export const types = {
  SET: 'SET',
};

export default {
  namespaced: true,
  mutations: {
    [types.SET](state, payload) {
      state[payload.domain] = payload.data;
    },
  },
  actions: {
    set({commit}, payload) {
      commit(types.SET, payload);
    },
  },
};
