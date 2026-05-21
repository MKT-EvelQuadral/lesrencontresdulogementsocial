// ══════════════════════════════════════════════════════════════
//  TESTIMONIALS — Carousel témoignages
//  Chargé sur l'index et toutes les pages villes.
//  - Sur l'index : injecté avant la section "Prêt à nous rejoindre"
//    (fond warm #fafaf8)
//  - Sur les pages villes : injecté après la section ateliers
//    (fond blanc)
//
//  Pour ajouter un nouveau témoignage : compléter le tableau
//  TESTIMONIALS ci-dessous. Logo attendu dans /testimonials/.
// ══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const TESTIMONIALS = [
    {
      company: 'Seqens',
      logo:    '/testimonials/Seqens.png',
      quote:   'Merci à vous, c\'était avec plaisir. Très intéressants ces partages d\'informations et d\'expériences.',
    },
    {
      company: 'Cosivia',
      logo:    '/testimonials/Cosivia.png',
      quote:   'Merci beaucoup pour l\'organisation de cette matinée. J\'ai apprécié les différents échanges et la qualité des interventions. Je reste attentif à la réception des présentations et suis bien entendu disponible pour un prochain rendez-vous.',
    },
    {
      company: 'Antin Résidences',
      logo:    '/testimonials/antin.svg',
      quote:   'Je tiens à vous remercier pour l\'invitation et la matinée passée. Ce fut un plaisir d\'échanger sur les différents sujets abordés. J\'espère sincèrement que cette initiative sera renouvelée prochainement. Merci encore pour votre accueil.',
    },
  ];

  const AUTO_ROTATE_MS = 4000;
  const TRANSITION_MS  = 500;

  // ─── BOOTSTRAP ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const target = findTarget();
    if (!target) return;
    injectStyles();
    const section = buildSection(target.theme);
    target.mount(section);
    setupCarousel(section);
  }

  // ─── DETECTION : où injecter et quel thème ───────────────
  function findTarget() {
    const ateliers = document.querySelector('.ateliers-section');
    if (ateliers) {
      return {
        theme: 'white',
        mount: (section) => ateliers.parentNode.insertBefore(section, ateliers.nextSibling),
      };
    }
    const cta = document.querySelector('.cta-section');
    if (cta) {
      return {
        theme: 'warm',
        mount: (section) => cta.parentNode.insertBefore(section, cta),
      };
    }
    return null;
  }

  // ─── HTML ────────────────────────────────────────────────
  function buildSection(theme) {
    const section = document.createElement('section');
    section.className = 'testimonials-section testimonials-section--' + theme;
    section.id = 'testimonials';

    const shuffled = shuffle(TESTIMONIALS);

    const cards = shuffled.map((t, i) => `
      <article class="testimonial-card" data-idx="${i}">
        <div class="testimonial-logo-wrap">
          <img class="testimonial-logo" src="${escAttr(t.logo)}" alt="${escAttr(t.company)}"
               onerror="this.dataset.failed=1;this.style.display='none';this.nextElementSibling.style.display='block'" />
          <span class="testimonial-logo-fallback">${escHTML(t.company)}</span>
        </div>
        <blockquote class="testimonial-quote">
          <span class="testimonial-quote-mark" aria-hidden="true">“</span>
          ${escHTML(t.quote)}
        </blockquote>
        <p class="testimonial-author">${escHTML(t.company)}</p>
      </article>
    `).join('');

    section.innerHTML = `
      <div class="testimonials-inner">
        <div class="testimonials-header">
          <p class="testimonials-eyebrow">Témoignages</p>
          <h2 class="testimonials-title">Ce qu'en disent les participants</h2>
        </div>
        <div class="testimonials-carousel" tabindex="0" role="region" aria-label="Témoignages des participants">
          <button class="testimonials-arrow testimonials-arrow--prev" type="button" aria-label="Témoignage précédent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div class="testimonials-stage">${cards}</div>
          <button class="testimonials-arrow testimonials-arrow--next" type="button" aria-label="Témoignage suivant">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div class="testimonials-dots" role="tablist" aria-label="Sélection du témoignage">
          ${shuffled.map((_, i) => `
            <button type="button" class="testimonials-dot" data-idx="${i}" role="tab" aria-label="Témoignage ${i + 1}"></button>
          `).join('')}
        </div>
      </div>
    `;
    return section;
  }

  // ─── LOGIQUE CAROUSEL ────────────────────────────────────
  function setupCarousel(section) {
    const cards = Array.from(section.querySelectorAll('.testimonial-card'));
    const dots  = Array.from(section.querySelectorAll('.testimonials-dot'));
    const prev  = section.querySelector('.testimonials-arrow--prev');
    const next  = section.querySelector('.testimonials-arrow--next');
    const stage = section.querySelector('.testimonials-stage');
    const carousel = section.querySelector('.testimonials-carousel');
    const total = cards.length;
    if (total === 0) return;

    let current = 0;
    let timer = null;
    let paused = false;

    function applyPositions() {
      cards.forEach((card, i) => {
        const rel = ((i - current) % total + total) % total;
        card.classList.remove('is-prev', 'is-current', 'is-next', 'is-hidden');
        if (rel === 0) {
          card.classList.add('is-current');
          card.setAttribute('aria-hidden', 'false');
        } else if (rel === total - 1) {
          card.classList.add('is-prev');
          card.setAttribute('aria-hidden', 'true');
        } else if (rel === 1) {
          card.classList.add('is-next');
          card.setAttribute('aria-hidden', 'true');
        } else {
          card.classList.add('is-hidden');
          card.setAttribute('aria-hidden', 'true');
        }
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      applyPositions();
      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({ event: 'testimonial_view', label: cards[current].querySelector('.testimonial-author')?.textContent });
      }
    }

    function goNext() { goTo(current + 1); }
    function goPrev() { goTo(current - 1); }

    function startAuto() {
      stopAuto();
      if (paused || total < 2) return;
      timer = setInterval(goNext, AUTO_ROTATE_MS);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

    // Random start
    current = Math.floor(Math.random() * total);
    applyPositions();

    // Click handlers
    prev.addEventListener('click', () => { goPrev(); restart(); });
    next.addEventListener('click', () => { goNext(); restart(); });
    dots.forEach(d => d.addEventListener('click', () => {
      goTo(parseInt(d.dataset.idx, 10));
      restart();
    }));
    function restart() { stopAuto(); startAuto(); }

    // Pause au survol
    carousel.addEventListener('mouseenter', () => { paused = true; stopAuto(); });
    carousel.addEventListener('mouseleave', () => { paused = false; startAuto(); });
    carousel.addEventListener('focusin',    () => { paused = true; stopAuto(); });
    carousel.addEventListener('focusout',   () => { paused = false; startAuto(); });

    // Clavier
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goPrev(); restart(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { goNext(); restart(); e.preventDefault(); }
    });

    // Swipe tactile
    let touchX = null;
    stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) goNext(); else goPrev();
      restart();
    });

    // Démarre uniquement quand visible (perf)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) startAuto(); else stopAuto();
      });
    }, { threshold: 0.2 });
    io.observe(section);
  }

  // ─── CSS ─────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('rls-testimonials-styles')) return;
    const style = document.createElement('style');
    style.id = 'rls-testimonials-styles';
    style.textContent = `
      .testimonials-section {
        padding: 5rem 2rem;
        overflow: hidden;
        position: relative;
      }
      .testimonials-section--warm  { background: #fafaf8; }
      .testimonials-section--white { background: #ffffff; }
      .testimonials-inner { max-width: 1100px; margin: 0 auto; }

      .testimonials-header { text-align: center; margin-bottom: 3rem; }
      .testimonials-eyebrow {
        font-family: 'Space Mono', monospace;
        font-size: 0.65rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #284181;
        margin-bottom: 1rem;
      }
      .testimonials-title {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: clamp(1.5rem, 3vw, 2.2rem);
        color: #0E1D4D;
        line-height: 1.3;
      }

      .testimonials-carousel {
        position: relative;
        max-width: 980px;
        margin: 0 auto;
        outline: none;
      }
      .testimonials-stage {
        position: relative;
        height: 380px;
      }

      .testimonial-card {
        position: absolute;
        top: 0;
        left: 50%;
        width: 460px;
        max-width: 90vw;
        background: white;
        border-radius: 8px;
        padding: 2.25rem 2rem 2rem;
        box-shadow: 0 8px 32px rgba(14,29,77,0.08);
        border: 1px solid #eef1f5;
        transform: translateX(-50%);
        transition:
          transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
          opacity   ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
          filter    ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        height: 100%;
        box-sizing: border-box;
      }

      .testimonial-card.is-current {
        z-index: 3;
        transform: translateX(-50%) scale(1);
        opacity: 1;
        filter: none;
      }
      .testimonial-card.is-prev {
        z-index: 2;
        transform: translateX(calc(-50% - 320px)) scale(0.86);
        opacity: 0.45;
        filter: saturate(0.7);
      }
      .testimonial-card.is-next {
        z-index: 2;
        transform: translateX(calc(-50% + 320px)) scale(0.86);
        opacity: 0.45;
        filter: saturate(0.7);
      }
      .testimonial-card.is-hidden {
        z-index: 1;
        transform: translateX(-50%) scale(0.86);
        opacity: 0;
        pointer-events: none;
      }
      .testimonial-card.is-prev, .testimonial-card.is-next {
        pointer-events: none;
      }

      .testimonial-logo-wrap {
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.875rem;
      }
      .testimonial-logo {
        max-height: 56px;
        max-width: 180px;
        object-fit: contain;
        display: block;
      }
      .testimonial-logo-fallback {
        display: none;
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 1.4rem;
        color: #0E1D4D;
      }

      .testimonial-quote {
        font-family: 'DM Serif Display', Georgia, serif;
        font-style: italic;
        font-size: 1.05rem;
        line-height: 1.55;
        color: #1e293b;
        margin: 0 0 1.5rem;
        flex: 1;
        position: relative;
        padding: 0.625rem 0.5rem 0;
      }
      .testimonial-quote-mark {
        position: absolute;
        top: -1.5rem;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'DM Serif Display', Georgia, serif;
        font-style: normal;
        font-size: 3.5rem;
        color: #f8c1d9;
        line-height: 1;
      }

      .testimonial-author {
        font-family: 'Space Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #284181;
        font-weight: 700;
        margin-top: auto;
      }

      /* Arrows */
      .testimonials-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #0E1D4D;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(14,29,77,0.08);
        z-index: 5;
        padding: 0;
      }
      .testimonials-arrow:hover {
        background: #0E1D4D;
        color: white;
        border-color: #0E1D4D;
        transform: translateY(-50%) scale(1.05);
      }
      .testimonials-arrow svg { width: 18px; height: 18px; }
      .testimonials-arrow--prev { left: 0.5rem; }
      .testimonials-arrow--next { right: 0.5rem; }

      /* Dots */
      .testimonials-dots {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.75rem;
      }
      .testimonials-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #cbd5e1;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.25s ease;
      }
      .testimonials-dot:hover { background: #94a3b8; }
      .testimonials-dot.is-active {
        background: #0E1D4D;
        width: 28px;
        border-radius: 5px;
      }

      /* Mobile */
      @media (max-width: 768px) {
        .testimonials-section { padding: 4rem 1rem; }
        .testimonials-stage { height: 420px; }
        .testimonial-card { width: 100%; padding: 2rem 1.5rem 1.5rem; }
        .testimonial-card.is-prev,
        .testimonial-card.is-next {
          opacity: 0;
          pointer-events: none;
        }
        .testimonials-arrow--prev { left: -0.25rem; }
        .testimonials-arrow--next { right: -0.25rem; }
      }

      @media (max-width: 480px) {
        .testimonials-stage { height: 460px; }
        .testimonial-quote { font-size: 1rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .testimonial-card { transition: opacity 0.2s ease; }
      }
    `;
    document.head.appendChild(style);
  }

  // ─── UTILS ───────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function escHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
  function escAttr(s) { return escHTML(s); }
})();
