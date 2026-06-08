/* ==========================================================================
   PORTFOLIO INTERACTIVE CORE ENGINE (app.js)
   ========================================================================== */

/* ==========================================================================
   0. HERO SCROLL-SCRUBBED FRAME ANIMATION
   ========================================================================== */
(function () {
  const FRAME_COUNT = 168;
  const FRAME_DIR = 'scrolling animation/';
  const BG_COLOR = '#fffc67';
  // Pad frame index: 000 → 167
  function framePath(i) {
    const idx = String(i).padStart(3, '0');
    // Filenames use 0.041s delay; pick the right one
    return `${FRAME_DIR}frame_${idx}_delay-0.041s.webp`;
  }

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Pre-load all frames with smart onload drawing
  const frames = [];
  let loadedCount = 0;
  let currentFrame = 0;
  let rafPending = false;

  // Size canvas buffer to match the true visible viewport (no scrollbar offset)
  function resizeCanvas() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrame);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    let isLoaded = false;

    img.onload = () => {
      if (isLoaded) return;
      isLoaded = true;
      loadedCount++;
      console.log(`Loaded frame ${i}: ${img.src}`);
      // If we loaded the frame currently in view, draw it immediately!
      if (i === currentFrame) {
        drawFrame(i);
      } else if (loadedCount === 1 && currentFrame === 0) {
        // As soon as *any* single frame loads first, render it as fallback so page isn't empty
        drawFrame(0);
      }
    };

    img.onerror = (err) => {
      console.error(`Failed to load frame ${i} from path: ${framePath(i)}`, err);
    };

    img.src = framePath(i);

    // If the image is cached, complete is true and naturalWidth is set
    if (img.complete && img.naturalWidth) {
      img.onload();
    }

    frames.push(img);
  }

  function drawFrame(index) {
    let img = frames[index];

    // Fallback: if requested frame isn't loaded, locate the nearest loaded frame!
    if (!img || !img.complete || !img.naturalWidth) {
      let fallbackIndex = -1;

      // Search backwards first (most likely to represent accurate past state)
      for (let j = index - 1; j >= 0; j--) {
        if (frames[j] && frames[j].complete && frames[j].naturalWidth) {
          fallbackIndex = j;
          break;
        }
      }

      // Search forwards if no loaded frame found backwards
      if (fallbackIndex === -1) {
        for (let j = index + 1; j < FRAME_COUNT; j++) {
          if (frames[j] && frames[j].complete && frames[j].naturalWidth) {
            fallbackIndex = j;
            break;
          }
        }
      }

      if (fallbackIndex !== -1) {
        img = frames[fallbackIndex];
      } else {
        return; // No frames loaded yet
      }
    }

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Source-crop cover: crop the image to match the canvas aspect ratio,
    // then stretch it to fill the canvas exactly — no letterboxing ever.
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, cw, ch);

    // "Contain" fit: scale the WHOLE frame down to fit inside the canvas without
    // cropping, then center it. The full animation stays visible on every device
    // (landscape, portrait, tablet, etc.) regardless of screen aspect ratio.
    const scale = Math.min(cw / iw, ch / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const dx = (cw - drawW) / 2;
    const dy = (ch - drawH) / 2;

    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, drawW, drawH);
  }

  // Map scroll → frame index
  const section = document.getElementById('hero');
  const scrollHints = document.querySelectorAll('.scroll-hint');
  let hintHidden = false;

  function onScroll() {
    if (!section) return;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionHeight = section.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, window.scrollY - sectionTop);
    const progress = sectionHeight > 0 ? Math.min(1, scrolled / sectionHeight) : 0;

    const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));

    if (frameIndex !== currentFrame) {
      currentFrame = frameIndex;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          drawFrame(currentFrame);
          rafPending = false;
        });
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ==========================================================================
   1. SMOOTH MARQUEE TICKER — clone-based, zero-gap infinite loop
   Supports multiple tracks; data-direction="right" reverses scroll direction.
   ========================================================================== */
(function () {
  function initMarquee() {
    const tracks = document.querySelectorAll('.marquee-ticker__track');
    if (!tracks.length) return;

    tracks.forEach(track => {
      const goRight = track.dataset.direction === 'right';
      let x = 0;
      const speed = 0.8;
      let loopWidth = 0;

      function buildTrack() {
        // 1. Remove previously-cloned aria-hidden items, keep originals
        track.querySelectorAll('[aria-hidden]').forEach(el => el.remove());

        // 2. Measure original set width before cloning
        const origItems = Array.from(track.children);
        loopWidth = track.scrollWidth;

        // 3. Clone until track covers 3× viewport — no gap on any screen
        while (track.scrollWidth < window.innerWidth * 3) {
          origItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
          });
        }

        // 4. For right-to-left direction, start at negative loopWidth so items
        //    enter from the right edge immediately (same visual as left ticker)
        if (goRight) x = -loopWidth;
      }

      function tick() {
        if (goRight) {
          x += speed;
          if (x >= 0) x = -loopWidth; // wrap back when fully scrolled right
        } else {
          x -= speed;
          if (-x >= loopWidth) x = 0; // wrap back when fully scrolled left
        }
        track.style.transform = `translate3d(${x}px, 0, 0)`;
        requestAnimationFrame(tick);
      }

      // Double-rAF: fonts must be rendered before measuring scrollWidth
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          buildTrack();
          requestAnimationFrame(tick);
        });
      });

      window.addEventListener('resize', () => {
        buildTrack();
        // Clamp x to new loopWidth bounds
        if (!goRight && -x >= loopWidth) x = 0;
        if (goRight && x >= 0) x = -loopWidth;
      }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarquee);
  } else {
    initMarquee();
  }
})();


