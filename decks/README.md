# Decks de présentation par ville

Ce dossier contient les PDFs des présentations diffusées lors de chaque étape de
la tournée. Une fois l'événement passé, le PDF est proposé en téléchargement
aux participants à la fin du questionnaire de feedback.

## Convention de nommage

```
quadral-rls-<slug>.pdf
```

où `<slug>` correspond au slug de la ville utilisé dans les noms de pages
(`paris`, `lyon`, `marseille`, etc.). Cas particulier : pour Le Havre, on
écrit `lehavre` (sans tiret), comme dans le nom du fichier image `lehavre.webp`.

## Procédure pour ajouter un deck

Quand le deck d'une ville est prêt à être mis en ligne, faire **deux** opérations :

### 1. Uploader le PDF dans ce dossier

Avec le bon nom : `decks/quadral-rls-<slug>.pdf`.

Recommandations :
- Format : PDF
- Poids : < 10 Mo si possible (les decks actuels font ~8 Mo)
- Pas d'espaces ni d'accents dans le nom de fichier

### 2. Référencer le deck dans la Netlify Function

Éditer [`netlify/functions/feedback.js`](../netlify/functions/feedback.js) et
ajouter une ligne dans la constante `DECKS` au début du fichier :

```js
const DECKS = {
  'le-havre': 'quadral-rls-lehavre.pdf',
  'paris':    'quadral-rls-paris.pdf',
  'lyon':     'quadral-rls-lyon.pdf',
  'annecy':   'quadral-rls-annecy.pdf',
  // ↓ ajouter la nouvelle ville ici
  'bordeaux': 'quadral-rls-bordeaux.pdf',
};
```

Sans cette ligne, le questionnaire de feedback se valide quand même mais
n'affiche pas le bouton de téléchargement (la fonction n'envoie pas
d'`downloadUrl` dans sa réponse). Le message "La présentation sera mise à
disposition prochainement." s'affiche à la place.

## Comment ça marche côté utilisateur

1. Quand la date de l'événement est passée (cf. `date_iso` dans
   [`config.js`](../config.js)), la page ville bascule automatiquement le
   formulaire d'inscription en questionnaire de feedback.
2. Une fois le questionnaire envoyé, la Netlify Function `feedback` regarde
   si une entrée existe dans `DECKS` pour ce slug. Si oui, elle renvoie
   `downloadUrl: '/decks/<nom-du-fichier>.pdf'` au navigateur.
3. Le frontend affiche alors un bouton "Télécharger la présentation" et
   enregistre l'info en `localStorage` pour que l'utilisateur retrouve le
   lien lors de ses prochaines visites.

## Cohérence avec les autres mappings

Pour mémoire, le slug de la ville apparaît aussi dans :

- [`config.js`](../config.js) — `LIEUX_CONFIG` (lieu, adresse, date)
- [`netlify/functions/feedback.js`](../netlify/functions/feedback.js) —
  `VILLE_LABELS` et `DECKS`
- Le nom du fichier HTML de la page ville (`<slug>.html`)
- Le nom du fichier image hero (`<slug>.webp`, exception : `lehavre.webp`)

Si tu ajoutes une nouvelle ville à la tournée, pense à vérifier ces 4
emplacements.
