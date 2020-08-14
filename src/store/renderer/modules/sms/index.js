import state from './state';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import types from './mutation_types';

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export * from './constants';
export { types };
