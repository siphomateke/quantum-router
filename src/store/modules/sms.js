import router from 'huawei-router-api/browser';

export const types = {
  SET_COUNT: 'SET_COUNT',
};

export default {
  namespaced: true,
  state: {
    count: null,
  },
  actions: {
    async getCount({commit}) {
      const smsCount = await router.sms.getSmsCount();
      commit(types.SET_COUNT, smsCount);
    },
  },
  getters: {
    count: state => state.count,
  },
  mutations: {
    [types.SET_COUNT](state, count) {
      state.count = count;
    },
  },
};
