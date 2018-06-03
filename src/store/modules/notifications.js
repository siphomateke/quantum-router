/* global browser */
import {Notification} from '@/browser/notification.js';
import router from 'huawei-router-api/browser';
import {boxTypes} from '@/store/modules/sms';

export const types = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  UPDATE: 'UPDATE',
  CLEAR: 'CLEAR',
  SET_UPDATE_TIME: 'SET_UPDATE_TIME',
};

export default {
  namespaced: true,
  state: {
    all: [],
    lastUpdated: null,
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
    [types.SET_UPDATE_TIME](state, time) {
      state.lastUpdated = time;
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
    setUpdateTime({commit}, time) {
      commit(types.SET_UPDATE_TIME, time);
    },
    async refresh({rootState, state, commit, dispatch}) {
      if (!rootState.sms.gettingSmsList) {
        dispatch('sms/setGettingSmsList', true, {root: true});
        try {
          await dispatch('sms/getCount', null, {root: true});
          const list = await router.sms.getFullSmsList({
            total: rootState.sms.boxes[boxTypes.LOCAL_INBOX].count,
          }, {
            sortOrder: 'desc',
          });
          const newNotifications = [];
          for (const message of list) {
            let exists = false;
            const n = Notification.fromSms(message);

            // Check if this notification is new
            for (const n2 of state.all) {
              if (n.id === n2.id) {
                exists = true;
                break;
              }
            }

            if (!exists) {
              newNotifications.push(n);
            }
          }
          dispatch('add', newNotifications);

          dispatch('setUpdateTime', Date.now());
        } catch (e) {
          dispatch('handleError', e, {root: true});
        } finally {
          dispatch('sms/setGettingSmsList', false, {root: true});
        }
      }
    },
  },
};
