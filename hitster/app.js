document.addEventListener('DOMContentLoaded', function () {
  const startCameraBtn = document.getElementById('start-camera-btn');
  const scannerContainer = document.getElementById('scanner-container');
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  scannerContainer.appendChild(video);

  let stream;
  let dataset = {};

  startCameraBtn.addEventListener('click', function () {
    startCameraBtn.classList.add('hidden');
    scannerContainer.classList.remove('hidden');
    startScanner();
  });

  function startScanner() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(newStream => {
        stream = newStream;
        video.srcObject = stream;
        video.play();
        requestAnimationFrame(scanQR);
      })
      .catch(err => console.error('Error accessing camera:', err));
  }

  function stopScanner() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      scannerContainer.classList.add('hidden');
      startCameraBtn.classList.remove('hidden');
    }
  }

  function scanQR() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        const hitsterUrl = code.data;
        if (isValidHitsterUrl(hitsterUrl)) {
          const song = findSongByUrl(hitsterUrl);
          if (song) {
            stopScanner();
            displaySong(song);
            return;
          } else {
            console.error('Song not found for URL:', hitsterUrl);
          }
        }
      }
    }
    requestAnimationFrame(scanQR);
  }

  function isValidHitsterUrl(url) {
    return url.includes('hitstergame.com/');
  }

  function findSongByUrl(url) {
    const parts = url.split('/');

    console.log(parts);

    const language = parts[parts.length - 3];
    const skuOrCard = parts[parts.length - 2];
    const cardNumber = parts[parts.length - 1];

    console.log('language', language)
    console.log('skuOrCard', skuOrCard)
    console.log('cardNumber', cardNumber)

    const isSkuFormat = !isNaN(cardNumber) && skuOrCard !== 'www.hitstergame.com';

    console.log('isSkuFormat', isSkuFormat)

    let sku, actualCardNumber;
    if (isSkuFormat) {
      sku = skuOrCard;
      actualCardNumber = cardNumber;
    } else {
      sku = 'none'; // Default SKU for URLs without SKU
      actualCardNumber = skuOrCard;
    }

    const languageData = dataset[language];
    if (!languageData) return null;

    const gameset = languageData.gamesets[sku];
    if (!gameset) return null;

    return gameset.cards.find(card => card.CardNumber === actualCardNumber);
  }

  function displaySong(song) {
    document.getElementById('song-title').textContent = song.name;
    document.getElementById('song-artist').textContent = song.artist;
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('spotify-btn').onclick = () => window.open(song.spotify_url, '_blank');
    document.getElementById('ytm-btn').onclick = () => window.open(song.ytm_url, '_blank');
  }

  // Load your dataset
  fetch('assets/songs.json')
    .then(response => response.json())
    .then(data => {
      dataset = data;
    });
});
