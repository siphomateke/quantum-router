'use strict';
import {RouterControllerError, RouterApiError} from './error';
import {Utils} from '@/chrome/core';
import * as ajax from './ajax';

/**
 * Get's USSD options from a message string.
 * E.g
 * 1. WhatsApp pack
 * 2. Facebook pack
 * 3. Nightly bundle
 * @param {string} message
 * @return {Object.<string, string>}
 */
function _getOptions(message) {
  let foundOptions = message.match(/(^.|\n.)+\. (.+)/gi);
  let options = {};
  if (foundOptions) {
    foundOptions.map((element) => {
      let regExp = /((^.|\n.)+)\. /;
      let match = regExp.exec(element);
      let key = match[1].replace(/\n/, '');
      options[key] = element.replace(/(^.|\n.)+\. /i, '');
    });
  }
  return options;
}

export function parse(message) {
  let options = _getOptions(message);
  let content = message;
  if (options) {
    content = content.replace(/(^.|\n.)+\.((.|\n)+)/i, '');
  }
  return {
    content: content,
    options: options,
  };
}

/**
 * Releases previous USSD result. Must be called after getting a USSD result.
 * @return {Promise<boolean>}
 */
export function releaseUssd() {
  return ajax.getAjaxDataDirect({url: 'api/ussd/release'}).then((ret) => {
    if (ajax.isAjaxReturnOk(ret)) {
      return true;
    } else {
      return Promise.reject(new RouterControllerError(
        'ussd_release_fail'));
    }
  });
}

/**
 * @typedef UssdResult
 * @property {string} content
 */

/**
 * Get's the result of a USSD command. Waits for result
 * @return {Promise<UssdResult>}
 */
export function getUssdResult() {
  return ajax.getAjaxDataDirect({
    url: 'api/ussd/get',
  }).catch((err) => {
    if (err instanceof RouterApiError) {
      if (err.code === 'ERROR_USSD_PROCESSING') {
        return Utils.delay(1000).then(() => {
          return getUssdResult();
        });
      } else if (err.code == 'ERROR_USSD_TIMEOUT') {
        releaseUssd();
        return Promise.reject(new RouterControllerError(
          'ussd_timeout'));
      }
    } else {
      return Promise.reject(err);
    }
  });
}

/**
 * Sends a USSD command to the router
 * @param {string}   command  the command to send
 * @return {Promise<UssdResult>}
 */
export async function sendUssdCommand(command) {
  return ajax.saveAjaxData({
    url: 'api/ussd/send',
    request: {
      content: command,
      codeType: 'CodeType',
      timeout: '',
    },
    responseMustBeOk: true,
  }).then((ret) => {
    return getUssdResult();
  });
}

/**
 * @typedef UssdConfigMenuItem
 * @property {string} Name
 * @property {string} Command
 */

/**
 * @typedef UssdConfigMenu
 * @property {UssdConfigMenuItem[]} MenuItem
 */

/**
 * @typedef UssdConfigGeneral
 * @property {string} Action
 * @property {string} Description
 * @property {string} LimitText
 * @property {UssdConfigMenu} Menu
 * @property {string} Title
 */

/**
 * @typedef _UssdConfig
 * @property {UssdConfigGeneral} General
 */

/**
 * @typedef UssdConfig
 * @property {_UssdConfig} USSD
 */

/**
 * Get's USSD configuration. Includes USSD commands.
 * @param {boolean} [postpaid=false] Whether to get the postpaid or prepaid config
 * @return {Promise<UssdConfig>}
 */
export function getUssdConfig(postpaid=false) {
  let url = 'config/ussd/';
  url += postpaid ? 'postpaid' : 'prepaid';
  url += 'ussd.xml';
  return ajax.getAjaxDataDirect({
    url: url,
  });
}
