/* global browser */
import {Notification} from '@/browser/notification.js';
import router from 'huawei-router-api/browser';
import {Notifier} from '@/browser/routerHelper';

export const types = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  UPDATE: 'UPDATE',
  CLEAR: 'CLEAR',
  SET_UPDATE_TIME: 'SET_UPDATE_TIME',
  SET_LAST_COUNT: 'SET_LAST_COUNT',
};

export default {
  namespaced: true,
  state: {
    all: [],
    lastUpdated: null,
    lastCount: null,
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
    [types.SET_LAST_COUNT](state, count) {
      state.lastCount = count;
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
      if ('lastCount' in items) {
        commit(types.SET_LAST_COUNT, items.lastCount);
      }
      return notifications.length;
    },
    // TODO: Evaluate better persistent storage methods
    save({state}) {
      return browser.storage.sync.set({
        notifications: state.all,
        lastCount: state.lastCount,
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
    reduceLastCount({state, commit}, amount) {
      commit(types.SET_LAST_COUNT, state.lastCount - amount);
    },
    async newNotifications({rootState, dispatch}, count) {
      // NOTE: This won't wait to run. Instead it depends on being called again
      // This is to prevent a backlog of router requests
      if (!rootState.sms.gettingSmsList) {
        dispatch('sms/setGettingSmsList', true, {root: true});
        try {
          const newMessages = await router.sms.getFullSmsList({
            total: count,
            filter: {read: false},
          }, {
            sortOrder: 'desc',
          });
          const newNotifications = [];
          for (const message of newMessages) {
            const n = Notification.fromSms(message);
            Notifier.notify({
              title: n.title,
              message: n.message,
            });
            newNotifications.push(n);
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
    async refresh({rootState, state, commit, dispatch}) {
      try {
        const count = (await router.monitoring.checkNotifications()).UnreadMessage;
        // NOTE: If an SMS is deleted or marked as read and then a
        // notification is received  before the next refresh,
        // using another client such as the app, this won't work
        if (count > state.lastCount) {
          dispatch('newNotifications', count - state.lastCount);
        }
        commit(types.SET_LAST_COUNT, count);
      } catch (e) {
        dispatch('handleError', e, {root: true});
      }
    },
  },
};
