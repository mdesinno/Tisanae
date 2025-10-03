// netlify/functions/handle-newsletter.js
const { google } = require('googleapis');

// Carica le variabili d'ambiente
const GOOGLE_SERVICE_ACCOUNT_CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1'; // Default a 'Sheet1' se non specificato

exports.handler = async (event) => {
    // Solo le richieste POST sono gestite da questa funzione per i form
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        // Parse dei dati del form inviati dal browser (action="/.netlify/functions/handle-newsletter")
        const formData = new URLSearchParams(event.body);
        const email = formData.get('email'); // Prendi l'email dal form

        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Email mancante nel form.' }),
            };
        }

        // --- Autenticazione con Google Sheets API ---
        const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
        
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Scope per Sheets
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        // --- Scrivi i dati nel Google Sheet ---
        const now = new Date();
        const formattedDate = now.toLocaleString('it-IT', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });

        // I valori da aggiungere al foglio (in base alle tue intestazioni: Data, Email)
        const values = [[formattedDate, email]];

        // Prepara il range A1-notation, quotando il nome del foglio se contiene spazi
        const sheetTab = GOOGLE_SHEET_NAME;
        const a1Range = (sheetTab.includes(' ') ? `'${sheetTab}'` : sheetTab) + '!A:B';

        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: a1Range, // Usa la variabile a1Range qui
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values,
            },
        });

        console.log(`Email '${email}' aggiunta al Google Sheet.`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Iscrizione newsletter riuscita!' }),
        };

    } catch (error) {
        console.error('Errore nella Netlify Function per la newsletter:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Errore interno del server.', error: error.message }),
        };
    }
};