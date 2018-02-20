/* global browser */
import * as types from '@/store/mutation_types.js';
import {Notification} from '@/browser/notification.js';

export default {
  state: {
    all: [],
  },
  getters: {
    unreadNotifications(state) {
      const list = [];
      for (const n of state.all) {
        if (n.read === false) {
          list.push(n);
        }
      }
      return list;
    },
  },
  actions: {
    async loadNotifications({commit}) {
      const items = await browser.storage.sync.get('notifications');
      commit(types.CLEAR_NOTIFICATIONS);
      const notifications = [];
      if ('notifications' in items) {
        for (const n of items.notifications) {
          notifications.push(Notification.fromJSON(n));
        }
      }
      commit(types.ADD_NOTIFICATIONS, notifications);
      return notifications.length;
    },
    // TODO: Evaluate better persistent storage methods
    saveNotifications({state}) {
      return browser.storage.sync.set({
        notifications: state.all,
      });
    },
    addNotifications({commit, dispatch}, notifications) {
      commit(types.ADD_NOTIFICATIONS, notifications);
      // dispatch('saveNotifications');
    },
    removeNotification({commit, dispatch}, notification) {
      commit(types.REMOVE_NOTIFICATION, notification);
      // dispatch('saveNotifications');
    },
  },
  mutations: {
    [types.CLEAR_NOTIFICATIONS](state) {
      state.all = [];
    },
    [types.ADD_NOTIFICATIONS](state, notifications) {
      state.all = state.all.concat(notifications);
    },
    [types.UPDATE_NOTIFICATION](state, {index, notification}) {
      state.all[index] = notification;
    },
    [types.REMOVE_NOTIFICATION](state, notification) {
      const index = state.all.indexOf(notification);
      state.all.splice(index, 1);
    },
  },
};
