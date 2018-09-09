import SmsActionDialog from '@/components/sms/dialogs/SmsActionDialog.vue';
import bus from '@/events';
import i18n from '@/platform/i18n';
import { ModalProgrammatic, Toast } from 'buefy';
import router from 'huawei-router-api/browser';
import { boxTypes, mapBoxTypeToApi, mapBoxTypeToRouterBoxType } from './constants';
import types from './mutation_types';

export default {
  setCount({ commit }, count) {
    for (const boxType of Object.values(boxTypes)) {
      commit(types.SET_COUNT, {
        box: boxType,
        value: count[mapBoxTypeToApi[boxType]],
      });
    }
    commit(types.SET_LOCAL_MAX, count.LocalMax);
    commit(types.SET_SIM_MAX, count.SimMax);
  },
  setAllLoading({ commit }, value) {
    for (const boxType of Object.values(boxTypes)) {
      commit(types.SET_LOADING, { box: boxType, value });
    }
  },
  async getCount({ commit, dispatch }) {
    commit(types.SET_COUNT_LOADING, true);
    const promise = router.sms.getSmsCount();
    commit(types.SET_COUNT_REQUEST, promise);
    const count = await promise;
    commit(types.SET_COUNT_REQUEST, null);
    dispatch('setCount', count);
    commit(types.SET_COUNT_LOADING, false);
    commit(types.SET_COUNT_LAST_UPDATED, Date.now());
  },
  /*
  TODO: Do this in a better way so each 'run' or execution has the same count
  rather than using a timeout.
  */
  async getCountLenient({ state, dispatch }) {
    const now = Date.now();
    if ((now - state.countLastUpdated > state.smsCountTimeout)
    || state.countLastUpdated === null) {
      // If count has not already been requested
      if (state.countRequest === null) {
        await dispatch('getCount');
      } else {
        // Wait for the previous request
        await state.countRequest;
      }
    }
  },
  /**
   * Makes sure the current page is valid
   */
  async checkCurrentPage({
    state, commit, getters, dispatch,
  }, { box }) {
    await dispatch('getCountLenient'); // needed in numPages
    const numPages = getters.numPages(box);
    const currentPage = state.boxes[box].page;
    // If the page doesn't exist,
    // roll it back to one that does
    if (currentPage > numPages) {
      let page = currentPage;
      while (page > numPages && page > 1) {
        page -= 1;
      }
      commit(types.SET_PAGE, { box, value: page });
    }
  },
  async reset({ commit, dispatch }, { box }) {
    commit(types.RESET_MESSAGES, { box });
    await dispatch('checkCurrentPage', { box });
  },
  addMessages({ commit }, { box, messages }) {
    commit(types.ADD_MESSAGES, messages);
    commit(types.ADD_MESSAGES_TO_BOX, {
      box,
      ids: messages.map(message => message.id),
    });
  },
  async getMessages({ state, commit, dispatch }, { box }) {
    const boxItem = state.boxes[box];
    commit(types.SET_LOADING, { box, value: true });
    // refresh count to match messages
    await dispatch('getCountLenient');
    try {
      const messages = await router.sms.getFullSmsList({
        total: state.boxes[box].count,
      }, {
        boxType: mapBoxTypeToRouterBoxType[box],
        sortOrder: boxItem.sortOrder,
        perPage: boxItem.perPage,
      });

      const messagesToAdd = [];

      for (const m of messages) {
        const id = parseInt(m.Index, 10);
        // Don't add message if it exists
        if (!(id in state.messages)) {
          const smsReadStatus = parseInt(m.Smstat, 10);
          let read = null;
          if (smsReadStatus === 0 || smsReadStatus === 1) {
            read = smsReadStatus === 1;
          }

          messagesToAdd.push({
            id: parseInt(m.Index, 10),
            number: m.Phone,
            date: m.Date,
            content: m.Content,
            read,
            parsed: router.sms.parse(m.Content),
          });
        }
      }

      dispatch('addMessages', {
        box,
        messages: messagesToAdd,
      });
    } catch (e) {
    // FIXME: Handle errors
      throw e;
    } finally {
      commit(types.SET_LOADING, { box, value: false });
    }
    // NOTE: If selection is ever possible on more than one page, this will have to go;
    // all checkedRows' IDs should be checked to see if they still exist instead
    commit(types.CLEAR_SELECTED, { box });
  },
  async getCurrentPageMessages({ state, dispatch }, { box }) {
    await dispatch('checkCurrentPage', { box });
    await dispatch('getMessages', { box, page: state.boxes[box].page });
  },
  async getAllMessages({ getters, dispatch }, { box }) {
    await dispatch('reset', { box });
    const promises = [];
    for (let i = 0; i < getters.numPages(box); i += 1) {
      promises.push(dispatch('getMessages', {
        box,
        page: i + 1, // PageIndex starts at 1
      }));
    }
    await Promise.all(promises);
  },
  async refresh({ commit, dispatch }, { box }) {
    commit(types.RESET_MESSAGES, { box });
    await dispatch('getCurrentPageMessages', { box });
  },
  async setPage({ commit }, { box, value }) {
    commit(types.SET_PAGE, { box, value });
  },
  async setSortOrder({ commit, dispatch }, { box, value }) {
    commit(types.SET_SORT_ORDER, { box, value });
    commit(types.RESET_MESSAGES, { box });
    await dispatch('getCurrentPageMessages', { box });
  },
  async setPerPage({ commit, dispatch }, { box, value }) {
    commit(types.SET_PER_PAGE, { box, value });
    commit(types.RESET_MESSAGES, { box });
    await dispatch('getCurrentPageMessages', { box });
  },
  addToSelected({ commit }, payload) {
    commit(types.ADD_TO_SELECTED, payload);
  },
  setSelected({ commit }, payload) {
    commit(types.SET_SELECTED, payload);
  },
  selectAll({ getters, commit }, { box }) {
    commit(types.SET_SELECTED, { box, ids: getters.getVisibleMessagesIds(box) });
  },
  clearSelected({ commit }, payload) {
    commit(types.CLEAR_SELECTED, payload);
  },
  openSmsActionDialog({ getters }, { props, events }) {
    const defaultProps = {
      list: [],
      type: 'warning',
      hasIcon: true,
    };
    props = Object.assign(defaultProps, props);
    props.list = getters.actualMessages(props.messages);
    props.type = `is-${props.type}`;
    ModalProgrammatic.open({
      component: SmsActionDialog,
      props,
      events,
    });
  },
  async markMessagesAsRead({
    state, getters, commit, dispatch,
  }, { box, ids }) {
    const promises = [];
    let successful = 0;
    if (getters.isInbox(box)) {
      for (const id of ids) {
        const message = state.messages[id];
        if (message.read === false) {
          promises.push(router.sms.setSmsAsRead(id).then(() => {
            commit(types.SET_MESSAGE_READ, { id, value: true });
            successful += 1;
          }));
        }
      }
    }
    try {
      await Promise.all(promises);
      Toast.open({
        message: `Marked ${successful} message(s) as read`,
        type: 'is-success',
      });
      dispatch('notifications/reduceLastCount', successful, { root: true });
    } catch (e) {
      dispatch('handleError', e, { root: true });
      if (successful > 0) {
        Toast.open({
          message: i18n.getMessage('sms_mark_read_partial_error', {
            successful,
            total: ids.length,
          }),
          type: 'is-danger',
        });
      } else {
        Toast.open({
          message: i18n.getMessage('sms_mark_read_error'),
          type: 'is-danger',
        });
      }
    }
  },
  async markSelectedMessagesAsRead({ state, dispatch }, { box }) {
    await dispatch('markMessagesAsRead', { box, ids: state.boxes[box].selected });
  },
  select({ state, commit, dispatch }, { box, selector }) {
    commit(types.CLEAR_SELECTED, { box });
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
      for (const id of state.boxes[box].messages) {
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
  // TODO: delete sms loading indicator
  // TODO: Test for errors and handle them
  async deleteMessages({ state, commit, dispatch }, { box, ids }) {
    await router.sms.deleteSms(ids);
    if (box === boxTypes.LOCAL_INBOX) {
      let unread = 0;
      for (const id of ids) {
        if (!state.messages[id].read) {
          unread += 1;
        }
      }
      dispatch('notifications/reduceLastCount', unread, { root: true });
    }
    commit(types.CLEAR_SELECTED, { box });
    bus.$emit('refresh:sms');
  },
  async deleteSelectedMessages({ state, dispatch }, { box }) {
    await dispatch('deleteMessages', { box, ids: state.boxes[box].selected });
  },
  deleteSelectedMessagesConfirm({ rootState, state, dispatch }, { box }) {
    const { confirmDialogsToShow } = rootState.settings.internal.sms;
    if (confirmDialogsToShow.includes('delete')) {
      const messages = state.boxes[box].selected;
      dispatch('openSmsActionDialog', {
        props: {
          messages,
          type: 'danger',
          confirmButton: i18n.getMessage('sms_action_delete'),
          confirmMessage: i18n.getMessage('sms_delete_confirm', { count: messages.length }),
        },
        events: {
          confirm: () => dispatch('deleteSelectedMessages', { box }),
        },
      });
    } else {
      dispatch('deleteSelectedMessages', { box });
    }
  },
  setGettingSmsList({ commit }, value) {
    commit(types.SET_GETTING_SMS_LIST, value);
  },
  /**
   * Checks if importing messages from the SIM card is supported on this router
   * @return {Promise.<boolean>}
   */
  async checkImport({ state, commit, dispatch }) {
    try {
      const smsConfig = await router.config.getSmsConfig();
      commit(types.SET_IMPORT_ENABLED, smsConfig.import_enabled);
      return smsConfig.import_enabled;
    } catch (e) {
      dispatch('handleError', e, { root: true });
      return state.importEnabled;
    }
  },
  /**
   * Imports messages from the SIM card
   */
  async import({ dispatch }) {
    try {
      const info = await router.sms.importMessages();
      if (info.successNumber > 0) {
        bus.$emit('refresh:sms');
      }
      Toast.open({
        type: info.successNumber > 0 && info.failNumber === 0 ? 'is-success' : 'is-dark',
        message: i18n.getMessage('sms_import_complete', { success: info.successNumber, fail: info.failNumber }),
      });
    } catch (e) {
      try {
        if (e instanceof router.errors.RouterError) {
          switch (e.code) {
            case 'sms_import_sim_empty':
            // No messages to import
              Toast.open(i18n.getMessage('sms_import_complete', { success: 0, fail: 0 }));
              break;
            case 'sms_not_enough_space':
              dispatch('dialog/alert', {
                type: 'danger',
                message: i18n.getMessage('sms_import_error_not_enough_space'),
              }, { root: true });
              break;
            case 'sms_import_invalid_response':
            // Generic unknown error
              dispatch('dialog/alert', {
                type: 'danger',
                message: i18n.getMessage('sms_import_error_generic'),
              }, { root: true });
              // TODO: Consider if this should bubble to the global event handler.
              // It may be a bit much having two error messages pop-up
              throw e;
            default:
              throw e;
          }
        } else {
          throw e;
        }
      } catch (e) {
        dispatch('handleError', e, { root: true });
      }
    }
  },
  // TODO: Give this a better name.
  async importNotEnoughSpaceConfirm({ state, getters, dispatch }) {
    // If there is space for some but not all messages to be imported, inform user
    const available = state.local.max - getters.localTotal;
    const toImport = getters.simTotal;
    if (!getters.localFull && toImport > available) {
      dispatch('dialog/confirm', {
        message: i18n.getMessage('sms_import_warning_not_enough_space', { available, count: toImport }),
        type: 'warning',
        confirmText: i18n.getMessage('generic_yes'),
        cancelText: i18n.getMessage('generic_no'),
        onConfirm: () => {
          dispatch('import');
        },
      }, { root: true });
    } else {
      dispatch('import');
    }
  },
  // Called before the actual import
  async importConfirm({ rootState, getters, dispatch }) {
    try {
      await dispatch('getCount');

      if (getters.localFull) {
        // This shouldn't happen since the import button gets disabled
        // when the local box is full
        dispatch('dialog/alert', {
          message: i18n.getMessage('sms_import_error_not_enough_space'),
          type: 'warning',
        }, { root: true });
      } else {
        const { confirmDialogsToShow } = rootState.settings.internal.sms;
        if (confirmDialogsToShow.includes('import')) {
          await dispatch('getAllMessages', { box: boxTypes.SIM_INBOX });
          const messages = getters.allMessages(boxTypes.SIM_INBOX);
          dispatch('openSmsActionDialog', {
            props: {
              messages,
              type: 'warning',
              confirmButton: i18n.getMessage('generic_yes'),
              confirmMessage: i18n.getMessage('sms_import_confirm', getters.simTotal),
            },
            events: {
              confirm: () => {
                dispatch('importNotEnoughSpaceConfirm');
              },
            },
          });
        } else {
          dispatch('importNotEnoughSpaceConfirm');
        }
      }
    } catch (e) {
      dispatch('handleError', e, { root: true });
    }
  },
  // TODO: Show send and save status, and allow cancelling. Requires task runner to be implemented
  // TODO: Test send
  async send({ dispatch }, data) {
    try {
      await router.sms.sendSms(data);
    } catch (e) {
      dispatch('handleError', e, { root: true });
    }
    bus.$emit('refresh:sms', boxTypes.LOCAL_DRAFT);
  },
  async save({ dispatch }, data) {
    try {
      await router.sms.saveSms(data);
    } catch (e) {
      if (e instanceof router.errors.RouterError && e.code === 'api_sms_not_enough_space') {
        dispatch('dialog/alert', {
          type: 'danger',
          message: i18n.getMessage('sms_save_not_enough_space'),
        }, { root: true });
      } else {
        dispatch('handleError', e, { root: true });
      }
    }
    bus.$emit('refresh:sms', boxTypes.LOCAL_DRAFT);
  },
};
