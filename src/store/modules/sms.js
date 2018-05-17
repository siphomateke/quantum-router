import Vue from 'vue';
import {Toast} from 'buefy';
import router from 'huawei-router-api/browser';
import i18n from '@/browser/i18n.js';

const routerBoxTypes = router.sms.boxTypes;

/**
 * Mutation types
 */
export const types = {
  SET_COUNT: 'SET_COUNT',
  SET_COUNT_LAST_UPDATED: 'SET_COUNT_LAST_UPDATED',
  SET_LOADING: 'SET_LOADING',
  ADD_MESSAGE: 'ADD_MESSAGE',
  ADD_MESSAGE_TO_BOX: 'ADD_MESSAGE_TO_BOX',
  SET_MESSAGE_READ: 'SET_MESSAGE_READ',
  RESET_MESSAGES: 'RESET_MESSAGES',
  SET_PAGE: 'SET_PAGE',
  SET_SORT_ORDER: 'SET_SORT_ORDER',
  SET_PER_PAGE: 'SET_PER_PAGE',
  SET_LOCAL_MAX: 'SET_LOCAL_MAX',
  SET_SIM_MAX: 'SET_SIM_MAX',
  SET_SELECTED: 'SET_SELECTED',
  ADD_TO_SELECTED: 'ADD_TO_SELECTED',
  CLEAR_SELECTED: 'CLEAR_SELECTED',
  SET_GETTING_SMS_LIST: 'SET_GETTING_SMS_LIST',
};

export const boxTypes = {
  LOCAL_INBOX: 'LOCAL_INBOX',
  LOCAL_SENT: 'LOCAL_SENT',
  LOCAL_DRAFT: 'LOCAL_DRAFT',
  LOCAL_TRASH: 'LOCAL_TRASH',
  SIM_INBOX: 'SIM_INBOX',
  SIM_SENT: 'SIM_SENT',
  SIM_DRAFT: 'SIM_DRAFT',
};

/**
 * Maps box types to the properties returned by the API: getSmsCount
 */
const mapBoxTypeToApi = {
  [boxTypes.LOCAL_INBOX]: 'LocalInbox',
  [boxTypes.LOCAL_SENT]: 'LocalOutbox',
  [boxTypes.LOCAL_DRAFT]: 'LocalDraft',
  [boxTypes.LOCAL_TRASH]: 'LocalDeleted',
  [boxTypes.SIM_INBOX]: 'SimInbox',
  [boxTypes.SIM_SENT]: 'SimOutbox',
  [boxTypes.SIM_DRAFT]: 'SimDraft',
};

/**
 * Maps box types to the router API's internal boxTypes
 */
const mapBoxTypeToRouterBoxType = {
  [boxTypes.LOCAL_INBOX]: routerBoxTypes.INBOX,
  [boxTypes.LOCAL_SENT]: routerBoxTypes.SENT,
  [boxTypes.LOCAL_DRAFT]: routerBoxTypes.DRAFT,
  [boxTypes.LOCAL_TRASH]: routerBoxTypes.TRASH,
  [boxTypes.SIM_INBOX]: routerBoxTypes.SIM_INBOX,
  [boxTypes.SIM_SENT]: routerBoxTypes.SIM_SENT,
  [boxTypes.SIM_DRAFT]: routerBoxTypes.SIM_DRAFT,
};

function generateBox() {
  return {
    /**
     * Object containing page numbers as keys and arrays of message IDs as values
     * @type {Object.<string, number[]>}
     */
    messages: {},
    /**
     * Array of selected messages IDs
     * @type {number[]}
     */
    selected: [],
    /** Total number of messages in this box */
    count: 0,
    loading: false,
    /** The current page */
    page: 1,
    /**
     * The direction messages should be sorted in (ascending or descending)
     * @type {('desc'|'asc')}
     */
    sortOrder: 'desc',
    perPage: 20,
  };
}

