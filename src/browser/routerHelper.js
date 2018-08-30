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

export function openOptionsPage() {
  // FIXME: Navigate to app options
}
