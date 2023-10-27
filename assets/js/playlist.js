
let db = new Database();
let playlistID = new URL(location.href).searchParams.get("id");
db.get("name", playlistID).then(value => {
    document.title = "Vous écoutez la playlist “"+value+"” sur iListen";
})

var addSongModal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['button', 'escape'],
    closeLabel: "Fermer",
});

document.getElementById("add-song").onclick = function(){
    addSongModal.open()
}

addSongModal.setContent(`
    <h1>Ajouter une musique</h1>
    <p>
        Entrez l'identifiant d'une vidéo YouTube
    </p>
    <input id="song-id" type="text" placeholder="Identifiant de la vidéo YouTube...">
`);

addSongModal.addFooterBtn('Ajouter', 'tingle-btn tingle-btn--primary', function() {
    const fs = require("fs");
    const songId = document.getElementById("song-id").value;

    db.addSongToPlaylist(new URL(location.href).searchParams.get("id"), songId).then(() => {
        location.reload()
    })

});

addSongModal.addFooterBtn('Annuler', 'tingle-btn tingle-btn--danger', function() {
    addSongModal.close();
});

// EDIT PLAYLIST

var editModal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['button', 'escape'],
    closeLabel: "Fermer",
    onOpen: function(){
        let ul = document.querySelector("#songs-list")
        ul.innerHTML = ""
        

        db.get("name", playlistID).then(value => {
            document.querySelector("#playlist-name").value = value;
        })
        
        let cache = JSON.parse(fs.readFileSync(require('@electron/remote').app.getPath("userData") + "/Data/songs.json", "utf8"));
        db.getPlaylistSongs(playlistID).then(data => {
            
            console.log(JSON.parse(data))
            JSON.parse(data).forEach(song => {
                let li = document.createElement("li");
                li.innerHTML = cache[song]["title"]+" ";

                let deleteIcon = document.createElement("i")
                deleteIcon.className = "fa-solid fa-trash";
                deleteIcon.style.color = "red";
                deleteIcon.style.cursor = "pointer";
                deleteIcon.title = "Supprimer cette musique de la playlist"
                deleteIcon.onclick = function(){
                    db.removeSongFromPlaylist(playlistID, song)
                    li.remove()
                }
                li.appendChild(deleteIcon);

                ul.appendChild(li);
            })
        })
    }
});

document.getElementById("edit-playlist").onclick = function(){
    editModal.open()
}

editModal.setContent(`
    <h1>Modifier la playlist</h1>
    <p>Nom de la playlist : </p>
    <input id="playlist-name">
    <ul id="songs-list"></ul>
`);

editModal.addFooterBtn('Valider', 'tingle-btn tingle-btn--primary', function() {
    db.renamePlaylist(new URL(location.href).searchParams.get("id"), document.querySelector("#playlist-name").value).then(() => location.reload())
});

editModal.addFooterBtn('Annuler', 'tingle-btn tingle-btn--danger', function() {
    editModal.close();
});

editModal.addFooterBtn('Supprimer la playlist', 'tingle-btn tingle-btn--danger', function() {
    db.deletePlaylist(new URL(location.href).searchParams.get("id")).then(() => location.href = "index.html")
});

// INFOS MODAL

var infoModal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['button', 'escape'],
    closeLabel: "Fermer",
});

document.getElementById("open-infos").onclick = function(){
    infoModal.open()
}

infoModal.setContent(`
    <h1>Informations</h1>
    <p>iListen v1.0.0</p>
    <p>Développeur : liamgen.js (https://liamgenjs.vercel.app)</p>
    <p>Node.js : v18.17.1</p>
    <p>Electron.js : v27.0.2</p>
`);

infoModal.addFooterBtn('Ok', 'tingle-btn tingle-btn--primary', function() {
    infoModal.close()
});

if(localStorage.getItem("theme")){
    setTheme(localStorage.getItem("theme"))
}

function setTheme(theme) {
    localStorage.setItem("theme", theme);

    document.documentElement.className = theme

}

document.querySelectorAll(".themes div").forEach(e => {
    e.onclick = function(){setTheme(e.getAttribute("theme"))}
})