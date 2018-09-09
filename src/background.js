import { app, protocol, ipcMain } from 'electron';
import { installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import { getMainWindow, createMainWindow } from '@/electron/window';
import i18n, { getCurrentLanguageData, waitForTranslationsToLoad } from '@/electron/i18n';
import tray from '@/electron/tray';

const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH);
}

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true });

const readyPromises = [];

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
  tray.create(getMainWindow());

  // send initial translations to client
  ipcMain.on('get-initial-language-data', async (event) => {
    // in development mode, reload translations when the renderer process is reloaded
    if (isDevelopment) {
      i18n.reloadResources();
      await waitForTranslationsToLoad();
    }
    event.returnValue = getCurrentLanguageData();
  });

  // send new translations to client each time the language changes
  i18n.on('languageChanged', () => {
    getMainWindow().webContents.send('language-changed', getCurrentLanguageData());
  });
});
