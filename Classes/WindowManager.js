const { BrowserWindow, ipcMain, Notification } = require('electron');
const {iconIco, name} = require("../default")

const { Tray } = require("./TrayManager")
const { Downloader } = require("./DownloadManager")

class Window{
    constructor(tray){
        //log.info("Creating main window")
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

        ipcMain.on('download-playlist', (event, playlist) => {
            let i = new Downloader();
            i.downloadPlaylist(playlist, console.log).then(() => {
              this.window.webContents.send("download-finished", {})
              console.log("Playlist downloaded !")
            })
        })
    }
}

module.exports.Window = Window;