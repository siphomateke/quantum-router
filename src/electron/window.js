import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import iconConfig from '@/config/icons';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * global reference to mainWindow (necessary to prevent window from being garbage collected)
 * @type {BrowserWindow}
 */
let mainWindow = null;

export function getMainWindow() {
  return mainWindow;
}

export function createMainWindow() {
  mainWindow = new BrowserWindow({
    // Allow cross-origin requests
    webPreferences: { webSecurity: false },
    icon: iconConfig.windowIcon,
  });

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    //   Load the index.html when not in development
    mainWindow.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    }));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus();
    setImmediate(() => {
      mainWindow.focus();
    });
  });
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    createMainWindow();
  }
});
