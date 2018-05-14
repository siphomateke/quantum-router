export const modes = {
  OFFLINE: 0,
  BASIC: 1,
  ADMIN: 2,
};

export const modeNames = {};

modeNames[modes.OFFLINE] = 'offline';
modeNames[modes.BASIC] = 'basic';
modeNames[modes.ADMIN] = 'admin';

export const types = {
  MODE: 'MODE',
};

export default {
  state: {
    mode: modes.OFFLINE,
  },
  getters: {
    modeName: state => modeNames[state.mode],
    adminMode: state => state.mode === modes.ADMIN,
  },
  actions: {
    setMode({commit}, mode) {
      commit(types.MODE, mode);
    },
  },
  mutations: {
    [types.MODE](state, mode) {
      state.mode = mode;
    },
  },
};