const state = {
  local: {
    boxes: [
      boxTypes.LOCAL_INBOX,
      boxTypes.LOCAL_SENT,
      boxTypes.LOCAL_DRAFT,
      boxTypes.LOCAL_TRASH,
    ],
    max: null,
  },
  sim: {
    boxes: [
      boxTypes.SIM_INBOX,
      boxTypes.SIM_SENT,
      boxTypes.SIM_DRAFT,
    ],
    max: null,
  },
  boxes: {},
  messages: {},
  countLastUpdated: null,
  smsCountTimeout: 5000, // TODO: Move this to settings
  gettingSmsList: false,
};

for (const boxType of Object.values(boxTypes)) {
  state.boxes[boxType] = generateBox();
}

/**
 * Sums boxes counts
 * @param {array} boxTypes The boxes to add to the sum
 * @return {number}
 */
function boxSum(boxTypes) {
  return state => {
    let sum = 0;
    for (const boxType of boxTypes) {
      sum += state.boxes[boxType].count;
    }
    return sum;
  };
}

const getters = {
  localTotal: boxSum([
    boxTypes.LOCAL_INBOX,
    boxTypes.LOCAL_SENT,
    boxTypes.LOCAL_DRAFT,
  ]),
  simTotal: boxSum([
    boxTypes.SIM_INBOX,
    boxTypes.SIM_SENT,
    boxTypes.SIM_DRAFT,
  ]),
  getVisibleMessagesIds: state => box => {
    const boxItem = state.boxes[box];
    return boxItem.messages[boxItem.page];
  },
  isInbox: state => box => {
    return box === boxTypes.LOCAL_INBOX;
  },
};

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
const mutations = {
  [types.SET_COUNT]: boxMutation.set('count'),
  [types.SET_COUNT_LAST_UPDATED](state, time) {
    state.countLastUpdated = time;
  },
  [types.SET_LOADING]: boxMutation.set('loading'),
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
};

