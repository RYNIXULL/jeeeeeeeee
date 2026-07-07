/* ============================================================
   SCRIPT.JS — Pure Vanilla JS, No Libraries
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
//  TOAST SYSTEM
// ─────────────────────────────────────────────
const Toast = (() => {
  const container = document.getElementById('toast-container');
  const queue = [];
  let active = null;

  function _svgIcon(type) {
    if (type === 'info') {
      return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    } else if (type === 'success') {
      return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      return `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }
    return '';
  }

  function show(message, type = 'info', duration = 3000) {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = _svgIcon(type) + `<span>${message}</span>`;
    container.appendChild(el);

    // Trigger show
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.classList.add('show'); });
    });

    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.remove(); }, 450);
    }, duration);
  }

  return { show };
})();

// ─────────────────────────────────────────────
//  STARFIELD
// ─────────────────────────────────────────────
function buildStarfield() {
  const container = document.getElementById('starfield');
  if (!container) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Performance: fewer stars on small screens
  const total = Math.min(Math.floor((W * H) / 3000), 380);
  const fragment = document.createDocumentFragment();

  const types = ['twinkle-slow', 'twinkle-fast', 'drift', 'blink'];
  const weights = [0.40, 0.25, 0.20, 0.15]; // probability weights

  function weightedRandom() {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < weights.length; i++) {
      cum += weights[i];
      if (r < cum) return types[i];
    }
    return types[0];
  }

  for (let i = 0; i < total; i++) {
    const star = document.createElement('div');
    star.className = `star ${weightedRandom()}`;

    const size = Math.random() < 0.08
      ? (Math.random() * 2.2 + 1.8)   // rare large stars
      : (Math.random() * 1.4 + 0.4);  // common small stars

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = (Math.random() * 5 + 2).toFixed(1) + 's';
    const delay = -(Math.random() * 8) + 's';
    const opFrom = (Math.random() * 0.3 + 0.05).toFixed(2);
    const opTo = (Math.random() * 0.6 + 0.35).toFixed(2);
    const driftDur = (Math.random() * 30 + 20).toFixed(0) + 's';

    const dx = ['dx1','dx2','dx3'].map(() => (Math.random() * 8 - 4).toFixed(1) + 'px');
    const dy = ['dy1','dy2','dy3'].map(() => (Math.random() * 8 - 4).toFixed(1) + 'px');

    star.style.cssText = `
      width:${size}px; height:${size}px;
      top:${y}%; left:${x}%;
      opacity:${opFrom};
      --dur:${dur};
      --delay:${delay};
      --op-from:${opFrom};
      --op-to:${opTo};
      --drift-dur:${driftDur};
      --dx1:${dx[0]}; --dy1:${dy[0]};
      --dx2:${dx[1]}; --dy2:${dy[1]};
      --dx3:${dx[2]}; --dy3:${dy[2]};
    `;

    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

// ─────────────────────────────────────────────
//  PROGRESS DOTS
// ─────────────────────────────────────────────
function updateDots(index) {
  document.querySelectorAll('#progress-dots .dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// ─────────────────────────────────────────────
//  SLIDE SYSTEM
// ─────────────────────────────────────────────
const Slider = (() => {
  const container = document.getElementById('slides-container');
  let current = 0;
  let isAnimating = false;

  function goTo(index) {
    if (isAnimating || index === current || index < 0 || index > 2) return;

    isAnimating = true;
    container.classList.add('animating');
    current = index;

    container.style.transform = `translateX(-${index * 33.3333}%)`;
    updateDots(index);

    // Slide 2: autoplay video
    if (index === 1) {
      setTimeout(() => triggerVideoPlay(), 600);
    } else {
      pauseVideo();
    }

    // Slide 3: animate envelope scene entrance and play BGM
    const bgm = document.getElementById('bgm-slide3');
    if (index === 2) {
      setTimeout(() => {
        animateSlide3Entrance();
        if (bgm) {
          bgm.volume = 0;
          bgm.play().catch(() => {});
          // Fade in audio slowly
          let vol = 0;
          const fade = setInterval(() => {
            if (vol < 0.6) {
              vol += 0.05;
              bgm.volume = vol;
            } else {
              clearInterval(fade);
            }
          }, 200);
        }
      }, 400);
    } else if (bgm) {
      bgm.pause();
    }

    const duration = 1150;
    setTimeout(() => {
      isAnimating = false;
      container.classList.remove('animating');
    }, duration);
  }

  function getCurrent() { return current; }

  return { goTo, getCurrent };
})();

// ─────────────────────────────────────────────
//  VIDEO
// ─────────────────────────────────────────────
const videoEl = document.getElementById('main-video');

function triggerVideoPlay() {
  if (!videoEl) return;
  videoEl.muted = false;
  const play = videoEl.play();
  if (play !== undefined) {
    play.catch(() => {
      // Autoplay with sound blocked; try muted then show toast
      videoEl.muted = true;
      videoEl.play().catch(() => {});
      Toast.show('Aktifkan suara pada perangkat Anda', 'info', 4000);
    });
  }
}

function pauseVideo() {
  if (!videoEl) return;
  videoEl.pause();
}

// ─────────────────────────────────────────────
//  RIPPLE EFFECT
// ─────────────────────────────────────────────
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const size = Math.max(rect.width, rect.height);

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `
    width:${size}px; height:${size}px;
    left:${x - size / 2}px; top:${y - size / 2}px;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// ─────────────────────────────────────────────
//  SLIDE 3: ENVELOPE
// ─────────────────────────────────────────────
let slide3Entered = false;

function animateSlide3Entrance() {
  if (slide3Entered) return;
  slide3Entered = true;
  const scene = document.querySelector('.envelope-scene');
  if (!scene) return;
  scene.style.opacity = '0';
  scene.style.transform = 'scale(0.9) translateY(20px)';
  scene.style.transition = 'opacity 800ms ease, transform 800ms cubic-bezier(0.34,1.56,0.64,1)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scene.style.opacity = '1';
      scene.style.transform = '';
    });
  });
}

function initEnvelope() {
  const scene = document.querySelector('.envelope-scene');
  if (!scene) return;

  let isOpen = false;
  let overflowTimer = null;

  function playPaperSound() {
    const snd = document.getElementById('open-sound');
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }
  }

  function openEnvelope() {
    if (isOpen) return;
    isOpen = true;
    scene.classList.add('is-open');
    playPaperSound();
    scene.setAttribute('aria-label', 'Amplop terbuka — gulir untuk membaca surat');
  }

  function closeEnvelope() {
    if (!isOpen) return;
    isOpen = false;
    scene.classList.remove('is-open');
    playPaperSound();
    scene.setAttribute('aria-label', 'Klik untuk membuka amplop');
  }

  // Scroll sound with throttling
  const letterCard = document.querySelector('.letter-card');
  let isScrolling = false;
  if (letterCard) {
    letterCard.addEventListener('scroll', () => {
      if (!isScrolling) {
        playPaperSound();
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 350); // Throttle 350ms
      }
    }, { passive: true });
  }

  scene.addEventListener('click', (e) => {
    addRipple(scene, e);
    if (!isOpen) {
      openEnvelope();
    } else {
      closeEnvelope();
    }
  });

  scene.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) openEnvelope();
      else closeEnvelope();
    }
  });
}

// ─────────────────────────────────────────────
//  BUTTON EVENTS
// ─────────────────────────────────────────────
let clickAudioBuffer = null;
const clickCtx = new (window.AudioContext || window.webkitAudioContext)();

// Preload audio manually for zero-latency playback
fetch('photos-click-409642.mp3')
  .then(res => res.arrayBuffer())
  .then(data => clickCtx.decodeAudioData(data))
  .then(buffer => {
    clickAudioBuffer = buffer;
  })
  .catch(err => console.log('Error loading click sound', err));

function playClickSound() {
  if (clickAudioBuffer) {
    if (clickCtx.state === 'suspended') clickCtx.resume();
    const source = clickCtx.createBufferSource();
    source.buffer = clickAudioBuffer;
    source.connect(clickCtx.destination);
    // Lewati 0.04 detik pertama untuk memotong 'silence' bawaan dari encoding MP3 lebih agresif
    source.start(0, 0.04);
  }
}

function initButtons() {
  function bindBtn(id, targetSlide) {
    const btn = document.getElementById(id);
    if (btn) {
      // Visual dan suara dipicu langsung saat disentuh/ditekan (bukan saat dilepas)
      btn.addEventListener('pointerdown', (e) => {
        addRipple(btn, e);
        playClickSound();
      });
      
      // Navigasi halaman tetap menunggu sampai jari/mouse diangkat (click)
      btn.addEventListener('click', (e) => {
        setTimeout(() => Slider.goTo(targetSlide), 100); // jeda dikurangi agar lebih gesit
      });
    }
  }

  bindBtn('btn-hello', 1);
  bindBtn('btn-next', 2);
  bindBtn('btn-prev-1', 0);
  bindBtn('btn-prev-2', 1);
}

// ─────────────────────────────────────────────
//  PREVENT SCROLL / ZOOM
// ─────────────────────────────────────────────
function lockPage() {
  document.body.classList.add('no-scroll');
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lockPage();
  buildStarfield();
  initButtons();
  initEnvelope();
  updateDots(0);

  // Initial slide entrance
  const slide1Content = document.getElementById('btn-hello');
  if (slide1Content) {
    slide1Content.style.opacity = '0';
    slide1Content.style.transform = 'scale(0.92) translateY(12px)';
    slide1Content.style.transition = 'opacity 1000ms 400ms ease, transform 1000ms 400ms cubic-bezier(0.34,1.56,0.64,1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slide1Content.style.opacity = '1';
        slide1Content.style.transform = '';
      });
    });
  }

  // Rebuild starfield on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const sf = document.getElementById('starfield');
      if (sf) {
        sf.innerHTML = '';
        buildStarfield();
      }
    }, 400);
  });

  // ─────────────────────────────────────────────
  //  WEB BOT WIDGET LOGIC
  // ─────────────────────────────────────────────
  const botWidget = document.getElementById('web-bot-widget');
  const botAvatar = document.getElementById('bot-avatar');
  const botMessage = document.getElementById('bot-message');

  const botMessages = [
    "Hai, Jee! Klik aku! ✨",
    "Hari ini hari spesial lho! 🎂",
    "Semoga harimu menyenangkan! 💫",
    "Pencet tombol next ya! 👉",
    "Jangan lupa senyum hari ini! 😊",
    "Suka sama desain webnya? 💖"
  ];
  let msgIndex = 0;

  if (botWidget && botAvatar && botMessage) {
    // Show chat bubble automatically for 4 seconds on load
    setTimeout(() => {
      botWidget.classList.add('active');
      setTimeout(() => {
        botWidget.classList.remove('active');
      }, 4000);
    }, 1500);

    botAvatar.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // Prevent double triggering on mobile
      
      // Play UI click sound
      playClickSound();

      // Cycle message
      msgIndex = (msgIndex + 1) % botMessages.length;
      botMessage.textContent = botMessages[msgIndex];

      // Show bubble and then hide it again after a few seconds
      botWidget.classList.add('active');
      
      // Clear previous timeout if any
      if (botWidget.hideTimeout) clearTimeout(botWidget.hideTimeout);
      
      botWidget.hideTimeout = setTimeout(() => {
        botWidget.classList.remove('active');
      }, 4000);
    });
  }
});
