import { boxTypes } from './constants';

/**
 * Sums boxes counts
 * @param {array} boxTypes The boxes to add to the sum
 * @return {function(): number}
 */
function boxSum(boxTypes) {
  return (state) => {
    let sum = 0;
    for (const boxType of boxTypes) {
      sum += state.boxes[boxType].count;
    }
    return sum;
  };
}

export default {
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
  localFull: (state, getters) => (state.local.max === getters.localTotal),
  simFull: (state, getters) => (state.sim.max === getters.simTotal),
  getVisibleMessagesIds: state => box => state.boxes[box].messages,
  actualMessages: state => (ids) => {
    const messages = [];
    for (const id of ids) {
      if (id in state.messages) {
        messages.push(state.messages[id]);
      }
    }
    return messages;
  },
  allMessages: state => box => state.boxes[box].messages,
  isInbox: state => box => (box === boxTypes.LOCAL_INBOX) || (box === boxTypes.SIM_INBOX),
  numPages: state => (box) => {
    const boxItem = state.boxes[box];
    return Math.ceil(boxItem.count / boxItem.perPage);
  },
};
