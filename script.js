const messages = [
  "Happy Birthday, Ella!",
  "Tap the cake!"
];

const textElement = document.getElementById("message");
const cake = document.querySelector(".cake");
const cards = document.querySelector(".cards");
const giftBox = document.querySelector(".gift-box");
const musicBox = document.getElementById('musicBox');
const bgMusic = document.getElementById('bgMusic');
const confettiSound = document.getElementById("confettiSound");
const cameraContainer = document.querySelector(".camera-container");

const letterOverlay = document.querySelector('.letter-overlay');
const letterBox = document.querySelector('.letter-box');
const letterText = document.getElementById('letterText');

const giftOverlay = document.querySelector('.gift-overlay');
const giftImage = document.querySelector('.gift-image');

let currentLine = 0;
let finished = false;
let notesInterval = null;

// SIMPLE AUDIO FUNCTION
function playSound(sound, volume = 0.7) {
  if (!sound) {
    console.log('Sound element not found');
    return false;
  }
  
  try {
    // Reset and set volume
    sound.currentTime = 0;
    sound.volume = volume;
    
    // Play with promise handling
    const promise = sound.play();
    
    if (promise !== undefined) {
      promise.catch(error => {
        console.log('Audio play was prevented:', error);
        // Show user they need to interact
        showAudioMessage();
      });
    }
    return true;
  } catch (error) {
    console.log('Audio error:', error);
    return false;
  }
}

function showAudioMessage() {
  // Create a temporary message
  const message = document.createElement('div');
  message.textContent = 'Click anywhere to enable audio';
  message.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,0,0,0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  document.body.appendChild(message);
  
  setTimeout(() => {
    document.body.removeChild(message);
  }, 3000);
}

// Enable audio on any click
document.addEventListener('click', function enableAudio() {
  // Remove this listener after first click
  document.removeEventListener('click', enableAudio);
  
  // Try to play a silent sound to unlock audio
  const silentAudio = new Audio();
  silentAudio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAC';
  silentAudio.play().then(() => {
    console.log('Audio unlocked');
  }).catch(e => {
    console.log('Silent audio failed:', e);
  });
}, { once: true });

// Gift box functionality
giftBox.addEventListener('click', (e) => {
  e.stopPropagation();
  
  const isOpening = !giftBox.classList.contains('open');
  giftBox.classList.toggle('open');
  
  if (isOpening) {
    giftOverlay.classList.add('show');
    giftImage.style.display = 'block';
    playSound(confettiSound, 0.8);
  } else {
    giftOverlay.classList.remove('show');
    giftImage.style.display = 'none';
  }
});

giftOverlay.addEventListener('click', (e) => {
  if (e.target === giftOverlay) {
    giftOverlay.classList.remove('show');
    giftBox.classList.remove('open');
    giftImage.style.display = 'none';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (giftOverlay.classList.contains('show')) {
      giftOverlay.classList.remove('show');
      giftBox.classList.remove('open');
      giftImage.style.display = 'none';
    }
    if (letterOverlay.classList.contains('show')) {
      hideLetterOverlay();
    }
  }
});

function showLine(line, callback) {
  textElement.innerHTML = "";
  const letters = [...line.replace(/ /g, "\u00A0")];

  letters.forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("fade-letter");
    span.style.animationDelay = `${i * 0.15}s`;
    textElement.appendChild(span);
  });

  const totalFadeTime = letters.length * 150 + 1500;
  setTimeout(callback, totalFadeTime);
}

function nextLine() {
  if (currentLine >= messages.length) {
    textElement.style.transition = "opacity 1.5s ease-in-out";
    textElement.style.opacity = 0;
    setTimeout(() => {
      finished = true;
      cake.classList.add("clickable");
    }, 1500);
    return;
  }

  showLine(messages[currentLine], () => {
    setTimeout(() => {
      textElement.style.transition = "opacity 1s ease-in-out";
      textElement.style.opacity = 0;
      setTimeout(() => {
        textElement.style.opacity = 1;
        currentLine++;
        nextLine();
      }, 800);
    }, 1000);
  });
}

function spawnNote() {
  const note = document.createElement("span");
  note.textContent = "♫";
  note.style.setProperty("--x", `${Math.random() * 20 - 10}px`);
  note.style.left = "50%";
  musicBox.querySelector(".notes").appendChild(note);

  setTimeout(() => note.remove(), 2200);
}

