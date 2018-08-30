import {Dialog} from 'buefy';
import i18n from '@/platform/i18n';

export const types = {
  ADD_CATEGORY: 'ADD_CATEGORY',
  RESET_CATEGORY: 'RESET_CATEGORY',
  ADD_DIALOG: 'ADD_DIALOG',
};

/**
 * @typedef DialogData
 * @property {boolean} [hasIcon]
 * @property {string} type
 * @property {string} confirmText
 * @property {string} cancelText
 */

/**
 * Adds default dialog parameters
 * @param {*} data
 * @return {DialogData}
 */
function processDialogData(data={}) {
  if (['warning', 'info', 'danger', 'success'].includes(data.type) && !('hasIcon' in data)) {
    data.hasIcon = true;
  }
  if (data.type) {
    data.type = 'is-'+data.type;
  }
  const defaults = {};
  defaults.confirmText = i18n.getMessage('generic_ok');
  defaults.cancelText = i18n.getMessage('generic_cancel');
  return Object.assign(defaults, data);
}

export default {
  namespaced: true,
  state: {
    categories: [],
  },
  mutations: {
    [types.ADD_CATEGORY](state, category) {
      if (!(category in state.categories)) {
        state.categories[category] = [];
      }
    },
    [types.RESET_CATEGORY](state, category) {
      state.categories[category] = [];
    },
    [types.ADD_DIALOG](state, {category, dialog}) {
      state.categories[category].push(dialog);
    },
  },
  actions: {
    closeCategory({state, commit}, category) {
      if (category in state.categories) {
        for (const dialog of state.categories[category]) {
          dialog.close();
        }
        commit(types.RESET_CATEGORY, category);
      }
    },
    open({commit}, {type, data}) {
      data = processDialogData(data);
      // NOTE: We are currently not checking when a dialog is closed.
      // Thus, we can't use this module to check if a dialog is open.
      commit(types.ADD_CATEGORY, data.category);
      commit(types.ADD_DIALOG, {
        category: data.category,
        dialog: Dialog[type](data),
      });
    },
    alert({dispatch}, data) {
      dispatch('open', {type: 'alert', data});
    },
    confirm({dispatch}, data) {
      dispatch('open', {type: 'confirm', data});
    },
    prompt({dispatch}, data) {
      dispatch('open', {type: 'prompt', data});
    },
    warning({dispatch}, data) {
      data.type = 'warning';
      dispatch('confirm', data);
    },
  },
};
