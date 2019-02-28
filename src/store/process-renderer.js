import storeOptions from '@/store';
import Vuex from 'vuex';

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
export default new Vuex.Store(removeActionsFromStore(strippedOptions));
