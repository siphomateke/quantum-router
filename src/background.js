'use strict';

import {app, protocol, ipcMain} from 'electron';
import {installVueDevtools} from 'vue-cli-plugin-electron-builder/lib';
import {mainWindow, createMainWindow} from '@/electron/window';
import i18n, {getCurrentLanguageData} from '@/electron/i18n';
import tray from '@/electron/tray';
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH);
}

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], {secure: true});

let readyPromises = [];

readyPromises.push(new Promise((resolve) => {
  app.on('ready', async () => {
    resolve();
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      await installVueDevtools();
    }
  });
}));

readyPromises.push(new Promise((resolve) => {
  // If languages are ever loaded asynchronously, this will need to change
  i18n.on('loaded', resolve);
}));

// create main BrowserWindow when electron and i18n is ready
Promise.all(readyPromises).then(() => {
  createMainWindow();
  tray.create(mainWindow);

  // send initial translations to client
  ipcMain.on('get-initial-language-data', (event, arg) => {
    event.returnValue = getCurrentLanguageData();
  });

  // send new translations to client each time the language changes
  i18n.on('languageChanged', () => {
    mainWindow.webContents.send('language-changed', getCurrentLanguageData());
  });
});
