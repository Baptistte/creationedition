import { Resend } from 'resend';

const rateLimit = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
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

  const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Trop de messages envoyés. Réessayez dans 10 minutes.' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY manquante');
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

    const resend = new Resend(RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: 'Contact Site <contact@creationeditionbroderie.com>',
      to: ['emiliecreationbroderie@gmail.com', 'baptistegrincourt@gmail.com'],
      reply_to: email,
      subject: `Nouveau message de ${firstname} ${lastname} — ${service || 'Contact'}`,
      html: `
        <h2>Nouveau message depuis le formulaire de contact</h2>
        <p><strong>Prénom :</strong> ${firstname}</p>
        <p><strong>Nom :</strong> ${lastname}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Service :</strong> ${service || 'Non renseigné'}</p>
        <hr />
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Erreur lors de l'envoi de l'email" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Erreur send-email:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erreur serveur' }) };
  }
};
