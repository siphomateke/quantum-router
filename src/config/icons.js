import * as path from 'path';

const staticPath = process.type === 'renderer' ? process.env.BASE_URL : __static;
const icon = path.join(staticPath, 'icons/icon128.png');

export default {
  trayIcon: icon,
  windowIcon: icon,
  notificationIcon: icon,
};
