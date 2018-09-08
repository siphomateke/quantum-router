import Vue from 'vue';
import types from './mutation_types';

const boxMutation = {
  set(prop, valueName='value') {
    return (state, payload) => {
      state.boxes[payload.box][prop] = payload[valueName];
    };
  },
};

function arraysEqual(arr1, arr2) {
  // NOTE: This could be sped up
  return arr1.join(',') !== arr2.join(',');
}

// TODO: Decide whether to use 'value' in payloads
// or the name of the property being mutated
export default {
  [types.SET_COUNT]: boxMutation.set('count'),
  [types.SET_COUNT_LAST_UPDATED](state, time) {
    state.countLastUpdated = time;
  },
  [types.SET_COUNT_REQUEST](state, request) {
    state.countRequest = request;
  },
  [types.SET_LOADING]: boxMutation.set('loading'),
  [types.SET_COUNT_LOADING](state, loading) {
    state.countLoading = loading;
  },
  [types.ADD_MESSAGE](state, message) {
    Vue.set(state.messages, message.id, message);
  },
  [types.ADD_MESSAGE_TO_BOX](state, {box, page, id}) {
    const messages = state.boxes[box].messages;
    // Add page if it doesn't exist
    if (!(page in messages)) {
      Vue.set(messages, page, []);
    }
    messages[page].push(id);
  },
  [types.SET_MESSAGE_READ](state, {id, value}) {
    state.messages[id].read = value;
  },
  [types.SET_PAGE]: boxMutation.set('page'),
  [types.SET_SORT_ORDER]: boxMutation.set('sortOrder'),
  [types.SET_PER_PAGE]: boxMutation.set('perPage'),
  [types.RESET_MESSAGES](state, {box}) {
    // TODO: Auto-expire messages after a certain amount of time
    const boxItem = state.boxes[box];
    for (const messages of Object.values(boxItem.messages)) {
      for (const id of messages) {
        delete state.messages[id];
      }
    }
    boxItem.messages = {};
  },
  [types.ADD_TO_SELECTED](state, {box, id}) {
    state.boxes[box].selected.push(id);
  },
  [types.SET_SELECTED](state, {box, ids}) {
    const currentValue = state.boxes[box].selected;
    // Only mutate if value has changed.
    // This is to prevent infinite loops due to vue not being able
    // detect if an array has changed in watch functions.
    if (arraysEqual(ids, currentValue)) {
      state.boxes[box].selected = ids;
    }
  },
  [types.CLEAR_SELECTED](state, {box}) {
    state.boxes[box].selected = [];
  },
  [types.SET_LOCAL_MAX](state, max) {
    state.local.max = max;
  },
  [types.SET_SIM_MAX](state, max) {
    state.sim.max = max;
  },
  [types.SET_GETTING_SMS_LIST](state, value) {
    state.gettingSmsList = value;
  },
  [types.SET_IMPORT_ENABLED](state, value) {
    state.importEnabled = value;
  },
};
