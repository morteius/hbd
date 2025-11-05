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

let currentLine = 0;
let finished = false;
let notesInterval = null;

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

// ---------- notes spawning ----------
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

  if (confettiSound && typeof confettiSound.play === 'function') {
    confettiSound.currentTime = 0;
    confettiSound.play().catch(()=>{});
  }

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

    if (bgMusic && typeof bgMusic.play === 'function') {
      bgMusic.play().catch(()=>{}); 
      musicBox.classList.remove('off');
    }

    if (!notesInterval) notesInterval = setInterval(spawnNote, 1200);
    document.querySelector(".scene").classList.add("zoom-in");
  }, duration + 3000);
});

// ---------- CARD MESSAGE ----------
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

document.addEventListener('click', (e) => {
  if (!letterOverlay.classList.contains('show')) return;
  if (e.target.closest('.letter-box')) return;
  hideLetterOverlay();
});

letterOverlay.addEventListener('click', (e) => {
  if (!e.target.closest('.letter-box')) {
    hideLetterOverlay();
    return;
  }
  e.stopPropagation();
});

function hideLetterOverlay() {
  letterOverlay.classList.remove('show');
  setTimeout(() => { letterText.textContent = ""; }, 300);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && letterOverlay.classList.contains('show')) {
    hideLetterOverlay();
  }
});

// ---------- MUSIC BOX ----------
musicBox.addEventListener('click', (ev) => {
  ev.stopPropagation();
  if (!bgMusic) return;

  if (bgMusic.paused) {
    bgMusic.play().catch(()=>{});
    musicBox.classList.remove('off');
    if (!notesInterval) notesInterval = setInterval(spawnNote, 1200);
  } else {
    bgMusic.pause();
    musicBox.classList.add('off');
    clearInterval(notesInterval);
    notesInterval = null;
  }
});

// ---------- AGE CALCULATOR ----------
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

// ---------- CAMERA ----------
const cameraBg = document.getElementById('cameraBg');
const cameraWindow = document.getElementById('cameraWindow');
const captureBtn = document.getElementById('captureBtn');
const cameraFeed = document.getElementById('cameraFeed');
const photoCanvas = document.getElementById('photoCanvas');
const thumbnailBar = document.getElementById('thumbnailBar');

let stream;
let capturedPhotos = [];

// open camera
document.querySelector('.camera').addEventListener('click', async () => {
  cameraBg.classList.add('show');
  cameraWindow.classList.add('show');

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraFeed.srcObject = stream;
    cameraFeed.style.transform = "scaleX(-1)"; // mirror camera
    await cameraFeed.play();
  } catch (err) {
    console.error("Camera access error:", err);
    alert("Unable to access camera. Please check permissions.");
  }
});

// take picture (mirrored)
captureBtn.addEventListener('click', () => {
  if (!stream) return;

  const ctx = photoCanvas.getContext('2d');
  photoCanvas.width = cameraFeed.videoWidth;
  photoCanvas.height = cameraFeed.videoHeight;

  // flip horizontally before drawing
  ctx.translate(photoCanvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const photoSrc = photoCanvas.toDataURL('image/png');
  capturedPhotos.push(photoSrc);

  // ✅ Only show 1 thumbnail (latest)
  thumbnailBar.innerHTML = ''; // clear old one
  const latestThumb = document.createElement('img');
  latestThumb.src = photoSrc;
  thumbnailBar.appendChild(latestThumb);

  latestThumb.addEventListener('click', () => openGallery());
});

// ✅ Gallery View (click thumbnail to open)
function openGallery() {
  const galleryOverlay = document.createElement('div');
  galleryOverlay.classList.add('gift-overlay', 'show');
  galleryOverlay.style.backdropFilter = 'blur(8px)';
  galleryOverlay.style.display = 'flex';
  galleryOverlay.style.justifyContent = 'center';
  galleryOverlay.style.alignItems = 'center';
  galleryOverlay.style.zIndex = '2000';

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

// close camera when clicking background
cameraBg.addEventListener('click', () => {
  cameraBg.classList.remove('show');
  cameraWindow.classList.remove('show');
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
});


nextLine();
