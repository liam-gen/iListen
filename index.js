
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

    autoUpdater.on('checking-for-update', () => {
      sendStatusToWindow('Recherche de mise à jour...');
    })
    autoUpdater.on('update-available', (info) => {
      sendStatusToWindow('Mise à jour disponible.');
    })
    autoUpdater.on('error', (err) => {
      sendStatusToWindow('Erreur lors de la tentative de mise à jour. ' + err);
    })
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Mise à jour en cours. Vitesse : " + Math.round((progressObj.bytesPerSecond) / 1000000)+ " Mbits/s";
      log_message = log_message + ' - Téléchargé ' + progressObj.percent + '%';
      sendStatusToWindow(log_message);
    })
    autoUpdater.on('update-downloaded', (info) => {
      sendStatusToWindow('Mise à jour téléchargée');
    });
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