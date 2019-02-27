import storage from '@/platform/storage';
import dotty from 'dotty';
import router from '@/common/huawei-router-api';
import dialup from './dialup';
import internal from './internal';

export const types = {
  SET: 'SET',
};

export default {
  namespaced: true,
  modules: {
    dialup,
    internal,
  },
  state: {
    wlan: {
      moduleEnabled: false,
      ssidList: [
        { ssid: 'HUAWEI-B315-6DEE', security: 'WPA2-PSK', status: true },
        { ssid: 'HUAWEI-B315-6DEE-1', security: 'WPA2-PSK', status: false },
        { ssid: 'HUAWEI-B315-6DEE-2', security: 'WPA2-PSK', status: false },
        { ssid: 'HUAWEI-B315-6DEE-3', security: 'WPA2-PSK', status: false },
      ],
      channel: 'auto',
      wifiBandwidth: 'auto',
    },
  },
  mutations: {
    [types.SET](state, payload) {
      dotty.put(state, payload.path, payload.value);
    },
  },
  actions: {
    async set({ commit }, payload) {
      commit(types.SET, payload);
    },
    async refreshStatus({ dispatch }) {
      try {
        await dispatch('set', {
          path: 'dialup.mobileData',
          value: await router.dialup.getMobileDataSwitch(),
        });
      } catch (e) {
        dispatch('handleError', e, { root: true });
      }
    },
    save({ state }) {
      return storage.set({
        settings: state.internal,
      });
    },
    async load({ dispatch }) {
      if (await storage.has('settings')) {
        dispatch('set', {
          path: 'internal',
          value: await storage.get('settings'),
        });
      }
    },
  },
};
