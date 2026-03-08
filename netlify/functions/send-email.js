// Fonction Netlify : envoi d'email via EmailJS REST API (clé côté serveur)
// Rate limiting : 3 envois max par IP par fenêtre de 10 minutes
const rateLimit = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_MAX = 3;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW_MS) {
    rateLimit.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  rateLimit.set(ip, { count: entry.count + 1, start: entry.start });
  return false;
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://creationeditionbroderie.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  // Rate limiting par IP
  const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Trop de messages envoyés. Réessayez dans 10 minutes.' }) };
  }

  const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error('Variables EmailJS manquantes');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuration serveur manquante' }) };
  }

  try {
    const raw = JSON.parse(event.body);
    const strip = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

    const firstname = strip(raw.firstname, 100);
    const lastname  = strip(raw.lastname, 100);
    const email     = strip(raw.email, 200).toLowerCase();
    const phone     = strip(raw.phone, 20);
    const service   = strip(raw.service, 100);
    const message   = strip(raw.message, 2000);

    if (!firstname || !lastname || !email || !message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Champs requis manquants' }) };
    }
    if (!emailRegex.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email invalide' }) };
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
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Erreur lors de l'envoi de l'email" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Erreur send-email:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erreur serveur' }) };
  }
};
