//let playlist_id = new URL(location.href).searchParams.get("id");

class YouTube{
    constructor(playlistId){
        this.fs = require('fs');

        this.YTDlpWrap = require('yt-dlp-wrap').default;
        this.ytDlpWrap = new this.YTDlpWrap('yt-dlp.exe');

        this.db = new Database();

        this.playlistId = playlistId;

        this.elements = {
            cache: () => JSON.parse(this.fs.readFileSync(__dirname + "/cache/songs.json", "utf8"))
        };

        this.playlist;

        this.beautifulPlaylist = [];

        this.index = 0;

        this.init();
    }

    urlExist(url) {
        return new Promise(async (res, rej) => {
          fetch(url).then(response => {
            if (response.status == 200) {
                console.log("URL is valid")
              res(true)
            } else {
              res(false)  
            }
          });
        })
    };

    loadVideo(video_id){
        this.addLI(video_id).then(() => {
            if(this.index == this.playlist.length){
                setTimeout(() => {
                    window.player = new Player(this.beautifulPlaylist);
                    document.querySelector('#loader-bg').remove();
                    document.querySelector('#load').remove();
                }, 2000)
            }
        })
    }

    init(){
        let global = this;
        this.db.getPlaylistSongs(this.playlistId).then((songs) => {
            songs = JSON.parse(songs);
            if(!songs || songs.length === 0){
                document.querySelector(".playlist").innerHTML = "<p>On dirait bien qu'il n'y a aucune musique ici :/</p>";
                document.querySelector('#loader-bg').remove();
                document.querySelector('#load').remove();
            }
            global.playlist = songs;

            global.playlist.forEach(song => {
                if(global.elements.cache()[song]){
                    global.urlExist(global.elements.cache()[song]["url"]).then(res => {
                        if(res){
                            global.loadVideo(song)
                        }
                        else{
                            global.cacheVideo(song)
                        }
                    })
                }
                else{
                    global.cacheVideo(song);
                }
            })
        })
 
    }

    addLI(video_id){
        return new Promise(async (res, rej) => {

            let wrapper = document.querySelector('.playlist ul');

            let data = this.elements.cache();

            let li = await document.createElement('li');
            li.setAttribute('data-src', data[video_id]["url"]);
            li.setAttribute('data-author', data[video_id]["owner"]);
            li.setAttribute('data-name', data[video_id]["title"]);
            li.setAttribute('data-cover', data[video_id]["thumbnailUrl"]);

            this.beautifulPlaylist.push({
                name: data[video_id]["title"],
                author: data[video_id]["uploader"],
                src: data[video_id]["url"],
                cover: data[video_id]["thumbnail"]
            })

            li.innerHTML = data[video_id]["title"];

            await wrapper.appendChild(li)

            let i = this.index;
    
            li.onclick = function(){
                window.player.init(i).then(() => {
                    window.player.play()
                    console.log("Loading video with id "+i)
                })
            }

            this.index += 1;

            await res()
        })
    }

    getDirectLink(video_id){
        return new Promise((res, rej) => {

            
            this.ytDlpWrap.execPromise([
                'https://www.youtube.com/watch?v='+video_id,
                "--dump-json"
            ]).then((response) => {
                res(JSON.parse(response)["requested_formats"][1]["url"])
            });
        })
        
    }

    cacheVideo(video_id){
        let global = this;
        this.getDirectLink(video_id).then(url => {
            this.ytDlpWrap.getVideoInfo('https://www.youtube.com/watch?v='+video_id).then(d => {
                if(d){
                    let data = JSON.parse(global.fs.readFileSync(__dirname + "/cache/songs.json", "utf8"));

                    data[video_id] = {
                        title: d["title"],
                        uploader: d["uploader"],
                        url: d["url"],
                        thumbnail: d["thumbnail"]
                    };

                    console.log(data)

                    global.fs.writeFileSync(__dirname + "/cache/songs.json", JSON.stringify(data))
                    
                    global.loadVideo(video_id)
                }
            });
            
        })
    }
}

let p = new YouTube(new URL(location.href).searchParams.get("id"));