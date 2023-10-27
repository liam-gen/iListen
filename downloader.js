const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpWrap = new YTDlpWrap(__dirname+'/yt-dlp.exe');
const Database = require('./database')
const fs = require('fs');

const log = require("electron-log")

log.transports.file.level = 'info';
log.transports.file.resolvePathFn = () => __dirname + "/logs/main.log";

var https = require('https');

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
    console.log(err.message)
    if (cb) cb(err.message);
  });
};

class Downloader{
    constructor(){
        this.db = new Database();
    }

    downloadPlaylist(id, onProgress){

        let global = this;

        return new Promise(function(resolve, reject){
            let folder = __dirname+"/downloads/playlist-"+id
        

            if (!fs.existsSync(folder)){
                fs.mkdirSync(folder, {recursive: true})
            }
    
            if (!fs.existsSync(folder+"/playlist.json")){
                fs.writeFileSync(folder+"/playlist.json", "{}")
            }
    
    
            global.db.getPlaylistSongs(id).then(async songs => {
                let data = fs.readFileSync(folder+"/playlist.json", "utf-8");
                data = JSON.parse(data)
                songs = JSON.parse(songs)
    
                const songsNumber = songs.length;
    
                songs.forEach(async (song, index) => {
                    log.info("Downloading data for "+song)
                    await ytDlpWrap
                    .exec([
                        'https://www.youtube.com/watch?v='+song,
                        '-x',
                        '--audio-format',
                        'mp3',
                        '-o',
                        folder+"/"+song+'.mp3',
                    ])
                    .on('progress', (progress) => {
                        progress["totalSongs"] = songsNumber;
                        progress["currentSOng"] = index + 1;
                        onProgress(progress)
                    }
                    
                    )
                    .on('error', (error) => console.error(error))
                    .on('close', () => {

                        log.info("Fetching data for "+song)
    
                        ytDlpWrap.getVideoInfo(
                            'https://www.youtube.com/watch?v='+song
                        ).then(infos => {
                            download(infos["thumbnail"], folder+"/"+song+'.webp', () =>{
                                data[song] = {
                                    title: infos.title,
                                    author: infos.uploader,
                                    file: folder+"/"+song+".mp3",
                                    thumbnail: folder+"/"+song+'.webp'
                                }
        
                                fs.writeFileSync(folder+"/playlist.json", JSON.stringify(data))
    
                                if(songsNumber - 1 == index){
                                    resolve()
                                }
                            })
                            
                        });
    
                });
                })
            })
        })

        
    }
}

module.exports = Downloader;