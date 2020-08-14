import router from '@/common/huawei-router-api';

export const types = {
  ADD_ENTRY: 'ADD_ENTRY',
};

/** @type {import("vuex").StoreOptions} */
export default {
  namespaced: true,
  state: {
    history: [],
  },
  mutations: {
    [types.ADD_ENTRY](state, entry) {
      state.history.push(entry);
    },
  },
  actions: {
    async getTrafficStatistics({ commit }) {
      const data = await router.monitoring.getTrafficStatistics();
      commit(types.ADD_ENTRY, Object.assign({ date: Date.now() }, data));
    },
  },
};