const actions = {
  setCount({commit}, count) {
    for (const boxType of Object.values(boxTypes)) {
      commit(types.SET_COUNT, {
        box: boxType,
        value: count[mapBoxTypeToApi[boxType]],
      });
    }
    commit(types.SET_LOCAL_MAX, count.LocalMax);
    commit(types.SET_SIM_MAX, count.SimMax);
  },
  setAllLoading({commit}, value) {
    for (const boxType of Object.values(boxTypes)) {
      commit(types.SET_LOADING, {box: boxType, value});
    }
  },
  async getCount({dispatch}) {
    dispatch('setAllLoading', true);
    const count = await router.sms.getSmsCount();
    dispatch('setCount', count);
    dispatch('setAllLoading', false);
  },
  async getCountLenient({state, commit, dispatch}) {
    const now = Date.now();
    if ((now - state.countLastUpdated > state.smsCountTimeout)
    || state.countLastUpdated === null) {
      // NOTE: This sometimes doesn't work possibly due to Vue being slow to commit;
      // dispatch is sometimes run twice in less than smsCountTimeout milliseconds
      commit(types.SET_COUNT_LAST_UPDATED, now);
      dispatch('getCount');
    }
  },
  addMessage({commit}, {box, page, message}) {
    commit(types.ADD_MESSAGE, message);
    commit(types.ADD_MESSAGE_TO_BOX, {box, page, id: message.id});
  },
  async getMessages({state, commit, dispatch}, {box}) {
    const boxItem = state.boxes[box];
    const page = boxItem.page;
    // Only get new messages if current page hasn't been retrieved before
    if (!(page in boxItem.messages)) {
      commit(types.SET_LOADING, {box, value: true});
      dispatch('getCountLenient');
      try {
        let messages = await router.sms.getSmsList({
          boxType: mapBoxTypeToRouterBoxType[box],
          page,
          sortOrder: boxItem.sortOrder,
          perPage: boxItem.perPage,
        });

        // Don't add message if it exists
        messages = messages.filter(m => {
          const id = parseInt(m.Index, 10);
          if (!(id in state.messages)) {
            return true;
          }
          return false;
        });

        for (const m of messages) {
          const smsReadStatus = parseInt(m.Smstat, 10);
          let read = null;
          if (smsReadStatus === 0 || smsReadStatus === 1) {
            read = smsReadStatus === 1;
          }

          dispatch('addMessage', {
            box,
            page,
            message: {
              id: parseInt(m.Index, 10),
              number: m.Phone,
              date: m.Date,
              content: m.Content,
              read,
              parsed: router.sms.parse(m.Content),
            },
          });
        }
      } catch (e) {
        // FIXME: Handle errors
        throw e;
      } finally {
        commit(types.SET_LOADING, {box, value: false});
      }
      // NOTE: If selection is ever possible on more than one page, this will have to go;
      // all checkedRows' IDs should be checked to see if they still exist instead
      commit(types.CLEAR_SELECTED, {box});
    }
  },
  refresh({commit, dispatch}, {box}) {
    commit(types.RESET_MESSAGES, {box});
    dispatch('getMessages', {box});
  },
  setPage({commit, dispatch}, {box, value}) {
    commit(types.SET_PAGE, {box, value});
    dispatch('getMessages', {box});
  },
  setSortOrder({state, commit, dispatch}, {box, value}) {
    commit(types.SET_SORT_ORDER, {box, value});
    commit(types.RESET_MESSAGES, {box});
    dispatch('getMessages', {box});
  },
  setPerPage({commit, dispatch}, {box, value}) {
    commit(types.SET_PER_PAGE, {box, value});
    commit(types.RESET_MESSAGES, {box});
    dispatch('getMessages', {box});
  },
  addToSelected({commit}, payload) {
    commit(types.ADD_TO_SELECTED, payload);
  },
  setSelected({commit}, payload) {
    commit(types.SET_SELECTED, payload);
  },
  selectAll({getters, commit}, {box}) {
    commit(types.SET_SELECTED, {box, ids: getters.getVisibleMessagesIds(box)});
  },
  clearSelected({commit}, payload) {
    commit(types.CLEAR_SELECTED, payload);
  },
  markMessagesAsRead({state, getters, commit, dispatch}, {box, ids}) {
    const promises = [];
    let successful = 0;
    if (getters.isInbox(box)) {
      for (const id of ids) {
        const message = state.messages[id];
        if (message.read === false) {
          promises.push(router.sms.setSmsAsRead(id).then(() => {
            commit(types.SET_MESSAGE_READ, {id, value: true});
            successful += 1;
          }));
        }
      }
    }
    Promise.all(promises).then(() => {
      Toast.open({
        message: 'Marked '+successful+' message(s) as read',
        type: 'is-success',
      });
    }).catch(e => {
      dispatch('handleError', e);
      if (successful > 0) {
        Toast.open({
          message: i18n.getMessage(
            'sms_mark_read_partial_error',
            successful, ids.length),
          type: 'is-danger',
        });
      } else {
        Toast.open({
          message: i18n.getMessage('sms_mark_read_error'),
          type: 'is-danger',
        });
      }
    });
  },
  markSelectedMessagesAsRead({state, dispatch}, {box}) {
    dispatch('markMessagesAsRead', {box, ids: state.boxes[box].selected});
  },
  select({commit, dispatch}, {box, selector}) {
    commit(types.CLEAR_SELECTED, {box});
    // TODO: Improve selector validation
    const validSelectorKeys = ['type', 'read'];
    let validSelector = false;
    for (const key of validSelectorKeys) {
      if (key in selector) {
        validSelector = true;
        break;
      }
    }
    if (validSelector) {
      const boxItem = state.boxes[box];
      for (const id of boxItem.messages[boxItem.page]) {
        const message = state.messages[id];
        let match = true;
        if ('type' in selector && selector.type !== message.parsed.type) {
          match = false;
        }
        if ('read' in selector && selector.read !== message.read) {
          match = false;
        }
        if (match) {
          dispatch('addToSelected', {
            box,
            id: message.id,
          });
        }
      }
    }
  },
  async deleteMessages({commit}, {box, ids}) {
    await router.sms.deleteSms(ids);
    // TODO: delete sms loading indicator
    commit(types.CLEAR_SELECTED, {box});
  },
  async deleteSelectedMessages({state, dispatch}, {box}) {
    await dispatch('deleteMessages', {box, ids: state.boxes[box].selected});
  },
  setGettingSmsList({commit}, value) {
    commit(types.SET_GETTING_SMS_LIST, value);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
