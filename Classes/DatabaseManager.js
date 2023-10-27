const sqlite3 = require("sqlite3").verbose();
const {open} = require("sqlite")
const fs = require("fs")

let appdata;
try{
    appdata = require("../default").appdata
}
catch(e){
    appdata = require('@electron/remote').app.getPath("userData");
}

console.log(appdata)
class Database{
    constructor(path=appdata+"/Data/database.db"){
        this.path = path;

        this.init()
    }

    init(){
        return new Promise((resolve, reject) => {
            open({
                filename: this.path,
                driver: sqlite3.cached.Database
            }).then(db => resolve(db))
        })
        
    }

    get(value, id){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                db.get(`SELECT * FROM playlists WHERE ID = ?`, [id]).then(d => resolve(d[value]))
            })
        })
    }

    getPlaylists(){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                db.all('SELECT * FROM playlists').then(resolve)
            })
        })
    }


    createPlaylist(name){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                db.run('INSERT INTO playlists (name) VALUES (?)', [name]).then(resolve)
            })
        })
    }

    getPlaylistSongs(playlist){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                db.get('SELECT * FROM playlists WHERE ID = ?', [playlist]).then(data => resolve(data["songs"]))
            })
        })
    }

    checkInstallation(){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                db.run(
                    `
                    CREATE TABLE IF NOT EXISTS playlists (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        name  VARCHAR(50),
                        songs  TEXT(999)
                    );
                    `
                );
            })
        })
    }

    addSongToPlaylist(playlist, song){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                this.getPlaylistSongs(playlist).then((songs) => {
    
                    songs = songs ? JSON.parse(songs) : [];
        
                    console.log(songs)
                    songs.push(song)
        
                    db.run(
                        `
                        UPDATE playlists
                        SET songs = ?
                        WHERE ID = ?
                        `,
                        [JSON.stringify(songs), playlist]
                    ).then(resolve);
                })
            })
        })
        
        
    }

    removeSongFromPlaylist(playlist, song){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                this.getPlaylistSongs(playlist).then((songs) => {
                    songs = songs ? JSON.parse(songs) : [];
        
                    const x = songs.filter(function (letter) {
                        return letter !== song;
                    });
        
                    db.run(
                        `
                        UPDATE playlists
                        SET songs = ?
                        WHERE ID = ?
                        `,
                        [JSON.stringify(x), playlist]
                    ).then(resolve);
                })
            })
        })
    }

    renamePlaylist(playlist, name){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                db.run(
                    `
                    UPDATE playlists
                    SET name = ?
                    WHERE ID = ?
                    `,
                    [name, playlist]
                ).then(resolve);
            })
        })
    }

    deletePlaylist(playlist){
        return new Promise((resolve, reject) => {
            this.init().then(db => {
                db.run(
                    `
                    DELETE FROM playlists WHERE ID = ?
                    `,
                    [playlist]
                ).then(resolve);
            })
        })
    }
}

module.exports = Database;