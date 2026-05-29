/* ============================================================
   presenta/scripts.js
   Slide navigation + per-slide staged reveal sequencer.
   ============================================================ */

(() => {
  const deck = document.querySelector('.deck');
  const slides = Array.from(document.querySelectorAll('.slide'));

  function fitDeck() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--scale', s);
  }
  fitDeck();
  window.addEventListener('resize', fitDeck);
  const progressFill = document.querySelector('.progress-fill');
  const counterCurrent = document.querySelector('.counter .current');
  const counterTotal = document.querySelector('.counter .total');
  const btnPrev = document.querySelector('.nav-btn.prev');
  const btnNext = document.querySelector('.nav-btn.next');
  const stageHint = document.querySelector('.stage-hint');
  const stagePips = document.querySelector('.stage-pips');

  let currentSlide = 0;

  // ----- stage discovery -----
  // A slide's stages are unique data-stage integers on descendants of the slide.
  // Stage 0 is always implicitly revealed when the slide activates.
  function discoverStages(slideEl) {
    const set = new Set();
    slideEl.querySelectorAll('[data-stage]').forEach(el => {
      const n = parseInt(el.dataset.stage, 10);
      if (!Number.isNaN(n)) set.add(n);
    });
    const stages = Array.from(set).sort((a, b) => a - b);
    return stages;
  }

  function applyStage(slideEl, currentStage) {
    slideEl.querySelectorAll('[data-stage]').forEach(el => {
      const n = parseInt(el.dataset.stage, 10);
      const max = el.dataset.stageMax !== undefined
        ? parseInt(el.dataset.stageMax, 10)
        : Infinity;
      if (n <= currentStage && currentStage <= max) {
        el.classList.add('is-revealed');
      } else {
        el.classList.remove('is-revealed');
      }
    });
    slideEl.dataset.currentStage = currentStage;
  }

  function updatePips(slideEl) {
    const stages = discoverStages(slideEl);
    const current = parseInt(slideEl.dataset.currentStage || '0', 10);
    if (!stagePips) return;
    stagePips.innerHTML = '';
    if (stages.length === 0) {
      if (stageHint) stageHint.classList.add('is-dim');
      return;
    }
    if (stageHint) stageHint.classList.remove('is-dim');
    // include stage 0 (the always-revealed baseline) as the first pip,
    // unless stage 0 is already an explicit declared stage on this slide
    const allStages = stages[0] === 0 ? stages : [0, ...stages];
    allStages.forEach(s => {
      const pip = document.createElement('span');
      pip.className = 'pip';
      if (s < current) pip.classList.add('is-done');
      if (s === current) pip.classList.add('is-current');
      stagePips.appendChild(pip);
    });
  }

  function activateSlide(idx) {
    if (idx < 0) idx = 0;
    if (idx >= slides.length) idx = slides.length - 1;

    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === idx);
      s.classList.toggle('is-prev', i < idx);
      if (i !== idx) {
        // reset stages so re-visiting replays animations
        applyStage(s, 0);
      }
    });

    const slideEl = slides[idx];
    applyStage(slideEl, 0);
    updatePips(slideEl);

    // progress + counter
    const pct = ((idx + 1) / slides.length) * 100;
    progressFill.style.width = pct + '%';
    counterCurrent.textContent = String(idx + 1).padStart(2, '0');

    currentSlide = idx;
  }

  function advanceStage() {
    const slideEl = slides[currentSlide];
    const stages = discoverStages(slideEl);
    const current = parseInt(slideEl.dataset.currentStage || '0', 10);
    const next = stages.find(s => s > current);
    if (next !== undefined) {
      applyStage(slideEl, next);
      updatePips(slideEl);
      return true;
    }
    return false;
  }

  function gotoNext() {
    if (!advanceStage()) {
      activateSlide(currentSlide + 1);
    }
  }

  function gotoPrev() {
    const slideEl = slides[currentSlide];
    const stages = discoverStages(slideEl);
    const current = parseInt(slideEl.dataset.currentStage || '0', 10);
    const prev = [...stages].reverse().find(s => s < current);
    if (prev !== undefined) {
      applyStage(slideEl, prev);
      updatePips(slideEl);
    } else if (current > 0) {
      applyStage(slideEl, 0);
      updatePips(slideEl);
    } else {
      activateSlide(currentSlide - 1);
    }
  }

  function jumpSlide(delta) {
    activateSlide(currentSlide + delta);
  }

  // ----- keyboard -----
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        gotoNext();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        gotoPrev();
        break;
      case 'ArrowDown':
        e.preventDefault();
        jumpSlide(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        jumpSlide(-1);
        break;
      case 'Home':
        e.preventDefault();
        activateSlide(0);
        break;
      case 'End':
        e.preventDefault();
        activateSlide(slides.length - 1);
        break;
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          toggleFullscreen();
        }
        break;
    }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      (deck.requestFullscreen || deck.webkitRequestFullscreen)?.call(deck);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    }
  }

  // ----- mouse buttons -----
  btnPrev.addEventListener('click', gotoPrev);
  btnNext.addEventListener('click', gotoNext);

  // ----- click the progress bar to jump to a slide -----
  const progress = document.querySelector('.progress');
  if (progress) {
    progress.addEventListener('click', (e) => {
      const rect = progress.getBoundingClientRect();
      if (rect.width === 0) return;
      const f = (e.clientX - rect.left) / rect.width;
      const idx = Math.max(0, Math.min(slides.length - 1, Math.round(f * (slides.length - 1))));
      activateSlide(idx);
    });
  }

  // ----- init -----
  counterTotal.textContent = '/ ' + String(slides.length).padStart(2, '0');
  activateSlide(0);

  // hash routing: #slide-5
  function applyHash() {
    const m = (location.hash || '').match(/^#slide-(\d+)/);
    if (m) {
      const idx = parseInt(m[1], 10) - 1;
      if (!Number.isNaN(idx)) activateSlide(idx);
    }
  }
  window.addEventListener('hashchange', applyHash);
  applyHash();

  // expose tiny dev helper
  window.__deck = { go: activateSlide, advance: gotoNext, back: gotoPrev };
})();