document.addEventListener('DOMContentLoaded', () => {


  // ==========================================================================
  // 2. TOGGLE LOGO CURSOR EFFECT
  // ==========================================================================
  const cursorLogo = document.createElement('div');
  cursorLogo.className = 'cursor-logo';
  cursorLogo.innerHTML = `
    <svg class="cursor-logo-svg" viewBox="0 0 72 82" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5 62.9824C10.5 66.7862 9.5 76.0834 7.5 82H0C5 60.0241 15 15.3117 15 12.2689C15 9.22612 13.5 9.73325 6 16.0722L0 11.0009C9 2.12607 24 -4.2129 42 3.39391C57.0002 9.73299 69 2.12598 72 0.858138C70.5 3.39381 60.1367 11.3849 52.5 13.5365C43.5 16.0722 46.5 24.9471 48 33.8219C49.5 42.6968 51.4917 52.1403 43.5 56.6432C34.5 61.7144 26.341 60.0912 19.5 62.9824Z" fill="currentColor" />
    </svg>
  `;
  document.body.appendChild(cursorLogo);

  let isLogoCursorActive = false;
  const titleDividerLogo = document.querySelector('.title-divider');

  if (titleDividerLogo) {
    titleDividerLogo.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 1024) return;
      isLogoCursorActive = !isLogoCursorActive;
      if (isLogoCursorActive) {
        document.body.classList.add('use-logo-cursor');
      } else {
        document.body.classList.remove('use-logo-cursor');
      }
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 1024) {
      if (isLogoCursorActive) {
        isLogoCursorActive = false;
        document.body.classList.remove('use-logo-cursor');
      }
      return;
    }
    if (isLogoCursorActive) {
      cursorLogo.style.setProperty('--x', `${e.clientX}px`);
      cursorLogo.style.setProperty('--y', `${e.clientY}px`);
    }
  });

  document.addEventListener('mouseleave', () => {
    if (window.innerWidth > 1024) {
      document.body.classList.add('cursor-out');
    }
  });

  document.addEventListener('mouseenter', () => {
    if (window.innerWidth > 1024) {
      document.body.classList.remove('cursor-out');
    }
  });









  // ==========================================================================
  // 5. TYPIST SUBHEADING ANIMATION
  // ==========================================================================
  const typistText = document.getElementById('typist-text');
  const subheadings = ["a Visual Creator", "a Graphic Designer", "a UI/UX Designer"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!typistText) return;
    const currentWord = subheadings[wordIndex];

    if (isDeleting) {
      typistText.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typistText.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = 2000; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % subheadings.length;
      delay = 500; // Brief pause before typing next word
    }

    setTimeout(typeEffect, delay);
  }
  typeEffect();


  // ==========================================================================
  // 6. PROJECT MODALS
  // ==========================================================================
  // Modal Open & Close Triggers
  const detailsBtns = document.querySelectorAll('.project-view-details');
  const modals = document.querySelectorAll('.project-modal');

  detailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock background scroll
      }
    });
  });

  const closeModal = (modal) => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  modals.forEach(modal => {
    const closes = modal.querySelectorAll('.modal-close, .modal-close-btn');
    closes.forEach(c => {
      c.addEventListener('click', () => closeModal(modal));
    });

    // Close modal on click background
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });


  // ==========================================================================
  // 7. SCROLL REVEAL — staggered IntersectionObserver
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-right, .about-content');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        if (el.revealTimeout) clearTimeout(el.revealTimeout);
        el.revealTimeout = setTimeout(() => {
          el.classList.add('is-visible');
        }, delay);
      } else {
        if (el.revealTimeout) clearTimeout(el.revealTimeout);
        el.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.12,       // trigger when 12% visible
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ==========================================================================
  // 8. HERO VISUAL PARALLAX — smooth depth as user scrolls
  // ==========================================================================
  const heroVisual = document.getElementById('hero-visual');

  function updateParallax() {
    if (!heroVisual) return;
    // Only apply after reveal has fired to avoid fighting the slide-in
    if (!heroVisual.classList.contains('is-visible')) return;

    const scrollY = window.scrollY;
    // Move card upward at 25% of scroll speed for gentle parallax
    const offset = -(scrollY * 0.25);
    heroVisual.style.setProperty('--parallax-y', `${offset}px`);
  }

  window.addEventListener('scroll', updateParallax, { passive: true });


  // ==========================================================================
  // 9. SKILLS RADIAL PROGRESS ANIMATION — dynamic dashoffset draw on scroll
  // ==========================================================================
  const progressCircles = document.querySelectorAll('.skill-radial-progress');

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const circle = entry.target;
      const rAttr = circle.getAttribute('r') || '45';
      const radius = parseFloat(rAttr);
      const circumference = 2 * Math.PI * radius;

      if (entry.isIntersecting) {
        const percent = parseInt(circle.getAttribute('data-percent') || '0', 10);
        // Calculate offset based on target percent
        const offset = circumference - (circumference * percent) / 100;

        // Set properties to trigger CSS transition
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
      } else {
        // Reset properties to initial empty state when scrolled out
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -20px 0px'
  });

  progressCircles.forEach(circle => {
    const rAttr = circle.getAttribute('r') || '45';
    const radius = parseFloat(rAttr);
    const circumference = 2 * Math.PI * radius;

    // Set initial state to fully empty
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    // Start observing
    skillObserver.observe(circle);
  });


  // ==========================================================================
  // 10. COPY EMAIL TO CLIPBOARD WITH PREMIUM TOAST
  // ==========================================================================
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'tomaschen1994@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('📬 Email copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  }

  function showToast(message) {
    let toast = document.getElementById('custom-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'custom-toast';
      toast.className = 'glass-panel custom-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;

    // Force browser reflow to reset transition triggers
    toast.offsetHeight;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

});

