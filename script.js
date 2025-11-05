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
let audioContextUnlocked = false;

// FIX 1: Audio initialization and unlocking
function initAudio() {
  console.log('Initializing audio...');
  
  if (bgMusic) {
    bgMusic.volume = 0.6;
    bgMusic.preload = 'auto';
    
    // Debug events
    bgMusic.addEventListener('canplay', () => {
      console.log('Background music can play');
    });
    
    bgMusic.addEventListener('error', (e) => {
      console.error('Background music error:', bgMusic.error);
    });
  }
  
  if (confettiSound) {
    confettiSound.volume = 0.7;
    confettiSound.preload = 'auto';
  }
}

// FIX 2: Unlock audio context for modern browsers
async function unlockAudio() {
  if (audioContextUnlocked) return true;
  
  try {
    // Resume audio context if suspended
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create and play a silent buffer to unlock audio
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      console.log('Audio context unlocked');
    }
    
    audioContextUnlocked = true;
    return true;
  } catch (error) {
    console.log('Audio context unlock failed, continuing anyway:', error);
    return false;
  }
}

// FIX 3: Improved audio playback with better error handling
async function playAudio(audioElement, soundName = 'audio') {
  if (!audioElement) {
    console.log(`${soundName} element not found`);
    return false;
  }

  try {
    // Unlock audio first
    await unlockAudio();
    
    // Reset and set volume
    audioElement.currentTime = 0;
    
    // Try to play
    await audioElement.play();
    console.log(`${soundName} playing successfully`);
    return true;
    
  } catch (error) {
    console.log(`${soundName} play failed:`, error);
    
    // If autoplay is blocked, we'll handle it gracefully
    if (error.name === 'NotAllowedError') {
      console.log('Audio blocked by browser policy - requires user interaction');
    }
    
    return false;
  }
}

// FIX 4: Gift box functionality - COMPLETELY REWRITTEN
giftBox.addEventListener('click', async (e) => {
  e.stopPropagation();
  console.log('Gift box clicked');
  
  // Toggle open state
  const isOpening = !giftBox.classList.contains('open');
  
  if (isOpening) {
    // Open the gift
    giftBox.classList.add('open');
    
    // Small delay to see animation before showing image
    setTimeout(() => {
      giftOverlay.classList.add('show');
    }, 400);
    
    // Play confetti sound
    await playAudio(confettiSound, 'confetti');
    
  } else {
    // Close the gift
    giftOverlay.classList.remove('show');
    
    // Wait for fade out before removing open class
    setTimeout(() => {
      giftBox.classList.remove('open');
    }, 300);
  }
});

// FIX 5: Close gift when clicking background
giftOverlay.addEventListener('click', (e) => {
  if (e.target === giftOverlay || e.target.classList.contains('gift-image')) {
    giftOverlay.classList.remove('show');
    giftBox.classList.remove('open');
  }
});

// FIX 6: Close overlays with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (giftOverlay.classList.contains('show')) {
      giftOverlay.classList.remove('show');
      giftBox.classList.remove('open');
    }
    if (letterOverlay.classList.contains('show')) {
      hideLetterOverlay();
    }
  }
});

// Original text animation functions (keep these)
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

// Music notes spawning
function spawnNote() {
  const note = document.createElement("span");
  note.textContent = "♫";
  note.style.setProperty("--x", `${Math.random() * 20 - 10}px`);
  note.style.left = "50%";
  musicBox.querySelector(".notes").appendChild(note);

  setTimeout(() => note.remove(), 2200);
}

// FIX 7: Cake click with improved audio
cake.addEventListener("click", async () => {
  if (!finished || !cake.classList.contains("clickable")) return;

  // Play confetti sound
  await playAudio(confettiSound, 'confetti');

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

    // Don't auto-start music - wait for user to click music box
    musicBox.classList.add('off'); // Start with music off
    
    document.querySelector(".scene").classList.add("zoom-in");
  }, duration + 3000);
});

// Card messages (keep this)
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

// FIX 8: Music box with better audio handling
musicBox.addEventListener('click', async (ev) => {
  ev.stopPropagation();
  
  if (!bgMusic) {
    console.log('Background music element not found');
    return;
  }

  if (bgMusic.paused) {
    // Try to play music
    const success = await playAudio(bgMusic, 'background');
    
    if (success) {
      musicBox.classList.remove('off');
      if (!notesInterval) notesInterval = setInterval(spawnNote, 1200);
    } else {
      // Show visual feedback that audio needs interaction
      musicBox.style.background = 'linear-gradient(145deg, #ff6b6b, #c44569)';
      setTimeout(() => {
        musicBox.style.background = 'linear-gradient(145deg, #e2c657, #d71616)';
      }, 1000);
      
      // Show help message
      console.log('Click the music box again to start audio');
    }
  } else {
    // Pause music
    bgMusic.pause();
    musicBox.classList.add('off');
    clearInterval(notesInterval);
    notesInterval = null;
  }
});

// Age calculator (keep this)
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

// Camera functionality (keep this)
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

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  nextLine();
});

// Additional audio initialization on first user interaction
document.addEventListener('click', () => {
  initAudio();
}, { once: true });
