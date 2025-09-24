// --- Classement dynamique ---
(function(){
// === HOME PAGE LOGIC ===

// Sélecteur du leaderboard
const leaderboardEl = document.getElementById("leaderboard");

// Fonction pour charger le leaderboard
function loadLeaderboard() {
  fetch("/api/leaderboard")
    .then(res => res.json())
    .then(data => {
      leaderboardEl.innerHTML = "";

      if (data.length === 0) {
        leaderboardEl.innerHTML = "<p>Aucun score pour le moment.</p>";
        return;
      }

      const list = document.createElement("ol");
      data.forEach((player, index) => {
        const item = document.createElement("li");
        item.innerHTML = `
          <span class="rank">#${index + 1}</span>
          <span class="name">${player.name}</span>
          <span class="score">${player.score}</span>
        `;
        list.appendChild(item);
      });

      leaderboardEl.appendChild(list);
    })
    .catch(err => {
      console.error("Erreur lors du chargement du leaderboard :", err);
      leaderboardEl.innerHTML = "<p>Impossible de charger le classement.</p>";
    });
}

// Charger au démarrage
loadLeaderboard();

// Rafraîchir toutes les 10 secondes
setInterval(loadLeaderboard, 10000);

})();

(function(){
  const tbody = document.getElementById("leaderboardBody");
  if (!tbody) return;

  fetch("/api/leaderboard")
    .then(res => res.json())
    .then(users => {
      tbody.innerHTML = "";
      if (!users || users.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3'>Aucun joueur enregistré</td></tr>";
        return;
      }
      users.forEach((u, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${u.name}</td>
          <td>${u.score}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Erreur chargement leaderboard :", err);
      tbody.innerHTML = "<tr><td colspan='3'>Erreur de chargement</td></tr>";
    });
})();
