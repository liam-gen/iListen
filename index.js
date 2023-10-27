
const { app, BrowserWindow, Menu, nativeImage, Tray, Notification, ipcMain } = require('electron');
const Downloader = require("./downloader")
const log = require("electron-log")

log.transports.file.level = 'info';
log.transports.file.resolvePathFn = () => __dirname + "/logs/main.log";

process.on('uncaughtException', function(err) {
  log.error(err)
});

let tray;
let win;
let wantToClose;

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

function createTray(){
  const trayicon = nativeImage.createFromPath(__dirname+"/buildResources/logo.ico")
  tray = new Tray(trayicon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Ouvrir l'application",
      click: () => {
        win.show()
      }
    },
    {
      label: 'Quitter',
      click: () => {
        wantToClose = true;
        app.quit()
      }
    },
  ])

  tray.setToolTip('iListen')

  tray.setContextMenu(contextMenu)

  tray.on("click", () => {
    win.show()
  })
}


  async function createWindow() {

    if (!tray) {
      createTray()
    }

    win = new BrowserWindow({
        height: 600,
        width: 800,
        autoHideMenuBar: true,
        icon: __dirname+"/buildResources/logo.ico",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
        title: 'My App',
    });

    log.info("Creating main window")
  
    win.setTitle('My App');
    win.loadFile('index.html');

    win.on('close', event=>{
        if(!wantToClose)
        {
          event.preventDefault();
          win.hide();
          new Notification({
            title: "iListen",
            body: "iListen est minimsé mais tourne tojours !",
            icon: __dirname+"/buildResources/logo.ico",
            silent: true
          }).show()
        }
      
    })


    /* UOPDATES */

    autoUpdater.on('checking-for-update', () => {
      sendStatusToWindow('Recherche de mise à jour...');
    })
    autoUpdater.on('update-available', (info) => {
      sendStatusToWindow('Mise à jour disponible.');
    })
    autoUpdater.on('update-not-available', (info) => {
      sendStatusToWindow('Aucune mise à jour disponible.');
    })
    autoUpdater.on('error', (err) => {
      sendStatusToWindow('Erreur lors de la tentative de mise à jour. ' + err);
    })
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Vitesse : " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Téléchargé ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      sendStatusToWindow(log_message);
    })
    autoUpdater.on('update-downloaded', (info) => {
      sendStatusToWindow('Mise à jour téléchargée');
    });
  }



  ipcMain.on('download-playlist', (event, playlist) => {
    let i = new Downloader();
    i.downloadPlaylist(playlist, console.log).then(() => {
      win.webContents.send("download-finished", {})
      console.log("Downlaoded")
    })
  })
  
  app.whenReady().then(createWindow);
  
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
        createWindow();
    }
  });