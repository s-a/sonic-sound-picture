
const { app, BrowserWindow, dialog, ipcMain, session, protocol, Electron } = require('electron');
const path = require('path');
const open = require('open');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'images/icon.ico'),
    autoHideMenuBar: true,
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: true,
      webviewTag: true
    },
  });

  mainWindow.setMenu(null)

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: Object.fromEntries(Object.entries(details.responseHeaders).filter(header => !/x-frame-options/i.test(header[0]))) });
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    open(url);
    return { action: 'deny' };
  });
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  ipcMain.handle("dialog:openDirectory", async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });

    return result;
  });
  ipcMain.handle("dialog:openZipFile", async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'], extensions: ['zip'] });
    return result;
  });

  ipcMain.handle("devtools:toggle", async () => {
    // toggle dev tools
    const result = await mainWindow.webContents.toggleDevTools();
    return result;
  });

  ipcMain.handle("path:temp", () => {
    const result = app.getPath("temp")
    return result;
  });
  ipcMain.handle("path:app", () => {
    const result = app.getAppPath()
    return result;
  });
  ipcMain.handle("app:version", () => {
    const result = app.getVersion()
    return result;
  });

  try {
    const Store = require('electron-store')
    const store = new Store()
    const config = JSON.parse(fs.readFileSync(store.path).toString())
    if (config.debug === true) {
      mainWindow.webContents.toggleDevTools()
    }
  } catch (e) {
    console.warn(e)
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



const Store = require('electron-store');
Store.initRenderer();
