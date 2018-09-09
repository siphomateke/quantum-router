import { boxTypes } from './constants';

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
  /** @type {Object.<string, Box>} */
  boxes: {},
  messages: {},
  countLoading: false,
  countRequest: null,
  countLastUpdated: null,
  smsCountTimeout: 5000, // TODO: Move this to settings
  gettingSmsList: false,
  importEnabled: false, // TODO: Move this to settings
};

/**
 * @typedef Box
 * @property {Object.<string, number[]>} messages
 * Object containing page numbers as keys and arrays of message IDs as values
 * @property {number[]} selected Array of selected messages IDs
 * @property {number} count Total number of messages in this box
 * @property {boolean} loading
 * @property {number} page The current page
 * @property {('desc'|'asc')} sortOrder The direction messages should be sorted in (ascending or descending)
 * @property {number} perPage
 */

/**
 * @return {Box}
 */
function generateBox() {
  return {
    messages: {},
    selected: [],
    count: 0,
    loading: false,
    page: 1,
    sortOrder: 'desc',
    perPage: 20,
  };
}

for (const boxType of Object.values(boxTypes)) {
  state.boxes[boxType] = generateBox();
}

export default state;
