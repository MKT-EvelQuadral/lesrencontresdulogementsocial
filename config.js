// ══════════════════════════════════════════════════════════════
//  CONFIG LIEUX — Les Rencontres du Logement Social 2026
//  À mettre à jour au fur et à mesure que les lieux sont confirmés
//
//  Pour chaque ville :
//    nom      → nom du lieu (affiché sur la page)
//    maps_url → colle ici le lien Google Maps du lieu
//               (clic droit sur Google Maps → "Partager" → copier le lien)
//               Laisser '' si le lieu n'est pas encore confirmé
//    date_iso → date au format YYYY-MM-DD (utilisée pour le calendrier)
//    adresse  → adresse postale complète (optionnelle, utilisée dans
//               l'invitation calendrier quand elle est renseignée)
// ══════════════════════════════════════════════════════════════

const LIEUX_CONFIG = {
  'le-havre':   { nom: 'Villa Raphëlle', maps_url: 'https://maps.app.goo.gl/Drbx1hF3qBhALkhJ6', date_iso: '2026-05-06', adresse: '' },
  'paris':      { nom: 'Quadral - 89 rue de Tocqueville', maps_url: 'https://maps.app.goo.gl/RGUVBkU1fY7Ms8h26', date_iso: '2026-05-19', adresse: '89 rue de Tocqueville, 75017 Paris' },
  'metz':       { nom: 'EVEL - 12 rue François de Curel', maps_url: 'https://maps.app.goo.gl/2it4udnbyEvDDAuz9', date_iso: '2026-05-21', adresse: '12 rue François de Curel, 57000 Metz' },
  'lyon':       { nom: 'GRAVITY', maps_url: 'https://maps.app.goo.gl/8eHjNRDrY5KTjdET6', date_iso: '2026-06-04', adresse: '1 rue de la croix Barret, LYON 7' },
  'annecy':     { nom: 'À venir', maps_url: '', date_iso: '2026-06-05', adresse: '' },
  'bordeaux':   { nom: 'À venir', maps_url: '', date_iso: '2026-06-09', adresse: '' },
  'strasbourg': { nom: 'À venir', maps_url: '', date_iso: '2026-06-18', adresse: '' },
  'toulouse':   { nom: 'À venir', maps_url: '', date_iso: '2026-06-23', adresse: '' },
  'marseille':  { nom: 'À venir', maps_url: '', date_iso: '2026-06-24', adresse: '' },
  'lille':      { nom: 'À venir', maps_url: '', date_iso: '2026-06-30', adresse: '' },
};

// ══════════════════════════════════════════════════════════════
//  CONFIG ÉVÉNEMENT (commune à toutes les villes)
// ══════════════════════════════════════════════════════════════
const EVENT_CONFIG = {
  titre:        'Les Rencontres du Logement Social - Quadral',
  heure_debut:  '09:00',  // heure locale (Europe/Paris)
  heure_fin:    '12:30',  // heure locale (Europe/Paris)
  // Mai-juin 2026 → CEST (UTC+2). Décalage utilisé pour générer les invitations.
  utc_offset_h: 2,
  contact_nom:  'Clément Hennequin',
  contact_tel:  '0643285027',
  site_url:     'https://www.lesrencontresdulogementsocial.fr',
  linkedin_url: 'https://www.linkedin.com/company/quadral/',
};
