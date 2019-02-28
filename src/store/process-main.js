import storeOptions from '@/store';
import Vuex from 'vuex';

export default function createStore() {
  return new Vuex.Store(storeOptions);
}