cake.addEventListener("click", () => {
  if (!finished || !cake.classList.contains("clickable")) return;

  // Play confetti sound
  playSound(confettiSound, 0.8);

  const duration = 4000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      startVelocity: 5,
      gravity: 0.8,
      spread: 70,
      ticks: 300,
      origin: { x: Math.random(), y: Math.random() * 0.1 },
      colors: ["#fff0f0", "#ffd6a5", "#ffb5a7", "#ffe5b4", "#fcd5ce", "#ffcad4"]
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  cake.classList.remove("clickable");
  cake.classList.add("fading");
  setTimeout(() => cake.classList.remove("fading"), 2500);

  setTimeout(() => {
    cards.classList.add("show");
    giftBox.classList.add("show");
    musicBox.classList.add("show");
    cameraContainer.classList.add("show");

    // Don't auto-play music on GitHub Pages
    musicBox.classList.add('off');
    
    if (!notesInterval) notesInterval = setInterval(spawnNote, 1200);
    document.querySelector(".scene").classList.add("zoom-in");
  }, duration + 3000);
});

cards.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const message = card.dataset.message || "Have a nice day!";
    letterText.textContent = message;
    const bg = window.getComputedStyle(card).background;
    letterBox.style.background = bg;
    letterOverlay.classList.add('show');
  });
});

function hideLetterOverlay() {
  letterOverlay.classList.remove('show');
  setTimeout(() => { letterText.textContent = ""; }, 300);
}

letterOverlay.addEventListener('click', (e) => {
  if (!e.target.closest('.letter-box')) {
    hideLetterOverlay();
  }
});

// Music box - user must click to start music
musicBox.addEventListener('click', (ev) => {
  ev.stopPropagation();
  
  if (!bgMusic) return;

  if (bgMusic.paused) {
    const success = playSound(bgMusic, 0.6);
    if (success) {
      musicBox.classList.remove('off');
      if (!notesInterval) notesInterval = setInterval(spawnNote, 1200);
    }
  } else {
    bgMusic.pause();
    musicBox.classList.add('off');
    clearInterval(notesInterval);
    notesInterval = null;
  }
});

// Age calculator
const birthDate = new Date('2005-11-06');
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const hasHadBirthday =
  today.getMonth() > birthDate.getMonth() ||
  (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
if (!hasHadBirthday) age--;
document.querySelectorAll(".card").forEach(card => {
  if (card.dataset.message.includes("{age}")) {
    card.dataset.message = card.dataset.message.replace("{age}", age);
  }
});

// Camera functionality
const cameraBg = document.getElementById('cameraBg');
const cameraWindow = document.getElementById('cameraWindow');
const captureBtn = document.getElementById('captureBtn');
const cameraFeed = document.getElementById('cameraFeed');
const photoCanvas = document.getElementById('photoCanvas');
const thumbnailBar = document.getElementById('thumbnailBar');

let stream;
let capturedPhotos = [];

document.querySelector('.camera').addEventListener('click', async () => {
  cameraBg.classList.add('show');
  cameraWindow.classList.add('show');

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraFeed.srcObject = stream;
    cameraFeed.style.transform = "scaleX(-1)";
    await cameraFeed.play();
  } catch (err) {
    console.error("Camera access error:", err);
    alert("Unable to access camera. Please check permissions.");
  }
});

captureBtn.addEventListener('click', () => {
  if (!stream) return;

  const ctx = photoCanvas.getContext('2d');
  photoCanvas.width = cameraFeed.videoWidth;
  photoCanvas.height = cameraFeed.videoHeight;

  ctx.translate(photoCanvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const photoSrc = photoCanvas.toDataURL('image/png');
  capturedPhotos.push(photoSrc);

  thumbnailBar.innerHTML = '';
  const latestThumb = document.createElement('img');
  latestThumb.src = photoSrc;
  thumbnailBar.appendChild(latestThumb);

  latestThumb.addEventListener('click', () => openGallery());
});

function openGallery() {
  const galleryOverlay = document.createElement('div');
  galleryOverlay.classList.add('gift-overlay', 'show');
  galleryOverlay.style.cssText = `
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;

  const gallery = document.createElement('div');
  gallery.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    grid-auto-rows: 120px;
    gap: 10px;
    padding: 20px;
    width: 80vw;
    height: 75vh;
    overflow-y: auto;
    background: rgba(0,0,0,0.85);
    border: 2px solid #ff99bb;
    border-radius: 16px;
    box-shadow: 0 0 20px rgba(255,192,203,0.3);
  `;

  capturedPhotos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    img.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = src;
      link.download = `photo_${Date.now()}.png`;
      link.click();
    });
    img.addEventListener('mouseenter', () => (img.style.transform = 'scale(1.05)'));
    img.addEventListener('mouseleave', () => (img.style.transform = 'scale(1)'));
    gallery.appendChild(img);
  });

  galleryOverlay.appendChild(gallery);
  document.body.appendChild(galleryOverlay);

  galleryOverlay.addEventListener('click', e => {
    if (e.target === galleryOverlay) galleryOverlay.remove();
  });
}

cameraBg.addEventListener('click', () => {
  cameraBg.classList.remove('show');
  cameraWindow.classList.remove('show');
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
});

nextLine();
