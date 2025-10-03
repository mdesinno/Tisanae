// netlify/functions/handle-newsletter.js
const { google } = require('googleapis');

const CREDS_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_TAB = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function a1(tab, range = 'A:B') {
  const t = /\s/.test(tab) ? `'${tab}'` : tab;
  return `${t}!${range}`;
}

exports.handler = async (event) => {
  console.log('[handle-newsletter] start', {
    method: event.httpMethod,
    ct: event.headers['content-type'],
  });

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors() };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  }

  // --- parse body ---
  let email = null;
  try {
    const ct = (event.headers['content-type'] || '').toLowerCase();
    if (ct.includes('application/json')) {
      const body = JSON.parse(event.body || '{}');
      email = (body.email || '').trim();
    } else {
      const params = new URLSearchParams(event.body || '');
      email = (params.get('email') || '').trim();
    }
  } catch (e) {
    console.error('parse error', e);
  }

  if (!email) {
    console.warn('missing email in request');
    return { statusCode: 400, headers: cors(), body: 'Email mancante' };
  }

  // --- auth & append ---
  try {
    const credentials = JSON.parse(CREDS_JSON); // incolla l'intero JSON del service account in env
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: a1(SHEET_TAB),
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[new Date().toISOString(), email]] },
    });

    console.log('appended', email);

    // Se è submit “classica” da form, fai un redirect a una pagina di grazie (opzionale)
    const accepts = event.headers['accept'] || '';
    if (accepts.includes('text/html')) {
      return { statusCode: 303, headers: { ...cors(), Location: '/grazie.html' }, body: '' };
    }
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('sheets append error', err);
    return { statusCode: 500, headers: cors(), body: `Errore: ${err.message}` };
  }
};
