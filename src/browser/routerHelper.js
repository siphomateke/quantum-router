import router from 'huawei-router-api/browser';
const {RouterError} = router.errors;
import {EventEmitter} from 'events';

export class Notifier {
  /**
   * @param {browser.notifications.CreateNotificationOptions} data The notification data
   */
  static notify(data) {
    data = Object.assign({
      type: 'basic',
      iconUrl: browser.runtime.getManifest().icons['128'],
      title: 'Quantum Router',
      isClickable: false,
    }, data);
    browser.notifications.create('', data);
  }
}

/**
 * Gets the url of router page from browser.storage
 * @return {Promise<string>}
 */
export async function getRouterUrl() {
  const items = await browser.storage.sync.get('routerUrl');
  if ('routerUrl' in items) {
    return items.routerUrl;
  } else {
    return Promise.reject(new RouterError(
      'router_url_not_set', 'No router url set in storage'));
  }
}

/**
 * @typedef LoginDetails
 * @property {string} username
 * @property {string} password
 */

/**
 * Gets the username and password from storage
 * @return {Promise<LoginDetails>}
 */
export async function getLoginDetails() {
  const items = await browser.storage.sync.get(['username', 'password']);
  if ('username' in items && 'password' in items) {
    return {
      username: items.username,
      password: items.password,
    };
  } else {
    // TODO: Make this error more detailed and not use 'Error' object
    return Promise.reject(new Error(
      'username or password is not set in storage'));
  }
}

export function openOptionsPage() {
  return browser.runtime.openOptionsPage();
}

export const emitter = new EventEmitter();

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.from === 'options' && message.status === 'saved') {
    emitter.emit('optionsSaved');
  }
});

export const events = {
  addListener(name, callback) {
    emitter.on(name, callback);
  },
};
