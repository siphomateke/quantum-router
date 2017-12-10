import * as types from '@/store/mutation_types.js';
import {Notification} from '@/chrome/notification.js';
import {Utils} from '@/chrome/core';
/* global chrome*/

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
    loadNotifications({commit}) {
      return Utils.getStorage('notifications').then((items) => {
        commit(types.CLEAR_NOTIFICATIONS);
        let notifications = [];
        for (let n of items.notifications) {
          notifications.push(Notification.fromJSON(n));
        }
        commit(types.ADD_NOTIFICATIONS, notifications);
        return items.notifications.length;
      });
    },
    // TODO: Evaluate better persistent storage methods
    saveNotifications({state}) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set({
          notifications: state.all,
        }, () => {
          if (!chrome.runtime.lastError) {
            resolve();
          } else {
            reject(chrome.runtime.lastError);
          }
        });
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
      let index = state.all.indexOf(notification);
      state.all.splice(index, 1);
    },
  },
};
