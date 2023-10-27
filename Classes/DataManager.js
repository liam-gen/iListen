const { appdata } = require("../default");
const fs = require("fs");
const Database = require("./DatabaseManager")

class DataManager{
    constructor(){
        this.path = appdata+"/Data";

        this.database = new Database()

        this.checkCache()
        this.checkDataFolder();
        this.checkDatabase();
        this.checkDownloadFolder()
    }

    checkDataFolder(){
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path);
        }
    }

    checkDatabase(){
        if (!fs.existsSync(this.path+'/database.db')) {
            fs.appendFileSync(this.path+'/database.db', '');
        }

        this.database.checkInstallation()
    }

    checkCache(){
        if (!fs.existsSync(this.path+'/songs.json')) {
            fs.appendFileSync(this.path+'/songs.json', '{}');
        }

    }

    checkDownloadFolder(){
        if (!fs.existsSync(this.path+"/downloads")) {
            fs.mkdirSync(this.path+"/downloads");
        }
    }
}

module.exports.DataManager = DataManager;