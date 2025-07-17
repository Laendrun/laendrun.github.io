const MIN_DELAY = 5; // in seconds

let sta = {
  play: false,
};

const formatText = (text) => {
  const words = text.toLowerCase().split(' ');
  return words
    .map((t) => {
      return t[0].toUpperCase() + t.substring(1);
    })
    .join(' ');
};

const updateDisplay = async () => {
  const currentTitle = document.getElementById('current-title');
  const currentArtist = document.getElementById('current-artist');

  const lastTitle = document.getElementById('last-title');
  const lastArtist = document.getElementById('last-artist');

  const nextTitle = document.getElementById('next-title');
  const nextArtist = document.getElementById('next-artist');

  let data = await fetch('https://mediaone-digital.ch/cache/2101.json');
  let json = await data.json();

  currentTitle.innerText = formatText(json.live[0].title);
  currentArtist.innerText = formatText(json.live[0].interpret);

  document.title = `${formatText(json.live[0].interpret)} - ${formatText(
    json.live[0].title
  )}`;

  lastTitle.innerText = formatText(json.played[0].title);
  lastArtist.innerText = formatText(json.played[0].interpret);

  let upcomingData = await fetch(
    'https://mediaone-digital.ch/cache/upcoming/2101.json'
  );
  let upcomingJson = await upcomingData.json();

  nextTitle.innerText = formatText(upcomingJson.upcoming[0].title);
  nextArtist.innerText = formatText(upcomingJson.upcoming[0].interpret);

  return {
    duration: json.live[0].duration,
    playtime: json.live[0].detailledPlayTime + '+02:00',
  };
};

window.addEventListener('DOMContentLoaded', async () => {
  if ('serviceworker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').register();
      then((reg) => console.log('Service worker registered', reg.scope)).catch(
        (err) => console.error('Service worker registration failed', err)
      );
    });
  }

  const audioPlayer = document.getElementById('player');
  const playButton = document.getElementById('play');
  const themeToggle = document.getElementById('toggle-theme');

  playButton.addEventListener('click', () => {
    if (!sta.play) {
      audioPlayer.play();
      playButton.innerText = 'Pause';
    } else {
      audioPlayer.pause();
      playButton.innerText = 'Play';
    }
    sta.play = !sta.play;
  });

  const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
    themeToggle.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
  };

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.classList.contains(
      'dark-mode'
    )
      ? 'dark'
      : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  const nextUpdate = async () => {
    const { duration, playtime } = await updateDisplay();
    const now = new Date();
    const durationInSeconds = parseFloat(duration);
    const startTime = new Date(playtime);
    const elapsed = (now - startTime) / 1000;

    console.log('Current time:', now.toISOString());
    console.log('Duration', durationInSeconds);
    console.log('Start time:', startTime.toISOString());

    console.log('Elapsed seconds:', elapsed);

    const remaining = Math.max(durationInSeconds - elapsed, MIN_DELAY);

    console.log(`Next update in ${remaining.toFixed(2)} seconds`);

    setTimeout(nextUpdate, remaining * 1000);
  };

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  nextUpdate();
});
