const { google } = require('googleapis');

const SHEET_ID  = process.env.GOOGLE_SHEET_ID;
const SHEET_TAB = 'Feuille 1';

const ATELIERS = {
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
    range:            `${SHEET_TAB}!A:L`,
    valueInputOption: 'USER_ENTERED',
    requestBody:      { values: [values] },
  });
}

exports.handler = async (event) => {

  // CORS — nécessaire pour les appels depuis le navigateur
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Méthode non autorisée.' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { prenom, nom, fonction, organisme, email, telephone,
            participants, atelier1, atelier2, dejeuner,
            ville, date_evenement } = body;

    if (!prenom || !nom || !email || !atelier1 || !atelier2) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Champs obligatoires manquants.' }) };
    }
    if (atelier1 === atelier2) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Veuillez choisir deux ateliers différents.' }) };
    }

    const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    const row = [
      now,
      ville            || '',
      prenom,
      nom,
      fonction         || '',
      organisme        || '',
      email,
      telephone ? `'${telephone}` : '',
      participants     || '',
      ATELIERS[atelier1] || atelier1,
      ATELIERS[atelier2] || atelier2,
      dejeuner === 'oui' ? 'Oui' : 'Non',
    ];

    await appendToSheet(row);
    console.log(`Inscription : ${prenom} ${nom} — ${ville}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Inscription enregistrée. Merci, nous vous confirmons votre participation.' }),
    };

  } catch (err) {
    console.error('Erreur:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Erreur lors de l\'enregistrement. Merci de réessayer.' }),
    };
  }
};
