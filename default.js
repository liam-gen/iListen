const { app } = require("electron");

module.exports = {
    "name": "iListen",
    "iconPng": __dirname+"/buildResources/logo.png",
    "iconIco": __dirname+"/buildResources/logo.ico",
    "appdata": app.getPath('userData')
}