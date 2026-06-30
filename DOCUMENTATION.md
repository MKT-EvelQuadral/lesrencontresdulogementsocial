# 📘 Documentation projet — Les Rencontres du Logement Social

> **But de ce document**
> Donner à toute personne (ou tout assistant Claude, y compris depuis un autre compte) une vision claire et à jour de :
> 1. ce qu'est le projet et comment il est construit (base de l'existant),
> 2. les conventions à respecter,
> 3. les travaux en cours et où on en est.
>
> **➡️ À tenir à jour à chaque session de travail** (voir le *Journal* en bas).
> Dernière mise à jour : **26 juin 2026**.

> **📂 Dossier de travail de référence (source de vérité)** — depuis le 26/06/2026 :
> `OneDrive-QUADRAL/Dossier Marketing/Evenements/Tournée Quadral/site`
> C'est ce dossier qui est synchronisé avec GitHub et déployé sur Netlify. Tout travail se fait ici.
> (L'ancien dossier `Desktop/lesrencontresdulogementsocial-main` est **obsolète** — ne plus l'utiliser.)

---

## 1. Présentation

Site vitrine de **« Les Rencontres du Logement Social »**, une tournée nationale d'événements
organisée par **Quadral** à destination des décideurs du logement social (bailleurs sociaux).

