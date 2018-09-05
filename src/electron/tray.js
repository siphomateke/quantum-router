import {app, Menu, Tray} from 'electron';
import i18n from '@/electron/i18n';
import iconConfig from '@/config/icons';

let tray = null;

/**
 * @param {import('electron').BrowserWindow} win
 */
function toggleWindow(win) {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
  }
}

export default {
  create(win) {
    tray = new Tray(iconConfig.trayIcon);
    const contextMenu = Menu.buildFromTemplate([
      {label: i18n.t('tray.contextMenu.toggle'), click: () => {
        toggleWindow(win);
      }},
      {type: 'separator'},
      {label: i18n.t('tray.contextMenu.quit'), role: 'quit'},
    ]);
    tray.setToolTip(app.getName());
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      toggleWindow(win);
    });
  },
};
