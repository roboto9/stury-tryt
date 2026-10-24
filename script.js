let isRunning = false;
let totalViews = 0;
let players = [];
let videoId = "";
let targetViews = 0;
let playbackSpeed = 1;

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function startSystem() {
    const urlInput = document.getElementById("txtUrl").value.trim();
    videoId = extractVideoId(urlInput);

    if (!videoId) {
        alert("Veuillez entrer un lien YouTube valide.");
        return;
    }

    isRunning = true;
    totalViews = 0;
    targetViews = parseInt(document.getElementById("numTarget").value) || 0;
    playbackSpeed = parseFloat(document.getElementById("selSpeed").value);

    document.getElementById("viewCounter").textContent = "0";
    const statusEl = document.getElementById("lblStatus");
    statusEl.textContent = "En cours d'exécution...";
    statusEl.style.color = "var(--success)";

    toggleInputs(true);
    buildPlayers();
}

function buildPlayers() {
    const container = document.getElementById("playersContainer");
    container.innerHTML = "";
    players = [];

    const numWin = parseInt(document.getElementById("numWindows").value);

    for (let i = 0; i < numWin; i++) {
        const divId = `player_${i}`;
        const wrapper = document.createElement("div");
        wrapper.className = "player-wrapper";
        wrapper.innerHTML = `<div id="${divId}"></div>`;
        container.appendChild(wrapper);

        const player = new YT.Player(divId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'mute': 1, // Requis pour l'autoplay des navigateurs
                'controls': 0,
                'disablekb': 1,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        players.push(player);
    }
}

function onPlayerReady(event) {
    event.target.setPlaybackRate(playbackSpeed);
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED == 0
    if (event.data === YT.PlayerState.ENDED && isRunning) {
        totalViews++;
        document.getElementById("viewCounter").textContent = totalViews;

        if (targetViews > 0 && totalViews >= targetViews) {
            stopSystem();
            const statusEl = document.getElementById("lblStatus");
            statusEl.textContent = "Objectif atteint avec succès !";
            statusEl.style.color = "var(--success)";
            alert(`L'objectif de ${targetViews} vues a été atteint !`);
            return;
        }

        // Relance automatique pour boucler
        event.target.seekTo(0);
        event.target.playVideo();
    }
}

function stopSystem() {
    isRunning = false;

    players.forEach(player => {
        if (player && typeof player.destroy === 'function') {
            player.destroy();
        }
    });
    players = [];

    document.getElementById("playersContainer").innerHTML = "";
    const statusEl = document.getElementById("lblStatus");
    statusEl.textContent = "Arrêté par l'utilisateur.";
    statusEl.style.color = "var(--danger)";

    toggleInputs(false);
}

function toggleInputs(disabled) {
    document.getElementById("txtUrl").disabled = disabled;
    document.getElementById("numWindows").disabled = disabled;
    document.getElementById("numTarget").disabled = disabled;
    document.getElementById("selSpeed").disabled = disabled;
    document.getElementById("btnStart").disabled = disabled;
    document.getElementById("btnStop").disabled = !disabled;
}

function onYouTubeIframeAPIReady() {
    // API prête
}