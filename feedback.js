// ══════════════════════════════════════════════════════════════
//  FEEDBACK — Questionnaire post-événement + téléchargement deck
//  Chargé sur toutes les pages villes. S'active uniquement quand
//  la date de l'événement est passée (cf. LIEUX_CONFIG.date_iso).
//
//  API publique :
//    window.RLS_initFeedback(villeKey, ville, dateLabel)
//      villeKey   : slug ('paris', 'le-havre', ...)
//      ville      : nom affiché ('Paris', 'Le Havre', ...)
//      dateLabel  : date affichée ('19 mai 2026', ...)
// ══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const STORAGE_PREFIX = 'rls-feedback-';

  const ATELIERS = [
    { value: 'arbitrage',         label: 'Arbitrage et stratégie de cession' },
    { value: 'tertiaire',         label: 'Pilotage du parc tertiaire' },
    { value: 'commercialisation', label: 'Commercialisation & financement' },
    { value: 'efficacite',        label: 'Efficacité opérationnelle' },
  ];

  // ─── PUBLIC ENTRY ─────────────────────────────────────────
  window.RLS_initFeedback = function (villeKey, ville, dateLabel) {
    const cfg = (typeof LIEUX_CONFIG !== 'undefined') ? LIEUX_CONFIG[villeKey] : null;
    if (!cfg || !cfg.date_iso) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(cfg.date_iso + 'T00:00:00') > today) return;

    injectStyles();
    insertBanner();
    transformInscriptionSection(villeKey, ville, dateLabel);
    hideRegistrationCTAs();
    maybeScrollToFeedback();

    if (typeof window.trackEvent === 'function') {
      window.trackEvent('event_past_view', villeKey);
    }
  };

  // ─── ANCRE #feedback (depuis email post-event) ───────────
  function maybeScrollToFeedback() {
    if (window.location.hash !== '#feedback') return;
    const section = document.getElementById('inscription');
    if (!section) return;
    // Décale du haut pour ne pas passer sous la navbar fixe + bandeau
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const offset = 110;
      window.scrollTo({
        top: window.scrollY + rect.top - offset,
        behavior: 'smooth',
      });
    });
  }

  // ─── BANNER + CTA HIDING ─────────────────────────────────
  function insertBanner() {
    if (document.querySelector('.event-past-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'event-past-banner';
    banner.textContent = 'Événement passé, merci de votre participation';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function hideRegistrationCTAs() {
    document.querySelectorAll('a[href="#inscription"]').forEach(a => {
      a.style.display = 'none';
    });
  }

  // ─── SECTION INSCRIPTION → SECTION FEEDBACK ──────────────
  function transformInscriptionSection(villeKey, ville, dateLabel) {
    const sectionTitle = document.querySelector('.form-header .section-title');
    const sectionSub   = document.querySelector('.form-header .section-sub');
    if (sectionTitle) sectionTitle.textContent = 'Vos retours sur l\'événement';
    if (sectionSub)   sectionSub.textContent   = 'Complétez ce court questionnaire (moins de 2 minutes) pour accéder à la présentation de l\'événement.';

    const formBox = document.querySelector('.form-box');
    if (!formBox) return;
    Array.from(formBox.children).forEach(c => { c.style.display = 'none'; });

    const wrap = document.createElement('div');
    wrap.className = 'feedback-wrap';
    wrap.id = 'feedback';
    formBox.appendChild(wrap);

    // Si feedback déjà soumis sur ce navigateur → afficher direct le bloc téléchargement
    const stored = readStorage(villeKey);
    if (stored && stored.submittedAt) {
      wrap.innerHTML = buildSuccessHTML(ville, dateLabel, stored.downloadUrl, stored.downloadFilename, true);
      return;
    }

    wrap.innerHTML = buildFormHTML(ville, dateLabel);
    attachFormHandlers(wrap, villeKey, ville, dateLabel);
  }

  // ─── FORM HTML ───────────────────────────────────────────
  function buildFormHTML(ville, dateLabel) {
    const escVille = escHTML(ville);
    return `
      <div class="feedback-intro">
        <div class="feedback-intro-icon">✓</div>
        <h3>Merci de votre participation à ${escVille} !</h3>
        <p>Vos retours nous aident à améliorer les prochaines étapes.<br/><strong>Une fois le questionnaire envoyé, vous pourrez télécharger la présentation de l'événement.</strong></p>
      </div>
      <form id="feedbackForm" class="feedback-form" novalidate>
        ${question(1, 'Comment évaluez-vous globalement cette matinée ?', true,
          scaleHTML('satisfaction', 1, 5, 'Décevant', 'Excellent'))}

        ${question(2, 'Quels ateliers avez-vous suivis ?', true,
          `<div class="feedback-hint-line">2 maximum</div>${checkboxesHTML('ateliers', ATELIERS)}`)}

        ${question(3, 'Comment évaluez-vous la qualité des ateliers suivis ?', true,
          scaleHTML('note_ateliers', 1, 5, 'Décevant', 'Excellent'))}

        ${question(4, 'Recommanderiez-vous Les Rencontres du Logement Social à un confrère ?', true,
          scaleHTML('nps', 0, 10, 'Pas du tout', 'Absolument'))}

        ${question(5, 'Quel sujet vous a le plus marqué, ou que vous aimeriez approfondir ?', false,
          `<textarea name="sujet_marquant" rows="3" placeholder="Ventes en bloc, commercialisation, expertise, gestion de copro…"></textarea>`)}

        ${question(6, 'Souhaitez-vous une présentation à vos équipes internes ?', false, `
          <div class="feedback-radio-group">
            <label><input type="radio" name="recontact" value="non" /> Non</label>
            <label><input type="radio" name="recontact" value="oui" checked /> Oui</label>
          </div>
          <div class="feedback-recontact-fields">
            <div class="feedback-field">
              <label>Votre email professionnel</label>
              <input type="email" name="recontact_email" placeholder="prenom.nom@exemple.fr" />
            </div>
            <div class="feedback-field">
              <label>Sur quel sujet précisément ?</label>
              <textarea name="recontact_sujet" rows="2" placeholder="ex : stratégie de cession, commercialisation, gestion de copropriété…"></textarea>
            </div>
          </div>
        `)}

        ${question(7, 'Une remarque, suggestion ou critique ?', false,
          `<textarea name="commentaire" rows="3" placeholder="Laissez-nous un commentaire. Votre retour est précieux afin de renouveler ces recontres sous un angle encore plus pertinent pour vous."></textarea>`)}

        <div class="feedback-actions">
          <div class="feedback-error" id="feedback-error" hidden></div>
          <button type="submit" class="feedback-submit" id="feedback-submit">Valider et accéder à la présentation</button>
        </div>
      </form>
    `;
  }

  function question(num, label, required, content) {
    return `
      <div class="feedback-question">
        <div class="feedback-question-label">
          <span class="feedback-question-num">${num}</span>
          ${escHTML(label)}${required ? ' <span class="feedback-req">*</span>' : ''}
        </div>
        ${content}
      </div>
    `;
  }

  function scaleHTML(name, min, max, labelMin, labelMax) {
    let buttons = '';
    for (let i = min; i <= max; i++) {
      buttons += `<button type="button" class="feedback-scale-btn" data-name="${name}" data-value="${i}">${i}</button>`;
    }
    return `
      <div class="feedback-scale">${buttons}</div>
      <input type="hidden" name="${name}" />
      <div class="feedback-scale-labels"><span>${labelMin}</span><span>${labelMax}</span></div>
    `;
  }

  function checkboxesHTML(name, options) {
    return `
      <div class="feedback-checkboxes">
        ${options.map(o => `
          <label class="feedback-checkbox">
            <input type="checkbox" name="${name}" value="${o.value}" />
            <span>${escHTML(o.label)}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  // ─── HANDLERS ────────────────────────────────────────────
  function attachFormHandlers(wrap, villeKey, ville, dateLabel) {
    const form = wrap.querySelector('#feedbackForm');

    // Scales (boutons → input hidden)
    wrap.querySelectorAll('.feedback-scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const value = btn.dataset.value;
        form.querySelector(`input[name="${name}"]`).value = value;
        wrap.querySelectorAll(`.feedback-scale-btn[data-name="${name}"]`).forEach(b => {
          b.classList.toggle('selected', b === btn);
        });
      });
    });

    // Ateliers : max 2 cochés
    const ateliersCbs = wrap.querySelectorAll('input[name="ateliers"]');
    ateliersCbs.forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(ateliersCbs).filter(c => c.checked);
        ateliersCbs.forEach(c => {
          const lbl = c.closest('.feedback-checkbox');
          if (!c.checked && checked.length >= 2) {
            c.disabled = true;
            lbl.classList.add('disabled');
          } else {
            c.disabled = false;
            lbl.classList.remove('disabled');
            lbl.classList.toggle('checked', c.checked);
          }
        });
      });
    });

    // Recontact : conditionnel
    const recontactFields = wrap.querySelector('.feedback-recontact-fields');
    wrap.querySelectorAll('input[name="recontact"]').forEach(r => {
      r.addEventListener('change', () => {
        recontactFields.hidden = (r.value !== 'oui' || !r.checked);
      });
    });

    // Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitForm(form, wrap, villeKey, ville, dateLabel);
    });
  }

  async function submitForm(form, wrap, villeKey, ville, dateLabel) {
    const errBox = wrap.querySelector('#feedback-error');
    const submitBtn = wrap.querySelector('#feedback-submit');
    errBox.hidden = true;

    const fd = new FormData(form);
    const payload = {
      ville: villeKey,
      satisfaction:    fd.get('satisfaction'),
      ateliers:        fd.getAll('ateliers'),
      note_ateliers:   fd.get('note_ateliers'),
      nps:             fd.get('nps'),
      sujet_marquant:  fd.get('sujet_marquant'),
      recontact:       fd.get('recontact'),
      recontact_email: fd.get('recontact_email'),
      recontact_sujet: fd.get('recontact_sujet'),
      commentaire:     fd.get('commentaire'),
    };

    // Validation client
    const missing = [];
    if (!payload.satisfaction)    missing.push('satisfaction');
    if (!payload.ateliers.length) missing.push('ateliers');
    if (!payload.note_ateliers)   missing.push('note des ateliers');
    if (payload.nps === '' || payload.nps === null) missing.push('recommandation');
    if (missing.length) {
      errBox.textContent = 'Merci de compléter : ' + missing.join(', ') + '.';
      errBox.hidden = false;
      errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (payload.recontact === 'oui' && !payload.recontact_email) {
      errBox.textContent = 'Merci de renseigner votre email pour le recontact.';
      errBox.hidden = false;
      errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const res = await fetch('/.netlify/functions/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) {
        errBox.textContent = result.message || 'Une erreur est survenue.';
        errBox.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Valider et accéder à la présentation';
        if (typeof window.trackEvent === 'function') window.trackEvent('feedback_submit_error', result.message || 'Erreur serveur');
        return;
      }

      // Persistance locale
      const storeData = {
        submittedAt:      Date.now(),
        downloadUrl:      result.downloadUrl || null,
        downloadFilename: result.downloadFilename || null,
      };
      writeStorage(villeKey, storeData);

      if (typeof window.trackEvent === 'function') {
        window.trackEvent('feedback_submit_success', 'satisfaction:' + payload.satisfaction + ' nps:' + payload.nps);
      }

      // Swap form → success
      wrap.innerHTML = buildSuccessHTML(ville, dateLabel, storeData.downloadUrl, storeData.downloadFilename, false);
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      attachDownloadTracking(wrap, villeKey);

    } catch (err) {
      errBox.textContent = 'Erreur réseau. Merci de réessayer.';
      errBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Valider et accéder à la présentation';
      if (typeof window.trackEvent === 'function') window.trackEvent('feedback_submit_error', 'Erreur réseau');
    }
  }

  // ─── SUCCESS / DOWNLOAD ──────────────────────────────────
  function buildSuccessHTML(ville, dateLabel, downloadUrl, downloadFilename, alreadySubmitted) {
    const intro = alreadySubmitted
      ? `Vous avez déjà rempli le questionnaire pour ${escHTML(ville)}.`
      : `Votre retour a bien été enregistré.`;

    const downloadBlock = downloadUrl
      ? `<a class="feedback-download-btn" id="feedback-download" href="${downloadUrl}" download="${escHTML(downloadFilename || 'presentation.pdf')}">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
           </svg>
           Télécharger la présentation
         </a>`
      : `<p class="feedback-no-deck">La présentation sera mise à disposition prochainement.</p>`;

    return `
      <div class="feedback-success">
        <div class="feedback-success-icon">✓</div>
        <h3>${escHTML(intro.split('.')[0])}.</h3>
        <p>${escHTML(intro.includes('déjà') ? 'Téléchargez la présentation ci-dessous.' : 'Vous pouvez maintenant télécharger la présentation de l\'événement.')}</p>
        ${downloadBlock}
        <p class="feedback-success-foot">Une question ? Contactez Clément Hennequin — <a href="tel:+33643285027">06 43 28 50 27</a></p>
      </div>
    `;
  }

  function attachDownloadTracking(wrap, villeKey) {
    const dl = wrap.querySelector('#feedback-download');
    if (!dl) return;
    dl.addEventListener('click', () => {
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('deck_download', villeKey);
      }
    });
  }

  // ─── STORAGE ─────────────────────────────────────────────
  function readStorage(villeKey) {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + villeKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function writeStorage(villeKey, data) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + villeKey, JSON.stringify(data));
    } catch (e) { /* quota / private mode → on ignore */ }
  }

  // ─── STYLES (injectés une fois) ──────────────────────────
  function injectStyles() {
    if (document.getElementById('rls-feedback-styles')) return;
    const style = document.createElement('style');
    style.id = 'rls-feedback-styles';
    style.textContent = `
      .feedback-wrap { padding: 0.5rem 0; }

      .feedback-intro {
        text-align: center;
        padding: 0 0 1.5rem;
        margin-bottom: 2rem;
        border-bottom: 1px solid #eef1f5;
      }
      .feedback-intro-icon {
        width: 54px; height: 54px; border-radius: 50%;
        background: #16a34a; color: white;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 1.7rem; font-weight: 700; margin-bottom: 1rem;
      }
      .feedback-intro h3 {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 1.4rem; color: #0E1D4D;
        margin-bottom: 0.4rem; line-height: 1.25;
      }
      .feedback-intro p {
        color: #64748b; font-size: 0.92rem; font-weight: 300;
      }

      .feedback-question { margin-bottom: 1.85rem; }
      .feedback-question-label {
        display: flex; align-items: baseline; gap: 0.6rem;
        font-size: 0.95rem; color: #0E1D4D; font-weight: 500;
        margin-bottom: 0.85rem; line-height: 1.4;
      }
      .feedback-question-num {
        font-family: 'Space Mono', monospace; font-size: 0.7rem;
        color: #284181; font-weight: 700; letter-spacing: 0.08em;
        flex-shrink: 0; padding-top: 0.1rem;
      }
      .feedback-req { color: #dc2626; font-weight: 700; }
      .feedback-hint-line {
        font-size: 0.78rem; color: #64748b; font-weight: 300;
        margin: -0.5rem 0 0.6rem;
      }

      /* Scale (1-5 / 0-10) */
      .feedback-scale {
        display: flex; gap: 0.4rem; flex-wrap: wrap;
      }
      .feedback-scale-btn {
        flex: 1; min-width: 38px;
        border: 1px solid #cbd5e1; background: white;
        padding: 0.65rem 0.3rem; border-radius: 4px;
        font-family: inherit; font-size: 0.95rem; font-weight: 500;
        color: #0E1D4D; cursor: pointer;
        transition: all 0.15s;
      }
      .feedback-scale-btn:hover {
        border-color: #284181; background: #f0f4ff;
      }
      .feedback-scale-btn.selected {
        background: #0E1D4D; color: white; border-color: #0E1D4D;
      }
      .feedback-scale-labels {
        display: flex; justify-content: space-between;
        font-size: 0.7rem; color: #64748b;
        margin-top: 0.45rem; font-family: 'Space Mono', monospace;
        letter-spacing: 0.05em;
      }

      /* Checkboxes */
      .feedback-checkboxes {
        display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;
      }
      @media (max-width: 540px) {
        .feedback-checkboxes { grid-template-columns: 1fr; }
      }
      .feedback-checkbox {
        display: flex; align-items: center; gap: 0.65rem;
        padding: 0.7rem 0.9rem; border: 1px solid #cbd5e1;
        border-radius: 4px; cursor: pointer; transition: all 0.15s;
        font-size: 0.88rem; color: #0E1D4D;
        user-select: none;
      }
      .feedback-checkbox:hover { border-color: #284181; background: #f8fafc; }
      .feedback-checkbox.checked { border-color: #0E1D4D; background: #f0f4ff; }
      .feedback-checkbox.disabled { opacity: 0.4; cursor: not-allowed; }
      .feedback-checkbox input { margin: 0; cursor: inherit; }

      /* Radios */
      .feedback-radio-group {
        display: flex; gap: 1.5rem;
      }
      .feedback-radio-group label {
        display: flex; align-items: center; gap: 0.4rem;
        cursor: pointer; font-size: 0.95rem; color: #0E1D4D;
      }

      /* Conditional fields */
      .feedback-recontact-fields {
        margin-top: 1rem; padding: 1rem 1.1rem;
        background: #f8fafc; border-radius: 4px;
        border-left: 3px solid #f8c1d9;
      }
      .feedback-field { margin-bottom: 0.85rem; }
      .feedback-field:last-child { margin-bottom: 0; }
      .feedback-field > label {
        display: block; font-size: 0.82rem;
        color: #64748b; margin-bottom: 0.35rem; font-weight: 400;
      }
      .feedback-field input,
      .feedback-field textarea,
      .feedback-question textarea {
        width: 100%; padding: 0.7rem 0.85rem;
        border: 1px solid #cbd5e1; border-radius: 4px;
        font-family: inherit; font-size: 0.9rem;
        color: #0E1D4D; background: white;
        resize: vertical;
      }
      .feedback-field input:focus,
      .feedback-field textarea:focus,
      .feedback-question textarea:focus {
        outline: none; border-color: #284181;
      }

      /* Submit */
      .feedback-actions {
        text-align: center; padding-top: 0.5rem;
        border-top: 1px solid #f0f0f0; margin-top: 0.5rem;
      }
      .feedback-actions { padding-top: 1.2rem; }
      .feedback-submit {
        background: #f8c1d9; color: #0E1D4D;
        font-family: inherit; font-weight: 600; font-size: 0.9rem;
        letter-spacing: 0.02em; border: 1px solid #f8c1d9;
        padding: 14px 36px; border-radius: 4px; cursor: pointer;
        transition: all 0.2s;
      }
      .feedback-submit:hover:not(:disabled) {
        background: #0E1D4D; color: white; border-color: #0E1D4D;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(14,29,77,0.15);
      }
      .feedback-submit:disabled { opacity: 0.7; cursor: wait; }
      .feedback-error {
        margin-bottom: 1rem; padding: 0.75rem 1rem;
        background: #fee2e2; color: #991b1b;
        border-radius: 4px; font-size: 0.85rem;
        border-left: 3px solid #dc2626; text-align: left;
      }

      /* Success */
      .feedback-success {
        text-align: center; padding: 1.5rem 1rem 0.5rem;
      }
      .feedback-success-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: #16a34a; color: white;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 2rem; font-weight: 700; margin-bottom: 1.25rem;
      }
      .feedback-success h3 {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 1.5rem; color: #0E1D4D;
        margin-bottom: 0.5rem;
      }
      .feedback-success > p {
        color: #64748b; font-size: 0.95rem; font-weight: 300;
        margin-bottom: 1.75rem; line-height: 1.5;
      }
      .feedback-download-btn {
        display: inline-flex; align-items: center; gap: 0.65rem;
        background: #0E1D4D; color: white;
        padding: 14px 30px; border-radius: 4px;
        text-decoration: none; font-weight: 600; font-size: 0.95rem;
        transition: all 0.2s;
      }
      .feedback-download-btn:hover {
        background: #284181;
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(14,29,77,0.25);
      }
      .feedback-download-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
      .feedback-no-deck {
        color: #64748b; font-style: italic; font-size: 0.9rem;
        padding: 1rem; background: #f8fafc; border-radius: 4px;
      }
      .feedback-success-foot {
        margin-top: 2rem; font-size: 0.8rem; color: #64748b;
        padding-top: 1.25rem; border-top: 1px solid #f0f0f0;
      }
      .feedback-success-foot a {
        color: #284181; text-decoration: none; font-weight: 500;
      }
      .feedback-success-foot a:hover { text-decoration: underline; }
    `;
    document.head.appendChild(style);
  }

  // ─── UTILS ───────────────────────────────────────────────
  function escHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
})();
