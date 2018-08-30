import {Toast} from 'buefy';
import i18n from '@/platform/i18n';
import storage from '@/platform/storage';
import router from 'huawei-router-api/browser';
import * as routerHelper from '@/browser/routerHelper';
const {RouterError} = router.errors;

export const modes = {
  OFFLINE: 0,
  BASIC: 1,
  ADMIN: 2,
};

export const modeNames = {};

modeNames[modes.OFFLINE] = 'offline';
modeNames[modes.BASIC] = 'basic';
modeNames[modes.ADMIN] = 'admin';

export const types = {
  MODE: 'MODE',
  SET_LOADING: 'SET_LOADING',
  SET_LOGGING_IN: 'SET_LOGGING_IN',
};

async function updateConfig() {
  const data = await storage.getLoginDetails();
  router.config.setUsername(data.username);
  router.config.setPassword(data.password);
  const url = await storage.getRouterUrl();
  router.config.setUrl(url);
}

export default {
  state: {
    mode: modes.OFFLINE,
    loading: false,
    loggingIn: false,
  },
  getters: {
    modeName: state => modeNames[state.mode],
    adminMode: state => state.mode === modes.ADMIN,
  },
  mutations: {
    [types.MODE](state, mode) {
      state.mode = mode;
    },
    [types.SET_LOADING](state, loading) {
      state.loading = loading;
    },
    [types.SET_LOGGING_IN](state, value) {
      state.loggingIn = value;
    },
  },
  actions: {
    handleError({dispatch}, e) {
      if (process.env.NODE_ENV === 'development') {
        console.error(e.toString());
      }
      let unknown = false;
      if (e instanceof RouterError) {
        const adminError = [
          'api_wrong_session',
          'api_wrong_session_token',
          'api_voice_busy',
          'api_system_no_rights',
        ];
        if (adminError.includes(e.code)) {
          dispatch('changeMode', modes.BASIC);
        } else if (router.errors.isErrorInCategory(e.code, 'connection')) {
          dispatch('changeMode', modes.OFFLINE);
        } else if (e.code === 'invalid_router_url') {
          if (router.config.getUrl().length > 0) {
            dispatch('dialog/warning', {
              message: i18n.getMessage('invalid_router_url_error', {url: router.config.getUrl()}),
              confirmText: i18n.getMessage('dialog_open_settings'),
              onConfirm: () => {
                routerHelper.openOptionsPage();
              },
              category: 'admin',
            });
          } else {
            dispatch('dialog/warning', {
              message: i18n.getMessage('empty_router_url_error'),
              confirmText: i18n.getMessage('dialog_open_settings'),
              onConfirm: () => {
                routerHelper.openOptionsPage();
              },
              category: 'admin',
            });
          }
        } else {
          unknown = true;
        }
      } else {
        unknown = true;
      }
      if (unknown) {
        let message;
        if (e instanceof RouterError) {
          message = e.code+' : '+e.message;
        } else {
          message = e.message;
        }
        Toast.open({
          type: 'is-danger',
          message: 'Error: ' + message,
        });
      }
      // TODO: log errors
    },
    setMode({commit}, mode) {
      commit(types.MODE, mode);
    },
    changeMode({state, dispatch}, mode) {
      if (mode !== state.mode) {
        dispatch('setMode', mode);
        Toast.open(i18n.getMessage('changed_mode_to', {mode: i18n.getMessage('mode_'+modeNames[mode])}));
      }
    },
    async prepChangeMode({commit, dispatch}, newMode) {
      try {
        await updateConfig();
        if (newMode === modes.BASIC || newMode === modes.ADMIN) {
          try {
            await router.utils.ping();
            if (newMode === modes.BASIC) {
              return true;
            } else if (newMode === modes.ADMIN) {
              try {
                commit(types.SET_LOGGING_IN, true);
                await router.admin.login();
                commit(types.SET_LOGGING_IN, false);
                return true;
              } catch (e) {
                let errorMessage = i18n.getMessage('router_unknown_error_logging_in');
                if (e instanceof RouterError) {
                  if (e.code === 'api_login_already_login') {
                    return true;
                  }
                  const knownErrors = [
                    'api_login_username_wrong',
                    'api_login_password_wrong',
                    'api_login_username_pwd_wrong',
                    'api_login_username_pwd_orerrun',
                  ];
                  if (knownErrors.includes(e.code)) {
                    const actualError = i18n.getMessage('router_module_error_'+e.code);
                    errorMessage = i18n.getMessage('router_error_logging_in', {error: actualError});
                  }
                } else {
                  dispatch('handleError', e);
                }
                dispatch('dialog/warning', {
                  message: errorMessage,
                  confirmText: i18n.getMessage('dialog_retry'),
                  onConfirm: () => {
                    dispatch('tryChangeMode', newMode);
                  },
                  category: 'admin',
                });
                return false;
              }
            }
          } catch (e) {
            // Handle ping errors
            if (e instanceof RouterError && router.errors.isErrorInCategory(e.code, 'connection')) {
              dispatch('dialog/warning', {
                message: i18n.getMessage('connection_error', {url: router.config.getUrl()}),
                confirmText: i18n.getMessage('dialog_retry'),
                onConfirm: () => {
                  dispatch('tryChangeMode', newMode);
                },
                category: 'admin',
              });
              return false;
            } else {
              throw e;
            }
          }
        } else {
          return true;
        }
      } catch (e) {
        dispatch('handleError', e);
        return false;
      }
    },
    async tryChangeMode({state, commit, dispatch}, newMode) {
      if (newMode === modes.ADMIN) {
        dispatch('dialog/closeCategory', 'admin');
      }
      commit(types.SET_LOADING, true);
      const ready = await dispatch('prepChangeMode', newMode);
      if (ready) dispatch('changeMode', newMode);
      commit(types.SET_LOADING, false);
    },
  },
};
