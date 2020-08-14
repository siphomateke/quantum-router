import storeOptions from '@/store';
import Vuex from 'vuex';
import { ipcRenderer } from 'electron';
import { Dialog } from 'buefy';

/**
 * @param {import('vuex').StoreOptions} storeOptions
 * @returns {import('vuex').StoreOptions}
 */
function removeActionsFromStore(storeOptions) {
  delete storeOptions.actions;
  if (storeOptions.modules) {
    for (const moduleName of Object.keys(storeOptions.modules)) {
      storeOptions.modules[moduleName] = removeActionsFromStore(storeOptions.modules[moduleName]);
    }
  }
  return storeOptions;
}

const strippedOptions = Object.assign({}, storeOptions);
const store = new Vuex.Store(removeActionsFromStore(strippedOptions));

/** @type {import('vuex').StoreOptions} */
const extraStoreOptions = {
  modules: {
    dialog: {
      namespaced: true,
      actions: {
        open(context, { type, data }) {
          Dialog[type](data);
        },
      },
    },
  },
};

const rendererStore = new Vuex.Store(extraStoreOptions);

ipcRenderer.on('show-dialog', (event, message) => {
  console.log(message);
  rendererStore.dispatch('dialog/open', message);
});

export default store;
