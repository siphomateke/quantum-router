/* global browser */
import {Notification} from '@/browser/notification.js';

export const types = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  UPDATE: 'UPDATE',
  CLEAR: 'CLEAR',
};

export default {
  namespaced: true,
  state: {
    all: [],
  },
  getters: {
    unread(state) {
      const list = [];
      for (const n of state.all) {
        if (n.read === false) {
          list.push(n);
        }
      }
      return list;
    },
  },
  mutations: {
    [types.CLEAR](state) {
      state.all = [];
    },
    [types.ADD](state, notifications) {
      state.all = state.all.concat(notifications);
    },
    [types.UPDATE](state, {index, notification}) {
      state.all[index] = notification;
    },
    [types.REMOVE](state, notification) {
      const index = state.all.indexOf(notification);
      state.all.splice(index, 1);
    },
  },
  actions: {
    async load({commit}) {
      const items = await browser.storage.sync.get('notifications');
      commit(types.CLEAR);
      const notifications = [];
      if ('notifications' in items) {
        for (const n of items.notifications) {
          notifications.push(Notification.fromJSON(n));
        }
      }
      commit(types.ADD, notifications);
      return notifications.length;
    },
    // TODO: Evaluate better persistent storage methods
    save({state}) {
      return browser.storage.sync.set({
        notifications: state.all,
      });
    },
    add({commit, dispatch}, notifications) {
      commit(types.ADD, notifications);
      // dispatch('save');
    },
    remove({commit, dispatch}, notification) {
      commit(types.REMOVE, notification);
      // dispatch('save');
    },
  },
};
