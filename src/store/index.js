import Vue from 'vue';
import Vuex from 'vuex';
import settings from '@/store/modules/settings';
import notifications from '@/store/modules/notifications';
import sms from '@/store/modules/sms';
import dialog from '@/store/modules/dialog';
import global, {modes, modeNames} from '@/store/global';

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
