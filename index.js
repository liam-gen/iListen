const { app, BrowserWindow } = require('electron');
  
  function createWindow() {
    const win = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
        title: 'My App',
    });
  
    win.setTitle('My App');
    win.loadFile('index.html');
  }
  
  app.whenReady().then(createWindow);
  
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