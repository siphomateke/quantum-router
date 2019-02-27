import Notification from '@/common/notification';
import router from '@/common/huawei-router-api';
import Notifier from '@/platform/notifications';
import bus from '@/events';
import { boxTypes } from '@/store/modules/sms';
import storage from '@/platform/storage';

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
    [types.UPDATE](state, { index, notification }) {
      state.all[index] = notification;
    },
    [types.REMOVE](state, notifications) {
      state.all = state.all.filter(n => !notifications.includes(n));
    },
    [types.SET_LAST_COUNT](state, count) {
      state.lastCount = count;
    },
  },
  actions: {
    async load({ commit }) {
      commit(types.CLEAR);
      const notifications = [];
      // TODO: Consider getting notifications and lastCount at the same time
      if (await storage.has('notifications')) {
        const storedNotifications = await storage.get('notifications');
        for (const n of storedNotifications) {
          notifications.push(Notification.fromJSON(n));
        }
      }
      commit(types.ADD, notifications);
      if (await storage.has('lastCount')) {
        const lastCount = await storage.get('lastCount');
        commit(types.SET_LAST_COUNT, lastCount);
      }
      return notifications.length;
    },
    // TODO: Evaluate better persistent storage methods
    save({ state }) {
      return storage.set({
        notifications: state.all,
        lastCount: state.lastCount,
      });
    },
    add({ commit, dispatch }, notifications) {
      commit(types.ADD, notifications);
      dispatch('save');
    },
    remove({ commit, dispatch }, notifications) {
      commit(types.REMOVE, notifications);
      dispatch('save');
    },
    setLastCount({ commit, dispatch }, count) {
      commit(types.SET_LAST_COUNT, count);
      dispatch('save');
    },
    reduceLastCount({ state, dispatch }, amount) {
      dispatch('setLastCount', state.lastCount - amount);
    },
    async newNotifications({ rootState, dispatch }, { count, first }) {
      // NOTE: This won't wait to run. Instead it depends on being called again
      // This is to prevent a backlog of router requests
      if (!rootState.sms.gettingSmsList) {
        dispatch('sms/setGettingSmsList', true, { root: true });
        try {
          // Get most recent notifications
          const newMessages = await router.sms.getFullSmsList({
            total: count,
            filter: { read: false },
          }, {
            sortOrder: 'desc',
          });
          // Sort oldest to newest (ascending)
          newMessages.reverse();
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
          dispatch('handleError', e, { root: true });
        } finally {
          dispatch('sms/setGettingSmsList', false, { root: true });
        }
      }
    },
    async refresh({ state: { lastCount }, dispatch }) {
      try {
        const data = await router.monitoring.checkNotifications();
        const count = data.UnreadMessage;
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
        dispatch('handleError', e, { root: true });
      }
    },
  },
};
