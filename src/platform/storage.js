import router from '@/common/huawei-router-api';
import electronStorage from '@/electron/storage';

const { RouterError } = router.errors;

const storage = {
  async get(...args) {
    return electronStorage.get(...args);
  },
  async set(...args) {
    electronStorage.set(...args);
  },
  async has(...args) {
    return electronStorage.has(...args);
  },
  /**
   * Gets the url of router page from storage
   * @return {Promise<string>}
   */
  async getRouterUrl() {
    if (await this.has('settings.general.routerUrl')) {
      return this.get('settings.general.routerUrl');
    }
    return Promise.reject(new RouterError('router_url_not_set', 'No router url set in storage'));
  },

  /**
   * @typedef LoginDetails
   * @property {string} username
   * @property {string} password
   */

  /**
   * Gets the username and password from storage
   * @return {Promise<LoginDetails>}
   */
  async getLoginDetails() {
    if (await this.has('settings.general.username')
    && await this.has('settings.general.password')) {
      const { username, password } = await this.get('settings.general');
      return {
        username,
        password,
      };
    }
    // TODO: Make this error more detailed and not use 'Error' object
    return Promise.reject(new Error('username or password is not set in storage'));
  },
};

export default storage;
