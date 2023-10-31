
const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const log = require("electron-log")

/* CLASSES */
const { Window } = require("./Classes/WindowManager")
const { DataManager } = require("./Classes/DataManager")

require('@electron/remote/main').initialize()

log.transports.file.level = 'info';
log.transports.file.resolvePathFn = () => __dirname + "/logs/main.log";



process.on('uncaughtException', function(err) {
  log.error(err)
});

let dataManager = new DataManager()

let tray;
let win;

/* AUTO UPDATER */


const {autoUpdater} = require("electron-updater");

autoUpdater.logger = log

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

if (process.platform === 'win32')
{
    app.setAppUserModelId("iListen Notifications");
}

  
app.whenReady().then(() => {
    win = new Window(tray);

    win.window.maximize()
});
  
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
});

app.on('ready', function()  {
    autoUpdater.checkForUpdatesAndNotify();
});
  
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        win = new Window(tray)
    }
});