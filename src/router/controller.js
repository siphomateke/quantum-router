'use strict';
import admin from './admin';
import ajax from './ajax';
import sms from './sms';
import ussd from './ussd';
import utils from './utils';

/**
 * Controls access to the router
 */
export default {
  admin: admin,
  ajax: ajax,
  sms: sms,
  ussd: ussd,
  utils: utils,
};
