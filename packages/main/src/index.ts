/*                                                                                                                                                             ─╯/*
NightPDF Dark mode for Pdfs    
Copyright (C) 2021  Advaith Madhukar

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; version 2
of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
/* eslint no-unused-vars: [ "error", { "argsIgnorePattern": "^_" } ] */
'use strict';

import {app, BrowserWindow, Menu, dialog, ipcMain, shell, nativeTheme} from 'electron';
import {join, parse} from 'path';
import menutemplate from '/@/menutemplate';
let menuIsConfigured = false;

function getpath(filePath: string) {
  return parse(filePath).base;
}

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
  const wc = win.webContents;
  // if the window url changes from the inital one,
  // block the change and use xdg-open to open it
  wc.on('will-navigate', function (e, url) {
    if (url != wc.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  win.webContents.removeAllListeners('did-finish-load');
  win.webContents.once('did-finish-load', () => {
    if (filename) {
      win.webContents.send('file-open', filename);
      win.show();
    } else {
      win.show();
    }
  });

  if (!menuIsConfigured) {
    const template = menutemplate.createMenu();
    const menu = Menu.buildFromTemplate(template);

    const file_open = menu.getMenuItemById('file-open');
    if (file_open) {
      file_open.click = () => {
        openNewPDF();
      };
    }

    const file_print = menu.getMenuItemById('file-print');
    if (file_print) {
      file_print.click = () => {
        const focusedWin = BrowserWindow.getFocusedWindow();
        if (focusedWin) {
          focusedWin.webContents.send('file-print');
        }
      };
    }

    Menu.setApplicationMenu(menu);
    menuIsConfigured = true;
  }

  const openNewPDF = () => {
    dialog
      .showOpenDialog(win, {
        properties: ['openFile'],
        filters: [{name: 'PDF Files', extensions: ['pdf']}],
      })
      .then(dialogReturn => {
        const filename = dialogReturn['filePaths'][0];
        if (filename) {
          const focusedWin = BrowserWindow.getFocusedWindow();
          if (focusedWin) {
            focusedWin.webContents.send('file-open', filename.toString());
            focusedWin.maximize();
          }
        }
      });
  };

  ipcMain.removeAllListeners('togglePrinting');
  ipcMain.once('togglePrinting', (_e, msg) => {
    const menu = Menu.getApplicationMenu();
    if (menu) {
      const file_print = menu.getMenuItemById('file-print');
      if (file_print) {
        file_print.enabled = Boolean(msg);
      }
    }
  });

  ipcMain.removeAllListeners('newWindow');
  ipcMain.once('newWindow', (_e, msg) => {
    console.log('opening ', msg, ' in new window');
    createWindow(msg);
  });

  ipcMain.removeAllListeners('resizeWindow');
  ipcMain.once('resizeWindow', (_e, _msg) => {
    const {width, height} = win.getBounds();
    if (width < 1000 || height < 650) {
      win.setResizable(true);
      win.setSize(1000, 650);
      win.center();
    }
  });

  ipcMain.removeAllListeners('openNewPDF');
  ipcMain.once('openNewPDF', (_e, _msg) => {
    openNewPDF();
  });

  ipcMain.handle('getPath', (_event, args) => {
    return getpath(args);
  });
}

let fileToOpen = '';

const args = process.argv;
const argsLength = args.length;
if (argsLength > 1 && args[argsLength - 1].endsWith('.pdf')) {
  fileToOpen = args[argsLength - 1];
}

app.on('open-file', (event, path) => {
  event.preventDefault();
  if (app.isReady()) {
    const focusedWin = BrowserWindow.getFocusedWindow();
    if (focusedWin) {
      focusedWin.webContents.send('file-open', path.toString());
    }
  }
  fileToOpen = path.toString();
});

app.whenReady().then(() => {
  if (fileToOpen) {
    createWindow(fileToOpen);
  } else {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
