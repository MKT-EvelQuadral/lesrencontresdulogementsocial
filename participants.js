// ══════════════════════════════════════════════════════════════
//  PARTICIPANTS — Carrousel logos défilants
//  Chargé sur l'index et toutes les pages villes.
//  Injecté juste après la section .hero, fond blanc.
//
//  Pour ajouter un participant : compléter le tableau
//  PARTICIPANTS ci-dessous. Logo PNG attendu dans /participants/.
// ══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const PARTICIPANTS = [
    { name: '1001 Vies Habitat',        logo: '/participants/1001vies.png' },
    { name: '3F Normanvie',             logo: '/participants/3fnormanvie.png' },
    { name: '3F Sud',                   logo: '/participants/3fsud.png' },
    { name: 'Alcéane',                  logo: '/participants/alceane.png' },
    { name: 'Alteal',                   logo: '/participants/alteal.png' },
    { name: 'Antin Résidences',         logo: '/participants/antin.png' },
    { name: 'Batigère',                 logo: '/participants/batigere.png' },
    { name: 'Cosivia',                  logo: '/participants/Cosivia.png' },
    { name: 'Domial',                   logo: '/participants/domial.png' },
    { name: 'Domofrance',               logo: '/participants/domofrance.png' },
    { name: 'Famille & Provence',       logo: '/participants/familleprovence.png' },
    { name: 'Grand Lyon Habitat',       logo: '/participants/grandlyon.png' },
    { name: 'Habitat 77',               logo: '/participants/habitat77.png' },
    { name: 'Habitat Lille',            logo: '/participants/habitatlill.png' },
    { name: 'Halpades',                 logo: '/participants/halpades.png' },
    { name: 'Immobilière Rhône-Alpes',  logo: '/participants/immobiliererhonealpes.png' },
    { name: 'Logissia',                 logo: '/participants/logissia.png' },
    { name: 'Néolia',                   logo: '/participants/neolia.png' },
    { name: 'ONV',                      logo: '/participants/onv.png' },
    { name: 'Patrimoine SA',            logo: '/participants/patrimoinesa.png' },
    { name: 'Rives de Seine',           logo: '/participants/rivesdeseine.png' },
    { name: 'SDH',                      logo: '/participants/sdh.png' },
    { name: 'SD Access',                logo: '/participants/sdaccess.png' },
    { name: 'Sedes',                    logo: '/participants/sedes.png' },
    { name: 'Seqens',                   logo: '/participants/Seqens.png' },
    { name: 'Soikos',                   logo: '/participants/soikos.png' },
    { name: 'TMH',                      logo: '/participants/tmh.png' },
    { name: 'Vichy',                    logo: '/participants/vichy.png' },
    { name: 'Vilogia',                  logo: '/participants/vilogia.png' },
  ];

  // ─── BOOTSTRAP ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (document.getElementById('participants')) return; // évite double-injection
    injectStyles();
    const section = buildSection();
    hero.parentNode.insertBefore(section, hero.nextSibling);
  }

  // ─── HTML ────────────────────────────────────────────────
  function buildSection() {
    const section = document.createElement('section');
    section.className = 'participants-section';
    section.id = 'participants';

    // Mélange aléatoire pour varier l'ordre d'affichage
    const shuffled = shuffle(PARTICIPANTS);

    // On duplique la liste pour créer un défilement infini sans saut.
    // Pas de loading="lazy" ici : tous les logos doivent être chargés au
    // démarrage pour stabiliser la largeur de la piste (sinon ça saute).
    const items = shuffled.concat(shuffled).map(p => `
      <li class="participants-item">
        <img class="participants-logo"
             src="${escAttr(p.logo)}"
             alt="${escAttr(p.name)}"
             decoding="async"
             onerror="this.style.display='none'" />
      </li>
    `).join('');

    section.innerHTML = `
      <div class="participants-inner">
        <div class="participants-header">
          <h2 class="participants-title">Ils ont participé</h2>
        </div>
        <div class="participants-marquee" aria-label="Logos des participants">
          <ul class="participants-track">${items}</ul>
        </div>
      </div>
    `;
    return section;
  }

  // ─── CSS ─────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('rls-participants-styles')) return;
    const style = document.createElement('style');
    style.id = 'rls-participants-styles';
    style.textContent = `
      .participants-section {
        background: #ffffff;
        padding: 4rem 0 3.5rem;
        position: relative;
        overflow: hidden;
      }
      .participants-inner {
        max-width: 1200px;
        margin: 0 auto;
      }
      .participants-header {
        text-align: center;
        margin-bottom: 2.5rem;
        padding: 0 1.5rem;
      }
      .participants-title {
        font-family: 'Space Mono', monospace;
        font-size: 0.85rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #284181;
        font-weight: 400;
        line-height: 1.3;
        margin: 0;
      }

      /* Bandeau défilant — masque les bords en fondu */
      .participants-marquee {
        position: relative;
        width: 100%;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
                mask-image: linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
      }
      .participants-track {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        gap: 3.5rem;
        width: max-content;
        animation: participants-scroll 18s linear infinite;
      }
      /* Largeur fixe par item → la piste a la MÊME largeur avant et
         après chargement des images, ce qui élimine les "sauts". */
      .participants-item {
        flex: 0 0 180px;
        width: 180px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .participants-logo {
        max-height: 60px;
        max-width: 160px;
        width: auto;
        height: auto;
        object-fit: contain;
        transition: transform 0.3s ease;
      }
      /* Hover effects UNIQUEMENT sur appareils avec vrai pointeur (souris).
         Sur tactile, le hover devient "sticky" au tap et bloque le carrousel. */
      @media (hover: hover) and (pointer: fine) {
        .participants-marquee:hover .participants-track,
        .participants-marquee:focus-within .participants-track {
          animation-play-state: paused;
        }
        .participants-logo:hover {
          transform: scale(1.15);
        }
      }

      @keyframes participants-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      /* Mobile */
      @media (max-width: 768px) {
        .participants-section { padding: 3rem 0 2.5rem; }
        .participants-header { margin-bottom: 2rem; }
        .participants-track { gap: 2.5rem; animation-duration: 15s; }
        .participants-item { flex: 0 0 140px; width: 140px; height: 56px; }
        .participants-logo { max-height: 48px; max-width: 130px; }
        /* Aucune interaction tactile : le carrousel défile en continu */
        .participants-marquee,
        .participants-track,
        .participants-item,
        .participants-logo {
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .participants-track {
          animation: none;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          gap: 2rem 3rem;
        }
        .participants-marquee {
          -webkit-mask-image: none;
                  mask-image: none;
        }
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
  function escAttr(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
})();
