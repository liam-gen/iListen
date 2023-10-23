const { app, BrowserWindow, Menu, nativeImage, Tray, Notification } = require('electron');

let tray;
let win;
let wantToClose;

if (process.platform === 'win32')
{
    app.setAppUserModelId("iListen Notifications");
}

function createTray(){
  const trayicon = nativeImage.createFromPath(__dirname+"/build/logo.ico")
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


  function createWindow() {

    if (!tray) {
      createTray()
    }

    win = new BrowserWindow({
        height: 600,
        width: 800,
        autoHideMenuBar: true,
        //frame: false,
        icon: __dirname+"/build/logo.ico",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
        title: 'My App',
    });
  
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
            icon: __dirname+"/build/logo.ico",
            silent: true
          }).show()
        }
      
    })
  }
  
  app.whenReady().then(createWindow);
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
  });