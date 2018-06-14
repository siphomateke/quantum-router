import {Notification} from '@/browser/notification.js';
import router from 'huawei-router-api/browser';
import {Notifier} from '@/browser/routerHelper';
import {bus} from '@/events';
import {boxTypes} from '@/store/modules/sms';
import {storage} from '@/browser/routerHelper';

export const types = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  UPDATE: 'UPDATE',
  CLEAR: 'CLEAR',
  SET_LAST_COUNT: 'SET_LAST_COUNT',
};

export default {
  namespaced: true,
  state: {
    all: [],
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
    [types.REMOVE](state, notifications) {
      state.all = state.all.filter(notification => !notifications.includes(notification));
    },
    [types.SET_LAST_COUNT](state, count) {
      state.lastCount = count;
    },
  },
  actions: {
    async load({commit}) {
      const items = await storage.get(['notifications', 'lastCount']);
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
      return storage.set({
        notifications: state.all,
        lastCount: state.lastCount,
      });
    },
    add({commit, dispatch}, notifications) {
      commit(types.ADD, notifications);
      dispatch('save');
    },
    remove({commit, dispatch}, notifications) {
      commit(types.REMOVE, notifications);
      dispatch('save');
    },
    setLastCount({commit, dispatch}, count) {
      commit(types.SET_LAST_COUNT, count);
      dispatch('save');
    },
    reduceLastCount({state, dispatch}, amount) {
      dispatch('setLastCount', state.lastCount - amount);
    },
    async newNotifications({rootState, dispatch}, {count, first}) {
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
          if (!first) {
            bus.$emit('refresh:sms', boxTypes.LOCAL_INBOX);
          }
        } catch (e) {
          dispatch('handleError', e, {root: true});
        } finally {
          dispatch('sms/setGettingSmsList', false, {root: true});
        }
      }
    },
    async refresh({state, dispatch}) {
      try {
        const count = (await router.monitoring.checkNotifications()).UnreadMessage;
        const lastCount = state.lastCount;
        dispatch('setLastCount', count);
        // NOTE: If an SMS is deleted or marked as read and then a
        // notification is received  before the next refresh,
        // using another client such as the app, this won't work
        if (count > lastCount) {
          dispatch('newNotifications', {
            count: count - lastCount,
            first: lastCount === null,
          });
        }
      } catch (e) {
        dispatch('handleError', e, {root: true});
      }
    },
  },
};
