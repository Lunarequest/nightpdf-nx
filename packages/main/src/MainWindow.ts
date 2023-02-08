import {app, BrowserWindow, nativeTheme} from 'electron';
import {join} from 'path';

function createWindow(filename: string | null = null) {
  //force dark theme irespective of os theme
  //useful for linux since we don't have a standardised way of detecting dark theme
  nativeTheme.themeSource = 'dark';
  // Create the browser window.
  const win = new BrowserWindow({
    width: 550,
    height: 420,
    minWidth: 565,
    minHeight: 200,
    webPreferences: {
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
    resizable: true,
    titleBarStyle: 'default',
    show: false,
  });

  // and load the index.html of the app.

  const PageURL =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  win.loadURL(PageURL);
  if (process.env.DEBUG) {
    win.webContents.openDevTools();
  }
  if (filename) {
    win.webContents.once('did-finish-load', () => {
      if (filename) {
        win.webContents.send('file-open', filename);
        win.show();
      } else {
        win.show();
      }
    });
  }
  return win;
}

export {createWindow};
