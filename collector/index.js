const MIN_DELAY = 5;
const AVERAGE_JINGLE_LENGTH = 7;
const LIVE_URL = 'https://mediaone-digital.ch/cache/2101.json';
const UPCOMING_URL = 'https://mediaone-digital.ch/cache/upcoming/2101.json';

const state = {
  timer: null,
  isPlaying: false,
  currentSongStart: null,
  currentSongDuration: null,
  progressInterval: null,
};

const capitalizeWords = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

const setElemText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
};

const fetchJSON = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const updateMediaSession = ({ title, artist, cover = null }) => {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: title,
    artist: artist,
    artwork: [{ src: cover, sizes: '90x90', type: 'image/jpg' }],
  });
};

const updateDisplay = async () => {
  const { live, played } = await fetchJSON(LIVE_URL);

  const liveTitle = capitalizeWords(live[0].title);
  const liveArtist = capitalizeWords(live[0].interpret);
  const lastTitle = capitalizeWords(played[0].title);
  const lastArtist = capitalizeWords(played[0].interpret);
  const cover = live[0].imagexs;

  setElemText('current-title', liveTitle);
  setElemText('current-artist', liveArtist);
  document.title = `${liveArtist} - ${liveTitle}`;

  setElemText('last-title', lastTitle);
  setElemText('last-artist', lastArtist);

  const { upcoming } = await fetchJSON(UPCOMING_URL);
  setElemText('next-title', capitalizeWords(upcoming[0].title));
  setElemText('next-artist', capitalizeWords(upcoming[0].interpret));

  if ('mediaSession' in navigator) {
    updateMediaSession({
      title: liveTitle,
      artist: liveArtist,
      cover: cover,
    });
  }

  return {
    duration: parseFloat(live[0].duration),
    playtime: `${live[0].detailledPlayTime}+02:00`,
  };
};

const setupTheme = (toggleBtn) => {
  const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
    toggleBtn.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
    localStorage.setItem('theme', theme);
  };

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.classList.contains(
      'dark-mode'
    )
      ? 'dark'
      : 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
};

const setupAudioControls = (audio, button) => {
  button.addEventListener('click', () => {
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
      audio.play();
      button.innerText = 'Pause';
    } else {
      audio.pause();
      button.innerText = 'Jouer';
    }
  });
};

const startProgress = () => {
  const progressBar = document.getElementById('progress-bar');
  if (state.progressInterval) clearInterval(state.progressInterval);

  if (
    'mediaSession' in navigator &&
    'setPositionState' in navigator.mediaSession
  ) {
    navigator.mediaSession.setPositionState({
      duration: state.currentSongDuration,
      playbackRate: 1.0,
      position: elapsed,
    });
  }

  state.progressInterval = setInterval(() => {
    const now = new Date();
    const elapsed = (now - state.currentSongStart) / 1000;
    const progress = Math.min(elapsed / state.currentSongDuration, 1);

    progressBar.style.width = `${progress * 100}%`;

    if (progress >= 1) {
      clearInterval(state.progressInterval);
    }
  }, 1000);
};

const scheduleNextUpdate = async () => {
  const { duration, playtime } = await updateDisplay();
  const now = new Date();
  const startTime = new Date(playtime);
  const elapsed = (now - startTime) / 1000;
  const remaining = Math.max(
    duration - elapsed + AVERAGE_JINGLE_LENGTH,
    MIN_DELAY
  );

  state.currentSongStart = startTime;
  state.currentSongDuration = duration + AVERAGE_JINGLE_LENGTH;

  console.log(
    `Duration: ${duration} + ${AVERAGE_JINGLE_LENGTH} (average jingle length)`
  );
  console.log('Now: ', now);
  console.log('Start time:', startTime);
  console.log('Elapsed:', elapsed);
  console.log('Remaining:', remaining);

  console.log(`Next update in ${remaining.toFixed(2)} seconds`);

  startProgress();

  setTimeout(() => {
    scheduleNextUpdate();
  }, remaining * 1000);
};

window.addEventListener('DOMContentLoaded', () => {
  const audioPlayer = document.getElementById('player');
  const playButton = document.getElementById('play');
  const themeToggle = document.getElementById('toggle-theme');

  setupAudioControls(audioPlayer, playButton);
  setupTheme(themeToggle);
  scheduleNextUpdate();
});
