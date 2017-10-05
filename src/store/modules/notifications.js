import * as types from '@/store/mutation_types.js';

export default {
  state: {
    all: [],
  },
  getters: {
    unreadNotifications(state) {
      let list = [];
      for (let n of state.all) {
        if (n.read === false) {
          list.push(n);
        }
      }
      return list;
    },
  },
  actions: {
    addNotification({commit}, notification) {
      commit(types.ADD_NOTIFICATION, notification);
    },
    removeNotification({commit, state}, notification) {
      commit(types.REMOVE_NOTIFICATION, notification);
    },
  },
  mutations: {
    [types.ADD_NOTIFICATION](state, notification) {
      state.all.push(notification);
    },
    [types.REMOVE_NOTIFICATION](state, notification) {
      let index = state.all.indexOf(notification);
      state.all.splice(index, 1);
    },
  },
};
