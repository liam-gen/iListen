const { BrowserWindow, ipcMain, Notification } = require('electron');
const {iconIco, name} = require("../default")
const {autoUpdater} = require("electron-updater");

const { Tray } = require("./TrayManager")
const { Downloader } = require("./DownloadManager")


class Window{
    constructor(tray){
        this.window = new BrowserWindow({
            height: 600,
            width: 800,
            autoHideMenuBar: true,
            icon: iconIco,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false
            },
            title: name,
        });

        require("@electron/remote/main").enable(this.window.webContents)

        let global = this;

        function sendStatusToWindow(text) {
          global.window.webContents.send('message', text);
        }


        if (!tray) {
            tray = new Tray(this.window);
        }
        
        this.window.setTitle('iListen');
        this.window.loadFile('Pages/index.html');
      
        this.window.on('close', event=>{
              if(!tray.wantToClose)
              {
                event.preventDefault();
                this.window.hide();
                new Notification({
                  title: name,
                  body: "iListen est minimsé mais tourne tojours !",
                  icon: iconIco,
                  silent: true
                }).show()
              }
        })

        this.window.webContents.setWindowOpenHandler(({ url }) => {
          if (url.startsWith('file://')) {
            return {
              action: 'allow',
              overrideBrowserWindowOptions: {
                frame: false,
                fullscreenable: false,
                //resizable: false,
                autoHideMenuBar: true,
                webPreferences: {
                  contextIsolation: false,
                  nodeIntegration: true
                },
                height: 500
              }
            }
          }
          var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
        require('child_process').exec(start + ' ' + url);
          return { action: 'deny' }
        })



        ipcMain.on('download-playlist', (event, playlist) => {
            let i = new Downloader();
            i.downloadPlaylist(playlist, (data) => {event.sender.send("playlist-progress", data);console.log(data)}).then(() => {
              this.window.webContents.send("download-finished", {})
              console.log("Playlist downloaded !")
            })
        })

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
          let log_message = "Mise à jour en cours. Vitesse : " + (progressObj.bytesPerSecond) / 1000000+ " Mbits/s";
          log_message = log_message + ' - Téléchargé ' + Math.round(progressObj.percent) + '%';
          sendStatusToWindow(log_message);
        })
        autoUpdater.on('update-downloaded', (info) => {
          sendStatusToWindow('Mise à jour téléchargée');
        });
    }
}

module.exports.Window = Window;