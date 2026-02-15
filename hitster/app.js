document.addEventListener('DOMContentLoaded', function () {
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  document.getElementById('scanner-container').appendChild(video);

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      requestAnimationFrame(scanQR);
    })
    .catch(err => console.error('Error accessing camera:', err));

  function scanQR() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        const hitsterUrl = code.data;
        const cardNumber = extractCardNumber(hitsterUrl);
        const song = findSongByCardNumber(cardNumber);
        if (song) {
          displaySong(song);
        }
      }
    }
    requestAnimationFrame(scanQR);
  }

  function extractCardNumber(url) {
    return url.split('/').pop();
  }

  function findSongByCardNumber(cardNumber) {
    return dataset.find(song => song.CardNumber === cardNumber);
  }

  function displaySong(song) {
    document.getElementById('song-title').textContent = song.name;
    document.getElementById('song-artist').textContent = song.artist;
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('spotify-btn').onclick = () => window.open(song.spotify_url, '_blank');
    document.getElementById('ytm-btn').onclick = () => window.open(song.ytm_url, '_blank');
  }

  let dataset = [];
  fetch('assets/songs.json')
    .then(response => response.json())
    .then(data => {
      dataset = data;
    });
});
