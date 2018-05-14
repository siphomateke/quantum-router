import {types as notifications} from './modules/notifications';
import {types as sms} from './modules/sms';
import {types as settings} from './modules/settings';
import {types as dialog} from './modules/dialog';

const types = {
  global: {
    MODE: 'MODE',
  },
  notifications,
  sms,
  settings,
  dialog,
};

export default types;
