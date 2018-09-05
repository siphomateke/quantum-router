import router from 'huawei-router-api/browser';

export default {
  state: {
    connection: null,
    mobileData: null,
    lte: null,
    networkSearchMode: null,
  },
  getters: {
    roaming: state => state.connection !== null ? state.connection.RoamAutoConnectEnable : null,
  },
  actions: {
    // FIXME: Handle errors
    async getMobileDataSwitch({dispatch}) {
      const value = await router.dialup.getMobileDataSwitch();
      await dispatch('set', {path: 'dialup.mobileData', value});
      return value;
    },
    async setMobileDataSwitch({dispatch}, value) {
      await router.dialup.setMobileDataSwitch(value);
      await dispatch('set', {path: 'dialup.mobileData', value});
    },
    async getRoamingSwitch({dispatch, getters}) {
      const value = await router.dialup.getConnection();
      await dispatch('set', {path: 'dialup.connection', value});
      return getters.roaming;
    },
    async setRoamingSwitch({state, dispatch}, value) {
      const connection = {
        roamAutoConnectEnable: value,
        maxIdleTime: state.connection.MaxIdelTime,
        connectMode: state.connection.ConnectMode,
        mtu: state.connection.MTU,
        autoDialSwitch: state.connection.auto_dial_switch,
        pdpAlwaysOn: state.connection.pdp_always_on,
      };
      await router.dialup.setConnection(connection);
      dispatch('getRoamingSwitch');
    },
  },
};
