import iconConfig from '@/config/icons';

export class Notifier {
  /**
   * @param {Object} options
   * @param {string} options.message
   * @param {string} [options.title]
   * @param {string} [options.icon]
   */
  static notify(options) {
    options = Object.assign({
      title: 'Quantum Router',
      icon: iconConfig.notificationIcon,
    }, options);
    new Notification(options.title, {
      body: options.message,
      icon: options.icon,
    });
  }
}
