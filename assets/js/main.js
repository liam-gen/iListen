function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

const updateOnlineStatus = () => {
    if(!navigator.onLine){
      document.querySelector(".ads") ? document.querySelector(".ads").style.display = "none" : ""
    }
    else{
      document.querySelector(".ads") ? document.querySelector(".ads").style.display = "block" : ""
    }
  }
  
  updateOnlineStatus()
  
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  if(localStorage.getItem("theme")){
      setTheme(localStorage.getItem("theme"))
  }
  
  function setTheme(theme) {
      localStorage.setItem("theme", theme);
  
      document.documentElement.className = theme
  
  }
  
  
  document.getElementById("close-ad").onclick = function(){
  
    var adsModal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['button', 'escape'],
        closeLabel: "Fermer",
    });
  
    adsModal.setContent(`
        <h1>Voulez vous vraiment supprimer les publicités ?</h1>
        <p>
            Les publicités <b>nous aident</b> à financer le projet et à <b>l'améliorer</b> pour que vous puissiez l'utiliser simplement !
        </p>
    `);
  
    adsModal.addFooterBtn('Supprimer', 'tingle-btn tingle-btn--warning', function() {
  
      document.querySelector(".ads").remove()
      localStorage.setItem("remove-ads", true)
      adsModal.close()
  
    });
  
    adsModal.addFooterBtn('Annuler', 'tingle-btn tingle-btn--primary', function() {
      adsModal.close();
    });
  
    adsModal.open()
  }
  
  if(localStorage.getItem("remove-ads")){
    document.querySelector(".ads").remove()
  } 
  
  let db = new Database();
  
  let path = require("path")
  
  function getFilesizeInBytes(filename) {
      var stats = fs.statSync(filename);
      var fileSizeInBytes = stats.size;
      return fileSizeInBytes;
  }
  
  
  
  const getDirSize = (dirPath) => {
    let size = 0;
    const files = fs.readdirSync(dirPath);
  
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      const stats = fs.statSync(filePath);
  
      if (stats.isFile()) {
        size += stats.size;
      } else if (stats.isDirectory()) {
        size += getDirSize(filePath);
      }
    }
  
    return size;
  };
  
  function humanFileSize(bytes, si=true, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }
  
  let clearButton = document.getElementById('clear-cache');
  
  let cacheSize = getFilesizeInBytes(require('@electron/remote').app.getPath("userData") + "/Data/songs.json") + getDirSize(require('@electron/remote').app.getPath("userData") + "/Data/downloads");
  
  clearButton.innerHTML = "Vider le cache ("+humanFileSize(cacheSize)+")"
  
  clearButton.onclick = function(){
      fs.writeFileSync(require('@electron/remote').app.getPath("userData") + "/Data/songs.json", "{}")
  
      fs.rmSync(require('@electron/remote').app.getPath("userData") + "/Data/downloads", {recursive: true});
  
      fs.mkdirSync(require('@electron/remote').app.getPath("userData") + "/Data/downloads");
  
      clearButton.innerHTML = "Vider le cache ("+humanFileSize(getFilesizeInBytes(require('@electron/remote').app.getPath("userData") + "/Data/songs.json") + getDirSize(require('@electron/remote').app.getPath("userData") + "/Data/downloads"))+")"
  }
  /* LOAD PLAYLISTS */
  
  let wrapper = document.querySelector(".playlists")
  
  db.getPlaylists().then(elements => {
      elements.forEach((playlist) => {
          let element = document.createElement("div");
          element.innerHTML = playlist["name"];
          element.addEventListener("click", () => {
              window.location.href = "playlist.html?id="+playlist["ID"]
          })
          wrapper.appendChild(element);
      })
  })
  
  var modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ['button', 'escape'],
      closeLabel: "Fermer",
  });
  
  document.getElementById("create-playlist").onclick = function(){
      modal.open()
  }
  
  modal.setContent(`
      <h1>Créer une playlist</h1>
      <p>
          Entrez le nom de votre playlist
      </p>
      <input id="playlist-name" type="text" placeholder="Nom de la playlist...">

      <p>
          Importez depuis YouTube (facultatif)
      </p>
      <input id="playlist-id" type="text" placeholder="ID de la playlist">
  `);
  
  modal.addFooterBtn('Créer', 'tingle-btn tingle-btn--primary', function() {
  
      const playlistName = document.getElementById("playlist-name").value;

      if(document.getElementById("playlist-id").value){
        httpGetAsync(`https://getsiteping.000webhostapp.com/youtubeapi.php?id=`+document.getElementById("playlist-id").value, function(data){

        if(data == "null"){
           modal.close()
           return alert("Impossible de créer la playlist");
            
        }
            songs = JSON.parse(data)["items"].map(item => item["snippet"]["resourceId"]["videoId"])

            if(songs){
                db.createPlaylistWithSongs(playlistName, songs).then(() => {
                    location.reload()
                })
            }

            else{
              modal.close()
              alert("Impossible de créer la playlist");
              
            }
        })
        
        
      }
      else{
        db.createPlaylist(playlistName).then(() => {
            location.reload()
        })
      }
  
      
  });
  
  modal.addFooterBtn('Annuler', 'tingle-btn tingle-btn--danger', function() {
      modal.close();
  });
  
  const {ipcRenderer} = require('electron');
  ipcRenderer.on('message', function(event, text) {
   document.querySelector(".status").innerHTML = text
  })