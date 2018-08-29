import router from 'huawei-router-api/browser';
const {RouterError} = router.errors;
import dotty from 'dotty';

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

export const storage = {
  set(data) {
    return browser.storage.sync.set(data);
  },
  get(data) {
    return browser.storage.sync.get(data);
  },
};

/**
 * Gets the url of router page from storage
 * @return {Promise<string>}
 */
export async function getRouterUrl() {
  const items = await storage.get('settings');
  if (dotty.exists(items, 'settings.general.routerUrl')) {
    return items.settings.general.routerUrl;
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
  const items = await storage.get('settings');
  if (dotty.exists(items, 'settings.general.username')
  && dotty.exists(items, 'settings.general.password')) {
    const general = items.settings.general;
    return {
      username: general.username,
      password: general.password,
    };
  } else {
    // TODO: Make this error more detailed and not use 'Error' object
    return Promise.reject(new Error(
      'username or password is not set in storage'));
  }
}

export function openOptionsPage() {
  // FIXME: Navigate to extension options
}
