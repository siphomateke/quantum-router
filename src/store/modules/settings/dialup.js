import router from 'huawei-router-api/browser';

export default {
  state: {
    connection: null,
    mobileData: null,
    lte: null,
    networkSearchMode: null,
  },
  getters: {
    roaming: state => {
      return state.connection !== null ? state.connection.RoamAutoConnectEnable : null;
    },
  },
  actions: {
    // FIXME: Handle errors
    async getMobileDataSwitch({dispatch}) {
      const value = await router.dialup.getMobileDataSwitch();
      dispatch('set', {domain: 'dialup', key: 'mobileData', value});
      return value;
    },
    async setMobileDataSwitch({dispatch}, value) {
      await router.dialup.setMobileDataSwitch(value);
      dispatch('set', {domain: 'dialup', key: 'mobileData', value});
    },
    async getRoamingSwitch({dispatch, getters}) {
      const value = await router.dialup.getConnection();
      dispatch('set', {domain: 'dialup', key: 'connection', value});
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
