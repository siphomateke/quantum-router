import {types as notifications} from './modules/notifications';
import {types as sms} from './modules/sms';
import {types as settings} from './modules/settings';

const types = {
  global: {
    MODE: 'MODE',
  },
  notifications,
  sms,
  settings,
};

export default types;
