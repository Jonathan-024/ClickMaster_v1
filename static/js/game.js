document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".grid-cell");
    const stopBtn = document.getElementById("stop-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const resumeBtn = document.getElementById("resumeBtn");
    const quitFromPauseBtn = document.getElementById("quitFromPauseBtn");

    const countdownOverlay = document.getElementById("countdownOverlay");
    const countdownText = document.getElementById("countdownText");
    const pauseOverlay = document.getElementById("pauseOverlay");
    const gameOverSection = document.getElementById("gameOverSection");
    const finalScore = document.getElementById("finalScore");
    const finalTotalScore = document.getElementById("finalTotalScore");
    const finalBestScore = document.getElementById("finalBestScore");

    const scoreDisplay = document.getElementById("score");
    const mistakesDisplay = document.getElementById("mistakes");
    const levelDisplay = document.getElementById("level");
    const coinsDisplay = document.getElementById("coins");

    const couleurs = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];

    let timerBloc = null;
    let vitesse = 1000;
    let lastIndex = -1;
    let lastColor = "";

    let score = 0;
    let mistakes = 0;
    let level = 1;
    let coins = 0;
    let blocActif = null;
    let tempsDepart;
    let tempsPause = 0;       // durée totale de pause cumulée
    let debutPause = null;    // moment où on a cliqué sur pause

    const FAUTES_MAX = 10;

    // --- Mapping clavier ---
    const touchesMap = {
      'a':0, '7':0, 'z':1, '8':1, 'e':2, '9':2,
      'q':3, '4':3, 's':4, '5':4, 'd':5, '6':5,
      'w':6, '1':6, 'x':7, '2':7, 'c':8, '3':8
    };
    document.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      if (touchesMap.hasOwnProperty(key)) {
        clicBloc(touchesMap[key]);
      }
    });

    // --- HUD ---
    function majAffichage() {
        scoreDisplay.textContent = score;
        mistakesDisplay.textContent = mistakes;
        levelDisplay.textContent = level;
        coinsDisplay.textContent = coins;
    }

    // --- Choisir bloc + couleur ---
    function choisirBlocAleatoire() {
        cells.forEach(c => c.style.background = "#161a2b");

        let index;
        do {
            index = Math.floor(Math.random() * cells.length);
        } while (index === lastIndex);
        lastIndex = index;

        let couleur;
        do {
            couleur = couleurs[Math.floor(Math.random() * couleurs.length)];
        } while (couleur === lastColor);
        lastColor = couleur;

        cells[index].style.background = couleur;
        blocActif = index;
    }

    // --- Boucle ---
    function boucleBloc() {
        choisirBlocAleatoire();
        majNiveau();
        timerBloc = setTimeout(boucleBloc, vitesse);
    }

    // --- Niveau ---
    function majNiveau() {
        const tempsEcoule = (Date.now() - tempsDepart - tempsPause) / 1000;
        if (tempsEcoule > 40) { level = 5; vitesse = 300; }
        else if (tempsEcoule > 30) { level = 4; vitesse = 500; }
        else if (tempsEcoule > 20) { level = 3; vitesse = 700; }
        else if (tempsEcoule > 10) { level = 2; vitesse = 900; }
        else { level = 1; vitesse = 1000; }
        majAffichage();
    }

    // --- Fin de partie ---
    function finPartie() {
        clearTimeout(timerBloc);
        cells.forEach(c => c.style.background = "#161a2b");

        // Affichage score de la partie
        finalScore.textContent = score;

        // --- Envoi au serveur ---
        fetch("/update_score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: score })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Score mis à jour côté serveur ✅", data);
            // Mettre à jour affichage bloc fin de partie
            finalTotalScore.textContent = data.totalScore;
            finalBestScore.textContent = data.bestScore;

            // Mettre à jour la nav si présente
            const navTotal = document.getElementById("navTotalScore");
            const navBest = document.getElementById("navBestScore");
            if (navTotal && navBest) {
                navTotal.textContent = data.totalScore;
                navBest.textContent = data.bestScore;
            }
        })
        .catch(err => console.error("Erreur update_score:", err));

        gameOverSection.style.display = "block";
    }

    // --- Clic sur bloc ---
    function clicBloc(index) {
        if (index === blocActif) {
            score += 5; // +5 points par réussite
            coins = Math.floor(score / 10);
        } else {
            mistakes++;
        }

        majAffichage();

        if (mistakes >= FAUTES_MAX) {
            finPartie();
        }
    }

    // --- Compte à rebours initial ---
    function startCountdown() {
        let count = 3;
        countdownOverlay.style.display = "block";
        countdownText.textContent = count;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.textContent = count;
            } else if (count === 0) {
                countdownText.textContent = "GO!";
            } else {
                clearInterval(interval);
                countdownOverlay.style.display = "none";
                tempsDepart = Date.now();
                boucleBloc();
            }
        }, 1000);
    }

    // --- Compte à rebours pour Reprendre ---
    function startResumeCountdown() {
        let count = 3;
        countdownOverlay.style.display = "block";
        countdownText.textContent = count;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.textContent = count;
            } else if (count === 0) {
                countdownText.textContent = "GO!";
            } else {
                clearInterval(interval);
                countdownOverlay.style.display = "none";
                boucleBloc();
            }
        }, 1000);
    }

    // --- Pause / Reprendre ---
    pauseBtn.addEventListener("click", () => {
        clearTimeout(timerBloc);
        debutPause = Date.now();
        pauseOverlay.style.display = "block";
    });

    resumeBtn.addEventListener("click", () => {
        pauseOverlay.style.display = "none";
        tempsPause += Date.now() - debutPause;
        startResumeCountdown();
    });

    // --- Quitter depuis Pause ---
    quitFromPauseBtn.addEventListener("click", () => {
        const homeUrl = quitFromPauseBtn.getAttribute("data-home") || "/";
        window.location.href = homeUrl;
    });

    // --- STOP ---
    stopBtn.addEventListener("click", () => {
        window.location.href = "/";
    });

    // --- Clics sur les blocs ---
    cells.forEach((cell, index) => {
        cell.addEventListener("click", () => clicBloc(index));
    });

    // --- Lancer le jeu ---
    majAffichage();
    startCountdown();
});