- **Édition 2026** : 10 étapes en France de mai à juin 2026 (matinées d'ateliers + inscription gratuite).
- Le site présente la tournée, chaque ville, l'équipe Quadral, et collecte les inscriptions.
- Domaine : `https://www.lesrencontresdulogementsocial.fr`

## 2. Stack & hébergement

- **Site statique** : HTML + CSS + JavaScript *vanilla*. **Aucun framework, aucune étape de build.**
- **Hébergement : Netlify (offre gratuite).**
  - ⚠️ **Sensible à la casse** : `Seqens.png` ≠ `seqens.png`. Respecter exactement la casse des fichiers.
  - ⚠️ **Le poids compte** : offre gratuite → quota limité. Voir *Convention « optimisation »* (§4).
- Fonctions serverless : `netlify/functions/` (ex. soumission du formulaire, feedback).
- Config Netlify : `netlify.toml` (functions + esbuild). Redirections : `_redirects`.

## 3. Architecture des fichiers

### Pages HTML (à la racine)
- `index.html` — page d'accueil (hero, valeur, grille des villes, CTA, équipe, footer).
- **Pages villes** (1 par étape) : `le-havre.html`, `paris.html`, `metz.html`, `lyon.html`,
  `annecy.html`, `bordeaux.html`, `strasbourg.html`, `toulouse.html`, `marseille.html`, `lille.html`.
  → Toutes structurées pareil : hero, contexte, programme, ateliers, formulaire d'inscription, footer.

### Scripts partagés (à la racine)
| Fichier | Rôle |
|---|---|
| `config.js` | Données centrales : `LIEUX_CONFIG` (lieu, `date_iso`, adresse, maps par ville), `EVENT_CONFIG` (horaires, contact), `DECKS_AVAILABLE` (PDF de présentation dispo par ville). |
| `testimonials.js` | **Carrousel de témoignages** (3 cartes : précédent/courant/suivant + flèches latérales + dots). Auto-injecté sur l'index (avant `.cta-section`) et les pages villes (après `.ateliers-section`). Tableau `TESTIMONIALS` en haut du fichier. |
| `participants.js` | **Carrousel de logos défilant** (« Ils ont participé »), auto-injecté juste après `.hero`. Tableau `PARTICIPANTS` en haut. Vitesse : `animation: participants-scroll 18s` (desktop) / `15s` (mobile). |
| `feedback.js` | **Bascule « événement passé »** (voir §5). |

### Dossiers d'assets
- `participants/` — **tous les logos** (participants ET témoignages). **30 logos** (format `.png`), CDC Habitat inclus.
- `team/` — photos de l'équipe Quadral (`.webp`) : benoit, clement, helene-claire, kamel, maud, pierre, yann.
- `decks/` — PDF des présentations par ville (téléchargeables après le questionnaire de feedback).
- `netlify/functions/` — fonctions serverless.
- Images racine : `hero-bg.webp`, `og-default.jpg`, logos SVG (`logo-navbar.svg`, `logo-quadral.svg`, `favicon.svg`), visuels villes (`lyon.webp`, etc.).

### Fichiers de travail LOCAUX (⚠️ NE PAS déployer)
- `preview-participants.html` — aperçu local du carrousel de logos (chemins relatifs).
- `index-2027.html` — **maquette** de la future page d'accueil (voir §6). Travail en cours.
- `DOCUMENTATION.md` — ce document.

## 4. Conventions importantes

1. **Logos mutualisés** : tous les logos (participants + témoignages) vivent dans `participants/`.
   L'ancien dossier `testimonials/` a été **supprimé** (doublon) — `testimonials.js` pointe désormais vers `/participants/`.
2. **Casse des fichiers** : respecter exactement (Netlify sensible à la casse). Certains logos ont une
   majuscule initiale (`Seqens.png`, `Cosivia.png`, `CDC-habitat.png`).
3. **Convention « optimisation »** : quand l'utilisateur demande d'« optimiser le code », il veut
   **traquer et supprimer les doublons / fichiers inutiles** et **alléger les assets lourds**
   (hébergement gratuit = quota limité). Toujours faire un `grep` global des références avant de
   supprimer quoi que ce soit. ⚠️ Asset lourd repéré : `vichy.svg` ~5,5 Mo (à optimiser si réutilisé).
4. **Ajouter un témoignage** : éditer le tableau `TESTIMONIALS` dans `testimonials.js`. Logo dans `/participants/`.
5. **Ajouter un participant** : éditer le tableau `PARTICIPANTS` dans `participants.js` ET déposer le PNG dans `participants/`.
   Penser à répercuter dans `preview-participants.html` si on veut le voir en local.

## 5. Mécanisme « événement passé » (existant, pages villes)

Géré par `feedback.js`, appelé en fin de page ville via `window.RLS_initFeedback(villeKey, ville, dateLabel)`.

- Au chargement, compare `LIEUX_CONFIG[ville].date_iso` à la date du jour.
- **Si la date est passée**, la page se transforme automatiquement :
  - bandeau noir en haut : *« Événement passé, merci de votre participation »* ;
  - masque les CTA d'inscription + le bandeau lieu ;
  - **transforme le formulaire d'inscription en questionnaire de satisfaction** qui débloque
    le **téléchargement du deck** (PDF dans `decks/`, listé dans `DECKS_AVAILABLE`).
- L'index, lui, **n'a aujourd'hui aucune bascule** de ce type → c'est l'objet du chantier en cours (§6).

## 6. 🚧 CHANTIER EN COURS — Refonte de l'index après le 1er juillet 2026

**Objectif** : à partir du **1er juillet 2026** (lendemain de la dernière étape, Lille le 30/06),
l'index doit basculer dans un mode « après-tournée » (bilan + préinscription 2027), comme les pages
villes basculent en mode « événement passé ».

**Déclencheur retenu** : **date en dur `2026-07-01`** (décision utilisateur).

**Méthode de travail** : on maquette d'abord dans un fichier séparé **`index-2027.html`**
(autonome, chemins relatifs, ouvrable en double-clic) pour **ne pas abîmer l'index en production**.
L'intégration dans `index.html` (avec la bascule de date) viendra une fois la maquette validée.

### Structure cible de la nouvelle page (6 sections)

1. **Hero** — Titre « Les Rencontres du Logement Social », sous-titre
   *« RDV en 2027 pour un nouveau format mais toujours autant d'échanges. »*,
   CTA **« Voir le bilan »** + **« Préinscription 2027 »**.
2. **Remerciement** — Titre *« Merci à tous les participants qui ont fait cette tournée »*,
   **tous les logos participants en grille statique** (PAS de carrousel), puis **les témoignages**
   en dessous (carrousel, format actuel) avec surtitre *« Ils donnent leur avis »*.
3. **Bilan** — Titre *« Le logement social n'est pas en crise. Il change de modèle. »*,
   sous-titre *« Neuf villes, neuf territoires… Voici ce que le terrain nous a dit. »*,
   puis **carrousel de 6 cartes** (1 sujet par carte). Flèches **en dessous**, **sans barre de scroll**,
   swipe au doigt sur mobile (1 carte à la fois).
4. **Entreprise / interlocuteurs** — Principe des **fiches équipe filtrées par des pills**.
   Filtres : `Commercialisation · Vente en bloc · Solutions digitales · Parc tertiaire ·
   Syndic - Copro - Gestion · LLI · Expertise`.
   - **Desktop** : bouton *« Voir les coordonnées »* → affiche mail + téléphone.
   - **Mobile** : bouton *« Ajouter la fiche »* → télécharge la vCard.
   - Cartes de **hauteur égale** (éviter que la section saute en hauteur).
   - Bouton en police **Roboto**.
5. **Formulaire « Tournée 2027 »** — Titre *« Faites partie de la tournée 2027 et échangez avec vos pairs »*.
   Champs : Prénom* / Nom* / Entreprise* / E-mail* / Ville souhaitée / Période (Trimestre 1 ou 2) /
   Format souhaité (*Matinée + Déjeuner* ou *Après-midi + Networking cocktail*) /
   Commentaire (placeholder : *« N'hésitez pas à nous proposer vos idées pour le futur format »*).
6. **Footer** — identique à l'existant.

### État d'avancement (au 26/06/2026)
- ✅ Maquette `index-2027.html` créée avec les 6 sections et toutes les interactions.
- ✅ Carrousel témoignages : design exact repris (3 cartes prev/current/next + flèches latérales + dots).
- ✅ Bilan : carrousel sans barre de scroll, flèches dessous, 1 carte/écran sur mobile.
- ✅ Interlocuteurs : cartes hauteur égale, bouton Roboto, desktop = coordonnées / mobile = vCard.

### ⏳ EN ATTENTE (contenus / décisions à fournir par l'utilisateur)
- [x] **Bilan** : ✅ résolu (28/06/2026). Le **slide 1** du carrousel social = l'**en-tête de section**
      (déjà en place). Les cartes du carrousel = slides 2→6, soit **5 cartes** toutes transcrites depuis
      les visuels (complexité / accession / bailleurs+collectivités / leviers patrimoine / problématiques
      communes). Surlignage rose (`.hi`) sur les mots-clés des titres, paragraphes (`<br>`), bloc de
      remerciement en gras (`.bilan-card-thanks`). Numérotation dynamique `0i / 0N`.
- [x] **Interlocuteurs** : ✅ résolu (28/06/2026). 8 profils renseignés via `equipe-2027-a-completer.xlsx`
      (ajout d'Alexis RIGNY et Christelle HOUPERT). Filtres revus → **10 pills** :
      Commercialisation · Vente en bloc · Vente en lot par lot · Administration des ventes · Financement ·
      Solutions digitales · Parc tertiaire · Syndic - Copro - Gestion · LLI · Expertise.
- [x] **Formulaire 2027** : ✅ câblé (28/06/2026). Envoi vers le **Google Sheet existant**, nouvel onglet
      **`2027`**, via la fonction Netlify `netlify/functions/inscription-2027.js` (mêmes variables d'env
      `GOOGLE_SHEET_ID` / `GOOGLE_CLIENT_EMAIL` / `GOOGLE_PRIVATE_KEY` que les autres formulaires).
      Colonnes A:I = Date · Prénom · Nom · Entreprise · E-mail · Ville · Période · Format · Commentaire.
      ⚠️ **À faire côté Google Sheet** : créer l'onglet `2027` (sinon l'append échoue).
- [x] **Témoignages** : ✅ réconciliés. La source de vérité est `testimonials.js` de ce dossier =
      **8 témoignages** (Seqens, Cosivia, Antin Résidences, 1001 Vies Habitat, Vichy Habitat, SDH Access,
      Alteal, 3F Sud). La maquette `index-2027.html` a été réalignée sur ces 8 textes exacts.
      (Écart corrigé : le texte « 1001 Vies Habitat » diffère de l'ancien Desktop — c'est la version
      en ligne qui fait foi : *« Une rencontre inspirante et prospective… »*.)
- [x] **CDC Habitat** (logo participant) : ✅ résolu — `participants/CDC-habitat.png` présent et ajouté
      dans `participants.js` (→ **30 logos**). Également intégré à la maquette `index-2027.html`.

### Quand la maquette sera validée — intégration (à faire)
- Porter les sections dans `index.html` derrière une bascule de date (`>= 2026-07-01`),
  sur le modèle de `feedback.js` (idéalement un script dédié, ex. `index-after.js`).
- Câbler l'envoi réel du formulaire 2027.
- Retirer le bandeau « MAQUETTE » et les chemins relatifs (repasser en chemins absolus `/...`).

## 7. 📋 Journal des modifications

> Ajouter une ligne datée à chaque session.

- **2026-06-30 — 🚀 INTÉGRATION FINALE dans `index.html`**
  - L'ancien `index.html` (site tournée) a été **sauvegardé en `index-tournee.html`** (inchangé).
  - `index.html` est désormais la **page « après-tournée »** (bilan + RDV 2027), reprise de la maquette
    validée : bandeau MAQUETTE retiré, nav remise à `top:0`, **chemins repassés en absolus** (`/team/…`,
    `/participants/…`, `/hero-bg.webp`, logos), `<head>` prod restauré (GTM `GTM-N3KW38LD`, preconnect,
    preload hero, SEO/OG contexte 2027), `<noscript>` GTM ajouté.
  - **Bascule de date** : script en tête de `index.html` → si la date < **2026-07-01** (heure de Paris),
    `window.location.replace('/index-tournee.html')`. À partir du 01/07, `/` affiche la page 2027.
  - Formulaire 2027 → fonction `netlify/functions/inscription-2027.js` (onglet Google Sheet `2027`).
  - Réglages UI de la session : pills Roboto/majuscules, fondu dynamique du Bilan (carte 1 intacte),
    flèches Bilan au-dessus, équipe en scroll horizontal mobile (flèches overlay, boucle infinie,
    masquées si 1 seule fiche), mur de logos centré (3 col. mobile), formulaire fond rose pop / 90vw mobile,
    CTA « Voir les solutions Quadral », hero eyebrow = liste des villes, champ « Ville » obligatoire.
  - ⚠️ **À faire avant/au déploiement** : (1) **uploader `index.html` + `index-tournee.html` +
    `netlify/functions/inscription-2027.js`** ; (2) **créer l'onglet `2027`** dans le Google Sheet ;
    (3) ne PAS déployer les fichiers de travail (`*.xlsx`, `.claude/`, `index-2027.html` = maquette redondante).

- **2026-06-28**
  - **Interlocuteurs (maquette `index-2027.html`)** : section finalisée à partir du fichier
    `equipe-2027-a-completer.xlsx` rempli par l'utilisateur. 8 fiches (ajout Alexis RIGNY,
    Christelle HOUPERT) et liste de filtres portée à **10 pills** (ajout « Vente en lot par lot »,
    « Administration des ventes », « Financement »).
  - Note : `team/kamel.webp` n'est plus référencé par aucune fiche → **conservé volontairement en standby**
    (décision utilisateur 28/06/2026, ne pas supprimer).
  - **Formulaire 2027 câblé** : nouvelle fonction `netlify/functions/inscription-2027.js` → Google Sheet,
    onglet `2027`. Handler de `index-2027.html` branché en `fetch` POST (avec état « Envoi en cours »
    + gestion d'erreur). ⚠️ Penser à créer l'onglet `2027` dans le Google Sheet.
  - **Bilan complété** : 5 cartes du carrousel transcrites depuis les visuels fournis (slides 2 à 6 ;
    slide 1 = en-tête de section). Surlignage rose des titres, numérotation dynamique.

- **2026-06-26**
  - Ajout de témoignages : Vichy, SDH Access, Alteal, 1001 Vies Habitat, 3F Sud.
  - Ajout de nombreux logos participants (jusqu'à **30** au total, dont CDC Habitat).
  - **Consolidation** : tous les logos témoignages déplacés vers `participants/` ;
    `testimonials.js` repointé vers `/participants/` ; **dossier `testimonials/` supprimé** (doublon).
  - Création du carrousel de logos `participants.js` (section « Ils ont participé », après le hero,
    sur toutes les pages). Réglages finaux : saturation 100 %, zoom léger au survol, vitesse 18s/15s.
  - **Démarrage du chantier refonte index post-01/07/2026** : maquette `index-2027.html` (v2 après retours).
  - **Bascule du dossier de travail** vers OneDrive (`…/Tournée Quadral/site`), désormais source de vérité
    et copie synchronisée GitHub. Maquette + documentation portées dans ce dossier et **réalignées sur la
    version en ligne** (8 témoignages, 29 participants). Ancien dossier Desktop abandonné.
