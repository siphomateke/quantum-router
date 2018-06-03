import dialup from './settings/dialup';
import {modes} from '@/store/global.js';
import router from 'huawei-router-api/browser';

const smsTypes = router.sms.types;

export const types = {
  SET: 'SET',
};

export default {
  namespaced: true,
  modules: {
    dialup,
  },
  state: {
    general: {
      defaultMode: modes.ADMIN,
      rememberPassword: true,
    },
    sms: {
      // FIXME: Actually use these
      hideSimBoxes: true,
      confirmationDialogs: ['delete', 'import'],
      typeIcons: {
        [smsTypes.DATA]: 'area-chart',
        [smsTypes.DATA_PERCENT]: 'pie-chart',
        [smsTypes.ACTIVATED]: 'lightbulb-o',
        [smsTypes.DEPLETED]: 'exclamation',
        [smsTypes.AD]: 'bullhorn',
      },
    },
    wlan: {
      moduleEnabled: false,
      ssidList: [
        {'ssid': 'HUAWEI-B315-6DEE', 'security': 'WPA2-PSK', 'status': true},
        {'ssid': 'HUAWEI-B315-6DEE-1', 'security': 'WPA2-PSK', 'status': false},
        {'ssid': 'HUAWEI-B315-6DEE-2', 'security': 'WPA2-PSK', 'status': false},
        {'ssid': 'HUAWEI-B315-6DEE-3', 'security': 'WPA2-PSK', 'status': false},
      ],
      channel: 'auto',
      wifiBandwidth: 'auto',
    },
  },
  mutations: {
    [types.SET](state, payload) {
      state[payload.domain][payload.key] = payload.value;
    },
  },
  actions: {
    set({commit}, payload) {
      commit(types.SET, payload);
    },
    async refreshStatus({dispatch}) {
      dispatch('set', {
        domain: 'dialup',
        key: 'mobileData',
        value: await router.dialup.getMobileDataSwitch(),
      });
    },
  },
};
