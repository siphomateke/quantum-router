import Vue from 'vue';
import Vuex from 'vuex';
import settings from '@/store/modules/settings.js';
import notifications from '@/store/modules/notifications.js';
import sms from '@/store/modules/sms.js';
import dialog from '@/store/modules/dialog.js';
import global, {modes, modeNames} from '@/store/global.js';

export {modes, modeNames};

Vue.use(Vuex);
export default new Vuex.Store(Object.assign(global, {
  modules: {
    settings,
    notifications,
    sms,
    dialog,
  },
}));
