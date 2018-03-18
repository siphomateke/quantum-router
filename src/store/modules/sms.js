import * as types from '@/store/mutation_types.js';
import router from 'huawei-router-api/browser';

export default {
  state: {
    count: null,
  },
  actions: {
    async getSmsCount({commit}) {
      const smsCount = await router.sms.getSmsCount();
      commit(types.SET_SMS_COUNT, smsCount);
    },
  },
  getters: {
    smsCount: state => {
      return state.count;
    },
  },
  mutations: {
    [types.SET_SMS_COUNT](state, count) {
      state.count = count;
    },
  },
};
