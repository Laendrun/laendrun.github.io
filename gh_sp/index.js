// ==== Variables
let likes = 0;
let likeGoal = 10;
const secret = '11 COSMO';

// ==== Références DOM (récupérer des éléments de la page)
const likesEl = document.getElementById('likes');
const likeFillEl = document.getElementById('likeFill');
const goalMsgEl = document.getElementById('goalMsg');
const likeBtn = document.getElementById('likeBtn');
const resetBtn = document.getElementById('resetBtn');
const themeBtn = document.getElementById('themeBtn');
const clockEl = document.getElementById('clock');
const secretInput = document.getElementById('secretInput');
const secretMsg = document.getElementById('secret');

// ==== Fonctions
function renderLikes() {
  likesEl.textContent = likes;
  const pourcent = Math.min(100, (likes / likeGoal) * 100);
  likeFillEl.style.width = pourcent + '%';
  goalMsgEl.textContent = likes >= likeGoal ? '🎯 Objectif atteint!' : `Objectif: ${likeGoal} j'aimes`;
}

const tickClock = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${hh}:${mm}:${ss}`;
}

// ==== Récepteur d'événements (fait X quand Y se passe)
const clickLike = (_) => {
  likes = likes + 1;
  renderLikes();
};

const clickReset = (_) => {
  likes = 0;
  renderLikes();
};

const toggleTheme = (_) => {
  document.documentElement.classList.toggle('dark');
};

const keyDownSecret = (e) => {
  if (e.key === 'Enter') {
    if (secretInput.value.trim().toLowerCase() === secret.toLowerCase()) {
      secretMsg.classList.remove('hidden');
    } else {
      secretMsg.classList.add('hidden');
    }
    secretInput.value = '';
  }
};

likeBtn.addEventListener('click', clickLike);
resetBtn.addEventListener('click', clickReset);
themeBtn.addEventListener('click', toggleTheme);
secretInput.addEventListener('keydown', keyDownSecret);

// ==== Démarrer le tout
renderLikes(); // Rendu initial des likes pour avoir un objectif
tickClock(); // Mets une valeur de base dans le texte de l'horloge
setInterval(tickClock, 1000); // Faire en sorte que la fonction tickClock soit lancé chaque seconde