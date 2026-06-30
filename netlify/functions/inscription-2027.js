const { google } = require('googleapis');

const SHEET_ID  = process.env.GOOGLE_SHEET_ID;
const SHEET_TAB = '2027';

const PERIODES = {
  T1: 'Trimestre 1',
  T2: 'Trimestre 2',
};

const FORMATS = {
  'matinee-dejeuner':  'Matinée + Déjeuner',
  'apresmidi-cocktail': 'Après-midi + Networking cocktail',
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
    range:            `${SHEET_TAB}!A:I`,
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
    const { prenom, nom, entreprise, email, ville, periode, format, commentaire } = body;

    if (!prenom || !nom || !entreprise || !email || !ville) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Champs obligatoires manquants.' }) };
    }

    const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    const row = [
      now,
      prenom,
      nom,
      entreprise,
      email,
      ville              || '',
      PERIODES[periode]  || periode || '',
      FORMATS[format]    || format  || '',
      commentaire        || '',
    ];

    await appendToSheet(row);
    console.log(`Préinscription 2027 : ${prenom} ${nom} — ${entreprise}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Préinscription enregistrée. Merci, nous revenons vers vous pour la tournée 2027.' }),
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
