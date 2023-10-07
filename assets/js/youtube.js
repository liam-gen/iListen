//let playlist_id = new URL(location.href).searchParams.get("id");

class YouTube{
    constructor(playlistId){
        this.fs = require('fs');
        this.youtubedl = require('youtube-dl-exec');
        this.fetchVideoInfo = require('updated-youtube-info');

        this.playlistId = playlistId;

        this.elements = {
            cache: () => JSON.parse(this.fs.readFileSync(__dirname + "/cache/songs.json", "utf8")),
            playlists: () => JSON.parse(this.fs.readFileSync(__dirname + "/cache/playlists.json", "utf8"))
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
        this.playlist = this.elements.playlists().filter(playlist => playlist.id === this.playlistId)[0]["songs"];

        this.playlist.forEach(song => {
            if(this.elements.cache()[song]){
                this.urlExist(this.elements.cache()[song]["url"]).then(res => {
                    if(res){
                        this.loadVideo(song)
                    }
                    else{
                        this.cacheVideo(song)
                    }
                })
            }
            else{
                this.cacheVideo(song);
            }
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
                author: data[video_id]["owner"],
                src: data[video_id]["url"],
                cover: data[video_id]["thumbnailUrl"]
            })

            li.innerHTML = data[video_id]["title"];

            await wrapper.appendChild(li)

            let i = this.index;
    
            li.onclick = function(){
                window.player.init(i)
                window.player.play()
            }

            this.index += 1;

            await res()
        })
    }

    getDirectLink(video_id){
        return new Promise((res, rej) => {
            this.youtubedl('https://www.youtube.com/watch?v='+video_id, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            }).then(output => {
                res(output["requested_formats"][1]["url"])
            })
        })
        
    }

    cacheVideo(video_id){
        let global = this;
        this.getDirectLink(video_id).then(url => {
            this.fetchVideoInfo(video_id, function (err, videoInfo) {
                if(videoInfo){
                    let data = JSON.parse(global.fs.readFileSync(__dirname + "/cache/songs.json", "utf8"));
                    data[video_id] = videoInfo;
                    data[video_id]["url"] = url;

                    data["url"] = url;
                    global.fs.writeFileSync(__dirname + "/cache/songs.json", JSON.stringify(data))
                    
                    global.loadVideo(video_id)
                }
            })
            
        })
    }
}

let p = new YouTube(new URL(location.href).searchParams.get("id"));