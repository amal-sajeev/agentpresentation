/* ============================================================
   summary/script.js
   Lightweight deck: fit-to-screen scaling, slide navigation,
   and re-triggered staged reveals on each slide activation.
   ============================================================ */
(() => {
  const deck = document.querySelector('.deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progressFill = document.querySelector('.progress-fill');
  const curEl = document.querySelector('.counter .cur');
  const totEl = document.querySelector('.counter .tot');
  const dotsWrap = document.querySelector('.dots');
  const btnPrev = document.querySelector('.nav-btn.prev');
  const btnNext = document.querySelector('.nav-btn.next');
  const progress = document.querySelector('.progress');
  const hint = document.querySelector('.hint');

  let current = 0;

  // ----- scale the fixed 1920x1080 stage to the viewport -----
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    deck.style.setProperty('--scale', s);
  }
  fit();
  window.addEventListener('resize', fit);

  // ----- build dots -----
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'd';
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);
  totEl.textContent = ' / ' + String(slides.length).padStart(2, '0');

  // ----- activate a slide (re-triggers its reveal animations) -----
  function go(idx) {
    idx = Math.max(0, Math.min(slides.length - 1, idx));
    if (idx === current) return;

    const next = slides[idx];
    // force a reflow so the reveal animations replay when the class is re-added
    next.classList.remove('is-active');
    void next.offsetWidth;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-on', i === idx));

    progressFill.style.width = (((idx + 1) / slides.length) * 100) + '%';
    curEl.textContent = String(idx + 1).padStart(2, '0');
    current = idx;
    location.replace('#slide-' + (idx + 1));
  }

  function nextSlide() { go(current + 1); }
  function prevSlide() { go(current - 1); }

  // ----- input -----
  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  // click anywhere on the deck advances (ignore nav chrome + links)
  deck.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    nextSlide();
  });

  progress.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = progress.getBoundingClientRect();
    if (!rect.width) return;
    const f = (e.clientX - rect.left) / rect.width;
    go(Math.round(f * (slides.length - 1)));
  });

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault(); nextSlide(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prevSlide(); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(slides.length - 1); break;
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (!document.fullscreenElement) deck.requestFullscreen?.();
          else document.exitFullscreen?.();
        }
        break;
    }
  });

  // fade the keyboard hint after a few seconds
  setTimeout(() => hint && hint.classList.add('hide'), 5000);

  // ----- init (support #slide-N deep link) -----
  dots[0].classList.add('is-on');
  progressFill.style.width = (100 / slides.length) + '%';
  const m = (location.hash || '').match(/^#slide-(\d+)/);
  if (m) {
    const idx = parseInt(m[1], 10) - 1;
    if (idx > 0 && idx < slides.length) {
      slides[0].classList.remove('is-active');
      slides[idx].classList.add('is-active');
      dots[0].classList.remove('is-on');
      dots[idx].classList.add('is-on');
      current = idx;
      curEl.textContent = String(idx + 1).padStart(2, '0');
      progressFill.style.width = (((idx + 1) / slides.length) * 100) + '%';
    }
  }
})();
