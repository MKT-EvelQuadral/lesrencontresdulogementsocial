const { google } = require('googleapis');

const SHEET_ID  = process.env.GOOGLE_SHEET_ID;
const SHEET_TAB = 'Feedback';

// Mapping ville (slug) → nom de fichier PDF dans /decks/
// Ajouter une entrée uniquement quand le deck est réellement uploadé.
const DECKS = {
  'le-havre': 'quadral-rls-lehavre.pdf',
  'paris':    'quadral-rls-paris.pdf',
};

const VILLE_LABELS = {
  'le-havre':   'Le Havre',
  'paris':      'Paris',
  'metz':       'Metz',
  'lyon':       'Lyon',
  'annecy':     'Annecy',
  'bordeaux':   'Bordeaux',
  'strasbourg': 'Strasbourg',
  'toulouse':   'Toulouse',
  'marseille':  'Marseille',
  'lille':      'Lille',
};

const ATELIER_LABELS = {
  arbitrage:         'Arbitrage et stratégie de cession',
  tertiaire:         'Pilotage du parc tertiaire',
  commercialisation: 'Commercialisation & financement',
  efficacite:        'Efficacité opérationnelle',
};

async function appendToSheet(values) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key:  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId:    SHEET_ID,
    range:            `${SHEET_TAB}!A:K`,
    valueInputOption: 'USER_ENTERED',
    requestBody:      { values: [values] },
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Méthode non autorisée.' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      ville,
      satisfaction,
      ateliers,
      note_ateliers,
      nps,
      sujet_marquant,
      recontact,
      recontact_entreprise,
      recontact_sujet,
      commentaire,
    } = body;

    if (!ville) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Ville manquante.' }) };
    }
    const villeLabel = VILLE_LABELS[ville] || ville;

    const ateliersList = Array.isArray(ateliers) ? ateliers.filter(Boolean) : [];
    const missing =
      !satisfaction ||
      ateliersList.length === 0 ||
      !note_ateliers ||
      nps === undefined || nps === null || nps === '';
    if (missing) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Champs obligatoires manquants.' }) };
    }
    if (ateliersList.length > 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Vous ne pouvez sélectionner que 2 ateliers au maximum.' }) };
    }

    const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    const ateliersStr = ateliersList.map(a => ATELIER_LABELS[a] || a).join(' · ');
    const isRecontact = recontact === 'oui';

    const row = [
      now,
      villeLabel,
      String(satisfaction),
      ateliersStr,
      String(note_ateliers),
      String(nps),
      sujet_marquant || '',
      isRecontact ? 'Oui' : 'Non',
      isRecontact ? (recontact_entreprise || '') : '',
      isRecontact ? (recontact_sujet || '') : '',
      commentaire || '',
    ];

    await appendToSheet(row);
    console.log(`Feedback ${ville} — Sat ${satisfaction}/5, NPS ${nps}/10`);

    const deckFile = DECKS[ville];
    const response = {
      success: true,
      message: 'Questionnaire enregistré.',
    };
    if (deckFile) {
      response.downloadUrl      = '/decks/' + deckFile;
      response.downloadFilename = 'Quadral RLS - ' + villeLabel + '.pdf';
    }

    return { statusCode: 200, headers, body: JSON.stringify(response) };

  } catch (err) {
    console.error('Erreur feedback:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Erreur lors de l\'enregistrement. Merci de réessayer.' }),
    };
  }
};
