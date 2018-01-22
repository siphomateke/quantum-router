'use strict';
import * as admin from './admin';
import * as sms from './sms';
import * as ussd from './ussd';
import * as utils from './utils';
import {RouterControllerError, RouterApiError, XhrError} from './error';

/**
 * Controls access to the router
 */
export default {
  admin: {
    getLoginState: admin.getLoginState,
    isLoggedIn: admin.isLoggedIn,
    login: admin.login,
  },
  sms: {
    types: sms.types,
    boxTypes: sms.boxTypes,
    parse: sms.parse,
    getSmsCount: sms.getSmsCount,
    getSmsList: sms.getSmsList,
    getFullSmsList: sms.getFullSmsList,
    setSmsAsRead: sms.setSmsAsRead,
    createSmsRequest: sms.createSmsRequest,
    saveSms: sms.saveSms,
    getSmsSendStatus: sms.getSmsSendStatus,
    sendSms: sms.sendSms,
    deleteSms: sms.deleteSms,
  },
  ussd: {
    parse: ussd.parse,
    releaseUssd: ussd.releaseUssd,
    getUssdResult: ussd.getUssdResult,
    sendUssdCommand: ussd.sendUssdCommand,
    getUssdConfig: ussd.getUssdConfig,
  },
  utils: {
    getTab: utils.getTab,
    getRouterUrl: utils.getRouterUrl,
    ping: utils.ping,
    getTrafficStatistics: utils.getTrafficStatistics,
  },
};

export {RouterControllerError, RouterApiError, XhrError};
