// Fonction Netlify : envoi d'email via EmailJS REST API (clé côté serveur)
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://creationeditionbroderie.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  }

  const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error('Variables EmailJS manquantes');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Configuration serveur manquante' }),
    };
  }

  try {
    const { firstname, lastname, email, phone, service, message } = JSON.parse(event.body);

    if (!firstname || !lastname || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Champs requis manquants' }),
      };
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: { firstname, lastname, email, phone, service, message },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('EmailJS error:', text);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Erreur lors de l\'envoi de l\'email' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Erreur send-email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur' }),
    };
  }
};
