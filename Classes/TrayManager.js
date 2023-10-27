const { Menu, Tray, nativeImage, app } = require('electron');
const {iconIco, name} = require("../default")

class TrayManager{
    constructor(window){

        this.icon = nativeImage.createFromPath(iconIco)
        this.tray = new Tray(this.icon)
        this.wantToClose = false

        this.contextMenu = Menu.buildFromTemplate([
          {
            label: "Ouvrir l'application",
            click: () => {
              window.show()
            }
          },
          {
            label: 'Quitter',
            click: () => {
              this.wantToClose = true;
              app.quit()
            }
          },
        ])
      
        this.tray.setToolTip(name)
        this.tray.setContextMenu(this.contextMenu)
      
        this.tray.on("click", () => {
          window.show()
        })
    }
}

module.exports.Tray = TrayManager