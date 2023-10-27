function formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.round(seconds % 60)
    return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
        .filter(a => a)
        .join(':')
}

class Player{
    constructor(playlist){
        this.player = document.querySelector(".player");
        this.audio = document.querySelector("#audio");

        this.playlist = playlist;
        this.currentSong;
        this.currentSongIndex;
        this.repeat = false;

        this.initElements();
        this.setEventsListeners();

        this.init();
    }

    initElements(){
        this.elements = {
            progress: this.player.querySelector("#song-time input"),
            currentTime: this.player.querySelector("#song-timestamp .current"),
            maxTime: this.player.querySelector("#song-timestamp .max"),
            action: this.player.querySelector("#song-action #pause"),
            playlist: this.player.querySelector(".playlist ul"),
            title: this.player.querySelector("#song-data .title"),
            author: this.player.querySelector("#song-data .author"),
            nextAudio: this.player.querySelector("#song-action .fa-forward-step"),
            previousAudio: this.player.querySelector("#song-action .fa-backward-step"),
            repeating: document.querySelector("#song-action-bar .repeat"),
            cover: document.querySelector("#song-data img")
        }
    }

    init(song=0){
        let glob = this;
        return new Promise(function(resolve, reject){
            glob.currentSong = glob.playlist[song]
            glob.currentSongIndex = song;
            glob.audio.src = glob.currentSong.src;
    
            glob.audio.volume = 0.5;

            console.log(glob.currentSong)
    
            glob.elements.author.innerText = glob.currentSong.author;
            glob.elements.title.innerText = glob.currentSong.name;
            glob.elements.cover.src = glob.currentSong.cover;
    
            let global = glob;
    
            glob.elements.playlist.querySelectorAll('li').forEach((a, b) => {
                if(b == global.currentSongIndex){
                    a.classList.add('selected')
                }else{
                    a.classList.remove('selected')
                }
            })
    
            glob.initTime();
            resolve()
        })
        
    }

    initTime(){
        let global = this;

        this.audio.onloadedmetadata = function() {
            global.setMaxTime(audio.duration)
        };
    }

    setEventsListeners(){
        let global = this;

        this.elements.progress.oninput = function(){
            global.audio.currentTime = global.elements.progress.value
        }


        this.audio.ontimeupdate = (event) => {
            global.elements.progress.value = global.audio.currentTime
            global.elements.currentTime.innerText = formatTime(global.audio.currentTime)
        };

        this.audio.onplay = function(){
            global.elements.action.innerHTML = '<i class="fa-solid fa-pause fa-3x"></i>'
        }

        this.audio.onpause = function(){
            global.elements.action.innerHTML = `<img src="../assets/icons/play.png" alt="Play Icon">`
        }

        this.audio.onended = function(){
            global.elements.action.innerHTML = `<img src="../assets/icons/play.png" alt="Play Icon">`

            if(global.repeat){

                global.init(global.currentSongIndex)
                global.play()
            }
            else{
                global.nextAudio()
            }
            
        }

        this.elements.action.addEventListener("click", function(){
            if(global.audio.paused){
                global.audio.play()
            }
            else{
                global.audio.pause()
            }
        })

        this.elements.repeating.addEventListener("click", () => {
            if(global.repeat){
                global.repeat = false;
                global.elements.repeating.innerHTML = `<i class="fa-solid fa-repeat fa-xl"></i>`
            }
            else{
                global.repeat = true;
                global.elements.repeating.innerHTML = `<img src="assets/icons/repeat-1.png" alt="" width="30px">`
            }
        })

        this.elements.nextAudio.addEventListener("click", function(){
            global.nextAudio()
        })

        this.elements.previousAudio.addEventListener("click", function(){
            global.previousAudio()
        })

        document.addEventListener('keyup', event => {

            if (event.code === 'Space') {
                if(this.audio.paused){
                    this.audio.play()
                }
                else{
                    this.audio.pause()
                }
            }

            if (event.code === 'ArrowLeft') {
                this.audio.currentTime -= 5;
            }

            if (event.code === 'ArrowRight') {
                this.audio.currentTime += 5;
            }

            if (event.code === 'ArrowUp') {
                this.audio.volume += 0.1;
            }

            if (event.code === 'ArrowDown') {
                this.audio.volume -= 0.1;
            }
          })

    }

    nextAudio(){
        if(this.playlist.length - 1 == this.currentSongIndex){
            this.init()
            this.play()
        }
        else{
            this.init(this.currentSongIndex + 1)
            this.play()
        }
    }

    previousAudio(){
        if(this.currentSongIndex == 0){
            this.init(this.playlist.length - 1)
            this.play()
        }
        else{
            this.init(this.currentSongIndex - 1)
            this.play()
        }
    }

    setMaxTime(time){
        this.elements.maxTime.innerText = formatTime(time)
        this.elements.progress.max = time
    }

    play(){
        this.audio.play();
    }

    pause(){
        this.audio.pause();
    }
}